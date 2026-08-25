import { create } from 'zustand';
import { QueuedApk, ExtractedApkResult } from '../types/apk';
import { AdbBridge } from '../services/adbBridge';
import { useDeviceStore } from './useDeviceStore';
import { useLogStore } from './useLogStore';

interface ApkState {
  apkQueue: QueuedApk[];
  isInstalling: boolean;
  isExtracting: boolean;
  searchFilter: string;
  extractedResults: ExtractedApkResult[];

  // Actions
  addApksToQueue: (files: File[]) => void;
  removeApkFromQueue: (id: string) => void;
  clearQueue: () => void;
  setSearchFilter: (q: string) => void;
  installQueuedApks: () => Promise<void>;
  extractApkFromDevice: (packageName: string) => Promise<boolean>;
}

export const useApkStore = create<ApkState>((set, get) => ({
  apkQueue: [],
  isInstalling: false,
  isExtracting: false,
  searchFilter: '',
  extractedResults: [],

  addApksToQueue: (files: File[]) => {
    const newItems: QueuedApk[] = files.map((f, i) => ({
      id: `${Date.now()}_${i}_${f.name}`,
      name: f.name,
      sizeBytes: f.size,
      // For desktop electron/tauri or standard File objects
      path: (f as unknown as { path?: string }).path || f.name,
      status: 'pending',
    }));

    set((state) => ({ apkQueue: [...state.apkQueue, ...newItems] }));
  },

  removeApkFromQueue: (id: string) => {
    set((state) => ({ apkQueue: state.apkQueue.filter((a) => a.id !== id) }));
  },

  clearQueue: () => set({ apkQueue: [] }),
  setSearchFilter: (q: string) => set({ searchFilter: q }),

  installQueuedApks: async () => {
    const activeSerial = useDeviceStore.getState().activeSerial;
    if (!activeSerial) return;

    set({ isInstalling: true });
    const { apkQueue } = get();

    for (const item of apkQueue) {
      if (item.status === 'success') continue;

      set((state) => ({
        apkQueue: state.apkQueue.map((a) =>
          a.id === item.id ? { ...a, status: 'installing' } : a
        ),
      }));

      try {
        useLogStore.getState().addLog('info', `Installing APK: ${item.name}...`);
        const res = await AdbBridge.installApk(activeSerial, item.path);

        if (res.success) {
          useLogStore.getState().addLog('success', `Installed APK: ${item.name}`, res.stdout);
          set((state) => ({
            apkQueue: state.apkQueue.map((a) =>
              a.id === item.id ? { ...a, status: 'success' } : a
            ),
          }));
        } else {
          useLogStore.getState().addLog('error', `Failed to install: ${item.name}`, res.stderr);
          set((state) => ({
            apkQueue: state.apkQueue.map((a) =>
              a.id === item.id ? { ...a, status: 'failed', errorMessage: res.stderr } : a
            ),
          }));
        }
      } catch (err: unknown) {
        set((state) => ({
          apkQueue: state.apkQueue.map((a) =>
            a.id === item.id
              ? {
                  ...a,
                  status: 'failed',
                  errorMessage: err instanceof Error ? err.message : String(err),
                }
              : a
          ),
        }));
      }
    }

    set({ isInstalling: false });
  },

  extractApkFromDevice: async (packageName: string) => {
    const activeSerial = useDeviceStore.getState().activeSerial;
    if (!activeSerial) return false;

    set({ isExtracting: true });
    try {
      useLogStore.getState().addLog('info', `Dumping APK for package: ${packageName}...`);
      const res = await AdbBridge.extractApk(activeSerial, packageName);

      if (res.success) {
        useLogStore.getState().addLog(
          'success',
          `Extracted ${packageName}.apk to extracted_apks/`,
          res.stdout
        );
        set((state) => ({
          isExtracting: false,
          extractedResults: [
            {
              packageName,
              outputPath: `extracted_apks/${packageName}.apk`,
              timestamp: new Date().toLocaleTimeString(),
            },
            ...state.extractedResults,
          ],
        }));
        return true;
      } else {
        useLogStore.getState().addLog('error', `Extract failed for ${packageName}`, res.stderr);
        set({ isExtracting: false });
        return false;
      }
    } catch (err: unknown) {
      set({ isExtracting: false });
      useLogStore.getState().addLog(
        'error',
        `Extract failed`,
        err instanceof Error ? err.message : String(err)
      );
      return false;
    }
  },
}));
