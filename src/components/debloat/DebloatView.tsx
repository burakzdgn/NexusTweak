import React, { useMemo } from 'react';
import { Trash2, Search, Sparkles } from 'lucide-react';
import { useDebloatStore } from '../../stores/useDebloatStore';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { DebloatTable } from './DebloatTable';
import { WhitelistWarningModal } from './WhitelistWarningModal';
import { DebloatFilter } from '../../types/debloat';
import { Button } from '../ui/Button';

export const DebloatView: React.FC = () => {
  const {
    packages,
    selectedPackages,
    filter,
    searchQuery,
    isProcessing,
    whitelistWarningTarget,
    toggleSelectPackage,
    selectAllSafeBloat,
    setFilter,
    setSearchQuery,
    setWhitelistWarningTarget,
    debloatSinglePackage,
    restoreSinglePackage,
  } = useDebloatStore();

  const activeDevice = useDeviceStore((s) => s.activeDevice);
  const t = useLanguageStore((s) => s.t);

  // Filter package list
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      // Tab filters
      if (filter === 'bloat' && !pkg.bloat_category) return false;
      if (filter === 'safe' && (pkg.risk_level !== 'Safe' || !pkg.bloat_category))
        return false;
      if (filter === 'system' && !pkg.is_system) return false;
      if (filter === 'user' && pkg.is_system) return false;
      if (filter === 'disabled' && pkg.is_enabled) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          pkg.package_name.toLowerCase().includes(q) ||
          (pkg.app_name && pkg.app_name.toLowerCase().includes(q)) ||
          (pkg.bloat_description && pkg.bloat_description.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [packages, filter, searchQuery]);

  const safeBloatCount = packages.filter(
    (p) => p.bloat_category && p.risk_level === 'Safe' && p.is_enabled
  ).length;

  const handleDebloat = (pkgName: string) => {
    const target = packages.find((p) => p.package_name === pkgName);
    if (target?.is_whitelisted) {
      setWhitelistWarningTarget(pkgName);
    } else {
      debloatSinglePackage(pkgName);
    }
  };

  const tabs: { id: DebloatFilter; label: string; count?: number }[] = [
    {
      id: 'bloat',
      label: t.tab_bloat,
      count: packages.filter((p) => p.bloat_category && p.is_enabled).length,
    },
    { id: 'safe', label: t.tab_safe_to_remove, count: safeBloatCount },
    { id: 'all', label: t.tab_all_packages, count: packages.length },
    { id: 'system', label: t.tab_system_apps },
    { id: 'user', label: t.tab_user_apps },
    {
      id: 'disabled',
      label: t.tab_disabled_packages,
      count: packages.filter((p) => !p.is_enabled).length,
    },
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Whitelist Alert Modal */}
      <WhitelistWarningModal
        packageName={whitelistWarningTarget}
        onClose={() => setWhitelistWarningTarget(null)}
        onConfirmOverride={() => {
          if (whitelistWarningTarget) {
            debloatSinglePackage(whitelistWarningTarget, true);
          }
        }}
      />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-amber-400" />
            {t.debloat_title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t.debloat_subtitle}{' '}
            <span className="text-cyan-300 font-semibold">
              {activeDevice?.model || 'Android'}
            </span>
          </p>
        </div>

        {/* Search & 1-Click Safe Selection */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.search_packages}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#121524] border border-[#202538] rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {safeBloatCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={selectAllSafeBloat}
              leftIcon={<Sparkles className="w-4 h-4 text-amber-400" />}
              className="shrink-0 text-xs"
            >
              {t.select_all_safe} ({safeBloatCount})
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border ${
                isActive
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm font-semibold'
                  : 'bg-[#121524] border-[#202538] text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Debloat Table Component */}
      <DebloatTable
        packages={filteredPackages}
        selectedPackages={selectedPackages}
        onToggleSelect={toggleSelectPackage}
        onDebloat={handleDebloat}
        onRestore={restoreSinglePackage}
        isProcessing={isProcessing}
      />
    </div>
  );
};
