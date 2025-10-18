"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TimeTrackingCard, CategoryBase } from "@/components/tracking/TimeTrackingCard";
import { AddCustomTrackerDialog } from "@/components/tracking/AddCustomTrackerDialog";
import { Button } from "@/components/ui/button";
import { EnergySlider } from "@/components/ui/energy-slider";
import { DayPicker } from "react-day-picker";
import type { DayClickEventHandler } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { 
  Home, TrendingUp, BarChart3, User as UserIcon, ChevronLeft, Coffee, Droplet, 
  Users, Plus, Moon, Apple, Activity, Heart, Pill, ChevronUp, ChevronDown, 
  Settings, Calendar, Brain, Zap, AlertCircle, ChevronRight, Edit3, Save,
  Smile, Frown, Meh, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

const moods = [
  { emoji: "😌", label: "Calm" },
  { emoji: "🙂", label: "Content" },
  { emoji: "😄", label: "Joyful" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😠", label: "Annoyed" },
  { emoji: "😟", label: "Anxious" },
  { emoji: "😕", label: "Confused" },
  { emoji: "😡", label: "Angry" },
  { emoji: "😨", label: "Scared" },
  { emoji: "😩", label: "Exhausted" },
];

const stressLevels = [
  { label: "Low", color: "#EFCFEF", icon: "smile" },
  { label: "Medium", color: "#D8B4FE", icon: "meh" },
  { label: "High", color: "#C084FC", icon: "frown" },
  { label: "Very High", color: "#A855F7", icon: "alert-triangle" },
];

const lifestyleCategories = [
  { id: "medication", label: "Medication", icon: "💊" },
  { id: "allergies", label: "Allergies", icon: "🤧" },
  { id: "supplements", label: "Supplements", icon: "💊" },
  { id: "nutrition", label: "Nutrition", icon: "🍽️" },
];

interface TimeEntry {
  categoryId: string;
  hours: number;
}

interface CheckIn {
  id: string;
  window: string;
  physical17: number;
  cognitive17: number;
  mood17: number | null;
  stress17: number | null;
  note: string;
  tsUtc: string;
  timeEntries: TimeEntry[];
}

export default function TrackPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [checkIn, setCheckIn] = useState<CheckIn | null>(null);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [stressLevel, setStressLevel] = useState<string | null>(null);
  const [cognitiveClarity, setCognitiveClarity] = useState([4]);
  const [physicalEnergy, setPhysicalEnergy] = useState([6]);
  const [customMood, setCustomMood] = useState({ emoji: "", text: "" });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  interface CustomTracker {
    id: string;
    label: string;
    icon: string;
    unit: string;
    unitType: "number" | "scale" | "boolean" | "string";
    maxValue?: number;
    value?: number | string | boolean;
  }

  const [customTrackers, setCustomTrackers] = useState<CustomTracker[]>([]);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);

  // Auto-save debounce timer
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchCheckInForDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    // Load custom trackers from API
    const loadCustomTrackers = async () => {
      try {
        const response = await fetch("/api/custom-trackers");
        if (response.ok) {
          const data = await response.json();
          setCustomTrackers(data);
        }
      } catch (error) {
        console.error("Error loading custom trackers:", error);
      }
    };

    loadCustomTrackers();
  }, []);

  const fetchCheckInForDate = async (date: Date) => {
    try {
      const response = await fetch(`/api/check-ins?date=${date.toISOString()}`);
      if (response.ok) {
        const data = await response.json();
        // Get the most recent check-in for the date
        const latestCheckIn = data && data.length > 0 ? data[data.length - 1] : null;
        if (latestCheckIn) {
          setCheckIn(latestCheckIn);
          // Populate form with existing data
          setSelectedMoods(latestCheckIn.note ? latestCheckIn.note.split(", ") : []);
          setStressLevel(latestCheckIn.stress17 ? stressLevels[latestCheckIn.stress17 - 1].label : null);
          setCognitiveClarity([latestCheckIn.cognitive17]);
          setPhysicalEnergy([latestCheckIn.physical17]);
          setTimeEntries(latestCheckIn.timeEntries || []);
        } else {
          // Reset to defaults if no data found
          setCheckIn(null);
          setSelectedMoods([]);
          setStressLevel(null);
          setCognitiveClarity([4]);
          setPhysicalEnergy([4]);
          setTimeEntries([]);
        }
      }
    } catch (error) {
      console.error("Error fetching check-in:", error);
    }
  };

  const autoSave = async () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    const timeout = setTimeout(async () => {
      try {
        // Auto-save without showing alerts
        const response = await fetch("/api/check-ins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            window: "track", // Use "track" to distinguish from home check-ins
            physical17: physicalEnergy[0],
            cognitive17: cognitiveClarity[0],
            mood17: null,
            stress17: stressLevel ? stressLevels.findIndex(s => s.label === stressLevel) + 1 : null,
            note: `Moods: ${selectedMoods.join(", ")}`,
            timeEntries,
            sleepHygiene,
            customTrackers: customTrackers.map(tracker => ({
              id: tracker.id,
              value: tracker.value,
              type: tracker.unitType
            })),
          }),
        });

        if (response.ok) {
          // Refresh data to show updated values
          await fetchCheckInForDate(selectedDate);
        }
      } catch (error) {
        console.error("Error auto-saving track data:", error);
      }
    }, 1000);
    
    setSaveTimeout(timeout);
  };

  useEffect(() => {
    if (isEditing) {
      autoSave();
    }
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [selectedMoods, stressLevel, cognitiveClarity, physicalEnergy, timeEntries]);

  // Set editing mode when user interacts with sliders
  useEffect(() => {
    if (cognitiveClarity[0] !== 4 || physicalEnergy[0] !== 4) {
      setIsEditing(true);
    }
  }, [cognitiveClarity, physicalEnergy]);

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getMonthDay = (date: Date) => {
    return date.getDate();
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };
  const [caffeineLevel, setCaffeineLevel] = useState(0);
  const [hydrationLevel, setHydrationLevel] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [healthyFood, setHealthyFood] = useState(2);
  const [exercise, setExercise] = useState(false);
  const [socialInteraction, setSocialInteraction] = useState({
    hadInteraction: false,
    energyImpact: 0, // -2: Major drain, -1: Minor drain, 0: Neutral, 1: Minor boost, 2: Major boost
    interactionType: "", // individual, group, family, friend, etc.
    notes: ""
  });
  const [selectedLifestyleFactors, setSelectedLifestyleFactors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLifestyleDetails, setShowLifestyleDetails] = useState(true);
  const [sleepHygiene, setSleepHygiene] = useState({
    consistentSchedule: false,
    noScreens: false,
    relaxingRoutine: false,
    optimalEnvironment: false,
    noCaffeine: false
  });

  const toggleMood = (label: string) => {
    if (selectedMoods.includes(label)) {
      setSelectedMoods(selectedMoods.filter((m) => m !== label));
    } else if (selectedMoods.length < 3) {
      setSelectedMoods([...selectedMoods, label]);
    }
  };

  const toggleLifestyleFactor = (id: string) => {
    if (selectedLifestyleFactors.includes(id)) {
      setSelectedLifestyleFactors(selectedLifestyleFactors.filter((f) => f !== id));
    } else {
      setSelectedLifestyleFactors([...selectedLifestyleFactors, id]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Save to API
      const response = await fetch("/api/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            window: "track", // Use "track" to distinguish from home check-ins
            physical17: physicalEnergy[0],
            cognitive17: cognitiveClarity[0],
            mood17: null,
            stress17: stressLevel ? stressLevels.findIndex(s => s.label === stressLevel) + 1 : null,
            note: `Moods: ${selectedMoods.join(", ")}`,
            timeEntries,
            sleepHygiene,
            customTrackers: customTrackers.map(tracker => ({
              id: tracker.id,
              value: tracker.value,
              type: tracker.unitType
            })),
          }),
      });

      if (response.ok) {
        // Refresh data to show updated values
        await fetchCheckInForDate(selectedDate);
        // Show success message
        alert("Tracking saved!");
      } else {
        console.error("Failed to save tracking data");
        alert("Failed to save tracking data. Please try again.");
      }
    } catch (error) {
      console.error("Error saving track data:", error);
      alert("Error saving tracking data. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#f8f5f2' }}>
      {/* Header */}
      <header className="bg-white px-3 sm:px-4 py-3 sm:py-4 border-b border-neutral-200">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/home" className="p-1 sm:p-2 hover:bg-neutral-100 rounded-lg">
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#953599' }} />
            </a>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-neutral-800">Track Energy</h1>
              <p className="text-xs text-neutral-500">Complete snapshot of your state</p>
            </div>
          </div>

          <div className="h-px bg-neutral-200 my-3 sm:my-4" />

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between">
            <Dialog>
              <DialogTrigger asChild>
                <button className="p-2 hover:bg-neutral-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-[#953599]" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] p-0 gap-0">
                <DialogHeader className="p-6 pb-4 space-y-2">
                  <DialogTitle className="text-xl font-semibold text-neutral-800">Select Date</DialogTitle>
                  <DialogDescription className="text-neutral-500">
                    View and edit past entries
                  </DialogDescription>
                </DialogHeader>
                <div className="px-6 pb-6">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onDayClick={(date) => {
                      setSelectedDate(date);
                      fetchCheckInForDate(date);
                    }}
                    className="p-0"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium text-neutral-900",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-[#953599]",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell: "text-neutral-500 rounded-md w-9 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: cn(
                        "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-transparent",
                        "[&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-neutral-100/50"
                      ),
                      day: cn(
                        "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-[#fae5fa] rounded-full"
                      ),
                      day_range_end: "day-range-end",
                      day_selected: "bg-[#fae5fa] text-[#953599] font-bold hover:bg-[#fae5fa] hover:text-[#953599] focus:bg-[#fae5fa] focus:text-[#953599]",
                      day_today: "text-[#953599] font-bold",
                      day_outside: "day-outside opacity-50 aria-selected:bg-neutral-100/50 aria-selected:text-neutral-500 aria-selected:opacity-30",
                      day_disabled: "text-neutral-400 opacity-50 hover:bg-transparent",
                      day_hidden: "invisible",
                    }}
                    modifiersStyles={{
                      today: { fontWeight: 'bold' },
                      selected: { 
                        backgroundColor: '#fae5fa',
                        color: '#953599',
                        fontWeight: 'bold'
                      }
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex flex-1 justify-center gap-6">
              {[-3, -2, -1, 0, 1, 2, 3].map((offset) => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() + offset);
                const isSelected = offset === 0;
                const isPast = offset < 0;
                const isFuture = offset > 0;

                return (
                  <button
                    key={offset}
                    onClick={() => changeDate(offset)}
                    className={cn(
                      "flex flex-col items-center py-2 px-4 rounded-lg transition-all w-full max-w-[100px]",
                      isSelected ? "bg-[#953599] text-white scale-110" : "hover:bg-neutral-100",
                      isPast ? "opacity-70" : "",
                      isFuture ? "opacity-50" : ""
                    )}
                  >
                    <span className="text-xs font-medium">{getDayName(date)}</span>
                    <span className={cn(
                      "text-lg",
                      isSelected ? "font-bold" : "font-medium"
                    )}>{getMonthDay(date)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Time Tracking */}
        <TimeTrackingCard
          customCategories={[]}
          onAddCustomCategory={() => {}}
          onUpdateHours={(categoryId: string, hours: number) => {
            setTimeEntries((prev) => {
              const newEntries = prev.filter((entry) => entry.categoryId !== categoryId);
              if (hours > 0) {
                newEntries.push({ categoryId, hours });
              }
              return newEntries;
            });
            if (isEditing) {
              autoSave();
            }
          }}
        />

          <AddCustomTrackerDialog
            open={showAddCategoryDialog}
            onOpenChange={setShowAddCategoryDialog}
            onAdd={(tracker) => {
              setCustomTrackers((prev) => [...prev, { ...tracker, value: undefined }]);
            }}
          />

        {/* Mood Tracking */}
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#F3E8FF] flex items-center justify-center">
                  <Brain className="h-5 w-5 text-[#953599]" />
                </div>
                <h3 className="font-semibold text-sm text-neutral-800">Mood Selection</h3>
              </div>
              <p className="text-xs text-neutral-500">Select up to 3 moods</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => toggleMood(mood.label)}
                  className={cn(
                    "px-3 py-2 rounded-full text-sm flex items-center gap-2 transition-all border-2",
                    selectedMoods.includes(mood.label)
                      ? "border-[#953599] shadow-sm scale-105"
                      : "border-neutral-200 hover:border-neutral-300"
                  )}
                  style={{
                    backgroundColor: selectedMoods.includes(mood.label) ? '#f5e5e0' : 'white'
                  }}
                >
                  <span className="text-lg">{mood.emoji}</span>
                  <span className={selectedMoods.includes(mood.label) ? "font-medium" : ""}>
                    {mood.label}
                  </span>
                </button>
              ))}
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="px-3 py-2 rounded-full text-sm flex items-center gap-2 border-2 border-dashed border-neutral-300 hover:border-neutral-400"
                    style={{ backgroundColor: 'white' }}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Other</span>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Custom Mood</DialogTitle>
                    <DialogDescription>
                      Choose an emoji and enter a description for your mood.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Emoji</label>
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="w-12 h-12 text-2xl flex items-center justify-center border-2 border-neutral-200 rounded-lg hover:border-neutral-300"
                      >
                        {customMood.emoji || "😊"}
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute z-50 mt-2">
                          <EmojiPicker
                            onEmojiClick={(emoji: EmojiClickData) => {
                              setCustomMood({ ...customMood, emoji: emoji.emoji });
                              setShowEmojiPicker(false);
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Description</label>
                      <input
                        type="text"
                        value={customMood.text}
                        onChange={(e) => setCustomMood({ ...customMood, text: e.target.value })}
                        placeholder="Enter mood description..."
                        className="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:outline-none focus:border-[#953599]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        if (customMood.emoji && customMood.text) {
                          const newMood = { emoji: customMood.emoji, label: customMood.text };
                          setSelectedMoods([...selectedMoods, newMood.label]);
                          setCustomMood({ emoji: "", text: "" });
                        }
                      }}
                      disabled={!customMood.emoji || !customMood.text}
                      className="w-full text-white font-medium"
                      style={{ backgroundColor: '#953599' }}
                    >
                      Add Mood
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Stress Level */}
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#F3E8FF] flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-[#953599]" />
                </div>
                <h3 className="font-semibold text-sm text-neutral-800">Stress Level</h3>
              </div>
              <p className="text-xs text-neutral-500">How stressed do you feel?</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stressLevels.map((level) => (
                <button
                  key={level.label}
                  onClick={() => setStressLevel(level.label)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all text-black",
                    stressLevel === level.label
                      ? "scale-105 shadow-md"
                      : "hover:opacity-80"
                  )}
                  style={{
                    backgroundColor: level.color,
                    color: 'black !important'
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    {level.icon === 'smile' && <Smile className="h-5 w-5" />}
                    {level.icon === 'meh' && <Frown className="h-5 w-5" />}
                    {level.icon === 'frown' && <AlertCircle className="h-5 w-5" />}
                    {level.icon === 'alert-triangle' && <AlertTriangle className="h-5 w-5" />}
                    <span>{level.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cognitive Clarity */}
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#F3E8FF] flex items-center justify-center">
                  <Brain className="h-5 w-5 text-[#953599]" />
                </div>
                <h3 className="font-semibold text-sm text-neutral-800">Cognitive Clarity</h3>
              </div>
              <p className="text-xs text-neutral-500">How sharp is your mind?</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">😴</span>
                <div className="flex-1">
                  <EnergySlider
                    value={cognitiveClarity}
                    onValueChange={setCognitiveClarity}
                    min={1}
                    max={7}
                    showValue={true}
                  />
                </div>
                <span className="text-2xl">🧠</span>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-neutral-400">tired</span>
                <span className="text-xs text-neutral-400">sharp</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Physical Energy */}
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#F3E8FF] flex items-center justify-center">
                  <Zap className="h-5 w-5 text-[#953599]" />
                </div>
                <h3 className="font-semibold text-sm text-neutral-800">Physical Energy</h3>
              </div>
              <p className="text-xs text-neutral-500">How strong do you feel?</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">😔</span>
                <div className="flex-1">
                  <EnergySlider
                    value={physicalEnergy}
                    onValueChange={setPhysicalEnergy}
                    min={1}
                    max={7}
                    showValue={true}
                  />
                </div>
                <span className="text-2xl">💪</span>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-neutral-400">weak</span>
                <span className="text-xs text-neutral-400">strong</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sleep Hygiene Checklist */}
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#F3E8FF] flex items-center justify-center">
                  <Moon className="h-5 w-5 text-[#953599]" />
                </div>
                <h3 className="font-semibold text-sm text-neutral-800">Sleep Hygiene Checklist</h3>
              </div>
              <p className="text-xs text-neutral-500">Track your sleep habits</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setSleepHygiene(prev => ({ ...prev, consistentSchedule: !prev.consistentSchedule }))}
                className="flex items-center w-full p-3 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={cn(
                    "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors",
                    sleepHygiene.consistentSchedule ? "bg-[#953599] border-[#953599]" : "border-neutral-300"
                  )}>
                    {sleepHygiene.consistentSchedule && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-neutral-700 font-normal">Bed & wake time consistent</span>
                </div>
              </button>

              <button
                onClick={() => setSleepHygiene(prev => ({ ...prev, noScreens: !prev.noScreens }))}
                className="flex items-center w-full p-3 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={cn(
                    "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors",
                    sleepHygiene.noScreens ? "bg-[#953599] border-[#953599]" : "border-neutral-300"
                  )}>
                    {sleepHygiene.noScreens && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-neutral-700 font-normal">Screens off 1h before bed</span>
                </div>
              </button>

              <button
                onClick={() => setSleepHygiene(prev => ({ ...prev, relaxingRoutine: !prev.relaxingRoutine }))}
                className="flex items-center w-full p-3 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={cn(
                    "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors",
                    sleepHygiene.relaxingRoutine ? "bg-[#953599] border-[#953599]" : "border-neutral-300"
                  )}>
                    {sleepHygiene.relaxingRoutine && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-neutral-700 font-normal">Relaxing pre-sleep routine done</span>
                </div>
              </button>

              <button
                onClick={() => setSleepHygiene(prev => ({ ...prev, optimalEnvironment: !prev.optimalEnvironment }))}
                className="flex items-center w-full p-3 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={cn(
                    "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors",
                    sleepHygiene.optimalEnvironment ? "bg-[#953599] border-[#953599]" : "border-neutral-300"
                  )}>
                    {sleepHygiene.optimalEnvironment && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-neutral-700 font-normal">Bedroom dark, quiet, cool</span>
                </div>
              </button>

              <button
                onClick={() => setSleepHygiene(prev => ({ ...prev, noCaffeine: !prev.noCaffeine }))}
                className="flex items-center w-full p-3 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={cn(
                    "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors",
                    sleepHygiene.noCaffeine ? "bg-[#953599] border-[#953599]" : "border-neutral-300"
                  )}>
                    {sleepHygiene.noCaffeine && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-neutral-700 font-normal">No caffeine/heavy food 4–6h before</span>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Lifestyle Factors Section */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#fef3e5' }}
            >
              <Activity className="h-5 w-5" style={{ color: '#f5855f' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-800">Lifestyle Factors</h2>
              <p className="text-sm text-neutral-500">Rate factors affecting your energy</p>
            </div>
          </div>

          {/* Sleep Quality */}
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#f3e8ff' }}
                  >
                    <Moon className="h-5 w-5" style={{ color: '#a855f7' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-neutral-800">Sleep Quality</h3>
                      <span className="text-xs text-neutral-400">☑ Auto-sync available</span>
                    </div>
                    <p className="text-xs text-neutral-500">How restful sleep felt last night</p>
                  </div>
                </div>
                <div 
                  className="px-2 py-1 rounded text-sm font-medium"
                  style={{ backgroundColor: '#f5e5e0' }}
                >
                  {sleepQuality} /5
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2 flex-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSleepQuality(level)}
                      className={cn(
                        "flex-1 h-14 rounded-lg flex items-center justify-center transition-all text-3xl",
                        sleepQuality >= level ? "scale-105" : "opacity-40"
                      )}
                      style={{
                        color: sleepQuality >= level ? '#a855f7' : '#d1d5db'
                      }}
                    >
                      🌙
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-xs text-neutral-400">Poor</span>
                <span className="text-xs text-neutral-400">Restful</span>
              </div>
            </CardContent>
          </Card>

          {/* Hydration */}
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#dbeafe' }}
                  >
                    <Droplet className="h-5 w-5" style={{ color: '#3b82f6' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-neutral-800">Hydration</h3>
                    <p className="text-xs text-neutral-500">Glasses of water today</p>
                  </div>
                </div>
                <div 
                  className="px-2 py-1 rounded text-sm font-medium"
                  style={{ backgroundColor: '#f5e5e0' }}
                >
                  {hydrationLevel} glasses
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <button
                    key={level}
                    onClick={() => setHydrationLevel(level)}
                    className={cn(
                      "flex-1 h-12 rounded-lg flex items-center justify-center transition-all text-2xl",
                      hydrationLevel >= level ? "scale-105" : "opacity-30"
                    )}
                    style={{
                      color: hydrationLevel >= level ? '#3b82f6' : '#d1d5db'
                    }}
                  >
                    💧
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-xs text-neutral-400">0 glasses</span>
                <span className="text-xs text-neutral-400">10 glasses</span>
              </div>
            </CardContent>
          </Card>

          {/* Healthy Food */}
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#fef3e5' }}
                  >
                    <Apple className="h-5 w-5" style={{ color: '#f97316' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-neutral-800">Healthy Food</h3>
                    <p className="text-xs text-neutral-500">Healthy meals and snacks</p>
                  </div>
                </div>
                <div 
                  className="px-2 py-1 rounded text-sm font-medium"
                  style={{ backgroundColor: '#f5e5e0' }}
                >
                  {healthyFood} /5
                </div>
              </div>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setHealthyFood(level)}
                    className={cn(
                      "flex-1 h-14 rounded-lg flex items-center justify-center transition-all text-3xl",
                      healthyFood >= level ? "scale-105" : "opacity-40"
                    )}
                  >
                    {level === 1 ? "🥕" : level === 2 ? "🍎" : level === 3 ? "🥕" : level === 4 ? "🍎" : "🥕"}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-xs text-neutral-400">0 servings</span>
                <span className="text-xs text-neutral-400">5 servings</span>
              </div>
            </CardContent>
          </Card>

          {/* Caffeine */}
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#fef3e5' }}
                  >
                    <Coffee className="h-5 w-5" style={{ color: '#78350f' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-neutral-800">Caffeine</h3>
                    <p className="text-xs text-neutral-500">Cups of coffee today</p>
                  </div>
                </div>
                <div 
                  className="px-2 py-1 rounded text-sm font-medium"
                  style={{ backgroundColor: '#f5e5e0' }}
                >
                  {caffeineLevel} cups
                </div>
              </div>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((level) => (
                  <button
                    key={level}
                    onClick={() => setCaffeineLevel(level)}
                    className={cn(
                      "flex-1 h-14 rounded-lg flex items-center justify-center transition-all text-3xl",
                      caffeineLevel >= level ? "scale-105" : "opacity-40"
                    )}
                    style={{
                      color: caffeineLevel >= level ? '#78350f' : '#d1d5db'
                    }}
                  >
                    ☕
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-xs text-neutral-400">No caffeine</span>
                <span className="text-xs text-neutral-400">Heavy intake</span>
              </div>
            </CardContent>
          </Card>

          {/* Exercise */}
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#fee2e2' }}
                  >
                    <Activity className="h-5 w-5" style={{ color: '#ef4444' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-neutral-800">Exercise</h3>
                    <p className="text-xs text-neutral-500">Did you exercise today?</p>
                  </div>
                </div>
                <button
                  onClick={() => setExercise(!exercise)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    exercise ? "bg-[#953599]" : "bg-neutral-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      exercise ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Social Interaction */}
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="pt-4 pb-4 px-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#fef3e5' }}
                  >
                    <Users className="h-5 w-5" style={{ color: '#f97316' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-neutral-800">Social interaction</h3>
                    <p className="text-xs text-neutral-500">Track your social energy</p>
                  </div>
                </div>
                <button
                  onClick={() => setSocialInteraction(prev => ({ ...prev, hadInteraction: !prev.hadInteraction }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    socialInteraction.hadInteraction ? "bg-[#953599]" : "bg-neutral-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      socialInteraction.hadInteraction ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {socialInteraction.hadInteraction && (
                <div className="space-y-4">
                  {/* Energy Impact */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Energy Impact</label>
                    <div className="flex gap-2">
                      {[
                        { value: -2, label: "Major Drain", emoji: "😫" },
                        { value: -1, label: "Minor Drain", emoji: "😕" },
                        { value: 0, label: "Neutral", emoji: "😐" },
                        { value: 1, label: "Minor Boost", emoji: "😊" },
                        { value: 2, label: "Major Boost", emoji: "🤗" }
                      ].map((impact) => (
                        <button
                          key={impact.value}
                          onClick={() => setSocialInteraction(prev => ({ ...prev, energyImpact: impact.value }))}
                          className={cn(
                            "flex-1 py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all",
                            socialInteraction.energyImpact === impact.value
                              ? "bg-[#fae5fa] scale-105"
                              : "hover:bg-neutral-50"
                          )}
                        >
                          <span className="text-xl">{impact.emoji}</span>
                          <span className="text-xs text-neutral-600 font-normal">{impact.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interaction Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Who did you spend time with?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "individual", label: "Individual", emoji: "👤" },
                        { value: "group", label: "Group", emoji: "👥" },
                        { value: "family", label: "Family", emoji: "👨‍👩‍👧‍👦" },
                        { value: "friend", label: "Friend(s)", emoji: "🤝" },
                        { value: "coworker", label: "Coworker(s)", emoji: "💼" },
                        { value: "other", label: "Other", emoji: "✨" }
                      ].map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setSocialInteraction(prev => ({ ...prev, interactionType: type.value }))}
                          className={cn(
                            "py-2 px-3 rounded-lg flex items-center gap-2 transition-all border-2",
                            socialInteraction.interactionType === type.value
                              ? "border-[#953599] bg-[#fae5fa]"
                              : "border-neutral-200 hover:border-neutral-300"
                          )}
                        >
                          <span className="text-xl">{type.emoji}</span>
                          <span className="text-sm text-neutral-700 font-normal">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700">Additional Notes</label>
                    <textarea
                      value={socialInteraction.notes}
                      onChange={(e) => setSocialInteraction(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any details about your social interaction..."
                      className="w-full px-3 py-2 rounded-lg border-2 border-neutral-200 focus:outline-none focus:border-[#953599] text-sm font-normal"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hide/Show Lifestyle Details */}
          <button
            onClick={() => setShowLifestyleDetails(!showLifestyleDetails)}
            className="w-full py-3 bg-white rounded-xl border border-neutral-200 flex items-center justify-center gap-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            {showLifestyleDetails ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide Lifestyle
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show Lifestyle
              </>
            )}
          </button>

          {/* Expandable Section */}
          {showLifestyleDetails && (
            <div className="space-y-3">
              {/* Medication */}
              <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4" style={{ color: '#3b82f6' }} />
                    <h3 className="font-semibold text-sm text-neutral-800">Medication</h3>
                  </div>
                  <span className="text-sm text-neutral-400">None</span>
                </div>
                <button className="text-xs text-neutral-400 hover:text-neutral-600">
                  Add medication...
                </button>
              </div>

              {/* Allergies */}
              <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" style={{ color: '#f97316' }} />
                    <h3 className="font-semibold text-sm text-neutral-800">Allergies</h3>
                  </div>
                  <span className="text-sm text-neutral-400">None</span>
                </div>
                <button className="text-xs text-neutral-400 hover:text-neutral-600">
                  Add allergy...
                </button>
              </div>

              {/* Supplements */}
              <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4" style={{ color: '#a855f7' }} />
                    <h3 className="font-semibold text-sm text-neutral-800">Supplements</h3>
                  </div>
                  <span className="text-sm text-neutral-400">None</span>
                </div>
                <button className="text-xs text-neutral-400 hover:text-neutral-600">
                  Add supplement...
                </button>
              </div>

              {/* Custom Trackers */}
              {customTrackers.map((tracker) => (
                <Card key={tracker.id} className="border-neutral-200 shadow-sm">
                  <CardContent className="pt-4 pb-4 px-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#fef3e5' }}
                        >
                          <span className="text-xl">{tracker.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-neutral-800">{tracker.label}</h3>
                          <p className="text-xs text-neutral-500">
                            {tracker.unitType === "scale" ? "Rate from 1-5" :
                             tracker.unitType === "boolean" ? "Track as Yes/No" :
                             `Track in ${tracker.unit}`}
                          </p>
                        </div>
                      </div>
                      {tracker.unitType === "number" && (
                        <div className="px-2 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#f5e5e0' }}>
                          {tracker.value || 0} {tracker.unit}
                        </div>
                      )}
                    </div>
                    {tracker.unitType === "scale" && (
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            onClick={() => {
                              setCustomTrackers(prev => 
                                prev.map(t => t.id === tracker.id ? { ...t, value: level } : t)
                              );
                              if (isEditing) autoSave();
                            }}
                            className={cn(
                              "flex-1 h-14 rounded-lg flex items-center justify-center transition-all text-3xl",
                              (tracker.value as number) >= level ? "scale-105" : "opacity-40"
                            )}
                            style={{
                              color: (tracker.value as number) >= level ? '#953599' : '#d1d5db'
                            }}
                          >
                            {tracker.icon}
                          </button>
                        ))}
                      </div>
                    )}
                    {tracker.unitType === "boolean" && (
                      <button
                        onClick={() => {
                          setCustomTrackers(prev => 
                            prev.map(t => t.id === tracker.id ? { ...t, value: !t.value } : t)
                          );
                          if (isEditing) autoSave();
                        }}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                          tracker.value ? "bg-[#953599]" : "bg-neutral-200"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            tracker.value ? "translate-x-6" : "translate-x-1"
                          )}
                        />
                      </button>
                    )}
                    {tracker.unitType === "number" && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={(tracker.value as number | string) || ""}
                          onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : undefined;
                            setCustomTrackers(prev => 
                              prev.map(t => t.id === tracker.id ? { ...t, value } : t)
                            );
                            if (isEditing) autoSave();
                          }}
                          placeholder={`Enter ${tracker.unit}...`}
                          className="flex-1 px-3 py-2 border-2 border-neutral-200 rounded-lg focus:outline-none focus:border-[#953599]"
                        />
                        <span className="text-sm text-neutral-500">{tracker.unit}</span>
                      </div>
                    )}
                    {tracker.unitType === "string" && (
                      <input
                        type="text"
                        value={(tracker.value as string) || ""}
                        onChange={(e) => {
                          setCustomTrackers(prev => 
                            prev.map(t => t.id === tracker.id ? { ...t, value: e.target.value } : t)
                          );
                          if (isEditing) autoSave();
                        }}
                        placeholder={`Enter ${tracker.unit}...`}
                        className="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:outline-none focus:border-[#953599]"
                      />
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Add Custom Tracker */}
              <button 
                onClick={() => setShowAddCategoryDialog(true)}
                className="w-full py-3 bg-white rounded-xl border border-neutral-200 flex items-center justify-center gap-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Add Custom Tracker
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full text-white font-bold text-base h-12 rounded-full shadow-md hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#953599' }}
        >
          {isSubmitting ? "Saving..." : "Save Energy Snapshot"}
        </Button>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50">
        <div className="flex items-center justify-around h-14 sm:h-16 px-2 sm:px-4">
          <a href="/home" className="flex flex-col items-center gap-1 text-neutral-400 min-w-0">
            <Home className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs truncate">Home</span>
          </a>
          <button className="flex flex-col items-center gap-1 min-w-0" style={{ color: '#953599' }}>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs font-medium truncate">Track</span>
          </button>
          <a href="/analytics" className="flex flex-col items-center gap-1 text-neutral-400 min-w-0">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs truncate">Analytics</span>
          </a>
          <a href="/profile" className="flex flex-col items-center gap-1 text-neutral-400 min-w-0">
            <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs truncate">Profile</span>
          </a>
        </div>
      </nav>
    </div>
  );
}

