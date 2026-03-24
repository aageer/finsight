"use client";

import { getMarketIndices } from "@/services/market-data";
import { formatNumber, formatPercent, getChangeColor } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export function MarketTicker() {
  const indices = getMarketIndices();

  return (
    <div className="flex h-8 items-center gap-6 overflow-x-auto border-b border-border bg-[oklch(0.06_0_0)] px-4 font-mono-terminal text-xs scrollbar-none">
      {indices.map((idx) => (
        <div key={idx.symbol} className="flex shrink-0 items-center gap-2">
          <span className="font-semibold text-muted-foreground">{idx.name}</span>
          <span className="text-foreground">{formatNumber(idx.price)}</span>
          <span className={cn("font-medium", getChangeColor(idx.change))}>
            {formatPercent(idx.changePercent)}
          </span>
        </div>
      ))}
    </div>
  );
}
