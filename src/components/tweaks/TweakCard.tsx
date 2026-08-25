import React from 'react';
import { Zap, Check, RotateCcw, Tag } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TweakRule } from '../../types/tweaks';
import { useLanguageStore } from '../../stores/useLanguageStore';

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
  const t = useLanguageStore((s) => s.t);

  return (
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
              <h4 className="text-sm font-bold text-white tracking-wide">{rule.name}</h4>
              <Badge risk={rule.risk} size="sm" />
              <Badge variant="purple" size="sm">
                {rule.category}
              </Badge>
              {rule.isApplied && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  <Check className="w-3 h-3" /> {t.active_badge}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {rule.description}
            </p>

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
              onClick={onApply}
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
  );
};
