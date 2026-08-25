import React from 'react';
import { FileCode, CheckCircle2, RotateCcw, Smartphone, Clock, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { BackupSnapshot } from '../../types/backup';
import { useLanguageStore } from '../../stores/useLanguageStore';

interface SnapshotDiffModalProps {
  snapshot: BackupSnapshot | null;
  onClose: () => void;
  onRollback?: (snapshot: BackupSnapshot) => void;
}

export const SnapshotDiffModal: React.FC<SnapshotDiffModalProps> = ({
  snapshot,
  onClose,
  onRollback,
}) => {
  const t = useLanguageStore((s) => s.t);
  if (!snapshot) return null;

  return (
    <Modal
      isOpen={!!snapshot}
      onClose={onClose}
      title={t.snapshot_diff_title}
      maxWidth="lg"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Device & Timestamp Banner */}
        <div className="p-4 bg-gradient-to-r from-[#141728] to-[#101220] border border-cyan-500/30 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>{snapshot.device_name || snapshot.device_serial}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              {new Date(snapshot.timestamp).toLocaleString()}
            </span>
          </div>

          <p className="text-xs text-cyan-300 font-medium">
            <strong>{t.created_at}</strong> {snapshot.note || 'Auto Snapshot'}
          </p>
        </div>

        {/* Highlighted Rollback Summary */}
        <div className="p-3.5 rounded-xl bg-[#0e111d] border border-[#202538]">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {t.what_will_be_restored}
          </h4>
          <ul className="text-[11px] text-slate-300 space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>
                <strong>{Object.keys(snapshot.settings_global).length} Global Settings</strong> (Animation scales, DNS hostname, Doze constants)
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>
                <strong>{Object.keys(snapshot.settings_system).length} System Settings</strong> (Display peak/min refresh rates)
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>
                <strong>{snapshot.disabled_packages.length} Packages</strong> will be re-enabled & re-installed for User 0
              </span>
            </li>
          </ul>
        </div>

        {/* Global Settings Section */}
        <div>
          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5" />
            {t.settings_dump} ({Object.keys(snapshot.settings_global).length})
          </h4>
          <div className="bg-[#090a0f] p-3 rounded-xl border border-[#202538] font-mono text-[11px] max-h-40 overflow-y-auto space-y-1">
            {Object.keys(snapshot.settings_global).length === 0 ? (
              <span className="text-slate-500">No settings keys recorded</span>
            ) : (
              Object.entries(snapshot.settings_global).map(([k, v]) => (
                <div key={k} className="flex justify-between text-slate-300 py-0.5 border-b border-slate-800/40">
                  <span className="text-cyan-300 font-semibold">{k}</span>
                  <span className="text-emerald-400 font-bold">{v}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Disabled Packages Snapshot */}
        <div>
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.disabled_pkgs_dump} ({snapshot.disabled_packages.length})
          </h4>
          <div className="bg-[#090a0f] p-3 rounded-xl border border-[#202538] font-mono text-[11px] max-h-36 overflow-y-auto space-y-1">
            {snapshot.disabled_packages.length === 0 ? (
              <span className="text-slate-500">No packages were disabled</span>
            ) : (
              snapshot.disabled_packages.map((pkg) => (
                <p key={pkg} className="text-amber-300 truncate">
                  • {pkg}
                </p>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#202538]">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>

          {onRollback && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onRollback(snapshot);
                onClose();
              }}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              {t.rollback_btn}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
