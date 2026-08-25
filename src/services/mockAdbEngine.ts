import { AdbDevice, DeviceInfo, HealthScore } from '../types/device';
import { PackageInfo } from '../types/debloat';
import { TweakRule } from '../types/tweaks';
import { BackupSnapshot } from '../types/backup';
import { AdbExecutionResult } from '../types/logs';
import { MOCK_DEVICES, MOCK_DEVICE_INFOS, MOCK_PACKAGES_DATA } from '../data/mockDevices';
import { getApplicableRulesForDevice } from '../data/rules';
import { isSystemWhitelisted } from '../data/rules/whitelist';

class MockAdbEngine {
  private devices: AdbDevice[] = [...MOCK_DEVICES];
  private currentSerial: string = 'MOCK_SAMSUNG_S24U';
  private appliedTweaks: Map<string, Set<string>> = new Map();
  private packageStates: Map<string, PackageInfo[]> = new Map();
  private backups: BackupSnapshot[] = [];

  constructor() {
    this.initDeviceState('MOCK_SAMSUNG_S24U');
    this.initDeviceState('MOCK_XIAOMI_14PRO');
    this.initDeviceState('MOCK_PIXEL_8PRO');

    // Create an initial sample backup
    this.backups.push({
      id: 'MOCK_SAMSUNG_S24U_20260824_120000',
      device_serial: 'MOCK_SAMSUNG_S24U',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      note: 'Initial Factory State Snapshot',
      settings_global: {
        window_animation_scale: '1.0',
        transition_animation_scale: '1.0',
        animator_duration_scale: '1.0',
      },
      settings_system: {
        peak_refresh_rate: '120.0',
      },
      settings_secure: {},
      disabled_packages: [],
      uninstalled_packages: [],
      applied_tweak_ids: [],
    });
  }

  private initDeviceState(serial: string) {
    this.appliedTweaks.set(serial, new Set());
    const basePkgs = MOCK_PACKAGES_DATA[serial] || [];
    this.packageStates.set(serial, JSON.parse(JSON.stringify(basePkgs)));
  }

  public async getConnectedDevices(): Promise<AdbDevice[]> {
    await this.delay(100);
    return [...this.devices];
  }

  public async getDeviceDetails(serial: string): Promise<DeviceInfo> {
    await this.delay(150);
    return MOCK_DEVICE_INFOS[serial] || MOCK_DEVICE_INFOS['MOCK_SAMSUNG_S24U'];
  }

  public async getInstalledPackages(serial: string): Promise<PackageInfo[]> {
    await this.delay(120);
    if (!this.packageStates.has(serial)) {
      this.initDeviceState(serial);
    }
    return [...(this.packageStates.get(serial) || [])];
  }

  public async getApplicableRules(serial: string): Promise<TweakRule[]> {
    const device = await this.getDeviceDetails(serial);
    const rules = getApplicableRulesForDevice(device);
    const applied = this.appliedTweaks.get(serial) || new Set();

    return rules.map((r) => ({
      ...r,
      isApplied: applied.has(r.id),
      currentValue: applied.has(r.id) ? r.expectedValue : '1.0',
    }));
  }

  public async applyTweak(
    serial: string,
    ruleId: string,
    autoBackup: boolean
  ): Promise<AdbExecutionResult[]> {
    await this.delay(200);

    if (autoBackup) {
      await this.createBackup(serial, `Auto-backup before tweak: ${ruleId}`);
    }

    if (!this.appliedTweaks.has(serial)) {
      this.appliedTweaks.set(serial, new Set());
    }
    this.appliedTweaks.get(serial)!.add(ruleId);

    return [
      {
        success: true,
        command: `settings put global ... [${ruleId}]`,
        stdout: `Tweak '${ruleId}' applied successfully on ${serial}.`,
        stderr: '',
        exit_code: 0,
        execution_time_ms: 45,
      },
    ];
  }

  public async revertTweak(serial: string, ruleId: string): Promise<AdbExecutionResult[]> {
    await this.delay(150);
    if (this.appliedTweaks.has(serial)) {
      this.appliedTweaks.get(serial)!.delete(ruleId);
    }

    return [
      {
        success: true,
        command: `settings revert ... [${ruleId}]`,
        stdout: `Tweak '${ruleId}' reverted to default on ${serial}.`,
        stderr: '',
        exit_code: 0,
        execution_time_ms: 38,
      },
    ];
  }

  public async applyBatchTweaks(
    serial: string,
    ruleIds: string[],
    autoBackup: boolean
  ): Promise<AdbExecutionResult[]> {
    await this.delay(300);

    if (autoBackup) {
      await this.createBackup(serial, `Batch tweak application (${ruleIds.length} tweaks)`);
    }

    const results: AdbExecutionResult[] = [];
    for (const id of ruleIds) {
      const res = await this.applyTweak(serial, id, false);
      results.push(...res);
    }
    return results;
  }

  public async debloatPackage(
    serial: string,
    packageName: string,
    forceOverride: boolean
  ): Promise<AdbExecutionResult> {
    await this.delay(200);

    if (isSystemWhitelisted(packageName) && !forceOverride) {
      throw new Error(`SECURITY WARNING: Package '${packageName}' is a critical OS component.`);
    }

    const pkgs = this.packageStates.get(serial) || [];
    const target = pkgs.find((p) => p.package_name === packageName);
    if (target) {
      target.is_enabled = false;
    }

    return {
      success: true,
      command: `pm disable-user --user 0 ${packageName}`,
      stdout: `Package ${packageName} disabled for user 0 [Simulation]`,
      stderr: '',
      exit_code: 0,
      execution_time_ms: 55,
    };
  }

