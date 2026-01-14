"use client";

import { useEffect, useState, useMemo } from "react";
import { getExchangeRates } from "@/app/actions/exchange-rates";
import { groupRatesByDate } from "@/lib/helpers";
import { RateGroupTable } from "./rate-group-table";
import { StatCard } from "./stat-card";
import { GroupedRates } from "@/lib/types";
import {
  Loader2,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExchangeRatesClientProps {
  initialGroups: GroupedRates[];
  initialError: string | null;
}

export function ExchangeRatesClient({
  initialGroups,
  initialError,
}: ExchangeRatesClientProps) {
  const [groups, setGroups] = useState<GroupedRates[]>(initialGroups);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [refreshing, setRefreshing] = useState(false);

  const loadRates = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await getExchangeRates();
      const grouped = groupRatesByDate(response.data);
      setGroups(grouped);
    } catch (err) {
      setError("Failed to load exchange rates. Make sure Strapi is running.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (groups.length === 0) return null;

    const latestGroup = groups[0];
    const previousGroup = groups[1] || null;

    if (latestGroup.rates.length === 0) return null;

    // Average buy rate
    const avgBuyRate =
      latestGroup.rates.reduce((sum, r) => sum + r.buyRate, 0) /
      latestGroup.rates.length;

    // Average sell rate
    const avgSellRate =
      latestGroup.rates.reduce((sum, r) => sum + r.sellRate, 0) /
      latestGroup.rates.length;

    // Best buy rate (lowest)
    const bestBuy = Math.min(...latestGroup.rates.map((r) => r.buyRate));
    const bestBuyBank = latestGroup.rates.find((r) => r.buyRate === bestBuy);

    // Best sell rate (highest)
    const bestSell = Math.max(...latestGroup.rates.map((r) => r.sellRate));
    const bestSellBank = latestGroup.rates.find((r) => r.sellRate === bestSell);

    // Trend calculation
    let buyTrend = null;
    if (previousGroup && previousGroup.rates.length > 0) {
      const prevAvgBuy =
        previousGroup.rates.reduce((sum, r) => sum + r.buyRate, 0) /
        previousGroup.rates.length;
      const change = ((avgBuyRate - prevAvgBuy) / prevAvgBuy) * 100;
      buyTrend = {
        value: Math.abs(change),
        isPositive: change < 0, // Lower is better for buyers
      };
    }

    return {
      avgBuyRate,
      avgSellRate,
      bestBuy,
      bestBuyBank: bestBuyBank?.source || "",
      bestSell,
      bestSellBank: bestSellBank?.source || "",
      buyTrend,
      totalRecords: groups.reduce((sum, g) => sum + g.rates.length, 0),
      dateRange: groups.length,
    };
  }, [groups]);

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient Background Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-950/5 via-transparent to-purple-950/5 pointer-events-none" />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Currency Exchange Rates
              </h1>
              <p className="text-muted-foreground text-lg">
                Real-time USD/GEL rates from Georgian banks
              </p>
            </div>
            <button
              onClick={() => loadRates(true)}
              disabled={refreshing || loading}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl",
                "bg-card/50 backdrop-blur-sm border border-border/50",
                "hover:bg-card hover:border-border",
                "transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                "font-medium shadow-lg shadow-black/10"
              )}
            >
              {refreshing || loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Refresh</span>
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/30 border border-border/50">
              <div className="w-3 h-3 rounded-full bg-green-900/50 border border-green-800/50"></div>
              <span className="text-muted-foreground">Improved (Last 7 days)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/30 border border-border/50">
              <div className="w-3 h-3 rounded-full bg-red-900/50 border border-red-800/50"></div>
              <span className="text-muted-foreground">Worsened (Last 7 days)</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Average Buy Rate"
              value={stats.avgBuyRate.toFixed(4)}
              subtitle="GEL per USD"
              icon={TrendingDown}
              gradient="blue"
              trend={stats.buyTrend}
            />
            <StatCard
              title="Average Sell Rate"
              value={stats.avgSellRate.toFixed(4)}
              subtitle="GEL per USD"
              icon={TrendingUp}
              gradient="purple"
            />
            <StatCard
              title="Best Buy Rate"
              value={stats.bestBuy.toFixed(4)}
              subtitle={stats.bestBuyBank}
              icon={DollarSign}
              gradient="green"
            />
            <StatCard
              title="Total Records"
              value={stats.totalRecords}
              subtitle={`${stats.dateRange} day${stats.dateRange !== 1 ? "s" : ""} of data`}
              icon={Activity}
              gradient="orange"
            />
          </div>
        )}

        {/* Loading State */}
        {loading && groups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">Loading exchange rates...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-4 rounded-full bg-red-950/20 border border-red-800/50 mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 text-lg mb-4 font-medium">{error}</p>
            <button
              onClick={() => loadRates()}
              className="px-6 py-3 rounded-xl bg-card border border-border hover:bg-muted transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Rates Groups */}
        {!loading && !error && groups.length > 0 && (
          <div className="space-y-6">
            {groups.map((group, index) => (
              <RateGroupTable
                key={group.date}
                group={group}
                previousGroup={index < groups.length - 1 ? groups[index + 1] : null}
                isLatest={index === 0}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && groups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <DollarSign className="w-12 h-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg mb-2">No exchange rates found.</p>
            <p className="text-sm text-muted-foreground">
              Run the crawler to collect data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
