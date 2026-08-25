export interface OptimizationProfile {
  id: string;
  name: string;
  description: string;
  iconName: 'Gamepad2' | 'BatteryCharging' | 'ShieldCheck' | 'Cpu';
  badgeColor: 'amber' | 'emerald' | 'purple' | 'cyan';
  rulesToApply: string[];
  packagesToDebloat: string[];
  settingsOverride: {
    window_animation_scale?: string;
    transition_animation_scale?: string;
    animator_duration_scale?: string;
    peak_refresh_rate?: string;
    min_refresh_rate?: string;
    private_dns_mode?: string;
    private_dns_specifier?: string;
  };
}
