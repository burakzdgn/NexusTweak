pub mod models;
pub mod adb;
pub mod rules;

use std::sync::Mutex;
use tauri::State;

use crate::adb::{AdbClient, AdbCommands, DeviceScanner};
use crate::models::{
    AdbDevice, AdbExecutionResult, BackupSnapshot, DeviceInfo, HealthScore, PackageInfo, TweakRule
};
use crate::rules::{BackupManager, RuleEngine};

pub struct AppState {
    pub adb_client: Mutex<AdbClient>,
    pub rule_engine: Mutex<RuleEngine>,
    pub backup_manager: Mutex<BackupManager>,
    pub mock_mode: Mutex<bool>,
}

#[tauri::command]
async fn get_connected_devices(state: State<'_, AppState>) -> Result<Vec<AdbDevice>, String> {
    let is_mock = *state.mock_mode.lock().unwrap();
    if is_mock {
        return Ok(get_mock_device_list());
    }

    let client = state.adb_client.lock().unwrap().clone();
    match DeviceScanner::list_devices(&client).await {
        Ok(devices) => {
            if devices.is_empty() {
                // Return mock devices so user can still test seamlessly if no physical device is connected
                Ok(get_mock_device_list())
            } else {
                Ok(devices)
            }
        }
        Err(_) => Ok(get_mock_device_list()),
    }
}

#[tauri::command]
async fn get_device_details(serial: String, state: State<'_, AppState>) -> Result<DeviceInfo, String> {
    if serial.starts_with("MOCK_") {
        return Ok(get_mock_device_info(&serial));
    }

    let client = state.adb_client.lock().unwrap().clone();
    DeviceScanner::scan_device_details(&client, &serial).await
}

#[tauri::command]
async fn get_installed_packages(serial: String, state: State<'_, AppState>) -> Result<Vec<PackageInfo>, String> {
    if serial.starts_with("MOCK_") {
        return Ok(get_mock_packages(&serial));
    }

    let client = state.adb_client.lock().unwrap().clone();
    let rule_engine = state.rule_engine.lock().unwrap();

    let mut packages = AdbCommands::list_packages(&client, &serial).await?;
    rule_engine.classify_packages(&mut packages);
    Ok(packages)
}

#[tauri::command]
async fn get_applicable_rules(serial: String, state: State<'_, AppState>) -> Result<Vec<TweakRule>, String> {
    let device = if serial.starts_with("MOCK_") {
        get_mock_device_info(&serial)
    } else {
        let client = state.adb_client.lock().unwrap().clone();
        DeviceScanner::scan_device_details(&client, &serial).await?
    };

    let rule_engine = state.rule_engine.lock().unwrap();
    Ok(rule_engine.get_applicable_rules(&device))
}

#[tauri::command]
async fn apply_tweak(
    serial: String,
    rule_id: String,
    auto_backup: bool,
    state: State<'_, AppState>,
) -> Result<Vec<AdbExecutionResult>, String> {
    if auto_backup && !serial.starts_with("MOCK_") {
        let client = state.adb_client.lock().unwrap().clone();
        let backup_mgr = state.backup_manager.lock().unwrap();
        let _ = backup_mgr.create_snapshot(&client, &serial, &format!("Before tweak: {}", rule_id), vec![rule_id.clone()]).await;
    }

    if serial.starts_with("MOCK_") {
        return Ok(vec![AdbExecutionResult {
            success: true,
            command: format!("mock apply tweak {}", rule_id),
            stdout: "Success [Simulation]".into(),
            stderr: "".into(),
            exit_code: 0,
            execution_time_ms: 45,
        }]);
    }

    let client = state.adb_client.lock().unwrap().clone();
    let rule_engine = state.rule_engine.lock().unwrap();
    let device = DeviceScanner::scan_device_details(&client, &serial).await?;
    let rules = rule_engine.get_applicable_rules(&device);

    let rule = rules.iter().find(|r| r.id == rule_id)
        .ok_or_else(|| format!("Rule {} not found for this device", rule_id))?;

    let mut results = Vec::new();
    for cmd in &rule.apply_commands {
        let res = client.shell(&serial, cmd).await?;
        results.push(res);
    }

    Ok(results)
}

