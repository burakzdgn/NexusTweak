import React, { useState } from 'react';
import { Zap, Check, RotateCcw, Tag, Info, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { TweakRule } from '../../types/tweaks';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translateTweakRule, translateCategory } from '../../utils/tweakTranslator';
import { TweakDetailModal } from './TweakDetailModal';

interface TweakCardProps {
  rule: TweakRule;
  isSelected: boolean;
  onToggleSelect: () => void;
  onApply: () => Promise<void>;
  onRevert: () => Promise<void>;
  isApplying: boolean;
}

export const TweakCard: React.FC<TweakCardProps> = ({
  rule,
  isSelected,
  onToggleSelect,
  onApply,
  onRevert,
  isApplying,
}) => {
  const [showDetail, setShowDetail] = useState(false);
  const [showDozeConfirm, setShowDozeConfirm] = useState(false);
  const { t, language } = useLanguageStore();
  const translated = translateTweakRule(rule, language);

  const handleApplyClick = () => {
    if (rule.id === 'gen_aggressive_doze' && !rule.isApplied) {
      setShowDozeConfirm(true);
    } else {
      onApply();
    }
  };

  return (
    <>
      <Card
        className={`p-5 transition-all duration-200 ${
          isSelected ? 'border-cyan-500/50 bg-[#141829]' : 'hover:border-slate-700'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left: Checkbox + Title & Badges */}
          <div className="flex items-start gap-3.5 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="mt-1 w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 cursor-pointer"
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-wide">{translated.name}</h4>
                <button
                  type="button"
                  onClick={() => setShowDetail(true)}
                  className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#1a1f33] transition-colors"
                  title={language === 'tr' ? 'Detaylı Açıklama' : 'Detailed Explanation'}
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
                <Badge risk={rule.risk} size="sm" />
                <Badge variant="purple" size="sm">
                  {translateCategory(rule.category, language)}
                </Badge>
                {rule.isApplied && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <Check className="w-3 h-3" /> {t.active_badge}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {translated.description}
              </p>

              {/* Special Warning Banner for Aggressive Doze */}
              {rule.id === 'gen_aggressive_doze' && (
                <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                        {language === 'tr' ? '⚠️ Önemli Bildirim Uyarısı' : '⚠️ Important Notification Notice'}
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-medium">
                        {language === 'tr' ? 'Puanı Düşürmez' : 'No Score Penalty'}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {language === 'tr'
                        ? 'Bu ayar ekran kapandığında cihazı anında derin uykuya sokar. WhatsApp, Instagram, Telegram gibi uygulamaların bildirimleri ekran açılana veya uygulamaya girilene kadar gecikebilir ya da gelmeyebilir. Bu ayarı uygulamamak optimizasyon puanınızı düşürmez.'
                        : 'This tweak puts the device into deep sleep when the screen is off. Push notifications from WhatsApp, Instagram, Telegram etc. may be delayed until you turn on the screen or open the app. Leaving this disabled will NOT lower your score.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Target OEM & Command Preview */}
              <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-[#1e2338] text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-slate-400">
                  <Tag className="w-3 h-3 text-cyan-400" />
                  {t.target_oem}: {rule.targetOem.toUpperCase()}
                </span>

                {rule.minSdk && (
                  <span>{t.min_sdk}: {rule.minSdk}</span>
                )}

                <span className="text-slate-500 truncate max-w-xs">
                  {rule.applyCommands[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Direct Toggle or Apply/Revert Button */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {rule.isApplied ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onRevert}
                isLoading={isApplying}
                leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-400" />}
                className="text-xs"
              >
                {t.revert_btn}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyClick}
                isLoading={isApplying}
                leftIcon={<Zap className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                {t.apply_btn}
              </Button>
            )}
          </div>
        </div>
      </Card>

      <TweakDetailModal
        rule={rule}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        onApply={onApply}
        onRevert={onRevert}
        isApplying={isApplying}
      />

      {/* Aggressive Doze Confirmation Modal */}
      <Modal
        isOpen={showDozeConfirm}
        onClose={() => setShowDozeConfirm(false)}
        title={language === 'tr' ? '⚠️ Agresif Doze & Bildirim Uyarısı' : '⚠️ Aggressive Doze Notice'}
        maxWidth="md"
      >
        <div className="space-y-4 text-slate-200">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1.5">
              <p className="font-bold text-amber-300">
                {language === 'tr'
                  ? 'Uygulama Bildirimleriniz Gecikebilir!'
                  : 'Your App Notifications May Be Delayed!'}
              </p>
              <p className="text-slate-300 leading-relaxed">
                {language === 'tr'
                  ? 'Agresif Doze modu, ekran kapandığı andan itibaren telefonun tüm arka plan internet ve senkronizasyon soketlerini dondurur. Bu nedenle WhatsApp, Instagram, Telegram veya e-posta bildirimleri ekranı açıp uygulamaya girene kadar gelmeyebilir.'
                  : 'Aggressive Doze freezes background internet sockets and wakeups when the screen turns off. Messaging apps like WhatsApp and Instagram may not deliver notifications until you turn on the screen and open them.'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#121524] border border-[#202538] text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-cyan-300">
              {language === 'tr' ? '💡 Bilgilendirme:' : '💡 Note:'}
            </p>
            <p className="text-[11px] text-slate-400">
              {language === 'tr'
                ? 'Bu ayarı uygulamak zorunda değilsiniz. Bu ayarı kapalı tutmak 100/100 Optimizasyon Puanı almanızı engellemez.'
                : 'You do not need to apply this tweak. Leaving it disabled will NOT prevent you from reaching a 100/100 Optimization Score.'}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#202538]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDozeConfirm(false)}
            >
              {language === 'tr' ? 'Vazgeç (Önerilen)' : 'Cancel (Recommended)'}
            </Button>

            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                setShowDozeConfirm(false);
                await onApply();
              }}
              isLoading={isApplying}
              leftIcon={<Zap className="w-3.5 h-3.5" />}
            >
              {language === 'tr' ? 'Riskleri Kabul Ediyorum, Uygula' : 'I Understand, Apply'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
