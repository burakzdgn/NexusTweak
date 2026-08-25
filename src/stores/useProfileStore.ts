import { create } from 'zustand';
import { OptimizationProfile } from '../types/profiles';
import { DEFAULT_PROFILES } from '../data/profiles';
import { AdbBridge } from '../services/adbBridge';
import { useDeviceStore } from './useDeviceStore';
import { useLogStore } from './useLogStore';
import { useTweaksStore } from './useTweaksStore';

interface ProfileState {
  profiles: OptimizationProfile[];
  activeProfileId: string | null;
  isApplying: boolean;
  selectedProfileForConfirm: OptimizationProfile | null;

  // Actions
  setSelectedProfileForConfirm: (profile: OptimizationProfile | null) => void;
  applyProfile: (profile: OptimizationProfile) => Promise<boolean>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: DEFAULT_PROFILES,
  activeProfileId: null,
  isApplying: false,
  selectedProfileForConfirm: null,

  setSelectedProfileForConfirm: (profile) => set({ selectedProfileForConfirm: profile }),

  applyProfile: async (profile) => {
    const activeDevice = useDeviceStore.getState().activeDevice;
    if (!activeDevice) return false;

    set({ isApplying: true });
    const deviceName = `${activeDevice.manufacturer} ${activeDevice.model}`;

    try {
      useLogStore.getState().addLog('info', `Applying profile: ${profile.name}`);

      // 1. Auto-Snapshot
      await AdbBridge.createBackup(
        activeDevice.serial,
        deviceName,
        `Auto-Snapshot before applying profile: ${profile.name}`
      );

      // 2. Apply Settings Overrides
      for (const [key, val] of Object.entries(profile.settingsOverride)) {
        if (!val) continue;
        if (key.includes('refresh_rate')) {
          await AdbBridge.runCustomCommand(
            activeDevice.serial,
            `settings put system ${key} ${val}`
          );
        } else if (key.includes('animation') || key.includes('dns')) {
          await AdbBridge.runCustomCommand(
            activeDevice.serial,
            `settings put global ${key} ${val}`
          );
        }
      }

      // 3. Debloat targeted packages safely
      for (const pkg of profile.packagesToDebloat) {
        try {
          await AdbBridge.debloatPackage(activeDevice.serial, deviceName, pkg, false, false);
        } catch {
          // Ignore if package not installed on this specific OEM
        }
      }

      useLogStore.getState().addLog(
        'success',
        `Profile ${profile.name} applied successfully!`,
        'All performance and DNS overrides active.'
      );

      set({ activeProfileId: profile.id, isApplying: false, selectedProfileForConfirm: null });
      await useTweaksStore.getState().fetchRulesForActiveDevice();
      return true;
    } catch (err: unknown) {
      set({ isApplying: false });
      useLogStore.getState().addLog(
        'error',
        `Failed to apply profile ${profile.name}`,
        err instanceof Error ? err.message : String(err)
      );
      return false;
    }
  },
}));
