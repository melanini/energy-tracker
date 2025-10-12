"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, BookmarkPlus, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface Insight {
  text: string;
  confidence: number;
  explanation: string;
  generatedAt: string;
}

export function DailyInsightCard() {
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsight();
  }, []);

  const fetchInsight = async () => {
    try {
      const response = await fetch("/api/daily-insight");
      if (!response.ok) {
        throw new Error('Failed to fetch insight');
      }
      const data = await response.json();
      setInsight(data);
    } catch (err) {
      setError('Could not load daily insight');
      console.error('Error fetching insight:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (type: string) => {
    setFeedback(type);
    // TODO: Send feedback to API
  };

  return (
    <Card className="border-neutral-200">
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Daily Insight</h3>
            {loading ? (
              <div className="flex items-center gap-2 text-neutral-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading insight...</span>
              </div>
            ) : error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : insight ? (
              <>
                <p className="text-sm text-neutral-700 leading-relaxed">{insight.text}</p>
                <p className="text-xs text-neutral-500 mt-1">Generated {new Date(insight.generatedAt).toLocaleTimeString()}</p>
              </>
            ) : null}
          </div>
          {!loading && !error && insight && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-neutral-400 hover:text-neutral-600"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>

        {!loading && !error && insight && expanded && (
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs text-neutral-600">{insight.explanation}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">Confidence:</span>
              <div className="flex-1 bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${insight.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium">{Math.round(insight.confidence * 100)}%</span>
            </div>
          </div>
        )}

        {!loading && !error && insight && (
          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFeedback("helpful")}
              className={feedback === "helpful" ? "bg-green-50 border-green-200" : ""}
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              <span className="text-xs">More like this</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFeedback("not_helpful")}
              className={feedback === "not_helpful" ? "bg-red-50 border-red-200" : ""}
            >
              <ThumbsDown className="h-3 w-3 mr-1" />
              <span className="text-xs">Not helpful</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFeedback("saved")}
              className="ml-auto"
            >
              <BookmarkPlus className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

