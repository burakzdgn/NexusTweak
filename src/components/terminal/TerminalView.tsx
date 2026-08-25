import React, { useState } from 'react';
import { Terminal, Send } from 'lucide-react';
import { useLogStore } from '../../stores/useLogStore';
import { useDeviceStore } from '../../stores/useDeviceStore';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { AdbBridge } from '../../services/adbBridge';
import { ConsoleLog } from './ConsoleLog';
import { CommandPresets } from './CommandPresets';
import { Button } from '../ui/Button';

export const TerminalView: React.FC = () => {
  const { logs, addLog, clearLogs } = useLogStore();
  const activeSerial = useDeviceStore((s) => s.activeSerial);
  const t = useLanguageStore((s) => s.t);
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRunCommand = async (cmdToRun?: string) => {
    const targetCmd = cmdToRun || command;
    if (!targetCmd.trim() || !activeSerial) return;

    setIsExecuting(true);
    addLog('command', `Executing: ${targetCmd}`);

    try {
      const res = await AdbBridge.runCustomCommand(activeSerial, targetCmd);
      if (res.success) {
        addLog('success', 'Execution Succeeded', res.stdout || '[No Output]');
      } else {
        addLog('error', 'Execution Error', res.stderr);
      }
    } catch (err: unknown) {
      addLog('error', 'Command Failed', String(err));
    } finally {
      setIsExecuting(false);
      if (!cmdToRun) setCommand('');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          {t.terminal_title}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {t.terminal_subtitle}
        </p>
      </div>

      {/* Command Presets */}
      <CommandPresets onSelectCommand={(cmd) => handleRunCommand(cmd)} />

      {/* Command Input Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-cyan-400 font-bold text-xs">
            $
          </span>
          <input
            type="text"
            placeholder={t.terminal_placeholder}
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRunCommand();
            }}
            className="w-full pl-8 pr-4 py-3 bg-[#11131f] border border-[#202538] rounded-xl font-mono text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 shadow-inner"
          />
        </div>

        <Button
          variant="primary"
          onClick={() => handleRunCommand()}
          isLoading={isExecuting}
          rightIcon={<Send className="w-4 h-4" />}
          className="py-3 px-6"
        >
          {t.execute_btn}
        </Button>
      </div>

      {/* Live Stream Terminal Console */}
      <ConsoleLog logs={logs} onClear={clearLogs} />
    </div>
  );
};
