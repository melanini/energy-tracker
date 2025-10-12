import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Brain } from 'lucide-react';

interface BaseCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  description?: string;
}

export default function BaseCard({ title, children, className = '', icon, description }: BaseCardProps) {
  return (
    <Card className={`border-neutral-200 shadow-sm ${className}`}>
      <CardContent className="pt-5 pb-5 px-5">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F3E8FF] flex items-center justify-center">
              {icon || <Brain className="h-5 w-5 text-[#953599]" />}
            </div>
            <h3 className="font-semibold text-sm text-neutral-800">{title}</h3>
          </div>
          {description && <p className="text-xs text-neutral-500">{description}</p>}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
