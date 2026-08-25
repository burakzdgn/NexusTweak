import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RiskLevel } from '../../types/tweaks';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translateRisk } from '../../utils/tweakTranslator';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'slate';
  risk?: RiskLevel;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant,
  risk,
  size = 'md',
  className,
  ...props
}) => {
  const language = useLanguageStore((s) => s.language);
  let effectiveVariant = variant || 'slate';

  if (risk) {
    switch (risk) {
      case 'Safe':
        effectiveVariant = 'emerald';
        break;
      case 'Moderate':
        effectiveVariant = 'amber';
        break;
      case 'Advanced':
        effectiveVariant = 'rose';
        break;
    }
  }

  const variants = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  const label = risk ? translateRisk(risk, language) : children;

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center font-medium rounded-md border tracking-wide uppercase',
          variants[effectiveVariant],
          sizes[size],
          className
        )
      )}
      {...props}
    >
      {label}
    </span>
  );
};
