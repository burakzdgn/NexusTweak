import { OptimizationProfile } from '../types/profiles';

export const DEFAULT_PROFILES: OptimizationProfile[] = [
  {
    id: 'gaming_ultra',
    name: 'Gaming & Ultra Performance',
    description:
      'Disables animation delays, locks peak 120Hz/144Hz refresh rate, bypasses OEM throttling daemons, and tunes DoH DNS for lowest multiplayer latency.',
    iconName: 'Gamepad2',
    badgeColor: 'amber',
    rulesToApply: [
      'generic_anim_05x',
      'generic_force_120hz',
      'generic_dns_cloudflare',
      'xiaomi_disable_joyose',
      'samsung_disable_gos',
    ],
    packagesToDebloat: ['com.xiaomi.joyose', 'com.samsung.android.game.gos'],
    settingsOverride: {
      window_animation_scale: '0.0',
      transition_animation_scale: '0.0',
      animator_duration_scale: '0.0',
      min_refresh_rate: '120.0',
      peak_refresh_rate: '120.0',
      private_dns_mode: 'hostname',
      private_dns_specifier: '1dot1dot1dot1.cloudflare-dns.com',
    },
  },
  {
    id: 'battery_extreme',
    name: 'Extreme Battery Saver',
    description:
      'Locks screen to standard 60Hz, enforces aggressive deep Doze standby sleep constants, enables Wi-Fi scan throttling, and suspends background analytics.',
    iconName: 'BatteryCharging',
    badgeColor: 'emerald',
    rulesToApply: [
      'generic_aggressive_doze',
      'generic_wifi_scan_throttle',
      'samsung_disable_knox_analytics',
      'xiaomi_disable_analytics',
    ],
    packagesToDebloat: [
      'com.miui.analytics',
      'com.samsung.android.rubin.app',
      'com.google.android.apps.tips',
    ],
    settingsOverride: {
      min_refresh_rate: '60.0',
      peak_refresh_rate: '60.0',
      window_animation_scale: '0.5',
    },
  },
  {
    id: 'privacy_hardened',
    name: 'Ultra Privacy & Telemetry Blocker',
    description:
      'Configures encrypted AdGuard Ad-Blocking DNS (DoT), strips diagnostic reporting daemons, disables lockscreen ad carousels, and blocks system ad pushers.',
    iconName: 'ShieldCheck',
    badgeColor: 'purple',
    rulesToApply: [
      'generic_dns_adguard',
      'xiaomi_disable_msa',
      'xiaomi_disable_carousel',
      'samsung_disable_bixby',
    ],
    packagesToDebloat: [
      'com.miui.msa.global',
      'com.miui.systemAdSolution',
      'com.miui.videoplayer',
      'com.samsung.android.bixby.agent',
    ],
    settingsOverride: {
      private_dns_mode: 'hostname',
      private_dns_specifier: 'dns.adguard-dns.com',
    },
  },
  {
    id: 'balanced_daily',
    name: 'Balanced Daily Driver',
    description:
      'Smooth 0.5x responsive UI transitions, adaptive dynamic refresh rates, Cloudflare encrypted privacy DNS, and safe bloatware isolation without altering system stability.',
    iconName: 'Cpu',
    badgeColor: 'cyan',
    rulesToApply: ['generic_anim_05x', 'generic_dns_cloudflare'],
    packagesToDebloat: [],
    settingsOverride: {
      window_animation_scale: '0.5',
      transition_animation_scale: '0.5',
      animator_duration_scale: '0.5',
      private_dns_mode: 'hostname',
      private_dns_specifier: '1dot1dot1dot1.cloudflare-dns.com',
    },
  },
];
