'use client';

import React, { useState, useEffect } from 'react';
import BaseCard from './BaseCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { PieChart as PieChartIcon } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';

interface ActivityData {
  category: string;
  hours: number;
  icon: string;
  color: string;
}

interface ActivityDistributionData {
  activities: ActivityData[];
  totalHours: number;
  mostTimeSpent: string;
  leastTimeSpent: string;
}

const categoryColors: Record<string, string> = {
  work: '#953599',
  family: '#f5855f',
  rest: '#ce0069',
  hobby: '#A855F7'
};

const categoryIcons: Record<string, string> = {
  work: '💼',
  family: '👨‍👩‍👧‍👦',
  rest: '😴',
  hobby: '🎨'
};

export default function ActivityDistributionCard() {
  const [data, setData] = useState<ActivityDistributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'bar' | 'pie'>('bar');

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      console.log('Fetching activity distribution data...');
      const response = await fetch('/api/analytics/activity-distribution', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const responseData = await response.json();
      console.log('Raw API Response:', responseData);
      
      if (!response.ok) {
        console.error('API Error Response:', responseData);
        throw new Error(responseData.details || responseData.error || 'Failed to fetch activity distribution data');
      }
      
      if (!responseData.activities || !Array.isArray(responseData.activities)) {
        console.error('Invalid data format:', responseData);
        throw new Error('Invalid data format received from server');
      }
      
      console.log('Activity distribution data:', responseData);
      setData(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderBarChart = () => {
    if (!data) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.activities}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="category" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            formatter={(value: number) => [`${value.toFixed(1)} hours`, 'Time Spent']}
            labelFormatter={(label) => label.charAt(0).toUpperCase() + label.slice(1)}
          />
          <Bar 
            dataKey="hours" 
            name="Time Distribution"
          >
            {data.activities.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                name={entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = () => {
    if (!data) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data.activities}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ category, percent }) => 
              `${category.charAt(0).toUpperCase() + category.slice(1)}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="hours"
          >
            {data.activities.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            formatter={(value: number) => [`${value.toFixed(1)} hours`, 'Time Spent']}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => {
              // value here is "hours" for all entries, so we use the category from the entry data
              const activity = data.activities.find(a => a.hours === entry.payload.hours);
              return activity ? activity.category.charAt(0).toUpperCase() + activity.category.slice(1) : value;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <BaseCard 
      title="Activity Distribution" 
      description="How you spend your time"
      icon={<PieChartIcon className="h-5 w-5 text-[#953599]" />}
    >
      <div className="space-y-4">
        {/* View Mode Toggle */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setViewMode('bar')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'bar'
                ? 'bg-[#953599] text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setViewMode('pie')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              viewMode === 'pie'
                ? 'bg-[#953599] text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            Pie Chart
          </button>
        </div>

        {/* Visualization container */}
        <div className="relative w-full bg-neutral-50 rounded-lg overflow-hidden p-4">
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-500 text-sm mb-2">{error}</p>
                <button
                  onClick={fetchActivityData}
                  className="text-xs text-[#953599] hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : data && data.activities.length > 0 ? (
            <>
              {viewMode === 'bar' ? renderBarChart() : renderPieChart()}
            </>
          ) : (
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-neutral-500 text-sm">No activity data available</p>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {data && data.activities.length > 0 && (
          <div className="space-y-3">
            {/* Total Hours */}
            <div className="bg-gradient-to-r from-[#fae5fa] to-[#f5e5e0] p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">Total Time Tracked</span>
                <span className="text-2xl font-bold text-[#953599]">
                  {data.totalHours.toFixed(1)} hrs
                </span>
              </div>
            </div>

            {/* Activity Breakdown */}
            <div className="space-y-3 bg-neutral-50 rounded-lg p-4">
              {data.activities.map((activity) => {
                const percentage = data.totalHours > 0 
                  ? (activity.hours / data.totalHours) * 100 
                  : 0;
                return (
                  <div key={activity.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{activity.icon}</span>
                        <span className="text-sm font-medium text-neutral-700 capitalize">
                          {activity.category}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-neutral-800">
                        {activity.hours.toFixed(1)} hrs
                      </span>
                    </div>
                    <div className="relative h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full rounded-full transition-all"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: activity.color
                        }}
                      />
                    </div>
                    <div className="text-xs text-neutral-500 text-right">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Insights */}
            {data.mostTimeSpent && data.leastTimeSpent && (
              <div className="bg-neutral-50 p-4 rounded-lg space-y-2">
                <p className="text-sm text-neutral-600">
                  <span className="font-semibold">Most time spent:</span>{' '}
                  <span className="capitalize">{data.mostTimeSpent}</span>
                </p>
                <p className="text-sm text-neutral-600">
                  <span className="font-semibold">Least time spent:</span>{' '}
                  <span className="capitalize">{data.leastTimeSpent}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseCard>
  );
}

