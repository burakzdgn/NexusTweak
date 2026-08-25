import { create } from 'zustand';
import { PackageInfo, DebloatFilter } from '../types/debloat';
import { AdbBridge } from '../services/adbBridge';
import { useDeviceStore } from './useDeviceStore';
import { useLogStore } from './useLogStore';

interface DebloatState {
  packages: PackageInfo[];
  selectedPackages: Set<string>;
  filter: DebloatFilter;
  searchQuery: string;
  isLoading: boolean;
  isProcessing: boolean;
  selectedPackageForDrawer: PackageInfo | null;
  whitelistWarningTarget: string | null;

  // Actions
  fetchPackages: () => Promise<void>;
  toggleSelectPackage: (pkg: string) => void;
  selectAllSafeBloat: () => void;
  clearSelection: () => void;
  setFilter: (filter: DebloatFilter) => void;
  setSearchQuery: (query: string) => void;
  setSelectedPackageForDrawer: (pkg: PackageInfo | null) => void;
  setWhitelistWarningTarget: (pkg: string | null) => void;
  debloatSinglePackage: (pkg: string, forceOverride?: boolean) => Promise<boolean>;
  restoreSinglePackage: (pkg: string) => Promise<boolean>;
  debloatSelectedBatch: () => Promise<boolean>;
}

export const useDebloatStore = create<DebloatState>((set, get) => ({
  packages: [],
  selectedPackages: new Set(),
  filter: 'bloat',
  searchQuery: '',
  isLoading: false,
  isProcessing: false,
  selectedPackageForDrawer: null,
  whitelistWarningTarget: null,

  fetchPackages: async () => {
    const activeSerial = useDeviceStore.getState().activeSerial;
    if (!activeSerial) return;

    set({ isLoading: true });
    try {
      const packages = await AdbBridge.getInstalledPackages(activeSerial);
      set({ packages, isLoading: false });
    } catch (err: unknown) {
      set({ isLoading: false });
      useLogStore.getState().addLog(
        'error',
        'Failed to fetch packages',
        err instanceof Error ? err.message : String(err)
      );
    }
  },

  toggleSelectPackage: (pkg: string) => {
    set((state) => {
      const next = new Set(state.selectedPackages);
      if (next.has(pkg)) {
        next.delete(pkg);
      } else {
        next.add(pkg);
      }
      return { selectedPackages: next };
    });
  },

  selectAllSafeBloat: () => {
    const safe = get()
      .packages.filter((p) => p.bloat_category && p.risk_level === 'Safe' && p.is_enabled)
      .map((p) => p.package_name);
    set({ selectedPackages: new Set(safe) });
  },

  clearSelection: () => set({ selectedPackages: new Set() }),
  setFilter: (filter: DebloatFilter) => set({ filter }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedPackageForDrawer: (pkg: PackageInfo | null) =>
    set({ selectedPackageForDrawer: pkg }),
  setWhitelistWarningTarget: (pkg: string | null) =>
    set({ whitelistWarningTarget: pkg }),

  debloatSinglePackage: async (pkg: string, forceOverride = false) => {
    const activeDevice = useDeviceStore.getState().activeDevice;
    if (!activeDevice) return false;

    set({ isProcessing: true });
    try {
      const deviceName = `${activeDevice.manufacturer} ${activeDevice.model}`;
      const res = await AdbBridge.debloatPackage(
        activeDevice.serial,
        deviceName,
        pkg,
        forceOverride,
        true // Auto snapshot
      );
      useLogStore.getState().addLog('success', `Debloated: ${pkg}`, res.stdout);

      set((state) => ({
        packages: state.packages.map((p) =>
          p.package_name === pkg ? { ...p, is_enabled: false } : p
        ),
        isProcessing: false,
      }));
      return true;
    } catch (err: unknown) {
      set({ isProcessing: false });
      useLogStore.getState().addLog(
        'error',
        `Debloat failed for ${pkg}`,
        err instanceof Error ? err.message : String(err)
      );
      return false;
    }
  },

  restoreSinglePackage: async (pkg: string) => {
    const activeSerial = useDeviceStore.getState().activeSerial;
    if (!activeSerial) return false;

    set({ isProcessing: true });
    try {
      const res = await AdbBridge.restorePackage(activeSerial, pkg);
      useLogStore.getState().addLog('info', `Restored package: ${pkg}`, res.stdout);

      set((state) => ({
        packages: state.packages.map((p) =>
          p.package_name === pkg ? { ...p, is_enabled: true } : p
        ),
        isProcessing: false,
      }));
      return true;
    } catch (err: unknown) {
      set({ isProcessing: false });
      useLogStore.getState().addLog(
        'error',
        `Restore failed for ${pkg}`,
        err instanceof Error ? err.message : String(err)
      );
      return false;
    }
  },

  debloatSelectedBatch: async () => {
    const { selectedPackages } = get();
    const activeDevice = useDeviceStore.getState().activeDevice;
    if (!activeDevice || selectedPackages.size === 0) return false;

    set({ isProcessing: true });
    const pkgs = Array.from(selectedPackages);
    const deviceName = `${activeDevice.manufacturer} ${activeDevice.model}`;

    // Take one master snapshot before the batch
    await AdbBridge.createBackup(
      activeDevice.serial,
      deviceName,
      `Auto-Backup before debloating ${pkgs.length} packages`
    );

    for (const pkg of pkgs) {
      try {
        await AdbBridge.debloatPackage(activeDevice.serial, deviceName, pkg, false, false);
        useLogStore.getState().addLog('success', `Batch Debloat: ${pkg}`, 'Disabled');
      } catch (err: unknown) {
        useLogStore.getState().addLog(
          'error',
          `Skipped ${pkg}`,
          err instanceof Error ? err.message : String(err)
        );
      }
    }

    set((state) => ({
      packages: state.packages.map((p) =>
        selectedPackages.has(p.package_name) ? { ...p, is_enabled: false } : p
      ),
      selectedPackages: new Set(),
      isProcessing: false,
    }));
    return true;
  },
}));
