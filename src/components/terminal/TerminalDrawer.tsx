import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, Send, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { useLogStore } from '../../stores/useLogStore';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { AdbBridge } from '../../services/adbBridge';
import { Button } from '../ui/Button';

export const TerminalDrawer: React.FC = () => {
  const { isTerminalOpen, toggleTerminal, logs, addLog, clearLogs } = useLogStore();
  const activeSerial = useDeviceStore((s) => s.activeSerial);
  const t = useLanguageStore((s) => s.t);

  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTerminalOpen && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isTerminalOpen]);

  if (!isTerminalOpen) return null;

  const handleExecute = async (cmdToRun?: string) => {
    const targetCmd = cmdToRun || command;
    if (!targetCmd.trim() || !activeSerial) return;

    setIsExecuting(true);
    addLog('command', `$ ${targetCmd}`);

    try {
      const res = await AdbBridge.runCustomCommand(activeSerial, targetCmd);
      if (res.success) {
        addLog('success', 'Output:', res.stdout || '[OK]');
      } else {
        addLog('error', 'Error:', res.stderr);
      }
    } catch (err: unknown) {
      addLog('error', 'Execution Failed', String(err));
    } finally {
      setIsExecuting(false);
      if (!cmdToRun) setCommand('');
    }
  };

  const getLogColor = (type: string) => {
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
    <AnimatePresence>
      <motion.div
        initial={{ y: 350, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 350, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed bottom-0 left-64 right-0 z-50 bg-[#0c0e17]/95 border-t border-[#202538] shadow-2xl backdrop-blur-2xl flex flex-col font-mono ${
          isExpanded ? 'h-[75vh]' : 'h-80'
        }`}
      >
        {/* Drawer Header Bar */}
        <div className="px-5 py-3 bg-[#11131f] border-b border-[#202538] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
                ADB Shell Console
                {activeSerial ? (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                    {activeSerial}
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    No Target
                  </span>
                )}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearLogs}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800/60 transition-colors"
              title={t.clear_console}
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={toggleTerminal}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Console Log Output Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-1.5 text-xs select-text bg-[#090a0f]">
          {logs.length === 0 ? (
            <p className="text-slate-600 italic">Console ready. Type commands below...</p>
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
                    <pre className="text-slate-400 bg-[#121524] p-2 rounded-lg mt-1 text-[11px] overflow-x-auto whitespace-pre-wrap font-mono">
                      {log.details}
                    </pre>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#11131f] border-t border-[#202538] flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-cyan-400 font-bold text-xs">
              $
            </span>
            <input
              type="text"
              placeholder={
                activeSerial
                  ? t.terminal_placeholder
                  : 'Connect an Android device to send commands...'
              }
              disabled={!activeSerial}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleExecute();
              }}
              className="w-full pl-7 pr-3 py-2 bg-[#090a0f] border border-[#202538] rounded-xl font-mono text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleExecute()}
            isLoading={isExecuting}
            disabled={!activeSerial || !command.trim()}
            rightIcon={<Send className="w-3.5 h-3.5" />}
          >
            {t.execute_btn}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
