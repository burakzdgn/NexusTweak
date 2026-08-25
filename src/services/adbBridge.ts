import { AdbDevice, DeviceInfo, HealthScore } from '../types/device';
import { PackageInfo } from '../types/debloat';
import { TweakRule } from '../types/tweaks';
import { BackupSnapshot } from '../types/backup';
import { AdbExecutionResult } from '../types/logs';

// Check if running inside Tauri desktop runtime
export const isTauriEnvironment = (): boolean => {
  return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
};

export class AdbBridge {
  private static async invoke<T>(command: string, args: Record<string, unknown> = {}): Promise<T> {
    if (!isTauriEnvironment()) {
      console.warn(`[NexusTweak Web Mode] '${command}' called outside Tauri runtime.`);
      throw new Error('Tauri desktop runtime not detected. Run in desktop mode with `npm run tauri dev`.');
    }

    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<T>(command, args);
  }

  public static async checkAdbStatus(): Promise<boolean> {
    if (!isTauriEnvironment()) return false;
    try {
      return await this.invoke<boolean>('check_adb_status');
    } catch {
      return false;
    }
  }

  public static async downloadInstallAdb(): Promise<string> {
    return await this.invoke<string>('download_install_adb');
  }

  public static async getDevices(): Promise<AdbDevice[]> {
    if (!isTauriEnvironment()) return [];
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
