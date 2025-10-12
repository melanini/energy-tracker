// Function to generate a sine wave with some noise for realistic-looking data
function generateSineWaveData(days: number, baseline: number = 4, amplitude: number = 2, frequency: number = 0.2) {
  return Array.from({ length: days }, (_, i) => {
    const smooth = baseline + amplitude * Math.sin(frequency * i);
    const noise = (Math.random() - 0.5) * 0.5;
    return Math.max(1, Math.min(7, Math.round((smooth + noise) * 10) / 10));
  });
}

// Generate dates for the past N days
function generateDates(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    return date.toISOString().split('T')[0];
  });
}

// Generate energy history chart data
export function generateEnergyHistoryChart() {
  const days = 30;
  const dates = generateDates(days);
  
  const physicalData = generateSineWaveData(days, 4.5, 1.5);
  const cognitiveData = generateSineWaveData(days, 4, 1.8, 0.25);
  const moodData = generateSineWaveData(days, 4.2, 1.2, 0.15);
  const stressData = generateSineWaveData(days, 3.5, 1.3, 0.18);

  return {
    labels: dates,
    datasets: [
      {
        label: 'Physical Energy',
        data: physicalData,
        borderColor: '#f5855f',
        tension: 0.4
      },
      {
        label: 'Cognitive Clarity',
        data: cognitiveData,
        borderColor: '#953599',
        tension: 0.4
      },
      {
        label: 'Mood',
        data: moodData,
        borderColor: '#3b82f6',
        tension: 0.4
      },
      {
        label: 'Stress',
        data: stressData,
        borderColor: '#ef4444',
        tension: 0.4
      }
    ]
  };
}

// Generate correlation chart data
export function generateCorrelationChart(metric: string) {
  const factors = [
    { name: 'Sleep Quality', value: 0.85 },
    { name: 'Exercise', value: 0.72 },
    { name: 'Hydration', value: 0.65 },
    { name: 'Nutrition', value: 0.58 },
    { name: 'Social Activity', value: 0.45 },
    { name: 'Screen Time', value: -0.35 },
    { name: 'Work Hours', value: -0.42 },
    { name: 'Caffeine', value: -0.25 }
  ];

  // Add some randomization but keep the general pattern
  const shuffledFactors = factors.map(factor => ({
    ...factor,
    value: factor.value + (Math.random() - 0.5) * 0.2
  })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return {
    labels: shuffledFactors.map(f => f.name),
    datasets: [{
      data: shuffledFactors.map(f => f.value * 100),
      backgroundColor: shuffledFactors.map(f => 
        f.value > 0 ? 'rgba(149, 53, 153, 0.6)' : 'rgba(239, 68, 68, 0.6)'
      ),
      borderColor: shuffledFactors.map(f => 
        f.value > 0 ? '#953599' : '#ef4444'
      ),
      borderWidth: 1
    }]
  };
}

// Generate time breakdown chart data
export function generateTimeBreakdownChart() {
  const total = 168; // Hours in a week
  const data = {
    labels: ['High Energy', 'Moderate Energy', 'Low Energy'],
    datasets: [{
      data: [
        Math.round(total * 0.35), // ~59 hours
        Math.round(total * 0.45), // ~76 hours
        Math.round(total * 0.20), // ~33 hours
      ],
      backgroundColor: [
        'rgba(149, 53, 153, 0.8)',
        'rgba(245, 133, 95, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        '#953599',
        '#f5855f',
        '#ef4444'
      ],
      borderWidth: 1
    }]
  };

  return {
    chartData: data,
    stats: {
      total_hours: total,
      breakdown: {
        'High Energy': data.datasets[0].data[0],
        'Moderate Energy': data.datasets[0].data[1],
        'Low Energy': data.datasets[0].data[2]
      }
    }
  };
}

// Generate trend analysis chart data
export function generateTrendChart(metric: string, days: number = 30) {
  const dates = generateDates(days);
  let data;
  
  switch(metric) {
    case 'physical_energy':
      data = generateSineWaveData(days, 4.8, 1.2, 0.15); // Slightly upward trend
      break;
    case 'cognitive_clarity':
      data = generateSineWaveData(days, 4.2, 1.5, 0.2); // More variation
      break;
    case 'mood':
      data = generateSineWaveData(days, 4.5, 1.0, 0.1); // More stable
      break;
    case 'stress':
      data = generateSineWaveData(days, 3.8, 1.8, 0.25); // Higher variation
      break;
    default:
      data = generateSineWaveData(days);
  }

  // Calculate trend
  const firstWeek = data.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
  const lastWeek = data.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const trend = lastWeek - firstWeek;

  return {
    chartData: {
      labels: dates,
      datasets: [{
        label: metric.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        data: data,
        borderColor: '#953599',
        backgroundColor: 'rgba(149, 53, 153, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    trend_direction: trend > 0.2 ? 'up' : trend < -0.2 ? 'down' : 'stable',
    summary: generateTrendSummary(metric, trend)
  };
}

function generateTrendSummary(metric: string, trend: number): string {
  const direction = trend > 0.2 ? 'improving' : trend < -0.2 ? 'declining' : 'stable';
  const magnitude = Math.abs(trend) > 0.5 ? 'significantly' : 'slightly';

  const summaries = {
    physical_energy: {
      up: `Your physical energy has been ${magnitude} ${direction}. Keep up with your exercise and sleep routines!`,
      down: `Your physical energy has been ${magnitude} ${direction}. Consider reviewing your sleep and exercise habits.`,
      stable: `Your physical energy levels have remained consistent. This indicates good routine maintenance.`
    },
    cognitive_clarity: {
      up: `Your cognitive clarity is ${magnitude} ${direction}. Your focus-enhancing practices are working well!`,
      down: `Your cognitive clarity has been ${magnitude} ${direction}. You might want to evaluate your work patterns and breaks.`,
      stable: `Your cognitive clarity has been steady. Your current routines are supporting consistent mental performance.`
    },
    mood: {
      up: `Your mood has been ${magnitude} ${direction}. Your positive lifestyle changes are showing results!`,
      down: `Your mood has been ${magnitude} ${direction}. Consider increasing social activities and outdoor time.`,
      stable: `Your mood has remained stable. You're maintaining a good emotional balance.`
    },
    stress: {
      up: `Your stress levels have been ${magnitude} increasing. Consider incorporating more relaxation techniques.`,
      down: `Your stress levels have been ${magnitude} decreasing. Your stress management strategies are working well!`,
      stable: `Your stress levels have remained stable. Continue with your current stress management practices.`
    }
  };

  const metricSummaries = summaries[metric as keyof typeof summaries];
  return trend > 0.2 ? metricSummaries.up : trend < -0.2 ? metricSummaries.down : metricSummaries.stable;
}
