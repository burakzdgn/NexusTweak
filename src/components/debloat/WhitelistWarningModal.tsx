import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

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
  if (!packageName) return null;

  return (
    <Modal
      isOpen={!!packageName}
      onClose={onClose}
      title="Critical System Package Warning"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-rose-300">
              High Risk Operation Detected
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              <span className="font-mono font-bold text-white">{packageName}</span> is marked
              in the <strong className="text-rose-400">System Whitelist</strong> as an essential
              OS subsystem component.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Disabling or removing this package may cause system crashes, infinite bootloops, or
          loss of telephony / emergency dialer features. Proceed with extreme caution.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#202538]">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel (Recommended)
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onConfirmOverride();
              onClose();
            }}
          >
            Force Override & Disable
          </Button>
        </div>
      </div>
    </Modal>
  );
};
