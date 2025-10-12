"use client";

import React, { useState, useEffect } from 'react';
import BaseCard from './BaseCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { useHistory } from '@/hooks/useAnalytics';
import { MetricType } from '@/types/analytics';
import { LineChart as LineChartIcon, Brain, Activity, Smile, AlertCircle } from 'lucide-react';
import { generateChartExplanation } from '@/utils/explanationGenerator';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const DEFAULT_METRICS: MetricType[] = ['physical_energy', 'cognitive_clarity', 'mood', 'stress'];

const METRIC_COLORS = {
  physical_energy: '#f5855f',
  cognitive_clarity: '#953599',
  mood: '#3b82f6',
  stress: '#ef4444'
};

const METRIC_LABELS = {
  physical_energy: 'Physical Energy',
  cognitive_clarity: 'Cognitive Clarity',
  mood: 'Mood',
  stress: 'Stress'
};

export default function HistoryCard() {
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(DEFAULT_METRICS);
  const [explanation, setExplanation] = useState<string>("");
  const { data, error, loading } = useHistory(selectedMetrics);

  useEffect(() => {
    if (data) {
      generateChartExplanation('history', data)
        .then(setExplanation)
        .catch(console.error);
    }
  }, [data]);

  const toggleMetric = (metric: MetricType) => {
    setSelectedMetrics(prev => 
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  // Transform data for Recharts
  const transformedData = data?.chartData?.labels.map((date: string, index: number) => {
    const dataPoint: any = { date };
    data.chartData.datasets.forEach((dataset: any) => {
      const metricName = dataset.label.toLowerCase().replace(' ', '_');
      dataPoint[metricName] = dataset.data[index];
    });
    return dataPoint;
  });

  return (
    <BaseCard 
      title="Energy History" 
      description="Track your energy patterns over time"
      icon={<LineChartIcon className="h-5 w-5 text-[#953599]" />}
    >
      <div className="space-y-4">
        {/* Visualization container */}
        <div className="relative h-[300px] w-full bg-neutral-50 rounded-lg overflow-hidden">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-red-500 text-center">{error.message}</div>
          ) : transformedData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transformedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => METRIC_LABELS[value as MetricType]}
                />
                {selectedMetrics.map((metric) => (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={metric}
                    stroke={METRIC_COLORS[metric]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : null}
        </div>

        {/* Explanation */}
        {data && explanation && (
          <div className="bg-neutral-50 p-4 rounded-lg">
            <p className="text-sm text-neutral-600 leading-relaxed">{explanation}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => toggleMetric('physical_energy')}
            className={`px-3 py-2 rounded-full text-sm flex items-center gap-2 transition-all border-2 ${
              selectedMetrics.includes('physical_energy')
                ? 'border-[#953599] bg-[#f5e5e0] shadow-sm scale-105'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            }`}
          >
            <Activity className={`h-4 w-4 ${selectedMetrics.includes('physical_energy') ? 'text-[#953599]' : 'text-neutral-500'}`} />
            <span className={selectedMetrics.includes('physical_energy') ? "font-medium" : ""}>
              Physical Energy
            </span>
          </button>
          <button
            onClick={() => toggleMetric('cognitive_clarity')}
            className={`px-3 py-2 rounded-full text-sm flex items-center gap-2 transition-all border-2 ${
              selectedMetrics.includes('cognitive_clarity')
                ? 'border-[#953599] bg-[#f5e5e0] shadow-sm scale-105'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            }`}
          >
            <Brain className={`h-4 w-4 ${selectedMetrics.includes('cognitive_clarity') ? 'text-[#953599]' : 'text-neutral-500'}`} />
            <span className={selectedMetrics.includes('cognitive_clarity') ? "font-medium" : ""}>
              Cognitive Clarity
            </span>
          </button>
          <button
            onClick={() => toggleMetric('mood')}
            className={`px-3 py-2 rounded-full text-sm flex items-center gap-2 transition-all border-2 ${
              selectedMetrics.includes('mood')
                ? 'border-[#953599] bg-[#f5e5e0] shadow-sm scale-105'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            }`}
          >
            <Smile className={`h-4 w-4 ${selectedMetrics.includes('mood') ? 'text-[#953599]' : 'text-neutral-500'}`} />
            <span className={selectedMetrics.includes('mood') ? "font-medium" : ""}>
              Mood
            </span>
          </button>
          <button
            onClick={() => toggleMetric('stress')}
            className={`px-3 py-2 rounded-full text-sm flex items-center gap-2 transition-all border-2 ${
              selectedMetrics.includes('stress')
                ? 'border-[#953599] bg-[#f5e5e0] shadow-sm scale-105'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            }`}
          >
            <AlertCircle className={`h-4 w-4 ${selectedMetrics.includes('stress') ? 'text-[#953599]' : 'text-neutral-500'}`} />
            <span className={selectedMetrics.includes('stress') ? "font-medium" : ""}>
              Stress
            </span>
          </button>
        </div>
      </div>
    </BaseCard>
  );
}