import { AdbDevice, DeviceInfo, HealthScore } from '../types/device';
import { PackageInfo } from '../types/debloat';
import { TweakRule } from '../types/tweaks';
import { BackupSnapshot } from '../types/backup';
import { AdbExecutionResult } from '../types/logs';
import { ScrcpyOptions } from '../types/mirror';
import { DiagnosticFixResult, DiagnosticReport } from '../types/diagnostics';

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
  product_name: 'spes',
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
    applyCommands: ['pm uninstall -k --user 0 com.miui.msa.global'],
    revertCommands: ['pm install-existing --user 0 com.miui.msa.global', 'pm enable com.miui.msa.global'],
    isApplied: true,
    tags: ['xiaomi', 'miui', 'ads', 'privacy'],
  },
  {
    id: 'xiaomi_mi_browser_debloat',
    name: 'Mi Browser (Mint & Global Browser)',
    description: 'Removes pre-installed Xiaomi Mi Browser loaded with search bar ads, tracking telemetry, and news feed notifications.',
    category: 'privacy',
    risk: 'Safe',
    targetOem: 'xiaomi',
    minSdk: 24,
    packages: ['com.mi.globalbrowser', 'com.android.browser'],
    applyCommands: ['pm uninstall -k --user 0 com.mi.globalbrowser'],
    revertCommands: ['pm install-existing --user 0 com.mi.globalbrowser', 'pm enable com.mi.globalbrowser'],
    isApplied: true,
    tags: ['xiaomi', 'browser', 'privacy', 'debloat'],
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
    applyCommands: ['pm uninstall -k --user 0 com.xiaomi.joyose'],
    revertCommands: ['pm install-existing --user 0 com.xiaomi.joyose', 'pm enable com.xiaomi.joyose'],
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
    applyCommands: ['pm uninstall -k --user 0 com.miui.android.fashiongallery'],
    revertCommands: ['pm install-existing --user 0 com.miui.android.fashiongallery', 'pm enable com.miui.android.fashiongallery'],
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
      return [{ serial: 'fa4fe52d', state: 'device', model: 'Redmi Note 11 (spes)', product: 'spes', device: 'spes', transport_id: '1' }];
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

  public static async runDeepDiagnostics(serial: string): Promise<DiagnosticReport> {
    if (!isTauriEnvironment()) {
      return {
        device_name: 'Xiaomi Redmi Note 11 (spes)',
        model: 'Redmi Note 11',
        manufacturer: 'Xiaomi',
        soc: 'Snapdragon 680 (SM6225)',
        android_version: 'Android 13',
        uptime_seconds: 1334474,
        uptime_formatted: '15 Gün 10 Saat 41 Dk',
        load_avg_1m: 16.35,
        load_avg_5m: 18.20,
        load_avg_15m: 19.58,
        cpu_core_count: 8,
        is_load_critical: true,
        total_ram_mb: 6144,
        free_ram_mb: 72,
        available_ram_mb: 410,
        zram_total_mb: 4096,
        zram_used_mb: 1620,
        is_ram_critical: true,
        system_server_cpu_time: '14.2% CPU (781 Saat)',
        storage_free_gb: 68.4,
        storage_total_gb: 128.0,
        storage_used_percent: 47,
        detected_issues: [
          {
            id: 'issue_high_load_avg',
            title: 'Aşırı Yüksek İşlemci Yük Kuyruğu (Load Average: 16.35 - 19.58)',
            severity: 'critical',
            description: '8 çekirdekli işlemcinizde normalde boşta yükün 1.0 - 2.5 arasında olması gerekirken şu an ortalama 16 ila 20 iş parçacığı sırada bekliyor.',
            technical_details: 'Snapdragon 680 ve eMMC/UFS depolama birimi arka plan telemetrisi ve I/O Wait darboğazı yaşıyor.',
            recommendation: 'Arka planda sürekli CPU ve disk sırası tüketen telemetri/bloatware servislerini kapatın.',
          },
          {
            id: 'issue_long_uptime',
            title: '15.4 Gündür Kesintisiz Çalışma (Uptime: 15 Gün 10 Saat)',
            severity: 'critical',
            description: 'Cihaz 15 gündür hiç yeniden başlatılmamış. Çekirdek süreç olan system_server 781 saatlik CPU süresi tüketmiş ve IPC kanalları tıkanmış durumda.',
            technical_details: '1.334.474 saniye kesintisiz çalışma sonrası bellek parçalanması (fragmentation) arayüzde mikro takılmalara neden olur.',
            recommendation: 'Optimizasyon işlemlerinden sonra cihazı bir kez yeniden başlatmak bellek kanallarını ve tamponları sıfırlayacaktır.',
          },
          {
            id: 'issue_zram_pressure',
            title: 'Kritik RAM Sıkışması ve ZRAM (Sanal Bellek) Baskısı',
            severity: 'critical',
            description: 'Fiziksel boş RAM yalnızca ~72 MB. Sistem bu açığı kapatmak için 4.09 GB ZRAM kullanıyor ve 1.62 GB sıkıştırılmış veri sürekli açılıp kapatılıyor.',
            technical_details: 'Zayıf CPU çekirdekleri belleği sürekli sıkıştırıp açmaktan arayüz animasyonlarına yetişemiyor ve takılmalar meydana geliyor.',
            recommendation: 'Arka plan servislerini temizleyin ve Ayarlar > Ek Ayarlar > Bellek Uzantısı (Sanal RAM) özelliğini kapatmayı değerlendirin.',
          },
          {
            id: 'issue_active_bloatware',
            title: 'Arka Planda 6 Adet Gereksiz Sistem & Telemetri Servisi Çalışıyor',
            severity: 'critical',
            description: 'Xiaomi arka plan servisleri ve gömülü Facebook/Amazon ajanları sürekli CPU ve RAM tüketiyor.',
            technical_details: 'com.miui.daemon (22+ saat CPU), com.miui.powerkeeper (23+ saat CPU), com.facebook.services, com.miui.android.fashiongallery, com.amazon.appmanager aktif.',
            recommendation: 'Tek tıkla otomatik güvenlik snapshot\'ı alarak bu servisleri güvenle devre dışı bırakın.',
          },
        ],
        top_cpu_processes: [
          { name: 'system_server', pid: 1450, cpu_percent: 14.2, user_or_system: 'System' },
          { name: 'com.miui.daemon', pid: 3120, cpu_percent: 6.8, user_or_system: 'User' },
          { name: 'com.miui.powerkeeper', pid: 3240, cpu_percent: 5.4, user_or_system: 'User' },
          { name: 'com.facebook.services', pid: 5612, cpu_percent: 3.9, user_or_system: 'User' },
          { name: 'com.miui.guardprovider', pid: 4890, cpu_percent: 3.1, user_or_system: 'System' },
        ],
        detected_bloat_processes: [
          { package_name: 'com.miui.daemon', app_name: 'MIUI Daemon Telemetry', description: 'Xiaomi arka plan sistem ve kullanım telemetrisi toplayıcısı', cpu_time_info: '22+ saat CPU', is_running: true, can_disable: true },
          { package_name: 'com.miui.powerkeeper', app_name: 'Xiaomi PowerKeeper', description: 'Arka planda gereksiz CPU tüketen agresif güç yöneticisi', cpu_time_info: '23+ saat CPU', is_running: true, can_disable: true },
          { package_name: 'com.miui.android.fashiongallery', app_name: 'Wallpaper Carousel', description: 'Kilit ekranı haber ve sponsorlu görsel beslemesi', cpu_time_info: 'Arka planda aktif', is_running: true, can_disable: true },
          { package_name: 'com.facebook.services', app_name: 'Facebook Services', description: 'Facebook kullanılmasa bile arka planda çalışan senkronizasyon', cpu_time_info: 'Arka planda aktif', is_running: true, can_disable: true },
          { package_name: 'com.amazon.appmanager', app_name: 'Amazon App Manager', description: 'Amazon arka plan telemetri ve indirme ajanı', cpu_time_info: 'Arka planda aktif', is_running: true, can_disable: true },
          { package_name: 'com.miui.msa.global', app_name: 'MIUI System Ads (MSA)', description: 'MIUI arayüz reklam motoru ve bildirim basıcı', cpu_time_info: 'Yüklü (Etkin)', is_running: true, can_disable: true },
        ],
        fix_actions: [
          {
            id: 'action_disable_detected_bloat',
            title: 'Tespit Edilen 6 Şişkinlik & Telemetri Servisini Kapat',
            action_type: 'debloat_batch',
            target_packages: [
              'com.miui.daemon',
              'com.miui.powerkeeper',
              'com.miui.android.fashiongallery',
              'com.facebook.services',
              'com.amazon.appmanager',
              'com.miui.msa.global',
            ],
            description: 'Otomatik güvenlik snapshot\'ı alır ve arka planda CPU/RAM tüketen gereksiz servisleri güvenle devre dışı bırakır.',
            is_recommended: true,
          },
          {
            id: 'action_reboot_device',
            title: 'Cihazı Yeniden Başlatarak Bellek Sızıntılarını Temizle',
            action_type: 'reboot_device',
            target_packages: [],
            description: '15 gün 10 saat süren kesintisiz çalışma sonrası system_server ve IPC bellek parçalanmasını sıfırlar.',
            is_recommended: true,
          },
        ],
      };
    }

    return await this.invoke<DiagnosticReport>('run_deep_diagnostics', { serial });
  }

  public static async executeDiagnosticFixes(
    serial: string,
    deviceName: string,
    packages: string[],
    reboot: boolean
  ): Promise<DiagnosticFixResult> {
    if (!isTauriEnvironment()) {
      return {
        success: true,
        snapshot_id: 'mock_diagnostic_snapshot_123',
        disabled_packages: packages,
        reboot_triggered: reboot,
        message: reboot
          ? 'Otomatik snapshot alındı, seçilen servisler kapatıldı ve cihaz yeniden başlatılıyor...'
          : 'Otomatik snapshot alındı ve seçilen tüm şişkinlik servisleri kapatıldı.',
      };
    }

    return await this.invoke<DiagnosticFixResult>('execute_diagnostic_fixes', {
      serial,
      deviceName,
      packages,
      reboot,
    });
  }
}
