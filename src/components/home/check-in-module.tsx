"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnergySlider } from "@/components/ui/energy-slider";
import { cn } from "@/lib/utils";
import { Brain, Zap, Check, Clock } from "lucide-react";

interface CheckInModuleProps {
  completedCheckins: number;
  onCheckInComplete: () => void;
}

export function CheckInModule({ completedCheckins, onCheckInComplete }: CheckInModuleProps) {
  const [currentStep, setCurrentStep] = useState<'cognitive' | 'physical'>('cognitive');
  const [cognitiveClarity, setCognitiveClarity] = useState([4]);
  const [physicalEnergy, setPhysicalEnergy] = useState([4]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTimeWindow = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    if (hour < 21) return "evening";
    return "night";
  };

  const getWindowLabel = () => {
    const window = getTimeWindow();
    return `${window.charAt(0).toUpperCase() + window.slice(1)} Check-in`;
  };

  const handleSubmit = async () => {
    if (currentStep === 'cognitive') {
      setCurrentStep('physical');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          window: getTimeWindow(),
          physical17: physicalEnergy[0],
          cognitive17: cognitiveClarity[0],
          mood17: null,
          stress17: null,
          note: null,
        }),
      });

      if (response.ok) {
        onCheckInComplete();
        // Reset form
        setCurrentStep('cognitive');
        setCognitiveClarity([4]);
        setPhysicalEnergy([4]);
      }
    } catch (error) {
      console.error("Error submitting check-in:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-neutral-200 shadow-sm">
      <CardContent className="pt-5 pb-5 px-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base text-neutral-800">{getWindowLabel()}</h3>
            <Clock className="h-5 w-5 text-neutral-500" />
          </div>
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center transition-colors",
                  i < completedCheckins 
                    ? "bg-[#953599] text-white" 
                    : "bg-neutral-200"
                )}
              >
                {i < completedCheckins && (
                  <Check className="w-3 h-3" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Label */}
        <div className="text-center">
          <p className="text-sm text-neutral-600 font-medium">
            {currentStep === 'cognitive' ? 'Cognitive Clarity' : 'Physical Energy'}
          </p>
        </div>

        {/* Slider with icons */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {currentStep === 'cognitive' ? (
              <>
                <Brain className="h-6 w-6 text-neutral-400 flex-shrink-0" />
                <div className="flex-1">
                  <EnergySlider
                    value={cognitiveClarity}
                    onValueChange={setCognitiveClarity}
                    min={1}
                    max={7}
                    showValue={true}
                  />
                </div>
                <Brain className="h-6 w-6 text-neutral-400 flex-shrink-0" />
              </>
            ) : (
              <>
                <Zap className="h-6 w-6 text-neutral-400 flex-shrink-0" />
                <div className="flex-1">
                  <EnergySlider
                    value={physicalEnergy}
                    onValueChange={setPhysicalEnergy}
                    min={1}
                    max={7}
                    showValue={true}
                  />
                </div>
                <Zap className="h-6 w-6 text-neutral-400 flex-shrink-0" />
              </>
            )}
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-neutral-400">low</span>
            <span className="text-xs text-neutral-400">high</span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full text-white font-medium text-sm h-11 rounded-full shadow-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#953599' }}
        >
          {isSubmitting 
            ? "Submitting..." 
            : currentStep === 'cognitive' 
              ? "Next" 
              : "Submit Check-in"}
        </Button>
      </CardContent>
    </Card>
  );
}

