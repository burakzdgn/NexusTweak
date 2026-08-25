pub mod models;
pub mod adb;
pub mod rules;

use std::fs;
use std::path::PathBuf;
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
}

#[tauri::command]
async fn check_adb_status(state: State<'_, AppState>) -> Result<bool, String> {
    let client = state.adb_client.lock().unwrap().clone();
    Ok(client.check_adb_available().await)
}

#[tauri::command]
async fn download_install_adb(state: State<'_, AppState>) -> Result<String, String> {
    let binaries_dir = PathBuf::from("binaries");
    if !binaries_dir.exists() {
        let _ = fs::create_dir_all(&binaries_dir);
    }

    let is_windows = cfg!(target_os = "windows");
    let is_macos = cfg!(target_os = "macos");

    let url = if is_windows {
        "https://dl.google.com/android/repository/platform-tools-latest-windows.zip"
    } else if is_macos {
        "https://dl.google.com/android/repository/platform-tools-latest-darwin.zip"
    } else {
        "https://dl.google.com/android/repository/platform-tools-latest-linux.zip"
    };

    let zip_path = binaries_dir.join("platform-tools.zip");
    
    #[cfg(target_os = "windows")]
    {
        let download_cmd = format!(
            "Invoke-WebRequest -Uri '{}' -OutFile '{}'; Expand-Archive -Path '{}' -DestinationPath '{}' -Force; Remove-Item -Path '{}' -Force",
            url,
            zip_path.to_string_lossy(),
            zip_path.to_string_lossy(),
            binaries_dir.to_string_lossy(),
            zip_path.to_string_lossy()
        );

        let mut cmd = tokio::process::Command::new("powershell");
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
        cmd.arg("-NoProfile").arg("-Command").arg(&download_cmd);

        let output = cmd.output().await.map_err(|e| format!("Failed to download ADB: {}", e))?;
        if !output.status.success() {
            return Err(format!("Download failed: {}", String::from_utf8_lossy(&output.stderr)));
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        let download_cmd = format!(
            "curl -L '{}' -o '{}' && unzip -o '{}' -d '{}' && rm -f '{}'",
            url,
            zip_path.to_string_lossy(),
            zip_path.to_string_lossy(),
            binaries_dir.to_string_lossy(),
            zip_path.to_string_lossy()
        );

        let mut cmd = tokio::process::Command::new("sh");
        cmd.arg("-c").arg(&download_cmd);

        let output = cmd.output().await.map_err(|e| format!("Failed to download ADB: {}", e))?;
        if !output.status.success() {
            return Err(format!("Download failed: {}", String::from_utf8_lossy(&output.stderr)));
        }
    }

    let bin_name = if is_windows { "adb.exe" } else { "adb" };
    let installed_bin = binaries_dir.join("platform-tools").join(bin_name);

    if installed_bin.exists() {
        let path_str = installed_bin.to_string_lossy().to_string();
        let mut client = state.adb_client.lock().unwrap();
        client.set_custom_path(Some(path_str.clone()));
        Ok(path_str)
    } else {
        Err("Downloaded platform-tools archive could not be verified.".to_string())
    }
}

#[tauri::command]
async fn get_connected_devices(state: State<'_, AppState>) -> Result<Vec<AdbDevice>, String> {
    let client = state.adb_client.lock().unwrap().clone();
    DeviceScanner::list_devices(&client).await
}

#[tauri::command]
async fn get_device_details(serial: String, state: State<'_, AppState>) -> Result<DeviceInfo, String> {
    let client = state.adb_client.lock().unwrap().clone();
    DeviceScanner::scan_device_details(&client, &serial).await
}

#[tauri::command]
async fn get_installed_packages(serial: String, state: State<'_, AppState>) -> Result<Vec<PackageInfo>, String> {
    let client = state.adb_client.lock().unwrap().clone();
    let rule_engine = state.rule_engine.lock().unwrap();

    let mut packages = AdbCommands::list_packages(&client, &serial).await?;
    rule_engine.classify_packages(&mut packages);
    Ok(packages)
}

#[tauri::command]
async fn install_apk(serial: String, apk_path: String, state: State<'_, AppState>) -> Result<AdbExecutionResult, String> {
    let client = state.adb_client.lock().unwrap().clone();
    AdbCommands::install_apk(&client, &serial, &apk_path).await
}

#[tauri::command]
async fn extract_apk(serial: String, package_name: String, dest_folder: Option<String>, state: State<'_, AppState>) -> Result<AdbExecutionResult, String> {
    let client = state.adb_client.lock().unwrap().clone();
    let dest = dest_folder.unwrap_or_else(|| {
        let default_dir = PathBuf::from("extracted_apks");
        let _ = fs::create_dir_all(&default_dir);
        default_dir.to_string_lossy().to_string()
    });
    AdbCommands::extract_apk(&client, &serial, &package_name, &dest).await
}

#[tauri::command]
async fn set_screen_resolution(serial: String, width: u32, height: u32, state: State<'_, AppState>) -> Result<AdbExecutionResult, String> {
    let client = state.adb_client.lock().unwrap().clone();
    AdbCommands::set_screen_resolution(&client, &serial, width, height).await
}

#[tauri::command]
async fn reset_screen_resolution(serial: String, state: State<'_, AppState>) -> Result<AdbExecutionResult, String> {
    let client = state.adb_client.lock().unwrap().clone();
    AdbCommands::reset_screen_resolution(&client, &serial).await
}

#[tauri::command]
async fn set_screen_density(serial: String, density: u32, state: State<'_, AppState>) -> Result<AdbExecutionResult, String> {
    let client = state.adb_client.lock().unwrap().clone();
    AdbCommands::set_screen_density(&client, &serial, density).await
}

#[tauri::command]
async fn reset_screen_density(serial: String, state: State<'_, AppState>) -> Result<AdbExecutionResult, String> {
    let client = state.adb_client.lock().unwrap().clone();
    AdbCommands::reset_screen_density(&client, &serial).await
}

#[tauri::command]
async fn get_applicable_rules(serial: String, state: State<'_, AppState>) -> Result<Vec<TweakRule>, String> {
    let client = state.adb_client.lock().unwrap().clone();
    let device = DeviceScanner::scan_device_details(&client, &serial).await?;
    let rule_engine = state.rule_engine.lock().unwrap();
    Ok(rule_engine.get_applicable_rules(&device))
}

#[tauri::command]
async fn apply_tweak(
    serial: String,
    device_name: Option<String>,
    rule_id: String,
    auto_backup: bool,
    state: State<'_, AppState>,
) -> Result<Vec<AdbExecutionResult>, String> {
    let client = state.adb_client.lock().unwrap().clone();

    if auto_backup {
        let backup_mgr = state.backup_manager.lock().unwrap();
        let dname = device_name.unwrap_or_else(|| serial.clone());
        let _ = backup_mgr.create_snapshot(
            &client,
            &serial,
            &dname,
            &format!("Auto-Backup before tweak: {}", rule_id),
            vec![rule_id.clone()]
        ).await;
    }

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
    device_name: Option<String>,
    rule_ids: Vec<String>,
    auto_backup: bool,
    state: State<'_, AppState>,
) -> Result<Vec<AdbExecutionResult>, String> {
    let client = state.adb_client.lock().unwrap().clone();

    if auto_backup {
        let backup_mgr = state.backup_manager.lock().unwrap();
        let dname = device_name.unwrap_or_else(|| serial.clone());
        let _ = backup_mgr.create_snapshot(
            &client,
            &serial,
            &dname,
            &format!("Auto-Backup before applying {} tweaks", rule_ids.len()),
            rule_ids.clone()
        ).await;
    }

    let mut all_results = Vec::new();
    for rule_id in rule_ids {
        if let Ok(res) = apply_tweak(serial.clone(), None, rule_id, false, state.clone()).await {
            all_results.extend(res);
        }
    }

    Ok(all_results)
}

#[tauri::command]
async fn debloat_package(
    serial: String,
    device_name: Option<String>,
    package_name: String,
    force_override: bool,
    auto_backup: bool,
    state: State<'_, AppState>,
) -> Result<AdbExecutionResult, String> {
    let rule_engine = state.rule_engine.lock().unwrap();
    if rule_engine.is_package_whitelisted(&package_name) && !force_override {
        return Err(format!("SECURITY PREVENT: Package '{}' is a critical OS component in whitelist!", package_name));
    }

    let client = state.adb_client.lock().unwrap().clone();

    if auto_backup {
        let backup_mgr = state.backup_manager.lock().unwrap();
        let dname = device_name.unwrap_or_else(|| serial.clone());
        let _ = backup_mgr.create_snapshot(
            &client,
            &serial,
            &dname,
            &format!("Auto-Backup before debloating: {}", package_name),
            vec![]
        ).await;
    }

    AdbCommands::disable_package(&client, &serial, &package_name).await
}

#[tauri::command]
async fn restore_package(
    serial: String,
    package_name: String,
    state: State<'_, AppState>,
) -> Result<AdbExecutionResult, String> {
    let client = state.adb_client.lock().unwrap().clone();
    let _ = AdbCommands::restore_package_user0(&client, &serial, &package_name).await;
    AdbCommands::enable_package(&client, &serial, &package_name).await
}

#[tauri::command]
async fn create_backup(
    serial: String,
    device_name: String,
    note: String,
    applied_tweaks: Vec<String>,
    state: State<'_, AppState>,
) -> Result<BackupSnapshot, String> {
    let client = state.adb_client.lock().unwrap().clone();
    let backup_mgr = state.backup_manager.lock().unwrap();
    backup_mgr.create_snapshot(&client, &serial, &device_name, &note, applied_tweaks).await
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
    let client = state.adb_client.lock().unwrap().clone();
    let device = DeviceScanner::scan_device_details(&client, &serial).await?;
    let rule_engine = state.rule_engine.lock().unwrap();
    let mut packages = AdbCommands::list_packages(&client, &serial).await.unwrap_or_default();
    rule_engine.classify_packages(&mut packages);
    Ok(rule_engine.calculate_health_score(&device, &packages, &applied_tweaks))
}

#[tauri::command]
async fn run_custom_command(
    serial: String,
    command: String,
    state: State<'_, AppState>,
) -> Result<AdbExecutionResult, String> {
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
    let client = state.adb_client.lock().unwrap().clone();
    AdbCommands::reboot(&client, &serial, mode.as_deref()).await
}

#[tauri::command]
async fn connect_wifi_device(ipPort: String, state: State<'_, AppState>) -> Result<AdbExecutionResult, String> {
    let client = state.adb_client.lock().unwrap().clone();
    client.connect_wifi(&ipPort).await
}

#[tauri::command]
async fn set_custom_adb_path(path: Option<String>, state: State<'_, AppState>) -> Result<String, String> {
    let mut client = state.adb_client.lock().unwrap();
    client.set_custom_path(path);
    Ok(client.get_adb_path())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            adb_client: Mutex::new(AdbClient::new(None)),
            rule_engine: Mutex::new(RuleEngine::new()),
            backup_manager: Mutex::new(BackupManager::new()),
        })
        .invoke_handler(tauri::generate_handler![
            check_adb_status,
            download_install_adb,
            get_connected_devices,
            get_device_details,
            get_installed_packages,
            install_apk,
            extract_apk,
            set_screen_resolution,
            reset_screen_resolution,
            set_screen_density,
            reset_screen_density,
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
