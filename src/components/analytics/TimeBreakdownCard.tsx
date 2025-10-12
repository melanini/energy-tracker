'use client';

import React, { useState, useEffect } from 'react';
import BaseCard from './BaseCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { useTimeBreakdown } from '@/hooks/useAnalytics';
import { Clock } from 'lucide-react';
import { generateChartExplanation } from '@/utils/explanationGenerator';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

export default function TimeBreakdownCard() {
  const [explanation, setExplanation] = useState<string>("");
  const { data, error, loading } = useTimeBreakdown();

  useEffect(() => {
    if (data) {
      generateChartExplanation('timeBreakdown', data)
        .then(setExplanation)
        .catch(console.error);
    }
  }, [data]);

  return (
    <BaseCard 
      title="Time Breakdown" 
      description="How you spend your energy"
      icon={<Clock className="h-5 w-5 text-[#953599]" />}
    >
      <div className="space-y-4">
        {/* Visualization container */}
        <div className="relative h-[300px] w-full bg-neutral-50 rounded-lg overflow-hidden">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="text-red-500 text-center">{error.message}</div>
          ) : data ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(data.stats.breakdown).map(([name, value]) => ({
                      name,
                      value
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell key="High Energy" fill="#953599" />
                    <Cell key="Moderate Energy" fill="#f5855f" />
                    <Cell key="Low Energy" fill="#ce0069" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)} hrs`, 'Time Spent']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="text-sm text-neutral-600 text-center">
                  <div className="font-semibold text-2xl text-[#953599]">
                    {data.stats.total_hours.toFixed(1)}
                  </div>
                  <div className="text-xs">Total Hours</div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Explanation */}
        {data && explanation && (
          <div className="bg-neutral-50 p-4 rounded-lg">
            <p className="text-sm text-neutral-600 leading-relaxed">{explanation}</p>
          </div>
        )}

        {/* Time breakdown stats */}
        {data && (
          <div className="space-y-3 bg-neutral-50 rounded-lg p-4">
            {Object.entries(data.stats.breakdown).map(([category, hours]) => {
              const percentage = (hours / data.stats.total_hours) * 100;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">{category}</span>
                    <span className="font-medium text-neutral-800">
                      {hours.toFixed(1)} hrs
                    </span>
                  </div>
                  <div className="relative h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#953599] rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-neutral-500 text-right">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BaseCard>
  );
}