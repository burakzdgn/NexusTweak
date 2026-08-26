use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdbDevice {
    pub serial: String,
    pub state: String,
    pub model: String,
    pub product: String,
    pub device: String,
    pub transport_id: String,
    pub is_mock: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatteryInfo {
    pub level: u32,
    pub temperature_c: f32,
    pub voltage_mv: u32,
    pub health: String,
    pub status: String,
    pub plugged: String,
    pub technology: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayInfo {
    pub width: u32,
    pub height: u32,
    pub density_dpi: u32,
    pub refresh_rate_hz: f32,
    pub supported_refresh_rates: Vec<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub serial: String,
    pub model: String,
    pub manufacturer: String,
    pub brand: String,
    pub product_name: String,
    pub device_codename: String,
    pub android_version: String,
    pub sdk_version: u32,
    pub build_id: String,
    pub security_patch: String,
    pub soc_platform: String,
    pub soc_manufacturer: String,
    pub cpu_abi: String,
    pub total_ram_mb: u64,
    pub available_ram_mb: u64,
    pub is_rooted: bool,
    pub selinux_enforcing: bool,
    pub battery: BatteryInfo,
    pub display: DisplayInfo,
    pub is_mock: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PackageInfo {
    pub package_name: String,
    pub apk_path: String,
    pub is_system: bool,
    pub is_enabled: bool,
    pub app_name: Option<String>,
    pub installer: Option<String>,
    pub is_whitelisted: bool,
    pub bloat_category: Option<String>,
    pub bloat_description: Option<String>,
    pub risk_level: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum RiskLevel {
    Safe,
    Moderate,
    Advanced,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TweakRule {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub risk: RiskLevel,
    pub target_oem: String,
    #[serde(default)]
    pub min_sdk: Option<u32>,
    #[serde(default)]
    pub max_sdk: Option<u32>,
    #[serde(default)]
    pub packages: Option<Vec<String>>,
    #[serde(default)]
    pub apply_commands: Vec<String>,
    #[serde(default)]
    pub revert_commands: Vec<String>,
    #[serde(default)]
    pub verify_command: Option<String>,
    #[serde(default)]
    pub expected_value: Option<String>,
    #[serde(default)]
    pub current_value: Option<String>,
    #[serde(default)]
    pub is_applied: Option<bool>,
    #[serde(default)]
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupSnapshot {
    pub id: String,
    pub device_serial: String,
    pub device_name: String,
    pub timestamp: String,
    pub note: String,
    pub settings_global: std::collections::HashMap<String, String>,
    pub settings_system: std::collections::HashMap<String, String>,
    pub settings_secure: std::collections::HashMap<String, String>,
    pub disabled_packages: Vec<String>,
    pub uninstalled_packages: Vec<String>,
    pub applied_tweak_ids: Vec<String>,
    pub target_properties_diff: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdbExecutionResult {
    pub success: bool,
    pub command: String,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
    pub execution_time_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HealthScore {
    pub total_score: u32,
    pub battery_score: u32,
    pub privacy_score: u32,
    pub animation_score: u32,
    pub debloat_score: u32,
    pub recommendations: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WhitelistEntry {
    pub package: String,
    pub reason: String,
    pub category: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticReport {
    pub device_name: String,
    pub model: String,
    pub manufacturer: String,
    pub soc: String,
    pub android_version: String,
    pub uptime_seconds: u64,
    pub uptime_formatted: String,
    pub load_avg_1m: f32,
    pub load_avg_5m: f32,
    pub load_avg_15m: f32,
    pub cpu_core_count: usize,
    pub is_load_critical: bool,
    pub total_ram_mb: u64,
    pub free_ram_mb: u64,
    pub available_ram_mb: u64,
    pub zram_total_mb: u64,
    pub zram_used_mb: u64,
    pub is_ram_critical: bool,
    pub system_server_cpu_time: Option<String>,
    pub storage_free_gb: f32,
    pub storage_total_gb: f32,
    pub storage_used_percent: u32,
    pub detected_issues: Vec<DiagnosticIssue>,
    pub top_cpu_processes: Vec<CpuProcessInfo>,
    pub detected_bloat_processes: Vec<DetectedBloatProcess>,
    pub fix_actions: Vec<FixAction>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticIssue {
    pub id: String,
    pub title: String,
    pub severity: String, // "critical" | "warning" | "info"
    pub description: String,
    pub technical_details: String,
    pub recommendation: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuProcessInfo {
    pub name: String,
    pub pid: Option<u32>,
    pub cpu_percent: f32,
    pub user_or_system: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectedBloatProcess {
    pub package_name: String,
    pub app_name: String,
    pub description: String,
    pub cpu_time_info: Option<String>,
    pub is_running: bool,
    pub can_disable: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FixAction {
    pub id: String,
    pub title: String,
    pub action_type: String, // "debloat_batch" | "reboot_device" | "apply_tweak"
    pub target_packages: Vec<String>,
    pub target_tweak_id: Option<String>,
    pub description: String,
    pub is_recommended: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticFixResult {
    pub success: bool,
    pub snapshot_id: Option<String>,
    pub disabled_packages: Vec<String>,
    pub reboot_triggered: bool,
    pub message: String,
}

