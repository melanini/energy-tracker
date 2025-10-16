import { useState, useEffect } from 'react';
import { MetricType, sampleAnalytics, sampleCheckIns } from '@/utils/sampleData';
import { 
  generateEnergyHistoryChart,
  generateCorrelationChart,
  generateTimeBreakdownChart,
  generateTrendChart
} from '@/utils/sampleData/chartData';

export function useHistory(selectedMetrics: MetricType[]) {
  const [data, setData] = useState<{ chartData: any } | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/analytics/history?metrics=${selectedMetrics.join(',')}`);
        if (!response.ok) throw new Error('Failed to fetch history data');
        const result = await response.json();
        
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          setError(e as Error);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedMetrics]);

  return { data, error, loading };
}

export function useCorrelations(targetMetric: MetricType) {
  const [data, setData] = useState<{ chartData: any; correlations: any } | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/analytics/correlations?metric=${targetMetric}`);
        if (!response.ok) throw new Error('Failed to fetch correlation data');
        const result = await response.json();
        
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          setError(e as Error);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [targetMetric]);

  return { data, error, loading };
}

export function useTimeBreakdown() {
  const [data, setData] = useState<{
    chartData: any;
    stats: typeof sampleAnalytics.time_breakdown;
  } | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch('/api/analytics/time-breakdown');
        if (!response.ok) throw new Error('Failed to fetch time breakdown data');
        const result = await response.json();
        
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          setError(e as Error);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, error, loading };
}

export function useTrend(metric: MetricType, timeFrame: string, startDate?: Date, endDate?: Date) {
  const [data, setData] = useState<{
    chartData: any;
    trend_direction: 'up' | 'down' | 'stable';
    summary: string;
  } | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const params = new URLSearchParams({ metric });
        
        if (timeFrame === 'last30') {
          params.append('startDate', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
          params.append('endDate', new Date().toISOString());
        } else if (timeFrame === 'custom' && startDate && endDate) {
          params.append('startDate', startDate.toISOString());
          params.append('endDate', endDate.toISOString());
        }
        // For 'all' timeFrame, we don't add date parameters

        const response = await fetch(`/api/analytics/trends?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch trend data');
        const result = await response.json();
        
        if (isMounted) {
          setData(result);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          setError(e as Error);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [metric, timeFrame, startDate, endDate]);

  return { data, error, loading };
}

export function useSummaryMetrics(timeFrame: string, startDate?: Date, endDate?: Date) {
  const [data, setData] = useState<{
    happy_moments_count: number;
    pomodoro_usage_pct: number;
    best_pomodoro_day?: string;
    best_pomodoro_hours?: number;
    milestone_hydration?: string;
    milestone_happy?: string;
  } | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // In a real implementation, we would use these parameters to fetch the correct data
        const params = new URLSearchParams();
        
        if (timeFrame === 'last30') {
          params.append('startDate', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
          params.append('endDate', new Date().toISOString());
        } else if (timeFrame === 'custom' && startDate && endDate) {
          params.append('startDate', startDate.toISOString());
          params.append('endDate', endDate.toISOString());
        }
        // For 'all' timeFrame, we don't add date parameters

        // For now, using sample data
        setData({
          happy_moments_count: 157,
          pomodoro_usage_pct: 85,
          best_pomodoro_day: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          best_pomodoro_hours: 6.5,
          milestone_hydration: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          milestone_happy: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        });
        setLoading(false);
      } catch (e) {
        setError(e as Error);
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeFrame, startDate, endDate]);

  return { data, error, loading };
}