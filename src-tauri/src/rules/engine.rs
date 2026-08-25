use std::collections::{HashMap, HashSet};
use crate::models::{DeviceInfo, HealthScore, PackageInfo, RiskLevel, TweakRule};

#[derive(Debug, Clone)]
pub struct RuleEngine {
    rules: Vec<TweakRule>,
    whitelist: HashSet<String>,
    bloat_definitions: HashMap<String, (String, String, RiskLevel)>,
}

impl RuleEngine {
    pub fn new() -> Self {
        let mut engine = Self {
            rules: Vec::new(),
            whitelist: HashSet::new(),
            bloat_definitions: HashMap::new(),
        };

        engine.load_embedded_rules();
        engine.load_embedded_whitelist();
        engine.init_bloat_definitions();
        engine
    }

    fn load_embedded_rules(&mut self) {
        let generic_raw = include_str!("../../rules_db/generic_tweaks.json");
        let samsung_raw = include_str!("../../rules_db/samsung_oneui.json");
        let xiaomi_raw = include_str!("../../rules_db/xiaomi_miui.json");
        let pixel_raw = include_str!("../../rules_db/google_pixel.json");

        let mut all_rules = Vec::new();

        match serde_json::from_str::<Vec<TweakRule>>(generic_raw) {
            Ok(r) => all_rules.extend(r),
            Err(e) => eprintln!("[NexusTweak] Failed to parse generic_tweaks.json: {}", e),
        }
        match serde_json::from_str::<Vec<TweakRule>>(samsung_raw) {
            Ok(r) => all_rules.extend(r),
            Err(e) => eprintln!("[NexusTweak] Failed to parse samsung_oneui.json: {}", e),
        }
        match serde_json::from_str::<Vec<TweakRule>>(xiaomi_raw) {
            Ok(r) => all_rules.extend(r),
            Err(e) => eprintln!("[NexusTweak] Failed to parse xiaomi_miui.json: {}", e),
        }
        match serde_json::from_str::<Vec<TweakRule>>(pixel_raw) {
            Ok(r) => all_rules.extend(r),
            Err(e) => eprintln!("[NexusTweak] Failed to parse google_pixel.json: {}", e),
        }

        self.rules = all_rules;
    }

    fn load_embedded_whitelist(&mut self) {
        let whitelist_raw = include_str!("../../rules_db/system_whitelist.json");
        if let Ok(val) = serde_json::from_str::<serde_json::Value>(whitelist_raw) {
            if let Some(list) = val.get("whitelist").and_then(|w| w.as_array()) {
                for item in list {
                    if let Some(pkg) = item.get("package").and_then(|p| p.as_str()) {
                        self.whitelist.insert(pkg.to_string());
                    }
                }
            }
        }

        // Always ensure vital AOSP core packages are present
        let core = [
            "android",
            "com.android.systemui",
            "com.android.settings",
            "com.google.android.gms",
            "com.google.android.gsf",
            "com.android.vending",
            "com.android.phone",
            "com.android.dialer",
            "com.google.android.dialer",
            "com.android.launcher3",
            "com.sec.android.app.launcher",
            "com.miui.home",
            "com.google.android.apps.nexuslauncher",
            "com.android.keychain",
            "com.android.packageinstaller",
            "com.google.android.packageinstaller",
            "com.android.permissioncontroller",
        ];

        for c in core {
            self.whitelist.insert(c.to_string());
        }
    }

