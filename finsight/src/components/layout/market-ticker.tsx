"use client";

import { useMemo } from "react";
import { formatNumber, formatPercent, getChangeColor } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/stores/agent-store";
import { useTradingStore } from "@/stores/trading-store";
import { useBatchQuotes } from "@/lib/hooks/use-market-data";

const TICKER_SYMBOLS = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA"];

export function MarketTicker() {
  const { data: quotesMap } = useBatchQuotes(TICKER_SYMBOLS);
  const regime = useAgentStore((s) => s.currentRegime);
  const tradingMode = useTradingStore((s) => s.config.mode);

  const quotes = useMemo(() => {
    if (!quotesMap) return [];
    return TICKER_SYMBOLS
      .map((sym) => quotesMap[sym])
      .filter(Boolean);
  }, [quotesMap]);

  if (quotes.length === 0) {
    return (
      <div className="flex h-5 items-center gap-6 overflow-x-auto border-b border-border bg-[#050505] px-3 font-mono-terminal text-[9px] scrollbar-none">
        <span className="text-[oklch(0.4_0_0)] animate-pulse">Loading market data...</span>
      </div>
    );
  }

  return (
    <div className="flex h-5 items-center gap-3 overflow-x-auto border-b border-border bg-[#050505] px-3 font-mono-terminal text-[9px] scrollbar-none">
      {/* Regime */}
      <div className={cn(
        "flex shrink-0 items-center gap-1 font-bold uppercase tracking-wider",
        regime === "RISK_ON" && "text-[var(--color-positive)]",
        regime === "RISK_OFF" && "text-[var(--color-negative)]",
        regime === "TRANSITIONAL" && "text-[var(--color-accent-orange)]"
      )}>
        <div className={cn(
          "h-1 w-1 rounded-full",
          regime === "RISK_ON" && "bg-[var(--color-positive)] animate-pulse",
          regime === "RISK_OFF" && "bg-[var(--color-negative)] animate-pulse",
          regime === "TRANSITIONAL" && "bg-[var(--color-accent-orange)]"
        )} />
        {regime.replace("_", " ")}
      </div>

      <div className="h-3 w-px bg-border shrink-0" />

      {/* Trading Mode */}
      <div className={cn(
        "flex shrink-0 items-center gap-1 font-semibold uppercase tracking-wider",
        tradingMode === "PAPER" && "text-[var(--color-accent-orange)]",
        tradingMode === "LIVE" && "text-[var(--color-positive)]",
        tradingMode === "HALTED" && "text-[var(--color-negative)]"
      )}>
        <div className={cn(
          "h-1 w-1 rounded-full",
          tradingMode === "PAPER" && "bg-[var(--color-accent-orange)]",
          tradingMode === "LIVE" && "bg-[var(--color-positive)] animate-pulse",
          tradingMode === "HALTED" && "bg-[var(--color-negative)]"
        )} />
        {tradingMode}
      </div>

      <div className="h-3 w-px bg-border shrink-0" />

      {/* Stock Tickers — Bloomberg dense style */}
      {quotes.map((q) => (
        <div key={q.symbol} className="flex shrink-0 items-center gap-1.5">
          <span className="font-semibold text-[oklch(0.55_0_0)]">{q.symbol}</span>
          <span className={cn("font-medium", getChangeColor(q.change))}>
            {q.changePercent >= 0 ? "+" : ""}{formatPercent(q.changePercent)}
          </span>
        </div>
      ))}
    </div>
  );
}
