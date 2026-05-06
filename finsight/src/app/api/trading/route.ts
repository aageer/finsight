/**
 * Trading API Routes
 * Execute trades, manage positions, account info, and kill-switch.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAccount,
  getPositions,
  getOrders,
  killSwitch,
  isAlpacaConfigured,
  formatAccountForDisplay,
} from "@/lib/trading/alpaca-client";
import { executeSignals, getDefaultTradeConfig } from "@/lib/trading/trade-executor";
import type { TradingMode, TradeSignal, AutoTradeConfig } from "@/types/agent-types";

// GET /api/trading — account overview
export async function GET(req: NextRequest) {
  const mode = (req.nextUrl.searchParams.get("mode") as TradingMode) || "PAPER";

  if (!isAlpacaConfigured()) {
    // Return mock data for development
    return NextResponse.json({
      configured: false,
      account: {
        portfolioValue: 100_000,
        buyingPower: 80_000,
        cash: 80_000,
        equity: 100_000,
        dayTradeCount: 0,
        pnlToday: 0,
        pnlTodayPercent: 0,
      },
      positions: [],
      orders: [],
      message: "Alpaca not configured — using simulated data",
    });
  }

  try {
    const [account, positions, orders] = await Promise.all([
      getAccount(mode),
      getPositions(mode),
      getOrders("all", 20, mode),
    ]);

    return NextResponse.json({
      configured: true,
      account: account ? formatAccountForDisplay(account) : null,
      positions: positions.map((p) => ({
        symbol: p.symbol,
        qty: Number(p.qty),
        side: p.side,
        marketValue: Number(p.market_value),
        costBasis: Number(p.cost_basis),
        unrealizedPnl: Number(p.unrealized_pl),
        unrealizedPnlPct: Number(p.unrealized_plpc) * 100,
        currentPrice: Number(p.current_price),
        avgEntryPrice: Number(p.avg_entry_price),
      })),
      orders: orders.slice(0, 20).map((o) => ({
        id: o.id,
        symbol: o.symbol,
        side: o.side,
        type: o.type,
        qty: Number(o.qty),
        filledQty: Number(o.filled_qty),
        filledPrice: o.filled_avg_price ? Number(o.filled_avg_price) : null,
        status: o.status,
        createdAt: o.created_at,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch trading data", message: String(error) },
      { status: 500 }
    );
  }
}

// POST /api/trading — execute signals or trigger kill-switch
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, signals, config, mode } = body as {
      action: "execute" | "kill-switch";
      signals?: TradeSignal[];
      config?: AutoTradeConfig;
      mode?: TradingMode;
    };

    if (action === "kill-switch") {
      if (!isAlpacaConfigured()) {
        return NextResponse.json({
          success: true,
          message: "Kill switch activated (simulated — Alpaca not configured)",
        });
      }
      const result = await killSwitch(mode || "PAPER");
      return NextResponse.json({
        success: true,
        ...result,
        message: "Kill switch activated — all orders cancelled, all positions closed",
      });
    }

    if (action === "execute" && signals) {
      const tradeConfig = config || getDefaultTradeConfig();

      if (!isAlpacaConfigured()) {
        // Simulate executions for development
        const mockExecutions = signals.map((s, i) => ({
          id: `mock-${Date.now()}-${i}`,
          signalId: `${s.symbol}-${Date.now()}`,
          symbol: s.symbol,
          direction: s.direction,
          quantity: Math.floor((tradeConfig.maxPerTrade / 150) * (s.conviction / 100)),
          price: 0,
          totalValue: tradeConfig.maxPerTrade * (s.conviction / 100),
          status: "FILLED" as const,
          contributingAgents: s.contributingAgents,
          executedAt: new Date().toISOString(),
        }));

        return NextResponse.json({
          success: true,
          simulated: true,
          executions: mockExecutions,
          message: "Simulated execution — configure Alpaca for real trades",
        });
      }

      const executions = await executeSignals(signals, tradeConfig);
      return NextResponse.json({
        success: true,
        simulated: false,
        executions,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Trading action failed", message: String(error) },
      { status: 500 }
    );
  }
}
