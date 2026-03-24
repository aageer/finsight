"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeader } from "@/components/shared/section-header";
import { PriceChange } from "@/components/shared/price-change";
import { Sparkline } from "@/components/shared/sparkline";
import { AgentStatusDot } from "@/components/shared/agent-status-dot";
import {
  getPortfolioSummary,
  getMarketMovers,
  getMarketNews,
  getWatchlistQuotes,
  getAgentStatuses,
} from "@/services/market-data";
import { formatCurrency, formatCompactNumber, formatPercent, getChangeColor } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  TrendingUp,
  Eye,
  Bot,
  Newspaper,
  Bell,
  FlaskConical,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const SPARKLINE_DATA_30D = [100, 102, 98, 105, 110, 108, 112, 115, 113, 118, 120, 117, 122, 125, 123, 128, 130, 127, 132, 135, 133, 138, 140, 137, 142, 145, 143, 148, 150, 147];

const ALLOCATION_DATA = [
  { name: "Technology", value: 62, color: "#ff6600" },
  { name: "Consumer Cyclical", value: 15, color: "#3b82f6" },
  { name: "Healthcare", value: 12, color: "#00d26a" },
  { name: "Financial", value: 8, color: "#a855f7" },
  { name: "Other", value: 3, color: "#6b7280" },
];

