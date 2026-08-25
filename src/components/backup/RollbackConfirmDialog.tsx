import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { BackupSnapshot } from '../../types/backup';

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
  if (!snapshot) return null;

  return (
    <Modal
      isOpen={!!snapshot}
      onClose={onClose}
      title="Confirm 1-Click State Rollback"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
          <RotateCcw className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-white">
              Revert to Snapshot: {snapshot.note || snapshot.id}
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Created on {new Date(snapshot.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          This operation will restore all global, system, and secure settings back to their
          exact values at the time of backup, and will re-enable all previously disabled packages.
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
            Execute Rollback Now
          </Button>
        </div>
      </div>
    </Modal>
  );
};
