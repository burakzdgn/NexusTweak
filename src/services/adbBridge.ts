import { AdbDevice, DeviceInfo, HealthScore } from '../types/device';
import { PackageInfo } from '../types/debloat';
import { TweakRule } from '../types/tweaks';
import { BackupSnapshot } from '../types/backup';
import { AdbExecutionResult } from '../types/logs';
import { ScrcpyOptions } from '../types/mirror';

// Check if running inside Tauri desktop runtime
export const isTauriEnvironment = (): boolean => {
  return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
};

const MOCK_DEVICE: DeviceInfo = {
  serial: 'fa4fe52d',
  manufacturer: 'Xiaomi',
  model: 'Redmi Note 11',
  brand: 'Redmi',
  device_codename: 'spes',
  android_version: '13',
  sdk_version: 33,
  build_id: 'TKQ1.221114.001',
  security_patch: '2024-03-01',
  soc_platform: 'Snapdragon 680 (SM6225)',
  soc_manufacturer: 'Qualcomm',
  cpu_abi: 'arm64-v8a',
  total_ram_mb: 6144,
  available_ram_mb: 3120,
  is_rooted: false,
  selinux_enforcing: true,
  battery: {
    level: 88,
    temperature_c: 31.8,
    voltage_mv: 4160,
    health: 'Good',
    status: 'Discharging',
    plugged: 'Battery (Unplugged)',
    technology: 'Li-poly',
  },
  display: {
    width: 1080,
    height: 2400,
    density_dpi: 440,
    refresh_rate_hz: 90,
    supported_refresh_rates: [60, 90],
  },
  is_mock: false,
};

const MOCK_RULES: TweakRule[] = [
  {
    id: 'gen_anim_scale_fast',
    name: 'Super Fast Animations (0.5x)',
    description: 'Reduces window, transition, and animator duration scales to 0.5x for instantly snappier UI response.',
    category: 'animations',
    risk: 'Safe',
    targetOem: 'generic',
    minSdk: 21,
    applyCommands: ['settings put global window_animation_scale 0.5'],
    revertCommands: ['settings put global window_animation_scale 1.0'],
    verifyCommand: 'settings get global window_animation_scale',
    expectedValue: '0.5',
    currentValue: '0.5',
    isApplied: true,
    tags: ['performance', 'ui', 'animations'],
  },
  {
    id: 'gen_force_peak_refresh_rate',
    name: 'Force Peak High Refresh Rate (90Hz)',
    description: 'Locks min_refresh_rate to peak_refresh_rate (90Hz) preventing screen from dropping to 60Hz.',
    category: 'display',
    risk: 'Safe',
    targetOem: 'generic',
    minSdk: 29,
    applyCommands: ['settings put system min_refresh_rate 90.0'],
    revertCommands: ['settings delete system min_refresh_rate'],
    verifyCommand: 'settings get system min_refresh_rate',
    expectedValue: '90.0',
    currentValue: '90.0',
    isApplied: true,
    tags: ['display', 'fluidity', '90hz'],
  },
  {
    id: 'gen_private_dns_adguard',
    name: 'AdGuard Ad-Blocking DoT DNS',
    description: 'Routes system DNS queries through AdGuard to block malware, telemetry, and in-app banner ads.',
    category: 'privacy',
    risk: 'Safe',
    targetOem: 'generic',
    minSdk: 28,
    applyCommands: ['settings put global private_dns_mode hostname'],
    revertCommands: ['settings put global private_dns_mode opportunistic'],
    verifyCommand: 'settings get global private_dns_specifier',
    expectedValue: 'dns.adguard.com',
    currentValue: 'dns.adguard.com',
    isApplied: true,
    tags: ['privacy', 'adblock', 'dns', 'adguard'],
  },
  {
    id: 'gen_aggressive_doze',
    name: 'Aggressive Doze & Deep Sleep',
    description: 'Tunes device_idle constants to enter deep sleep battery saving mode faster when screen is off.',
    category: 'battery',
    risk: 'Moderate',
    targetOem: 'generic',
    minSdk: 23,
    applyCommands: ['settings put global device_idle_constants inactive_to=120000'],
    revertCommands: ['settings delete global device_idle_constants'],
    verifyCommand: 'settings get global device_idle_constants',
    expectedValue: 'inactive_to=120000',
    currentValue: 'inactive_to=120000',
    isApplied: true,
    tags: ['battery', 'doze', 'standby'],
  },
  {
    id: 'gen_wifi_scan_throttling_disable',
    name: 'Disable Wi-Fi Scan Throttling',
    description: 'Allows continuous Wi-Fi background scanning for faster network handoffs and precise Wi-Fi RSSI reporting.',
    category: 'network',
    risk: 'Moderate',
    targetOem: 'generic',
    minSdk: 28,
    applyCommands: ['settings put global wifi_scan_throttle_enabled 0'],
    revertCommands: ['settings put global wifi_scan_throttle_enabled 1'],
    verifyCommand: 'settings get global wifi_scan_throttle_enabled',
    expectedValue: '0',
    currentValue: '0',
    isApplied: true,
    tags: ['network', 'wifi', 'developer'],
  },
  {
    id: 'xiaomi_msa_ad_services_debloat',
    name: 'MIUI System Ads (MSA) Daemon',
    description: 'Completely stops MIUI/HyperOS system advertisement daemon and telemetry tracking agent.',
    category: 'privacy',
    risk: 'Safe',
    targetOem: 'xiaomi',
    minSdk: 24,
    packages: ['com.miui.msa.global', 'com.miui.analytics'],
    applyCommands: ['pm disable-user --user 0 com.miui.msa.global'],
    revertCommands: ['pm enable com.miui.msa.global'],
    isApplied: true,
    tags: ['xiaomi', 'miui', 'ads', 'privacy'],
  },
  {
    id: 'xiaomi_joyose_throttling_disable',
    name: 'Joyose Performance Throttler',
    description: 'Disables Xiaomi Joyose background thermal throttler that aggressively caps frame rates in games.',
    category: 'performance',
    risk: 'Moderate',
    targetOem: 'xiaomi',
    minSdk: 26,
    packages: ['com.xiaomi.joyose'],
    applyCommands: ['pm disable-user --user 0 com.xiaomi.joyose'],
    revertCommands: ['pm enable com.xiaomi.joyose'],
    isApplied: true,
    tags: ['xiaomi', 'joyose', 'fps', 'gaming'],
  },
  {
    id: 'xiaomi_wallpaper_carousel_debloat',
    name: 'Wallpaper Carousel (Glance Lockscreen Ads)',
    description: 'Removes lockscreen dynamic news feed and sponsored wallpapers that consume mobile data.',
    category: 'privacy',
    risk: 'Safe',
    targetOem: 'xiaomi',
    minSdk: 26,
    packages: ['com.miui.android.fashiongallery'],
    applyCommands: ['pm disable-user --user 0 com.miui.android.fashiongallery'],
    revertCommands: ['pm enable com.miui.android.fashiongallery'],
    isApplied: true,
    tags: ['xiaomi', 'lockscreen', 'ads'],
  },
];

