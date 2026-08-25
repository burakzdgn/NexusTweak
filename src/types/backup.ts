export interface BackupSnapshot {
  id: string;
  device_serial: string;
  timestamp: string;
  note: string;
  settings_global: Record<string, string>;
  settings_system: Record<string, string>;
  settings_secure: Record<string, string>;
  disabled_packages: string[];
  uninstalled_packages: string[];
  applied_tweak_ids: string[];
}
