import React from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Cpu,
  Zap,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { useLanguageStore } from '../../stores/useLanguageStore';

export const NoDeviceConnectedView: React.FC = () => {
  const {
    isScanning,
    isAdbAvailable,
    isInstallingAdb,
    fetchDevices,
    downloadAndInstallAdb,
  } = useDeviceStore();

  const t = useLanguageStore((s) => s.t);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Hero Waiting Card */}
      <Card className="p-8 text-center bg-gradient-to-b from-[#131728] to-[#0d0f1a] border-cyan-500/20 shadow-glow">
        <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-xl">
          <Smartphone className="w-8 h-8 animate-pulse" />
        </div>

        <h2 className="text-xl font-bold text-white tracking-wide">
          {t.no_device_title}
        </h2>
        <p className="text-xs text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
          {t.no_device_desc}
        </p>

        <div className="flex items-center justify-center gap-3 mt-6">
          <Button
            variant="primary"
            size="md"
            onClick={() => fetchDevices()}
            isLoading={isScanning}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            {t.refresh_devices}
          </Button>
        </div>
      </Card>

      {/* 1-Click ADB Installer Card (if ADB not found or optional manual trigger) */}
      <Card className="p-6 border-purple-500/30 bg-[#121424]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {isAdbAvailable ? t.adb_installed_title : t.adb_missing_title}
                </h3>
                {isAdbAvailable && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">
                    OK
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {t.adb_missing_desc} {t.check_adb_installed}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => downloadAndInstallAdb()}
            isLoading={isInstallingAdb}
            leftIcon={<Download className="w-4 h-4 text-purple-400" />}
            className="shrink-0 text-xs"
          >
            {t.download_adb_btn}
          </Button>
        </div>
      </Card>

      {/* Step-by-Step Connection Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 font-bold text-sm flex items-center justify-center mb-3">
            1
          </div>
          <h4 className="text-xs font-bold text-white">{t.guide_step1_title}</h4>
          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
            {t.guide_step1_desc}
          </p>
        </Card>

        <Card className="p-5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 font-bold text-sm flex items-center justify-center mb-3">
            2
          </div>
          <h4 className="text-xs font-bold text-white">{t.guide_step2_title}</h4>
          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
            {t.guide_step2_desc}
          </p>
        </Card>

        <Card className="p-5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-sm flex items-center justify-center mb-3">
            3
          </div>
          <h4 className="text-xs font-bold text-white">{t.guide_step3_title}</h4>
          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
            {t.guide_step3_desc}
          </p>
        </Card>
      </div>
    </div>
  );
};