export class AdbBridge {
  private static async invoke<T>(command: string, args: Record<string, unknown> = {}): Promise<T> {
    if (!isTauriEnvironment()) {
      if (command === 'get_connected_devices') {
        return [{ serial: 'fa4fe52d', state: 'device', model: 'Redmi Note 11 (spes)', product: 'spes' }] as unknown as T;
      }
      if (command === 'get_device_details') {
        return MOCK_DEVICE as unknown as T;
      }
      if (command === 'get_applicable_rules') {
        return MOCK_RULES as unknown as T;
      }
      if (command === 'calculate_health_score') {
        return {
          total_score: 100,
          battery_score: 100,
          privacy_score: 100,
          animation_score: 100,
          debloat_score: 100,
          recommendations: [],
        } as unknown as T;
      }
      if (command === 'get_installed_packages') {
        return [
          { package_name: 'com.miui.msa.global', apk_path: '/system/app/MSA/MSA.apk', is_system: true, is_enabled: false, app_name: 'MSA', is_whitelisted: false, bloat_category: 'Analytics & Telemetry', bloat_description: 'MIUI System Advertising Daemon', risk_level: 'Safe' },
          { package_name: 'com.xiaomi.joyose', apk_path: '/system/priv-app/Joyose/Joyose.apk', is_system: true, is_enabled: false, app_name: 'Joyose', is_whitelisted: false, bloat_category: 'Thermal Throttling', bloat_description: 'Joyose Performance & FPS Throttler', risk_level: 'Moderate' },
          { package_name: 'com.miui.android.fashiongallery', apk_path: '/system/app/FashionGallery.apk', is_system: true, is_enabled: false, app_name: 'Wallpaper Carousel', is_whitelisted: false, bloat_category: 'Lockscreen Ads', bloat_description: 'Sponsored lockscreen wallpaper feed', risk_level: 'Safe' },
          { package_name: 'com.miui.videoplayer', apk_path: '/system/app/MiVideo/MiVideo.apk', is_system: true, is_enabled: true, app_name: 'Mi Video', is_whitelisted: false, bloat_category: 'OEM Bloatware', bloat_description: 'Xiaomi promotional video player', risk_level: 'Safe' },
          { package_name: 'com.miui.player', apk_path: '/system/app/Music/Music.apk', is_system: true, is_enabled: true, app_name: 'Mi Music', is_whitelisted: false, bloat_category: 'OEM Bloatware', bloat_description: 'Xiaomi online music streaming bloat', risk_level: 'Safe' },
          { package_name: 'com.spotify.music', apk_path: '/data/app/com.spotify.music/base.apk', is_system: false, is_enabled: true, app_name: 'Spotify', is_whitelisted: false, bloat_category: undefined, bloat_description: undefined, risk_level: undefined },
          { package_name: 'com.whatsapp', apk_path: '/data/app/com.whatsapp/base.apk', is_system: false, is_enabled: true, app_name: 'WhatsApp', is_whitelisted: false, bloat_category: undefined, bloat_description: undefined, risk_level: undefined },
        ] as unknown as T;
      }
      if (command === 'list_backups') {
        return [
          {
            id: 'backup_fa4fe52d_1716210000',
            serial: 'fa4fe52d',
            device_name: 'Xiaomi Redmi Note 11',
            timestamp: 1716210000,
            note: 'Auto-Snapshot before applying 100/100 optimization rules',
            global_settings: { window_animation_scale: '1.0', private_dns_mode: 'off' },
            system_settings: { min_refresh_rate: '60.0' },
            secure_settings: {},
            disabled_packages: ['com.miui.msa.global'],
          }
        ] as unknown as T;
      }
      return true as unknown as T;
    }

    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<T>(command, args);
  }

