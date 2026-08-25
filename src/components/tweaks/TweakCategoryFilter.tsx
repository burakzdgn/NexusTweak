import React from 'react';
import {
  Layers,
  Sparkles,
  Monitor,
  Battery,
  Shield,
  Wifi,
  Cpu,
  Trash2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { TweakCategory, RiskLevel } from '../../types/tweaks';
import { TweakStatusFilter } from '../../stores/useTweaksStore';
import { useLanguageStore } from '../../stores/useLanguageStore';

interface TweakCategoryFilterProps {
  activeCategory: TweakCategory;
  onSelectCategory: (cat: TweakCategory) => void;
  activeRisk: RiskLevel | 'all';
  onSelectRisk: (risk: RiskLevel | 'all') => void;
  activeStatus: TweakStatusFilter;
  onSelectStatus: (status: TweakStatusFilter) => void;
}

export const TweakCategoryFilter: React.FC<TweakCategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  activeRisk,
  onSelectRisk,
  activeStatus,
  onSelectStatus,
}) => {
  const { t, language } = useLanguageStore();

  const categories: { id: TweakCategory; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: t.cat_all, icon: Layers },
    { id: 'animations', label: t.cat_animations, icon: Sparkles },
    { id: 'display', label: t.cat_display, icon: Monitor },
    { id: 'battery', label: t.cat_battery, icon: Battery },
    { id: 'privacy', label: t.cat_privacy, icon: Shield },
    { id: 'performance', label: t.cat_performance, icon: Cpu },
    { id: 'network', label: t.cat_network, icon: Wifi },
    { id: 'debloat', label: t.cat_debloat, icon: Trash2 },
  ];

  const risks: { id: RiskLevel | 'all'; label: string }[] = [
    { id: 'all', label: t.risk_all },
    { id: 'Safe', label: t.risk_safe },
    { id: 'Moderate', label: t.risk_moderate },
    { id: 'Advanced', label: t.risk_advanced },
  ];

  const statuses: { id: TweakStatusFilter; label: string; icon?: React.ElementType }[] = [
    { id: 'all', label: language === 'tr' ? 'Tümü' : 'All' },
    { id: 'unapplied', label: language === 'tr' ? 'Bekleyenler' : 'Unapplied', icon: Clock },
    { id: 'applied', label: language === 'tr' ? 'Uygulananlar' : 'Applied', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-3">
      {/* Top: Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm font-semibold'
                  : 'bg-[#121524] border-[#202538] text-slate-400 hover:text-slate-200 hover:bg-[#181b2e]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom: Status & Risk Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status Filter (All / Unapplied / Applied) */}
        <div className="flex items-center gap-1 bg-[#121524] p-1 rounded-xl border border-[#202538]">
          <span className="text-[10px] text-slate-500 font-semibold px-2 uppercase tracking-wider">
            {language === 'tr' ? 'Durum' : 'Status'}:
          </span>
          {statuses.map((s) => {
            const Icon = s.icon;
            const isActive = activeStatus === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectStatus(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {Icon && <Icon className="w-3 h-3" />}
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Risk Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#121524] p-1 rounded-xl border border-[#202538]">
          <span className="text-[10px] text-slate-500 font-semibold px-2 uppercase tracking-wider">
            {language === 'tr' ? 'Risk' : 'Risk'}:
          </span>
          {risks.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelectRisk(r.id)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                activeRisk === r.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
