import React from 'react';
import { AlertTriangle, ShieldAlert, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useLanguageStore } from '../../stores/useLanguageStore';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  const t = useLanguageStore((s) => s.t);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.disclaimer_title} maxWidth="lg">
      <div className="space-y-4">
        {/* Warning Badge */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-300">
              {t.disclaimer_badge}
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {t.disclaimer_short}
            </p>
          </div>
        </div>

        {/* Full Legal Text */}
        <div className="p-4 rounded-2xl bg-[#0e111d] border border-[#202538] text-xs text-slate-300 space-y-3 leading-relaxed">
          <p>{t.disclaimer_text}</p>
          <div className="p-3 bg-[#131626] rounded-xl border border-slate-700/60 font-mono text-[11px] text-slate-400">
            • Safe debloating isolates packages via <code className="text-cyan-300">--user 0</code>.<br />
            • Automatic snapshots are taken before critical operations.<br />
            • Display & DPI scaling is applied in real-time via Android WindowManager.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#202538]">
          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            leftIcon={<Check className="w-4 h-4" />}
          >
            {t.disclaimer_agree}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
