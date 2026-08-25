use std::fs;
use std::path::PathBuf;
use std::collections::HashSet;
use chrono::Utc;
use crate::adb::client::AdbClient;
use crate::adb::commands::AdbCommands;
use crate::models::{AdbExecutionResult, BackupSnapshot};

#[derive(Debug, Clone)]
pub struct BackupManager {
    backup_dir: PathBuf,
}

impl BackupManager {
    pub fn new() -> Self {
        let dir = PathBuf::from("device_backups");
        if !dir.exists() {
            let _ = fs::create_dir_all(&dir);
        }
        Self { backup_dir: dir }
    }

    /// Create an automated safety snapshot before performing tweaks or debloating
    pub async fn create_snapshot(
        &self,
        client: &AdbClient,
        serial: &str,
        device_name: &str,
        note: &str,
        applied_tweaks: Vec<String>,
    ) -> Result<BackupSnapshot, String> {
        let timestamp = Utc::now().to_rfc3339();
        let sanitized_serial = serial.replace([':', '.', '/', '\\'], "_");
        let file_id = format!("{}_{}", sanitized_serial, Utc::now().format("%Y%m%d_%H%M%S"));

        // Capture settings
        let settings_global = AdbCommands::dump_settings(client, serial, "global").await.unwrap_or_default();
        let settings_system = AdbCommands::dump_settings(client, serial, "system").await.unwrap_or_default();
        let settings_secure = AdbCommands::dump_settings(client, serial, "secure").await.unwrap_or_default();

        // Capture disabled packages
        let disabled_res = client.shell(serial, "pm list packages -d").await.unwrap_or_default();
        let mut disabled_packages = Vec::new();
        for line in disabled_res.stdout.lines() {
            if let Some(pkg) = line.trim().strip_prefix("package:") {
                disabled_packages.push(pkg.trim().to_string());
            }
        }

        // Capture uninstalled for user 0 packages
        let uninstalled_res = client.shell(serial, "pm list packages -u").await.unwrap_or_default();
        let mut uninstalled_packages = Vec::new();
        for line in uninstalled_res.stdout.lines() {
            if let Some(pkg) = line.trim().strip_prefix("package:") {
                uninstalled_packages.push(pkg.trim().to_string());
            }
        }

        // Build target properties summary diff list
        let mut target_properties_diff = Vec::new();
        if let Some(scale) = settings_global.get("window_animation_scale") {
            target_properties_diff.push(format!("global.window_animation_scale = {}", scale));
        }
        if let Some(scale) = settings_global.get("transition_animation_scale") {
            target_properties_diff.push(format!("global.transition_animation_scale = {}", scale));
        }
        if let Some(scale) = settings_global.get("animator_duration_scale") {
            target_properties_diff.push(format!("global.animator_duration_scale = {}", scale));
        }
        if let Some(dns) = settings_global.get("private_dns_mode") {
            target_properties_diff.push(format!("global.private_dns_mode = {}", dns));
        }
        if let Some(dns_spec) = settings_global.get("private_dns_specifier") {
            target_properties_diff.push(format!("global.private_dns_specifier = {}", dns_spec));
        }
        if let Some(peak_hz) = settings_system.get("peak_refresh_rate") {
            target_properties_diff.push(format!("system.peak_refresh_rate = {} Hz", peak_hz));
        }
        if let Some(min_hz) = settings_system.get("min_refresh_rate") {
            target_properties_diff.push(format!("system.min_refresh_rate = {} Hz", min_hz));
        }

        for pkg in &disabled_packages {
            target_properties_diff.push(format!("disabled_package: {}", pkg));
        }

        let snapshot = BackupSnapshot {
            id: file_id.clone(),
            device_serial: serial.to_string(),
            device_name: device_name.to_string(),
            timestamp,
            note: note.to_string(),
            settings_global,
            settings_system,
            settings_secure,
            disabled_packages,
            uninstalled_packages,
            applied_tweak_ids: applied_tweaks,
            target_properties_diff,
        };

        // Write snapshot to local disk
        let file_path = self.backup_dir.join(format!("{}.json", file_id));
        let json_data = serde_json::to_string_pretty(&snapshot)
            .map_err(|e| format!("Failed to serialize backup: {}", e))?;

        fs::write(&file_path, json_data)
            .map_err(|e| format!("Failed to save backup file: {}", e))?;

        Ok(snapshot)
    }

