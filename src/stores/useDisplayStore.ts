import { create } from 'zustand';
import { ResolutionPreset, DensityPreset } from '../types/display';
import { AdbBridge } from '../services/adbBridge';
import { useDeviceStore } from './useDeviceStore';
import { useLogStore } from './useLogStore';

interface DisplayState {
  resolutionPresets: ResolutionPreset[];
  densityPresets: DensityPreset[];
  customWidth: number;
  customHeight: number;
  customDensity: number;
  isApplying: boolean;

  // Actions
  setCustomWidth: (w: number) => void;
  setCustomHeight: (h: number) => void;
  setCustomDensity: (d: number) => void;
  applyResolution: (width?: number, height?: number) => Promise<boolean>;
  resetResolution: () => Promise<boolean>;
  applyDensity: (density?: number) => Promise<boolean>;
  resetDensity: () => Promise<boolean>;
}

export const useDisplayStore = create<DisplayState>((set, get) => ({
  resolutionPresets: [
    { label: 'FHD+ (1080 × 2400)', width: 1080, height: 2400, description: 'Standard high-definition balance' },
    { label: 'QHD+ (1440 × 3200)', width: 1440, height: 3200, description: 'Ultra high sharpness & detail' },
    { label: 'HD+ (720 × 1600)', width: 720, height: 1600, description: 'Max FPS gaming & ultra battery' },
  ],
  densityPresets: [
    { label: 'Compact / Dense', density: 380, description: 'More screen real-estate & text' },
    { label: 'Standard UI', density: 440, description: 'Balanced UI scaling' },
    { label: 'Tablet / Desktop Mode', density: 320, description: 'Forces dual-pane tablet layout in apps' },
  ],
  customWidth: 1080,
  customHeight: 2400,
  customDensity: 440,
  isApplying: false,

  setCustomWidth: (w) => set({ customWidth: w }),
  setCustomHeight: (h) => set({ customHeight: h }),
  setCustomDensity: (d) => set({ customDensity: d }),

  applyResolution: async (width, height) => {
    const activeSerial = useDeviceStore.getState().activeSerial;
    if (!activeSerial) return false;

    const targetW = width || get().customWidth;
    const targetH = height || get().customHeight;

    set({ isApplying: true });
    try {
      useLogStore.getState().addLog('info', `Setting resolution to ${targetW}x${targetH}...`);
      const res = await AdbBridge.setScreenResolution(activeSerial, targetW, targetH);

      if (res.success) {
        useLogStore.getState().addLog('success', `Resolution updated to ${targetW}x${targetH}`, res.stdout);
        await useDeviceStore.getState().refreshActiveDevice();
      } else {
        useLogStore.getState().addLog('error', 'Resolution change failed', res.stderr);
      }
      set({ isApplying: false });
      return res.success;
    } catch (err: unknown) {
      set({ isApplying: false });
      useLogStore.getState().addLog('error', 'Resolution error', String(err));
      return false;
    }
  },

  resetResolution: async () => {
    const activeSerial = useDeviceStore.getState().activeSerial;
    if (!activeSerial) return false;

    set({ isApplying: true });
    try {
      const res = await AdbBridge.resetScreenResolution(activeSerial);
      useLogStore.getState().addLog('info', 'Screen resolution reset to native default', res.stdout);
      await useDeviceStore.getState().refreshActiveDevice();
      set({ isApplying: false });
      return true;
    } catch (err: unknown) {
      set({ isApplying: false });
      useLogStore.getState().addLog('error', 'Reset resolution failed', String(err));
      return false;
    }
  },

  applyDensity: async (density) => {
    const activeSerial = useDeviceStore.getState().activeSerial;
    if (!activeSerial) return false;

    const targetD = density || get().customDensity;

    set({ isApplying: true });
    try {
      useLogStore.getState().addLog('info', `Setting density to ${targetD} DPI...`);
      const res = await AdbBridge.setScreenDensity(activeSerial, targetD);

      if (res.success) {
        useLogStore.getState().addLog('success', `DPI updated to ${targetD}`, res.stdout);
        await useDeviceStore.getState().refreshActiveDevice();
      } else {
        useLogStore.getState().addLog('error', 'Density change failed', res.stderr);
      }
      set({ isApplying: false });
      return res.success;
    } catch (err: unknown) {
      set({ isApplying: false });
      useLogStore.getState().addLog('error', 'Density error', String(err));
      return false;
    }
  },

  resetDensity: async () => {
    const activeSerial = useDeviceStore.getState().activeSerial;
    if (!activeSerial) return false;

    set({ isApplying: true });
    try {
      const res = await AdbBridge.resetScreenDensity(activeSerial);
      useLogStore.getState().addLog('info', 'Screen density reset to native DPI', res.stdout);
      await useDeviceStore.getState().refreshActiveDevice();
      set({ isApplying: false });
      return true;
    } catch (err: unknown) {
      set({ isApplying: false });
      useLogStore.getState().addLog('error', 'Reset density failed', String(err));
      return false;
    }
  },
}));
