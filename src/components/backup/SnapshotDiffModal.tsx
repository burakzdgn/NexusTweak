import React from 'react';
import { Eye, FileCode, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { BackupSnapshot } from '../../types/backup';

interface SnapshotDiffModalProps {
  snapshot: BackupSnapshot | null;
  onClose: () => void;
}

export const SnapshotDiffModal: React.FC<SnapshotDiffModalProps> = ({
  snapshot,
  onClose,
}) => {
  if (!snapshot) return null;

  return (
    <Modal
      isOpen={!!snapshot}
      onClose={onClose}
      title={`Snapshot Inspector: ${snapshot.id}`}
      maxWidth="lg"
    >
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        {/* Metadata Banner */}
        <div className="p-3 bg-[#141724] border border-[#202538] rounded-xl text-xs space-y-1">
          <p className="text-slate-300">
            <strong className="text-white">Device Serial:</strong> {snapshot.device_serial}
          </p>
          <p className="text-slate-300">
            <strong className="text-white">Timestamp:</strong>{' '}
            {new Date(snapshot.timestamp).toLocaleString()}
          </p>
          <p className="text-slate-300">
            <strong className="text-white">Note:</strong> {snapshot.note || 'None'}
          </p>
        </div>

        {/* Global Settings Section */}
        <div>
          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5" />
            Global Settings Dump ({Object.keys(snapshot.settings_global).length} entries)
          </h4>
          <div className="bg-[#090a0f] p-3 rounded-xl border border-[#202538] font-mono text-[11px] max-h-40 overflow-y-auto space-y-1">
            {Object.keys(snapshot.settings_global).length === 0 ? (
              <span className="text-slate-500">No custom global keys recorded</span>
            ) : (
              Object.entries(snapshot.settings_global).map(([k, v]) => (
                <div key={k} className="flex justify-between text-slate-300">
                  <span className="text-cyan-300">{k}</span>
                  <span className="text-slate-400 font-bold">{v}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Disabled Packages Snapshot */}
        <div>
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Disabled / Debloated Packages ({snapshot.disabled_packages.length})
          </h4>
          <div className="bg-[#090a0f] p-3 rounded-xl border border-[#202538] font-mono text-[11px] max-h-36 overflow-y-auto space-y-1">
            {snapshot.disabled_packages.length === 0 ? (
              <span className="text-slate-500">No packages were disabled</span>
            ) : (
              snapshot.disabled_packages.map((pkg) => (
                <p key={pkg} className="text-amber-300 truncate">
                  {pkg}
                </p>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </Modal>
  );
};
