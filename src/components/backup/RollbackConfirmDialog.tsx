import React from 'react';
import { RotateCcw, Smartphone, Calendar } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { BackupSnapshot } from '../../types/backup';
import { useLanguageStore } from '../../stores/useLanguageStore';

interface RollbackConfirmDialogProps {
  snapshot: BackupSnapshot | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isRestoring: boolean;
}

export const RollbackConfirmDialog: React.FC<RollbackConfirmDialogProps> = ({
  snapshot,
  onClose,
  onConfirm,
  isRestoring,
}) => {
  const t = useLanguageStore((s) => s.t);
  if (!snapshot) return null;

  return (
    <Modal
      isOpen={!!snapshot}
      onClose={onClose}
      title={t.confirm_rollback_title}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
          <RotateCcw className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">
              {t.revert_to_snapshot} {snapshot.note || snapshot.id}
            </h4>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 font-mono">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              {snapshot.device_name || snapshot.device_serial}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              {new Date(snapshot.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {t.rollback_explanation}
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#202538]">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isRestoring}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            isLoading={isRestoring}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            {t.rollback_now_btn}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
