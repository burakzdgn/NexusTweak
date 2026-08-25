import React from 'react';
import { clsx } from 'clsx';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  size = 'md',
}) => {
  const isSm = size === 'sm';

  return (
    <label
      className={clsx(
        'inline-flex items-center gap-2.5 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          'relative transition-colors duration-200 rounded-full border',
          isSm ? 'w-8 h-4.5 p-0.5' : 'w-11 h-6 p-0.5',
          checked
            ? 'bg-cyan-500 border-cyan-400 shadow-glow'
            : 'bg-slate-800 border-slate-700'
        )}
      >
        <div
          className={clsx(
            'bg-white rounded-full transition-transform duration-200 shadow-sm',
            isSm ? 'w-3.5 h-3.5' : 'w-5 h-5',
            checked ? (isSm ? 'translate-x-3.5' : 'translate-x-5') : 'translate-x-0'
          )}
        />
      </div>
      {label && <span className="text-sm font-medium text-slate-300">{label}</span>}
    </label>
  );
};
