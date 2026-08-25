use std::collections::HashMap;
use regex::Regex;
use crate::adb::client::AdbClient;
use crate::models::{AdbDevice, BatteryInfo, DeviceInfo, DisplayInfo};

pub struct DeviceScanner;

impl DeviceScanner {
    /// Discover all connected ADB devices
    pub async fn list_devices(client: &AdbClient) -> Result<Vec<AdbDevice>, String> {
        let res = client.execute(None, &["devices", "-l"]).await?;
        if !res.success {
            return Err(format!("Error listing devices: {}", res.stderr));
        }

        let mut devices = Vec::new();
        // Regex for `adb devices -l` line
        // Example: "R5CR30XYZ device product:dm3qxxx model:SM_S928B device:dm3q transport_id:1"
        let re = Regex::new(r"^([a-zA-Z0-9.:\-_]+)\s+([a-zA-Z0-9_-]+)(?:\s+(.*))?$").unwrap();

        for line in res.stdout.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with("List of devices attached") || line.starts_with("* daemon") {
                continue;
            }

            if let Some(caps) = re.captures(line) {
                let serial = caps.get(1).map_or("", |m| m.as_str()).to_string();
                let state = caps.get(2).map_or("", |m| m.as_str()).to_string();
                let extra_info = caps.get(3).map_or("", |m| m.as_str());

                let mut model = "Unknown".to_string();
                let mut product = "Unknown".to_string();
                let mut device = "Unknown".to_string();
                let mut transport_id = "".to_string();

                for part in extra_info.split_whitespace() {
                    if let Some((k, v)) = part.split_once(':') {
                        match k {
                            "model" => model = v.to_string(),
                            "product" => product = v.to_string(),
                            "device" => device = v.to_string(),
                            "transport_id" => transport_id = v.to_string(),
                            _ => {}
                        }
                    }
                }

                devices.push(AdbDevice {
                    serial,
                    state,
                    model,
                    product,
                    device,
                    transport_id,
                    is_mock: false,
                });
            }
        }

