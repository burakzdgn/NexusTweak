import React from 'react';
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
  const { activeDevice, healthScore, isLoading, isScanning, devices } = useDeviceStore();
  const t = useLanguageStore((s) => s.t);

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
