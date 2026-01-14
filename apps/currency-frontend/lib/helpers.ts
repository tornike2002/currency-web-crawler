import { ExchangeRate, GroupedRates } from "./types";

/**
 * Group exchange rates by date
 */
export function groupRatesByDate(rates: ExchangeRate[]): GroupedRates[] {
  const grouped = rates.reduce((acc, rate) => {
    const date = new Date(rate.scrapedAt).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(rate);
    return acc;
  }, {} as Record<string, ExchangeRate[]>);

  return Object.entries(grouped)
    .map(([date, rates]) => ({ date, rates }))
    .sort((a, b) => b.date.localeCompare(a.date)); // Sort by date descending
}

/**
 * Check if a date is within the last 7 days
 */
export function isWithinLast7Days(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
}

/**
 * Determine if rate change is good (green) or bad (red)
 * Good = rate went down (better for buying USD)
 * Bad = rate went up (worse for buying USD)
 */
export function getRateChangeColor(
  currentRate: number,
  previousRate: number | null,
  isWithin7Days: boolean
): "green" | "red" | "default" {
  if (!isWithin7Days || previousRate === null) {
    return "default";
  }

  // If current rate is lower than previous, it's good (green)
  // If current rate is higher than previous, it's bad (red)
  return currentRate < previousRate ? "green" : "red";
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format date for grouping (YYYY-MM-DD)
 */
export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
