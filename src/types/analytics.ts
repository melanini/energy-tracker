// Analytics API Response Types

export type MetricType = 'physical_energy' | 'cognitive_clarity' | 'mood' | 'stress';

export interface BaseResponse {
  error?: string;
}

export interface VisualizationResponse extends BaseResponse {
  image: string; // base64 encoded image
}

export interface CorrelationResponse extends VisualizationResponse {
  target_metric: MetricType;
}

export interface HistoryResponse extends VisualizationResponse {
  metrics: MetricType[];
}

export interface TimeStats {
  total_hours: number;
  breakdown: {
    [category: string]: number;
  };
}

export interface TimeBreakdownResponse extends VisualizationResponse {
  stats: TimeStats;
}

export interface TrendResponse extends VisualizationResponse {
  summary: string;
  metric: MetricType;
}

export interface SummaryMetrics extends BaseResponse {
  happy_moments_count: number;
  pomodoro_usage_pct: number;
  best_pomodoro_day?: string;
  best_pomodoro_hours?: number;
  milestone_hydration?: string;
  milestone_happy?: string;
}