#[tauri::command]
async fn revert_tweak(
    serial: String,
    rule_id: String,
    state: State<'_, AppState>,
) -> Result<Vec<AdbExecutionResult>, String> {
    if serial.starts_with("MOCK_") {
        return Ok(vec![AdbExecutionResult {
            success: true,
            command: format!("mock revert tweak {}", rule_id),
            stdout: "Reverted successfully [Simulation]".into(),
            stderr: "".into(),
            exit_code: 0,
            execution_time_ms: 32,
        }]);
    }

    let client = state.adb_client.lock().unwrap().clone();
    let rule_engine = state.rule_engine.lock().unwrap();
    let device = DeviceScanner::scan_device_details(&client, &serial).await?;
    let rules = rule_engine.get_applicable_rules(&device);

    let rule = rules.iter().find(|r| r.id == rule_id)
        .ok_or_else(|| format!("Rule {} not found", rule_id))?;

    let mut results = Vec::new();
    for cmd in &rule.revert_commands {
        let res = client.shell(&serial, cmd).await?;
        results.push(res);
    }

    Ok(results)
}

#[tauri::command]
async fn apply_batch_tweaks(
    serial: String,
    rule_ids: Vec<String>,
    auto_backup: bool,
    state: State<'_, AppState>,
) -> Result<Vec<AdbExecutionResult>, String> {
    if auto_backup && !serial.starts_with("MOCK_") {
        let client = state.adb_client.lock().unwrap().clone();
        let backup_mgr = state.backup_manager.lock().unwrap();
        let _ = backup_mgr.create_snapshot(&client, &serial, "Before Batch Tweaks", rule_ids.clone()).await;
    }

    let mut all_results = Vec::new();
    for rule_id in rule_ids {
        if let Ok(res) = apply_tweak(serial.clone(), rule_id, false, state.clone()).await {
            all_results.extend(res);
        }
    }

    Ok(all_results)
}

#[tauri::command]
async fn debloat_package(
    serial: String,
    package_name: String,
    force_override: bool,
    state: State<'_, AppState>,
) -> Result<AdbExecutionResult, String> {
    let rule_engine = state.rule_engine.lock().unwrap();
    if rule_engine.is_package_whitelisted(&package_name) && !force_override {
        return Err(format!("SECURITY PREVENT: Package '{}' is a critical OS component in whitelist!", package_name));
    }

    if serial.starts_with("MOCK_") {
        return Ok(AdbExecutionResult {
            success: true,
            command: format!("pm disable-user --user 0 {}", package_name),
            stdout: format!("Package {} disabled successfully [Simulation]", package_name),
            stderr: "".into(),
            exit_code: 0,
            execution_time_ms: 50,
        });
    }

    let client = state.adb_client.lock().unwrap().clone();
    AdbCommands::disable_package(&client, &serial, &package_name).await
}

#[tauri::command]
async fn restore_package(
    serial: String,
    package_name: String,
    state: State<'_, AppState>,
) -> Result<AdbExecutionResult, String> {
    if serial.starts_with("MOCK_") {
        return Ok(AdbExecutionResult {
            success: true,
            command: format!("pm enable {}", package_name),
            stdout: format!("Package {} enabled successfully [Simulation]", package_name),
            stderr: "".into(),
            exit_code: 0,
            execution_time_ms: 40,
        });
    }

    let client = state.adb_client.lock().unwrap().clone();
    let _ = AdbCommands::restore_package_user0(&client, &serial, &package_name).await;
    AdbCommands::enable_package(&client, &serial, &package_name).await
}

