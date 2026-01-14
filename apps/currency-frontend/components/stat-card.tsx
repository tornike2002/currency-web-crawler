"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: "blue" | "purple" | "green" | "orange";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  gradient = "blue",
}: StatCardProps) {
  const gradients = {
    blue: "from-blue-500/20 via-blue-600/10 to-transparent",
    purple: "from-purple-500/20 via-purple-600/10 to-transparent",
    green: "from-green-500/20 via-green-600/10 to-transparent",
    orange: "from-orange-500/20 via-orange-600/10 to-transparent",
  };

  const iconColors = {
    blue: "text-blue-400",
    purple: "text-purple-400",
    green: "text-green-400",
    orange: "text-orange-400",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm",
        "p-6 transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-black/20"
      )}
    >
      {/* Gradient Background */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          gradients[gradient]
        )}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              "rounded-lg bg-background/50 p-3 border border-border/50",
              iconColors[gradient]
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
            <span
              className={cn(
                "text-sm font-medium",
                trend.isPositive ? "text-green-400" : "text-red-400"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground">vs previous</span>
          </div>
        )}
      </div>
    </div>
  );
}
