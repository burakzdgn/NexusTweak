import React from 'react';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { DeviceHeroCard } from './DeviceHeroCard';
import { MetricGauges } from './MetricGauges';
import { BatteryHealthCard } from './BatteryHealthCard';
import { OptimizationScoreCard } from './OptimizationScoreCard';
import { QuickActionGrid } from './QuickActionGrid';
import { NavTab } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { activeDevice, healthScore, isLoading } = useDeviceStore();

  if (isLoading || !activeDevice) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <h3 className="text-base font-semibold text-slate-200 mt-4">
          Reading Device Architecture...
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Extracting SoC parameters, display panel refresh rates, battery health, and system
          properties.
        </p>
      </div>
    );
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
