"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Ban,
  Banknote,
  CircleDollarSign,
  Clock,
  Gauge,
  HandCoins,
  LineChart,
  Loader2,
  OctagonX,
  Play,
  Power,
  RefreshCw,
  Settings2,
  Shield,
  ShieldAlert,
  Wallet,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/shared/section-header";
import { cn } from "@/lib/utils";
import { useTradingStore } from "@/stores/trading-store";
import { useAgentStore } from "@/stores/agent-store";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { TradingMode } from "@/types/agent-types";

// ─── Mode Config ─────────────────────────────────────────

const MODE_CONFIG: Record<TradingMode, { label: string; color: string; icon: typeof Play }> = {
  PAPER: { label: "Paper Trading", color: "var(--color-accent-orange)", icon: Play },
  LIVE: { label: "Live Trading", color: "var(--color-positive)", icon: Zap },
  HALTED: { label: "HALTED", color: "var(--color-negative)", icon: Ban },
};

export default function TradingPage() {
  // PERF FIX: Use granular selectors instead of subscribing to the entire store.
  // Previously `const trading = useTradingStore()` caused re-renders on ANY store mutation
  // (positions, executions, config changes, etc.) — even when this page only needed a few fields.
  const config = useTradingStore((s) => s.config);
  const mode = useTradingStore((s) => s.config.mode);
  const isKillSwitchActive = useTradingStore((s) => s.isKillSwitchActive);
  const positions = useTradingStore((s) => s.positions);
  const executions = useTradingStore((s) => s.executions);
  const daySummary = useTradingStore((s) => s.daySummary);
  const portfolioValue = useTradingStore((s) => s.portfolioValue);
  const buyingPower = useTradingStore((s) => s.buyingPower);
  const dailyPnl = useTradingStore((s) => s.dailyPnl);

  const agentStore = useAgentStore();
  const [loading, setLoading] = useState(false);
  const [confirmLive, setConfirmLive] = useState(false);
  const [holdTimer, setHoldTimer] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Fetch trading data on mount / mode change
  // PERF FIX: Dependency is now the primitive `mode` string, not the whole store object.
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/trading?mode=${mode}`);
        if (res.ok) {
          const data = await res.json();
          if (data.account) {
            useTradingStore.getState().setAccountInfo({
              portfolioValue: data.account.portfolioValue,
              buyingPower: data.account.buyingPower,
              cash: data.account.cash,
              dailyPnl: data.account.pnlToday,
            });
          }
          if (data.positions) {
            useTradingStore.getState().setPositions(data.positions);
          }
        }
      } catch { /* pass */ }
    }
    fetchData();
  }, [mode]);

  // Kill switch handler
  async function handleKillSwitch() {
    setLoading(true);
    try {
      await fetch("/api/trading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "kill-switch", mode }),
      });
      useTradingStore.getState().setKillSwitch(true);
    } catch (error) {
      console.error("Kill switch error:", error);
    } finally {
      setLoading(false);
    }
  }

  // Execute pipeline signals
  async function handleExecuteSignals() {
    const signals = agentStore.lastPipelineOutput?.finalSignals;
    if (!signals || signals.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/trading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "execute",
          signals,
          config,
          mode,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        data.executions?.forEach((e: any) => useTradingStore.getState().addExecution(e));
      }
    } catch (error) {
      console.error("Execution error:", error);
    } finally {
      setLoading(false);
    }
  }

  const modeConfig = MODE_CONFIG[mode];
  const signals = agentStore.lastPipelineOutput?.finalSignals || [];
  const dailyUsedPct = config.maxDaily > 0 
    ? ((daySummary?.dollarLimitUsed || 0) / config.maxDaily) * 100 
    : 0;

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-[var(--color-accent-orange)]" />
          <h1 className="font-mono-terminal text-xs font-bold tracking-tight uppercase">Auto-Trading</h1>
          <span className="font-mono-terminal text-[9px] text-[oklch(0.4_0_0)]">
            Agent-driven execution • Dollar-limited
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Mode Toggle */}
          <div className="flex rounded-sm border border-[#1a1a1a] overflow-hidden">
            {(["PAPER", "LIVE", "HALTED"] as TradingMode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  if (m === "LIVE" && config.mode !== "LIVE") {
                    setConfirmLive(true);
                    return;
                  }
                  useTradingStore.getState().setMode(m);
                }}
                className={cn(
                  "px-2 py-1 font-mono-terminal text-[8px] font-bold transition-all",
                  config.mode === m
                    ? "text-black"
                    : "text-[oklch(0.4_0_0)] hover:text-foreground"
                )}
                style={{
                  backgroundColor: config.mode === m ? MODE_CONFIG[m].color : "transparent",
                }}
              >
                {m}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
            className="h-6 w-6 p-0 rounded-sm border-[#1a1a1a]"
          >
            <Settings2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Live Trading Confirmation Dialog */}
      {confirmLive && (
        <div className="terminal-panel border-[var(--color-negative)]/40">
          <div className="p-2">
            <div className="flex items-start gap-2">
              <ShieldAlert className="h-3.5 w-3.5 text-[var(--color-negative)] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-mono-terminal text-sm font-bold text-[var(--color-negative)]">
                  ⚠️ LIVE TRADING CONFIRMATION
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Live trading uses REAL MONEY. All trades will be executed on Alpaca Markets with your actual account.
                  Make sure you have configured your API keys and understand the risks.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => { useTradingStore.getState().setMode("LIVE"); setConfirmLive(false); }}
                    className="font-mono-terminal text-xs"
                  >
                    I Understand — Enable Live Trading
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmLive(false)}
                    className="font-mono-terminal text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kill Switch + Account Overview */}
      <div className="grid grid-cols-12 gap-1">
        {/* Kill Switch */}
        <div className={cn(
          "terminal-panel col-span-12 md:col-span-3",
          isKillSwitchActive && "border-[var(--color-negative)]/40"
        )}>
          <div className="flex flex-col items-center justify-center p-3 h-full">
            <button
              onClick={handleKillSwitch}
              disabled={loading || isKillSwitchActive}
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full border-4 transition-all",
                isKillSwitchActive
                  ? "border-[var(--color-negative)] bg-[var(--color-negative)]/20 cursor-not-allowed"
                  : "border-[var(--color-negative)]/50 bg-[var(--color-negative)]/10 hover:bg-[var(--color-negative)]/30 hover:border-[var(--color-negative)] hover:scale-105 active:scale-95"
              )}
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[var(--color-negative)]" />
              ) : (
                <OctagonX className="h-6 w-6 text-[var(--color-negative)]" />
              )}
            </button>
            <p className="mt-1.5 font-mono-terminal text-[8px] font-bold uppercase tracking-wider text-[var(--color-negative)]">
              {isKillSwitchActive ? "TRADING HALTED" : "KILL SWITCH"}
            </p>
            <p className="mt-0.5 text-[8px] text-[oklch(0.4_0_0)] text-center">
              Cancel all orders
            </p>
          </div>
        </div>

        {/* Account Info */}
        <div className="col-span-12 md:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-1">
          {[
            { label: "Portfolio Value", value: formatCurrency(portfolioValue), icon: Wallet, color: "" },
            { label: "Buying Power", value: formatCurrency(buyingPower), icon: HandCoins, color: "" },
            { label: "Daily P&L", value: formatCurrency(dailyPnl), icon: LineChart, color: dailyPnl >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]" },
            { label: "Open Positions", value: String(positions.length), icon: CircleDollarSign, color: "" },
          ].map((item) => (
            <div key={item.label} className="terminal-panel">
              <div className="p-2">
                <div className="flex items-center gap-1">
                  <item.icon className="h-2.5 w-2.5 text-[oklch(0.4_0_0)]" />
                  <span className="data-label">{item.label}</span>
                </div>
                <p className={cn("mt-1 data-value text-sm", item.color || "text-foreground")}>
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="terminal-panel">
          <div className="terminal-header flex items-center gap-1.5">
            <Shield className="h-3 w-3" />
            TRADING LIMITS
          </div>
          <div className="p-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: "Max Per Trade", key: "maxPerTrade" as const, value: config.maxPerTrade, prefix: "$" },
                { label: "Max Daily", key: "maxDaily" as const, value: config.maxDaily, prefix: "$" },
                { label: "Daily Loss Limit", key: "dailyLossLimit" as const, value: config.dailyLossLimit, prefix: "$" },
                { label: "Max Positions", key: "maxPositions" as const, value: config.maxPositions, prefix: "" },
                { label: "Max Position %", key: "maxPortfolioAllocation" as const, value: config.maxPortfolioAllocation, prefix: "" },
                { label: "Max Drawdown %", key: "maxDrawdown" as const, value: config.maxDrawdown, prefix: "" },
                { label: "Cash Reserve %", key: "cashReserve" as const, value: config.cashReserve, prefix: "" },
              ].map((setting) => (
                <div key={setting.key}>
                  <label className="data-label mb-0.5 block">{setting.label}</label>
                  <div className="flex items-center gap-1">
                    {setting.prefix && <span className="text-[9px] text-[oklch(0.4_0_0)]">{setting.prefix}</span>}
                    <input
                      type="number"
                      value={setting.value}
                      onChange={(e) => {
                        useTradingStore.getState().setConfig({ [setting.key]: Number(e.target.value) });
                      }}
                      className="w-full rounded-sm border border-[#1a1a1a] bg-[#050505] px-1.5 py-1 font-mono-terminal text-[10px] text-foreground"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dollar Limit Usage */}
      <div className="terminal-panel">
        <div className="p-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Gauge className="h-2.5 w-2.5 text-[oklch(0.4_0_0)]" />
              <span className="data-label">Daily Limit Usage</span>
            </div>
            <span className="data-dense">
              {formatCurrency(daySummary?.dollarLimitUsed || 0)} / {formatCurrency(config.maxDaily)}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-sm bg-[#111]">
            <div
              className={cn(
                "h-full rounded-sm transition-all duration-500",
                dailyUsedPct > 80 ? "bg-[var(--color-negative)]" : dailyUsedPct > 50 ? "bg-[var(--color-accent-orange)]" : "bg-[var(--color-positive)]"
              )}
              style={{ width: `${Math.min(100, dailyUsedPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pending Signals + Execute */}
      {signals.length > 0 && (
        <div className="terminal-panel border-[var(--color-accent-orange)]/20">
          <div className="terminal-header-accent flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3" />
              PENDING SIGNALS ({signals.length})
            </div>
            <Button
              size="sm"
              onClick={handleExecuteSignals}
              disabled={loading || isKillSwitchActive || mode === "HALTED"}
              className="gap-1 bg-[var(--color-accent-orange)] text-black hover:bg-[var(--color-accent-orange)]/90 font-mono-terminal text-[8px] h-5 px-2 rounded-sm"
            >
              {loading ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Play className="h-2.5 w-2.5" />}
              Execute All
            </Button>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {signals.map((signal, i) => (
              <div key={i} className="flex items-center justify-between px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "text-[7px] font-mono-terminal w-10 justify-center h-4 rounded-sm",
                    signal.direction === "LONG" && "bg-[var(--color-positive)]/15 text-[var(--color-positive)]",
                    signal.direction === "SHORT" && "bg-[var(--color-negative)]/15 text-[var(--color-negative)]"
                  )}>
                    {signal.direction}
                  </Badge>
                  <span className="data-dense font-bold">{signal.symbol}</span>
                  <span className="text-[8px] text-[oklch(0.4_0_0)] truncate max-w-[180px]">
                    {signal.reasoning}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="data-label">Conv</p>
                    <p className="data-dense font-semibold">{signal.conviction}%</p>
                  </div>
                  <div>
                    <p className="data-label">Size</p>
                    <p className="data-dense font-semibold">{signal.suggestedSize}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positions */}
      <div className="terminal-panel">
        <div className="terminal-header flex items-center gap-1.5">
          <Banknote className="h-3 w-3" />
          OPEN POSITIONS
        </div>
        {positions.length > 0 ? (
          <div className="divide-y divide-[#1a1a1a]">
            {positions.map((pos) => (
              <div key={pos.symbol} className="flex items-center justify-between px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[7px] font-mono-terminal w-10 justify-center h-4 rounded-sm border-[#1a1a1a]">
                    {pos.side.toUpperCase()}
                  </Badge>
                  <div>
                    <p className="data-dense font-bold">{pos.symbol}</p>
                    <p className="text-[8px] text-[oklch(0.4_0_0)]">{pos.qty} shares @ {formatCurrency(pos.avgEntryPrice)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="data-dense">{formatCurrency(pos.currentPrice)}</p>
                    <p className={cn("text-[9px]", pos.unrealizedPnl >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]")}>
                      {pos.unrealizedPnl >= 0 ? "+" : ""}{formatCurrency(pos.unrealizedPnl)}
                    </p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-0.5 data-dense font-semibold",
                    pos.unrealizedPnlPct >= 0 ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"
                  )}>
                    {pos.unrealizedPnlPct >= 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                    {formatPercent(pos.unrealizedPnlPct)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Wallet className="h-6 w-6 text-[oklch(0.2_0_0)] mb-1.5" />
            <p className="data-dense text-[oklch(0.4_0_0)]">No open positions</p>
            <p className="text-[8px] text-[oklch(0.3_0_0)]">Run the ATLAS pipeline to generate signals</p>
          </div>
        )}
      </div>

      {/* Trade History */}
      {executions.length > 0 && (
        <div className="terminal-panel">
          <div className="terminal-header flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              TRADE HISTORY
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => useTradingStore.getState().clearHistory()}
              className="text-[8px] text-[oklch(0.4_0_0)] h-4 px-1 hover:text-foreground"
            >
              Clear
            </Button>
          </div>
          <div className="divide-y divide-[#1a1a1a] max-h-[250px] overflow-y-auto">
            {executions.slice(0, 20).map((exec) => (
              <div key={exec.id} className="flex items-center justify-between px-2 py-1.5">
                <div className="flex items-center gap-1.5">
                  <Badge className={cn(
                    "text-[7px] font-mono-terminal px-1 h-3.5 rounded-sm",
                    exec.status === "FILLED" && "bg-[var(--color-positive)]/15 text-[var(--color-positive)]",
                    exec.status === "REJECTED" && "bg-[var(--color-negative)]/15 text-[var(--color-negative)]",
                    exec.status === "PENDING" && "bg-[var(--color-accent-orange)]/15 text-[var(--color-accent-orange)]"
                  )}>
                    {exec.status}
                  </Badge>
                  <span className="data-dense font-semibold">{exec.symbol}</span>
                  <span className="text-[8px] text-[oklch(0.4_0_0)]">
                    {exec.direction} x{exec.quantity}
                  </span>
                </div>
                <span className="data-dense text-[oklch(0.4_0_0)]">
                  {new Date(exec.executedAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
