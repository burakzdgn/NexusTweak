import React, { useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { DisclaimerModal } from './DisclaimerModal';

export const DisclaimerBanner: React.FC = () => {
  const t = useLanguageStore((s) => s.t);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <DisclaimerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="p-3 bg-gradient-to-r from-amber-500/10 via-[#121524] to-[#121524] border border-amber-500/20 rounded-2xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-slate-300 font-medium truncate">
            {t.disclaimer_short}
          </span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 underline underline-offset-2 shrink-0 text-[11px] transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          {t.disclaimer_badge}
        </button>
      </div>
    </>
  );
};
