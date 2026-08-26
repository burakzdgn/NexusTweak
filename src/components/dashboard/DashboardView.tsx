import React from 'react';
import { Activity, ArrowRight, Sparkles } from 'lucide-react';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { DeviceHeroCard } from './DeviceHeroCard';
import { MetricGauges } from './MetricGauges';
import { BatteryHealthCard } from './BatteryHealthCard';
import { OptimizationScoreCard } from './OptimizationScoreCard';
import { QuickActionGrid } from './QuickActionGrid';
import { NoDeviceConnectedView } from './NoDeviceConnectedView';
import { NavTab } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { activeDevice, healthScore, isLoading, isScanning } = useDeviceStore();
  const t = useLanguageStore((s) => s.t);
  const lang = useLanguageStore((s) => s.language);

  // If no devices found and not currently loading/scanning, show waiting guide
  if (!activeDevice) {
    if (isLoading || isScanning) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <h3 className="text-base font-semibold text-slate-200 mt-4">
            {t.device_architecture}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {t.device_architecture_desc}
          </p>
        </div>
      );
    }

    return <NoDeviceConnectedView />;
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Device Hero Overview */}
      <DeviceHeroCard device={activeDevice} />

      {/* Deep Diagnostics Quick Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-[#12141c] to-cyan-950/60 border border-indigo-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white flex items-center justify-center shadow-md">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {lang === 'tr'
                  ? 'Akıllı Cihaz Teşhis Raporu & Darboğaz Tespiti'
                  : 'Smart Device Diagnostics & Bottleneck Finder'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                AI Engine
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {lang === 'tr'
                ? 'İşlemci yükü (Load Avg), ZRAM baskısı ve arka plan telemetri servislerini analiz edin.'
                : 'Analyze CPU queue, ZRAM pressure, uptime fragmentation, and background bloatware.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('diagnostics')}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg transition-all cursor-pointer whitespace-nowrap"
        >
          <span>{lang === 'tr' ? 'Cihazı Derin Analiz Et' : 'Run Deep Diagnostics'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Hardware Metric Gauges */}
      <MetricGauges device={activeDevice} />

      {/* System Optimization Index Score */}
      <OptimizationScoreCard
        score={healthScore}
        onNavigateTweaks={() => onNavigate('tweaks')}
      />

      {/* Battery and Direct Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BatteryHealthCard battery={activeDevice.battery} />
        <QuickActionGrid />
      </div>
    </div>
  );
};
