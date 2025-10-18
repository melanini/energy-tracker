'use client';

import React, { useState, useEffect } from 'react';
import BaseCard from './BaseCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { useCorrelations } from '@/hooks/useAnalytics';
import { MetricType } from '@/types/analytics';
import { Network, Brain, Activity, Smile, AlertCircle } from 'lucide-react';
import { generateChartExplanation } from '@/utils/explanationGenerator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Legend
} from 'recharts';

export default function CorrelationCard() {
  const [targetMetric, setTargetMetric] = useState<MetricType>('physical_energy');
  const [explanation, setExplanation] = useState<string>("");
  const { data, error, loading } = useCorrelations(targetMetric);

  useEffect(() => {
    if (data) {
      generateChartExplanation('correlation', data)
        .then(setExplanation)
        .catch(console.error);
    }
  }, [data]);

  const getMetricIcon = (metric: MetricType) => {
    switch (metric) {
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
      title="Energy Correlations" 
      description="Discover what impacts your energy levels"
      icon={<Network className="h-5 w-5 text-[#953599]" />}
    >
      <div className="space-y-4">
        {/* Visualization container */}
        <div className="relative h-[400px] w-full bg-neutral-50 rounded-lg overflow-hidden">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-red-500 text-center">{error.message}</div>
          ) : data ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.chartData.datasets[0].data.map((value: number, index: number) => ({
                  name: data.chartData.labels[index],
                  value: value, // Keep original value for tooltip
                  strongPositive: value >= 50 ? value : null,
                  moderatePositive: value >= 0 && value < 50 ? value : null,
                  moderateNegative: value >= -50 && value < 0 ? value : null,
                  strongNegative: value < -50 ? value : null
                }))}
                margin={{ top: 20, right: 20, left: 30, bottom: 60 }}
                barCategoryGap="0%"
                barGap="0%"
              >
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#9333EA" />
                  </linearGradient>
                  <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#EA580C" />
                  </linearGradient>
                  <linearGradient id="pinkGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EC4899" />
                    <stop offset="100%" stopColor="#DB2777" />
                  </linearGradient>
                  <linearGradient id="lightPurpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#666' }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  domain={[-100, 100]}
                  ticks={[-100, -75, -50, -25, 0, 25, 50, 75, 100]}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Correlation']}
                />
                <Legend 
                  verticalAlign="top" 
                  height={24}
                  iconType="rect"
                  wrapperStyle={{ paddingBottom: '5px', fontSize: '11px' }}
                  iconSize={10}
                />
                <ReferenceLine y={0} stroke="#953599" strokeDasharray="5 5" />
                <Bar
                  dataKey="strongPositive"
                  fill="url(#purpleGradient)"
                  name="Strong Positive"
                  radius={[10, 10, 0, 0]}
                />
                <Bar
                  dataKey="moderatePositive"
                  fill="url(#orangeGradient)"
                  name="Moderate Positive"
                  radius={[10, 10, 0, 0]}
                />
                <Bar
                  dataKey="moderateNegative"
                  fill="url(#pinkGradient)"
                  name="Moderate Negative"
                  radius={[10, 10, 0, 0]}
                />
                <Bar
                  dataKey="strongNegative"
                  fill="url(#lightPurpleGradient)"
                  name="Strong Negative"
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
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
          {(['physical_energy', 'cognitive_clarity', 'mood', 'stress'] as MetricType[]).map((metric) => (
            <button
              key={metric}
              onClick={() => setTargetMetric(metric)}
              className={`px-3 py-2 rounded-full text-sm flex items-center gap-2 transition-all border-2 ${
                targetMetric === metric
                  ? 'border-[#953599] bg-[#f5e5e0] shadow-sm scale-105'
                  : 'border-neutral-200 hover:border-neutral-300 bg-white'
              }`}
            >
              <span className={targetMetric === metric ? 'text-[#953599]' : 'text-neutral-500'}>
                {getMetricIcon(metric)}
              </span>
              <span className={targetMetric === metric ? "font-medium" : ""}>
                {metric.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            </button>
          ))}
        </div>
      </div>
    </BaseCard>
  );
}