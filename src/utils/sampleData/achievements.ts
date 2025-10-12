import { Achievements } from './types';

export const sampleAchievements: Achievements = {
  streak_days: 286,
  high_energy_days: 63,
  most_used_mood: {
    emoji: "😊",
    count: 157
  },
  milestones: {
    milestone_hydration: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    milestone_happy: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    milestone_focus: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days ago
  },
  stats: {
    happy_moments_count: 157,
    pomodoro_usage_pct: 85,
    best_pomodoro_day: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    best_pomodoro_hours: 6.5
  }
};

// Sample happy moments
export const sampleHappyMoments = Array.from({ length: 10 }, (_, i) => ({
  id: Math.random().toString(36).substr(2, 9),
  photo_url: `https://picsum.photos/400/300?random=${i}`,
  note: "A happy moment captured!",
  tsUtc: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
}));
