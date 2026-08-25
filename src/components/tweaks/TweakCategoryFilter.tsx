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
} from 'lucide-react';
import { TweakCategory, RiskLevel } from '../../types/tweaks';
import { useLanguageStore } from '../../stores/useLanguageStore';

interface TweakCategoryFilterProps {
  activeCategory: TweakCategory;
  onSelectCategory: (cat: TweakCategory) => void;
  activeRisk: RiskLevel | 'all';
  onSelectRisk: (risk: RiskLevel | 'all') => void;
}

export const TweakCategoryFilter: React.FC<TweakCategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  activeRisk,
  onSelectRisk,
}) => {
  const t = useLanguageStore((s) => s.t);

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

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Category Pills */}
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

      {/* Risk Filter Buttons */}
      <div className="flex items-center gap-1 bg-[#121524] p-1 rounded-xl border border-[#202538]">
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
  );
};
