export interface AdbExecutionResult {
  success: boolean;
  command: string;
  stdout: string;
  stderr: string;
  exit_code: number;
  execution_time_ms: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'command';
  message: string;
  details?: string;
}
