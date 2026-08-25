import { create } from 'zustand';
import { BackupSnapshot } from '../types/backup';
import { AdbBridge } from '../services/adbBridge';
import { useDeviceStore } from './useDeviceStore';
import { useLogStore } from './useLogStore';

interface BackupState {
  backups: BackupSnapshot[];
  isLoading: boolean;
  isRestoring: boolean;
  selectedBackupForDiff: BackupSnapshot | null;
  activeRollbackTarget: BackupSnapshot | null;

  // Actions
  fetchBackups: () => Promise<void>;
  createBackup: (note: string) => Promise<boolean>;
  restoreBackup: (snapshotId: string) => Promise<boolean>;
  deleteBackup: (snapshotId: string) => Promise<boolean>;
  setSelectedBackupForDiff: (b: BackupSnapshot | null) => void;
  setActiveRollbackTarget: (b: BackupSnapshot | null) => void;
}

export const useBackupStore = create<BackupState>((set, get) => ({
  backups: [],
  isLoading: false,
  isRestoring: false,
  selectedBackupForDiff: null,
  activeRollbackTarget: null,

  fetchBackups: async () => {
    const activeSerial = useDeviceStore.getState().activeSerial;
    set({ isLoading: true });
    try {
      const backups = await AdbBridge.listBackups(activeSerial || undefined);
      set({ backups, isLoading: false });
    } catch (err: unknown) {
      set({ isLoading: false });
      useLogStore.getState().addLog(
        'error',
        'Failed to fetch backups',
        err instanceof Error ? err.message : String(err)
      );
    }
  },

  createBackup: async (note: string) => {
    const activeDevice = useDeviceStore.getState().activeDevice;
    if (!activeDevice) return false;

    set({ isLoading: true });
    try {
      const deviceName = `${activeDevice.manufacturer} ${activeDevice.model}`;
      const snapshot = await AdbBridge.createBackup(
        activeDevice.serial,
        deviceName,
        note
      );
      useLogStore.getState().addLog(
        'success',
        'Created system snapshot',
        `Device: ${deviceName} | ID: ${snapshot.id}`
      );
      await get().fetchBackups();
      return true;
    } catch (err: unknown) {
      set({ isLoading: false });
      useLogStore.getState().addLog(
        'error',
        'Backup creation failed',
        err instanceof Error ? err.message : String(err)
      );
      return false;
    }
  },

  restoreBackup: async (snapshotId: string) => {
    set({ isRestoring: true });
    try {
      const results = await AdbBridge.restoreBackup(snapshotId);
      results.forEach((r) => {
        useLogStore.getState().addLog(
          r.success ? 'success' : 'error',
          'Rollback Restore',
          r.stdout || r.stderr
        );
      });
      set({ isRestoring: false, activeRollbackTarget: null });
      await useDeviceStore.getState().syncDeviceState();
      return true;
    } catch (err: unknown) {
      set({ isRestoring: false });
      useLogStore.getState().addLog(
        'error',
        'Rollback failed',
        err instanceof Error ? err.message : String(err)
      );
      return false;
    }
  },

  deleteBackup: async (snapshotId: string) => {
    try {
      await AdbBridge.deleteBackup(snapshotId);
      useLogStore.getState().addLog('info', 'Deleted snapshot', snapshotId);
      await get().fetchBackups();
      return true;
    } catch (err: unknown) {
      useLogStore.getState().addLog(
        'error',
        'Failed to delete snapshot',
        err instanceof Error ? err.message : String(err)
      );
      return false;
    }
  },

  setSelectedBackupForDiff: (b: BackupSnapshot | null) =>
    set({ selectedBackupForDiff: b }),
  setActiveRollbackTarget: (b: BackupSnapshot | null) =>
    set({ activeRollbackTarget: b }),
}));
