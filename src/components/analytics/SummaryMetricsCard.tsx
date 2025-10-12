'use client';

import React, { useState, useEffect } from 'react';
import BaseCard from './BaseCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { useSummaryMetrics } from '@/hooks/useAnalytics';
import { Medal, Timer, Sun, Droplet, CheckCircle2 } from 'lucide-react';
import { generateChartExplanation } from '@/utils/explanationGenerator';

interface SummaryMetricsCardProps {
  timeFrame?: string;
  startDate?: Date;
  endDate?: Date;
}

export default function SummaryMetricsCard({ timeFrame = 'last30', startDate, endDate }: SummaryMetricsCardProps) {
  const [explanation, setExplanation] = useState<string>("");
  const { data, error, loading } = useSummaryMetrics(timeFrame, startDate, endDate);

  useEffect(() => {
    if (data) {
      generateChartExplanation('summary', data)
        .then(setExplanation)
        .catch(console.error);
    }
  }, [data]);

  return (
    <BaseCard 
      title="Summary & Milestones" 
      description="Your achievements and key metrics"
      icon={<Medal className="h-5 w-5 text-[#953599]" />}
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="text-red-500 text-center">{error.message}</div>
      ) : data ? (
        <div className="space-y-6">
          {/* Explanation */}
          {explanation && (
            <div className="bg-neutral-50 p-4 rounded-lg">
              <p className="text-sm text-neutral-600 leading-relaxed">{explanation}</p>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Sun className="h-4 w-4 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-[#953599]">
                  {data.happy_moments_count}
                </div>
              </div>
              <div className="text-sm text-neutral-600">Happy Moments</div>
            </div>
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <Timer className="h-4 w-4 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-[#953599]">
                  {data.pomodoro_usage_pct.toFixed(0)}%
                </div>
              </div>
              <div className="text-sm text-neutral-600">Pomodoro Usage</div>
            </div>
          </div>

          {/* Best Performance */}
          {data.best_pomodoro_day && (
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#F3E8FF] flex items-center justify-center">
                  <Medal className="h-4 w-4 text-[#953599]" />
                </div>
                <h3 className="font-semibold text-sm text-neutral-800">Best Performance</h3>
              </div>
              <div className="mt-2">
                <div className="text-sm text-neutral-500">Best Pomodoro Day</div>
                <div className="font-medium text-neutral-800">
                  {new Date(data.best_pomodoro_day).toLocaleDateString()} 
                  <span className="text-[#953599] ml-1">
                    ({data.best_pomodoro_hours?.toFixed(1)} hours)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Milestones */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="font-semibold text-sm text-neutral-800">Recent Milestones</h3>
            </div>
            <div className="space-y-3 bg-neutral-50 rounded-lg p-4">
              {data.milestone_hydration && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Droplet className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-800">7-day Hydration Streak</div>
                    <div className="text-xs text-neutral-500">
                      {new Date(data.milestone_hydration).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
              {data.milestone_happy && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Sun className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-800">50 Happy Moments</div>
                    <div className="text-xs text-neutral-500">
                      {new Date(data.milestone_happy).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </BaseCard>
  );
}