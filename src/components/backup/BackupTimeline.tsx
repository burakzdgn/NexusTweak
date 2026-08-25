import React from 'react';
import { RotateCcw, Trash2, Eye, Calendar, HardDrive, Smartphone } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { BackupSnapshot } from '../../types/backup';
import { useLanguageStore } from '../../stores/useLanguageStore';

interface BackupTimelineProps {
  backups: BackupSnapshot[];
  onInspect: (b: BackupSnapshot) => void;
  onRollback: (b: BackupSnapshot) => void;
  onDelete: (id: string) => void;
}

export const BackupTimeline: React.FC<BackupTimelineProps> = ({
  backups,
  onInspect,
  onRollback,
  onDelete,
}) => {
  const t = useLanguageStore((s) => s.t);

  if (backups.length === 0) {
    return (
      <div className="p-12 text-center bg-[#11131f] border border-[#202538] rounded-2xl">
        <HardDrive className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <h4 className="text-sm font-bold text-slate-200">{t.no_backups_title}</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          {t.no_backups_desc}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {backups.map((snapshot, index) => (
        <Card key={snapshot.id} className="p-5 hover:border-slate-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: Info */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm shrink-0">
                #{backups.length - index}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">
                    {snapshot.note || 'State Snapshot'}
                  </h4>
                  {snapshot.device_name && (
                    <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-medium">
                      {snapshot.device_name}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-purple-400" />
                    {new Date(snapshot.timestamp).toLocaleString()}
                  </span>
                  <span>•</span>
                  <span className="font-mono text-slate-400 flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-cyan-400" />
                    {snapshot.device_serial}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">
                    {snapshot.disabled_packages.length} debloated packages
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onInspect(snapshot)}
                leftIcon={<Eye className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                {t.inspect_btn}
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => onRollback(snapshot)}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                {t.rollback_btn}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(snapshot.id)}
                className="text-slate-500 hover:text-rose-400"
                title="Delete Snapshot"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