        Ok(devices)
    }

    /// Read all system properties (`getprop`) into a key-value HashMap
    pub async fn get_properties(client: &AdbClient, serial: &str) -> Result<HashMap<String, String>, String> {
        let res = client.shell(serial, "getprop").await?;
        let mut props = HashMap::new();
        let re = Regex::new(r"^\[(.*?)\]:\s*\[(.*?)\]$").unwrap();

        for line in res.stdout.lines() {
            if let Some(caps) = re.captures(line.trim()) {
                if let (Some(k), Some(v)) = (caps.get(1), caps.get(2)) {
                    props.insert(k.as_str().to_string(), v.as_str().to_string());
                }
            }
        }

        Ok(props)
    }

    /// Parse battery status from `dumpsys battery`
    pub async fn get_battery_info(client: &AdbClient, serial: &str) -> BatteryInfo {
        let res = client.shell(serial, "dumpsys battery").await.unwrap_or_default();
        let mut level: u32 = 85;
        let mut temp_raw: f32 = 320.0;
        let mut voltage_mv: u32 = 4150;
        let mut health_code = 2; // GOOD
        let mut status_code = 2; // CHARGING
        let mut plugged_code = 2; // USB
        let mut technology = "Li-poly".to_string();

        for line in res.stdout.lines() {
            let parts: Vec<&str> = line.trim().split(':').collect();
            if parts.len() >= 2 {
                let key = parts[0].trim();
                let val = parts[1].trim();

                match key {
                    "level" => level = val.parse().unwrap_or(level),
                    "temperature" => temp_raw = val.parse().unwrap_or(temp_raw),
                    "voltage" => voltage_mv = val.parse().unwrap_or(voltage_mv),
                    "health" => health_code = val.parse().unwrap_or(health_code),
                    "status" => status_code = val.parse().unwrap_or(status_code),
                    "plugged" => plugged_code = val.parse().unwrap_or(plugged_code),
                    "technology" => technology = val.to_string(),
                    _ => {}
                }
            }
        }

        let health = match health_code {
            2 => "Good (Optimal)",
            3 => "Overheat",
            4 => "Dead",
            5 => "Over Voltage",
            6 => "Unspecified Failure",
            7 => "Cold",
            _ => "Normal",
        }.to_string();

        let status = match status_code {
            2 => "Charging",
            3 => "Discharging",
            4 => "Not Charging",
            5 => "Full",
            _ => "Unknown",
        }.to_string();

        let plugged = match plugged_code {
            1 => "AC Charger",
            2 => "USB Port",
            4 => "Wireless Fast Charger",
            _ => "Battery (Unplugged)",
        }.to_string();

        let temp_c = if temp_raw > 100.0 { temp_raw / 10.0 } else { temp_raw };

        BatteryInfo {
            level,
            temperature_c: temp_c,
            voltage_mv,
            health,
            status,
            plugged,
            technology,
        }
    }

    /// Parse display resolution, density and refresh rate
    pub async fn get_display_info(client: &AdbClient, serial: &str) -> DisplayInfo {
        let size_res = client.shell(serial, "wm size").await.unwrap_or_default();
        let density_res = client.shell(serial, "wm density").await.unwrap_or_default();
        let display_res = client.shell(serial, "dumpsys display").await.unwrap_or_default();

        let mut width: u32 = 1080;
        let mut height: u32 = 2400;
        let mut density_dpi: u32 = 420;
        let mut refresh_rate: f32 = 120.0;
        let mut supported_rates = vec![60.0, 90.0, 120.0];

        // Parse `wm size` (e.g. "Physical size: 1440x3120" or "Override size: 1080x2340")
        let size_re = Regex::new(r"(\d+)x(\d+)").unwrap();
        for line in size_res.stdout.lines() {
            if let Some(caps) = size_re.captures(line) {
                width = caps[1].parse().unwrap_or(width);
                height = caps[2].parse().unwrap_or(height);
            }
        }

        // Parse `wm density` (e.g. "Physical density: 500" or "Override density: 450")
        let dens_re = Regex::new(r"density:\s*(\d+)").unwrap();
        for line in density_res.stdout.lines() {
            if let Some(caps) = dens_re.captures(line) {
                density_dpi = caps[1].parse().unwrap_or(density_dpi);
            }
        }

        // Parse `dumpsys display` for refresh rates (e.g. "fps=120.00" or "refreshRate 120.0")
        let fps_re = Regex::new(r"(?:fps=|refreshRate\s*=\s*|refreshRate\s+)(\d+(?:\.\d+)?)").unwrap();
        for line in display_res.stdout.lines() {
            if let Some(caps) = fps_re.captures(line) {
                if let Ok(fps) = caps[1].parse::<f32>() {
                    if fps >= 30.0 && fps <= 240.0 {
                        refresh_rate = fps;
                        if !supported_rates.contains(&fps) {
                            supported_rates.push(fps);
                        }
                    }
                }
            }
        }

        supported_rates.sort_by(|a, b| a.partial_cmp(b).unwrap());

        DisplayInfo {
            width,
            height,
            density_dpi,
            refresh_rate_hz: refresh_rate,
            supported_refresh_rates: supported_rates,
        }
    }

    /// Parse RAM usage from `/proc/meminfo`
    pub async fn get_ram_info(client: &AdbClient, serial: &str) -> (u64, u64) {
        let res = client.shell(serial, "cat /proc/meminfo").await.unwrap_or_default();
        let mut total_kb: u64 = 8 * 1024 * 1024;
        let mut avail_kb: u64 = 4 * 1024 * 1024;

        for line in res.stdout.lines() {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 {
                if parts[0] == "MemTotal:" {
                    total_kb = parts[1].parse().unwrap_or(total_kb);
                } else if parts[0] == "MemAvailable:" {
                    avail_kb = parts[1].parse().unwrap_or(avail_kb);
                }
            }
        }

        (total_kb / 1024, avail_kb / 1024)
    }

    /// Complete deep device scan
    pub async fn scan_device_details(client: &AdbClient, serial: &str) -> Result<DeviceInfo, String> {
        let props = Self::get_properties(client, serial).await.unwrap_or_default();
        let battery = Self::get_battery_info(client, serial).await;
        let display = Self::get_display_info(client, serial).await;
        let (total_ram_mb, available_ram_mb) = Self::get_ram_info(client, serial).await;

        let model = props.get("ro.product.model").cloned().unwrap_or_else(|| "Android Device".to_string());
        let manufacturer = props.get("ro.product.manufacturer").cloned().unwrap_or_else(|| "Unknown OEM".to_string());
        let brand = props.get("ro.product.brand").cloned().unwrap_or_else(|| manufacturer.clone());
        let product_name = props.get("ro.product.name").cloned().unwrap_or_else(|| "generic".to_string());
        let device_codename = props.get("ro.product.device").cloned().unwrap_or_else(|| "device".to_string());
        let android_version = props.get("ro.build.version.release").cloned().unwrap_or_else(|| "14".to_string());
        let sdk_version: u32 = props.get("ro.build.version.sdk").and_then(|v| v.parse().ok()).unwrap_or(34);
        let build_id = props.get("ro.build.id").cloned().unwrap_or_else(|| "UP1A.231005.007".to_string());
        let security_patch = props.get("ro.build.version.security_patch").cloned().unwrap_or_else(|| "2024-08-01".to_string());
        let soc_platform = props.get("ro.board.platform").cloned().unwrap_or_else(|| "snapdragon".to_string());
        let soc_manufacturer = props.get("ro.soc.manufacturer").cloned().unwrap_or_else(|| "Qualcomm".to_string());
        let cpu_abi = props.get("ro.product.cpu.abi").cloned().unwrap_or_else(|| "arm64-v8a".to_string());

        // Check root status
        let su_check = client.shell(serial, "which su").await.unwrap_or_default();
        let is_rooted = su_check.success && !su_check.stdout.trim().is_empty();

        // Check SELinux status
        let selinux_check = client.shell(serial, "getenforce").await.unwrap_or_default();
        let selinux_enforcing = selinux_check.stdout.trim().eq_ignore_ascii_case("Enforcing");

        Ok(DeviceInfo {
            serial: serial.to_string(),
            model,
            manufacturer,
            brand,
            product_name,
            device_codename,
            android_version,
            sdk_version,
            build_id,
            security_patch,
            soc_platform,
            soc_manufacturer,
            cpu_abi,
            total_ram_mb,
            available_ram_mb,
            is_rooted,
            selinux_enforcing,
            battery,
            display,
            is_mock: false,
        })
    }
}

impl Default for crate::models::AdbExecutionResult {
    fn default() -> Self {
        Self {
            success: false,
            command: "".to_string(),
            stdout: "".to_string(),
            stderr: "".to_string(),
            exit_code: -1,
            execution_time_ms: 0,
        }
    }
}
