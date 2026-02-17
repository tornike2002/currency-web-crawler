import { ExchangeRate, GroupedRates } from "./types";

export function toFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
}

export function formatRate(value: unknown, digits = 4): string {
  const n = toFiniteNumber(value);
  return n === null ? "—" : n.toFixed(digits);
}

/**
 * Group exchange rates by date
 */
export function groupRatesByDate(rates: ExchangeRate[]): GroupedRates[] {
  // Keep only the latest entry per bank (source) for each date.
  const byDateAndSource = rates.reduce((acc, rate) => {
    const date = new Date(rate.scrapedAt).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = {};
    }
    const existing = acc[date][rate.source];
    if (
      !existing ||
      new Date(rate.scrapedAt).getTime() > new Date(existing.scrapedAt).getTime()
    ) {
      acc[date][rate.source] = rate;
    }
    return acc;
  }, {} as Record<string, Record<string, ExchangeRate>>);

  return Object.entries(byDateAndSource)
    .map(([date, bySource]) => ({ date, rates: Object.values(bySource) }))
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
 * Determine direction of rate change (used for coloring/arrows)
 * Green = rate went up, Red = rate went down
 */
export function getRateChangeColor(
  currentRate: number | null,
  previousRate: number | null,
  isWithin7Days: boolean
): "green" | "red" | "default" {
  if (!isWithin7Days || previousRate === null || currentRate === null) {
    return "default";
  }

  if (currentRate === previousRate) {
    return "default";
  }

  // If current rate is higher than previous, show green (up)
  // If current rate is lower than previous, show red (down)
  return currentRate > previousRate ? "green" : "red";
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
