import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTweaksStore } from '../../stores/useTweaksStore';
import { useDebloatStore } from '../../stores/useDebloatStore';
import { useLanguageStore } from '../../stores/useLanguageStore';

interface BatchActionBarProps {
  currentTab: string;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({ currentTab }) => {
  const {
    selectedRuleIds,
    clearSelection: clearTweakSelection,
    applySelectedBatch: applyBatchTweaks,
    isApplying: isApplyingTweaks,
  } = useTweaksStore();

  const {
    selectedPackages,
    clearSelection: clearDebloatSelection,
    debloatSelectedBatch,
    isProcessing: isDebloating,
  } = useDebloatStore();

  const t = useLanguageStore((s) => s.t);

  const isTweaks = currentTab === 'tweaks' && selectedRuleIds.size > 0;
  const isDebloat = currentTab === 'debloat' && selectedPackages.size > 0;

  if (!isTweaks && !isDebloat) return null;

  const count = isTweaks ? selectedRuleIds.size : selectedPackages.size;
  const isProcessing = isTweaks ? isApplyingTweaks : isDebloating;

  const handleApply = async () => {
    if (isTweaks) {
      await applyBatchTweaks();
    } else {
      await debloatSelectedBatch();
    }
  };

  const handleClear = () => {
    if (isTweaks) {
      clearTweakSelection();
    } else {
      clearDebloatSelection();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#11131f]/95 border border-cyan-500/30 rounded-2xl shadow-2xl backdrop-blur-xl px-6 py-3.5 flex items-center gap-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
            {count}
          </div>
          <div>
            <p className="text-xs font-semibold text-white">
              {isTweaks ? `${count} ${t.tweaks_selected}` : `${count} ${t.pkgs_selected}`}
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              {t.safeguard_desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-1" /> {t.clear_btn}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleApply}
            isLoading={isProcessing}
            leftIcon={<Zap className="w-4 h-4" />}
          >
            {isTweaks
              ? `${t.apply_batch_tweaks} (${count})`
              : `${t.apply_batch_debloat} (${count})`}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
