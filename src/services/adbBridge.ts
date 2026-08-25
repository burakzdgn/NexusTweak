import { AdbDevice, DeviceInfo, HealthScore } from '../types/device';
import { PackageInfo } from '../types/debloat';
import { TweakRule } from '../types/tweaks';
import { BackupSnapshot } from '../types/backup';
import { AdbExecutionResult } from '../types/logs';
import { mockAdbEngine } from './mockAdbEngine';

// Check if running inside Tauri desktop runtime
export const isTauriEnvironment = (): boolean => {
  return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
};

// Unified bridge client
export class AdbBridge {
  private static mockForced: boolean = false;

  public static setMockMode(enabled: boolean) {
    this.mockForced = enabled;
  }

  public static isMockMode(): boolean {
    return this.mockForced || !isTauriEnvironment();
  }

  private static async invoke<T>(command: string, args: Record<string, unknown> = {}): Promise<T> {
    if (this.isMockMode()) {
      throw new Error('Using mock mode fallback');
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<T>(command, args);
    } catch (e) {
      console.warn(`Tauri invoke '${command}' failed, falling back to mock engine:`, e);
      throw e;
    }
  }

  public static async getDevices(): Promise<AdbDevice[]> {
    if (!this.isMockMode()) {
      try {
        return await this.invoke<AdbDevice[]>('get_connected_devices');
      } catch {
        // Fallback to mock
      }
    }
    return await mockAdbEngine.getConnectedDevices();
  }

  public static async getDeviceDetails(serial: string): Promise<DeviceInfo> {
    if (!this.isMockMode() && !serial.startsWith('MOCK_')) {
      try {
        return await this.invoke<DeviceInfo>('get_device_details', { serial });
      } catch {
        // Fallback to mock
      }
    }
    return await mockAdbEngine.getDeviceDetails(serial);
  }

  public static async getInstalledPackages(serial: string): Promise<PackageInfo[]> {
    if (!this.isMockMode() && !serial.startsWith('MOCK_')) {
      try {
        return await this.invoke<PackageInfo[]>('get_installed_packages', { serial });
      } catch {
        // Fallback
      }
    }
    return await mockAdbEngine.getInstalledPackages(serial);
  }

  public static async getApplicableRules(serial: string): Promise<TweakRule[]> {
    if (!this.isMockMode() && !serial.startsWith('MOCK_')) {
      try {
        return await this.invoke<TweakRule[]>('get_applicable_rules', { serial });
      } catch {
        // Fallback
      }
    }
    return await mockAdbEngine.getApplicableRules(serial);
  }

  public static async applyTweak(
    serial: string,
    ruleId: string,
    autoBackup: boolean
  ): Promise<AdbExecutionResult[]> {
    if (!this.isMockMode() && !serial.startsWith('MOCK_')) {
      try {
        return await this.invoke<AdbExecutionResult[]>('apply_tweak', {
          serial,
          ruleId,
          autoBackup,
        });
      } catch {
        // Fallback
      }
    }
    return await mockAdbEngine.applyTweak(serial, ruleId, autoBackup);
  }

  public static async revertTweak(
    serial: string,
    ruleId: string
  ): Promise<AdbExecutionResult[]> {
    if (!this.isMockMode() && !serial.startsWith('MOCK_')) {
      try {
        return await this.invoke<AdbExecutionResult[]>('revert_tweak', {
          serial,
          ruleId,
        });
      } catch {
        // Fallback
      }
    }
    return await mockAdbEngine.revertTweak(serial, ruleId);
  }

  public static async applyBatchTweaks(
    serial: string,
    ruleIds: string[],
    autoBackup: boolean
  ): Promise<AdbExecutionResult[]> {
    if (!this.isMockMode() && !serial.startsWith('MOCK_')) {
      try {
        return await this.invoke<AdbExecutionResult[]>('apply_batch_tweaks', {
          serial,
          ruleIds,
          autoBackup,
        });
      } catch {
        // Fallback
      }
    }
    return await mockAdbEngine.applyBatchTweaks(serial, ruleIds, autoBackup);
  }