#[tauri::command]
async fn create_backup(
    serial: String,
    note: String,
    applied_tweaks: Vec<String>,
    state: State<'_, AppState>,
) -> Result<BackupSnapshot, String> {
    if serial.starts_with("MOCK_") {
        return Ok(BackupSnapshot {
            id: format!("{}_{}", serial, chrono::Utc::now().format("%Y%m%d_%H%M%S")),
            device_serial: serial,
            timestamp: chrono::Utc::now().to_rfc3339(),
            note,
            settings_global: std::collections::HashMap::new(),
            settings_system: std::collections::HashMap::new(),
            settings_secure: std::collections::HashMap::new(),
            disabled_packages: vec!["com.miui.msa.global".into(), "com.samsung.android.bixby.agent".into()],
            uninstalled_packages: vec![],
            applied_tweak_ids: applied_tweaks,
        });
    }

    let client = state.adb_client.lock().unwrap().clone();
    let backup_mgr = state.backup_manager.lock().unwrap();
    backup_mgr.create_snapshot(&client, &serial, &note, applied_tweaks).await
}

#[tauri::command]
async fn list_backups(
    serial: Option<String>,
    state: State<'_, AppState>,
) -> Result<Vec<BackupSnapshot>, String> {
    let backup_mgr = state.backup_manager.lock().unwrap();
    Ok(backup_mgr.list_backups(serial.as_deref()))
}

#[tauri::command]
async fn restore_backup(
    snapshot_id: String,
    state: State<'_, AppState>,
) -> Result<Vec<AdbExecutionResult>, String> {
    if snapshot_id.starts_with("MOCK_") {
        return Ok(vec![AdbExecutionResult {
            success: true,
            command: format!("mock rollback {}", snapshot_id),
            stdout: "Rollback applied successfully [Simulation]".into(),
            stderr: "".into(),
            exit_code: 0,
            execution_time_ms: 120,
        }]);
    }

    let client = state.adb_client.lock().unwrap().clone();
    let backup_mgr = state.backup_manager.lock().unwrap();
    backup_mgr.restore_snapshot(&client, &snapshot_id).await
}

#[tauri::command]
async fn delete_backup(snapshot_id: String, state: State<'_, AppState>) -> Result<(), String> {
    let backup_mgr = state.backup_manager.lock().unwrap();
    backup_mgr.delete_backup(&snapshot_id)
}

#[tauri::command]
async fn calculate_health_score(
    serial: String,
    applied_tweaks: Vec<String>,
    state: State<'_, AppState>,
) -> Result<HealthScore, String> {
    let device = if serial.starts_with("MOCK_") {
        get_mock_device_info(&serial)
    } else {
        let client = state.adb_client.lock().unwrap().clone();
        DeviceScanner::scan_device_details(&client, &serial).await?
    };

    let packages = if serial.starts_with("MOCK_") {
        get_mock_packages(&serial)
    } else {
        let client = state.adb_client.lock().unwrap().clone();
        let rule_engine = state.rule_engine.lock().unwrap();
        let mut pkgs = AdbCommands::list_packages(&client, &serial).await.unwrap_or_default();
        rule_engine.classify_packages(&mut pkgs);
        pkgs
    };

    let rule_engine = state.rule_engine.lock().unwrap();
    Ok(rule_engine.calculate_health_score(&device, &packages, &applied_tweaks))
}

#[tauri::command]
async fn run_custom_command(
    serial: String,
    command: String,
    state: State<'_, AppState>,
) -> Result<AdbExecutionResult, String> {
    if serial.starts_with("MOCK_") {
        return Ok(AdbExecutionResult {
            success: true,
            command: format!("adb -s {} {}", serial, command),
            stdout: format!("Mock command '{}' executed successfully.\nDevice response: OK", command),
            stderr: "".into(),
            exit_code: 0,
            execution_time_ms: 25,
        });
    }

    let client = state.adb_client.lock().unwrap().clone();
    if command.starts_with("shell ") {
        client.shell(&serial, &command[6..]).await
    } else {
        let args: Vec<&str> = command.split_whitespace().collect();
        client.execute(Some(&serial), &args).await
    }
}

