import React, { useMemo } from 'react';
import { Search, ShieldCheck, CheckSquare, Square, Zap } from 'lucide-react';
import { useTweaksStore } from '../../stores/useTweaksStore';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { TweakCard } from './TweakCard';
import { TweakCategoryFilter } from './TweakCategoryFilter';
import { Switch } from '../ui/Switch';
import { translateTweakRule } from '../../utils/tweakTranslator';

export const TweaksView: React.FC = () => {
  const {
    rules,
    selectedRuleIds,
    activeCategory,
    activeRisk,
    statusFilter,
    searchQuery,
    autoBackupEnabled,
    isApplying,
    toggleSelectRule,
    selectAllVisible,
    clearSelection,
    setCategory,
    setRiskFilter,
    setStatusFilter,
    setSearchQuery,
    setAutoBackup,
    applySingleTweak,
    revertSingleTweak,
  } = useTweaksStore();

  const activeDevice = useDeviceStore((s) => s.activeDevice);
  const { t, language } = useLanguageStore();

  // Filter rules based on category, risk, status, and search
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      if (activeCategory !== 'all' && r.category !== activeCategory) return false;
      if (activeRisk !== 'all' && r.risk !== activeRisk) return false;
      if (statusFilter === 'unapplied' && r.isApplied) return false;
      if (statusFilter === 'applied' && !r.isApplied) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const translated = translateTweakRule(r, language);
        return (
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          translated.name.toLowerCase().includes(q) ||
          translated.description.toLowerCase().includes(q) ||
          r.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [rules, activeCategory, activeRisk, statusFilter, searchQuery, language]);

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
            {t.device_optimization_rules}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t.tailored_for}{' '}
            <span className="text-cyan-300 font-semibold">
              {activeDevice?.model || 'Android'}
            </span>
          </p>
        </div>

        {/* Search Bar & Auto-Backup Switch */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.search_tweaks}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#121524] border border-[#202538] rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-[#121524] border border-[#202538] rounded-xl shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-slate-300">{t.auto_backup}</span>
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
        activeStatus={statusFilter}
        onSelectStatus={setStatusFilter}
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
            {allVisibleSelected ? t.deselect_all : `${t.select_all_visible} (${filteredRules.length})`}
          </span>
        </button>

        <span>
          {filteredRules.length} / {rules.length} {t.showing_rules}
        </span>
      </div>

      {/* Tweaks Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRules.length === 0 ? (
          <div className="p-12 text-center bg-[#11131f] border border-[#202538] rounded-2xl">
            <p className="text-sm text-slate-300 font-semibold">{t.no_matching_tweaks}</p>
            <p className="text-xs text-slate-500 mt-1">
              {t.no_matching_tweaks_desc}
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
