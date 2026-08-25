import { create } from 'zustand';
import { TweakRule, TweakCategory, RiskLevel } from '../types/tweaks';
import { AdbBridge } from '../services/adbBridge';
import { useDeviceStore } from './useDeviceStore';
import { useLogStore } from './useLogStore';
import { useLanguageStore } from './useLanguageStore';
import { translateTweakRule } from '../utils/tweakTranslator';

export type TweakStatusFilter = 'all' | 'unapplied' | 'applied';

interface TweaksState {
  rules: TweakRule[];
  selectedRuleIds: Set<string>;
  activeCategory: TweakCategory;
  activeRisk: RiskLevel | 'all';
  statusFilter: TweakStatusFilter;
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
  setStatusFilter: (status: TweakStatusFilter) => void;
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
  statusFilter: 'all',
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
  setStatusFilter: (status: TweakStatusFilter) => set({ statusFilter: status }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setAutoBackup: (enabled: boolean) => set({ autoBackupEnabled: enabled }),

  applySingleTweak: async (ruleId: string) => {
    const activeDevice = useDeviceStore.getState().activeDevice;
    if (!activeDevice) return false;

    set({ isApplying: true });
    const targetRule = get().rules.find((r) => r.id === ruleId);
    const lang = useLanguageStore.getState().language;
    const ruleTitle = targetRule ? translateTweakRule(targetRule, lang).name : ruleId;

    try {
      const deviceName = `${activeDevice.manufacturer} ${activeDevice.model}`;
      const results = await AdbBridge.applyTweak(
        activeDevice.serial,
        deviceName,
        ruleId,
        get().autoBackupEnabled
      );

      const hasError = results.some(
        (r) => !r.success || r.stdout.includes('Exception') || r.stdout.includes('Error:')
      );

      if (!hasError) {
        useLogStore.getState().addLog(
          'success',
          ruleTitle,
          lang === 'tr' ? 'Optimizasyon başarıyla uygulandı.' : 'Optimization applied successfully.'
        );
      } else {
        const errRes = results.find((r) => !r.success || r.stdout.includes('Exception')) || results[0];
        let msg = errRes.stdout || errRes.stderr;
        if (msg.includes('Unknown package')) {
          const match = msg.match(/Unknown package: ([^\s\r\n]+)/);
          const pkg = match ? match[1] : '';
          msg = lang === 'tr'
            ? `Paket cihazınızda bulunamadı (Zaten kaldırılmış): ${pkg}`
            : `Package not found on device (Already absent): ${pkg}`;
        }
        useLogStore.getState().addLog('error', `${ruleTitle} (Hata)`, msg);
      }

      // Re-scan applicable rules and update live score
      await get().fetchRulesForActiveDevice();
      set({ isApplying: false });
      return true;
    } catch (err: unknown) {
      set({ isApplying: false });
      useLogStore.getState().addLog(
        'error',
        `${ruleTitle} (Hata)`,
        err instanceof Error ? err.message : String(err)
      );
      return false;
    }
  },

  revertSingleTweak: async (ruleId: string) => {
    const activeSerial = useDeviceStore.getState().activeSerial;
    if (!activeSerial) return false;

    set({ isApplying: true });
    const targetRule = get().rules.find((r) => r.id === ruleId);
    const lang = useLanguageStore.getState().language;
    const ruleTitle = targetRule ? translateTweakRule(targetRule, lang).name : ruleId;

    try {
      const results = await AdbBridge.revertTweak(activeSerial, ruleId);
      const hasError = results.some((r) => !r.success);

      if (!hasError) {
        useLogStore.getState().addLog(
          'info',
          ruleTitle,
          lang === 'tr' ? 'Optimizasyon geri alındı (Varsayılan değere dönüldü).' : 'Optimization reverted.'
        );
      } else {
        const errRes = results.find((r) => !r.success) || results[0];
        useLogStore.getState().addLog('error', `${ruleTitle} (Geri Alma Hatası)`, errRes.stderr || errRes.stdout);
      }

      // Re-scan applicable rules and update live score
      await get().fetchRulesForActiveDevice();
      set({ isApplying: false });
      return true;
    } catch (err: unknown) {
      set({ isApplying: false });
      useLogStore.getState().addLog(
        'error',
        `${ruleTitle} (Geri Alma Hatası)`,
        err instanceof Error ? err.message : String(err)
      );
      return false;
    }
  },

  applySelectedBatch: async () => {
    const { rules, selectedRuleIds, autoBackupEnabled } = get();
    const activeDevice = useDeviceStore.getState().activeDevice;
    if (!activeDevice || selectedRuleIds.size === 0) return false;

    set({ isApplying: true });
    const selectedList = rules.filter((r) => selectedRuleIds.has(r.id));
    const deviceName = `${activeDevice.manufacturer} ${activeDevice.model}`;
    const lang = useLanguageStore.getState().language;

    // 1. Take master snapshot before batch
    if (autoBackupEnabled) {
      await AdbBridge.createBackup(
        activeDevice.serial,
        deviceName,
        `Auto-Backup before applying ${selectedList.length} tweaks`
      );
    }

    let successCount = 0;
    let failedCount = 0;

    for (const rule of selectedList) {
      const translated = translateTweakRule(rule, lang);
      try {
        const results = await AdbBridge.applyTweak(activeDevice.serial, deviceName, rule.id, false);
        const hasError = results.some(
          (r) => !r.success || r.stdout.includes('Exception') || r.stdout.includes('Error:')
        );

        if (!hasError) {
          successCount++;
          useLogStore.getState().addLog(
            'success',
            translated.name,
            lang === 'tr' ? 'Başarıyla uygulandı' : 'Successfully applied'
          );
        } else {
          failedCount++;
          const errRes = results.find((r) => !r.success || r.stdout.includes('Exception')) || results[0];
          let msg = errRes.stdout || errRes.stderr;
          if (msg.includes('Unknown package')) {
            const match = msg.match(/Unknown package: ([^\s\r\n]+)/);
            const pkg = match ? match[1] : '';
            msg = lang === 'tr'
              ? `Paket bu ROM sürümünde bulunamadı (Zaten kaldırılmış): ${pkg}`
              : `Package not found on ROM (Already absent): ${pkg}`;
          }
          useLogStore.getState().addLog('error', `${translated.name} (Hata)`, msg);
        }
      } catch (err: unknown) {
        failedCount++;
        useLogStore.getState().addLog(
          'error',
          `${translated.name} (Hata)`,
          err instanceof Error ? err.message : String(err)
        );
      }
    }

    // 2. Clear selection and stop loading
    set({ selectedRuleIds: new Set(), isApplying: false });

    // 3. Immediately re-scan live device state, rules, and health scores!
    await get().fetchRulesForActiveDevice();
    await useDeviceStore.getState().refreshActiveDevice();

    useLogStore.getState().addLog(
      failedCount === 0 ? 'success' : 'info',
      lang === 'tr' ? `Toplu İşlem Tamamlandı (${successCount}/${selectedList.length})` : `Batch Completed (${successCount}/${selectedList.length})`,
      lang === 'tr'
        ? `${successCount} optimizasyon uygulandı, ${failedCount} kural hata/uyarı verdi.`
        : `${successCount} tweaks applied, ${failedCount} failed.`
    );

    return true;
  },
}));
