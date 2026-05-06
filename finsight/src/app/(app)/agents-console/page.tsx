"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Bot,
  Brain,
  ChevronRight,
  Crown,
  Flame,
  Gauge,
  LayersIcon,
  Play,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/section-header";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/stores/agent-store";
import type { ATLASAgent, AgentLayer } from "@/types/agent-types";

// ─── Layer Config ────────────────────────────────────────

const LAYER_CONFIG: Record<AgentLayer, { label: string; color: string; icon: typeof Brain; description: string }> = {
  MACRO: { label: "Layer 1 — Macro Regime", color: "oklch(0.7 0.15 250)", icon: Gauge, description: "Sets the market environment" },
  SECTOR: { label: "Layer 2 — Sector Desks", color: "oklch(0.7 0.15 170)", icon: LayersIcon, description: "Sector-level analysis & picks" },
  SUPERINVESTOR: { label: "Layer 3 — Superinvestors", color: "oklch(0.7 0.15 50)", icon: Crown, description: "Legendary investor personas" },
  DECISION: { label: "Layer 4 — Decision", color: "oklch(0.7 0.15 30)", icon: Target, description: "Final trade signals" },
};

// ─── Weight Bar ──────────────────────────────────────────

function WeightBar({ weight, maxWeight = 2.5 }: { weight: number; maxWeight?: number }) {
  const pct = Math.min(100, ((weight - 0.3) / (maxWeight - 0.3)) * 100);
  const hue = pct > 60 ? 140 : pct > 30 ? 50 : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-muted/40 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: `oklch(0.65 0.15 ${hue})` }}
        />
      </div>
      <span className="font-mono-terminal text-[10px] tabular-nums text-muted-foreground">
        {weight.toFixed(2)}
      </span>
    </div>
  );
}

// ─── Agent Card ──────────────────────────────────────────

