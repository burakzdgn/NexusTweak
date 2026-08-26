use std::collections::HashMap;
use std::path::PathBuf;
use crate::adb::client::AdbClient;
use crate::models::{AdbExecutionResult, PackageInfo};

pub struct AdbCommands;

impl AdbCommands {
    /// List all installed packages with details
    pub async fn list_packages(client: &AdbClient, serial: &str) -> Result<Vec<PackageInfo>, String> {
        let res = client.shell(serial, "pm list packages -u -f").await?;
        if !res.success {
            return Err(format!("Failed to list packages: {}", res.stderr));
        }

        // Accurately determine currently enabled packages for user 0
        let mut enabled_res = client.shell(serial, "pm list packages -e --user 0").await.unwrap_or_default();
        if !enabled_res.success || enabled_res.stdout.trim().is_empty() {
            enabled_res = client.shell(serial, "pm list packages -e").await.unwrap_or_default();
        }
        let mut enabled_set = std::collections::HashSet::new();
        for line in enabled_res.stdout.lines() {
            if let Some(pkg) = line.trim().strip_prefix("package:") {
                enabled_set.insert(pkg.trim().to_string());
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
                    
                    let is_enabled = enabled_set.contains(pkg_name);

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

    /// Install an APK package on device
    pub async fn install_apk(client: &AdbClient, serial: &str, apk_path: &str) -> Result<AdbExecutionResult, String> {
        client.execute(Some(serial), &["install", "-r", "-d", apk_path]).await
    }

    /// Extract / dump APK from device to local directory
    pub async fn extract_apk(client: &AdbClient, serial: &str, package: &str, dest_folder: &str) -> Result<AdbExecutionResult, String> {
        let path_res = client.shell(serial, &format!("pm path {}", package)).await?;
        if !path_res.success || path_res.stdout.trim().is_empty() {
            return Err(format!("Could not locate APK for package: {}", package));
        }

        // Example stdout: "package:/data/app/~~.../base.apk"
        let remote_path = path_res.stdout.lines().next()
            .and_then(|l| l.strip_prefix("package:"))
            .unwrap_or("")
            .trim();

        if remote_path.is_empty() {
            return Err("Invalid APK remote path".to_string());
        }

        let local_file = PathBuf::from(dest_folder).join(format!("{}.apk", package));
        client.execute(Some(serial), &["pull", remote_path, local_file.to_str().unwrap_or(package)]).await
    }

    /// Change screen resolution (wm size <width>x<height>)
    pub async fn set_screen_resolution(client: &AdbClient, serial: &str, width: u32, height: u32) -> Result<AdbExecutionResult, String> {
        let cmd = format!("wm size {}x{}", width, height);
        client.shell(serial, &cmd).await
    }

    /// Reset screen resolution to physical default
    pub async fn reset_screen_resolution(client: &AdbClient, serial: &str) -> Result<AdbExecutionResult, String> {
        client.shell(serial, "wm size reset").await
    }

    /// Change screen density (wm density <dpi>)
    pub async fn set_screen_density(client: &AdbClient, serial: &str, density: u32) -> Result<AdbExecutionResult, String> {
        let cmd = format!("wm density {}", density);
        client.shell(serial, &cmd).await
    }

    /// Reset screen density to physical default
    pub async fn reset_screen_density(client: &AdbClient, serial: &str) -> Result<AdbExecutionResult, String> {
        client.shell(serial, "wm density reset").await
    }

    /// Safely uninstall package for user 0
    pub async fn uninstall_package_user0(client: &AdbClient, serial: &str, package: &str) -> Result<AdbExecutionResult, String> {
        let cmd = format!("pm uninstall -k --user 0 {}", package);
        client.shell(serial, &cmd).await
    }

    /// Restore previously uninstalled system package
    pub async fn restore_package_user0(client: &AdbClient, serial: &str, package: &str) -> Result<AdbExecutionResult, String> {
        let cmd = format!("pm install-existing --user 0 {}", package);
        client.shell(serial, &cmd).await
    }

    /// Disable package for user 0 (with automatic fallback to uninstall for user 0 on Xiaomi/MIUI/HyperOS)
    pub async fn disable_package(client: &AdbClient, serial: &str, package: &str) -> Result<AdbExecutionResult, String> {
        let cmd = format!("pm disable-user --user 0 {}", package);
        let res = client.shell(serial, &cmd).await?;
        if !res.success || res.stdout.contains("SecurityException") || res.stdout.contains("Cannot disable system packages") || res.stdout.contains("Permission Denial") {
            let fallback_res = Self::uninstall_package_user0(client, serial, package).await?;
            if fallback_res.success || fallback_res.stdout.contains("Success") {
                return Ok(fallback_res);
            }
        }
        Ok(res)
    }

    /// Re-enable package
    pub async fn enable_package(client: &AdbClient, serial: &str, package: &str) -> Result<AdbExecutionResult, String> {
        let _ = Self::restore_package_user0(client, serial, package).await;
        let cmd = format!("pm enable {}", package);
        client.shell(serial, &cmd).await
    }

    /// Clear app cache and data
    pub async fn clear_app_data(client: &AdbClient, serial: &str, package: &str) -> Result<AdbExecutionResult, String> {
        let cmd = format!("pm clear {}", package);
        client.shell(serial, &cmd).await
    }

    /// Get Android system setting
    pub async fn get_setting(client: &AdbClient, serial: &str, namespace: &str, key: &str) -> Result<String, String> {
        let cmd = format!("settings get {} {}", namespace, key);
        let res = client.shell(serial, &cmd).await?;
        Ok(res.stdout.trim().to_string())
    }

    /// Set Android system setting
    pub async fn put_setting(client: &AdbClient, serial: &str, namespace: &str, key: &str, value: &str) -> Result<AdbExecutionResult, String> {
        let cmd = format!("settings put {} {} {}", namespace, key, value);
        client.shell(serial, &cmd).await
    }

    /// Delete Android system setting
    pub async fn delete_setting(client: &AdbClient, serial: &str, namespace: &str, key: &str) -> Result<AdbExecutionResult, String> {
        let cmd = format!("settings delete {} {}", namespace, key);
        client.shell(serial, &cmd).await
    }

    /// Dump key-value pairs for a settings namespace
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

    /// Device power controls
    pub async fn reboot(client: &AdbClient, serial: &str, mode: Option<&str>) -> Result<AdbExecutionResult, String> {
        let mut args = vec!["reboot"];
        if let Some(m) = mode {
            if !m.is_empty() {
                args.push(m);
            }
        }
        client.execute(Some(serial), &args).await
    }
}
