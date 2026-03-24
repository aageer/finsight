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
import { formatCurrency, formatNumber, formatPercent, getChangeColor } from "@/lib/utils/format";
import { Briefcase, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";

const HOLDINGS = [
  { symbol: "AAPL", name: "Apple Inc.", shares: 50, avgCost: 165.2, price: 189.42 },
  { symbol: "MSFT", name: "Microsoft Corp.", shares: 30, avgCost: 350, price: 421.3 },
  { symbol: "NVDA", name: "NVIDIA Corp.", shares: 100, avgCost: 95.5, price: 142.89 },
  { symbol: "GOOGL", name: "Alphabet Inc. Cl A", shares: 40, avgCost: 142.8, price: 176.5 },
  { symbol: "AMZN", name: "Amazon.com Inc.", shares: 25, avgCost: 160, price: 198.23 },
] as const;

type HoldingRow = {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  price: number;
  marketValue: number;
  pl: number;
  plPct: number;
  weight: number;
};

function buildRows(): HoldingRow[] {
  const enriched = HOLDINGS.map((h) => {
    const marketValue = h.shares * h.price;
    const cost = h.shares * h.avgCost;
    const pl = marketValue - cost;
    const plPct = ((h.price - h.avgCost) / h.avgCost) * 100;
    return {
      symbol: h.symbol,
      name: h.name,
      shares: h.shares,
      avgCost: h.avgCost,
      price: h.price,
      marketValue,
      pl,
      plPct,
      weight: 0,
    };
  });
  const totalMv = enriched.reduce((s, r) => s + r.marketValue, 0);
  return enriched.map((r) => ({
    ...r,
    weight: totalMv > 0 ? (r.marketValue / totalMv) * 100 : 0,
  }));
}

export default function PortfolioPage() {
  const rows = buildRows();
  const portfolioGainPct = 15.16;
  const isPortfolioUp = portfolioGainPct >= 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-[var(--color-accent-orange)]" />
          <h1 className="font-mono-terminal text-sm font-semibold uppercase tracking-wider text-foreground">
            Portfolio
          </h1>
        </div>
        <Button size="sm" className="gap-1.5 bg-[var(--color-accent-orange)] text-black hover:bg-[var(--color-accent-orange)]/90">
          <Plus className="h-3.5 w-3.5" />
          Create Portfolio
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="flex-row items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono-terminal text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Default Portfolio
            </span>
            <Badge variant="outline" className="font-mono-terminal text-[10px]">
              PRIMARY
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total value</p>
              <p className="font-mono-terminal text-xl font-bold tracking-tight">$124,892.45</p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Cost basis</p>
              <p className="font-mono-terminal text-xl font-bold tracking-tight text-muted-foreground">
                $108,450.00
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total gain</p>
              <div className="flex items-center gap-1.5">
                {isPortfolioUp ? (
                  <ArrowUpRight className="h-4 w-4 text-[var(--color-positive)]" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-[var(--color-negative)]" />
                )}
                <span
                  className={cn(
                    "font-mono-terminal text-xl font-bold tracking-tight",
                    isPortfolioUp ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
                  )}
                >
                  $16,442.45
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total return</p>
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-mono-terminal text-xl font-bold tracking-tight",
                  getChangeColor(portfolioGainPct)
                )}
              >
                {isPortfolioUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {formatPercent(portfolioGainPct)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border pb-2">
          <span className="font-mono-terminal text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Holdings
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
                  Shares
                </TableHead>
                <TableHead className="h-8 text-right font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">
                  Avg cost
                </TableHead>
                <TableHead className="h-8 text-right font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">
                  Price
                </TableHead>
                <TableHead className="h-8 text-right font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">
                  Mkt value
                </TableHead>
                <TableHead className="h-8 text-right font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">
                  P&amp;L
                </TableHead>
                <TableHead className="h-8 text-right font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">
                  P&amp;L%
                </TableHead>
                <TableHead className="h-8 pr-4 text-right font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">
                  Wt%
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const up = row.pl >= 0;
                return (
                  <TableRow key={row.symbol} className="border-border">
                    <TableCell className="pl-4 font-mono-terminal text-xs font-semibold">{row.symbol}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{row.name}</TableCell>
                    <TableCell className="text-right font-mono-terminal text-xs">{formatNumber(row.shares, 0)}</TableCell>
                    <TableCell className="text-right font-mono-terminal text-xs">{formatCurrency(row.avgCost)}</TableCell>
                    <TableCell className="text-right font-mono-terminal text-xs">{formatCurrency(row.price)}</TableCell>
                    <TableCell className="text-right font-mono-terminal text-xs">{formatCurrency(row.marketValue)}</TableCell>
                    <TableCell className="text-right">
                      <span className={cn("inline-flex items-center justify-end gap-0.5 font-mono-terminal text-xs", getChangeColor(row.pl))}>
                        {up ? <ArrowUpRight className="h-3 w-3 shrink-0" /> : <ArrowDownRight className="h-3 w-3 shrink-0" />}
                        {formatCurrency(row.pl)}
                      </span>
                    </TableCell>
                    <TableCell className={cn("text-right font-mono-terminal text-xs", getChangeColor(row.plPct))}>
                      {formatPercent(row.plPct)}
                    </TableCell>
                    <TableCell className="pr-4 text-right font-mono-terminal text-xs">{formatNumber(row.weight, 2)}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
