"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  FlaskConical,
  Play,
  Sparkles,
  Square,
  XCircle,
} from "lucide-react";

const EXPERIMENTS = [
  { num: 47, sharpe: 1.82, cagr: 17.3, mdd: -14.2, fail: false, best: true },
  { num: 46, sharpe: 1.45, cagr: 14.1, mdd: -18.7, fail: false, best: false },
  { num: 45, sharpe: 0.92, cagr: 11.8, mdd: -22.1, fail: true, best: false },
  { num: 44, sharpe: 1.67, cagr: 16.8, mdd: -15.4, fail: false, best: false },
  { num: 43, sharpe: 1.23, cagr: 12.9, mdd: -19.5, fail: false, best: false },
  { num: 42, sharpe: 0.78, cagr: 9.2, mdd: -25.3, fail: true, best: false },
  { num: 41, sharpe: 1.55, cagr: 15.8, mdd: -16.1, fail: false, best: false },
  { num: 40, sharpe: 1.12, cagr: 13.5, mdd: -17.8, fail: false, best: false },
] as const;

export default function AutoresearchPage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-[var(--color-accent-orange)]" />
          <h1 className="font-mono-terminal text-lg font-semibold tracking-tight text-foreground">
            Autoresearch Console
          </h1>
        </div>
        <Button size="sm" className="font-mono-terminal text-xs">
          New Program
          <ArrowRight className="size-3.5" />
        </Button>
      </div>

      <Card className="border-border bg-card ring-1 ring-foreground/5">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b border-border/80 pb-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Active Program
            </p>
            <p className="mt-1 font-mono-terminal text-sm font-semibold text-foreground">
              Momentum + Mean-Reversion Hybrid
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-[var(--color-positive)]/40 bg-[var(--color-positive)]/15 font-mono-terminal text-[10px] text-[var(--color-positive)]"
            >
              RUNNING
            </Badge>
            <div className="flex items-center gap-1">
              <Button size="icon-xs" variant="outline" className="border-border" aria-label="Pause">
                <Square className="size-3" />
              </Button>
              <Button size="icon-xs" variant="outline" className="border-border" aria-label="Resume">
                <Play className="size-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between font-mono-terminal text-[10px] text-muted-foreground">
              <span>Progress</span>
              <span>
                <span className="text-foreground">47</span>/100 experiments · 47%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-sm bg-muted">
              <div
                className="h-full rounded-sm bg-[var(--color-accent-orange)]"
                style={{ width: "47%" }}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">
              Target metrics
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="font-mono-terminal text-[10px]">
                CAGR &gt; 15%
              </Badge>
              <Badge variant="secondary" className="font-mono-terminal text-[10px]">
                Sharpe &gt; 1.5
              </Badge>
              <Badge variant="secondary" className="font-mono-terminal text-[10px]">
                MDD &lt; 20%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card ring-1 ring-foreground/5">
        <CardHeader className="border-b border-border/80 pb-3">
          <p className="font-mono-terminal text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Experiment log
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto pt-3">
          <table className="w-full min-w-[520px] border-collapse font-mono-terminal text-[11px]">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">#</th>
                <th className="pb-2 pr-3 font-medium">Sharpe</th>
                <th className="pb-2 pr-3 font-medium">CAGR</th>
                <th className="pb-2 pr-3 font-medium">Max Drawdown</th>
                <th className="pb-2 pr-3 font-medium">Status</th>
                <th className="pb-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {EXPERIMENTS.map((row) => (
                <tr
                  key={row.num}
                  className={cn(
                    "border-b border-border/60 last:border-0",
                    row.best && "bg-[var(--color-accent-orange)]/[0.06]"
                  )}
                >
                  <td className="py-2.5 pr-3 text-muted-foreground">#{row.num}</td>
                  <td className="py-2.5 pr-3 tabular-nums">{row.sharpe.toFixed(2)}</td>
                  <td className="py-2.5 pr-3 tabular-nums text-[var(--color-positive)]">
                    {row.cagr.toFixed(1)}%
                  </td>
                  <td className="py-2.5 pr-3 tabular-nums text-[var(--color-negative)]">
                    {row.mdd.toFixed(1)}%
                  </td>
                  <td className="py-2.5 pr-3">
                    {row.fail ? (
                      <XCircle className="size-4 text-[var(--color-negative)]" aria-label="Fail" />
                    ) : (
                      <CheckCircle2 className="size-4 text-[var(--color-positive)]" aria-label="Pass" />
                    )}
                  </td>
                  <td className="py-2.5">
                    {row.best ? (
                      <Badge className="h-5 bg-[var(--color-accent-orange)] px-1.5 text-[9px] font-semibold text-black">
                        BEST
                      </Badge>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="border-border bg-muted/20 ring-1 ring-foreground/5">
        <CardHeader className="flex flex-row items-center gap-2 border-b border-border/80 pb-3">
          <Sparkles className="size-4 text-[var(--color-accent-orange)]" />
          <p className="font-mono-terminal text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Agent Reasoning
          </p>
          <Badge variant="outline" className="ml-auto font-mono-terminal text-[9px]">
            Exp #47
          </Badge>
        </CardHeader>
        <CardContent className="pt-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            For experiment <span className="font-mono-terminal text-foreground">#47</span>, the agent
            tightened the momentum lookback to{" "}
            <span className="font-mono-terminal text-foreground">34 sessions</span> while widening the
            mean-reversion band to{" "}
            <span className="font-mono-terminal text-foreground">1.35σ</span>, then rebalanced weekly
            instead of daily to cut turnover. It validated the change on a walk-forward split, kept
            transaction costs in the objective, and promoted the variant after out-of-sample Sharpe
            rose versus the prior champion without breaching the{" "}
            <span className="font-mono-terminal text-foreground">20% MDD</span> guardrail.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
