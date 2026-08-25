import React from 'react';
import { Trash2, Terminal, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { LogEntry } from '../../types/logs';

interface ConsoleLogProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const ConsoleLog: React.FC<ConsoleLogProps> = ({ logs, onClear }) => {
  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return 'text-emerald-400';
      case 'warning':
        return 'text-amber-400';
      case 'error':
        return 'text-rose-400';
      case 'command':
        return 'text-cyan-400';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="bg-[#090a0f] border border-[#202538] rounded-2xl overflow-hidden flex flex-col h-96 shadow-2xl font-mono">
      {/* Console Header Bar */}
      <div className="px-4 py-2.5 bg-[#0f111d] border-b border-[#202538] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs text-slate-400 ml-2">ADB Console Output Stream</span>
        </div>

        <button
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Console
        </button>
      </div>

      {/* Log Output Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2 text-xs select-text">
        {logs.length === 0 ? (
          <p className="text-slate-600 italic">No command logs generated yet...</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="leading-relaxed flex items-start gap-2">
              <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
              <span className={`font-bold shrink-0 ${getLogColor(log.type)}`}>
                [{log.type.toUpperCase()}]
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-slate-200">{log.message}</span>
                {log.details && (
                  <pre className="text-slate-400 bg-[#121524] p-2 rounded-lg mt-1 text-[11px] overflow-x-auto whitespace-pre-wrap">
                    {log.details}
                  </pre>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
