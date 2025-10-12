"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { CategoryBase } from "@/components/tracking/TimeTrackingCard";
import { AddCustomTrackerDialog } from "@/components/tracking/AddCustomTrackerDialog";

export default function TimeCategoriesPage() {
  const [customCategories, setCustomCategories] = useState<CategoryBase[]>([]);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);

  useEffect(() => {
    // Load custom categories from API
    const loadCustomCategories = async () => {
      try {
        const response = await fetch("/api/time-categories");
        if (response.ok) {
          const data = await response.json();
          setCustomCategories(data);
        }
      } catch (error) {
        console.error("Error loading custom categories:", error);
      }
    };

    loadCustomCategories();
  }, []);

  const handleAddCategory = async (category: CategoryBase) => {
    try {
      const response = await fetch("/api/time-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });

      if (response.ok) {
        setCustomCategories((prev) => [...prev, category]);
      }
    } catch (error) {
      console.error("Error adding custom category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/time-categories/${categoryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCustomCategories((prev) =>
          prev.filter((cat) => cat.id !== categoryId)
        );
      }
    } catch (error) {
      console.error("Error deleting custom category:", error);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f5f2" }}>
      {/* Header */}
      <header className="bg-white px-4 py-4 border-b border-neutral-200">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <a href="/settings" className="p-2 hover:bg-neutral-100 rounded-lg">
              <ChevronLeft className="h-5 w-5" style={{ color: "#953599" }} />
            </a>
            <div>
              <h1 className="text-xl font-bold text-neutral-800">
                Time Categories
              </h1>
              <p className="text-xs text-neutral-500">
                Manage your custom time tracking categories
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Default Categories */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h2 className="font-semibold text-neutral-800 mb-4">
            Default Categories
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <span className="text-2xl">💼</span>
              <span className="font-medium">Work</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
              <span className="font-medium">Family</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <span className="text-2xl">😴</span>
              <span className="font-medium">Rest</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <span className="text-2xl">🎨</span>
              <span className="font-medium">Hobby</span>
            </div>
          </div>
        </div>

        {/* Custom Categories */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <h2 className="font-semibold text-neutral-800 mb-4">
            Custom Categories
          </h2>
          <div className="space-y-3">
            {customCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-neutral-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <span className="font-medium">{category.label}</span>
                </div>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-500 text-sm hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            ))}

            <button
              onClick={() => setShowAddCategoryDialog(true)}
              className="w-full py-3 bg-white rounded-xl border border-neutral-200 flex items-center justify-center gap-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Add Custom Category
            </button>
          </div>
        </div>
      </main>

      <AddCustomTrackerDialog
        open={showAddCategoryDialog}
        onOpenChange={setShowAddCategoryDialog}
        onAdd={handleAddCategory}
      />
    </div>
  );
}
