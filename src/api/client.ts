import { MetricType, CorrelationResponse, HistoryResponse, TimeBreakdownResponse, TrendResponse, SummaryMetrics } from '@/types/analytics';

const API_BASE = '/api';

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new APIError(response.status, error.detail || 'An error occurred');
  }
  return response.json();
}

export const analyticsAPI = {
  async getCorrelations(
    targetMetric: MetricType = 'physical_energy',
    categoryFilter?: string[]
  ): Promise<CorrelationResponse> {
    const params = new URLSearchParams({
      target_metric: targetMetric,
      ...(categoryFilter && { category_filter: categoryFilter.join(',') })
    });
    
    const response = await fetch(`${API_BASE}/analytics/correlations?${params}`);
    return handleResponse<CorrelationResponse>(response);
  },

  async getHistory(metrics: MetricType[]): Promise<HistoryResponse> {
    const params = new URLSearchParams({
      metrics: metrics.join(',')
    });
    
    const response = await fetch(`${API_BASE}/analytics/history?${params}`);
    return handleResponse<HistoryResponse>(response);
  },

  async getTimeBreakdown(): Promise<TimeBreakdownResponse> {
    const response = await fetch(`${API_BASE}/analytics/time-breakdown`);
    return handleResponse<TimeBreakdownResponse>(response);
  },

  async getTrend(
    metric: MetricType,
    periods: number = 4,
    trendWeeks: number = 8
  ): Promise<TrendResponse> {
    const params = new URLSearchParams({
      metric,
      periods: periods.toString(),
      trend_weeks: trendWeeks.toString()
    });
    
    const response = await fetch(`${API_BASE}/analytics/trend?${params}`);
    return handleResponse<TrendResponse>(response);
  },

  async getSummary(periodDays: number = 30): Promise<SummaryMetrics> {
    const params = new URLSearchParams({
      period_days: periodDays.toString()
    });
    
    const response = await fetch(`${API_BASE}/analytics/summary?${params}`);
    return handleResponse<SummaryMetrics>(response);
  }
};
