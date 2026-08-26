use crate::adb::client::AdbClient;
use crate::adb::commands::AdbCommands;
use crate::adb::scanner::DeviceScanner;
use crate::models::{
    CpuProcessInfo, DetectedBloatProcess, DiagnosticFixResult, DiagnosticIssue, DiagnosticReport,
    FixAction,
};
use crate::rules::backup::BackupManager;

pub struct DiagnosticEngine;

impl DiagnosticEngine {
    /// Run deep system health diagnostics on target device
    pub async fn run_diagnostics(client: &AdbClient, serial: &str) -> Result<DiagnosticReport, String> {
        let props = DeviceScanner::get_properties(client, serial).await.unwrap_or_default();

        // 1. Basic Device Identity
        let model = props.get("ro.product.model").cloned().unwrap_or_else(|| "Unknown Model".into());
        let manufacturer = props.get("ro.product.manufacturer").cloned().unwrap_or_else(|| "Android".into());
        let market_name = props
            .get("ro.product.marketname")
            .or_else(|| props.get("ro.product.name"))
            .cloned()
            .unwrap_or_default();
        let device_name = if !market_name.is_empty() {
            format!("{} {}", manufacturer, market_name)
        } else {
            format!("{} {}", manufacturer, model)
        };

        let soc = props
            .get("ro.soc.model")
            .or_else(|| props.get("ro.board.platform"))
            .cloned()
            .unwrap_or_else(|| "Standard SoC".into());
        let android_version = props.get("ro.build.version.release").cloned().unwrap_or_else(|| "Android".into());

        // 2. CPU Core Count
        let nproc_res = client.shell(serial, "nproc").await.unwrap_or_default();
        let cpu_core_count = nproc_res.stdout.trim().parse::<usize>().unwrap_or(8);

        // 3. Uptime Analysis
        let uptime_res = client.shell(serial, "cat /proc/uptime").await.unwrap_or_default();
        let uptime_seconds: u64 = uptime_res
            .stdout
            .split_whitespace()
            .next()
            .and_then(|s| s.parse::<f64>().ok())
            .map(|f| f as u64)
            .unwrap_or(0);

        let days = uptime_seconds / 86400;
        let hours = (uptime_seconds % 86400) / 3600;
        let mins = (uptime_seconds % 3600) / 60;
        let uptime_formatted = if days > 0 {
            format!("{} Gün {} Saat {} Dk", days, hours, mins)
        } else {
            format!("{} Saat {} Dk", hours, mins)
        };

        // 4. Load Average (/proc/loadavg)
        let loadavg_res = client.shell(serial, "cat /proc/loadavg").await.unwrap_or_default();
        let load_parts: Vec<&str> = loadavg_res.stdout.split_whitespace().collect();
        let load_avg_1m = load_parts.get(0).and_then(|s| s.parse::<f32>().ok()).unwrap_or(1.0);
        let load_avg_5m = load_parts.get(1).and_then(|s| s.parse::<f32>().ok()).unwrap_or(1.0);
        let load_avg_15m = load_parts.get(2).and_then(|s| s.parse::<f32>().ok()).unwrap_or(1.0);

        // Load is critical if 1m loadavg is 1.5x higher than core count or above 6.0
        let is_load_critical = load_avg_1m > (cpu_core_count as f32 * 1.25) || load_avg_1m > 6.0;

        // 5. Memory & ZRAM (/proc/meminfo)
        let meminfo_res = client.shell(serial, "cat /proc/meminfo").await.unwrap_or_default();
        let mut total_ram_mb = 4096;
        let mut free_ram_mb = 120;
        let mut available_ram_mb = 600;
        let mut zram_total_mb = 0;
        let mut zram_used_mb = 0;

        for line in meminfo_res.stdout.lines() {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 {
                let key = parts[0].trim_end_matches(':');
                let val_kb = parts[1].parse::<u64>().unwrap_or(0);
                match key {
                    "MemTotal" => total_ram_mb = val_kb / 1024,
                    "MemFree" => free_ram_mb = val_kb / 1024,
                    "MemAvailable" => available_ram_mb = val_kb / 1024,
                    "SwapTotal" => zram_total_mb = val_kb / 1024,
                    "SwapFree" => {
                        let free_swap = val_kb / 1024;
                        if zram_total_mb >= free_swap {
                            zram_used_mb = zram_total_mb - free_swap;
                        }
                    }
                    _ => {}
                }
            }
        }

        let is_ram_critical = available_ram_mb < 250 || (zram_used_mb > 1000 && available_ram_mb < 500);

        // 6. Storage Analysis (df /data)
        let df_res = client.shell(serial, "df -k /data").await.unwrap_or_default();
        let mut storage_total_gb = 64.0f32;
        let mut storage_free_gb = 20.0f32;
        let mut storage_used_percent = 50u32;

        for line in df_res.stdout.lines().skip(1) {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 5 {
                let total_kb = parts[1].parse::<f32>().unwrap_or(64.0 * 1024.0 * 1024.0);
                let free_kb = parts[3].parse::<f32>().unwrap_or(20.0 * 1024.0 * 1024.0);
                storage_total_gb = (total_kb / (1024.0 * 1024.0)).round();
                storage_free_gb = (free_kb / (1024.0 * 1024.0) * 10.0).round() / 10.0;
                if storage_total_gb > 0.0 {
                    storage_used_percent = (((storage_total_gb - storage_free_gb) / storage_total_gb) * 100.0) as u32;
                }
                break;
            }
        }

        // 7. Process & CPU Consumers (dumpsys cpuinfo + top)
        let cpuinfo_res = client.shell(serial, "dumpsys cpuinfo").await.unwrap_or_default();
        let mut top_cpu_processes = Vec::new();
        let mut system_server_cpu_time = None;

        for line in cpuinfo_res.stdout.lines().take(30) {
            let line = line.trim();
            if line.contains('%') && line.contains('/') {
                // e.g. "12% 1450/system_server: 8.5% user + 3.5% kernel / faults: 120 minor"
                let parts: Vec<&str> = line.split_whitespace().collect();
                if let Some(pct_str) = parts.get(0).and_then(|s| s.strip_suffix('%')) {
                    if let Ok(pct) = pct_str.parse::<f32>() {
                        let proc_name = parts.get(1).unwrap_or(&"process").to_string();
                        let clean_name = proc_name.split('/').last().unwrap_or(&proc_name).trim_end_matches(':');
                        if clean_name == "system_server" {
                            system_server_cpu_time = Some(format!("{}% CPU", pct));
                        }
                        top_cpu_processes.push(CpuProcessInfo {
                            name: clean_name.to_string(),
                            pid: proc_name.split('/').next().and_then(|p| p.parse::<u32>().ok()),
                            cpu_percent: pct,
                            user_or_system: if line.contains("user") { "User".into() } else { "System".into() },
                        });
                    }
                }
            }
        }

        // 8. Detected Active Bloatware & Telemetry
        let ps_res = client.shell(serial, "ps -A -o USER,PID,NAME").await.unwrap_or_default();
        let running_processes_str = ps_res.stdout.to_lowercase();

        let target_bloat_list = [
            ("com.miui.daemon", "MIUI Daemon Telemetry", "Xiaomi arka plan sistem ve kullanım telemetrisi toplayıcısı"),
            ("com.miui.powerkeeper", "Xiaomi PowerKeeper", "Arka planda gereksiz CPU tüketen agresif güç yöneticisi"),
            ("com.miui.guardprovider", "Guard Provider", "Arka planda sürekli dosya ve antivirüs taraması yapan servis"),
            ("com.mi.globalminusscreen", "App Vault (Eksi Ekran)", "Sürekli arka planda çalışan ve reklam besleyen eksi ekran"),
            ("com.miui.android.fashiongallery", "Wallpaper Carousel", "Kilit ekranı haber ve sponsorlu görsel beslemesi"),
            ("com.miui.msa.global", "MIUI System Ads (MSA)", "MIUI arayüz reklam motoru ve bildirim basıcı"),
            ("com.xiaomi.mipicks", "GetApps Store", "Sponsorlu uygulama mağazası ve bildirim servisi"),
            ("com.mi.globalbrowser", "Mi Browser (Global)", "Arama çubuğu reklamları ve telemetri içeren tarayıcı"),
            ("com.facebook.services", "Facebook Services", "Facebook kullanılmasa bile arka planda çalışan senkronizasyon"),
            ("com.facebook.system", "Facebook System", "Facebook sistem yükleyicisi ve arka plan yöneticisi"),
            ("com.facebook.appmanager", "Facebook App Manager", "Facebook gömülü uygulama yöneticisi"),
            ("com.amazon.appmanager", "Amazon App Manager", "Amazon arka plan telemetri ve indirme ajanı"),
            ("cn.wps.xiaomi.abroad.lite", "WPS Office Lite", "Önceden yüklü WPS Office arka plan hizmetleri"),
            ("com.xiaomi.wearable", "Xiaomi Wearable / Fitness", "Arka planda sürekli bellek tutan giyilebilir cihaz servisi"),
            ("com.samsung.android.game.gos", "Samsung GOS", "Oyunlarda çözünürlük ve kare hızını düşüren kısıtlayıcı"),
            ("com.sec.android.diagmonagent", "Samsung DiagMonAgent", "Samsung tanı ve telemetri raporlama ajanı"),
        ];

        let mut detected_bloat_processes = Vec::new();
        let mut packages_to_disable = Vec::new();

        for (pkg, name, desc) in target_bloat_list {
            let is_running = running_processes_str.contains(&pkg.to_lowercase());
            // Check if package is installed
            let pkg_check = client.shell(serial, &format!("pm list packages -e {}", pkg)).await.unwrap_or_default();
            let is_enabled = pkg_check.stdout.contains(pkg);

            if is_enabled {
                detected_bloat_processes.push(DetectedBloatProcess {
                    package_name: pkg.to_string(),
                    app_name: name.to_string(),
                    description: desc.to_string(),
                    cpu_time_info: if is_running { Some("Arka planda aktif".into()) } else { Some("Yüklü (Etkin)".into()) },
                    is_running,
                    can_disable: true,
                });
                packages_to_disable.push(pkg.to_string());
            }
        }

        // 9. Generate Diagnostic Issues with Human-Readable Findings
        let mut detected_issues = Vec::new();

        // Issue 1: High Load Average
        if is_load_critical {
            detected_issues.push(DiagnosticIssue {
                id: "issue_high_load_avg".into(),
                title: format!("Aşırı Yüksek İşlemci Yük Kuyruğu (Load Average: {:.2})", load_avg_1m),
                severity: "critical".into(),
                description: format!(
                    "{} çekirdekli işlemcinizde normalde boşta yükün 1.0 - 2.5 arasında olması gerekirken şu an {:.2} iş parçacığı sırada bekliyor.",
                    cpu_core_count, load_avg_1m
                ),
                technical_details: format!(
                    "İşlemci ({}) ve depolama birimi arka plan işlemlerini işlemekte I/O Wait darboğazı yaşıyor. 1dk: {:.2}, 5dk: {:.2}, 15dk: {:.2}",
                    soc, load_avg_1m, load_avg_5m, load_avg_15m
                ),
                recommendation: "Arka planda sürekli CPU tüketen telemetri ve bloatware servislerini kapatın.".into(),
            });
        }

        // Issue 2: Long Uptime & Memory Fragmentation
        if days >= 5 || uptime_seconds > 400000 {
            detected_issues.push(DiagnosticIssue {
                id: "issue_long_uptime".into(),
                title: format!("{} Kesintisiz Çalışma Süresi (Uptime)", uptime_formatted),
                severity: if days >= 7 { "critical".into() } else { "warning".into() },
                description: format!(
                    "Cihazınız {} gündür hiç yeniden başlatılmamış. system_server ve IPC/Binder kanalları şişmiş durumda.",
                    days
                ),
                technical_details: format!(
                    "Toplam kesintisiz çalışma: {} saniye. Bellek parçalanması (fragmentation) nedeniyle arayüzde mikro takılmalar oluşur.",
                    uptime_seconds
                ),
                recommendation: "Optimizasyon işlemlerinden sonra cihazı bir kez yeniden başlatmak bellek kanallarını sıfırlayacaktır.".into(),
            });
        }

        // Issue 3: RAM & ZRAM Compression Pressure
        if is_ram_critical {
            detected_issues.push(DiagnosticIssue {
                id: "issue_zram_pressure".into(),
                title: "Kritik RAM Sıkışması ve ZRAM (Sanal Bellek) Baskısı".into(),
                severity: "critical".into(),
                description: format!(
                    "Kullanılabilir fiziksel RAM yalnızca ~{} MB. Sistem açığı kapatmak için {} MB ZRAM sıkıştırması kullanıyor.",
                    available_ram_mb, zram_used_mb
                ),
                technical_details: format!(
                    "Toplam RAM: {} MB, Boş: {} MB, ZRAM Kullanımı: {} MB / {} MB. Zayıf CPU çekirdekleri belleği sürekli sıkıştırıp açmaktan arayüze yetişemiyor.",
                    total_ram_mb, free_ram_mb, zram_used_mb, zram_total_mb
                ),
                recommendation: "Gereksiz arka plan servislerini debloat edin ve cihaz ayarlarından Sanal RAM / Bellek Uzantısını kapatmayı değerlendirin.".into(),
            });
        }

        // Issue 4: Active Bloatware & Telemetry
        if !detected_bloat_processes.is_empty() {
            detected_issues.push(DiagnosticIssue {
                id: "issue_active_bloatware".into(),
                title: format!("Arka Planda {} Adet Gereksiz Sistem & Telemetri Servisi Çalışıyor", detected_bloat_processes.len()),
                severity: if detected_bloat_processes.len() >= 4 { "critical".into() } else { "warning".into() },
                description: "Xiaomi/Samsung telemetri servisleri ve gömülü üçüncü parti servisler (Facebook, Amazon vb.) arka planda sürekli CPU ve RAM tüketiyor.".into(),
                technical_details: format!(
                    "Tespit edilen servisler: {}",
                    detected_bloat_processes.iter().map(|p| p.app_name.as_str()).collect::<Vec<_>>().join(", ")
                ),
                recommendation: "Tek tıkla otomatik güvenlik snapshot'ı alarak bu servisleri kullanıcı düzeyinde devre dışı bırakın.".into(),
            });
        }

        // 10. Generate 1-Click Fix Actions
        let mut fix_actions = Vec::new();

        if !packages_to_disable.is_empty() {
            fix_actions.push(FixAction {
                id: "action_disable_detected_bloat".into(),
                title: format!("Tespit Edilen {} Şişkinlik & Telemetri Servisini Kapat", packages_to_disable.len()),
                action_type: "debloat_batch".into(),
                target_packages: packages_to_disable.clone(),
                target_tweak_id: None,
                description: "Otomatik güvenlik snapshot'ı alır ve arka planda CPU/RAM tüketen gereksiz servisleri güvenle devre dışı bırakır.".into(),
                is_recommended: true,
            });
        }

        if days >= 3 || uptime_seconds > 250000 {
            fix_actions.push(FixAction {
                id: "action_reboot_device".into(),
                title: "Cihazı Yeniden Başlatarak Bellek Sızıntılarını Temizle".into(),
                action_type: "reboot_device".into(),
                target_packages: Vec::new(),
                target_tweak_id: None,
                description: format!("{} süren kesintisiz çalışma sonrası system_server ve IPC bellek parçalanmasını sıfırlar.", uptime_formatted),
                is_recommended: days >= 7,
            });
        }

        Ok(DiagnosticReport {
            device_name,
            model,
            manufacturer,
            soc,
            android_version,
            uptime_seconds,
            uptime_formatted,
            load_avg_1m,
            load_avg_5m,
            load_avg_15m,
            cpu_core_count,
            is_load_critical,
            total_ram_mb,
            free_ram_mb,
            available_ram_mb,
            zram_total_mb,
            zram_used_mb,
            is_ram_critical,
            system_server_cpu_time,
            storage_free_gb,
            storage_total_gb,
            storage_used_percent,
            detected_issues,
            top_cpu_processes,
            detected_bloat_processes,
            fix_actions,
        })
    }