  public async restorePackage(serial: string, packageName: string): Promise<AdbExecutionResult> {
    await this.delay(180);
    const pkgs = this.packageStates.get(serial) || [];
    const target = pkgs.find((p) => p.package_name === packageName);
    if (target) {
      target.is_enabled = true;
    }

    return {
      success: true,
      command: `pm enable ${packageName}`,
      stdout: `Package ${packageName} enabled [Simulation]`,
      stderr: '',
      exit_code: 0,
      execution_time_ms: 42,
    };
  }

  public async createBackup(serial: string, note: string): Promise<BackupSnapshot> {
    await this.delay(250);
    const applied = Array.from(this.appliedTweaks.get(serial) || []);
    const pkgs = this.packageStates.get(serial) || [];
    const disabled = pkgs.filter((p) => !p.is_enabled).map((p) => p.package_name);

    const snapshot: BackupSnapshot = {
      id: `${serial}_${Date.now()}`,
      device_serial: serial,
      timestamp: new Date().toISOString(),
      note: note || 'Manual state backup',
      settings_global: {
        window_animation_scale: applied.includes('gen_anim_scale_fast') ? '0.5' : '1.0',
        private_dns_mode: applied.includes('gen_private_dns_cloudflare') ? 'hostname' : 'off',
      },
      settings_system: {
        peak_refresh_rate: '120.0',
      },
      settings_secure: {},
      disabled_packages: disabled,
      uninstalled_packages: [],
      applied_tweak_ids: applied,
    };

    this.backups.unshift(snapshot);
    return snapshot;
  }

  public async listBackups(serial?: string): Promise<BackupSnapshot[]> {
    await this.delay(100);
    if (serial) {
      return this.backups.filter((b) => b.device_serial === serial);
    }
    return [...this.backups];
  }

  public async restoreBackup(snapshotId: string): Promise<AdbExecutionResult[]> {
    await this.delay(350);
    const snapshot = this.backups.find((b) => b.id === snapshotId);
    if (!snapshot) {
      throw new Error(`Backup ${snapshotId} not found`);
    }

    // Restore tweaks state
    this.appliedTweaks.set(snapshot.device_serial, new Set(snapshot.applied_tweak_ids));

    // Restore package states
    const pkgs = this.packageStates.get(snapshot.device_serial) || [];
    for (const pkg of pkgs) {
      pkg.is_enabled = !snapshot.disabled_packages.includes(pkg.package_name);
    }

    return [
      {
        success: true,
        command: `rollback snapshot ${snapshotId}`,
        stdout: `State restored successfully to backup snapshot ${snapshot.timestamp}`,
        stderr: '',
        exit_code: 0,
        execution_time_ms: 120,
      },
    ];
  }

  public async deleteBackup(snapshotId: string): Promise<void> {
    await this.delay(100);
    this.backups = this.backups.filter((b) => b.id !== snapshotId);
  }

  public async calculateHealthScore(
    serial: string,
    appliedTweakIds: string[]
  ): Promise<HealthScore> {
    const device = await this.getDeviceDetails(serial);
    const pkgs = await this.getInstalledPackages(serial);

    let battery_score = 70;
    let privacy_score = 65;
    let animation_score = 60;
    let debloat_score = 65;
    const recommendations: string[] = [];

    if (
      appliedTweakIds.includes('gen_anim_scale_fast') ||
      appliedTweakIds.includes('gen_anim_scale_off')
    ) {
      animation_score = 100;
    } else {
      recommendations.push('Speed up UI animations to 0.5x for snappier performance');
    }

    if (
      appliedTweakIds.includes('gen_private_dns_cloudflare') ||
      appliedTweakIds.includes('gen_private_dns_adguard')
    ) {
      privacy_score = 100;
    } else {
      recommendations.push('Enable AdGuard or Cloudflare Private DNS to block trackers & ads');
    }

    if (appliedTweakIds.includes('gen_aggressive_doze')) {
      battery_score = 95;
    } else {
      recommendations.push('Enable Aggressive Doze for enhanced standby battery savings');
    }

    const disabledBloat = pkgs.filter((p) => p.bloat_category && !p.is_enabled).length;
    const totalBloat = pkgs.filter((p) => p.bloat_category).length;

    if (totalBloat > 0 && disabledBloat === totalBloat) {
      debloat_score = 100;
    } else if (totalBloat > 0) {
      debloat_score = Math.max(45, 100 - (totalBloat - disabledBloat) * 10);
      recommendations.push(`Debloat ${totalBloat - disabledBloat} unnecessary background OEM packages`);
    } else {
      debloat_score = 100;
    }

    const total_score = Math.round(
      (battery_score + privacy_score + animation_score + debloat_score) / 4
    );

    return {
      total_score,
      battery_score,
      privacy_score,
      animation_score,
      debloat_score,
      recommendations,
    };
  }

  public async runCustomCommand(serial: string, cmd: string): Promise<AdbExecutionResult> {
    await this.delay(150);
    return {
      success: true,
      command: `adb -s ${serial} ${cmd}`,
      stdout: `Mock execution of '${cmd}' succeeded.\nOutput: [Device OK]`,
      stderr: '',
      exit_code: 0,
      execution_time_ms: 35,
    };
  }

  public async reboot(serial: string, mode?: string): Promise<AdbExecutionResult> {
    await this.delay(200);
    return {
      success: true,
      command: `adb -s ${serial} reboot ${mode || ''}`,
      stdout: `Device rebooting into ${mode || 'system'} mode...`,
      stderr: '',
      exit_code: 0,
      execution_time_ms: 45,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const mockAdbEngine = new MockAdbEngine();
