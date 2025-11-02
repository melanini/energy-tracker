"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock, Smile, Calendar } from "lucide-react";

export function QuickActions() {
  const [pomodoroDialog, setPomodoroDialog] = useState(false);
  const [happyMomentDialog, setHappyMomentDialog] = useState(false);
  const [pomodoroMinutes, setPomodoroMinutes] = useState(20);
  const [happyTitle, setHappyTitle] = useState("");
  const [happyNote, setHappyNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startPomodoro = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/pomodoro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: pomodoroMinutes,
          completed: false,
        }),
      });
      setPomodoroDialog(false);
      // TODO: Start actual timer
    } catch (error) {
      console.error("Error starting pomodoro:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveHappyMoment = async () => {
    if (!happyTitle.trim() || !happyNote.trim()) return;
    
    setIsSubmitting(true);
    try {
      await fetch("/api/happy-moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: happyTitle.trim(),
          note: happyNote.trim(),
          tsUtc: new Date().toISOString(),
        }),
      });
      setHappyMomentDialog(false);
      setHappyTitle("");
      setHappyNote("");
    } catch (error) {
      console.error("Error saving happy moment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm">Quick Actions</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Pomodoro Timer */}
        <Card className="border-neutral-200 hover:border-purple-300 transition-colors">
          <CardContent className="pt-6">
            <Dialog open={pomodoroDialog} onOpenChange={setPomodoroDialog}>
              <DialogTrigger asChild>
                <button className="w-full text-left space-y-3">
                  <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-center">Work Timer</h4>
                    <p className="text-xs text-neutral-500 text-center">Pomodoro session</p>
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start Pomodoro Timer</DialogTitle>
                  <DialogDescription>
                    Select duration for your focused work session
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {[15, 20, 25, 50].map((min) => (
                      <Button
                        key={min}
                        variant={pomodoroMinutes === min ? "default" : "outline"}
                        onClick={() => setPomodoroMinutes(min)}
                        className="flex-1"
                      >
                        {min}m
                      </Button>
                    ))}
                  </div>
                  <Button
                    onClick={startPomodoro}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {isSubmitting ? "Starting..." : "Start Timer"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Happy Moment */}
        <Card className="border-neutral-200 hover:border-purple-300 transition-colors">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="h-12 w-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto">
                <Smile className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-center">Happy Moment</h4>
                <p className="text-xs text-neutral-500 text-center">Capture joy</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                  onClick={() => {
                    setHappyTitle("");
                    setHappyNote("");
                    setHappyMomentDialog(true);
                  }}
                >
                  Record Moment
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-pink-200 hover:border-pink-300 text-pink-600 hover:text-pink-700"
                  onClick={() => {
                    setHappyTitle("");
                    setHappyNote("");
                    setHappyMomentDialog(true);
                  }}
                >
                  Take Note
                </Button>
              </div>
              <Dialog open={happyMomentDialog} onOpenChange={setHappyMomentDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Capture a Happy Moment</DialogTitle>
                    <DialogDescription>
                      What made you smile today?
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      value={happyTitle}
                      onChange={(e) => setHappyTitle(e.target.value)}
                      placeholder="Give your moment a title..."
                      className="w-full"
                    />
                    <Textarea
                      value={happyNote}
                      onChange={(e) => setHappyNote(e.target.value)}
                      placeholder="Describe your happy moment..."
                      rows={4}
                    />
                    <Button
                      onClick={saveHappyMoment}
                      disabled={isSubmitting || !happyTitle.trim() || !happyNote.trim()}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      {isSubmitting ? "Saving..." : "Save Moment"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Time Spent */}
        <Card className="border-neutral-200 hover:border-purple-300 transition-colors">
          <CardContent className="pt-6">
            <button className="w-full text-left space-y-3">
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-center">Time Spent</h4>
                <p className="text-xs text-neutral-500 text-center">Log activity</p>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

