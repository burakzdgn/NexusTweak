import { create } from 'zustand';
import { ScrcpyOptions } from '../types/mirror';
import { AdbBridge } from '../services/adbBridge';
import { useDeviceStore } from './useDeviceStore';
import { useLogStore } from './useLogStore';

interface MirrorState {
  isMirroring: boolean;
  isScrcpyAvailable: boolean;
  isInstallingScrcpy: boolean;
  options: ScrcpyOptions;

  // Actions
  checkScrcpyInstalled: () => Promise<boolean>;
  downloadAndInstallScrcpy: () => Promise<boolean>;
  setOption: <K extends keyof ScrcpyOptions>(key: K, value: ScrcpyOptions[K]) => void;
  startMirroring: () => Promise<boolean>;
  stopMirroring: () => Promise<boolean>;
}

export const useMirrorStore = create<MirrorState>((set, get) => ({
  isMirroring: false,
  isScrcpyAvailable: true,
  isInstallingScrcpy: false,
  options: {
    turn_screen_off: true,
    stay_awake: true,
    show_touches: false,
    max_fps: 60,
    bit_rate_mb: 8,
    record_to_file: false,
    always_on_top: false,
    no_audio: false,
    read_only: false,
  },

  checkScrcpyInstalled: async () => {
    try {
      const ok = await AdbBridge.checkScrcpyStatus();
      set({ isScrcpyAvailable: ok });
      return ok;
    } catch {
      set({ isScrcpyAvailable: false });
      return false;
    }
  },

  downloadAndInstallScrcpy: async () => {
    set({ isInstallingScrcpy: true });
    useLogStore.getState().addLog('info', 'Downloading official scrcpy release from GitHub...');

    try {
      const path = await AdbBridge.downloadInstallScrcpy();
      set({ isInstallingScrcpy: false, isScrcpyAvailable: true });
      useLogStore.getState().addLog(
        'success',
        'scrcpy installed successfully!',
        `Configured binary: ${path}`
      );
      return true;
    } catch (err: unknown) {
      set({ isInstallingScrcpy: false });
      useLogStore.getState().addLog(
        'error',
        'Failed to download scrcpy',
        err instanceof Error ? err.message : String(err)
      );
      return false;
    }
  },

  setOption: (key, value) => {
    set((state) => ({
      options: { ...state.options, [key]: value },
    }));
  },

  startMirroring: async () => {
    const activeSerial = useDeviceStore.getState().activeSerial;
    if (!activeSerial) return false;

    try {
      await get().checkScrcpyInstalled();
      useLogStore.getState().addLog(
        'info',
        `Launching scrcpy mirror session for ${activeSerial}...`,
        `Screen-off: ${get().options.turn_screen_off} | FPS: ${get().options.max_fps || 60}`
      );

      const ok = await AdbBridge.startScreenMirror(activeSerial, get().options);
      if (ok) {
        set({ isMirroring: true });
        useLogStore.getState().addLog('success', 'Screen Mirroring active!');
      }
      return ok;
    } catch (err: unknown) {
      useLogStore.getState().addLog(
        'error',
        'Could not start screen mirror',
        err instanceof Error ? err.message : String(err)
      );
      return false;
    }
  },

  stopMirroring: async () => {
    try {
      await AdbBridge.stopScreenMirror();
      set({ isMirroring: false });
      useLogStore.getState().addLog('info', 'Screen Mirror session closed.');
      return true;
    } catch (err: unknown) {
      useLogStore.getState().addLog('error', 'Stop mirror failed', String(err));
      return false;
    }
  },
}));
