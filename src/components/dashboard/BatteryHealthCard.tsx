import React from 'react';
import { Battery, Flame, Zap, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { BatteryInfo } from '../../types/device';
import { useLanguageStore } from '../../stores/useLanguageStore';

interface BatteryHealthCardProps {
  battery: BatteryInfo;
}

export const BatteryHealthCard: React.FC<BatteryHealthCardProps> = ({ battery }) => {
  const t = useLanguageStore((s) => s.t);

  const getTempColor = (temp: number) => {
    if (temp > 42) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (temp > 37) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Battery className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">{t.battery_power_health}</h3>
            <p className="text-[11px] text-slate-400">{t.dumpsys_battery_stats}</p>
          </div>
        </div>

        <span className="text-xl font-bold font-mono text-emerald-400">
          {battery.level}%
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {/* Temperature */}
        <div className={`p-3 rounded-xl border ${getTempColor(battery.temperature_c)}`}>
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Flame className="w-3.5 h-3.5" />
            <span>{t.core_temp}</span>
          </div>
          <p className="text-base font-bold font-mono mt-1">
            {battery.temperature_c.toFixed(1)} °C
          </p>
        </div>

        {/* Health */}
        <div className="p-3 rounded-xl bg-[#141724] border border-[#202538]">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.health}</span>
          </div>
          <p className="text-xs font-bold text-slate-200 mt-1 truncate">
            {battery.health}
          </p>
        </div>

        {/* Voltage */}
        <div className="p-3 rounded-xl bg-[#141724] border border-[#202538]">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.voltage}</span>
          </div>
          <p className="text-xs font-bold font-mono text-slate-200 mt-1">
            {(battery.voltage_mv / 1000).toFixed(2)} V
          </p>
        </div>

        {/* Source */}
        <div className="p-3 rounded-xl bg-[#141724] border border-[#202538]">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Battery className="w-3.5 h-3.5 text-purple-400" />
            <span>{t.power_source}</span>
          </div>
          <p className="text-xs font-bold text-slate-200 mt-1 truncate">
            {battery.plugged}
          </p>
        </div>
      </div>
    </Card>
  );
};
