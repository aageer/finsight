"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Bot,
  BarChart3,
  TrendingUp,
  Newspaper,
  Users,
  Brain,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const RECENT = ["AAPL", "NVDA", "MSFT"] as const;

const AGENTS = [
  {
    id: "fundamental",
    name: "FundamentalAgent",
    Icon: BarChart3,
    description: "Financial statements, valuation ratios, and earnings quality.",
  },
  {
    id: "technical",
    name: "TechnicalAgent",
    Icon: TrendingUp,
    description: "Price action, indicators, and trend structure across timeframes.",
  },
  {
    id: "news",
    name: "NewsAgent",
    Icon: Newspaper,
    description: "Headlines, sentiment, and event-driven catalysts.",
  },
  {
    id: "peer",
    name: "PeerCompAgent",
    Icon: Users,
    description: "Sector peers, multiples, and relative performance.",
  },
  {
    id: "kg",
    name: "KnowledgeGraphAgent",
    Icon: Brain,
    description: "Entity links, supply chain, and thematic relationships.",
  },
  {
    id: "risk",
    name: "RiskAgent",
    Icon: Shield,
    description: "Drawdowns, volatility regimes, and scenario stress tests.",
  },
] as const;

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="space-y-4"><Skeleton className="h-14 w-full" /><Skeleton className="h-64 w-full" /></div>}>
      <AnalysisContent />
    </Suspense>
  );
}

function AnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const symbolFromUrl = searchParams.get("symbol")?.trim().toUpperCase() ?? null;
  const [query, setQuery] = useState(symbolFromUrl ?? "");
  const [prevUrlSymbol, setPrevUrlSymbol] = useState(symbolFromUrl);

  if (symbolFromUrl !== prevUrlSymbol) {
    setPrevUrlSymbol(symbolFromUrl);
    setQuery(symbolFromUrl ?? "");
  }

  const activeSymbol = useMemo(() => {
    if (!symbolFromUrl) return null;
    return symbolFromUrl;
  }, [symbolFromUrl]);

  const setSymbol = useCallback(
    (sym: string | null) => {
      if (!sym) {
        router.push("/analysis");
        setQuery("");
        return;
      }
      const upper = sym.trim().toUpperCase();
      setQuery(upper);
      router.push(`/analysis?symbol=${encodeURIComponent(upper)}`);
    },
    [router]
  );

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) setSymbol(trimmed);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={onSearchSubmit} className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-accent-orange)]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol to analyze... (e.g., AAPL, MSFT)"
            className={cn(
              "h-14 border-border bg-card pl-12 pr-4 font-mono-terminal text-base",
              "placeholder:font-sans placeholder:text-muted-foreground",
              "focus-visible:border-[var(--color-accent-orange)] focus-visible:ring-[var(--color-accent-orange)]/30"
            )}
            aria-label="Search ticker symbol"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">
            Recent Analyses
          </span>
          {RECENT.map((sym) => (
            <button key={sym} type="button" onClick={() => setSymbol(sym)} className="rounded-full p-0">
              <Badge
                variant="outline"
                className={cn(
                  "cursor-pointer font-mono-terminal text-xs transition-colors hover:border-[var(--color-accent-orange)]/50 hover:text-[var(--color-accent-orange)]",
                  activeSymbol === sym && "border-[var(--color-accent-orange)] text-[var(--color-accent-orange)]"
                )}
              >
                {sym}
              </Badge>
            </button>
          ))}
        </div>
      </form>

      {activeSymbol ? (
        <Card className="border-border bg-card">
          <CardContent className="space-y-3 py-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[var(--color-accent-orange)] font-mono-terminal text-black hover:bg-[var(--color-accent-orange)]">
                {activeSymbol}
              </Badge>
              <span className="font-mono-terminal text-xs text-muted-foreground">
                Multi-agent analysis pipeline queued
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Agent orchestration and detailed reports will appear here once wired to your backend.
            </p>
            <button
              type="button"
              onClick={() => setSymbol(null)}
              className="font-mono-terminal text-xs text-[var(--color-accent-orange)] hover:underline"
            >
              Clear selection
            </button>
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="rounded-xl border border-border bg-card/80 p-6 ring-1 ring-foreground/5">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-mono-terminal text-[10px] uppercase tracking-[0.2em] text-[var(--color-accent-orange)]">
                FinSight Analysis
              </p>
              <h1 className="mt-2 font-mono-terminal text-2xl font-semibold tracking-tight md:text-3xl">
                Six specialized agents. One coordinated thesis.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Our multi-agent system runs fundamental, technical, news, peer, knowledge-graph, and risk
                specialists in parallel, then synthesizes a single terminal-grade view—built for Bloomberg-style
                workflows with AI depth.
              </p>
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {AGENTS.map(({ id, name, Icon, description }) => (
              <Card key={id} className="border-border bg-card">
                <CardContent className="flex gap-3 pt-4">
                  <div className="flex shrink-0 flex-col items-center gap-1">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-accent-orange)]/25 bg-[var(--color-accent-orange)]/10">
                      <Bot className="h-4 w-4 text-[var(--color-accent-orange)]" />
                    </div>
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono-terminal text-xs font-semibold text-foreground">{name}</p>
                    <p className="mt-1 text-xs leading-snug text-muted-foreground">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
