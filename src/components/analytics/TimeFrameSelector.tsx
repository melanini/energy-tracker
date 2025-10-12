'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export type TimeFrame = 'last30' | 'all' | 'custom';

interface TimeFrameSelectorProps {
  onTimeFrameChange: (timeFrame: TimeFrame, startDate?: Date, endDate?: Date) => void;
}

export default function TimeFrameSelector({ onTimeFrameChange }: TimeFrameSelectorProps) {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('last30');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleTimeFrameChange = (timeFrame: TimeFrame) => {
    setSelectedTimeFrame(timeFrame);
    if (timeFrame !== 'custom') {
      setStartDate(null);
      setEndDate(null);
      onTimeFrameChange(timeFrame);
    }
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      onTimeFrameChange('custom', start, end);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4">
      <div className="flex flex-col space-y-4">
        {/* Segmented Control */}
        <div className="flex rounded-lg bg-neutral-100 p-1">
          <button
            onClick={() => handleTimeFrameChange('last30')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedTimeFrame === 'last30'
                ? 'bg-white text-[#953599] shadow-sm'
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => handleTimeFrameChange('all')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedTimeFrame === 'all'
                ? 'bg-white text-[#953599] shadow-sm'
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            All Data
          </button>
          <button
            onClick={() => handleTimeFrameChange('custom')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedTimeFrame === 'custom'
                ? 'bg-white text-[#953599] shadow-sm'
                : 'text-neutral-600 hover:text-neutral-800'
            }`}
          >
            Custom Range
          </button>
        </div>

        {/* Custom Date Range Picker */}
        {selectedTimeFrame === 'custom' && (
          <div className="flex items-center gap-2 bg-neutral-50 p-3 rounded-lg">
            <Calendar className="h-5 w-5 text-neutral-500" />
            <DatePicker
              selected={startDate}
              onChange={handleDateChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange
              dateFormat="MMM d, yyyy"
              placeholderText="Select date range"
              className="bg-transparent border-none text-sm text-neutral-800 focus:outline-none"
              maxDate={new Date()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
