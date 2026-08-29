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
        self.bloat_definitions.insert(
            "com.mi.globalbrowser".into(),
            ("Mi Browser (Global)".into(), "Xiaomi pre-installed web browser with promotional feeds & search bar ads".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.android.browser".into(),
            ("Mi Browser / Stock Browser".into(), "MIUI default stock browser application".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.mi.global.bbs".into(),
            ("Xiaomi Community".into(), "Xiaomi forums and community application".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.miui.hybrid".into(),
            ("Quick Apps (Hybrid)".into(), "Xiaomi Instant app engine with tracking and push notifications".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.miui.hybrid.accessory".into(),
            ("Quick Apps Accessory".into(), "Quick Apps background helper service".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.miui.bugreport".into(),
            ("Mi Bug Report".into(), "Automated crash and diagnostics reporting service".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.miui.miservice".into(),
            ("Services & Feedback".into(), "Xiaomi customer feedback and telemetry agent".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.miui.cleanmaster".into(),
            ("Cleaner (Clean Master)".into(), "Cheetah Mobile / Clean Master telemetry integration".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.xiaomi.payment".into(),
            ("Mi Pay / Payment Framework".into(), "Xiaomi integrated payment stub".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.mipay.wallet.id".into(),
            ("Mi Wallet".into(), "Xiaomi regional wallet and payment app".into(), RiskLevel::Safe)
        );
        self.bloat_definitions.insert(
            "com.mipay.wallet.in".into(),
            ("Mi Pay Wallet".into(), "Xiaomi regional wallet and payment app".into(), RiskLevel::Safe)
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

    /// Populate live is_applied and current_value on each rule by inspecting current device state
    pub fn populate_rule_states(
        &self,
        rules: &mut [TweakRule],
        settings_global: &HashMap<String, String>,
        settings_system: &HashMap<String, String>,
        settings_secure: &HashMap<String, String>,
        packages: &[PackageInfo],
    ) {
        let enabled_packages: HashSet<String> = packages
            .iter()
            .filter(|p| p.is_enabled)
            .map(|p| p.package_name.clone())
            .collect();

        for rule in rules.iter_mut() {
            if let Some(ref verify_cmd) = rule.verify_command {
                let parts: Vec<&str> = verify_cmd.split_whitespace().collect();
                if parts.len() >= 4 && parts[0] == "settings" && parts[1] == "get" {
                    let ns = parts[2];
                    let key = parts[3];

                    let current = match ns {
                        "global" => settings_global.get(key),
                        "system" => settings_system.get(key),
                        "secure" => settings_secure.get(key),
                        _ => None,
                    };

                    if let Some(val) = current {
                        rule.current_value = Some(val.clone());
                        if let Some(ref exp) = rule.expected_value {
                            let is_match = match rule.id.as_str() {
                                "gen_anim_scale_fast" => {
                                    let v = val.parse::<f32>().unwrap_or(1.0);
                                    (v - 0.5).abs() < 0.05
                                },
                                "gen_anim_scale_off" => {
                                    let v = val.parse::<f32>().unwrap_or(1.0);
                                    v < 0.05
                                },
                                "gen_private_dns_cloudflare" => {
                                    let mode = settings_global.get("private_dns_mode").map(|s| s.as_str()).unwrap_or("");
                                    mode == "hostname" && (val.contains("cloudflare") || val.contains("1.1.1.1") || val.contains("1dot1dot1dot1"))
                                },
                                "gen_private_dns_adguard" => {
                                    let mode = settings_global.get("private_dns_mode").map(|s| s.as_str()).unwrap_or("");
                                    mode == "hostname" && val.contains("adguard")
                                },
                                "gen_wifi_scan_throttling_disable" => {
                                    val == "0"
                                },
                                "gen_aggressive_doze" => val.contains("inactive_to"),
                                "gen_force_peak_refresh_rate" => {
                                    let current_hz = val.parse::<f32>().unwrap_or(0.0);
                                    let target_hz = exp.parse::<f32>().unwrap_or(0.0);
                                    target_hz > 30.0 && (current_hz - target_hz).abs() < 1.0
                                },
                                _ => val == exp || (exp.contains("inactive_to") && val.contains("inactive_to")),
                            };
                            rule.is_applied = Some(is_match);
                        }
                    } else {
                        rule.current_value = Some("null".to_string());
                        rule.is_applied = Some(false);
                    }
                }
            } else if let Some(ref pkgs) = rule.packages {
                // If any of the bloatware packages in the rule are still actively enabled on device, it's not applied.
                // If all target packages are disabled or completely uninstalled/absent, the rule is APPLIED!
                let has_any_enabled = pkgs.iter().any(|pkg| enabled_packages.contains(pkg));
                rule.is_applied = Some(!has_any_enabled);
            }
        }
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

    /// Compute dynamic device health score and highly contextual recommendations based on live state
    pub fn calculate_dynamic_health_score(
        &self,
        device: &DeviceInfo,
        packages: &[PackageInfo],
        settings_global: &HashMap<String, String>,
        settings_system: &HashMap<String, String>,
        applied_tweaks: &[String],
    ) -> HealthScore {
        let battery_score: u32;
        let mut privacy_score: u32 = 65;
        let mut animation_score: u32 = 60;
        let mut recommendations = Vec::new();

        // 1. Live Check Animation Scales
        let anim_val = settings_global.get("window_animation_scale").map(|s| s.as_str()).unwrap_or("1.0");
        let is_anim_fast = anim_val == "0.5" || anim_val == "0.0" || anim_val == "0"
            || applied_tweaks.contains(&"gen_anim_scale_fast".to_string())
            || applied_tweaks.contains(&"gen_anim_scale_off".to_string());

        if is_anim_fast {
            animation_score = 100;
        } else {
            recommendations.push("Speed up UI animations to 0.5x for snappier UI response".to_string());
        }

        // 2. Live Check Display Panel & Refresh Rate Capability
        let max_supported_hz = device.display.supported_refresh_rates
            .iter()
            .cloned()
            .fold(60.0f32, f32::max);

        if max_supported_hz > 60.0 {
            let min_hz_setting = settings_system.get("min_refresh_rate").and_then(|v| v.parse::<f32>().ok()).unwrap_or(0.0);
            let is_high_hz_active = device.display.refresh_rate_hz >= (max_supported_hz - 2.0)
                || min_hz_setting >= (max_supported_hz - 2.0)
                || applied_tweaks.contains(&"gen_force_peak_refresh_rate".to_string());

            if is_high_hz_active {
                animation_score = (animation_score + 100) / 2;
            } else {
                recommendations.push(format!(
                    "Force {}Hz display refresh rate to eliminate frame drops",
                    max_supported_hz.round() as u32
                ));
            }
        }

        // 3. Live Check Private DNS
        let dns_mode = settings_global.get("private_dns_mode").map(|s| s.as_str()).unwrap_or("");
        let dns_spec = settings_global.get("private_dns_specifier").map(|s| s.as_str()).unwrap_or("");
        let is_dns_active = (dns_mode == "hostname" && !dns_spec.is_empty())
            || applied_tweaks.contains(&"gen_private_dns_cloudflare".to_string())
            || applied_tweaks.contains(&"gen_private_dns_adguard".to_string());

        if is_dns_active {
            privacy_score = 100;
        } else {
            recommendations.push("Enable AdGuard or Cloudflare Private DNS to block trackers & ads".to_string());
        }

        // 4. Live Check Battery & Wi-Fi Scan Throttling
        // Note: Aggressive Doze is an optional power-saving tweak that may delay messaging notifications (e.g. WhatsApp, Instagram).
        // To prevent penalizing standard notification delivery, not using Aggressive Doze does NOT reduce the score.
        let wifi_throttle = settings_global.get("wifi_scan_throttle_enabled").map(|s| s.as_str()).unwrap_or("1");
        let is_wifi_optimized = wifi_throttle == "0"
            || applied_tweaks.contains(&"gen_wifi_scan_throttling_disable".to_string());

        if is_wifi_optimized {
            battery_score = 100;
        } else {
            battery_score = 90;
            recommendations.push("Disable Wi-Fi background scan throttling to optimize standby power".to_string());
        }

        // 5. Live Check RAM & UI Blurs (for 4GB devices on Android 12+)
        if device.total_ram_mb <= 4500 && device.sdk_version >= 31 {
            let blurs_disabled = settings_global.get("disable_window_blurs").map(|s| s.as_str()).unwrap_or("0") == "1"
                || applied_tweaks.contains(&"gen_disable_window_blurs".to_string());
            if !blurs_disabled {
                recommendations.push("Disable real-time UI blur effects to free GPU and RAM memory".to_string());
            }
        }

        // 6. Live Check Bloatware & OEM Services
        let mut detected_bloat = 0;
        let mut has_joyose = false;
        let mut has_msa = false;
        let mut has_carousel = false;
        let mut has_gos = false;

        for p in packages {
            if p.bloat_category.is_some() && p.is_enabled {
                detected_bloat += 1;
                if p.package_name == "com.xiaomi.joyose" {
                    has_joyose = true;
                } else if p.package_name == "com.miui.msa.global" || p.package_name == "com.miui.analytics" {
                    has_msa = true;
                } else if p.package_name == "com.miui.android.fashiongallery" {
                    has_carousel = true;
                } else if p.package_name == "com.samsung.android.game.gos" {
                    has_gos = true;
                }
            }
        }

        if has_msa {
            recommendations.push("Disable Xiaomi MSA ad daemon and analytics trackers".to_string());
        }
        if has_joyose {
            recommendations.push("Disable Joyose background thermal throttler to uncap gaming FPS".to_string());
        }
        if has_carousel {
            recommendations.push("Disable Wallpaper Carousel lockscreen sponsored news feed".to_string());
        }
        if has_gos {
            recommendations.push("Disable Samsung GOS throttling in games".to_string());
        }

        let debloat_score = if detected_bloat == 0 {
            100
        } else {
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

    pub fn calculate_health_score(
        &self,
        device: &DeviceInfo,
        packages: &[PackageInfo],
        applied_tweaks: &[String],
    ) -> HealthScore {
        let dummy_global = HashMap::new();
        let dummy_system = HashMap::new();
        self.calculate_dynamic_health_score(device, packages, &dummy_global, &dummy_system, applied_tweaks)
    }

    pub fn is_package_whitelisted(&self, package: &str) -> bool {
        self.whitelist.contains(package)
    }
}
