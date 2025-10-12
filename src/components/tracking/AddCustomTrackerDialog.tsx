"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface AddCustomTrackerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (tracker: { 
    id: string; 
    label: string; 
    icon: string;
    unit: string;
    unitType: "number" | "scale" | "boolean" | "string";
    maxValue?: number;
  }) => void;
}

const UNIT_TYPES = [
  { id: "number", label: "Number", description: "Track a numeric value (e.g., steps, minutes)" },
  { id: "scale", label: "Scale (1-5)", description: "Rate on a scale from 1 to 5" },
  { id: "boolean", label: "Yes/No", description: "Track as done/not done" },
  { id: "string", label: "Text", description: "Track with custom text" },
];

export function AddCustomTrackerDialog({
  open,
  onOpenChange,
  onAdd,
}: AddCustomTrackerDialogProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [customTracker, setCustomTracker] = useState({
    label: "",
    icon: "📊",
    unit: "",
    unitType: "number" as "number" | "scale" | "boolean" | "string",
    maxValue: undefined as number | undefined,
  });

  const handleSubmit = () => {
    if (customTracker.label.trim() && customTracker.unit.trim()) {
      onAdd({
        id: customTracker.label.toLowerCase().replace(/\s+/g, "-"),
        label: customTracker.label,
        icon: customTracker.icon,
        unit: customTracker.unit,
        unitType: customTracker.unitType,
        maxValue: customTracker.maxValue,
      });
      setCustomTracker({ 
        label: "", 
        icon: "📊", 
        unit: "", 
        unitType: "number",
        maxValue: undefined 
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Custom Tracker</DialogTitle>
          <DialogDescription>
            Create a new tracker to monitor any aspect of your lifestyle.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Icon</label>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-12 h-12 text-2xl flex items-center justify-center border-2 border-neutral-200 rounded-lg hover:border-neutral-300"
            >
              {customTracker.icon}
            </button>
            {showEmojiPicker && (
              <div className="absolute z-50 mt-2">
                <EmojiPicker
                  onEmojiClick={(emoji: EmojiClickData) => {
                    setCustomTracker({ ...customTracker, icon: emoji.emoji });
                    setShowEmojiPicker(false);
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tracker Name</label>
            <input
              type="text"
              value={customTracker.label}
              onChange={(e) =>
                setCustomTracker({ ...customTracker, label: e.target.value })
              }
              placeholder="Enter tracker name..."
              className="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:outline-none focus:border-[#953599]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tracking Type</label>
            <div className="grid grid-cols-1 gap-2">
              {UNIT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setCustomTracker({ 
                    ...customTracker, 
                    unitType: type.id as "number" | "scale" | "boolean" | "string",
                    unit: "",
                    maxValue: type.id === "scale" ? 5 : undefined
                  })}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                    customTracker.unitType === type.id 
                      ? "border-[#953599] bg-[#fae5fa]" 
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm">{type.label}</span>
                    <span className="text-xs text-neutral-500">{type.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Unit</label>
            {customTracker.unitType === "number" && (
              <input
                type="text"
                value={customTracker.unit}
                onChange={(e) =>
                  setCustomTracker({ ...customTracker, unit: e.target.value })
                }
                placeholder="e.g., steps, minutes, hours..."
                className="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:outline-none focus:border-[#953599]"
              />
            )}
            {customTracker.unitType === "scale" && (
              <div className="text-sm text-neutral-500">
                Will be tracked on a scale of 1-5
              </div>
            )}
            {customTracker.unitType === "boolean" && (
              <div className="text-sm text-neutral-500">
                Will be tracked as Yes/No
              </div>
            )}
            {customTracker.unitType === "string" && (
              <input
                type="text"
                value={customTracker.unit}
                onChange={(e) =>
                  setCustomTracker({ ...customTracker, unit: e.target.value })
                }
                placeholder="e.g., mood description, notes..."
                className="w-full px-3 py-2 border-2 border-neutral-200 rounded-lg focus:outline-none focus:border-[#953599]"
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!customTracker.label.trim() || (["number", "string"].includes(customTracker.unitType) && !customTracker.unit.trim())}
            className="w-full text-white font-medium"
            style={{ backgroundColor: "#953599" }}
          >
            Add Tracker
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
