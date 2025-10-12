import { CheckIn, LifestyleFactors } from './types';

// Generate dates for the last 30 days
const generatePastDates = (days: number) => {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString();
  });
};

// Sample moods with their emojis
export const sampleMoods = [
  { emoji: "😌", label: "Calm" },
  { emoji: "🙂", label: "Content" },
  { emoji: "😄", label: "Joyful" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😠", label: "Annoyed" },
  { emoji: "😟", label: "Anxious" },
  { emoji: "😕", label: "Confused" },
  { emoji: "😡", label: "Angry" },
  { emoji: "😨", label: "Scared" },
  { emoji: "😩", label: "Exhausted" }
];

// Generate random check-in data
const generateCheckIn = (tsUtc: string, window: CheckIn['window']): CheckIn => ({
  id: Math.random().toString(36).substr(2, 9),
  window,
  physical17: Math.floor(Math.random() * 7) + 1,
  cognitive17: Math.floor(Math.random() * 7) + 1,
  mood17: Math.floor(Math.random() * 5) + 1,
  stress17: Math.floor(Math.random() * 4) + 1,
  note: `Moods: ${sampleMoods[Math.floor(Math.random() * sampleMoods.length)].label}`,
  tsUtc
});

// Generate sample lifestyle factors
const generateLifestyleFactors = (): LifestyleFactors => ({
  sleep_quality: Math.floor(Math.random() * 5) + 1,
  hydration: Math.floor(Math.random() * 10) + 1,
  healthy_food: Math.floor(Math.random() * 5) + 1,
  caffeine: Math.floor(Math.random() * 4) + 1,
  exercise: Math.random() > 0.5,
  social_interaction: Math.random() > 0.5,
  medication: [],
  supplements: []
});

// Generate check-ins for each day
export const sampleCheckIns: CheckIn[] = generatePastDates(30).flatMap(date => {
  // Generate 2-4 check-ins per day
  const checkInsPerDay = Math.floor(Math.random() * 3) + 2;
  const windows: CheckIn['window'][] = ['morning', 'afternoon', 'evening'];
  
  return windows.slice(0, checkInsPerDay).map(window => generateCheckIn(date, window));
});

export const sampleLifestyleFactors: { [date: string]: LifestyleFactors } = 
  generatePastDates(30).reduce((acc, date) => {
    acc[date] = generateLifestyleFactors();
    return acc;
  }, {} as { [date: string]: LifestyleFactors });
