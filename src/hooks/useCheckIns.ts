import { useState, useEffect } from 'react';
import { CheckIn, LifestyleFactors, sampleCheckIns, sampleLifestyleFactors } from '@/utils/sampleData';

export function useCheckIns(date?: Date) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCheckIns = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        if (date) {
          // Filter check-ins for the specific date
          const targetDate = new Date(date);
          const filteredCheckIns = sampleCheckIns.filter(checkIn => {
            const checkInDate = new Date(checkIn.tsUtc);
            return (
              checkInDate.getFullYear() === targetDate.getFullYear() &&
              checkInDate.getMonth() === targetDate.getMonth() &&
              checkInDate.getDate() === targetDate.getDate()
            );
          });
          setCheckIns(filteredCheckIns);
        } else {
          // Return all check-ins
          setCheckIns(sampleCheckIns);
        }
        setLoading(false);
      } catch (e) {
        setError(e as Error);
        setLoading(false);
      }
    };

    fetchCheckIns();
  }, [date]);

  const saveCheckIn = async (checkIn: Omit<CheckIn, 'id' | 'tsUtc'>) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newCheckIn: CheckIn = {
        ...checkIn,
        id: Math.random().toString(36).substr(2, 9),
        tsUtc: new Date().toISOString()
      };

      setCheckIns(prev => [...prev, newCheckIn]);
      return newCheckIn;
    } catch (e) {
      throw e;
    }
  };

  return { checkIns, loading, error, saveCheckIn };
}

export function useLifestyleFactors(date: Date) {
  const [factors, setFactors] = useState<LifestyleFactors | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFactors = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Find factors for the specific date
        const dateKey = date.toISOString();
        const dayFactors = sampleLifestyleFactors[dateKey] || {
          sleep_quality: 3,
          hydration: 5,
          healthy_food: 3,
          caffeine: 2,
          exercise: false,
          social_interaction: false,
          medication: [],
          supplements: []
        };

        setFactors(dayFactors);
        setLoading(false);
      } catch (e) {
        setError(e as Error);
        setLoading(false);
      }
    };

    fetchFactors();
  }, [date]);

  const saveFactors = async (newFactors: LifestyleFactors) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setFactors(newFactors);
      return newFactors;
    } catch (e) {
      throw e;
    }
  };

  return { factors, loading, error, saveFactors };
}
