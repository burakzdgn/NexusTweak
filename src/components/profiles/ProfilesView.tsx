import React from 'react';
import {
  Gamepad2,
  BatteryCharging,
  ShieldCheck,
  Cpu,
  Zap,
  Check,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useProfileStore } from '../../stores/useProfileStore';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { DisclaimerBanner } from '../legal/DisclaimerBanner';
import { OptimizationProfile } from '../../types/profiles';

export const ProfilesView: React.FC = () => {
  const {
    profiles,
    activeProfileId,
    isApplying,
    selectedProfileForConfirm,
    setSelectedProfileForConfirm,
    applyProfile,
  } = useProfileStore();

  const activeDevice = useDeviceStore((s) => s.activeDevice);
  const t = useLanguageStore((s) => s.t);

  const getProfileIcon = (name: OptimizationProfile['iconName']) => {
    switch (name) {
      case 'Gamepad2':
        return Gamepad2;
      case 'BatteryCharging':
        return BatteryCharging;
      case 'ShieldCheck':
        return ShieldCheck;
      default:
        return Cpu;
    }
  };

  const getBadgeColorStyles = (color: OptimizationProfile['badgeColor']) => {
    switch (color) {
      case 'amber':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'emerald':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'purple':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!selectedProfileForConfirm}
        onClose={() => setSelectedProfileForConfirm(null)}
        title={t.profile_confirm_title}
        maxWidth="md"
      >
        {selectedProfileForConfirm && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
              <Zap className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-white">
                  {selectedProfileForConfirm.name}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {selectedProfileForConfirm.description}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#0d101c] rounded-xl border border-[#202538] text-xs text-slate-300 space-y-2">
              <span className="font-bold text-cyan-300">
                {t.what_will_be_restored}
              </span>
              <ul className="text-[11px] text-slate-400 space-y-1 font-mono">
                {Object.entries(selectedProfileForConfirm.settingsOverride).map(([k, v]) => (
                  <li key={k} className="flex justify-between">
                    <span className="text-slate-300">{k}:</span>
                    <span className="text-emerald-400 font-bold">{v}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#202538]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProfileForConfirm(null)}
                disabled={isApplying}
              >
                {t.cancel_recommended}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => applyProfile(selectedProfileForConfirm)}
                isLoading={isApplying}
                leftIcon={<Zap className="w-4 h-4" />}
              >
                {t.apply_profile_btn}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          {t.profiles_title}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {t.profiles_subtitle} (
          <span className="text-cyan-300 font-semibold">
            {activeDevice?.model || 'Android'}
          </span>
          )
        </p>
      </div>

      {/* Profiles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {profiles.map((profile) => {
          const Icon = getProfileIcon(profile.iconName);
          const isCurrentActive = activeProfileId === profile.id;

          return (
            <Card
              key={profile.id}
              className={`p-6 flex flex-col justify-between transition-all duration-300 ${
                isCurrentActive
                  ? 'border-cyan-500/60 bg-[#141829] shadow-glow'
                  : 'hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-3 rounded-2xl border ${getBadgeColorStyles(
                        profile.badgeColor
                      )}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-wide">
                        {profile.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {profile.rulesToApply.length} rules •{' '}
                        {profile.packagesToDebloat.length} bloat targets
                      </span>
                    </div>
                  </div>

                  {isCurrentActive && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" />
                      {t.profile_applied_badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 mt-4 leading-relaxed">
                  {profile.description}
                </p>

                {/* Overrides Preview */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#1e2338]">
                  {profile.id === 'gaming_ultra' && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-mono">
                      Refresh Rate: <strong>{Math.max(60, ...(activeDevice?.display.supported_refresh_rates || [60]))}Hz</strong>
                    </span>
                  )}
                  {profile.id === 'battery_extreme' && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono">
                      Doze Mode: <strong>Aggressive Deep Sleep</strong>
                    </span>
                  )}
                  {profile.id === 'privacy_hardened' && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-[10px] text-purple-300 font-mono">
                      DNS: <strong>AdGuard DoT</strong>
                    </span>
                  )}
                  {Object.entries(profile.settingsOverride).map(([k, v]) => {
                    if (k.includes('refresh_rate') && profile.id === 'gaming_ultra') return null;
                    return (
                      <span
                        key={k}
                        className="px-2 py-0.5 rounded-md bg-[#131525] border border-slate-800 text-[10px] text-slate-400 font-mono"
                      >
                        {k}: <strong className="text-slate-200">{v}</strong>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant={isCurrentActive ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => setSelectedProfileForConfirm(profile)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                >
                  {t.apply_profile_btn}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
