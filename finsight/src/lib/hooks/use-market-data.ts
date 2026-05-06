/**
 * TanStack Query hooks for market data — with SWR pattern.
 * All hooks auto-fallback to mock data via API routes.
 */
"use client";

import { useQuery } from "@tanstack/react-query";
import type { StockQuote, OHLCV, CompanyProfile, NewsArticle } from "@/types";
import type { SymbolSearchResult } from "@/lib/api/alpha-vantage";
import type { AllIndicators } from "@/lib/quant/indicators";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ─── Quote ────────────────────────────────────────────
export function useQuote(symbol: string | null) {
  return useQuery<StockQuote>({
    queryKey: ["quote", symbol],
    queryFn: () => fetchJson(`/api/market/quote?symbol=${symbol}`),
    enabled: !!symbol,
    refetchInterval: 60_000, // refresh every 60s
    staleTime: 30_000,
  });
}

// ─── Price History ────────────────────────────────────
export function useHistory(symbol: string | null, range = "1Y") {
  return useQuery<OHLCV[]>({
    queryKey: ["history", symbol, range],
    queryFn: () => fetchJson(`/api/market/history?symbol=${symbol}&range=${range}`),
    enabled: !!symbol,
    staleTime: 5 * 60_000,
  });
}

// ─── Company Profile ──────────────────────────────────
export function useProfile(symbol: string | null) {
  return useQuery<CompanyProfile>({
    queryKey: ["profile", symbol],
    queryFn: () => fetchJson(`/api/market/profile?symbol=${symbol}`),
    enabled: !!symbol,
    staleTime: 24 * 60 * 60_000, // cache 24h
  });
}

// ─── News ─────────────────────────────────────────────
export function useNews(symbol?: string | null) {
  const url = symbol
    ? `/api/market/news?symbol=${symbol}`
    : `/api/market/news`;

  return useQuery<NewsArticle[]>({
    queryKey: ["news", symbol || "general"],
    queryFn: () => fetchJson(url),
    staleTime: 5 * 60_000,
  });
}

// ─── Symbol Search ────────────────────────────────────
export function useSearch(query: string) {
  return useQuery<SymbolSearchResult[]>({
    queryKey: ["search", query],
    queryFn: () => fetchJson(`/api/market/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 1,
    staleTime: 60_000,
  });
}

// ─── Quant Indicators ─────────────────────────────────
export function useIndicators(symbol: string | null) {
  return useQuery<AllIndicators>({
    queryKey: ["indicators", symbol],
    queryFn: () => fetchJson(`/api/market/indicators?symbol=${symbol}`),
    enabled: !!symbol,
    staleTime: 5 * 60_000,
  });
}

// ─── Batch Quotes (shared cache — prevents duplicate fetch storms) ──
// PERF FIX: Both MarketTicker and DashboardPage use this single hook
// instead of each firing their own 7 raw fetch() calls on mount.
async function fetchBatchQuotes(symbols: string[]): Promise<Record<string, StockQuote>> {
  const results: Record<string, StockQuote> = {};
  for (let i = 0; i < symbols.length; i++) {
    try {
      const res = await fetch(`/api/market/quote?symbol=${symbols[i]}`);
      if (res.ok) {
        const data = await res.json();
        results[symbols[i]] = data;
      }
    } catch {
      // Skip failed fetches, will use mock
    }
    // Rate-limit: wait 500ms between fetches to avoid hammering
    if (i < symbols.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return results;
}

export function useBatchQuotes(symbols: string[]) {
  const key = symbols.slice().sort().join(",");
  return useQuery<Record<string, StockQuote>>({
    queryKey: ["batch-quotes", key],
    queryFn: () => fetchBatchQuotes(symbols),
    enabled: symbols.length > 0,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

