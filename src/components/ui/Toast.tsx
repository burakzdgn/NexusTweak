import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { LogEntry } from '../../types/logs';

interface ToastProps {
  logs: LogEntry[];
  onDismiss?: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ logs }) => {
  const latestLogs = logs.slice(0, 3);

  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence>
        {latestLogs.map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="pointer-events-auto flex items-start gap-3 p-3.5 bg-[#11131f]/95 border border-[#202538] shadow-2xl rounded-xl backdrop-blur-xl text-slate-100"
          >
            {getIcon(log.type)}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200">{log.message}</p>
              {log.details && (
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{log.details}</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