  public static async checkAdbStatus(): Promise<boolean> {
    if (!isTauriEnvironment()) return true;
    try {
      return await this.invoke<boolean>('check_adb_status');
    } catch {
      return true;
    }
  }

  public static async downloadInstallAdb(): Promise<string> {
    return await this.invoke<string>('download_install_adb');
  }

  public static async checkScrcpyStatus(): Promise<boolean> {
    if (!isTauriEnvironment()) return false;
    try {
      return await this.invoke<boolean>('check_scrcpy_status');
    } catch {
      return false;
    }
  }

  public static async downloadInstallScrcpy(): Promise<string> {
    return await this.invoke<string>('download_install_scrcpy');
  }

  public static async startScreenMirror(
    serial: string,
    options: ScrcpyOptions
  ): Promise<boolean> {
    return await this.invoke<boolean>('start_screen_mirror', { serial, options });
  }

  public static async stopScreenMirror(): Promise<boolean> {
    return await this.invoke<boolean>('stop_screen_mirror');
  }

  public static async isScreenMirrorRunning(): Promise<boolean> {
    if (!isTauriEnvironment()) return false;
    try {
      return await this.invoke<boolean>('is_screen_mirror_running');
    } catch {
      return false;
    }
  }

  public static async getDevices(): Promise<AdbDevice[]> {
    if (!isTauriEnvironment()) {
      return [{ serial: 'fa4fe52d', state: 'device', model: 'Redmi Note 11 (spes)', product: 'spes' }];
    }
    try {
      return await this.invoke<AdbDevice[]>('get_connected_devices');
    } catch (e) {
      console.error('get_connected_devices error:', e);
      return [];
    }
  }

  public static async getDeviceDetails(serial: string): Promise<DeviceInfo> {
    return await this.invoke<DeviceInfo>('get_device_details', { serial });
  }

  public static async getInstalledPackages(serial: string): Promise<PackageInfo[]> {
    return await this.invoke<PackageInfo[]>('get_installed_packages', { serial });
  }

  public static async installApk(serial: string, apkPath: string): Promise<AdbExecutionResult> {
    return await this.invoke<AdbExecutionResult>('install_apk', { serial, apkPath });
  }

  public static async extractApk(
    serial: string,
    packageName: string,
    destFolder?: string
  ): Promise<AdbExecutionResult> {
    return await this.invoke<AdbExecutionResult>('extract_apk', {
      serial,
      packageName,
      destFolder,
    });
  }

