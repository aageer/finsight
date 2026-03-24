"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatCurrency, formatCompactNumber, formatPercent } from "@/lib/utils/format";
import { Eye, Plus, Bell, TrendingUp, TrendingDown, Activity } from "lucide-react";

const WATCHLIST = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 189.42,
    change: 1.28,
    changePct: 0.68,
    low52: 164.08,
    high52: 237.23,
    volume: 52_340_000,
    sector: "Technology",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 421.3,
    change: 3.52,
    changePct: 0.84,
    low52: 344.79,
    high52: 468.35,
    volume: 18_920_000,
    sector: "Technology",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 142.89,
    change: -2.14,
    changePct: -1.47,
    low52: 86.62,
    high52: 153.13,
    volume: 198_500_000,
    sector: "Technology",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 176.5,
    change: 0.95,
    changePct: 0.54,
    low52: 140.53,
    high52: 208.7,
    volume: 21_450_000,
    sector: "Communication",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 198.23,
    change: -1.07,
    changePct: -0.54,
    low52: 161.38,
    high52: 242.52,
    volume: 38_120_000,
    sector: "Consumer Cyclical",
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    price: 602.38,
    change: 8.76,
    changePct: 1.48,
    low52: 474.41,
    high52: 740.91,
    volume: 12_890_000,
    sector: "Communication",
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 248.5,
    change: -4.22,
    changePct: -1.67,
    low52: 182.07,
    high52: 488.54,
    volume: 95_600_000,
    sector: "Consumer Cyclical",
  },
] as const;

const ALERTS = [
  {
    id: "1",
    label: "AAPL — price above $200.00",
    type: "price",
    detail: "Limit · GTC",
  },
  {
    id: "2",
    label: "TSLA — price below $230.00",
    type: "price",
    detail: "Stop · GTC",
  },
  {
    id: "3",
    label: "NVDA — volume spike > 2.5× 20D avg",
    type: "volume",
    detail: "Unusual activity",
  },
] as const;

function changeColorClass(value: number) {
  if (value > 0) return "text-[var(--color-positive)]";
  if (value < 0) return "text-[var(--color-negative)]";
  return "text-muted-foreground";
}

export default function WatchlistPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-[var(--color-accent-orange)]" />
          <h1 className="font-mono-terminal text-sm font-semibold uppercase tracking-wider text-foreground">
            Watchlist
          </h1>
          <Badge variant="outline" className="font-mono-terminal text-[10px]">
            {WATCHLIST.length} symbols
          </Badge>
        </div>
        <Button size="sm" className="gap-1.5 bg-[var(--color-accent-orange)] text-black hover:bg-[var(--color-accent-orange)]/90">
          <Plus className="h-3.5 w-3.5" />
          Add Symbol
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border pb-2">
          <span className="font-mono-terminal text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Watched equities
          </span>
        </CardHeader>
        <CardContent className="px-0 pb-2 pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="h-8 pl-4 font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">
                  Symbol
                </TableHead>
                <TableHead className="h-8 font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">
                  Name
                </TableHead>
                <TableHead className="h-8 text-right font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">
                  Price
                </TableHead>
                <TableHead className="h-8 text-right font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">
                  Chg
                </TableHead>
                <TableHead className="h-8 text-right font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">
                  Chg%
                </TableHead>
                <TableHead className="h-8 text-right font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">
                  52w range
                </TableHead>
                <TableHead className="h-8 text-right font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">
                  Volume
                </TableHead>
                <TableHead className="h-8 pr-4 font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">
                  Sector
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {WATCHLIST.map((row) => {
                const pos = row.change > 0;
                const neg = row.change < 0;
                return (
                  <TableRow key={row.symbol} className="border-border">
                    <TableCell className="pl-4 font-mono-terminal text-xs font-semibold">{row.symbol}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">{row.name}</TableCell>
                    <TableCell className="text-right font-mono-terminal text-xs">{formatCurrency(row.price)}</TableCell>
                    <TableCell className="text-right">
                      <span className={cn("inline-flex items-center justify-end gap-0.5 font-mono-terminal text-xs", changeColorClass(row.change))}>
                        {pos && <TrendingUp className="h-3 w-3" />}
                        {neg && <TrendingDown className="h-3 w-3" />}
                        {row.change >= 0 ? "+" : ""}
                        {row.change.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className={cn("text-right font-mono-terminal text-xs", changeColorClass(row.changePct))}>
                      {formatPercent(row.changePct)}
                    </TableCell>
                    <TableCell className="text-right font-mono-terminal text-xs text-muted-foreground">
                      {formatCurrency(row.low52)} – {formatCurrency(row.high52)}
                    </TableCell>
                    <TableCell className="text-right font-mono-terminal text-xs">{formatCompactNumber(row.volume)}</TableCell>
                    <TableCell className="pr-4 text-xs text-muted-foreground">{row.sector}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex-row items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-[var(--color-accent-orange)]" />
            <span className="font-mono-terminal text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Alerts
            </span>
            <Badge variant="outline" className="font-mono-terminal text-[10px]">
              {ALERTS.length} active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-4">
          {ALERTS.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start justify-between gap-3 rounded-md border border-border bg-muted/15 px-3 py-2"
            >
              <div className="flex min-w-0 items-start gap-2">
                {alert.type === "volume" ? (
                  <Activity className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-accent-orange)]" />
                ) : (
                  <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-accent-orange)]" />
                )}
                <div className="min-w-0">
                  <p className="font-mono-terminal text-xs font-medium leading-tight">{alert.label}</p>
                  <p className="mt-0.5 font-mono-terminal text-[10px] text-muted-foreground">{alert.detail}</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 border-[var(--color-positive)]/40 bg-[var(--color-positive)]/10 font-mono-terminal text-[10px] text-[var(--color-positive)]"
              >
                ARMED
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
