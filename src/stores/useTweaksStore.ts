import { create } from 'zustand';
import { TweakRule, TweakCategory, RiskLevel } from '../types/tweaks';
import { AdbBridge } from '../services/adbBridge';
import { useDeviceStore } from './useDeviceStore';
import { useLogStore } from './useLogStore';

interface TweaksState {
  rules: TweakRule[];
  selectedRuleIds: Set<string>;
  activeCategory: TweakCategory;
  activeRisk: RiskLevel | 'all';
  searchQuery: string;
  autoBackupEnabled: boolean;
  isApplying: boolean;
  error: string | null;

  // Actions
  fetchRulesForActiveDevice: () => Promise<void>;
  toggleSelectRule: (ruleId: string) => void;
  selectAllVisible: (ruleIds: string[]) => void;
  clearSelection: () => void;
  setCategory: (category: TweakCategory) => void;
  setRiskFilter: (risk: RiskLevel | 'all') => void;
  setSearchQuery: (query: string) => void;
  setAutoBackup: (enabled: boolean) => void;
  applySingleTweak: (ruleId: string) => Promise<boolean>;
  revertSingleTweak: (ruleId: string) => Promise<boolean>;
  applySelectedBatch: () => Promise<boolean>;
}

export const useTweaksStore = create<TweaksState>((set, get) => ({
  rules: [],
  selectedRuleIds: new Set<string>(),
  activeCategory: 'all',
  activeRisk: 'all',
  searchQuery: '',
  autoBackupEnabled: true,
  isApplying: false,
  error: null,

  fetchRulesForActiveDevice: async () => {
    const activeSerial = useDeviceStore.getState().activeSerial;
    if (!activeSerial) return;

    try {
      const rules = await AdbBridge.getApplicableRules(activeSerial);
      set({ rules, error: null });

      const appliedIds = rules.filter((r) => r.isApplied).map((r) => r.id);
      useDeviceStore.getState().updateHealthScore(appliedIds);
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load tweak rules',
      });
    }
  },

  toggleSelectRule: (ruleId: string) => {
    set((state) => {
      const next = new Set(state.selectedRuleIds);
      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }
      return { selectedRuleIds: next };
    });
  },

  selectAllVisible: (ruleIds: string[]) => {
    set((state) => {
      const next = new Set(state.selectedRuleIds);
      ruleIds.forEach((id) => next.add(id));
      return { selectedRuleIds: next };
    });
  },

  clearSelection: () => {
    set({ selectedRuleIds: new Set() });
  },

  setCategory: (category: TweakCategory) => set({ activeCategory: category }),
  setRiskFilter: (risk: RiskLevel | 'all') => set({ activeRisk: risk }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setAutoBackup: (enabled: boolean) => set({ autoBackupEnabled: enabled }),

  applySingleTweak: async (ruleId: string) => {
    const activeDevice = useDeviceStore.getState().activeDevice;
    if (!activeDevice) return false;

    set({ isApplying: true });
    try {
      const deviceName = `${activeDevice.manufacturer} ${activeDevice.model}`;
      const results = await AdbBridge.applyTweak(
        activeDevice.serial,
        deviceName,
        ruleId,
        get().autoBackupEnabled
      );

      results.forEach((r) => {
        useLogStore.getState().addLog(
          r.success ? 'success' : 'error',
          `Apply tweak: ${ruleId}`,
          r.stdout || r.stderr
        );
      });

      set((state) => ({
        rules: state.rules.map((r) => (r.id === ruleId ? { ...r, isApplied: true } : r)),
        isApplying: false,
      }));

      const applied = get()
        .rules.filter((r) => r.isApplied)
        .map((r) => r.id);
      useDeviceStore.getState().updateHealthScore(applied);
      return true;
    } catch (err: unknown) {
      set({ isApplying: false });
      useLogStore.getState().addLog(
        'error',
        `Failed to apply tweak ${ruleId}`,
        err instanceof Error ? err.message : String(err)
      );
      return false;
    }
  },

  revertSingleTweak: async (ruleId: string) => {
    const activeSerial = useDeviceStore.getState().activeSerial;
    if (!activeSerial) return false;

    set({ isApplying: true });
    try {
      const results = await AdbBridge.revertTweak(activeSerial, ruleId);

      results.forEach((r) => {
        useLogStore.getState().addLog(
          r.success ? 'info' : 'error',
          `Revert tweak: ${ruleId}`,
          r.stdout || r.stderr
        );
      });

      set((state) => ({
        rules: state.rules.map((r) => (r.id === ruleId ? { ...r, isApplied: false } : r)),
        isApplying: false,
      }));

      const applied = get()
        .rules.filter((r) => r.isApplied)
        .map((r) => r.id);
      useDeviceStore.getState().updateHealthScore(applied);
      return true;
    } catch (err: unknown) {
      set({ isApplying: false });
      useLogStore.getState().addLog(
        'error',
        `Failed to revert tweak ${ruleId}`,
        err instanceof Error ? err.message : String(err)
      );
      return false;
    }
  },

  applySelectedBatch: async () => {
    const { selectedRuleIds, autoBackupEnabled } = get();
    const activeDevice = useDeviceStore.getState().activeDevice;
    if (!activeDevice || selectedRuleIds.size === 0) return false;

    set({ isApplying: true });
    const ids = Array.from(selectedRuleIds);
    const deviceName = `${activeDevice.manufacturer} ${activeDevice.model}`;

    try {
      const results = await AdbBridge.applyBatchTweaks(
        activeDevice.serial,
        deviceName,
        ids,
        autoBackupEnabled
      );

      results.forEach((r) => {
        useLogStore.getState().addLog(
          r.success ? 'success' : 'error',
          'Batch tweak execution',
          r.stdout || r.stderr
        );
      });

      set((state) => ({
        rules: state.rules.map((r) =>
          selectedRuleIds.has(r.id) ? { ...r, isApplied: true } : r
        ),
        selectedRuleIds: new Set(),
        isApplying: false,
      }));

      const applied = get()
        .rules.filter((r) => r.isApplied)
        .map((r) => r.id);
      useDeviceStore.getState().updateHealthScore(applied);
      return true;
    } catch (err: unknown) {
      set({ isApplying: false });
      useLogStore.getState().addLog(
        'error',
        'Batch apply failed',
        err instanceof Error ? err.message : String(err)
      );
      return false;
    }
  },
}));