    fn init_bloat_definitions(&mut self) {
        // Xiaomi / MIUI bloat definitions
        self.bloat_definitions.insert(
            "com.miui.msa.global".into(),
            ("MIUI System Ads".into(), "Ad network and sponsored recommendation pusher".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.miui.analytics".into(),
            ("MIUI Analytics".into(), "Xiaomi user behavior and diagnostics analytics".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.xiaomi.joyose".into(),
            ("Xiaomi Joyose".into(), "Thermal and frame rate throttling daemon".into(), RiskLevel::Moderate)
        );
        self.bloat_definitions.insert(
            "com.xiaomi.mipicks".into(),
            ("GetApps Store".into(), "Xiaomi auxiliary app store with promotional notifications".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.miui.videoplayer".into(),
            ("Mi Video".into(), "Pre-installed media player with online push feeds".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.miui.player".into(),
            ("Mi Music".into(), "Pre-installed music player with online promotions".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.miui.android.fashiongallery".into(),
            ("Wallpaper Carousel".into(), "Lockscreen wallpaper ad provider".into(), RiskLevel::Safe)
        );

        // Samsung / OneUI bloat definitions
        self.bloat_definitions.insert(
            "com.samsung.android.bixby.agent".into(),
            ("Bixby Agent".into(), "Samsung voice assistant background framework".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.samsung.android.bixby.voiceinput".into(),
            ("Bixby Voice Input".into(), "Voice typing service for Samsung Keyboard".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.samsung.android.game.gos".into(),
            ("Game Optimizing Service".into(), "Throttles resolution & FPS in games".into(), RiskLevel::Moderate)
        );
        self.bloat_definitions.insert(
            "com.sec.android.diagmonagent".into(),
            ("Samsung Diagnostic Agent".into(), "Crash log and telemetry reporter".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.samsung.android.spay".into(),
            ("Samsung Pay".into(), "Samsung payment stub and wallet service".into(), RiskLevel::Moderate)
        );
        self.bloat_definitions.insert(
            "com.microsoft.appmanager".into(),
            ("Link to Windows".into(), "Microsoft Phone Link background bridge".into(), RiskLevel::Safe)
        );

        // Google Pixel bloat / telemetry
        self.bloat_definitions.insert(
            "com.google.android.apps.tips".into(),
            ("Pixel Tips".into(), "Pixel showcase tutorials and notifications".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.google.android.feedback".into(),
            ("Google Feedback".into(), "Crash log submission agent".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.google.android.apps.turbo".into(),
            ("Device Health Services".into(), "Battery usage diagnostics telemetry".into(), RiskLevel::Moderate)
        );
    }

    /// Match and filter rules applicable to a specific device
    pub fn get_applicable_rules(&self, device: &DeviceInfo) -> Vec<TweakRule> {
        let oem_lower = device.manufacturer.to_lowercase();
        let brand_lower = device.brand.to_lowercase();
        let codename_lower = device.device_codename.to_lowercase();
        let product_lower = device.product_name.to_lowercase();

        let max_supported_hz = device.display.supported_refresh_rates
            .iter()
            .cloned()
            .fold(60.0f32, f32::max);

        let mut matched_rules: Vec<TweakRule> = self.rules.iter().filter(|r| {
            let target = r.target_oem.to_lowercase();
            let matches_oem = match target.as_str() {
                "generic" => true,
                "samsung" => oem_lower.contains("samsung") || brand_lower.contains("samsung") || product_lower.contains("samsung"),
                "xiaomi" => {
                    oem_lower.contains("xiaomi")
                        || oem_lower.contains("redmi")
                        || oem_lower.contains("poco")
                        || brand_lower.contains("xiaomi")
                        || brand_lower.contains("redmi")
                        || brand_lower.contains("poco")
                        || codename_lower.contains("xiaomi")
                        || product_lower.contains("xiaomi")
                        || product_lower.contains("redmi")
                        || product_lower.contains("poco")
                }
                "google" => {
                    oem_lower.contains("google")
                        || brand_lower.contains("google")
                        || brand_lower.contains("pixel")
                        || product_lower.contains("pixel")
                }
                _ => false,
            };

            if !matches_oem {
                return false;
            }

            if let Some(min_sdk) = r.min_sdk {
                if device.sdk_version < min_sdk {
                    return false;
                }
            }

            if let Some(max_sdk) = r.max_sdk {
                if device.sdk_version > max_sdk {
                    return false;
                }
            }

            // If rule is force peak refresh rate, only show it if the phone actually supports > 60Hz
            if r.id == "gen_force_peak_refresh_rate" && max_supported_hz <= 60.0 {
                return false;
            }

            true
        }).cloned().collect();

        // Dynamically tailor the peak refresh rate rule to the device's actual max panel Hz
        for r in matched_rules.iter_mut() {
            if r.id == "gen_force_peak_refresh_rate" && max_supported_hz > 60.0 {
                let max_hz_int = max_supported_hz.round() as u32;
                r.name = format!("Force Peak {}Hz Refresh Rate", max_hz_int);
                r.description = format!(
                    "Sets min_refresh_rate equal to {}Hz preventing the screen from dropping to 60Hz during scrolling.",
                    max_hz_int
                );
                r.apply_commands = vec![
                    format!("settings put system peak_refresh_rate {:.1}", max_supported_hz),
                    format!("settings put system min_refresh_rate {:.1}", max_supported_hz),
                ];
                r.revert_commands = vec![
                    "settings delete system min_refresh_rate".to_string(),
                    format!("settings put system peak_refresh_rate {:.1}", max_supported_hz),
                ];
            }
        }

        matched_rules
    }

    /// Enhance packages with whitelist flags and bloatware categories
    pub fn classify_packages(&self, packages: &mut [PackageInfo]) {
        for pkg in packages.iter_mut() {
            let is_wl = self.whitelist.contains(&pkg.package_name)
                || pkg.package_name.starts_with("com.android.internal")
                || pkg.package_name == "android";

            pkg.is_whitelisted = is_wl;

            if let Some((app_name, desc, risk)) = self.bloat_definitions.get(&pkg.package_name) {
                pkg.app_name = Some(app_name.clone());
                pkg.bloat_description = Some(desc.clone());
                pkg.bloat_category = Some("OEM Telemetry / Bloatware".into());
                pkg.risk_level = Some(match risk {
                    RiskLevel::Safe => "Safe".into(),
                    RiskLevel::Moderate => "Moderate".into(),
                    RiskLevel::Advanced => "Advanced".into(),
                });
            } else if pkg.is_system && !is_wl {
                // Generic system app
                if pkg.package_name.contains("analytics") 
                    || pkg.package_name.contains("telemetry") 
                    || pkg.package_name.contains("tracking") 
                    || pkg.package_name.contains("feedback") {
                    pkg.bloat_category = Some("Diagnostics / Telemetry".into());
                    pkg.bloat_description = Some("Background telemetry and logging service".into());
                    pkg.risk_level = Some("Safe".into());
                }
            }
        }
    }

    /// Compute dynamic device health and optimization score (0-100)
    pub fn calculate_health_score(
        &self,
        device: &DeviceInfo,
        packages: &[PackageInfo],
        applied_tweaks: &[String],
    ) -> HealthScore {
        let mut battery_score: u32 = 70;
        let mut privacy_score: u32 = 65;
        let mut animation_score: u32 = 60;
        let mut recommendations = Vec::new();

        // 1. Check animation tweaks
        if applied_tweaks.contains(&"gen_anim_scale_fast".to_string()) || applied_tweaks.contains(&"gen_anim_scale_off".to_string()) {
            animation_score = 100;
        } else {
            recommendations.push("Speed up UI animations to 0.5x for snappier performance".to_string());
        }

        // 2. Check refresh rate dynamically based on device display capability
        let max_supported_hz = device.display.supported_refresh_rates
            .iter()
            .cloned()
            .fold(60.0f32, f32::max);

        if max_supported_hz > 60.0 {
            let is_high_hz_active = device.display.refresh_rate_hz >= (max_supported_hz - 2.0);
            if is_high_hz_active || applied_tweaks.contains(&"gen_force_peak_refresh_rate".to_string()) {
                animation_score = (animation_score + 100) / 2;
            } else {
                recommendations.push(format!(
                    "Force {}Hz display refresh rate to eliminate frame drops",
                    max_supported_hz.round() as u32
                ));
            }
        }

        // 3. Check private DNS
        if applied_tweaks.contains(&"gen_private_dns_cloudflare".to_string()) || applied_tweaks.contains(&"gen_private_dns_adguard".to_string()) {
            privacy_score = 100;
        } else {
            recommendations.push("Enable AdGuard or Cloudflare Private DNS to block trackers & ads".to_string());
        }

        // 4. Check Doze & Battery
        if applied_tweaks.contains(&"gen_aggressive_doze".to_string()) {
            battery_score = 95;
        } else {
            recommendations.push("Enable Aggressive Doze for enhanced standby battery savings".to_string());
        }

        // 5. Check Bloatware count
        let detected_bloat = packages.iter().filter(|p| p.bloat_category.is_some() && p.is_enabled).count();
        let debloat_score = if detected_bloat == 0 {
            100
        } else {
            recommendations.push(format!("Debloat {} unnecessary OEM background packages", detected_bloat));
            100u32.saturating_sub((detected_bloat as u32) * 8).max(40)
        };

        let total_score = (battery_score + privacy_score + animation_score + debloat_score) / 4;

        HealthScore {
            total_score,
            battery_score,
            privacy_score,
            animation_score,
            debloat_score,
            recommendations,
        }
    }

    pub fn is_package_whitelisted(&self, package: &str) -> bool {
        self.whitelist.contains(package)
    }
}
