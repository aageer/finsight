/**
 * Alpha Vantage API Client (Server-Side Only)
 * Free tier: 25 requests/day — we cache aggressively and fall back to mock data.
 */

import { getCached, setCache, TTL } from "./cache";
import type { StockQuote, NewsArticle, OHLCV, CompanyProfile } from "@/types";

const BASE = "https://www.alphavantage.co/query";

function getApiKey(): string {
  return process.env.ALPHA_VANTAGE_API_KEY || "demo";
}

// ─── Request Queue (Alpha Vantage: 1 req/sec limit) ──
let lastRequestTime = 0;
const REQUEST_SPACING_MS = 1200; // 1.2s between requests

async function waitForSlot(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < REQUEST_SPACING_MS) {
    await new Promise((r) => setTimeout(r, REQUEST_SPACING_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

async function avFetch(params: Record<string, string>): Promise<Record<string, unknown> | null> {
  const apiKey = getApiKey();
  const url = new URL(BASE);
  url.searchParams.set("apikey", apiKey);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  await waitForSlot();

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    // Alpha Vantage returns a "Note" or "Information" key when rate-limited
    if (data["Note"] || data["Information"]) {
      console.warn("[AlphaVantage] Rate limited:", data["Note"] || data["Information"]);
      return null;
    }
    return data;
  } catch (err) {
    console.error("[AlphaVantage] Fetch error:", err);
    return null;
  }
}

// ─── GLOBAL QUOTE ─────────────────────────────────────
export async function fetchQuote(symbol: string): Promise<StockQuote | null> {
  const cacheKey = `quote:${symbol}`;
  const cached = getCached<StockQuote>(cacheKey);
  if (cached) return cached;

  const data = await avFetch({ function: "GLOBAL_QUOTE", symbol });
  if (!data || !data["Global Quote"]) return null;

  const q = data["Global Quote"] as Record<string, string>;
  const quote: StockQuote = {
    symbol: q["01. symbol"] || symbol,
    name: symbol, // AV doesn't return name in quote
    price: parseFloat(q["05. price"]) || 0,
    change: parseFloat(q["09. change"]) || 0,
    changePercent: parseFloat((q["10. change percent"] || "0").replace("%", "")) || 0,
    volume: parseInt(q["06. volume"]) || 0,
    avgVolume: 0,
    marketCap: 0,
    pe: null,
    eps: null,
    high52w: 0,
    low52w: 0,
    open: parseFloat(q["02. open"]) || 0,
    previousClose: parseFloat(q["08. previous close"]) || 0,
    dayHigh: parseFloat(q["03. high"]) || 0,
    dayLow: parseFloat(q["04. low"]) || 0,
    timestamp: q["07. latest trading day"] || new Date().toISOString(),
  };

  setCache(cacheKey, quote, TTL.QUOTE);
  return quote;
}

// ─── TIME SERIES DAILY ────────────────────────────────
export async function fetchDailyPrices(
  symbol: string,
  outputSize: "compact" | "full" = "compact"
): Promise<OHLCV[] | null> {
  const cacheKey = `history:${symbol}:${outputSize}`;
  const cached = getCached<OHLCV[]>(cacheKey);
  if (cached) return cached;

  const data = await avFetch({
    function: "TIME_SERIES_DAILY",
    symbol,
    outputsize: outputSize,
  });

  if (!data || !data["Time Series (Daily)"]) return null;

  const timeSeries = data["Time Series (Daily)"] as Record<string, Record<string, string>>;
  const ohlcv: OHLCV[] = Object.entries(timeSeries)
    .map(([date, vals]) => ({
      date,
      open: parseFloat(vals["1. open"]),
      high: parseFloat(vals["2. high"]),
      low: parseFloat(vals["3. low"]),
      close: parseFloat(vals["4. close"]),
      volume: parseInt(vals["5. volume"]),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  setCache(cacheKey, ohlcv, TTL.HISTORY);
  return ohlcv;
}

// ─── COMPANY OVERVIEW ─────────────────────────────────
export async function fetchCompanyOverview(symbol: string): Promise<CompanyProfile | null> {
  const cacheKey = `profile:${symbol}`;
  const cached = getCached<CompanyProfile>(cacheKey);
  if (cached) return cached;

  const data = await avFetch({ function: "OVERVIEW", symbol });
  if (!data || !data["Symbol"]) return null;

  const d = data as Record<string, string>;
  const profile: CompanyProfile = {
    symbol: d["Symbol"],
    name: d["Name"] || symbol,
    sector: d["Sector"] || "Unknown",
    industry: d["Industry"] || "Unknown",
    description: d["Description"] || "",
    ceo: "",
    employees: parseInt(d["FullTimeEmployees"]) || 0,
    headquarters: `${d["Address"] || ""}, ${d["Country"] || ""}`.trim(),
    website: "",
    marketCap: parseInt(d["MarketCapitalization"]) || 0,
    exchange: d["Exchange"] || "",
  };

  setCache(cacheKey, profile, TTL.PROFILE);
  return profile;
}

// ─── NEWS SENTIMENT ───────────────────────────────────
export async function fetchNews(symbol?: string): Promise<NewsArticle[] | null> {
  const cacheKey = `news:${symbol || "general"}`;
  const cached = getCached<NewsArticle[]>(cacheKey);
  if (cached) return cached;

  const params: Record<string, string> = {
    function: "NEWS_SENTIMENT",
    sort: "LATEST",
    limit: "10",
  };
  if (symbol) params.tickers = symbol;

  const data = await avFetch(params);
  if (!data || !data["feed"]) return null;

  const feed = data["feed"] as Array<Record<string, unknown>>;
  const articles: NewsArticle[] = feed.slice(0, 10).map((item) => {
    const sentimentScore =
      typeof item["overall_sentiment_score"] === "number"
        ? item["overall_sentiment_score"]
        : parseFloat(String(item["overall_sentiment_score"] || "0"));

    let sentiment: NewsArticle["sentiment"] = "neutral";
    if (sentimentScore > 0.15) sentiment = "bullish";
    else if (sentimentScore < -0.15) sentiment = "bearish";

    const tickerSentiments = (item["ticker_sentiment"] as Array<Record<string, string>>) || [];
    const relatedSymbols = tickerSentiments.map((t) => t["ticker"]).filter(Boolean);

    return {
      title: String(item["title"] || ""),
      summary: String(item["summary"] || ""),
      source: String(item["source"] || "Unknown"),
      url: String(item["url"] || "#"),
      publishedAt: String(item["time_published"] || new Date().toISOString()),
      sentiment,
      relatedSymbols,
    };
  });

  setCache(cacheKey, articles, TTL.NEWS);
  return articles;
}

// ─── SYMBOL SEARCH ────────────────────────────────────
export interface SymbolSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  matchScore: string;
}

export async function searchSymbol(query: string): Promise<SymbolSearchResult[]> {
  const cacheKey = `search:${query}`;
  const cached = getCached<SymbolSearchResult[]>(cacheKey);
  if (cached) return cached;

  const data = await avFetch({ function: "SYMBOL_SEARCH", keywords: query });
  if (!data || !data["bestMatches"]) return [];

  const matches = data["bestMatches"] as Array<Record<string, string>>;
  const results: SymbolSearchResult[] = matches.map((m) => ({
    symbol: m["1. symbol"],
    name: m["2. name"],
    type: m["3. type"],
    region: m["4. region"],
    matchScore: m["9. matchScore"],
  }));

  setCache(cacheKey, results, TTL.SEARCH);
  return results;
}
