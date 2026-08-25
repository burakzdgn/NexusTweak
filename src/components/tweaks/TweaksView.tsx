import React, { useMemo } from 'react';
import { Search, ShieldCheck, CheckSquare, Square, Zap } from 'lucide-react';
import { useTweaksStore } from '../../stores/useTweaksStore';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { TweakCard } from './TweakCard';
import { TweakCategoryFilter } from './TweakCategoryFilter';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';

export const TweaksView: React.FC = () => {
  const {
    rules,
    selectedRuleIds,
    activeCategory,
    activeRisk,
    searchQuery,
    autoBackupEnabled,
    isApplying,
    toggleSelectRule,
    selectAllVisible,
    clearSelection,
    setCategory,
    setRiskFilter,
    setSearchQuery,
    setAutoBackup,
    applySingleTweak,
    revertSingleTweak,
  } = useTweaksStore();

  const activeDevice = useDeviceStore((s) => s.activeDevice);

  // Filter rules based on category, risk, and search
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      if (activeCategory !== 'all' && r.category !== activeCategory) return false;
      if (activeRisk !== 'all' && r.risk !== activeRisk) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [rules, activeCategory, activeRisk, searchQuery]);

  const allVisibleSelected =
    filteredRules.length > 0 &&
    filteredRules.every((r) => selectedRuleIds.has(r.id));

  const handleToggleSelectAll = () => {
    if (allVisibleSelected) {
      clearSelection();
    } else {
      selectAllVisible(filteredRules.map((r) => r.id));
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Device Optimization Rules
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tailored ADB modifications for{' '}
            <span className="text-cyan-300 font-semibold">
              {activeDevice?.model || 'Connected Device'}
            </span>
          </p>
        </div>

        {/* Search Bar & Auto-Backup Switch */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tweaks or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#121524] border border-[#202538] rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-[#121524] border border-[#202538] rounded-xl shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-slate-300">Auto Backup</span>
            <Switch
              size="sm"
              checked={autoBackupEnabled}
              onChange={(v) => setAutoBackup(v)}
            />
          </div>
        </div>
      </div>

      {/* Filter Category & Risk Controls */}
      <TweakCategoryFilter
        activeCategory={activeCategory}
        onSelectCategory={setCategory}
        activeRisk={activeRisk}
        onSelectRisk={setRiskFilter}
      />

      {/* Action Toolbar */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <button
          onClick={handleToggleSelectAll}
          className="flex items-center gap-2 hover:text-cyan-400 transition-colors"
        >
          {allVisibleSelected ? (
            <CheckSquare className="w-4 h-4 text-cyan-400" />
          ) : (
            <Square className="w-4 h-4 text-slate-500" />
          )}
          <span>
            {allVisibleSelected ? 'Deselect All' : `Select All Visible (${filteredRules.length})`}
          </span>
        </button>

        <span>
          Showing {filteredRules.length} of {rules.length} optimization rules
        </span>
      </div>

      {/* Tweaks Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRules.length === 0 ? (
          <div className="p-12 text-center bg-[#11131f] border border-[#202538] rounded-2xl">
            <p className="text-sm text-slate-300 font-semibold">No matching tweaks found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or risk filters.
            </p>
          </div>
        ) : (
          filteredRules.map((rule) => (
            <TweakCard
              key={rule.id}
              rule={rule}
              isSelected={selectedRuleIds.has(rule.id)}
              onToggleSelect={() => toggleSelectRule(rule.id)}
              onApply={() => applySingleTweak(rule.id).then(() => {})}
              onRevert={() => revertSingleTweak(rule.id).then(() => {})}
              isApplying={isApplying}
            />
          ))
        )}
      </div>
    </div>
  );
};
