"use client";

import React, { useState } from 'react';
import { Home, TrendingUp, BarChart3, User as UserIcon, ChevronLeft } from 'lucide-react';
import CorrelationCard from '@/components/analytics/CorrelationCard';
import HistoryCard from '@/components/analytics/HistoryCard';
import TimeBreakdownCard from '@/components/analytics/TimeBreakdownCard';
import TrendCard from '@/components/analytics/TrendCard';
import SummaryMetricsCard from '@/components/analytics/SummaryMetricsCard';
import AchievementsCard from '@/components/analytics/AchievementsCard';
import ActivityDistributionCard from '@/components/analytics/ActivityDistributionCard';
import TimeFrameSelector, { TimeFrame } from '@/components/analytics/TimeFrameSelector';

export default function AnalyticsPage() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('last30');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  const handleTimeFrameChange = (newTimeFrame: TimeFrame, startDate?: Date, endDate?: Date) => {
    setTimeFrame(newTimeFrame);
    if (newTimeFrame === 'custom' && startDate && endDate) {
      setCustomStartDate(startDate);
      setCustomEndDate(endDate);
    } else {
      setCustomStartDate(null);
      setCustomEndDate(null);
    }
  };

  const formatDate = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = days[now.getDay()];
    const month = months[now.getMonth()];
    const date = now.getDate();
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${day}, ${month} ${date} • ${time}`;
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#f8f5f2' }}>
      {/* Header */}
      <header className="bg-white px-4 py-4 border-b border-neutral-200">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <a href="/home" className="p-2 hover:bg-neutral-100 rounded-lg">
              <ChevronLeft className="h-5 w-5" style={{ color: '#953599' }} />
            </a>
            <div>
              <h1 className="text-xl font-bold text-neutral-800">Analytics</h1>
              <p className="text-xs text-neutral-500">Insights from your energy data</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Time Frame Selector */}
        <TimeFrameSelector onTimeFrameChange={handleTimeFrameChange} />

        {/* Achievements Card */}
        <div className="mb-6">
          <AchievementsCard />
        </div>

        {/* Energy History Card - Full width on all screens */}
        <div className="space-y-6">
          <HistoryCard />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Correlation Analysis */}
          <div className="col-span-1 md:col-span-2">
            <CorrelationCard />
          </div>

          {/* Activity Distribution - New Card */}
          <div className="col-span-1 md:col-span-2">
            <ActivityDistributionCard />
          </div>

          {/* Time Breakdown */}
          <div className="col-span-1">
            <TimeBreakdownCard />
          </div>

          {/* Summary Metrics */}
          <div className="col-span-1">
            <SummaryMetricsCard 
              timeFrame={timeFrame}
              startDate={customStartDate ?? undefined}
              endDate={customEndDate ?? undefined}
            />
          </div>

          {/* Trend Analysis */}
          <div className="col-span-1 md:col-span-2">
            <TrendCard
              timeFrame={timeFrame}
              startDate={customStartDate ?? undefined}
              endDate={customEndDate ?? undefined}
            />
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50">
        <div className="flex items-center justify-around h-16 px-4">
          <a href="/home" className="flex flex-col items-center gap-1 text-neutral-400">
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </a>
          <a href="/track" className="flex flex-col items-center gap-1 text-neutral-400">
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs">Track</span>
          </a>
          <button className="flex flex-col items-center gap-1" style={{ color: '#953599' }}>
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs font-medium">Analytics</span>
          </button>
          <a href="/profile" className="flex flex-col items-center gap-1 text-neutral-400">
            <UserIcon className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </a>
        </div>
      </nav>
    </div>
  );
}