  public static async debloatPackage(
    serial: string,
    packageName: string,
    forceOverride: boolean
  ): Promise<AdbExecutionResult> {
    if (!this.isMockMode() && !serial.startsWith('MOCK_')) {
      try {
        return await this.invoke<AdbExecutionResult>('debloat_package', {
          serial,
          packageName,
          forceOverride,
        });
      } catch (err: unknown) {
        throw new Error(String(err));
      }
    }
    return await mockAdbEngine.debloatPackage(serial, packageName, forceOverride);
  }

  public static async restorePackage(
    serial: string,
    packageName: string
  ): Promise<AdbExecutionResult> {
    if (!this.isMockMode() && !serial.startsWith('MOCK_')) {
      try {
        return await this.invoke<AdbExecutionResult>('restore_package', {
          serial,
          packageName,
        });
      } catch {
        // Fallback
      }
    }
    return await mockAdbEngine.restorePackage(serial, packageName);
  }

  public static async createBackup(serial: string, note: string): Promise<BackupSnapshot> {
    if (!this.isMockMode() && !serial.startsWith('MOCK_')) {
      try {
        return await this.invoke<BackupSnapshot>('create_backup', {
          serial,
          note,
          appliedTweaks: [],
        });
      } catch {
        // Fallback
      }
    }
    return await mockAdbEngine.createBackup(serial, note);
  }

  public static async listBackups(serial?: string): Promise<BackupSnapshot[]> {
    if (!this.isMockMode()) {
      try {
        return await this.invoke<BackupSnapshot[]>('list_backups', { serial });
      } catch {
        // Fallback
      }
    }
    return await mockAdbEngine.listBackups(serial);
  }

  public static async restoreBackup(snapshotId: string): Promise<AdbExecutionResult[]> {
    if (!this.isMockMode() && !snapshotId.startsWith('MOCK_')) {
      try {
        return await this.invoke<AdbExecutionResult[]>('restore_backup', { snapshotId });
      } catch {
        // Fallback
      }
    }
    return await mockAdbEngine.restoreBackup(snapshotId);
  }

  public static async deleteBackup(snapshotId: string): Promise<void> {
    if (!this.isMockMode() && !snapshotId.startsWith('MOCK_')) {
      try {
        await this.invoke('delete_backup', { snapshotId });
        return;
      } catch {
        // Fallback
      }
    }
    await mockAdbEngine.deleteBackup(snapshotId);
  }

  public static async calculateHealthScore(
    serial: string,
    appliedTweaks: string[]
  ): Promise<HealthScore> {
    if (!this.isMockMode() && !serial.startsWith('MOCK_')) {
      try {
        return await this.invoke<HealthScore>('calculate_health_score', {
          serial,
          appliedTweaks,
        });
      } catch {
        // Fallback
      }
    }
    return await mockAdbEngine.calculateHealthScore(serial, appliedTweaks);
  }

  public static async runCustomCommand(
    serial: string,
    command: string
  ): Promise<AdbExecutionResult> {
    if (!this.isMockMode() && !serial.startsWith('MOCK_')) {
      try {
        return await this.invoke<AdbExecutionResult>('run_custom_command', {
          serial,
          command,
        });
      } catch {
        // Fallback
      }
    }
    return await mockAdbEngine.runCustomCommand(serial, command);
  }

  public static async reboot(serial: string, mode?: string): Promise<AdbExecutionResult> {
    if (!this.isMockMode() && !serial.startsWith('MOCK_')) {
      try {
        return await this.invoke<AdbExecutionResult>('reboot_device', { serial, mode });
      } catch {
        // Fallback
      }
    }
    return await mockAdbEngine.reboot(serial, mode);
  }
}
