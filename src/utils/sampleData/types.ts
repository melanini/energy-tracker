export type MetricType = 'physical_energy' | 'cognitive_clarity' | 'mood' | 'stress';
export type TimeWindow = 'morning' | 'afternoon' | 'evening' | 'custom';

export interface CheckIn {
  id: string;
  window: TimeWindow;
  physical17: number;
  cognitive17: number;
  mood17: number | null;
  stress17: number | null;
  note: string;
  tsUtc: string;
}

export interface LifestyleFactors {
  sleep_quality: number;
  hydration: number;
  healthy_food: number;
  caffeine: number;
  exercise: boolean;
  social_interaction: boolean;
  medication: string[];
  supplements: string[];
}

export interface HappyMoment {
  id: string;
  photo_url: string;
  note: string;
  tsUtc: string;
}

export interface AnalyticsData {
  correlations: {
    [key in MetricType]: {
      factors: Array<{
        factor: string;
        correlation: number;
      }>;
    };
  };
  trends: {
    [key in MetricType]: {
      data_points: Array<{
        value: number;
        tsUtc: string;
      }>;
      trend_direction: 'up' | 'down' | 'stable';
      summary: string;
    };
  };
  time_breakdown: {
    total_hours: number;
    breakdown: {
      [key: string]: number;
    };
  };
}

export interface Achievements {
  streak_days: number;
  high_energy_days: number;
  most_used_mood: {
    emoji: string;
    count: number;
  };
  milestones: {
    milestone_hydration?: string;
    milestone_happy?: string;
    milestone_focus?: string;
  };
  stats: {
    happy_moments_count: number;
    pomodoro_usage_pct: number;
    best_pomodoro_day?: string;
    best_pomodoro_hours?: number;
  };
}
