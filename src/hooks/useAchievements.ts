import { useState, useEffect } from 'react';
import { sampleAchievements, sampleHappyMoments } from '@/utils/sampleData';

export function useAchievements() {
  const [data, setData] = useState({
    streak_days: 0,
    high_energy_days: 0,
    most_used_mood: {
      emoji: "😊",
      count: 0
    },
    loading: true,
    error: null as Error | null
  });

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setData({
          streak_days: sampleAchievements.streak_days,
          high_energy_days: sampleAchievements.high_energy_days,
          most_used_mood: sampleAchievements.most_used_mood,
          loading: false,
          error: null
        });
      } catch (error) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: error as Error
        }));
      }
    };

    fetchAchievements();
  }, []);

  return data;
}

export function useHappyMoments() {
  const [data, setData] = useState({
    moments: sampleHappyMoments,
    loading: true,
    error: null as Error | null
  });

  useEffect(() => {
    const fetchHappyMoments = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setData({
          moments: sampleHappyMoments,
          loading: false,
          error: null
        });
      } catch (error) {
        setData(prev => ({
          ...prev,
          loading: false,
          error: error as Error
        }));
      }
    };

    fetchHappyMoments();
  }, []);

  const saveHappyMoment = async (photo: File, note: string) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newMoment = {
        id: Math.random().toString(36).substr(2, 9),
        photo_url: URL.createObjectURL(photo),
        note,
        tsUtc: new Date().toISOString()
      };

      setData(prev => ({
        ...prev,
        moments: [newMoment, ...prev.moments]
      }));

      return newMoment;
    } catch (error) {
      throw error;
    }
  };

  return { ...data, saveHappyMoment };
}