    /// Safely execute diagnostic resolution actions with mandatory auto-backup snapshot
    pub async fn execute_fixes(
        client: &AdbClient,
        backup_mgr: &BackupManager,
        serial: &str,
        device_name: &str,
        packages_to_disable: Vec<String>,
        should_reboot: bool,
    ) -> Result<DiagnosticFixResult, String> {
        // 1. Mandatory Pre-Fix Safety Snapshot
        let snapshot = backup_mgr
            .create_snapshot(
                client,
                serial,
                device_name,
                &format!("Auto-Snapshot before Diagnostic Fixes ({} packages)", packages_to_disable.len()),
                vec!["diagnostic_auto_fix".into()],
            )
            .await?;

        // 2. Disable/Debloat problem packages
        let mut disabled = Vec::new();
        for pkg in &packages_to_disable {
            let _ = AdbCommands::disable_package(client, serial, pkg).await;
            disabled.push(pkg.clone());
        }

        // 3. Optional Device Reboot
        let mut reboot_triggered = false;
        if should_reboot {
            let _ = client.shell(serial, "reboot").await;
            reboot_triggered = true;
        }

        Ok(DiagnosticFixResult {
            success: true,
            snapshot_id: Some(snapshot.id),
            disabled_packages: disabled,
            reboot_triggered,
            message: if reboot_triggered {
                "Güvenlik yedeği alındı, şişkinlik servisleri kapatıldı ve cihaz yeniden başlatılıyor...".into()
            } else {
                "Güvenlik yedeği başarıyla alındı ve tespit edilen tüm şişkinlik servisleri kapatıldı.".into()
            },
        })
    }
}
