"use client";

import { GroupedRates, ExchangeRate } from "@/lib/types";
import { RateCardEnhanced } from "./rate-card-enhanced";
import { formatDateShort } from "@/lib/helpers";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RateGroupEnhancedProps {
  group: GroupedRates;
  previousGroup: GroupedRates | null;
  isLatest?: boolean;
}

export function RateGroupEnhanced({
  group,
  previousGroup,
  isLatest = false,
}: RateGroupEnhancedProps) {
  const [isExpanded, setIsExpanded] = useState(isLatest);

  const getPreviousRate = (currentRate: ExchangeRate): ExchangeRate | null => {
    if (!previousGroup) return null;
    return (
      previousGroup.rates.find((r) => r.source === currentRate.source) || null
    );
  };

  const dateObj = new Date(group.date);
  const today = new Date();
  const isToday =
    dateObj.toDateString() === today.toDateString();

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Date Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between p-4 rounded-xl",
          "border border-border/50 bg-card/30 backdrop-blur-sm",
          "hover:bg-card/50 transition-all duration-200",
          "text-left group"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-lg bg-background/50 border border-border/50",
              isToday && "bg-blue-500/20 border-blue-500/30"
            )}
          >
            <Calendar
              className={cn(
                "w-4 h-4",
                isToday ? "text-blue-400" : "text-muted-foreground"
              )}
            />
          </div>
          <div>
            <h2
              className={cn(
                "font-bold text-xl tracking-tight",
                isToday && "text-blue-400"
              )}
            >
              {formatDateShort(group.date)}
              {isToday && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  (Today)
                </span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {group.rates.length} bank{group.rates.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </div>
      </button>

      {/* Rates Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {group.rates.map((rate, index) => (
            <div
              key={rate.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-fade-in"
            >
              <RateCardEnhanced
                rate={rate}
                previousRate={getPreviousRate(rate)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