function AgentCard({ agent, layerColor }: { agent: ATLASAgent; layerColor: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "group rounded-lg border border-border/60 bg-[oklch(0.06_0_0)] p-3 transition-all hover:border-[color:var(--agent-color)]/40 cursor-pointer",
        expanded && "ring-1 ring-[color:var(--agent-color)]/30"
      )}
      style={{ "--agent-color": layerColor } as React.CSSProperties}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ backgroundColor: `${layerColor}20`, color: layerColor }}
          >
            <Bot className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="font-mono-terminal text-[11px] font-semibold text-foreground">
              {agent.name.replace("Agent", "")}
            </p>
            <p className="text-[10px] text-muted-foreground">{agent.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WeightBar weight={agent.darwinianWeight} />
          <Badge
            variant="outline"
            className={cn(
              "text-[8px] px-1.5 py-0",
              agent.status === "RUNNING" && "border-[var(--color-positive)]/40 text-[var(--color-positive)]",
              agent.status === "IDLE" && "border-muted-foreground/30 text-muted-foreground",
              agent.status === "ERROR" && "border-[var(--color-negative)]/40 text-[var(--color-negative)]"
            )}
          >
            {agent.status}
          </Badge>
        </div>
      </div>
      {agent.inspiration && (
        <p className="mt-1.5 text-[9px] italic text-muted-foreground/70">
          {agent.inspiration}
        </p>
      )}
      {expanded && (
        <div className="mt-3 space-y-2 border-t border-border/40 pt-3 text-[10px]">
          <div>
            <span className="font-semibold text-muted-foreground">Description: </span>
            <span className="text-foreground/80">{agent.description}</span>
          </div>
          <div>
            <span className="font-semibold text-muted-foreground">Darwinian Weight: </span>
            <span className="font-mono-terminal text-foreground">{agent.darwinianWeight.toFixed(4)}</span>
          </div>
          {agent.lastRunAt && (
            <div>
              <span className="font-semibold text-muted-foreground">Last Run: </span>
              <span className="text-foreground/80">{new Date(agent.lastRunAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────

export default function AgentsConsolePage() {
  const {
    agents,
    pipelineRunning,
    pipelineStage,
    pipelineProgress,
    currentRegime,
    regimeConfidence,
    lastPipelineOutput,
    weights,
    scorecards,
    initAgents,
  } = useAgentStore();

  const [runningPipeline, setRunningPipeline] = useState(false);

  useEffect(() => {
    initAgents();
  }, [initAgents]);

  const layerGroups = useMemo(() => {
    const groups: Record<AgentLayer, ATLASAgent[]> = {
      MACRO: [],
      SECTOR: [],
      SUPERINVESTOR: [],
      DECISION: [],
    };
    agents.forEach((a) => {
      if (groups[a.layer]) groups[a.layer].push(a);
    });
    return groups;
  }, [agents]);

  const stats = useMemo(() => ({
    totalAgents: agents.length,
    runningAgents: agents.filter((a) => a.status === "RUNNING").length,
    avgWeight: agents.length > 0
      ? agents.reduce((s, a) => s + a.darwinianWeight, 0) / agents.length
      : 1.0,
    topAgent: agents.length > 0
      ? [...agents].sort((a, b) => b.darwinianWeight - a.darwinianWeight)[0]
      : null,
    signalCount: lastPipelineOutput?.finalSignals.length || 0,
  }), [agents, lastPipelineOutput]);

  async function handleRunPipeline() {
    setRunningPipeline(true);
    useAgentStore.getState().setPipelineRunning(true);

    try {
      // Fetch news for pipeline context
      const newsRes = await fetch("/api/market/news");
      const newsData = newsRes.ok ? await newsRes.json() : [];

      const res = await fetch("/api/atlas/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news: newsData, quotes: {} }),
      });

      if (res.ok) {
        const output = await res.json();
        useAgentStore.getState().setPipelineOutput(output);
      }
    } catch (error) {
      console.error("[AgentsConsole] Pipeline error:", error);
    } finally {
      setRunningPipeline(false);
      useAgentStore.getState().setPipelineRunning(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-[var(--color-accent-orange)]" />
          <div>
            <h1 className="font-mono-terminal text-lg font-bold tracking-tight">
              ATLAS Agent Console
            </h1>
            <p className="text-xs text-muted-foreground">
              {agents.length} agents across 4 layers • Darwinian weight evolution
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "font-mono-terminal text-[10px]",
              currentRegime === "RISK_ON" && "border-[var(--color-positive)]/40 text-[var(--color-positive)]",
              currentRegime === "RISK_OFF" && "border-[var(--color-negative)]/40 text-[var(--color-negative)]",
              currentRegime === "TRANSITIONAL" && "border-[var(--color-accent-orange)]/40 text-[var(--color-accent-orange)]"
            )}
          >
            {currentRegime.replace("_", " ")} — {(regimeConfidence * 100).toFixed(0)}%
          </Badge>
          <Button
            size="sm"
            onClick={handleRunPipeline}
            disabled={runningPipeline}
            className="gap-1.5 bg-[var(--color-accent-orange)] text-black hover:bg-[var(--color-accent-orange)]/90 font-mono-terminal text-xs"
          >
            {runningPipeline ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            {runningPipeline ? "Running Pipeline..." : "Run ATLAS Pipeline"}
          </Button>
        </div>
      </div>

      {/* Pipeline Progress */}
      {pipelineRunning && (
        <Card className="border-[var(--color-accent-orange)]/30 bg-[oklch(0.08_0_0)]">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[var(--color-accent-orange)] animate-pulse" />
                <span className="font-mono-terminal text-xs text-foreground">
                  {pipelineStage}
                </span>
              </div>
              <span className="font-mono-terminal text-[10px] text-muted-foreground">
                {pipelineProgress}%
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
              <div
                className="h-full rounded-full bg-[var(--color-accent-orange)] transition-all duration-700"
                style={{ width: `${pipelineProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Agents", value: stats.totalAgents, icon: Users },
          { label: "Active Now", value: stats.runningAgents, icon: Zap },
          { label: "Avg Weight", value: stats.avgWeight.toFixed(2), icon: TrendingUp },
          { label: "Top Agent", value: stats.topAgent?.name.replace("Agent", "") || "—", icon: Crown },
          { label: "Signals", value: stats.signalCount, icon: Target },
        ].map((stat) => (
          <Card key={stat.label} className="border-border bg-[oklch(0.08_0_0)]">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5">
                <stat.icon className="h-3 w-3 text-muted-foreground" />
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <p className="mt-1 font-mono-terminal text-lg font-bold text-foreground">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Layer Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(["MACRO", "SECTOR", "SUPERINVESTOR", "DECISION"] as AgentLayer[]).map((layer) => {
          const config = LAYER_CONFIG[layer];
          const layerAgents = layerGroups[layer];

          return (
            <Card key={layer} className="border-border bg-[oklch(0.06_0_0)]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${config.color}20`, color: config.color }}
                    >
                      <config.icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-mono-terminal text-xs font-semibold" style={{ color: config.color }}>
                        {config.label}
                      </p>
                      <p className="text-[9px] text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono-terminal">
                    {layerAgents.length} agents
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {layerAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} layerColor={config.color} />
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Last Pipeline Results */}
      {lastPipelineOutput && (
        <Card className="border-border bg-[oklch(0.08_0_0)]">
          <CardHeader className="pb-2">
            <SectionHeader title="Last Pipeline Results" icon={Sparkles} />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-xs">
                <span className="text-muted-foreground">
                  Regime: <span className="font-mono-terminal text-foreground">{lastPipelineOutput.layer1.regime}</span>
                </span>
                <span className="text-muted-foreground">
                  Duration: <span className="font-mono-terminal text-foreground">{(lastPipelineOutput.pipelineDurationMs / 1000).toFixed(1)}s</span>
                </span>
                <span className="text-muted-foreground">
                  Signals: <span className="font-mono-terminal text-foreground">{lastPipelineOutput.finalSignals.length}</span>
                </span>
              </div>

              {lastPipelineOutput.finalSignals.length > 0 && (
                <div className="space-y-2">
                  <p className="font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">
                    Trade Signals
                  </p>
                  {lastPipelineOutput.finalSignals.map((signal, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md border border-border/40 bg-[oklch(0.05_0_0)] p-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          className={cn(
                            "text-[9px] font-mono-terminal",
                            signal.direction === "LONG" && "bg-[var(--color-positive)]/15 text-[var(--color-positive)]",
                            signal.direction === "SHORT" && "bg-[var(--color-negative)]/15 text-[var(--color-negative)]",
                            signal.direction === "FLAT" && "bg-muted text-muted-foreground"
                          )}
                        >
                          {signal.direction}
                        </Badge>
                        <span className="font-mono-terminal text-sm font-bold">{signal.symbol}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-mono-terminal text-[10px] text-muted-foreground">Conviction</p>
                          <p className="font-mono-terminal text-xs font-semibold">{signal.conviction}%</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono-terminal text-[10px] text-muted-foreground">Size</p>
                          <p className="font-mono-terminal text-xs font-semibold">{signal.suggestedSize}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {lastPipelineOutput.layer4.cio.reasoning && (
                <div className="rounded-md border border-border/30 bg-muted/10 p-3">
                  <p className="text-[10px] font-semibold text-muted-foreground mb-1">CIO Reasoning</p>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    {lastPipelineOutput.layer4.cio.reasoning}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