#[tauri::command]
async fn reboot_device(serial: String, mode: Option<String>, state: State<'_, AppState>) -> Result<AdbExecutionResult, String> {
    if serial.starts_with("MOCK_") {
        return Ok(AdbExecutionResult {
            success: true,
            command: format!("adb -s {} reboot {:?}", serial, mode),
            stdout: format!("Device rebooted to {:?} [Simulation]", mode.unwrap_or_else(|| "normal".into())),
            stderr: "".into(),
            exit_code: 0,
            execution_time_ms: 30,
        });
    }

    let client = state.adb_client.lock().unwrap().clone();
    AdbCommands::reboot(&client, &serial, mode.as_deref()).await
}

#[tauri::command]
async fn connect_wifi_device(ip_port: String, state: State<'_, AppState>) -> Result<AdbExecutionResult, String> {
    let client = state.adb_client.lock().unwrap().clone();
    client.connect_wifi(&ip_port).await
}

#[tauri::command]
async fn set_custom_adb_path(path: Option<String>, state: State<'_, AppState>) -> Result<String, String> {
    let mut client = state.adb_client.lock().unwrap();
    client.set_custom_path(path);
    Ok(client.get_adb_path())
}

#[tauri::command]
async fn toggle_mock_mode(enabled: bool, state: State<'_, AppState>) -> Result<bool, String> {
    let mut mock = state.mock_mode.lock().unwrap();
    *mock = enabled;
    Ok(*mock)
}

// -------------------------------------------------------------
// Realistic Mock Data for Simulation Mode
// -------------------------------------------------------------

fn get_mock_device_list() -> Vec<AdbDevice> {
    vec![
        AdbDevice {
            serial: "MOCK_SAMSUNG_S24U".into(),
            state: "device".into(),
            model: "Galaxy S24 Ultra (SM-S928B)".into(),
            product: "e3qxxx".into(),
            device: "e3q".into(),
            transport_id: "1".into(),
            is_mock: true,
        },
        AdbDevice {
            serial: "MOCK_XIAOMI_14PRO".into(),
            state: "device".into(),
            model: "Xiaomi 14 Pro (HyperOS)".into(),
            product: "shennong".into(),
            device: "shennong".into(),
            transport_id: "2".into(),
            is_mock: true,
        },
        AdbDevice {
            serial: "MOCK_PIXEL_8PRO".into(),
            state: "device".into(),
            model: "Google Pixel 8 Pro".into(),
            product: "husky".into(),
            device: "husky".into(),
            transport_id: "3".into(),
            is_mock: true,
        },
    ]
}

