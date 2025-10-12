'use client';

import React, { useState } from 'react';
import BaseCard from './BaseCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { useTrend } from '@/hooks/useAnalytics';
import { MetricType } from '@/types/analytics';
import { TrendingUp, Brain, Activity, Smile, AlertCircle, Calendar } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface TrendCardProps {
  timeFrame: string;
  startDate?: Date;
  endDate?: Date;
}

export default function TrendCard({ timeFrame, startDate, endDate }: TrendCardProps) {
  const [metric, setMetric] = useState<MetricType>('physical_energy');
  const { data, error, loading } = useTrend(metric, timeFrame, startDate, endDate);

  const getMetricIcon = (metricType: MetricType) => {
    switch (metricType) {
      case 'physical_energy':
        return <Activity className="h-4 w-4" />;
      case 'cognitive_clarity':
        return <Brain className="h-4 w-4" />;
      case 'mood':
        return <Smile className="h-4 w-4" />;
      case 'stress':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <BaseCard 
      title="Trend Analysis" 
      description="Long-term patterns in your energy data"
      icon={<TrendingUp className="h-5 w-5 text-[#953599]" />}
    >
      <div className="space-y-4">
        {/* Visualization container */}
        <div className="relative h-[300px] w-full bg-neutral-50 rounded-lg overflow-hidden">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-red-500 text-center">{error.message}</div>
          ) : data ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.chartData.labels.map((date: string, index: number) => ({
                  date,
                  value: data.chartData.datasets[0].data[index]
                }))}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#953599" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#953599" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  domain={[1, 7]}
                  ticks={[1, 2, 3, 4, 5, 6, 7]}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  formatter={(value: number) => [value.toFixed(1), data.chartData.datasets[0].label]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#953599"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
        </div>

        {/* Controls and Summary */}
        <div className="space-y-4">
          {/* Metric Selection */}
          <div className="flex flex-wrap gap-3">
            {(['physical_energy', 'cognitive_clarity', 'mood', 'stress'] as MetricType[]).map((metricType) => (
              <button
                key={metricType}
                onClick={() => setMetric(metricType)}
                className={`px-3 py-2 rounded-full text-sm flex items-center gap-2 transition-all border-2 ${
                  metric === metricType
                    ? 'border-[#953599] bg-[#f5e5e0] shadow-sm scale-105'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <span className={metric === metricType ? 'text-[#953599]' : 'text-neutral-500'}>
                  {getMetricIcon(metricType)}
                </span>
                <span className={metric === metricType ? "font-medium" : ""}>
                  {metricType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              </button>
            ))}
          </div>

          {/* Summary */}
          {data && (
            <div className="bg-neutral-50 p-4 rounded-lg">
              <p className="text-sm text-neutral-600 leading-relaxed">{data.summary}</p>
            </div>
          )}
        </div>
      </div>
    </BaseCard>
  );
}