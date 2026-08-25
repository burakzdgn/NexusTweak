import { create } from 'zustand';
import { LogEntry } from '../types/logs';

interface LogState {
  logs: LogEntry[];
  isTerminalOpen: boolean;

  // Actions
  addLog: (type: LogEntry['type'], message: string, details?: string) => void;
  clearLogs: () => void;
  toggleTerminal: () => void;
}

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  isTerminalOpen: false,

  addLog: (type, message, details) => {
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      details,
    };
    set((state) => ({ logs: [newEntry, ...state.logs.slice(0, 199)] }));
  },

  clearLogs: () => set({ logs: [] }),
  toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),
}));
