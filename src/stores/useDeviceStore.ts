import { create } from 'zustand';
import { AdbDevice, DeviceInfo, HealthScore } from '../types/device';
import { AdbBridge } from '../services/adbBridge';

interface DeviceState {
  devices: AdbDevice[];
  activeSerial: string | null;
  activeDevice: DeviceInfo | null;
  healthScore: HealthScore | null;
  isLoading: boolean;
  isScanning: boolean;
  isMockMode: boolean;
  error: string | null;

  // Actions
  fetchDevices: () => Promise<void>;
  selectDevice: (serial: string) => Promise<void>;
  refreshActiveDevice: () => Promise<void>;
  setMockMode: (enabled: boolean) => void;
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
  isMockMode: AdbBridge.isMockMode(),
  error: null,

  fetchDevices: async () => {
    set({ isScanning: true, error: null });
    try {
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

  setMockMode: (enabled: boolean) => {
    AdbBridge.setMockMode(enabled);
    set({ isMockMode: enabled });
    get().fetchDevices();
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
