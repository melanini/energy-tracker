"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Home, TrendingUp, BarChart3, User as UserIcon, Plus, Lightbulb, Sun, Timer, Camera, PencilLine } from "lucide-react";
import { CheckInModule } from "@/components/home/check-in-module";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface CheckIn {
  id: string;
  window: string;
  physical17: number;
  cognitive17: number;
  mood17: number | null;
  stress17: number | null;
  tsUtc: string;
}

interface CustomCard {
  id: string;
  type: 'daily-insight' | 'energy-level' | 'work-time' | 'happy-collector' | 'sleep-quality' | 'mood-trend' | 'focus-time' | 'stress-level';
  title: string;
  enabled: boolean;
  order: number;
}

const DEFAULT_CARDS: CustomCard[] = [
  { id: 'daily-insight', type: 'daily-insight', title: 'Daily Insight', enabled: true, order: 1 },
  { id: 'energy-level', type: 'energy-level', title: 'Energy Level', enabled: true, order: 2 },
  { id: 'work-time', type: 'work-time', title: 'Work Time', enabled: true, order: 3 },
  { id: 'happy-collector', type: 'happy-collector', title: 'Happy Collector', enabled: true, order: 4 },
  { id: 'sleep-quality', type: 'sleep-quality', title: 'Sleep Quality', enabled: false, order: 5 },
  { id: 'mood-trend', type: 'mood-trend', title: 'Mood Trend', enabled: false, order: 6 },
  { id: 'focus-time', type: 'focus-time', title: 'Focus Time', enabled: false, order: 7 },
  { id: 'stress-level', type: 'stress-level', title: 'Stress Level', enabled: false, order: 8 },
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [energyPercentage, setEnergyPercentage] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [customCards, setCustomCards] = useState<CustomCard[]>(DEFAULT_CARDS);
  const [showCheckIn, setShowCheckIn] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [happyMomentDialog, setHappyMomentDialog] = useState(false);
  const [happyNote, setHappyNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);

  useEffect(() => {
    fetchCheckIns();
  }, []);

  useEffect(() => {
    if (checkIns.length > 0) {
      fetchRecommendation();
    }
  }, [checkIns]);

  const fetchCheckIns = async () => {
    try {
      const response = await fetch("/api/check-ins");
      if (response.ok) {
        const data = await response.json();
        setCheckIns(data);
        calculateEnergyPercentage(data);
      }
    } catch (error) {
      console.error("Error fetching check-ins:", error);
    }
  };

  const calculateEnergyPercentage = (checkInsData: CheckIn[]) => {
    if (checkInsData.length === 0) {
      setEnergyPercentage(50); // Default
      return;
    }

    // Calculate average of physical and cognitive
    const avg = checkInsData.reduce((acc, checkIn) => {
      return acc + (checkIn.physical17 + checkIn.cognitive17) / 2;
    }, 0) / checkInsData.length;

    // Map from 1-7 scale to 0-100 percentage
    const percentage = ((avg - 1) / 6) * 100;
    setEnergyPercentage(Math.round(percentage));
  };

  const fetchRecommendation = async () => {
    setIsLoadingRecommendation(true);
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkIns }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendation(data.recommendation);
      }
    } catch (error) {
      console.error("Error fetching recommendation:", error);
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  const getTimeWindow = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    if (hour < 21) return "evening";
    return "night";
  };

  const checkIfCheckInAllowed = () => {
    const currentWindow = getTimeWindow();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's check-ins
    const todaysCheckIns = checkIns.filter(checkIn => {
      const checkInDate = new Date(checkIn.tsUtc);
      return checkInDate >= today;
    });

    // Find if there's already a check-in for the current window today
    const existingCheckIn = todaysCheckIns.find(checkIn => checkIn.window === currentWindow);

    // Debug logs
    console.log('Current window:', currentWindow);
    console.log('Today\'s check-ins:', todaysCheckIns);
    console.log('Existing check-in for current window:', existingCheckIn);
    console.log('Should show check-in:', todaysCheckIns.length < 4 && !existingCheckIn);

    // Only show check-in if we haven't done all 4 and haven't done current window
    setShowCheckIn(todaysCheckIns.length < 4 && !existingCheckIn);
  };

  // Check if check-in is allowed whenever checkIns change
  useEffect(() => {
    checkIfCheckInAllowed();
  }, [checkIns]);

  const handleCheckInComplete = () => {
    // Just fetch check-ins, let checkIfCheckInAllowed handle visibility
    fetchCheckIns();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  };

  const formatDate = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = days[now.getDay()];
    const month = months[now.getMonth()];
    const date = now.getDate();
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${day}, ${month} ${date} • ${time}`;
  };

  const getEnergyLabel = () => {
    if (energyPercentage >= 70) return "Great";
    if (energyPercentage >= 50) return "Good";
    if (energyPercentage >= 30) return "Fair";
    return "Low";
  };

  const handleCaptureHappyMoment = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const toggleCardEnabled = (cardId: string) => {
    setCustomCards(cards => 
      cards.map(card => 
        card.id === cardId 
          ? { ...card, enabled: !card.enabled }
          : card
      )
    );
  };

  const moveCard = (cardId: string, direction: 'up' | 'down') => {
    setCustomCards(cards => {
      const enabledCards = cards.filter(card => card.enabled);
      const cardIndex = enabledCards.findIndex(card => card.id === cardId);
      
      if (
        (direction === 'up' && cardIndex === 0) || 
        (direction === 'down' && cardIndex === enabledCards.length - 1)
      ) {
        return cards;
      }

      const newCards = [...cards];
      const swapIndex = direction === 'up' ? cardIndex - 1 : cardIndex + 1;
      const temp = enabledCards[cardIndex].order;
      enabledCards[cardIndex].order = enabledCards[swapIndex].order;
      enabledCards[swapIndex].order = temp;

      return newCards.sort((a, b) => a.order - b.order);
    });
  };

  const handlePhotoCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('tsUtc', new Date().toISOString());
      formData.append('note', 'Happy moment captured!');

      const response = await fetch('/api/happy-moments', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save happy moment');
      }

      // Clear the input
      if (event.target) {
        event.target.value = '';
      }

      // Show success message or update UI
      alert('Happy moment captured successfully!');
    } catch (error) {
      console.error('Error saving happy moment:', error);
      alert('Failed to save happy moment. Please try again.');
    }
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (energyPercentage / 100) * circumference;

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f5f2' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Get user's first name or email
  const userName = session?.user?.name?.split(" ")[0] || session?.user?.email?.split("@")[0] || "there";
  
  // Debug: Log session data
  console.log('Session data:', session);

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#f8f5f2' }}>
      {/* Header */}
      <header className="px-4 pt-6 pb-4" style={{ backgroundColor: '#f8f5f2' }}>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-neutral-800">
            {getGreeting()}, {userName}! <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1">{formatDate()}</p>
          {session?.user?.email && (
            <p className="text-xs text-neutral-400 mt-1">Signed in as {session.user.email}</p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Check-in Module */}
        {(() => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Get today's check-ins
          const todaysCheckIns = checkIns.filter(checkIn => {
            const checkInDate = new Date(checkIn.tsUtc);
            return checkInDate >= today;
          });

          // Debug logs
          console.log('Rendering - showCheckIn:', showCheckIn);
          console.log('Rendering - todaysCheckIns:', todaysCheckIns);

          if (showCheckIn) {
            return (
              <CheckInModule
                completedCheckins={todaysCheckIns.length}
                onCheckInComplete={handleCheckInComplete}
              />
            );
          }

          if (todaysCheckIns.length >= 4) {
            return (
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <h3 className="text-green-800 font-semibold mb-1">Well done! 🎉</h3>
                <p className="text-green-600 text-sm">You've completed all your check-ins for today. Keep up the great work!</p>
              </div>
            );
          }

          // If we're here, we're between check-in windows
          return (
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <h3 className="text-blue-800 font-semibold mb-1">Next Check-in Coming Up</h3>
              <p className="text-blue-600 text-sm">You've completed {todaysCheckIns.length} out of 4 check-ins today. Your next check-in window will be available soon.</p>
            </div>
          );
        })()}

        {/* Quick Actions Title & Edit Button */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-neutral-800">Quick Actions</h3>
          <button 
            className="text-sm flex items-center gap-1 hover:opacity-80" 
            style={{ color: '#960047' }}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <span>{isEditMode ? 'Done' : 'Edit'}</span>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-2 gap-4">
          {isEditMode ? (
            // Edit Mode - Show all available cards
            customCards.map(card => (
              <Card key={card.id} className={`border-neutral-200 shadow-sm ${!card.enabled ? 'opacity-50' : ''}`}>
                <CardContent className="pt-5 pb-4 px-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm text-neutral-800">{card.title}</h3>
                    <div className="flex items-center gap-2">
                      {card.enabled && (
                        <>
                          <button 
                            className="text-neutral-400 hover:text-neutral-600"
                            onClick={() => moveCard(card.id, 'up')}
                          >
                            ↑
                          </button>
                          <button 
                            className="text-neutral-400 hover:text-neutral-600"
                            onClick={() => moveCard(card.id, 'down')}
                          >
                            ↓
                          </button>
                        </>
                      )}
                      <button 
                        className={`text-sm ${card.enabled ? 'text-red-500' : 'text-green-500'}`}
                        onClick={() => toggleCardEnabled(card.id)}
                      >
                        {card.enabled ? 'Remove' : 'Add'}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {card.type === 'daily-insight' && 'AI-powered insights based on your data'}
                    {card.type === 'energy-level' && 'Track your energy levels throughout the day'}
                    {card.type === 'work-time' && 'Focus timer for productive work sessions'}
                    {card.type === 'happy-collector' && 'Capture and save happy moments'}
                    {card.type === 'sleep-quality' && 'Monitor your sleep patterns'}
                    {card.type === 'mood-trend' && 'View your mood patterns over time'}
                    {card.type === 'focus-time' && 'Track your focused work sessions'}
                    {card.type === 'stress-level' && 'Monitor and manage stress levels'}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {/* Daily Insight */}
              <Card className="border-neutral-200 shadow-sm">
                <CardContent className="pt-5 pb-4 px-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-sm text-neutral-800">Daily Insight</h3>
                    <button className="text-neutral-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {isLoadingRecommendation ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                    </div>
                  ) : recommendation ? (
                    <>
                      <div className="flex items-start gap-2 mb-4">
                        <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          {recommendation}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs h-8 border-amber-200 text-amber-700 hover:bg-amber-50" 
                          style={{ borderColor: '#f5855f', color: '#960047' }}
                          onClick={fetchRecommendation}
                        >
                          New Insight
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs h-8"
                          onClick={() => setRecommendation(null)}
                        >
                          Not helpful
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs h-8 border-amber-200 text-amber-700 hover:bg-amber-50"
                        style={{ borderColor: '#f5855f', color: '#960047' }}
                        onClick={fetchRecommendation}
                      >
                        Get Personalized Insight
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Energy Level */}
              <Card className="border-neutral-200 shadow-sm">
                <CardContent className="pt-5 pb-4 px-4">
                  <h3 className="font-semibold text-sm text-neutral-800 mb-3">Energy Level</h3>
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-24 h-24">
                      <svg className="transform -rotate-90 w-24 h-24">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-neutral-200"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="url(#gradient)"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f5855f" />
                            <stop offset="33%" stopColor="#960047" />
                            <stop offset="100%" stopColor="#953599" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-neutral-800">
                          {Math.round(energyPercentage)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xl">😊</span>
                      <span className="text-xs text-neutral-600">{getEnergyLabel()}</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">Based on today's check-ins</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Work Time */}
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="pt-5 pb-4 px-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50">
                  <Timer className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-neutral-800">Work Time</h4>
                  <p className="text-xs text-neutral-500">
                    Press to start<br />20 min timer
                  </p>
                </div>
              </div>
              <Button 
                className="w-full text-white text-sm h-9 hover:opacity-90 flex items-center justify-center gap-3" 
                style={{ backgroundColor: '#D84315' }}
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                <Timer className="h-5 w-5" />
                <span className="font-bold">{isTimerRunning ? 'Stop' : 'Start'}</span>
              </Button>
              <button className="text-xs text-neutral-400 hover:text-neutral-600 mt-2 flex items-center justify-center gap-1 w-full">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View history
              </button>
            </CardContent>
          </Card>

          {/* Happy Collector */}
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="pt-5 pb-4 px-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-50">
                  <Sun className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-neutral-800">Happy Collector</h4>
                  <p className="text-xs text-neutral-500">
                    Press to record<br />happy moment
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1 text-white text-sm h-9 hover:opacity-90 flex items-center justify-center gap-2" 
                  style={{ backgroundColor: '#efa12c' }}
                  onClick={handleCaptureHappyMoment}
                >
                  <Camera className="h-4 w-4" />
                  <span className="font-bold">Record</span>
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 text-sm h-9 hover:opacity-90 flex items-center justify-center gap-2 border-amber-200 text-amber-700" 
                  onClick={() => setHappyMomentDialog(true)}
                >
                  <PencilLine className="h-4 w-4" />
                  <span className="font-bold">Take Note</span>
                </Button>
              </div>
              <button className="text-xs text-neutral-400 hover:text-neutral-600 mt-2 flex items-center justify-center gap-1 w-full">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View moments
              </button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Hidden file input for camera */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handlePhotoCapture}
      />

      {/* Happy Moment Dialog */}
      <Dialog open={happyMomentDialog} onOpenChange={setHappyMomentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Capture a Happy Moment</DialogTitle>
            <DialogDescription>
              What made you smile today?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={happyNote}
              onChange={(e) => setHappyNote(e.target.value)}
              placeholder="Describe your happy moment..."
              rows={4}
            />
            <Button
              onClick={async () => {
                if (!happyNote.trim()) return;
                setIsSubmitting(true);
                try {
                  await fetch("/api/happy-moments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      note: happyNote,
                      tsUtc: new Date().toISOString(),
                    }),
                  });
                  setHappyMomentDialog(false);
                  setHappyNote("");
                } catch (error) {
                  console.error("Error saving happy moment:", error);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting || !happyNote.trim()}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white"
            >
              {isSubmitting ? "Saving..." : "Save Moment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50">
        <div className="flex items-center justify-around h-16 px-4">
          <button className="flex flex-col items-center gap-1" style={{ color: '#953599' }}>
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <a href="/track" className="flex flex-col items-center gap-1 text-neutral-400">
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs">Track</span>
          </a>
          <a href="/analytics" className="flex flex-col items-center gap-1 text-neutral-400">
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs">Analytics</span>
          </a>
          <a href="/profile" className="flex flex-col items-center gap-1 text-neutral-400">
            <UserIcon className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </a>
        </div>
      </nav>
    </div>);
}
