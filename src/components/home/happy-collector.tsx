"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, PencilLine } from "lucide-react";

export function HappyCollector() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveHappyMoment = async () => {
    if (!note.trim()) return;
    
    setIsSubmitting(true);
    try {
      await fetch("/api/happy-moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note,
          tsUtc: new Date().toISOString(),
        }),
      });
      setIsDialogOpen(false);
      setNote("");
    } catch (error) {
      console.error("Error saving happy moment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-neutral-200">
      <CardContent className="pt-6 pb-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Happy Collector</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
              onClick={() => setIsDialogOpen(true)}
            >
              <Camera className="h-4 w-4 mr-2" />
              Record
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-pink-200 hover:border-pink-300 text-pink-600 hover:text-pink-700"
              onClick={() => setIsDialogOpen(true)}
            >
              <PencilLine className="h-4 w-4 mr-2" />
              Take Note
            </Button>
          </div>
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
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe your happy moment..."
              rows={4}
            />
            <Button
              onClick={saveHappyMoment}
              disabled={isSubmitting || !note.trim()}
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
