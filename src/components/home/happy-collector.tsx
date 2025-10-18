"use client";

import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { Camera, PencilLine, Heart } from "lucide-react";

interface HappyMoment {
  id: string;
  title: string;
  note: string | null;
  mediaRef: string | null;
  createdAt: string;
}

export function HappyCollector() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentMoments, setRecentMoments] = useState<HappyMoment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch recent happy moments
  useEffect(() => {
    const fetchRecentMoments = async () => {
      try {
        const response = await fetch("/api/happy-moments?limit=3");
        if (response.ok) {
          const moments = await response.json();
          setRecentMoments(moments);
        }
      } catch (error) {
        console.error("Error fetching recent moments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentMoments();
  }, []);

  const saveHappyMoment = async () => {
    if (!title.trim() || !note.trim()) return;
    
    setIsSubmitting(true);
    try {
      await fetch("/api/happy-moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          note: note.trim(),
          tsUtc: new Date().toISOString(),
        }),
      });
      setIsDialogOpen(false);
      setTitle("");
      setNote("");
      
      // Refresh the recent moments list
      const response = await fetch("/api/happy-moments?limit=3");
      if (response.ok) {
        const moments = await response.json();
        setRecentMoments(moments);
      }
    } catch (error) {
      console.error("Error saving happy moment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-neutral-200 shadow-sm">
      <CardContent className="pt-5 pb-4 px-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pink-50">
              <Heart className="h-6 w-6 text-pink-500" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-neutral-800">Happy Collector</h4>
              <p className="text-xs text-neutral-500">
                Capture your<br />happy moments
              </p>
            </div>
          </div>
          
          {/* Recent Moments Display */}
          {!isLoading && recentMoments.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="text-xs font-medium text-neutral-600">Recent Moments</h4>
              <div className="space-y-1.5">
                {recentMoments.map((moment, index) => (
                  <div key={moment.id} className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-pink-200 flex-shrink-0">
                      <span className="text-xs font-bold text-pink-700">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-800 truncate">
                        {moment.title}
                      </p>
                      {moment.note && (
                        <p className="text-xs text-neutral-600 truncate mt-0.5">
                          {moment.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1 text-white text-sm h-9 hover:opacity-90 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#ef4444' }}
              onClick={() => {
                setTitle("");
                setNote("");
                setIsDialogOpen(true);
              }}
            >
              <Camera className="h-4 w-4" />
              <span className="font-bold">Record</span>
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-sm h-9 hover:opacity-90 flex items-center justify-center gap-2 border-pink-200 text-pink-700"
              onClick={() => {
                setTitle("");
                setNote("");
                setIsDialogOpen(true);
              }}
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
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Capture a Happy Moment</DialogTitle>
            <DialogDescription>
              What made you smile today?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your moment a title..."
              className="w-full"
            />
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe your happy moment..."
              rows={4}
            />
            <Button
              onClick={saveHappyMoment}
              disabled={isSubmitting || !title.trim() || !note.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {isSubmitting ? "Saving..." : "Save Moment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
