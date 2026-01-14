"use client";

import { ExchangeRate } from "@/lib/types";
import { getRateChangeColor, isWithinLast7Days } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, DollarSign } from "lucide-react";

interface RateTableProps {
  rates: ExchangeRate[];
  previousRates: ExchangeRate[];
}

export function RateTable({ rates, previousRates }: RateTableProps) {
  const getPreviousRate = (currentRate: ExchangeRate): ExchangeRate | null => {
    return previousRates.find((r) => r.source === currentRate.source) || null;
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/50 bg-background/50">
            <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Bank
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Official Rate
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Buy Rate
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Sell Rate
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Spread
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Change
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Time
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {rates.map((rate, index) => {
            const previousRate = getPreviousRate(rate);
            const isRecent = isWithinLast7Days(rate.scrapedAt);
            const changeColor = getRateChangeColor(
              rate.buyRate,
              previousRate?.buyRate || null,
              isRecent
            );

            const changePercent = previousRate
              ? ((rate.buyRate - previousRate.buyRate) / previousRate.buyRate) * 100
              : null;

            const spread = rate.sellRate - rate.buyRate;

            return (
              <tr
                key={rate.id}
                className={cn(
                  "transition-colors hover:bg-background/30",
                  changeColor === "green" && isRecent && "bg-green-950/10",
                  changeColor === "red" && isRecent && "bg-red-950/10"
                )}
              >
                {/* Bank Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "p-1.5 rounded-lg bg-background/50 border border-border/50",
                        changeColor === "green" && isRecent && "bg-green-900/20 border-green-800/30",
                        changeColor === "red" && isRecent && "bg-red-900/20 border-red-800/30"
                      )}
                    >
                      <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{rate.source}</div>
                    </div>
                  </div>
                </td>

                {/* Official Rate */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {rate.officialRate ? (
                    <span className="font-semibold text-foreground">
                      {rate.officialRate.toFixed(4)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>

                {/* Buy Rate */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-bold text-lg text-foreground">
                      {rate.buyRate.toFixed(4)}
                    </span>
                    <span className="text-xs text-muted-foreground">GEL</span>
                  </div>
                </td>

                {/* Sell Rate */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-bold text-lg text-foreground">
                      {rate.sellRate.toFixed(4)}
                    </span>
                    <span className="text-xs text-muted-foreground">GEL</span>
                  </div>
                </td>

                {/* Spread */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="font-mono font-medium text-foreground">
                    {spread.toFixed(4)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">GEL</span>
                </td>

                {/* Change */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {changePercent !== null && isRecent ? (
                    <div
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                        changeColor === "green"
                          ? "bg-green-900/30 text-green-400 border border-green-800/50"
                          : changeColor === "red"
                          ? "bg-red-900/30 text-red-400 border border-red-800/50"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {changeColor === "green" ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : changeColor === "red" ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : null}
                      <span>
                        {changePercent > 0 ? "+" : ""}
                        {changePercent.toFixed(2)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>

                {/* Time */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-mono text-muted-foreground">
                    {new Date(rate.scrapedAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
