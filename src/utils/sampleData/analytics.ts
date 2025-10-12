import { AnalyticsData, MetricType } from './types';

const generateTrendData = (days: number) => {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      value: Math.floor(Math.random() * 7) + 1,
      tsUtc: date.toISOString()
    };
  }).reverse();
};

export const sampleAnalytics: AnalyticsData = {
  correlations: {
    physical_energy: {
      factors: [
        { factor: 'sleep_quality', correlation: 0.85 },
        { factor: 'exercise', correlation: 0.75 },
        { factor: 'hydration', correlation: 0.65 },
        { factor: 'healthy_food', correlation: 0.55 }
      ]
    },
    cognitive_clarity: {
      factors: [
        { factor: 'sleep_quality', correlation: 0.8 },
        { factor: 'caffeine', correlation: 0.7 },
        { factor: 'stress17', correlation: -0.6 },
        { factor: 'exercise', correlation: 0.5 }
      ]
    },
    mood: {
      factors: [
        { factor: 'social_interaction', correlation: 0.75 },
        { factor: 'exercise', correlation: 0.7 },
        { factor: 'sleep_quality', correlation: 0.65 },
        { factor: 'stress17', correlation: -0.8 }
      ]
    },
    stress: {
      factors: [
        { factor: 'sleep_quality', correlation: -0.7 },
        { factor: 'exercise', correlation: -0.65 },
        { factor: 'social_interaction', correlation: -0.6 },
        { factor: 'meditation', correlation: -0.55 }
      ]
    }
  },
  trends: {
    physical_energy: {
      data_points: generateTrendData(30),
      trend_direction: 'up',
      summary: 'Your physical energy has been trending upward over the past month, with notable improvements after implementing regular exercise.'
    },
    cognitive_clarity: {
      data_points: generateTrendData(30),
      trend_direction: 'stable',
      summary: 'Your cognitive clarity has remained stable, with slight improvements on days with better sleep quality.'
    },
    mood: {
      data_points: generateTrendData(30),
      trend_direction: 'up',
      summary: 'Your mood shows positive correlation with social activities and exercise. Consider maintaining these habits.'
    },
    stress: {
      data_points: generateTrendData(30),
      trend_direction: 'down',
      summary: 'Stress levels have decreased over the past month, possibly due to improved sleep and exercise habits.'
    }
  },
  time_breakdown: {
    total_hours: 168,
    breakdown: {
      'High Energy': 56,
      'Moderate Energy': 72,
      'Low Energy': 40
    }
  }
};
