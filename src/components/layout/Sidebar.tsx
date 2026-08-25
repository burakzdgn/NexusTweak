import React, { useState } from 'react';
import {
  LayoutDashboard,
  Zap,
  Sliders,
  Package,
  Monitor,
  Trash2,
  History,
  Terminal,
  Settings,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useTweaksStore } from '../../stores/useTweaksStore';
import { useDebloatStore } from '../../stores/useDebloatStore';
import { useBackupStore } from '../../stores/useBackupStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { DisclaimerModal } from '../legal/DisclaimerModal';

export type NavTab =
  | 'dashboard'
  | 'profiles'
  | 'tweaks'
  | 'apk'
  | 'display'
  | 'debloat'
  | 'backups'
  | 'terminal'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const rules = useTweaksStore((s) => s.rules);
  const packages = useDebloatStore((s) => s.packages);
  const backups = useBackupStore((s) => s.backups);
  const t = useLanguageStore((s) => s.t);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  const appliedTweaksCount = rules.filter((r) => r.isApplied).length;
  const bloatCount = packages.filter((p) => p.bloat_category && p.is_enabled).length;

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: t.tab_dashboard,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'profiles' as NavTab,
      label: t.tab_profiles,
      icon: Sliders,
      badge: null,
    },
    {
      id: 'tweaks' as NavTab,
      label: t.tab_tweaks,
      icon: Zap,
      badge: appliedTweaksCount > 0 ? `${appliedTweaksCount} ${t.active_count}` : null,
      badgeColor: 'cyan',
    },
    {
      id: 'apk' as NavTab,
      label: t.tab_apk,
      icon: Package,
      badge: null,
    },
    {
      id: 'display' as NavTab,
      label: t.tab_display,
      icon: Monitor,
      badge: null,
    },
    {
      id: 'debloat' as NavTab,
      label: t.tab_debloat,
      icon: Trash2,
      badge: bloatCount > 0 ? `${bloatCount} ${t.detected_count}` : null,
      badgeColor: 'amber',
    },
    {
      id: 'backups' as NavTab,
      label: t.tab_backups,
      icon: History,
      badge: backups.length > 0 ? `${backups.length}` : null,
      badgeColor: 'slate',
    },
    {
      id: 'terminal' as NavTab,
      label: t.tab_terminal,
      icon: Terminal,
      badge: null,
    },
    {
      id: 'settings' as NavTab,
      label: t.tab_settings,
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 h-screen bg-[#0c0e17] border-r border-[#1a1e2f] flex flex-col justify-between select-none">
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />

      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1a1e2f]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow border border-cyan-400/40">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wider text-white flex items-center gap-1">
              Nexus<span className="text-cyan-400">Tweak</span>
            </h1>
            <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase">
              {t.app_subtitle}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={clsx(
                  'w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/5 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#141724]'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={clsx(
                      'w-3.5 h-3.5 transition-transform group-hover:scale-110',
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={clsx(
                      'text-[9px] font-semibold px-1.5 py-0.2 rounded-full border',
                      item.badgeColor === 'cyan' &&
                        'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                      item.badgeColor === 'amber' &&
                        'bg-amber-500/10 text-amber-400 border-amber-500/20',
                      item.badgeColor === 'slate' &&
                        'bg-slate-800 text-slate-400 border-slate-700'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Safeguard & Disclaimer Trigger */}
      <div className="p-3 border-t border-[#1a1e2f] bg-[#090b12]/50 space-y-2">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#121524] border border-[#202538]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-slate-200">{t.safeguard_active}</p>
            <p className="text-[9px] text-slate-400 truncate">{t.safeguard_desc}</p>
          </div>
        </div>

        <button
          onClick={() => setIsDisclaimerOpen(true)}
          className="w-full text-left flex items-center gap-1.5 px-2 py-1 text-[10px] text-amber-400/90 hover:text-amber-300 transition-colors"
        >
          <AlertTriangle className="w-3 h-3" />
          <span className="truncate underline underline-offset-2">{t.disclaimer_badge}</span>
        </button>
      </div>
    </aside>
  );
};
