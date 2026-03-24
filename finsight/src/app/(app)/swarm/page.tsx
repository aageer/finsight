"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Bot,
  Brain,
  MessageSquare,
  Plus,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";

const STEPS = [
  {
    step: "1",
    title: "Seed Data",
    body: "Knowledge extraction from news/events",
    icon: Brain,
  },
  {
    step: "2",
    title: "Generate Personas",
    body: "Create diverse investor agents",
    icon: Users,
  },
  {
    step: "3",
    title: "Simulate",
    body: "Agents interact, debate, shift opinions",
    icon: MessageSquare,
  },
  {
    step: "4",
    title: "Analyze",
    body: "Aggregate sentiment & predictions",
    icon: BarChart3,
  },
] as const;

const SIMULATIONS = [
  {
    title: "Fed 50bp Rate Cut — Tech Impact",
    agents: 500,
    bullish: 62,
    neutral: 23,
    bearish: 15,
  },
  {
    title: "NVDA Earnings Miss Scenario",
    agents: 300,
    bullish: 18,
    neutral: 25,
    bearish: 57,
  },
] as const;

const PERSONAS = [
  { label: "Retail Momentum", pct: 30, icon: TrendingUp },
  { label: "Institutional", pct: 20, icon: Shield },
  { label: "Quant", pct: 15, icon: BarChart3 },
  { label: "Hedge Macro", pct: 10, icon: Bot },
  { label: "Retail Passive", pct: 20, icon: Users },
  { label: "Options/Vol", pct: 5, icon: MessageSquare },
] as const;

export default function SwarmPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Swarm Studio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Multi-Agent Sentiment Simulation
          </p>
        </div>
        <Button
          size="sm"
          className="border border-[var(--color-accent-orange)]/30 bg-[var(--color-accent-orange)]/15 font-mono-terminal text-xs text-[var(--color-accent-orange)] hover:bg-[var(--color-accent-orange)]/25"
          variant="outline"
        >
          <Plus className="size-3.5" />
          New Scenario
        </Button>
      </div>

      <section className="space-y-3">
        <h2 className="font-mono-terminal text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Recent Simulations
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {SIMULATIONS.map((sim) => (
            <Card
              key={sim.title}
              className="border-border bg-card ring-1 ring-[var(--color-accent-orange)]/10"
            >
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                <div>
                  <p className="text-sm font-medium leading-snug text-foreground">{sim.title}</p>
                  <p className="mt-1 font-mono-terminal text-[10px] text-muted-foreground">
                    {sim.agents} agents
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 border-[var(--color-positive)]/40 bg-[var(--color-positive)]/10 font-mono-terminal text-[9px] text-[var(--color-positive)]"
                >
                  completed
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Result</p>
                <div className="flex flex-wrap gap-3 font-mono-terminal text-xs">
                  <span className="text-[var(--color-positive)]">{sim.bullish}% bullish</span>
                  <span className="text-muted-foreground">{sim.neutral}% neutral</span>
                  <span className="text-[var(--color-negative)]">{sim.bearish}% bearish</span>
                </div>
                <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="bg-[var(--color-positive)]"
                    style={{ width: `${sim.bullish}%` }}
                  />
                  <div className="bg-muted-foreground/40" style={{ width: `${sim.neutral}%` }} />
                  <div
                    className="bg-[var(--color-negative)]"
                    style={{ width: `${sim.bearish}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono-terminal text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          How It Works
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STEPS.map(({ step, title, body, icon: Icon }) => (
            <Card
              key={step}
              className="border-border bg-muted/15 ring-1 ring-foreground/5 transition-colors hover:ring-[var(--color-accent-orange)]/25"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-md bg-[var(--color-accent-orange)]/15 font-mono-terminal text-xs font-bold text-[var(--color-accent-orange)]">
                    {step}
                  </span>
                  <Icon className="size-4 text-[var(--color-accent-orange)]" />
                </div>
                <p className="pt-1 text-sm font-medium text-foreground">{title}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono-terminal text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Persona Archetypes
        </h2>
        <Card className="border-border bg-card ring-1 ring-[var(--color-accent-orange)]/10">
          <CardContent className="grid gap-3 py-4 sm:grid-cols-2 lg:grid-cols-3">
            {PERSONAS.map(({ label, pct, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-md border border-border/80 bg-muted/10 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-[var(--color-accent-orange)]" />
                  <span className="text-xs font-medium text-foreground">{label}</span>
                </div>
                <span className="font-mono-terminal text-xs tabular-nums text-[var(--color-accent-orange)]">
                  {pct}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