    /// List all available backups for a device or all devices
    pub fn list_backups(&self, filter_serial: Option<&str>) -> Vec<BackupSnapshot> {
        let mut backups = Vec::new();

        if let Ok(entries) = fs::read_dir(&self.backup_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().and_then(|s| s.to_str()) == Some("json") {
                    if let Ok(content) = fs::read_to_string(&path) {
                        if let Ok(snapshot) = serde_json::from_str::<BackupSnapshot>(&content) {
                            if let Some(serial) = filter_serial {
                                if snapshot.device_serial == serial {
                                    backups.push(snapshot);
                                }
                            } else {
                                backups.push(snapshot);
                            }
                        }
                    }
                }
            }
        }

        // Sort latest first
        backups.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
        backups
    }

    /// Restore a backup snapshot back to the connected device
    pub async fn restore_snapshot(
        &self,
        client: &AdbClient,
        snapshot_id: &str,
    ) -> Result<Vec<AdbExecutionResult>, String> {
        let file_path = self.backup_dir.join(format!("{}.json", snapshot_id));
        if !file_path.exists() {
            return Err(format!("Backup snapshot {} not found", snapshot_id));
        }

        let content = fs::read_to_string(&file_path)
            .map_err(|e| format!("Could not read backup file: {}", e))?;
        let snapshot: BackupSnapshot = serde_json::from_str(&content)
            .map_err(|e| format!("Invalid backup file format: {}", e))?;

        let serial = &snapshot.device_serial;
        let mut results = Vec::new();

        // 1. Restore Global Settings
        for (k, v) in snapshot.settings_global.iter() {
            if let Ok(res) = AdbCommands::put_setting(client, serial, "global", k, v).await {
                results.push(res);
            }
        }

        // 2. Restore System Settings
        for (k, v) in snapshot.settings_system.iter() {
            if let Ok(res) = AdbCommands::put_setting(client, serial, "system", k, v).await {
                results.push(res);
            }
        }

        // 3. Restore Secure Settings
        for (k, v) in snapshot.settings_secure.iter() {
            if let Ok(res) = AdbCommands::put_setting(client, serial, "secure", k, v).await {
                results.push(res);
            }
        }

        // 4. Restore Package States (Diff between current live state and snapshot)
        let current_disabled_res = client.shell(serial, "pm list packages -d").await.unwrap_or_default();
        let mut current_disabled = HashSet::new();
        for line in current_disabled_res.stdout.lines() {
            if let Some(pkg) = line.trim().strip_prefix("package:") {
                current_disabled.insert(pkg.trim().to_string());
            }
        }

        let snapshot_disabled: HashSet<String> = snapshot.disabled_packages.into_iter().collect();

        // Any package currently disabled that was active in the snapshot should be re-enabled
        for pkg in &current_disabled {
            if !snapshot_disabled.contains(pkg) {
                if let Ok(res) = AdbCommands::enable_package(client, serial, pkg).await {
                    results.push(res);
                }
                if let Ok(res) = AdbCommands::restore_package_user0(client, serial, pkg).await {
                    results.push(res);
                }
            }
        }

        // Any package that was disabled at snapshot time should be disabled
        for pkg in &snapshot_disabled {
            if !current_disabled.contains(pkg) {
                if let Ok(res) = AdbCommands::disable_package(client, serial, pkg).await {
                    results.push(res);
                }
            }
        }

        Ok(results)
    }

    /// Delete a backup snapshot
    pub fn delete_backup(&self, snapshot_id: &str) -> Result<(), String> {
        let file_path = self.backup_dir.join(format!("{}.json", snapshot_id));
        if file_path.exists() {
            fs::remove_file(file_path).map_err(|e| format!("Failed to delete backup: {}", e))?;
        }
        Ok(())
    }
}