fn get_mock_device_info(serial: &str) -> DeviceInfo {
    match serial {
        "MOCK_XIAOMI_14PRO" => DeviceInfo {
            serial: "MOCK_XIAOMI_14PRO".into(),
            model: "Xiaomi 14 Pro".into(),
            manufacturer: "Xiaomi".into(),
            brand: "Xiaomi".into(),
            product_name: "shennong".into(),
            device_codename: "shennong".into(),
            android_version: "14 (HyperOS 1.0)".into(),
            sdk_version: 34,
            build_id: "UKQ1.230804.001".into(),
            security_patch: "2024-08-01".into(),
            soc_platform: "Qualcomm Snapdragon 8 Gen 3".into(),
            soc_manufacturer: "Qualcomm".into(),
            cpu_abi: "arm64-v8a".into(),
            total_ram_mb: 16384,
            available_ram_mb: 9840,
            is_rooted: false,
            selinux_enforcing: true,
            battery: crate::models::BatteryInfo {
                level: 88,
                temperature_c: 32.4,
                voltage_mv: 4210,
                health: "Good (Optimal)".into(),
                status: "Discharging".into(),
                plugged: "Battery (Unplugged)".into(),
                technology: "Li-poly".into(),
            },
            display: crate::models::DisplayInfo {
                width: 1440,
                height: 3200,
                density_dpi: 522,
                refresh_rate_hz: 120.0,
                supported_refresh_rates: vec![60.0, 90.0, 120.0],
            },
            is_mock: true,
        },
        "MOCK_PIXEL_8PRO" => DeviceInfo {
            serial: "MOCK_PIXEL_8PRO".into(),
            model: "Pixel 8 Pro".into(),
            manufacturer: "Google".into(),
            brand: "Google".into(),
            product_name: "husky".into(),
            device_codename: "husky".into(),
            android_version: "14 (Android 14 QPR3)".into(),
            sdk_version: 34,
            build_id: "AP2A.240805.005".into(),
            security_patch: "2024-08-05".into(),
            soc_platform: "Google Tensor G3".into(),
            soc_manufacturer: "Google".into(),
            cpu_abi: "arm64-v8a".into(),
            total_ram_mb: 12288,
            available_ram_mb: 7420,
            is_rooted: false,
            selinux_enforcing: true,
            battery: crate::models::BatteryInfo {
                level: 76,
                temperature_c: 30.8,
                voltage_mv: 4090,
                health: "Good (Optimal)".into(),
                status: "Discharging".into(),
                plugged: "Battery (Unplugged)".into(),
                technology: "Li-ion".into(),
            },
            display: crate::models::DisplayInfo {
                width: 1344,
                height: 2992,
                density_dpi: 489,
                refresh_rate_hz: 120.0,
                supported_refresh_rates: vec![60.0, 120.0],
            },
            is_mock: true,
        },
        _ => DeviceInfo {
            serial: "MOCK_SAMSUNG_S24U".into(),
            model: "Galaxy S24 Ultra".into(),
            manufacturer: "Samsung".into(),
            brand: "Samsung".into(),
            product_name: "e3qxxx".into(),
            device_codename: "e3q".into(),
            android_version: "14 (One UI 6.1.1)".into(),
            sdk_version: 34,
            build_id: "UP1A.231005.007.S928BXXU1AXCA".into(),
            security_patch: "2024-08-01".into(),
            soc_platform: "Snapdragon 8 Gen 3 for Galaxy".into(),
            soc_manufacturer: "Qualcomm".into(),
            cpu_abi: "arm64-v8a".into(),
            total_ram_mb: 12288,
            available_ram_mb: 6920,
            is_rooted: false,
            selinux_enforcing: true,
            battery: crate::models::BatteryInfo {
                level: 92,
                temperature_c: 31.2,
                voltage_mv: 4320,
                health: "Good (Optimal)".into(),
                status: "Charging".into(),
                plugged: "USB Port (Fast Charge 2.0)".into(),
                technology: "Li-ion".into(),
            },
            display: crate::models::DisplayInfo {
                width: 1440,
                height: 3120,
                density_dpi: 505,
                refresh_rate_hz: 120.0,
                supported_refresh_rates: vec![60.0, 120.0],
            },
            is_mock: true,
        },
    }
}

