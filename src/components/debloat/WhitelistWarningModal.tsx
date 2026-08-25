import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useLanguageStore } from '../../stores/useLanguageStore';

interface WhitelistWarningModalProps {
  packageName: string | null;
  onClose: () => void;
  onConfirmOverride: () => void;
}

export const WhitelistWarningModal: React.FC<WhitelistWarningModalProps> = ({
  packageName,
  onClose,
  onConfirmOverride,
}) => {
  const t = useLanguageStore((s) => s.t);
  if (!packageName) return null;

  return (
    <Modal
      isOpen={!!packageName}
      onClose={onClose}
      title={t.whitelist_warn_title}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-rose-300">
              {t.whitelist_warn_badge}
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              <span className="font-mono font-bold text-white">{packageName}</span>{' '}
              {t.whitelist_warn_msg}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {t.whitelist_warn_detail}
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#202538]">
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t.cancel_recommended}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onConfirmOverride();
              onClose();
            }}
          >
            {t.force_override_btn}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
