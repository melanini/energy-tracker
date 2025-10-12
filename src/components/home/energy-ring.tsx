"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EnergyRingProps {
  percentage: number;
}

export function EnergyRing({ percentage }: EnergyRingProps) {
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="border-neutral-200">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Energy Level</h3>
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-neutral-400 hover:text-neutral-600">
                <Info className="h-4 w-4" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How Energy % is Calculated</DialogTitle>
                <DialogDescription className="space-y-2 text-sm">
                  <p>
                    Your Energy % is calculated by averaging your Physical Energy and Cognitive
                    Clarity ratings (1-7 scale) and mapping them to 0-100%.
                  </p>
                  <p className="font-medium">Formula:</p>
                  <p className="font-mono text-xs bg-neutral-100 p-2 rounded">
                    ((Physical + Cognitive) / 2 - 1) / 6 × 100
                  </p>
                  <p>
                    If you've logged Mood and Stress, they can modulate your score by ±5% to give a
                    more complete picture of your overall energy.
                  </p>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-neutral-200"
              />
              {/* Progress circle */}
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {Math.round(percentage)}%
              </span>
            </div>
          </div>
          <p className="text-xs text-neutral-500 mt-2">Based on today's check-ins</p>
        </div>
      </CardContent>
    </Card>
  );
}

