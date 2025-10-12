"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CategoryBase {
  id: string;
  label: string;
  icon: string;
}

interface TimeCategory extends CategoryBase {
  hours: number;
}

const defaultCategories: CategoryBase[] = [
  { id: "work", label: "Work", icon: "💼" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
  { id: "rest", label: "Rest", icon: "😴" },
  { id: "hobby", label: "Hobby", icon: "🎨" },
];

interface TimeTrackingCardProps {
  customCategories?: CategoryBase[];
  onAddCustomCategory?: () => void;
  onUpdateHours: (categoryId: string, hours: number) => void;
}

export function TimeTrackingCard({
  customCategories = [],
  onAddCustomCategory,
  onUpdateHours,
}: TimeTrackingCardProps) {
  const [categoryHours, setCategoryHours] = useState<Record<string, number>>({});
  
  const categories = [...defaultCategories, ...customCategories];

  const handleHoursChange = (categoryId: string, hours: number) => {
    if (hours >= 0 && hours <= 24) {
      setCategoryHours((prev) => ({
        ...prev,
        [categoryId]: hours,
      }));
      onUpdateHours(categoryId, hours);
    }
  };

  return (
    <Card className="border-neutral-200 shadow-sm">
      <CardContent className="pt-5 pb-5 px-5">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F3E8FF] flex items-center justify-center">
              <Clock className="h-5 w-5 text-[#953599]" />
            </div>
            <h3 className="font-semibold text-sm text-neutral-800">Time Tracking</h3>
          </div>
          <p className="text-xs text-neutral-500">How did you spend your time today?</p>
        </div>

        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-4 p-3 bg-white rounded-lg border border-neutral-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <span className="font-medium text-sm">{category.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleHoursChange(category.id, Math.max(0, (categoryHours[category.id] || 0) - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">
                  {categoryHours[category.id] || 0}h
                </span>
                <button
                  onClick={() => handleHoursChange(category.id, Math.min(24, (categoryHours[category.id] || 0) + 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100"
                >
                  +
                </button>
              </div>
            </div>
          ))}

          {onAddCustomCategory && (
            <button
              onClick={onAddCustomCategory}
              className="w-full py-3 bg-white rounded-xl border border-neutral-200 flex items-center justify-center gap-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Custom Category
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
