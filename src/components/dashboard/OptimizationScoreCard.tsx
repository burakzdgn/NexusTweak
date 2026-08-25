import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { HealthScore } from '../../types/device';
import { useLanguageStore } from '../../stores/useLanguageStore';

interface OptimizationScoreCardProps {
  score: HealthScore | null;
  onNavigateTweaks: () => void;
}

export const OptimizationScoreCard: React.FC<OptimizationScoreCardProps> = ({
  score,
  onNavigateTweaks,
}) => {
  const t = useLanguageStore((s) => s.t);
  const totalScore = score?.total_score || 72;

  const getScoreColor = (val: number) => {
    if (val >= 90) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (val >= 75) return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
    if (val >= 60) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Score Gauge Circle */}
        <div className="flex items-center gap-5">
          <div
            className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-2 font-mono font-extrabold shadow-lg ${getScoreColor(
              totalScore
            )}`}
          >
            <span className="text-2xl">{totalScore}</span>
            <span className="text-[10px] uppercase font-sans tracking-widest opacity-80">
              / 100
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{t.system_optimization_index}</h3>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              {t.optimization_desc}
            </p>
          </div>
        </div>

        {/* 1-Click Action */}
        <Button
          variant="primary"
          onClick={onNavigateTweaks}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="shrink-0"
        >
          {t.view_recommendations}
        </Button>
      </div>

      {/* Sub-Score Breakdown Bars */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#1e2338]">
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-300">
            <span>{t.ui_fluidity}</span>
            <span className="text-cyan-400 font-mono">{score?.animation_score || 60}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full"
              style={{ width: `${score?.animation_score || 60}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-300">
            <span>{t.privacy_dns}</span>
            <span className="text-purple-400 font-mono">{score?.privacy_score || 65}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full"
              style={{ width: `${score?.privacy_score || 65}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-300">
            <span>{t.battery_standby}</span>
            <span className="text-emerald-400 font-mono">{score?.battery_score || 70}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${score?.battery_score || 70}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-300">
            <span>{t.debloat_cleanliness}</span>
            <span className="text-amber-400 font-mono">{score?.debloat_score || 65}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${score?.debloat_score || 65}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
