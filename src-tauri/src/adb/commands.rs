use std::collections::HashMap;
use crate::adb::client::AdbClient;
use crate::models::{AdbExecutionResult, PackageInfo};

pub struct AdbCommands;

impl AdbCommands {
    /// List all installed packages with details
    pub async fn list_packages(client: &AdbClient, serial: &str) -> Result<Vec<PackageInfo>, String> {
        // Run `pm list packages -u -f` to get all packages including uninstalled/disabled and apk paths
        let res = client.shell(serial, "pm list packages -u -f").await?;
        if !res.success {
            return Err(format!("Failed to list packages: {}", res.stderr));
        }

        // Get disabled packages to flag them
        let disabled_res = client.shell(serial, "pm list packages -d").await.unwrap_or_default();
        let mut disabled_set = std::collections::HashSet::new();
        for line in disabled_res.stdout.lines() {
            if let Some(pkg) = line.trim().strip_prefix("package:") {
                disabled_set.insert(pkg.trim().to_string());
            }
        }

        let mut packages = Vec::new();

        for line in res.stdout.lines() {
            let line = line.trim();
            if let Some(rest) = line.strip_prefix("package:") {
                if let Some((apk_path, pkg_name)) = rest.rsplit_once('=') {
                    let is_system = apk_path.starts_with("/system") 
                        || apk_path.starts_with("/product") 
                        || apk_path.starts_with("/system_ext") 
                        || apk_path.starts_with("/vendor") 
                        || apk_path.starts_with("/apex");
                    let is_enabled = !disabled_set.contains(pkg_name);

                    // Generate human friendly app name from package id
                    let app_name = pkg_name.rsplit('.').next().map(|s| {
                        let mut chars = s.chars();
                        match chars.next() {
                            None => String::new(),
                            Some(f) => f.to_uppercase().collect::<String>() + chars.as_str(),
                        }
                    });

                    packages.push(PackageInfo {
                        package_name: pkg_name.to_string(),
                        apk_path: apk_path.to_string(),
                        is_system,
                        is_enabled,
                        app_name,
                        installer: None,
                        is_whitelisted: false,
                        bloat_category: None,
                        bloat_description: None,
                        risk_level: None,
                    });
                }
            }
        }

        Ok(packages)
    }

    /// Safely uninstall package for user 0 (keeps app in /system, removes user data and disables it)
    pub async fn uninstall_package_user0(client: &AdbClient, serial: &str, package: &str) -> Result<AdbExecutionResult, String> {
        let cmd = format!("pm uninstall -k --user 0 {}", package);
        client.shell(serial, &cmd).await
    }

    /// Restore previously uninstalled system package
    pub async fn restore_package_user0(client: &AdbClient, serial: &str, package: &str) -> Result<AdbExecutionResult, String> {
        let cmd = format!("pm install-existing --user 0 {}", package);
        client.shell(serial, &cmd).await
    }

    /// Disable package for user 0
    pub async fn disable_package(client: &AdbClient, serial: &str, package: &str) -> Result<AdbExecutionResult, String> {
        let cmd = format!("pm disable-user --user 0 {}", package);
        client.shell(serial, &cmd).await
    }

    /// Re-enable package
    pub async fn enable_package(client: &AdbClient, serial: &str, package: &str) -> Result<AdbExecutionResult, String> {
        let cmd = format!("pm enable {}", package);
        client.shell(serial, &cmd).await
    }

    /// Clear app cache and data
    pub async fn clear_app_data(client: &AdbClient, serial: &str, package: &str) -> Result<AdbExecutionResult, String> {
        let cmd = format!("pm clear {}", package);
        client.shell(serial, &cmd).await
    }

    /// Get Android system setting (global, system, secure)
    pub async fn get_setting(client: &AdbClient, serial: &str, namespace: &str, key: &str) -> Result<String, String> {
        let cmd = format!("settings get {} {}", namespace, key);
        let res = client.shell(serial, &cmd).await?;
        Ok(res.stdout.trim().to_string())
    }

    /// Set Android system setting (global, system, secure)
    pub async fn put_setting(client: &AdbClient, serial: &str, namespace: &str, key: &str, value: &str) -> Result<AdbExecutionResult, String> {
        let cmd = format!("settings put {} {} {}", namespace, key, value);
        client.shell(serial, &cmd).await
    }

    /// Delete Android system setting
    pub async fn delete_setting(client: &AdbClient, serial: &str, namespace: &str, key: &str) -> Result<AdbExecutionResult, String> {
        let cmd = format!("settings delete {} {}", namespace, key);
        client.shell(serial, &cmd).await
    }

    /// Dump key-value pairs for a settings namespace (global, system, secure)
    pub async fn dump_settings(client: &AdbClient, serial: &str, namespace: &str) -> Result<HashMap<String, String>, String> {
        let cmd = format!("settings list {}", namespace);
        let res = client.shell(serial, &cmd).await.unwrap_or_default();
        let mut map = HashMap::new();

        for line in res.stdout.lines() {
            if let Some((k, v)) = line.trim().split_once('=') {
                map.insert(k.to_string(), v.to_string());
            }
        }

        Ok(map)
    }

    /// Device power controls (normal, recovery, bootloader)
    pub async fn reboot(client: &AdbClient, serial: &str, mode: Option<&str>) -> Result<AdbExecutionResult, String> {
        let mut args = vec!["reboot"];
        if let Some(m) = mode {
            if !m.is_empty() {
                args.push(m);
            }
        }
        client.execute(Some(serial), &args).await
    }

    /// Take screenshot and return base64 png
    pub async fn capture_screenshot(client: &AdbClient, serial: &str) -> Result<String, String> {
        // Capture to /sdcard/screencap.png, pull base64 or stream
        let cap_res = client.shell(serial, "screencap -p /sdcard/nexus_screencap.png").await?;
        if !cap_res.success {
            return Err(format!("Screencap failed: {}", cap_res.stderr));
        }

        let b64_res = client.shell(serial, "base64 /sdcard/nexus_screencap.png").await?;
        let _ = client.shell(serial, "rm -f /sdcard/nexus_screencap.png").await;

        if b64_res.success {
            Ok(b64_res.stdout.replace('\n', "").replace('\r', ""))
        } else {
            Err("Failed to encode screenshot".to_string())
        }
    }
}
