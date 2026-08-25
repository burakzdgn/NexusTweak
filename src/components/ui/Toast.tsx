import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { LogEntry } from '../../types/logs';

interface ToastProps {
  logs: LogEntry[];
  onDismiss?: (id: string) => void;
}

const getIcon = (type: LogEntry['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />;
    case 'error':
      return <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />;
    default:
      return <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />;
  }
};

interface ToastItemProps {
  log: LogEntry;
  onDismiss: (id: string) => void;
  duration?: number;
}

const ToastItem: React.FC<ToastItemProps> = ({ log, onDismiss, duration = 3800 }) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss(log.id);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [log.id, onDismiss, duration, isPaused]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="pointer-events-auto flex flex-col p-3.5 bg-[#11131f]/95 border border-[#202538] shadow-2xl rounded-xl backdrop-blur-xl text-slate-100 relative group overflow-hidden"
    >
      <div className="flex items-start gap-3">
        {getIcon(log.type)}
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-xs font-semibold text-slate-200">{log.message}</p>
          {log.details && (
            <p className="text-[11px] text-slate-400 truncate mt-0.5" title={log.details}>
              {log.details}
            </p>
          )}
        </div>
        <button
          onClick={() => onDismiss(log.id)}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-white/5"
          title="Kapat / Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Subtle Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-800/60">
        <div
          className={`h-full transition-all ease-linear ${
            log.type === 'success'
              ? 'bg-emerald-400'
              : log.type === 'error'
              ? 'bg-rose-400'
              : log.type === 'warning'
              ? 'bg-amber-400'
              : 'bg-cyan-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};

export const ToastContainer: React.FC<ToastProps> = ({ logs }) => {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const visibleToasts = logs.filter((l) => !dismissedIds.has(l.id)).slice(0, 3);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((log) => (
          <ToastItem
            key={log.id}
            log={log}
            onDismiss={handleDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
