import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glow' | 'outline';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = false,
  className,
  ...props
}) => {
  const base = 'rounded-xl transition-all duration-200';

  const variants = {
    default: 'bg-[#11131f] border border-[#202538] text-slate-100 shadow-lg',
    glass: 'bg-[#11131f]/70 backdrop-blur-xl border border-white/5 text-slate-100 shadow-xl',
    glow: 'bg-gradient-to-b from-[#161a2e] to-[#0f1220] border border-cyan-500/20 shadow-glow text-slate-100',
    outline: 'bg-transparent border border-[#23283e] text-slate-200',
  };

  const hover = hoverEffect ? 'hover:border-cyan-500/40 hover:-translate-y-0.5 hover:shadow-glow' : '';

  return (
    <div className={twMerge(clsx(base, variants[variant], hover, className))} {...props}>
      {children}
    </div>
  );
};
