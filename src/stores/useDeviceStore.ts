import { create } from 'zustand';
import { AdbDevice, DeviceInfo, HealthScore } from '../types/device';
import { AdbBridge } from '../services/adbBridge';
import { useLogStore } from './useLogStore';

interface DeviceState {
  devices: AdbDevice[];
  activeSerial: string | null;
  activeDevice: DeviceInfo | null;
  healthScore: HealthScore | null;
  isLoading: boolean;
  isScanning: boolean;
  isAdbAvailable: boolean;
  isInstallingAdb: boolean;
  error: string | null;

  // Actions
  fetchDevices: () => Promise<void>;
  selectDevice: (serial: string) => Promise<void>;
  refreshActiveDevice: () => Promise<void>;
  checkAdbInstalled: () => Promise<boolean>;
  downloadAndInstallAdb: () => Promise<boolean>;
  updateHealthScore: (appliedTweaks: string[]) => Promise<void>;
  rebootDevice: (mode?: string) => Promise<void>;
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: [],
  activeSerial: null,
  activeDevice: null,
  healthScore: null,
  isLoading: false,
  isScanning: false,
  isAdbAvailable: true,
  isInstallingAdb: false,
  error: null,

  checkAdbInstalled: async () => {
    try {
      const isOk = await AdbBridge.checkAdbStatus();
      set({ isAdbAvailable: isOk });
      return isOk;
    } catch {
      set({ isAdbAvailable: false });
      return false;
    }
  },

  downloadAndInstallAdb: async () => {
    set({ isInstallingAdb: true });
    useLogStore.getState().addLog('info', 'Downloading official Google Platform-Tools (ADB)...');

    try {
      const installedPath = await AdbBridge.downloadInstallAdb();
      set({ isInstallingAdb: false, isAdbAvailable: true });
      useLogStore.getState().addLog(
        'success',
        'ADB installed successfully',
        `Configured binary path: ${installedPath}`
      );
      await get().fetchDevices();
      return true;
    } catch (err: unknown) {
      set({ isInstallingAdb: false });
      useLogStore.getState().addLog(
        'error',
        'Failed to download ADB',
        err instanceof Error ? err.message : String(err)
      );
      return false;
    }
  },

  fetchDevices: async () => {
    set({ isScanning: true, error: null });
    try {
      await get().checkAdbInstalled();
      const devices = await AdbBridge.getDevices();
      set({ devices, isScanning: false });

      const { activeSerial } = get();
      if (!activeSerial || !devices.some((d) => d.serial === activeSerial)) {
        if (devices.length > 0) {
          await get().selectDevice(devices[0].serial);
        } else {
          set({ activeSerial: null, activeDevice: null, healthScore: null });
        }
      }
    } catch (err: unknown) {
      set({
        isScanning: false,
        error: err instanceof Error ? err.message : 'Failed to scan ADB devices',
      });
    }
  },

  selectDevice: async (serial: string) => {
    set({ activeSerial: serial, isLoading: true, error: null });
    try {
      const details = await AdbBridge.getDeviceDetails(serial);
      set({ activeDevice: details, isLoading: false });
      await get().updateHealthScore([]);
    } catch (err: unknown) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : `Failed to load specs for device ${serial}`,
      });
    }
  },

  refreshActiveDevice: async () => {
    const { activeSerial } = get();
    if (!activeSerial) return;
    try {
      const details = await AdbBridge.getDeviceDetails(activeSerial);
      set({ activeDevice: details });
    } catch (err) {
      console.error('Refresh device failed:', err);
    }
  },

  updateHealthScore: async (appliedTweaks: string[]) => {
    const { activeSerial } = get();
    if (!activeSerial) return;
    try {
      const score = await AdbBridge.calculateHealthScore(activeSerial, appliedTweaks);
      set({ healthScore: score });
    } catch (err) {
      console.error('Failed to calculate health score:', err);
    }
  },

  rebootDevice: async (mode?: string) => {
    const { activeSerial } = get();
    if (!activeSerial) return;
    await AdbBridge.reboot(activeSerial, mode);
  },
}));
