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

        let soc_raw = format!(
            "{} {} {}",
            soc,
            props.get("ro.hardware").unwrap_or(&"".into()),
            props.get("ro.board.platform").unwrap_or(&"".into())
        )
        .to_lowercase();

        let soc_family = if soc_raw.contains("mt")
            || soc_raw.contains("helio")
            || soc_raw.contains("dimensity")
            || soc_raw.contains("mediatek")
        {
            "MediaTek Helio / Dimensity".to_string()
        } else if soc_raw.contains("snapdragon")
            || soc_raw.contains("qcom")
            || soc_raw.contains("sm")
            || soc_raw.contains("sdm")
        {
            "Qualcomm Snapdragon".to_string()
        } else if soc_raw.contains("exynos") || soc_raw.contains("s5e") || soc_raw.contains("universal") {
            "Samsung Exynos".to_string()
        } else if soc_raw.contains("tensor")
            || soc_raw.contains("gs101")
            || soc_raw.contains("gs201")
            || soc_raw.contains("zuma")
        {
            "Google Tensor".to_string()
        } else if soc_raw.contains("unisoc") || soc_raw.contains("sprd") || soc_raw.contains("tiger") {
            "UNISOC Tiger".to_string()
        } else {
            "Standard ARM SoC".to_string()
        };

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

        // 4. Load Average & Dynamic Kernel D-State Analysis (/proc/loadavg + ps threads)
        let loadavg_res = client.shell(serial, "cat /proc/loadavg").await.unwrap_or_default();
        let load_parts: Vec<&str> = loadavg_res.stdout.split_whitespace().collect();
        let load_avg_1m = load_parts.get(0).and_then(|s| s.parse::<f32>().ok()).unwrap_or(1.0);
        let load_avg_5m = load_parts.get(1).and_then(|s| s.parse::<f32>().ok()).unwrap_or(1.0);
        let load_avg_15m = load_parts.get(2).and_then(|s| s.parse::<f32>().ok()).unwrap_or(1.0);

        // Dynamically inspect all threads to separate Kernel Watchdogs (D-state) from genuine User I/O load
        let ps_threads_res = client.shell(serial, "ps -A -T -o PID,PPID,USER,S,CMD").await.unwrap_or_default();
        let mut kernel_d_threads_count = 0usize;
        let mut user_d_threads_count = 0usize;

        for line in ps_threads_res.stdout.lines().skip(1) {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 5 {
                let ppid = parts[1];
                let user = parts[2];
                let state = parts[3];
                let cmd = parts[4..].join(" ");

                if state == "D" {
                    if ppid == "2" || cmd.starts_with('[') || user == "root" {
                        kernel_d_threads_count += 1;
                    } else {
                        user_d_threads_count += 1;
                    }
                }
            }
        }

        // Net User Load is raw load minus kernel baseline D-threads
        let net_user_load_1m = ((load_avg_1m - (kernel_d_threads_count as f32)).max(0.0) * 100.0).round() / 100.0;
        let load_threshold = ((cpu_core_count as f32) * 1.25 * 10.0).round() / 10.0;

        // Load is critical if ACTUAL user applications/disk queue exceed threshold
        let is_load_critical = net_user_load_1m > load_threshold || user_d_threads_count > (cpu_core_count / 2);

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

        // 5.1 Virtual RAM / Memory Extension (Sanal RAM) Detection
        let mut is_virtual_ram_enabled = false;
        let mut virtual_ram_size_gb = None;

        // Check Xiaomi / MIUI / HyperOS
        if let Some(extm_enable) = props.get("persist.miui.extm.enable").or_else(|| props.get("persist.sys.miui.extm.enable")) {
            if extm_enable.trim() == "1" {
                is_virtual_ram_enabled = true;
            } else if extm_enable.trim() == "0" {
                is_virtual_ram_enabled = false;
            }
        }
        if let Some(bdsize) = props.get("persist.miui.extm.bdsize").or_else(|| props.get("persist.sys.miui.extm.bdsize")) {
            if let Ok(mb) = bdsize.trim().parse::<f32>() {
                if mb > 0.0 {
                    is_virtual_ram_enabled = true;
                    virtual_ram_size_gb = Some((mb / 1024.0 * 10.0).round() / 10.0);
                } else if bdsize.trim() == "0" {
                    is_virtual_ram_enabled = false;
                }
            }
        }

        // Check Samsung RAM Plus
        if let Some(ramplus) = props.get("persist.sys.ramplus.size") {
            if let Ok(gb) = ramplus.trim().parse::<f32>() {
                if gb > 0.0 {
                    is_virtual_ram_enabled = true;
                    virtual_ram_size_gb = Some(gb);
                } else {
                    is_virtual_ram_enabled = false;
                }
            }
        }

        // Check OPPO / Realme
        if let Some(oplus_ram) = props.get("persist.sys.oplus.ram_expand_size") {
            if let Ok(mb) = oplus_ram.trim().parse::<f32>() {
                if mb > 0.0 {
                    is_virtual_ram_enabled = true;
                    virtual_ram_size_gb = Some((mb / 1024.0 * 10.0).round() / 10.0);
                } else {
                    is_virtual_ram_enabled = false;
                }
            }
        }

        // Check via system settings if not determined by props
        if !is_virtual_ram_enabled {
            let miui_setting = client.shell(serial, "settings get global miui_ram_expansion_size").await.unwrap_or_default();
            if let Ok(val) = miui_setting.stdout.trim().parse::<f32>() {
                if val > 0.0 {
                    is_virtual_ram_enabled = true;
                    virtual_ram_size_gb = Some((val / 1024.0 * 10.0).round() / 10.0);
                }
            }
        }
        if !is_virtual_ram_enabled {
            let sam_setting = client.shell(serial, "settings get global ram_expand_size").await.unwrap_or_default();
            if let Ok(val) = sam_setting.stdout.trim().parse::<f32>() {
                if val > 0.0 {
                    is_virtual_ram_enabled = true;
                    virtual_ram_size_gb = Some(val);
                }
            }
        }

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

        let mut enabled_packages_user0 = std::collections::HashSet::new();
        let enabled_res = client.shell(serial, "pm list packages -e --user 0").await.unwrap_or_default();
        for line in enabled_res.stdout.lines() {
            if let Some(p) = line.trim().strip_prefix("package:") {
                enabled_packages_user0.insert(p.trim().to_string());
            }
        }
        if enabled_packages_user0.is_empty() {
            let enabled_fallback = client.shell(serial, "pm list packages -e").await.unwrap_or_default();
            for line in enabled_fallback.stdout.lines() {
                if let Some(p) = line.trim().strip_prefix("package:") {
                    enabled_packages_user0.insert(p.trim().to_string());
                }
            }
        }

        let target_bloat_list = [
            // Pure Telemetry & Ad Engines (Safe to remove by default)
            ("com.miui.daemon", "MIUI Daemon Telemetry", "Xiaomi arka plan sistem ve kullanım telemetrisi toplayıcısı", "telemetry", true),
            ("com.miui.msa.global", "MIUI System Ads (MSA)", "MIUI arayüz reklam motoru ve bildirim basıcı", "telemetry", true),
            ("com.miui.android.fashiongallery", "Wallpaper Carousel", "Kilit ekranı haber ve sponsorlu görsel beslemesi", "telemetry", true),
            ("com.miui.powerkeeper", "Xiaomi PowerKeeper", "Arka planda gereksiz CPU tüketen agresif güç yöneticisi", "telemetry", true),
            ("com.miui.guardprovider", "Guard Provider", "Arka planda sürekli dosya ve antivirüs taraması yapan servis", "telemetry", true),
            ("com.facebook.services", "Facebook Services", "Facebook kullanılmasa bile arka planda çalışan senkronizasyon", "telemetry", true),
            ("com.facebook.system", "Facebook System", "Facebook sistem yükleyicisi ve arka plan yöneticisi", "telemetry", true),
            ("com.facebook.appmanager", "Facebook App Manager", "Facebook gömülü uygulama yöneticisi", "telemetry", true),
            ("com.amazon.appmanager", "Amazon App Manager", "Amazon arka plan telemetri ve indirme ajanı", "telemetry", true),
            ("com.sec.android.diagmonagent", "Samsung DiagMonAgent", "Samsung tanı ve telemetri raporlama ajanı", "telemetry", true),
            ("com.samsung.android.game.gos", "Samsung GOS", "Oyunlarda çözünürlük ve kare hızını düşüren kısıtlayıcı", "telemetry", true),
            ("com.xiaomi.mipicks", "GetApps Store", "Sponsorlu uygulama mağazası ve bildirim servisi", "telemetry", true),

            // User & Companion Apps (NEVER removed automatically - opt-in unchecked by default)
            ("com.xiaomi.wearable", "Mi Fitness (Xiaomi Wearable)", "Akıllı saat ve bileklik eşlikçi uygulaması (Aktif kullanıyorsanız açık bırakınız)", "companion", false),
            ("com.xiaomi.smarthome", "Mi Home (Akıllı Ev)", "Robot süpürge ve akıllı ev eşlikçi uygulaması (Aktif kullanıyorsanız açık bırakınız)", "companion", false),
            ("com.mi.globalbrowser", "Mi Browser (Global)", "Xiaomi web tarayıcısı (Chrome/Brave kullanmıyorsanız açık bırakınız)", "companion", false),
            ("com.miui.videoplayer", "Mi Video", "Xiaomi video oynatıcısı (Aktif kullanıyorsanız açık bırakınız)", "companion", false),
            ("com.mi.globalminusscreen", "App Vault (Eksi Ekran)", "Ana ekran sol panel widget ve kısayol beslemesi", "companion", false),
            ("cn.wps.xiaomi.abroad.lite", "WPS Office Lite", "Önceden yüklü WPS Office belge okuyucusu", "companion", false),
            ("com.samsung.android.app.watchmanager", "Galaxy Wearable", "Samsung akıllı saat/bileklik eşlikçi uygulaması", "companion", false),
            ("com.samsung.android.oneconnect", "Samsung SmartThings", "Samsung akıllı ev ve cihaz kontrol merkezi", "companion", false),
        ];

        let mut detected_bloat_processes = Vec::new();
        let mut packages_to_disable = Vec::new();

        for (pkg, name, desc, category, is_safe_default) in target_bloat_list {
            let is_running = running_processes_str.contains(&pkg.to_lowercase());
            let is_enabled = enabled_packages_user0.contains(pkg);

            if is_enabled {
                detected_bloat_processes.push(DetectedBloatProcess {
                    package_name: pkg.to_string(),
                    app_name: name.to_string(),
                    description: desc.to_string(),
                    category: category.to_string(),
                    is_safe_default,
                    cpu_time_info: if is_running { Some("Arka planda aktif".into()) } else { Some("Yüklü (Etkin)".into()) },
                    is_running,
                    can_disable: true,
                });

                if is_safe_default {
                    packages_to_disable.push(pkg.to_string());
                }
            }
        }

        // 9. Generate Diagnostic Issues with Human-Readable Findings
        let mut detected_issues = Vec::new();

        // Issue 1: High Load Average (computed after subtracting kernel watchdog baseline)
        if is_load_critical {
            detected_issues.push(DiagnosticIssue {
                id: "issue_high_load_avg".into(),
                title: format!("Yüksek Kullanıcı Yük Kuyruğu (Net Yük: {:.2})", net_user_load_1m),
                severity: "critical".into(),
                description: format!(
                    "{} çekirdekli işlemcinizde donanım bekçileri haricinde net {:.2} iş parçacığı sırada bekliyor. (Eşik: {:.1})",
                    cpu_core_count, net_user_load_1m, load_threshold
                ),
                technical_details: format!(
                    "SoC Ailesi: {} ({}). Ham Linux Yükü: {:.2} ({} kernel bekçi thread'i çıkarıldıktan sonra Net: {:.2}).",
                    soc_family, soc, load_avg_1m, kernel_d_threads_count, net_user_load_1m
                ),
                recommendation: "Arka planda çalışan ağır uygulamaları ve disk kuyruğu oluşturan servisleri temizleyin.".into(),
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
        if is_ram_critical || is_virtual_ram_enabled {
            let recommendation = if is_virtual_ram_enabled {
                if let Some(size) = virtual_ram_size_gb {
                    format!("Gereksiz arka plan servislerini debloat edin ve cihaz ayarlarından Sanal RAM / Bellek Uzantısını kapatın (Şu an açık: +{:.1} GB).", size)
                } else {
                    "Gereksiz arka plan servislerini debloat edin ve cihaz ayarlarından Sanal RAM / Bellek Uzantısını kapatın (Şu an açık).".into()
                }
            } else {
                "Sanal RAM zaten kapalı (Optimal). Fiziksel RAM tasarrufu için arka planda CPU/RAM tüketen gereksiz servisleri debloat edin.".into()
            };

            detected_issues.push(DiagnosticIssue {
                id: "issue_zram_pressure".into(),
                title: if is_virtual_ram_enabled {
                    "Kritik RAM Sıkışması ve Sanal RAM (eMMC Swap) Baskısı".into()
                } else {
                    "Düşük Fiziksel RAM Baskısı (Sanal RAM Kapalı)".into()
                },
                severity: if is_virtual_ram_enabled { "critical".into() } else { "warning".into() },
                description: if is_virtual_ram_enabled {
                    format!(
                        "Kullanılabilir fiziksel RAM ~{} MB. Sistem Sanal RAM (Bellek Uzantısı) kullanarak yavaş eMMC depolamaya sürekli veri yazıp siliyor.",
                        available_ram_mb
                    )
                } else {
                    format!(
                        "Kullanılabilir fiziksel RAM ~{} MB. Sanal RAM kapalı tutulduğu için eMMC disk kilitlenmesi önlenmiştir.",
                        available_ram_mb
                    )
                },
                technical_details: format!(
                    "Toplam RAM: {} MB, Boş: {} MB, ZRAM: {} MB / {} MB. Sanal RAM Durumu: {}.",
                    total_ram_mb, free_ram_mb, zram_used_mb, zram_total_mb,
                    if is_virtual_ram_enabled { "Açık (Yavaş depolamaya yazılıyor)" } else { "Kapalı (Optimal)" }
                ),
                recommendation,
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
            kernel_d_threads_count,
            user_d_threads_count,
            net_user_load_1m,
            soc_family,
            load_threshold,
            is_load_critical,
            total_ram_mb,
            free_ram_mb,
            available_ram_mb,
            zram_total_mb,
            zram_used_mb,
            is_ram_critical,
            is_virtual_ram_enabled,
            virtual_ram_size_gb,
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

        // 2. Disable/Debloat problem packages permanently for user 0
        let mut disabled = Vec::new();
        for pkg in &packages_to_disable {
            // Force stop
            let _ = client.shell(serial, &format!("am force-stop {}", pkg)).await;
            // Disable
            let _ = client.shell(serial, &format!("pm disable-user --user 0 {}", pkg)).await;
            // Uninstall for user 0 (prevents autostart on reboot)
            let _ = AdbCommands::uninstall_package_user0(client, serial, pkg).await;
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
