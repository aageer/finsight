/**
 * Alpaca Markets API Client
 * ─────────────────────────
 * REST client for paper and live trading via Alpaca.
 * Paper trading is default (no real money).
 * Uses fetch — no SDK dependency.
 */

import type { TradingMode } from "@/types/agent-types";

// ─── Types ───────────────────────────────────────────────

export interface AlpacaAccount {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  buying_power: string;
  cash: string;
  portfolio_value: string;
  equity: string;
  last_equity: string;
  long_market_value: string;
  short_market_value: string;
  daytrade_count: number;
  pattern_day_trader: boolean;
}

export interface AlpacaPosition {
  asset_id: string;
  symbol: string;
  qty: string;
  qty_available: string;
  side: "long" | "short";
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  current_price: string;
  avg_entry_price: string;
  change_today: string;
}

export interface AlpacaOrder {
  id: string;
  client_order_id: string;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit" | "stop" | "stop_limit";
  time_in_force: "day" | "gtc" | "ioc" | "fok";
  qty: string;
  filled_qty: string;
  filled_avg_price: string | null;
  status: string;
  created_at: string;
  submitted_at: string;
  filled_at: string | null;
}

export interface OrderRequest {
  symbol: string;
  qty: number;
  side: "buy" | "sell";
  type: "market" | "limit";
  time_in_force: "day" | "gtc";
  limit_price?: number;
}

// ─── Client ──────────────────────────────────────────────

const PAPER_URL = "https://paper-api.alpaca.markets";
const LIVE_URL = "https://api.alpaca.markets";

function getBaseUrl(mode: TradingMode): string {
  return mode === "LIVE" ? LIVE_URL : PAPER_URL;
}

async function alpacaFetch<T>(
  path: string,
  method: string = "GET",
  body?: unknown,
  apiKey?: string,
  secretKey?: string,
  mode: TradingMode = "PAPER"
): Promise<T | null> {
  const key = apiKey || process.env.ALPACA_API_KEY;
  const secret = secretKey || process.env.ALPACA_SECRET_KEY;

  if (!key || !secret) {
    console.warn("[Alpaca] API keys not configured");
    return null;
  }

  const baseUrl = getBaseUrl(mode);

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        "APCA-API-KEY-ID": key,
        "APCA-API-SECRET-KEY": secret,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Alpaca] ${method} ${path} failed:`, res.status, errText);
      return null;
    }

    // Some endpoints return 204 No Content
    if (res.status === 204) return null;

    return (await res.json()) as T;
  } catch (error) {
    console.error(`[Alpaca] ${method} ${path} error:`, error);
    return null;
  }
}

// ─── Account ─────────────────────────────────────────────

export async function getAccount(mode: TradingMode = "PAPER"): Promise<AlpacaAccount | null> {
  return alpacaFetch<AlpacaAccount>("/v2/account", "GET", undefined, undefined, undefined, mode);
}

// ─── Positions ───────────────────────────────────────────

export async function getPositions(mode: TradingMode = "PAPER"): Promise<AlpacaPosition[]> {
  const result = await alpacaFetch<AlpacaPosition[]>("/v2/positions", "GET", undefined, undefined, undefined, mode);
  return result || [];
}

export async function getPosition(symbol: string, mode: TradingMode = "PAPER"): Promise<AlpacaPosition | null> {
  return alpacaFetch<AlpacaPosition>(`/v2/positions/${symbol}`, "GET", undefined, undefined, undefined, mode);
}

// ─── Orders ──────────────────────────────────────────────

export async function submitOrder(order: OrderRequest, mode: TradingMode = "PAPER"): Promise<AlpacaOrder | null> {
  return alpacaFetch<AlpacaOrder>("/v2/orders", "POST", order, undefined, undefined, mode);
}

export async function getOrders(
  status: "open" | "closed" | "all" = "all",
  limit: number = 50,
  mode: TradingMode = "PAPER"
): Promise<AlpacaOrder[]> {
  const result = await alpacaFetch<AlpacaOrder[]>(
    `/v2/orders?status=${status}&limit=${limit}&direction=desc`,
    "GET",
    undefined,
    undefined,
    undefined,
    mode
  );
  return result || [];
}

export async function cancelOrder(orderId: string, mode: TradingMode = "PAPER"): Promise<void> {
  await alpacaFetch(`/v2/orders/${orderId}`, "DELETE", undefined, undefined, undefined, mode);
}

export async function cancelAllOrders(mode: TradingMode = "PAPER"): Promise<void> {
  await alpacaFetch("/v2/orders", "DELETE", undefined, undefined, undefined, mode);
}

// ─── Kill Switch ─────────────────────────────────────────

export async function killSwitch(mode: TradingMode = "PAPER"): Promise<{ cancelled: boolean; closedPositions: boolean }> {
  // 1. Cancel all open orders
  await cancelAllOrders(mode);

  // 2. Close all positions
  await alpacaFetch("/v2/positions", "DELETE", undefined, undefined, undefined, mode);

  return { cancelled: true, closedPositions: true };
}

// ─── Helpers ─────────────────────────────────────────────

export function isAlpacaConfigured(): boolean {
  return !!(process.env.ALPACA_API_KEY && process.env.ALPACA_SECRET_KEY);
}

export function formatAccountForDisplay(account: AlpacaAccount) {
  return {
    portfolioValue: Number(account.portfolio_value),
    buyingPower: Number(account.buying_power),
    cash: Number(account.cash),
    equity: Number(account.equity),
    dayTradeCount: account.daytrade_count,
    pnlToday: Number(account.equity) - Number(account.last_equity),
    pnlTodayPercent:
      Number(account.last_equity) > 0
        ? ((Number(account.equity) - Number(account.last_equity)) / Number(account.last_equity)) * 100
        : 0,
  };
}
