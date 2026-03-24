"use client";

import { cn } from "@/lib/utils";
import { formatChange, formatPercent, getChangeColor } from "@/lib/utils/format";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PriceChangeProps {
  change: number;
  changePercent: number;
  showIcon?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PriceChange({ change, changePercent, showIcon = false, className, size = "md" }: PriceChangeProps) {
  const color = getChangeColor(change);
  const Icon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  return (
    <span className={cn("inline-flex items-center gap-1 font-mono-terminal", color, textSize, className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      <span>{formatChange(change)}</span>
      <span className="text-muted-foreground">(</span>
      <span>{formatPercent(changePercent)}</span>
      <span className="text-muted-foreground">)</span>
    </span>
  );
}
