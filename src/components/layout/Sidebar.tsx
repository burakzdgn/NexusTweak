import React from 'react';
import {
  LayoutDashboard,
  Zap,
  Trash2,
  History,
  Terminal,
  Settings,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useTweaksStore } from '../../stores/useTweaksStore';
import { useDebloatStore } from '../../stores/useDebloatStore';
import { useBackupStore } from '../../stores/useBackupStore';

export type NavTab =
  | 'dashboard'
  | 'tweaks'
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

  const appliedTweaksCount = rules.filter((r) => r.isApplied).length;
  const bloatCount = packages.filter((p) => p.bloat_category && p.is_enabled).length;

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'tweaks' as NavTab,
      label: 'Optimizations',
      icon: Zap,
      badge: appliedTweaksCount > 0 ? `${appliedTweaksCount} Active` : null,
      badgeColor: 'cyan',
    },
    {
      id: 'debloat' as NavTab,
      label: 'Debloat Manager',
      icon: Trash2,
      badge: bloatCount > 0 ? `${bloatCount} Detected` : null,
      badgeColor: 'amber',
    },
    {
      id: 'backups' as NavTab,
      label: 'Rollback & Backups',
      icon: History,
      badge: backups.length > 0 ? `${backups.length}` : null,
      badgeColor: 'slate',
    },
    {
      id: 'terminal' as NavTab,
      label: 'ADB Terminal',
      icon: Terminal,
      badge: null,
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 h-screen bg-[#0c0e17] border-r border-[#1a1e2f] flex flex-col justify-between select-none">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#1a1e2f]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow border border-cyan-400/40">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wider text-white flex items-center gap-1.5">
              Nexus<span className="text-cyan-400">Tweak</span>
            </h1>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              ADB Optimizer v1.0
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={clsx(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/5 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#141724]'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={clsx(
                      'w-4 h-4 transition-transform group-hover:scale-110',
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={clsx(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
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

      {/* Safety & Status Badge Footer */}
      <div className="p-4 border-t border-[#1a1e2f] bg-[#090b12]/50">
        <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#121524] border border-[#202538]">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-200">SafeGuard Active</p>
            <p className="text-[10px] text-slate-400 truncate">Auto snapshot & Whitelist</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
