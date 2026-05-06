"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Activity,
  Newspaper,
  Bot,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Globe,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/shared/sparkline";
import { AgentStatusDot } from "@/components/shared/agent-status-dot";
import { useBatchQuotes, useNews } from "@/lib/hooks/use-market-data";
import {
  getMarketMovers,
  getPortfolioHoldings,
  getAgentStatuses,
} from "@/services/market-data";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatCompactNumber,
  getChangeColor,
} from "@/lib/utils/format";

const LIVE_SYMBOLS = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA"];

function genSparkline(trend: number, len = 20): number[] {
  const data: number[] = [100];
  for (let i = 1; i < len; i++) {
    data.push(data[i - 1] + (Math.random() - 0.5 + trend * 0.02) * 3);
  }
  return data;
}

function useStableSparklines(symbols: string[], trends: Record<string, number>) {
  const cacheRef = useRef<Record<string, number[]>>({});
  return useMemo(() => {
    const result: Record<string, number[]> = { ...cacheRef.current };
    for (const sym of symbols) {
      if (!result[sym]) {
        result[sym] = genSparkline(trends[sym] || 0);
      }
    }
    cacheRef.current = result;
    return result;
  }, [symbols.join(","), JSON.stringify(trends)]);
}

export default function DashboardPage() {
  const { data: liveQuotes = {}, isLoading: quotesLoading } = useBatchQuotes(LIVE_SYMBOLS);
  const { data: liveNews } = useNews();
  const mockHoldings = getPortfolioHoldings();
  const { gainers: mockGainers, losers: mockLosers, mostActive: mockActive } = getMarketMovers();
  const agents = getAgentStatuses();
  const [moverTab, setMoverTab] = useState<"gainers" | "losers" | "active">("gainers");

  const holdings = useMemo(() => {
    return mockHoldings.map((h) => {
      const live = liveQuotes[h.symbol];
      if (live) {
        return {
          ...h,
          currentPrice: live.price,
          dayChange: live.change,
          dayChangePercent: live.changePercent,
          marketValue: h.quantity * live.price,
          gainLoss: (live.price - h.avgCostBasis) * h.quantity,
          gainLossPercent: ((live.price - h.avgCostBasis) / h.avgCostBasis) * 100,
        };
      }
      return h;
    });
  }, [mockHoldings, liveQuotes]);

  const portfolio = useMemo(() => {
    const totalValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.quantity, 0);
    const totalCostBasis = holdings.reduce((sum, h) => sum + h.avgCostBasis * h.quantity, 0);
    const dayChange = holdings.reduce((sum, h) => sum + h.dayChange * h.quantity, 0);
    const totalGain = totalValue - totalCostBasis;
    return {
      totalValue,
      totalCostBasis,
      dayChange,
      dayChangePercent: totalCostBasis > 0 ? (dayChange / totalValue) * 100 : 0,
      totalGain,
      totalGainPercent: totalCostBasis > 0 ? (totalGain / totalCostBasis) * 100 : 0,
    };
  }, [holdings]);

  const moverData = useMemo(() => {
    const raw = moverTab === "gainers" ? mockGainers : moverTab === "losers" ? mockLosers : mockActive;
    return raw.map((m) => {
      const live = liveQuotes[m.symbol];
      if (live) {
        return { ...m, price: live.price, change: live.change, changePercent: live.changePercent };
      }
      return m;
    });
  }, [moverTab, mockGainers, mockLosers, mockActive, liveQuotes]);

  const indexCards = useMemo(() => {
    return LIVE_SYMBOLS.map((sym) => {
      const q = liveQuotes[sym];
      const names: Record<string, string> = { AAPL: "Apple", MSFT: "Microsoft", NVDA: "NVIDIA", GOOGL: "Alphabet", AMZN: "Amazon", META: "Meta", TSLA: "Tesla" };
      return {
        symbol: sym,
        name: names[sym] || sym,
        price: q?.price || 0,
        change: q?.change || 0,
        changePercent: q?.changePercent || 0,
        live: !!q,
      };
    }).filter((c) => c.price > 0);
  }, [liveQuotes]);

  const allSparklineSymbols = useMemo(() => {
    const syms = indexCards.map((c) => c.symbol);
    moverData.forEach((m) => { if (!syms.includes(m.symbol)) syms.push(m.symbol); });
    return syms;
  }, [indexCards, moverData]);

  const sparklineTrends = useMemo(() => {
    const trends: Record<string, number> = {};
    indexCards.forEach((c) => { trends[c.symbol] = c.change; });
    moverData.forEach((m) => { trends[m.symbol] = m.change; });
    return trends;
  }, [indexCards, moverData]);

  const sparklines = useStableSparklines(allSparklineSymbols, sparklineTrends);
  const news = liveNews || [];

  return (
    <div className="space-y-1">
      {/* Header Bar */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-3.5 w-3.5 text-[var(--color-accent-orange)]" />
          <h1 className="font-mono-terminal text-xs font-bold tracking-tight uppercase">
            Dashboard
          </h1>
          <span className="font-mono-terminal text-[9px] text-[oklch(0.4_0_0)]">
            Real-time market overview
          </span>
        </div>
        <div className="flex items-center gap-2">
          {quotesLoading && (
            <div className="flex items-center gap-1">
              <Loader2 className="h-2.5 w-2.5 animate-spin text-[var(--color-accent-orange)]" />
              <span className="font-mono-terminal text-[8px] text-[oklch(0.4_0_0)]">LOADING</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5 text-[oklch(0.35_0_0)]" />
            <span className="font-mono-terminal text-[9px] text-[oklch(0.4_0_0)]">
              {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} ET
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className={cn(
              "h-1.5 w-1.5 rounded-full",
              Object.keys(liveQuotes).length > 0 ? "bg-[var(--color-positive)] animate-pulse" : "bg-[oklch(0.3_0_0)]"
            )} />
            <span className="font-mono-terminal text-[8px] font-bold text-[oklch(0.4_0_0)]">
              {Object.keys(liveQuotes).length > 0 ? "LIVE" : "OFFLINE"}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Row 1: Portfolio + Stock Ticker Grid ─── */}
      <div className="grid grid-cols-12 gap-1">
        {/* Portfolio Panel */}
        <div className="terminal-panel col-span-12 lg:col-span-3">
          <div className="terminal-header-accent flex items-center gap-1.5">
            <Shield className="h-3 w-3" />
            PORTFOLIO VALUE
          </div>
          <div className="p-2">
            <div className="flex items-baseline gap-2">
              <span className="data-value text-base">
                {portfolio.totalValue > 0 ? formatCurrency(portfolio.totalValue) : "—"}
              </span>
              {portfolio.totalValue > 0 && (
                <span className={cn("data-dense", getChangeColor(portfolio.dayChange))}>
                  {portfolio.dayChange >= 0 ? "↑" : "↓"} {formatCurrency(Math.abs(portfolio.dayChange))} ({formatPercent(portfolio.dayChangePercent)})
                </span>
              )}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1">
              <div className="rounded-sm bg-[#111] p-1.5">
                <p className="data-label">Total P&L</p>
                <p className={cn("data-value text-[11px]", getChangeColor(portfolio.totalGain))}>
                  {portfolio.totalValue > 0 ? formatCurrency(portfolio.totalGain) : "—"}
                </p>
              </div>
              <div className="rounded-sm bg-[#111] p-1.5">
                <p className="data-label">Cost Basis</p>
                <p className="data-value text-[11px]">{formatCurrency(portfolio.totalCostBasis)}</p>
              </div>
            </div>
            <Link href="/portfolio">
              <button className="mt-2 w-full rounded-sm border border-border bg-[#111] py-1 font-mono-terminal text-[9px] text-[oklch(0.5_0_0)] hover:bg-[#1a1a1a] hover:text-foreground transition-colors">
                View Portfolio →
              </button>
            </Link>
          </div>
        </div>

        {/* Stock Ticker Cards — Dense horizontal strips */}
        <div className="col-span-12 lg:col-span-9 grid grid-cols-3 md:grid-cols-6 gap-1">
          {indexCards.length > 0 ? (
            indexCards.map((stock) => (
              <Link key={stock.symbol} href={`/analysis?symbol=${stock.symbol}`}>
                <div className="terminal-panel hover:border-[var(--color-accent-orange)]/30 transition-colors h-full">
                  <div className="p-1.5">
                    <div className="flex items-center justify-between">
                      <span className="data-label text-[8px]">{stock.name}</span>
                      {stock.live && <div className="h-1 w-1 rounded-full bg-[var(--color-positive)]" />}
                    </div>
                    <p className="data-value text-sm mt-0.5">{formatCurrency(stock.price)}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className={cn("data-dense text-[10px]", getChangeColor(stock.change))}>
                        {stock.change >= 0 ? "+" : ""}{formatPercent(stock.changePercent)}
                      </span>
                      <Sparkline data={sparklines[stock.symbol] || []} width={36} height={12} />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="terminal-panel animate-pulse">
                <div className="p-1.5">
                  <div className="h-2 bg-[#111] rounded-sm w-10 mb-1" />
                  <div className="h-4 bg-[#111] rounded-sm w-16 mb-0.5" />
                  <div className="h-2 bg-[#111] rounded-sm w-12" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── Row 2: Holdings + Movers + Agents ─── */}
      <div className="grid grid-cols-12 gap-1">
        {/* Top Holdings */}
        <div className="terminal-panel col-span-12 lg:col-span-4">
          <div className="terminal-header flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-3 w-3" />
              TOP HOLDINGS
            </div>
            <Link href="/portfolio" className="text-[8px] text-[var(--color-accent-orange)] hover:underline normal-case tracking-normal font-normal">
              View All
            </Link>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {holdings.slice(0, 5).map((h) => (
              <Link
                key={h.id}
                href={`/analysis?symbol=${h.symbol}`}
                className="flex items-center justify-between px-2 py-1.5 hover:bg-[#111] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-5 w-5 items-center justify-center rounded-sm text-[8px] font-bold"
                    style={{
                      backgroundColor: `oklch(0.12 0.04 ${h.symbol.charCodeAt(0) * 5})`,
                      color: `oklch(0.65 0.08 ${h.symbol.charCodeAt(0) * 5})`,
                    }}
                  >
                    {h.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="data-dense font-semibold">{h.symbol}</span>
                      {liveQuotes[h.symbol] && <div className="h-1 w-1 rounded-full bg-[var(--color-positive)]" />}
                    </div>
                    <span className="text-[9px] text-[oklch(0.4_0_0)]">{h.quantity} shares</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="data-dense font-semibold">{formatCurrency(h.currentPrice)}</p>
                  <p className={cn("text-[9px]", getChangeColor(h.dayChange))}>
                    {h.dayChange >= 0 ? "+" : ""}{formatCurrency(h.dayChange)} ({formatPercent(h.dayChangePercent)})
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Market Movers */}
        <div className="terminal-panel col-span-12 lg:col-span-4">
          <div className="terminal-header flex items-center gap-1.5">
            <Activity className="h-3 w-3" />
            MARKET MOVERS
          </div>
          {/* Tabs */}
          <div className="flex border-b border-[#1a1a1a] px-2">
            {([
              { key: "gainers", label: "Gainers", icon: TrendingUp, color: "text-[var(--color-positive)]" },
              { key: "losers", label: "Losers", icon: TrendingDown, color: "text-[var(--color-negative)]" },
              { key: "active", label: "Active", icon: Zap, color: "text-[var(--color-accent-orange)]" },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setMoverTab(tab.key)}
                className={cn(
                  "flex items-center gap-1 border-b px-2 py-1 font-mono-terminal text-[8px] font-semibold uppercase tracking-wider transition-colors",
                  moverTab === tab.key
                    ? `border-current ${tab.color}`
                    : "border-transparent text-[oklch(0.4_0_0)] hover:text-foreground"
                )}
              >
                <tab.icon className="h-2.5 w-2.5" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {moverData.map((m) => (
              <Link
                key={m.symbol}
                href={`/analysis?symbol=${m.symbol}`}
                className="flex items-center justify-between px-2 py-1.5 hover:bg-[#111] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1">
                    <span className="data-dense font-semibold">{m.symbol}</span>
                    {liveQuotes[m.symbol] && <div className="h-1 w-1 rounded-full bg-[var(--color-positive)]" />}
                  </div>
                  <span className="text-[9px] text-[oklch(0.4_0_0)] truncate max-w-[100px] block">{m.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkline data={sparklines[m.symbol] || []} width={32} height={12} />
                  <div className="text-right">
                    <p className="data-dense">{formatCurrency(m.price)}</p>
                    <p className={cn("text-[9px]", getChangeColor(m.change))}>
                      {m.changePercent >= 0 ? "+" : ""}{formatPercent(m.changePercent)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Agent Status */}
        <div className="terminal-panel col-span-12 lg:col-span-4">
          <div className="terminal-header flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Bot className="h-3 w-3" />
              AI AGENT SWARM
            </div>
            <Badge variant="outline" className="gap-0.5 text-[7px] h-4 px-1 border-[#1a1a1a]">
              <Sparkles className="h-2 w-2 text-[var(--color-accent-orange)]" />
              Gemini 2.5
            </Badge>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <AgentStatusDot status={agent.status} />
                  <div>
                    <p className="data-dense font-semibold">{agent.name}</p>
                    <p className="text-[8px] text-[oklch(0.4_0_0)]">{agent.description}</p>
                  </div>
                </div>
                <Badge
                  variant={agent.status === "RUNNING" ? "default" : "secondary"}
                  className={cn(
                    "text-[7px] h-4 px-1",
                    agent.status === "RUNNING" && "bg-[var(--color-positive)]/10 text-[var(--color-positive)]"
                  )}
                >
                  {agent.status}
                </Badge>
              </div>
            ))}
          </div>
          <div className="border-t border-[#1a1a1a] p-2">
            <Link href="/analysis">
              <Button className="w-full gap-1.5 h-7 bg-[var(--color-accent-orange)] text-black hover:bg-[var(--color-accent-orange)]/90 font-mono-terminal text-[10px] font-semibold">
                <Sparkles className="h-3 w-3" />
                Run AI Stock Analysis
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Row 3: News Feed ─── */}
      <div className="terminal-panel">
        <div className="terminal-header flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Newspaper className="h-3 w-3" />
            MARKET NEWS & SENTIMENT
          </div>
          <Link href="/analysis" className="text-[8px] text-[var(--color-accent-orange)] hover:underline normal-case tracking-normal font-normal">
            AI Analysis →
          </Link>
        </div>
        <div className="divide-y divide-[#1a1a1a]">
          {(news.length > 0 ? news : [
            { title: "Loading news...", summary: "Fetching latest market news", source: "", publishedAt: new Date().toISOString(), sentiment: "neutral" as const, relatedSymbols: [] },
          ]).slice(0, 5).map((article, i) => (
            <div key={i} className="flex items-start gap-3 px-2 py-1.5 hover:bg-[#0d0d0d] transition-colors">
              <Badge
                variant="outline"
                className={cn(
                  "text-[7px] uppercase shrink-0 h-4 px-1 mt-0.5",
                  article.sentiment === "bullish" && "border-[var(--color-positive)]/40 text-[var(--color-positive)]",
                  article.sentiment === "bearish" && "border-[var(--color-negative)]/40 text-[var(--color-negative)]",
                  article.sentiment === "neutral" && "border-[oklch(0.3_0_0)] text-[oklch(0.45_0_0)]"
                )}
              >
                {article.sentiment}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="data-dense font-medium leading-tight">{article.title}</p>
                <p className="mt-0.5 text-[9px] text-[oklch(0.4_0_0)] line-clamp-1">{article.summary}</p>
                <div className="mt-1 flex items-center gap-2">
                  {article.source && <span className="text-[8px] text-[oklch(0.35_0_0)]">{article.source}</span>}
                  <div className="flex gap-0.5">
                    {article.relatedSymbols.slice(0, 3).map((sym) => (
                      <Link key={sym} href={`/analysis?symbol=${sym}`}>
                        <Badge variant="secondary" className="text-[7px] cursor-pointer hover:bg-[var(--color-accent-orange)]/20 h-3.5 px-1">
                          {sym}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