export default function DashboardPage() {
  const portfolio = getPortfolioSummary();
  const movers = getMarketMovers();
  const news = getMarketNews();
  const watchlist = getWatchlistQuotes().slice(0, 5);
  const agents = getAgentStatuses();

  return (
    <div className="space-y-4">
      {/* Row 1: Portfolio + Agent Status */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Portfolio Summary */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <SectionHeader
              title="Portfolio Summary"
              icon={Briefcase}
              action={
                <Link href="/portfolio" className="flex items-center gap-1 text-xs text-[var(--color-accent-orange)] hover:underline">
                  View Portfolio <ArrowRight className="h-3 w-3" />
                </Link>
              }
            />
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono-terminal text-3xl font-bold tracking-tight">
                  {formatCurrency(portfolio.totalValue)}
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <PriceChange change={portfolio.dayChange} changePercent={portfolio.dayChangePercent} showIcon size="sm" />
                  <span className="text-xs text-muted-foreground">today</span>
                </div>
                <div className="mt-2 flex items-center gap-2 font-mono-terminal text-xs">
                  <span className="text-muted-foreground">Total P&L:</span>
                  <span className={getChangeColor(portfolio.totalGain)}>
                    {formatCurrency(portfolio.totalGain)} ({formatPercent(portfolio.totalGainPercent)})
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Sparkline data={SPARKLINE_DATA_30D} width={120} height={40} />
                <span className="text-[10px] text-muted-foreground">30D</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div style={{ width: 96, height: 96 }}>
                <ResponsiveContainer width={96} height={96}>
                  <PieChart>
                    <Pie data={ALLOCATION_DATA} cx="50%" cy="50%" innerRadius={25} outerRadius={40} dataKey="value" strokeWidth={0}>
                      {ALLOCATION_DATA.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {ALLOCATION_DATA.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] text-muted-foreground">{item.name}</span>
                    <span className="font-mono-terminal text-[10px]">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Status Panel */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <SectionHeader
              title="Agent Status"
              icon={Bot}
              action={
                <Badge variant="outline" className="font-mono-terminal text-[10px]">
                  <div className="mr-1 h-1.5 w-1.5 rounded-full bg-[var(--color-positive)] animate-pulse" />
                  {agents.filter((a) => a.status === "RUNNING").length} Active
                </Badge>
              }
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <AgentStatusDot status={agent.status} />
                    <div>
                      <p className="font-mono-terminal text-xs font-medium">{agent.name}</p>
                      <p className="text-[10px] text-muted-foreground">{agent.description}</p>
                    </div>
                  </div>
                  <span className="font-mono-terminal text-[10px] uppercase text-muted-foreground">
                    {agent.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-md border border-dashed border-[var(--color-accent-orange)]/30 bg-[var(--color-accent-orange)]/5 p-2">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-3.5 w-3.5 text-[var(--color-accent-orange)]" />
                <span className="font-mono-terminal text-[10px] text-[var(--color-accent-orange)]">
                  ResearchAgent: Experiment #47 — Sharpe: 1.82
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Market Movers + Watchlist */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Market Movers */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <SectionHeader title="Market Movers" icon={TrendingUp} />
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="gainers" className="w-full">
              <TabsList className="h-7 w-full bg-muted/30">
                <TabsTrigger value="gainers" className="h-6 text-[10px]">Top Gainers</TabsTrigger>
                <TabsTrigger value="losers" className="h-6 text-[10px]">Top Losers</TabsTrigger>
                <TabsTrigger value="active" className="h-6 text-[10px]">Most Active</TabsTrigger>
              </TabsList>
              {(["gainers", "losers", "active"] as const).map((tab) => {
                const data = tab === "gainers" ? movers.gainers : tab === "losers" ? movers.losers : movers.mostActive;
                return (
                  <TabsContent key={tab} value={tab} className="mt-2">
                    <div className="space-y-1">
                      {data.map((m) => (
                        <Link
                          key={m.symbol}
                          href={`/analysis?symbol=${m.symbol}`}
                          className="flex items-center justify-between rounded px-2 py-1.5 transition-colors hover:bg-muted/30"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-14 font-mono-terminal text-xs font-semibold">{m.symbol}</span>
                            <span className="text-xs text-muted-foreground">{m.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-mono-terminal text-xs">{formatCurrency(m.price)}</span>
                            <span className={cn("w-16 text-right font-mono-terminal text-xs font-medium", getChangeColor(m.changePercent))}>
                              {formatPercent(m.changePercent)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* Watchlist Quick View */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <SectionHeader
              title="Watchlist"
              icon={Eye}
              action={
                <Link href="/watchlist" className="flex items-center gap-1 text-xs text-[var(--color-accent-orange)] hover:underline">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              }
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {watchlist.map((stock) => (
                <Link
                  key={stock.symbol}
                  href={`/analysis?symbol=${stock.symbol}`}
                  className="flex items-center justify-between rounded px-2 py-1.5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-14 font-mono-terminal text-xs font-semibold">{stock.symbol}</span>
                    <span className="text-xs text-muted-foreground">{stock.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono-terminal text-xs">{formatCurrency(stock.price)}</span>
                    <span className={cn("w-16 text-right font-mono-terminal text-xs font-medium", getChangeColor(stock.changePercent))}>
                      {formatPercent(stock.changePercent)}
                    </span>
                    <Sparkline
                      data={Array.from({ length: 7 }, (_, i) => stock.price * (1 + (Math.random() - 0.5) * 0.02 * i))}
                      width={50}
                      height={16}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: News + Active Research */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* News Feed */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <SectionHeader title="Live News Feed" icon={Newspaper} />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {news.map((article, i) => (
                <div key={i} className="flex items-start gap-3 rounded px-2 py-1.5 transition-colors hover:bg-muted/30">
                  <div className={cn(
                    "mt-1 h-2 w-2 shrink-0 rounded-full",
                    article.sentiment === "bullish" ? "bg-[var(--color-positive)]" :
                    article.sentiment === "bearish" ? "bg-[var(--color-negative)]" :
                    "bg-muted-foreground"
                  )} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium leading-tight">{article.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{article.source}</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">
                        {getTimeAgo(article.publishedAt)}
                      </span>
                      {article.relatedSymbols.map((sym) => (
                        <Badge key={sym} variant="outline" className="h-4 px-1 font-mono-terminal text-[9px]">
                          {sym}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Research */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <SectionHeader
              title="Active Research"
              icon={FlaskConical}
              action={
                <Link href="/autoresearch" className="flex items-center gap-1 text-xs text-[var(--color-accent-orange)] hover:underline">
                  Console <ArrowRight className="h-3 w-3" />
                </Link>
              }
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="rounded-md border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-terminal text-xs font-medium">Momentum + Mean-Reversion Hybrid</span>
                  <Badge variant="outline" className="bg-[var(--color-positive)]/10 text-[var(--color-positive)] text-[10px]">RUNNING</Badge>
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Experiment 47 of 100</span>
                    <span>47%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-[var(--color-accent-orange)]" style={{ width: "47%" }} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">Recent Experiments</p>
                {[
                  { num: 47, sharpe: 1.82, cagr: 17.3, mdd: -14.2, best: true },
                  { num: 46, sharpe: 1.45, cagr: 14.1, mdd: -18.7, best: false },
                  { num: 45, sharpe: 0.92, cagr: 11.8, mdd: -22.1, best: false },
                  { num: 44, sharpe: 1.67, cagr: 16.8, mdd: -15.4, best: false },
                ].map((exp) => (
                  <div key={exp.num} className={cn(
                    "flex items-center justify-between rounded px-2 py-1.5 font-mono-terminal text-[10px]",
                    exp.best ? "border border-[var(--color-accent-orange)]/30 bg-[var(--color-accent-orange)]/5" : "bg-muted/20"
                  )}>
                    <span className="text-muted-foreground">#{exp.num}</span>
                    <span>Sharpe: {exp.sharpe}</span>
                    <span>CAGR: {exp.cagr}%</span>
                    <span>MDD: {exp.mdd}%</span>
                    {exp.best && <Badge className="h-4 bg-[var(--color-accent-orange)] px-1 text-[9px] text-black">BEST</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Alerts */}
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[var(--color-accent-orange)]" />
              <span className="font-mono-terminal text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alerts</span>
            </div>
            <Badge variant="outline" className="font-mono-terminal text-[10px]">3 active</Badge>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-[var(--color-warning)]" />
              <span className="font-mono-terminal text-[10px] text-[var(--color-warning)]">1 triggered today</span>
            </div>
          </div>
          <Link href="/watchlist" className="flex items-center gap-1 text-xs text-[var(--color-accent-orange)] hover:underline">
            Manage Alerts <ArrowRight className="h-3 w-3" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
