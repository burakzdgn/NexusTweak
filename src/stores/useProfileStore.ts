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
    const oemLower = (activeDevice.manufacturer + ' ' + activeDevice.brand).toLowerCase();
    const isXiaomi = oemLower.includes('xiaomi') || oemLower.includes('redmi') || oemLower.includes('poco');
    const isSamsung = oemLower.includes('samsung');
    const maxHz = Math.max(60, ...activeDevice.display.supported_refresh_rates);
    const isLowRam = activeDevice.total_ram_mb <= 4500;

    try {
      useLogStore.getState().addLog('info', `Applying device-tuned profile: ${profile.name}`, `Customized for ${deviceName}`);

      // 1. Auto-Snapshot
      await AdbBridge.createBackup(
        activeDevice.serial,
        deviceName,
        `Auto-Snapshot before applying profile: ${profile.name}`
      );

      // 2. Dynamic Settings Overrides based on Device Hardware
      const dynamicSettings: Record<string, string> = { ...profile.settingsOverride };

      if (profile.id === 'gaming_ultra') {
        if (maxHz > 60) {
          dynamicSettings['min_refresh_rate'] = `${maxHz.toFixed(1)}`;
          dynamicSettings['peak_refresh_rate'] = `${maxHz.toFixed(1)}`;
        }
        if (isLowRam && activeDevice.sdk_version >= 31) {
          dynamicSettings['disable_window_blurs'] = '1';
        }
      } else if (profile.id === 'battery_extreme') {
        dynamicSettings['min_refresh_rate'] = '60.0';
        dynamicSettings['peak_refresh_rate'] = '60.0';
        dynamicSettings['device_idle_constants'] = 'inactive_to=120000,sensing_to=0,locating_to=0,location_accuracy=20.0,motion_inactive_to=0,idle_after_inactive_to=0,idle_pending_to=60000,max_idle_pending_to=120000,idle_pending_factor=2.0,idle_to=1800000,max_idle_to=21600000,idle_factor=2.0,min_time_to_alarm=3600000';
      } else if (profile.id === 'balanced_daily') {
        if (maxHz > 60) {
          dynamicSettings['peak_refresh_rate'] = `${maxHz.toFixed(1)}`;
          dynamicSettings['min_refresh_rate'] = '60.0';
        }
      }

      for (const [key, val] of Object.entries(dynamicSettings)) {
        if (!val) continue;
        if (key.includes('refresh_rate')) {
          await AdbBridge.runCustomCommand(
            activeDevice.serial,
            `settings put system ${key} ${val}`
          );
        } else {
          await AdbBridge.runCustomCommand(
            activeDevice.serial,
            `settings put global ${key} ${val}`
          );
        }
      }

      // 3. Dynamic OEM Debloat packages
      const targetedPackages = new Set<string>();
      if (profile.id === 'gaming_ultra') {
        if (isXiaomi) targetedPackages.add('com.xiaomi.joyose');
        if (isSamsung) targetedPackages.add('com.samsung.android.game.gos');
      } else if (profile.id === 'privacy_hardened') {
        if (isXiaomi) {
          targetedPackages.add('com.miui.msa.global');
          targetedPackages.add('com.miui.analytics');
          targetedPackages.add('com.miui.android.fashiongallery');
        }
        if (isSamsung) {
          targetedPackages.add('com.samsung.android.bixby.agent');
        }
      } else if (profile.id === 'battery_extreme') {
        if (isXiaomi) targetedPackages.add('com.miui.analytics');
        if (isSamsung) targetedPackages.add('com.samsung.android.rubin.app');
      }

      for (const pkg of targetedPackages) {
        try {
          await AdbBridge.debloatPackage(activeDevice.serial, deviceName, pkg, false, false);
        } catch {
          // Ignore if package not present on specific device build
        }
      }

      useLogStore.getState().addLog(
        'success',
        `Tuned profile ${profile.name} applied successfully!`,
        `Optimized for ${deviceName} (${maxHz}Hz display, OEM-specific parameters).`
      );

      set({ activeProfileId: profile.id, isApplying: false, selectedProfileForConfirm: null });
      await useDeviceStore.getState().syncDeviceState();
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
