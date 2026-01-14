import { ExchangeRate } from "@/lib/types";
import { getRateChangeColor, isWithinLast7Days } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface RateCardProps {
  rate: ExchangeRate;
  previousRate: ExchangeRate | null;
}

export function RateCard({ rate, previousRate }: RateCardProps) {
  const isRecent = isWithinLast7Days(rate.scrapedAt);
  const changeColor = getRateChangeColor(
    rate.buyRate,
    previousRate?.buyRate || null,
    isRecent
  );

  const bgColor =
    changeColor === "green"
      ? "bg-green-950/30 border-green-800/50"
      : changeColor === "red"
      ? "bg-red-950/30 border-red-800/50"
      : "bg-card border-border";

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-colors",
        isRecent && bgColor
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{rate.source}</h3>
          <p className="text-sm text-muted-foreground">
            {new Date(rate.scrapedAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        {isRecent && changeColor !== "default" && (
          <div
            className={cn(
              "p-2 rounded-full",
              changeColor === "green"
                ? "bg-green-900/50 text-green-400"
                : "bg-red-900/50 text-red-400"
            )}
          >
            {changeColor === "green" ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Buy Rate</span>
          <span className="font-semibold">{rate.buyRate.toFixed(4)} GEL</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Sell Rate</span>
          <span className="font-semibold">{rate.sellRate.toFixed(4)} GEL</span>
        </div>
        {rate.officialRate && (
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Official Rate</span>
            <span className="font-medium">{rate.officialRate.toFixed(4)} GEL</span>
          </div>
        )}
      </div>
    </div>
  );
}