fn get_mock_packages(serial: &str) -> Vec<PackageInfo> {
    let mut pkgs = vec![
        PackageInfo {
            package_name: "android".into(),
            apk_path: "/system/framework/framework-res.apk".into(),
            is_system: true,
            is_enabled: true,
            app_name: Some("Android System".into()),
            installer: None,
            is_whitelisted: true,
            bloat_category: None,
            bloat_description: None,
            risk_level: None,
        },
        PackageInfo {
            package_name: "com.android.systemui".into(),
            apk_path: "/system_ext/priv-app/SystemUI/SystemUI.apk".into(),
            is_system: true,
            is_enabled: true,
            app_name: Some("System UI".into()),
            installer: None,
            is_whitelisted: true,
            bloat_category: None,
            bloat_description: None,
            risk_level: None,
        },
        PackageInfo {
            package_name: "com.google.android.gms".into(),
            apk_path: "/system/priv-app/GmsCore/GmsCore.apk".into(),
            is_system: true,
            is_enabled: true,
            app_name: Some("Google Play Services".into()),
            installer: None,
            is_whitelisted: true,
            bloat_category: None,
            bloat_description: None,
            risk_level: None,
        },
        PackageInfo {
            package_name: "com.android.vending".into(),
            apk_path: "/system/priv-app/Phonesky/Phonesky.apk".into(),
            is_system: true,
            is_enabled: true,
            app_name: Some("Google Play Store".into()),
            installer: None,
            is_whitelisted: true,
            bloat_category: None,
            bloat_description: None,
            risk_level: None,
        },
    ];

    if serial == "MOCK_XIAOMI_14PRO" {
        pkgs.extend(vec![
            PackageInfo {
                package_name: "com.miui.msa.global".into(),
                apk_path: "/system/app/MSA-Global/MSA-Global.apk".into(),
                is_system: true,
                is_enabled: true,
                app_name: Some("MIUI System Ads".into()),
                installer: None,
                is_whitelisted: false,
                bloat_category: Some("OEM Telemetry / Bloatware".into()),
                bloat_description: Some("Ad network and sponsored recommendation pusher".into()),
                risk_level: Some("Safe".into()),
            },
            PackageInfo {
                package_name: "com.miui.analytics".into(),
                apk_path: "/system/priv-app/AnalyticsCore/AnalyticsCore.apk".into(),
                is_system: true,
                is_enabled: true,
                app_name: Some("MIUI Analytics".into()),
                installer: None,
                is_whitelisted: false,
                bloat_category: Some("OEM Telemetry / Bloatware".into()),
                bloat_description: Some("Xiaomi user behavior diagnostics".into()),
                risk_level: Some("Safe".into()),
            },
            PackageInfo {
                package_name: "com.xiaomi.joyose".into(),
                apk_path: "/system/priv-app/Joyose/Joyose.apk".into(),
                is_system: true,
                is_enabled: true,
                app_name: Some("Xiaomi Joyose".into()),
                installer: None,
                is_whitelisted: false,
                bloat_category: Some("Performance Throttling".into()),
                bloat_description: Some("Thermal and frame rate throttling daemon".into()),
                risk_level: Some("Moderate".into()),
            },
            PackageInfo {
                package_name: "com.xiaomi.mipicks".into(),
                apk_path: "/system/priv-app/MiPicks/MiPicks.apk".into(),
                is_system: true,
                is_enabled: true,
                app_name: Some("GetApps Store".into()),
                installer: None,
                is_whitelisted: false,
                bloat_category: Some("OEM Telemetry / Bloatware".into()),
                bloat_description: Some("Xiaomi auxiliary app store with promotional notifications".into()),
                risk_level: Some("Safe".into()),
            },
            PackageInfo {
                package_name: "com.miui.videoplayer".into(),
                apk_path: "/system/priv-app/MiVideo/MiVideo.apk".into(),
                is_system: true,
                is_enabled: true,
                app_name: Some("Mi Video".into()),
                installer: None,
                is_whitelisted: false,
                bloat_category: Some("OEM Telemetry / Bloatware".into()),
                bloat_description: Some("Pre-installed media player with online push feeds".into()),
                risk_level: Some("Safe".into()),
            },
        ]);
    } else if serial == "MOCK_SAMSUNG_S24U" {
        pkgs.extend(vec![
            PackageInfo {
                package_name: "com.samsung.android.bixby.agent".into(),
                apk_path: "/system/priv-app/BixbyAgent/BixbyAgent.apk".into(),
                is_system: true,
                is_enabled: true,
                app_name: Some("Bixby Voice Agent".into()),
                installer: None,
                is_whitelisted: false,
                bloat_category: Some("OEM Telemetry / Bloatware".into()),
                bloat_description: Some("Samsung voice assistant background framework".into()),
                risk_level: Some("Safe".into()),
            },
            PackageInfo {
                package_name: "com.samsung.android.game.gos".into(),
                apk_path: "/system/priv-app/GameOptimizingService/GOS.apk".into(),
                is_system: true,
                is_enabled: true,
                app_name: Some("Game Optimizing Service".into()),
                installer: None,
                is_whitelisted: false,
                bloat_category: Some("Performance Throttling".into()),
                bloat_description: Some("Throttles resolution & FPS in games".into()),
                risk_level: Some("Moderate".into()),
            },
            PackageInfo {
                package_name: "com.sec.android.diagmonagent".into(),
                apk_path: "/system/priv-app/DiagMonAgent/DiagMonAgent.apk".into(),
                is_system: true,
                is_enabled: true,
                app_name: Some("Samsung Diagnostic Agent".into()),
                installer: None,
                is_whitelisted: false,
                bloat_category: Some("Diagnostics / Telemetry".into()),
                bloat_description: Some("Crash log and telemetry reporter".into()),
                risk_level: Some("Safe".into()),
            },
            PackageInfo {
                package_name: "com.microsoft.appmanager".into(),
                apk_path: "/system/priv-app/YourPhone/YourPhone.apk".into(),
                is_system: true,
                is_enabled: true,
                app_name: Some("Link to Windows".into()),
                installer: None,
                is_whitelisted: false,
                bloat_category: Some("OEM Telemetry / Bloatware".into()),
                bloat_description: Some("Microsoft Phone Link background bridge".into()),
                risk_level: Some("Safe".into()),
            },
        ]);
    } else {
        pkgs.extend(vec![
            PackageInfo {
                package_name: "com.google.android.apps.tips".into(),
                apk_path: "/system/priv-app/Tips/Tips.apk".into(),
                is_system: true,
                is_enabled: true,
                app_name: Some("Pixel Tips".into()),
                installer: None,
                is_whitelisted: false,
                bloat_category: Some("OEM Telemetry / Bloatware".into()),
                bloat_description: Some("Pixel showcase tutorials and background notifications".into()),
                risk_level: Some("Safe".into()),
            },
            PackageInfo {
                package_name: "com.google.android.feedback".into(),
                apk_path: "/system/priv-app/Feedback/Feedback.apk".into(),
                is_system: true,
                is_enabled: true,
                app_name: Some("Google Feedback".into()),
                installer: None,
                is_whitelisted: false,
                bloat_category: Some("Diagnostics / Telemetry".into()),
                bloat_description: Some("User feedback and crash diagnostics reporter".into()),
                risk_level: Some("Safe".into()),
            },
            PackageInfo {
                package_name: "com.google.android.apps.turbo".into(),
                apk_path: "/system/priv-app/Turbo/Turbo.apk".into(),
                is_system: true,
                is_enabled: true,
                app_name: Some("Device Health Services".into()),
                installer: None,
                is_whitelisted: false,
                bloat_category: Some("OEM Telemetry / Bloatware".into()),
                bloat_description: Some("Adaptive battery diagnostics telemetry".into()),
                risk_level: Some("Moderate".into()),
            },
        ]);
    }

    pkgs
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            adb_client: Mutex::new(AdbClient::new(None)),
            rule_engine: Mutex::new(RuleEngine::new()),
            backup_manager: Mutex::new(BackupManager::new()),
            mock_mode: Mutex::new(true), // Enabled by default for flawless testing
        })
        .invoke_handler(tauri::generate_handler![
            get_connected_devices,
            get_device_details,
            get_installed_packages,
            get_applicable_rules,
            apply_tweak,
            revert_tweak,
            apply_batch_tweaks,
            debloat_package,
            restore_package,
            create_backup,
            list_backups,
            restore_backup,
            delete_backup,
            calculate_health_score,
            run_custom_command,
            reboot_device,
            connect_wifi_device,
            set_custom_adb_path,
            toggle_mock_mode,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
