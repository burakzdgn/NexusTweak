import { RiskLevel } from './tweaks';

export interface PackageInfo {
  package_name: string;
  apk_path: string;
  is_system: boolean;
  is_enabled: boolean;
  app_name?: string;
  installer?: string;
  is_whitelisted: boolean;
  bloat_category?: string;
  bloat_description?: string;
  risk_level?: RiskLevel;
}

export type DebloatFilter = 'all' | 'bloat' | 'system' | 'user' | 'disabled' | 'safe';
