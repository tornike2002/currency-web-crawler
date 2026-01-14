"use client";

import { GroupedRates, ExchangeRate } from "@/lib/types";
import { RateCard } from "./rate-card";
import { formatDateShort } from "@/lib/helpers";
import { Calendar } from "lucide-react";

interface RateGroupProps {
  group: GroupedRates;
  previousGroup: GroupedRates | null;
}

export function RateGroup({ group, previousGroup }: RateGroupProps) {
  // Find previous rate for each bank in current group
  const getPreviousRate = (currentRate: ExchangeRate): ExchangeRate | null => {
    if (!previousGroup) return null;
    return (
      previousGroup.rates.find((r) => r.source === currentRate.source) || null
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground border-b border-border pb-2">
        <Calendar className="w-4 h-4" />
        <h2 className="font-semibold text-lg">{formatDateShort(group.date)}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {group.rates.map((rate) => (
          <RateCard
            key={rate.id}
            rate={rate}
            previousRate={getPreviousRate(rate)}
          />
        ))}
      </div>
    </div>
  );
}
