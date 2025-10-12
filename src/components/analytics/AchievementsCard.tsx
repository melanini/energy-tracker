"use client";

import React from 'react';
import BaseCard from './BaseCard';
import { Trophy, Flame, Zap, Smile } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import LoadingSpinner from '../common/LoadingSpinner';

interface Achievement {
  icon: React.ReactNode;
  value: string;
  label: string;
  bgColor: string;
  iconColor: string;
}

export default function AchievementsCard() {
  const { streak_days, high_energy_days, most_used_mood, loading, error } = useAchievements();

  if (loading) {
    return (
      <BaseCard 
        title="Core Achievements" 
        description="Your tracking milestones"
        icon={<Trophy className="h-5 w-5 text-[#953599]" />}
      >
        <div className="flex justify-center items-center h-32">
          <LoadingSpinner />
        </div>
      </BaseCard>
    );
  }

  if (error) {
    return (
      <BaseCard 
        title="Core Achievements" 
        description="Your tracking milestones"
        icon={<Trophy className="h-5 w-5 text-[#953599]" />}
      >
        <div className="text-red-500 text-center py-8">
          Failed to load achievements. Please try again later.
        </div>
      </BaseCard>
    );
  }

  const achievements: Achievement[] = [
    {
      icon: <Flame className="h-6 w-6" />,
      value: `${streak_days} days`,
      label: "tracked in a row",
      bgColor: "bg-red-100",
      iconColor: "text-red-600"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      value: `${high_energy_days} days`,
      label: "high energy level",
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600"
    },
    {
      icon: <Smile className="h-6 w-6" />,
      value: most_used_mood.emoji,
      label: `most used mood emoji (${most_used_mood.count} times)`,
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    }
  ];

  return (
    <BaseCard 
      title="Core Achievements" 
      description="Your tracking milestones"
      icon={<Trophy className="h-5 w-5 text-[#953599]" />}
    >
      <div className="grid grid-cols-3 gap-4">
        {achievements.map((achievement, index) => (
          <div key={index} className="flex flex-col items-center text-center space-y-2">
            <div className={`w-12 h-12 rounded-full ${achievement.bgColor} flex items-center justify-center`}>
              <div className={achievement.iconColor}>
                {achievement.icon}
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-neutral-800">
                {achievement.value}
              </div>
              <div className="text-xs text-neutral-500">
                {achievement.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}
