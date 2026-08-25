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
  const categories: { id: TweakCategory; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All Optimizations', icon: Layers },
    { id: 'animations', label: 'UI & Animations', icon: Sparkles },
    { id: 'display', label: 'Display & 120Hz', icon: Monitor },
    { id: 'battery', label: 'Battery & Doze', icon: Battery },
    { id: 'privacy', label: 'Privacy & DNS', icon: Shield },
    { id: 'performance', label: 'Gaming & Performance', icon: Cpu },
    { id: 'network', label: 'Network & Wi-Fi', icon: Wifi },
    { id: 'debloat', label: 'OEM Debloat Rules', icon: Trash2 },
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
        {(['all', 'Safe', 'Moderate', 'Advanced'] as const).map((r) => (
          <button
            key={r}
            onClick={() => onSelectRisk(r)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
              activeRisk === r
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {r === 'all' ? 'All Risks' : r}
          </button>
        ))}
      </div>
    </div>
  );
};
