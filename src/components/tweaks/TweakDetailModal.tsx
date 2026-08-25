import React from 'react';
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Terminal,
  Zap,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TweakRule } from '../../types/tweaks';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translateTweakRule, translateCategory } from '../../utils/tweakTranslator';
import { getTweakDetail } from '../../data/tweakDetails';

interface TweakDetailModalProps {
  rule: TweakRule | null;
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => Promise<void>;
  onRevert?: () => Promise<void>;
  isApplying?: boolean;
}

export const TweakDetailModal: React.FC<TweakDetailModalProps> = ({
  rule,
  isOpen,
  onClose,
  onApply,
  onRevert,
  isApplying = false,
}) => {
  const { t, language } = useLanguageStore();

  if (!rule) return null;

  const translated = translateTweakRule(rule, language);
  const detail = getTweakDetail(rule.id, language);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={translated.name}
      maxWidth="2xl"
    >
      <div className="space-y-5 text-slate-200">
        {/* Badges Bar */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-[#202538]">
          <Badge risk={rule.risk} size="sm" />
          <Badge variant="purple" size="sm">
            {translateCategory(rule.category, language)}
          </Badge>
          <span className="text-[11px] text-slate-400 font-mono">
            Target: {rule.targetOem.toUpperCase()} {rule.minSdk ? `• Min API ${rule.minSdk}` : ''}
          </span>
          {rule.isApplied && (
            <span className="ml-auto flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
              <Check className="w-3.5 h-3.5" />
              {t.active_badge}
            </span>
          )}
        </div>

        {/* Summary */}
        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          {detail?.summary || translated.description}
        </p>

        {/* How it Works */}
        {detail?.howItWorks && (
          <div className="p-4 rounded-xl bg-[#121524] border border-[#202538] space-y-1.5">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              {language === 'tr' ? 'Nasıl Çalışır?' : 'How It Works'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {detail.howItWorks}
            </p>
          </div>
        )}

        {/* Benefits List */}
        {detail?.benefits && detail.benefits.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {language === 'tr' ? 'Kazanımlar & Avantajlar' : 'Key Benefits'}
            </h4>
            <ul className="space-y-1.5">
              {detail.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Considerations / Side Effects */}
        {detail?.considerations && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-300 uppercase tracking-wider text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {language === 'tr' ? 'Dikkat Edilmesi Gerekenler' : 'Considerations & Notice'}
            </div>
            <p className="text-slate-300 leading-relaxed">
              {detail.considerations}
            </p>
          </div>
        )}

        {/* Reversibility & Safety */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>
            {detail?.reversibility ||
              (language === 'tr'
                ? 'Bu optimizasyon %100 güvenlidir ve tek tıkla geri alınabilir.'
                : 'This optimization is 100% safe and can be reverted with one click.')}
          </span>
        </div>

        {/* Executed ADB Commands */}
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {language === 'tr' ? 'Çalıştırılan ADB Komutları' : 'Executed ADB Commands'}
          </h4>
          <div className="p-3 rounded-xl bg-[#090b12] border border-[#1e2338] font-mono text-[11px] text-cyan-300 overflow-x-auto">
            {rule.applyCommands.map((cmd, i) => (
              <div key={i} className="py-0.5">$ {cmd}</div>
            ))}
          </div>
        </div>

        {/* Action Footer inside Modal */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#202538]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            {language === 'tr' ? 'Kapat' : 'Close'}
          </Button>

          {rule.isApplied ? (
            onRevert && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await onRevert();
                  onClose();
                }}
                isLoading={isApplying}
                leftIcon={<RotateCcw className="w-4 h-4 text-amber-400" />}
              >
                {t.revert_btn}
              </Button>
            )
          ) : (
            onApply && (
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  await onApply();
                  onClose();
                }}
                isLoading={isApplying}
                leftIcon={<Zap className="w-4 h-4" />}
              >
                {t.apply_btn}
              </Button>
            )
          )}
        </div>
      </div>
    </Modal>
  );
};
