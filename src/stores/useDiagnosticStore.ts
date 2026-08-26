import { create } from 'zustand';
import { DiagnosticFixResult, DiagnosticReport } from '../types/diagnostics';
import { AdbBridge } from '../services/adbBridge';
import { useDeviceStore } from './useDeviceStore';
import { useLogStore } from './useLogStore';
import { useBackupStore } from './useBackupStore';

interface DiagnosticState {
  report: DiagnosticReport | null;
  isLoading: boolean;
  isFixing: boolean;
  error: string | null;
  selectedPackageNames: Set<string>;
  rebootEnabled: boolean;
  lastFixResult: DiagnosticFixResult | null;

  // Actions
  runDiagnostics: () => Promise<void>;
  togglePackageSelection: (pkg: string) => void;
  selectAllPackages: () => void;
  clearPackageSelection: () => void;
  setRebootEnabled: (enabled: boolean) => void;
  executeFixes: () => Promise<boolean>;
}

export const useDiagnosticStore = create<DiagnosticState>((set, get) => ({
  report: null,
  isLoading: false,
  isFixing: false,
  error: null,
  selectedPackageNames: new Set(),
  rebootEnabled: false,
  lastFixResult: null,

  runDiagnostics: async () => {
    const activeSerial = useDeviceStore.getState().activeSerial;
    if (!activeSerial) return;

    set({ isLoading: true, error: null });
    try {
      const report = await AdbBridge.runDeepDiagnostics(activeSerial);
      const initialSelected = new Set(
        report.detected_bloat_processes.map((p) => p.package_name)
      );

      set({
        report,
        selectedPackageNames: initialSelected,
        rebootEnabled: report.uptime_seconds > 400000,
        isLoading: false,
        error: null,
      });

      useLogStore.getState().addLog(
        'success',
        'Cihaz Teşhis Raporu Tamamlandı',
        `${report.device_name} için yük (${report.load_avg_1m}), uptime (${report.uptime_formatted}) ve ${report.detected_issues.length} sorun analiz edildi.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ isLoading: false, error: msg });
      useLogStore.getState().addLog('error', 'Teşhis Hatası', msg);
    }
  },

  togglePackageSelection: (pkg: string) => {
    set((state) => {
      const next = new Set(state.selectedPackageNames);
      if (next.has(pkg)) {
        next.delete(pkg);
      } else {
        next.add(pkg);
      }
      return { selectedPackageNames: next };
    });
  },

  selectAllPackages: () => {
    const report = get().report;
    if (!report) return;
    set({
      selectedPackageNames: new Set(
        report.detected_bloat_processes.map((p) => p.package_name)
      ),
    });
  },

  clearPackageSelection: () => {
    set({ selectedPackageNames: new Set() });
  },

  setRebootEnabled: (enabled: boolean) => {
    set({ rebootEnabled: enabled });
  },

  executeFixes: async () => {
    const { report, selectedPackageNames, rebootEnabled } = get();
    const activeDevice = useDeviceStore.getState().activeDevice;
    if (!activeDevice || !report) return false;

    set({ isFixing: true });
    try {
      const deviceName = `${activeDevice.manufacturer} ${activeDevice.model}`;
      const packagesToDisable = Array.from(selectedPackageNames);

      const result = await AdbBridge.executeDiagnosticFixes(
        activeDevice.serial,
        deviceName,
        packagesToDisable,
        rebootEnabled
      );

      set({
        lastFixResult: result,
        isFixing: false,
      });

      // Refresh backup list in store since snapshot was taken
      await useBackupStore.getState().fetchBackups();

      useLogStore.getState().addLog(
        'success',
        'Teşhis Çözümü Uygulandı (Snapshot Alındı)',
        result.message
      );

      // Re-run diagnostics after fix
      if (!rebootEnabled) {
        await get().runDiagnostics();
      }

      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      set({ isFixing: false });
      useLogStore.getState().addLog('error', 'Çözüm Hatası', msg);
      return false;
    }
  },
}));
