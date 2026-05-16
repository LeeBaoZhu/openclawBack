// TypeScript 类型定义

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  enabled: boolean;
  status: 'ok' | 'warning' | 'error';
  lastRunAt: string | null;
  nextRunAt: string | null;
  lastDurationMs: number;
  consecutiveErrors: number;
  deliveryStatus: 'delivered' | 'failed' | 'pending';
}

export interface CronJobDetail extends CronJob {
  agentId: string;
  payload: {
    kind: string;
    message: string;
  };
  state: {
    lastRunAtMs: number;
    lastRunStatus: string;
    lastDurationMs: number;
    consecutiveErrors: number;
  };
  history: RunHistory[];
}

export interface RunHistory {
  runAt: string;
  status: string;
  durationMs: number;
}

export interface CronStats {
  total: number;
  ok: number;
  warning: number;
  error: number;
  successRate: number;
}

export interface HealthDashboard {
  score: number;
  level: 'ok' | 'warning' | 'error';
  summary: {
    totalAlerts: number;
    errorCount: number;
    warningCount: number;
    fatalCount: number;
  };
  components: ComponentStatus[];
}

export interface ComponentStatus {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
}

export interface TrendDataPoint {
  date: string;
  error: number;
  warning: number;
  fatal: number;
}

export interface TrendResponse {
  period: string;
  series: TrendDataPoint[];
}

export interface Alert {
  id: string;
  level: 'error' | 'warning' | 'fatal';
  category: string;
  message: string;
  suggestion: string;
  createdAt: string;
  resolved: boolean;
}

export interface AlertListResponse {
  total: number;
  alerts: Alert[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}
