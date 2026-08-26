export interface DiagnosticIssue {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  technical_details: string;
  recommendation: string;
}

export interface CpuProcessInfo {
  name: string;
  pid?: number;
  cpu_percent: number;
  user_or_system: string;
}

export interface DetectedBloatProcess {
  package_name: string;
  app_name: string;
  description: string;
  cpu_time_info?: string;
  is_running: boolean;
  can_disable: boolean;
}

export interface FixAction {
  id: string;
  title: string;
  action_type: 'debloat_batch' | 'reboot_device' | 'apply_tweak';
  target_packages: string[];
  target_tweak_id?: string;
  description: string;
  is_recommended: boolean;
}

export interface DiagnosticReport {
  device_name: string;
  model: string;
  manufacturer: string;
  soc: string;
  android_version: string;
  uptime_seconds: number;
  uptime_formatted: string;
  load_avg_1m: number;
  load_avg_5m: number;
  load_avg_15m: number;
  cpu_core_count: number;
  kernel_d_threads_count: number;
  user_d_threads_count: number;
  net_user_load_1m: number;
  soc_family: string;
  load_threshold: number;
  is_load_critical: boolean;
  total_ram_mb: number;
  free_ram_mb: number;
  available_ram_mb: number;
  zram_total_mb: number;
  zram_used_mb: number;
  is_ram_critical: boolean;
  is_virtual_ram_enabled: boolean;
  virtual_ram_size_gb?: number;
  system_server_cpu_time?: string;
  storage_free_gb: number;
  storage_total_gb: number;
  storage_used_percent: number;
  detected_issues: DiagnosticIssue[];
  top_cpu_processes: CpuProcessInfo[];
  detected_bloat_processes: DetectedBloatProcess[];
  fix_actions: FixAction[];
}

export interface DiagnosticFixResult {
  success: boolean;
  snapshot_id?: string;
  disabled_packages: string[];
  reboot_triggered: boolean;
  message: string;
}
