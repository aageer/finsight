/**
 * Risk Limits — Non-Overridable Safety Guardrails
 * ────────────────────────────────────────────────
 * Hard-coded limits that prevent catastrophic losses.
 * These cannot be bypassed by any agent or user config.
 */

import type { TradeSignal, AutoTradeConfig } from "@/types/agent-types";

// ─── Hard Limits (cannot be overridden) ──────────────────

const ABSOLUTE_MAX_SINGLE_TRADE = 10_000;    // $10K max per trade ever
const ABSOLUTE_MAX_DAILY = 50_000;           // $50K max per day ever
const ABSOLUTE_MAX_POSITION_PCT = 25;        // 25% max per position ever
const ABSOLUTE_MIN_CASH_RESERVE_PCT = 10;    // always keep 10% cash

// ─── Risk Check Context ──────────────────────────────────

export interface RiskContext {
  portfolioValue: number;
  buyingPower: number;
  currentPositionCount: number;
  dailySpent: number;
  existingPositionSymbols: string[];
}

export interface RiskCheckResult {
  allowed: boolean;
  reason: string;
  adjustedSize?: number;    // if we reduced the position size
}

// ─── Pre-Trade Risk Checks ───────────────────────────────

export function checkRiskLimits(
  signal: TradeSignal,
  config: AutoTradeConfig,
  context: RiskContext
): RiskCheckResult {
  // 1. Trading halted?
  if (config.mode === "HALTED") {
    return { allowed: false, reason: "Trading is HALTED" };
  }

  // 2. Blacklisted symbol?
  if (config.blacklistedSymbols.includes(signal.symbol)) {
    return { allowed: false, reason: `${signal.symbol} is blacklisted` };
  }

  // 3. Max positions check
  if (
    context.currentPositionCount >= config.maxPositions &&
    !context.existingPositionSymbols.includes(signal.symbol)
  ) {
    return {
      allowed: false,
      reason: `Max positions reached (${config.maxPositions})`,
    };
  }

  // 4. Per-trade dollar limit
  const tradeValue = context.portfolioValue * (signal.suggestedSize / 100);
  const effectiveMax = Math.min(config.maxPerTrade, ABSOLUTE_MAX_SINGLE_TRADE);

  if (tradeValue > effectiveMax) {
    return {
      allowed: true,
      reason: `Reduced from $${tradeValue.toFixed(0)} to $${effectiveMax}`,
      adjustedSize: effectiveMax,
    };
  }

  // 5. Daily spend limit
  const effectiveDaily = Math.min(config.maxDaily, ABSOLUTE_MAX_DAILY);
  if (context.dailySpent + tradeValue > effectiveDaily) {
    const remaining = effectiveDaily - context.dailySpent;
    if (remaining <= 0) {
      return {
        allowed: false,
        reason: `Daily limit exhausted ($${effectiveDaily})`,
      };
    }
    return {
      allowed: true,
      reason: `Reduced to fit daily limit: $${remaining.toFixed(0)} remaining`,
      adjustedSize: remaining,
    };
  }

  // 6. Portfolio allocation limit
  const effectiveAllocation = Math.min(
    config.maxPortfolioAllocation,
    ABSOLUTE_MAX_POSITION_PCT
  );
  const allocationPct = (tradeValue / context.portfolioValue) * 100;
  if (allocationPct > effectiveAllocation) {
    return {
      allowed: true,
      reason: `Position capped at ${effectiveAllocation}% of portfolio`,
      adjustedSize: context.portfolioValue * (effectiveAllocation / 100),
    };
  }

  // 7. Cash reserve check
  const effectiveCashReserve = Math.max(
    config.cashReserve,
    ABSOLUTE_MIN_CASH_RESERVE_PCT
  );
  const cashAfterTrade = context.buyingPower - tradeValue;
  const cashReserveRequired = context.portfolioValue * (effectiveCashReserve / 100);

  if (cashAfterTrade < cashReserveRequired) {
    const maxAffordable = context.buyingPower - cashReserveRequired;
    if (maxAffordable <= 0) {
      return {
        allowed: false,
        reason: `Insufficient buying power after ${effectiveCashReserve}% cash reserve`,
      };
    }
    return {
      allowed: true,
      reason: `Reduced to maintain ${effectiveCashReserve}% cash reserve`,
      adjustedSize: maxAffordable,
    };
  }

  // 8. Low conviction filter — don't trade on weak signals
  if (signal.conviction < 30) {
    return {
      allowed: false,
      reason: `Conviction too low (${signal.conviction}% < 30% threshold)`,
    };
  }

  // All checks passed
  return { allowed: true, reason: "All risk checks passed" };
}

// ─── Daily Loss Check (called periodically) ──────────────

export function checkDailyLossLimit(
  dailyPnl: number,
  config: AutoTradeConfig
): { halt: boolean; reason: string } {
  if (dailyPnl < -config.dailyLossLimit) {
    return {
      halt: true,
      reason: `Daily loss limit breached: $${Math.abs(dailyPnl).toFixed(0)} loss exceeds $${config.dailyLossLimit} limit`,
    };
  }
  return { halt: false, reason: "Within daily loss limit" };
}

// ─── Max Drawdown Check ──────────────────────────────────

export function checkDrawdown(
  currentValue: number,
  peakValue: number,
  config: AutoTradeConfig
): { halt: boolean; drawdownPct: number; reason: string } {
  if (peakValue <= 0) return { halt: false, drawdownPct: 0, reason: "No peak value recorded" };

  const drawdownPct = ((peakValue - currentValue) / peakValue) * 100;

  if (drawdownPct > config.maxDrawdown) {
    return {
      halt: true,
      drawdownPct,
      reason: `Max drawdown breached: ${drawdownPct.toFixed(1)}% > ${config.maxDrawdown}% limit`,
    };
  }

  return {
    halt: false,
    drawdownPct,
    reason: `Drawdown: ${drawdownPct.toFixed(1)}% (limit: ${config.maxDrawdown}%)`,
  };
}
