"use client";

import { ExchangeRate } from "@/lib/types";
import { getRateChangeColor, isWithinLast7Days } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Minus, DollarSign } from "lucide-react";

interface RateCardEnhancedProps {
  rate: ExchangeRate;
  previousRate: ExchangeRate | null;
}

export function RateCardEnhanced({ rate, previousRate }: RateCardEnhancedProps) {
  const isRecent = isWithinLast7Days(rate.scrapedAt);
  const changeColor = getRateChangeColor(
    rate.buyRate,
    previousRate?.buyRate || null,
    isRecent
  );

  const changePercent = previousRate
    ? ((rate.buyRate - previousRate.buyRate) / previousRate.buyRate) * 100
    : 0;

  const cardGradient =
    changeColor === "green"
      ? "from-green-950/40 via-green-900/20 to-transparent border-green-800/30"
      : changeColor === "red"
      ? "from-red-950/40 via-red-900/20 to-transparent border-red-800/30"
      : "from-card/50 via-card/30 to-transparent border-border/50";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-gradient-to-br backdrop-blur-sm",
        "transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/30",
        cardGradient,
        isRecent && "ring-1 ring-offset-2 ring-offset-background",
        changeColor === "green" && "ring-green-500/50",
        changeColor === "red" && "ring-red-500/50"
      )}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[shimmer_3s_linear_infinite]" />
      </div>

      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-bold text-lg tracking-tight">{rate.source}</h3>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {new Date(rate.scrapedAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          </div>

          {/* Trend Indicator */}
          {isRecent && changeColor !== "default" && (
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                "border backdrop-blur-sm",
                changeColor === "green"
                  ? "bg-green-900/30 border-green-700/50 text-green-300"
                  : "bg-red-900/30 border-red-700/50 text-red-300"
              )}
            >
              {changeColor === "green" ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              <span className="text-xs font-semibold">
                {changePercent > 0 ? "+" : ""}
                {changePercent.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        {/* Rates */}
        <div className="space-y-3">
          {/* Buy Rate */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 backdrop-blur-sm border border-border/30">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Buy Rate
              </p>
              <p className="text-2xl font-bold mt-1 tracking-tight">
                {rate.buyRate.toFixed(4)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">GEL</p>
            </div>
          </div>

          {/* Sell Rate */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-background/30 backdrop-blur-sm border border-border/30">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Sell Rate
              </p>
              <p className="text-2xl font-bold mt-1 tracking-tight">
                {rate.sellRate.toFixed(4)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">GEL</p>
            </div>
          </div>

          {/* Official Rate */}
          {rate.officialRate && (
            <div className="pt-3 border-t border-border/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Official Rate
                </span>
                <span className="text-lg font-semibold">
                  {rate.officialRate.toFixed(4)} <span className="text-xs text-muted-foreground">GEL</span>
                </span>
              </div>
            </div>
          )}

          {/* Spread */}
          <div className="pt-2 border-t border-border/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Spread</span>
              <span className="font-mono font-semibold">
                {(rate.sellRate - rate.buyRate).toFixed(4)} GEL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