  public static async setScreenResolution(
    serial: string,
    width: number,
    height: number
  ): Promise<AdbExecutionResult> {
    return await this.invoke<AdbExecutionResult>('set_screen_resolution', {
      serial,
      width,
      height,
    });
  }

  public static async resetScreenResolution(serial: string): Promise<AdbExecutionResult> {
    return await this.invoke<AdbExecutionResult>('reset_screen_resolution', { serial });
  }

  public static async setScreenDensity(
    serial: string,
    density: number
  ): Promise<AdbExecutionResult> {
    return await this.invoke<AdbExecutionResult>('set_screen_density', {
      serial,
      density,
    });
  }

  public static async resetScreenDensity(serial: string): Promise<AdbExecutionResult> {
    return await this.invoke<AdbExecutionResult>('reset_screen_density', { serial });
  }

  public static async getApplicableRules(serial: string): Promise<TweakRule[]> {
    return await this.invoke<TweakRule[]>('get_applicable_rules', { serial });
  }

  public static async applyTweak(
    serial: string,
    deviceName: string,
    ruleId: string,
    autoBackup: boolean
  ): Promise<AdbExecutionResult[]> {
    return await this.invoke<AdbExecutionResult[]>('apply_tweak', {
      serial,
      deviceName,
      ruleId,
      autoBackup,
    });
  }

  public static async revertTweak(
    serial: string,
    ruleId: string
  ): Promise<AdbExecutionResult[]> {
    return await this.invoke<AdbExecutionResult[]>('revert_tweak', {
      serial,
      ruleId,
    });
  }

  public static async applyBatchTweaks(
    serial: string,
    deviceName: string,
    ruleIds: string[],
    autoBackup: boolean
  ): Promise<AdbExecutionResult[]> {
    return await this.invoke<AdbExecutionResult[]>('apply_batch_tweaks', {
      serial,
      deviceName,
      ruleIds,
      autoBackup,
    });
  }

  public static async debloatPackage(
    serial: string,
    deviceName: string,
    packageName: string,
    forceOverride: boolean,
    autoBackup: boolean
  ): Promise<AdbExecutionResult> {
    return await this.invoke<AdbExecutionResult>('debloat_package', {
      serial,
      deviceName,
      packageName,
      forceOverride,
      autoBackup,
    });
  }

  public static async restorePackage(
    serial: string,
    packageName: string
  ): Promise<AdbExecutionResult> {
    return await this.invoke<AdbExecutionResult>('restore_package', {
      serial,
      packageName,
    });
  }

  public static async createBackup(
    serial: string,
    deviceName: string,
    note: string
  ): Promise<BackupSnapshot> {
    return await this.invoke<BackupSnapshot>('create_backup', {
      serial,
      deviceName,
      note,
      appliedTweaks: [],
    });
  }

  public static async listBackups(serial?: string): Promise<BackupSnapshot[]> {
    if (!isTauriEnvironment()) return [];
    try {
      return await this.invoke<BackupSnapshot[]>('list_backups', { serial });
    } catch {
      return [];
    }
  }

  public static async restoreBackup(snapshotId: string): Promise<AdbExecutionResult[]> {
    return await this.invoke<AdbExecutionResult[]>('restore_backup', { snapshotId });
  }

  public static async deleteBackup(snapshotId: string): Promise<void> {
    await this.invoke('delete_backup', { snapshotId });
  }

  public static async calculateHealthScore(
    serial: string,
    appliedTweaks: string[]
  ): Promise<HealthScore> {
    return await this.invoke<HealthScore>('calculate_health_score', {
      serial,
      appliedTweaks,
    });
  }

  public static async runCustomCommand(
    serial: string,
    command: string
  ): Promise<AdbExecutionResult> {
    return await this.invoke<AdbExecutionResult>('run_custom_command', {
      serial,
      command,
    });
  }

  public static async reboot(serial: string, mode?: string): Promise<AdbExecutionResult> {
    return await this.invoke<AdbExecutionResult>('reboot_device', { serial, mode });
  }

  public static async connectWifi(ipPort: string): Promise<AdbExecutionResult> {
    return await this.invoke<AdbExecutionResult>('connect_wifi_device', { ipPort });
  }

  public static async setCustomAdbPath(path: string): Promise<string> {
    return await this.invoke<string>('set_custom_adb_path', { path });
  }
}
