export interface AdbDevice {
  serial: string;
  state: string;
  model: string;
  product: string;
  device: string;
  transport_id: string;
  is_mock?: boolean;
}

export interface BatteryInfo {
  level: number;
  temperature_c: number;
  voltage_mv: number;
  health: string;
  status: string;
  plugged: string;
  technology: string;
}

export interface DisplayInfo {
  width: number;
  height: number;
  density_dpi: number;
  refresh_rate_hz: number;
  supported_refresh_rates: number[];
}

export interface DeviceInfo {
  serial: string;
  model: string;
  manufacturer: string;
  brand: string;
  product_name: string;
  device_codename: string;
  android_version: string;
  sdk_version: number;
  build_id: string;
  security_patch: string;
  soc_platform: string;
  soc_manufacturer: string;
  cpu_abi: string;
  total_ram_mb: number;
  available_ram_mb: number;
  is_rooted: boolean;
  selinux_enforcing: boolean;
  battery: BatteryInfo;
  display: DisplayInfo;
  is_mock?: boolean;
}

export interface HealthScore {
  total_score: number;
  battery_score: number;
  privacy_score: number;
  animation_score: number;
  debloat_score: number;
  recommendations: string[];
}
