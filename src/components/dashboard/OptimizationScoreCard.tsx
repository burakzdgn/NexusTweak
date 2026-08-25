import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Battery, Shield, Zap, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { HealthScore } from '../../types/device';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translateRecommendation } from '../../utils/recommendationTranslator';

interface OptimizationScoreCardProps {
  score: HealthScore | null;
  onNavigateTweaks: () => void;
}

export const OptimizationScoreCard: React.FC<OptimizationScoreCardProps> = ({
  score,
  onNavigateTweaks,
}) => {
  const { t, language } = useLanguageStore();
  const totalScore = score?.total_score || 72;

  const getScoreColor = (val: number) => {
    if (val >= 95) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (val >= 80) return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
    if (val >= 60) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  const getRecCategory = (rec: string) => {
    const r = rec.toLowerCase();
    if (r.includes('battery') || r.includes('doze') || r.includes('wi-fi') || r.includes('wifi') || r.includes('pil') || r.includes('tarama')) {
      return { label: language === 'tr' ? 'Pil & Bekleme' : 'Battery & Standby', icon: Battery, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    }
    if (r.includes('dns') || r.includes('adguard') || r.includes('cloudflare') || r.includes('privacy') || r.includes('gizlilik')) {
      return { label: language === 'tr' ? 'Gizlilik & DNS' : 'Privacy & DNS', icon: Shield, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
    }
    if (r.includes('animation') || r.includes('animasyon') || r.includes('refresh rate') || r.includes('hz') || r.includes('akıcılık')) {
      return { label: language === 'tr' ? 'Arayüz Akıcılığı' : 'UI Fluidity', icon: Zap, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
    }
    return { label: language === 'tr' ? 'Debloat & Paket' : 'Debloat', icon: Trash2, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
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
              {totalScore === 100
                ? (language === 'tr' ? 'Harika! Cihazınız %100 tam puanla maksimum performans ve pil verimliliğinde çalışıyor.' : 'Perfect! Your device is running at 100% peak performance and battery efficiency.')
                : t.optimization_desc}
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
          {totalScore === 100
            ? (language === 'tr' ? 'Optimizasyonları Gör' : 'View Tweaks')
            : (language === 'tr' ? '%100 Yapmak İçin İncele' : t.view_recommendations)}
        </Button>
      </div>

      {/* Sub-Score Breakdown Bars */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#1e2338]">
        <div>
          <div className="flex justify-between text-xs font-medium text-slate-300">
            <span>{t.ui_fluidity}</span>
            <span className={`font-mono ${(score?.animation_score || 0) === 100 ? 'text-emerald-400' : 'text-cyan-400'}`}>
              {score?.animation_score || 60}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${(score?.animation_score || 0) === 100 ? 'bg-emerald-400' : 'bg-cyan-500'}`}
              style={{ width: `${score?.animation_score || 60}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-300">
            <span>{t.privacy_dns}</span>
            <span className={`font-mono ${(score?.privacy_score || 0) === 100 ? 'text-emerald-400' : 'text-purple-400'}`}>
              {score?.privacy_score || 65}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${(score?.privacy_score || 0) === 100 ? 'bg-emerald-400' : 'bg-purple-500'}`}
              style={{ width: `${score?.privacy_score || 65}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-300">
            <span>{t.battery_standby}</span>
            <span className={`font-mono ${(score?.battery_score || 0) === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {score?.battery_score || 70}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${(score?.battery_score || 0) === 100 ? 'bg-emerald-400' : 'bg-emerald-500'}`}
              style={{ width: `${score?.battery_score || 70}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-slate-300">
            <span>{t.debloat_cleanliness}</span>
            <span className={`font-mono ${(score?.debloat_score || 0) === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {score?.debloat_score || 65}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${(score?.debloat_score || 0) === 100 ? 'bg-emerald-400' : 'bg-amber-500'}`}
              style={{ width: `${score?.debloat_score || 65}%` }}
            />
          </div>
        </div>
      </div>

      {/* 100/100 Completion Checklist or Success Banner */}
      {totalScore === 100 ? (
        <div className="mt-5 pt-4 border-t border-[#1e2338] flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border-emerald-500/20 text-emerald-300 text-xs font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            {language === 'tr'
              ? 'Tebrikler! Cihazınızdaki tüm optimizasyonlar uygulandı ve donanım en yüksek verimlilik seviyesine (%100) ulaştı.'
              : 'Congratulations! All optimizations are active, running your hardware at maximum 100% efficiency.'}
          </span>
        </div>
      ) : (
        score?.recommendations && score.recommendations.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[#1e2338]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white tracking-wide">
                  {language === 'tr'
                    ? `100/100 Tam Puan İçin Eksik Adımlar (${score.recommendations.length})`
                    : `Steps to Reach 100/100 Score (${score.recommendations.length})`}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {language === 'tr' ? 'Uygulamak için üzerine tıklayın' : 'Click any item to apply'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {score.recommendations.map((rec, idx) => {
                const cat = getRecCategory(rec);
                const IconComponent = cat.icon;
                return (
                  <div
                    key={idx}
                    onClick={onNavigateTweaks}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#111422] hover:bg-[#161a2e] border border-[#1e2338] hover:border-cyan-500/50 cursor-pointer transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-1.5 rounded-lg border shrink-0 ${cat.color}`}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {cat.label}
                        </span>
                        <span className="text-xs text-slate-200 group-hover:text-cyan-300 transition-colors font-medium truncate block">
                          {translateRecommendation(rec, language)}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 shrink-0 transition-all ml-2" />
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}
    </Card>
  );
};
