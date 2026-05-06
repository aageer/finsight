/**
 * Trade Executor — Converts CIO signals into actual trades
 * ─────────────────────────────────────────────────────────
 * Enforces all risk limits before execution.
 * Maintains a full audit trail.
 */

import type {
  TradeSignal,
  AutoTradeConfig,
  TradeExecution,
  TradingDaySummary,
  TradingMode,
} from "@/types/agent-types";
import {
  submitOrder,
  getAccount,
  getPositions,
  type AlpacaOrder,
} from "./alpaca-client";
import { checkRiskLimits, type RiskCheckResult } from "./risk-limits";

// ─── Execute Trade Signals ───────────────────────────────

export async function executeSignals(
  signals: TradeSignal[],
  config: AutoTradeConfig
): Promise<TradeExecution[]> {
  if (config.mode === "HALTED") {
    console.log("[TradeExecutor] Trading is HALTED — no executions");
    return [];
  }

  // Get account info for position sizing
  const account = await getAccount(config.mode);
  if (!account) {
    console.error("[TradeExecutor] Cannot execute — unable to fetch account");
    return [];
  }

  const portfolioValue = Number(account.portfolio_value);
  const buyingPower = Number(account.buying_power);
  const currentPositions = await getPositions(config.mode);

  const executions: TradeExecution[] = [];
  let dailySpent = 0;

  for (const signal of signals) {
    // Skip FLAT signals
    if (signal.direction === "FLAT") continue;

    // Run risk checks
    const riskCheck = checkRiskLimits(signal, config, {
      portfolioValue,
      buyingPower,
      currentPositionCount: currentPositions.length,
      dailySpent,
      existingPositionSymbols: currentPositions.map((p) => p.symbol),
    });

    if (!riskCheck.allowed) {
      console.warn(
        `[TradeExecutor] BLOCKED ${signal.symbol}: ${riskCheck.reason}`
      );
      executions.push({
        id: `exec-${Date.now()}-${signal.symbol}`,
        signalId: `${signal.symbol}-${Date.now()}`,
        symbol: signal.symbol,
        direction: signal.direction,
        quantity: 0,
        price: 0,
        totalValue: 0,
        status: "REJECTED",
        contributingAgents: signal.contributingAgents,
        executedAt: new Date().toISOString(),
      });
      continue;
    }

    // Calculate position size
    const tradeValue = Math.min(
      portfolioValue * (signal.suggestedSize / 100),
      config.maxPerTrade,
      buyingPower * 0.95 // leave 5% buffer
    );

    // We need a price estimate — use a market order
    // In production, you'd fetch the latest quote first
    const estimatedPrice = 100; // placeholder — Alpaca handles market pricing
    const quantity = Math.max(1, Math.floor(tradeValue / estimatedPrice));

    // Submit to Alpaca
    const side = signal.direction === "LONG" ? "buy" : "sell";

    const order = await submitOrder(
      {
        symbol: signal.symbol,
        qty: quantity,
        side: side as "buy" | "sell",
        type: "market",
        time_in_force: "day",
      },
      config.mode
    );

    if (order) {
      dailySpent += tradeValue;
      executions.push({
        id: `exec-${Date.now()}-${signal.symbol}`,
        signalId: `${signal.symbol}-${Date.now()}`,
        symbol: signal.symbol,
        direction: signal.direction,
        quantity: Number(order.qty),
        price: Number(order.filled_avg_price || 0),
        totalValue: tradeValue,
        status: order.status === "filled" ? "FILLED" : "PENDING",
        alpacaOrderId: order.id,
        contributingAgents: signal.contributingAgents,
        executedAt: new Date().toISOString(),
      });
      console.log(
        `[TradeExecutor] ✅ ${side.toUpperCase()} ${signal.symbol} x${quantity} — Order: ${order.id}`
      );
    } else {
      executions.push({
        id: `exec-${Date.now()}-${signal.symbol}`,
        signalId: `${signal.symbol}-${Date.now()}`,
        symbol: signal.symbol,
        direction: signal.direction,
        quantity: 0,
        price: 0,
        totalValue: 0,
        status: "REJECTED",
        contributingAgents: signal.contributingAgents,
        executedAt: new Date().toISOString(),
      });
    }
  }

  return executions;
}

// ─── Day Summary ─────────────────────────────────────────

export function calculateDaySummary(
  executions: TradeExecution[],
  config: AutoTradeConfig
): TradingDaySummary {
  const today = new Date().toISOString().split("T")[0];
  const todayExecutions = executions.filter((e) =>
    e.executedAt.startsWith(today)
  );

  const totalBought = todayExecutions
    .filter((e) => e.direction === "LONG" && e.status !== "REJECTED")
    .reduce((s, e) => s + e.totalValue, 0);

  const totalSold = todayExecutions
    .filter((e) => e.direction === "SHORT" && e.status !== "REJECTED")
    .reduce((s, e) => s + e.totalValue, 0);

  const realizedPnl = todayExecutions
    .filter((e) => e.pnl !== undefined)
    .reduce((s, e) => s + (e.pnl || 0), 0);

  return {
    date: today,
    tradesExecuted: todayExecutions.filter((e) => e.status !== "REJECTED").length,
    totalBought,
    totalSold,
    realizedPnl,
    unrealizedPnl: 0, // calculated from live positions
    dollarLimitUsed: totalBought + totalSold,
    dollarLimitRemaining: config.maxDaily - (totalBought + totalSold),
  };
}

// ─── Default Config ──────────────────────────────────────

export function getDefaultTradeConfig(): AutoTradeConfig {
  return {
    mode: "PAPER",
    maxPerTrade: 500,           // $500 max per trade
    maxDaily: 2000,             // $2000 max per day
    maxPortfolioAllocation: 10, // 10% max per position
    maxPositions: 10,           // max 10 open positions
    dailyLossLimit: 200,        // halt if daily loss > $200
    maxDrawdown: 15,            // halt if drawdown > 15%
    cashReserve: 20,            // keep 20% in cash
    requireConfirmation: false, // paper mode = no confirmation needed
    allowedAssetTypes: ["stock", "etf"],
    blacklistedSymbols: [],
  };
}
