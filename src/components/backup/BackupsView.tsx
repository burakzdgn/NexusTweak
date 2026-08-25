import React, { useEffect, useState } from 'react';
import { History, Plus, RotateCcw, ShieldCheck, RefreshCw } from 'lucide-react';
import { useBackupStore } from '../../stores/useBackupStore';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { BackupTimeline } from './BackupTimeline';
import { SnapshotDiffModal } from './SnapshotDiffModal';
import { RollbackConfirmDialog } from './RollbackConfirmDialog';
import { Button } from '../ui/Button';

export const BackupsView: React.FC = () => {
  const {
    backups,
    isLoading,
    isRestoring,
    selectedBackupForDiff,
    activeRollbackTarget,
    fetchBackups,
    createBackup,
    restoreBackup,
    deleteBackup,
    setSelectedBackupForDiff,
    setActiveRollbackTarget,
  } = useBackupStore();

  const activeSerial = useDeviceStore((s) => s.activeSerial);
  const [newNote, setNewNote] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups, activeSerial]);

  const handleCreate = async () => {
    setIsCreating(true);
    await createBackup(newNote || 'Manual Snapshot');
    setNewNote('');
    setIsCreating(false);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Diff Inspector Modal */}
      <SnapshotDiffModal
        snapshot={selectedBackupForDiff}
        onClose={() => setSelectedBackupForDiff(null)}
      />

      {/* Rollback Confirmation Modal */}
      <RollbackConfirmDialog
        snapshot={activeRollbackTarget}
        onClose={() => setActiveRollbackTarget(null)}
        onConfirm={async () => {
          if (activeRollbackTarget) {
            await restoreBackup(activeRollbackTarget.id);
          }
        }}
        isRestoring={isRestoring}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Device State Backups & 1-Click Rollback
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Safe restoration snapshots stored locally in{' '}
            <code className="text-cyan-300 font-mono">device_backups/</code>
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => fetchBackups()}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh Backups
        </Button>
      </div>

      {/* Quick Snapshot Creator Card */}
      <div className="p-5 bg-[#11131f] border border-[#202538] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Create New Manual Snapshot</h4>
            <p className="text-xs text-slate-400">
              Captures all system settings namespaces and disabled package states.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Snapshot label / note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="flex-1 sm:w-60 px-3 py-1.5 bg-[#141724] border border-[#202538] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreate}
            isLoading={isCreating}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Snapshot
          </Button>
        </div>
      </div>

      {/* Backup Timeline List */}
      <BackupTimeline
        backups={backups}
        onInspect={(b) => setSelectedBackupForDiff(b)}
        onRollback={(b) => setActiveRollbackTarget(b)}
        onDelete={(id) => deleteBackup(id)}
      />
    </div>
  );
};
