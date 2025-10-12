"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

interface EnergySliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  showValue?: boolean;
}

function EnergySlider({
  className,
  value,
  min = 1,
  max = 7,
  showValue = true,
  ...props
}: EnergySliderProps) {
  const currentValue = Array.isArray(value) ? value[0] : min;
  const percentage = ((currentValue - min) / (max - min)) * 100;

  return (
    <div className="relative w-full">
      <SliderPrimitive.Root
        value={value}
        min={min}
        max={max}
        step={1}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-neutral-200">
          <SliderPrimitive.Range 
            className="absolute h-full rounded-full"
            style={{ 
              background: 'linear-gradient(90deg, #1a1a1a 0%, #953599 100%)'
            }}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="relative block h-10 w-10 rounded-full border-4 border-white shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-all"
          style={{ backgroundColor: '#953599' }}
        >
          {showValue && (
            <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
              {currentValue}
            </span>
          )}
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
    </div>
  );
}

export { EnergySlider }

