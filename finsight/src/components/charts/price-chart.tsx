"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
} from "recharts";
import type { OHLCV, TimeRange } from "@/types";
import { cn } from "@/lib/utils";

const RANGE_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "6M", value: "6M" },
  { label: "1Y", value: "1Y" },
  { label: "5Y", value: "5Y" },
];

interface PriceChartProps {
  data: OHLCV[];
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  className?: string;
  height?: number;
}

export function PriceChart({ data, range, onRangeChange, className, height = 280 }: PriceChartProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      date: d.date,
      price: d.close,
      volume: d.volume,
      high: d.high,
      low: d.low,
    }));
  }, [data]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return 0;
    return chartData[chartData.length - 1].price - chartData[0].price;
  }, [chartData]);

  const color = trend >= 0 ? "var(--color-positive)" : "var(--color-negative)";
  const gradientId = trend >= 0 ? "positiveGradient" : "negativeGradient";

  const formatPrice = (v: number) => `$${v.toFixed(2)}`;
  const formatDate = (d: string) => {
    const date = new Date(d);
    if (["1M", "3M"].includes(range)) {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  };

  const formatVolume = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return String(v);
  };

  return (
    <div className={cn("", className)}>
      {/* Range selector */}
      <div className="mb-3 flex items-center gap-1">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onRangeChange(opt.value)}
            className={cn(
              "rounded px-2.5 py-1 font-mono-terminal text-[10px] font-semibold tracking-wider transition-all",
              range === opt.value
                ? "bg-[var(--color-accent-orange)] text-black"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Price chart */}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00D26A" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#00D26A" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF3B3B" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#FF3B3B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0 0)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }}
            axisLine={{ stroke: "oklch(0.2 0 0)" }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={60}
          />
          <YAxis
            tickFormatter={formatPrice}
            tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }}
            axisLine={false}
            tickLine={false}
            width={60}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.1 0 0)",
              border: "1px solid oklch(0.2 0 0)",
              borderRadius: "6px",
              fontSize: "11px",
              fontFamily: "var(--font-mono-terminal)",
            }}
            labelFormatter={(label) =>
              new Date(label as string).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            }
            formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3, fill: color, stroke: "oklch(0.1 0 0)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Volume bars */}
      <ResponsiveContainer width="100%" height={40}>
        <BarChart data={chartData} margin={{ top: 0, right: 4, left: 4, bottom: 0 }}>
          <XAxis dataKey="date" hide />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.1 0 0)",
              border: "1px solid oklch(0.2 0 0)",
              borderRadius: "6px",
              fontSize: "10px",
            }}
            formatter={(value) => [formatVolume(Number(value)), "Volume"]}
            labelFormatter={() => ""}
          />
          <Bar dataKey="volume" fill="oklch(0.3 0 0)" radius={[1, 1, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
