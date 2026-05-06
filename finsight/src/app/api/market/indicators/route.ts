/**
 * GET /api/market/indicators?symbol=AAPL
 * Computes all quant indicators for a given symbol using price history.
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchDailyPrices } from "@/lib/api/alpha-vantage";
import { getMockHistory } from "@/services/market-data";
import { computeAllIndicators } from "@/lib/quant/indicators";
import { getCached, setCache, TTL } from "@/lib/api/cache";
import type { AllIndicators } from "@/lib/quant/indicators";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "Missing ?symbol= parameter" }, { status: 400 });
  }

  const sym = symbol.toUpperCase();
  const cacheKey = `indicators:${sym}`;
  const cached = getCached<AllIndicators>(cacheKey);
  if (cached) return NextResponse.json(cached);

  // Get price history
  const history = await fetchDailyPrices(sym, "full") || getMockHistory(sym);
  const closePrices = history.map((d) => d.close);

  if (closePrices.length < 30) {
    return NextResponse.json({ error: "Not enough price data" }, { status: 400 });
  }

  const indicators = computeAllIndicators(closePrices);
  setCache(cacheKey, indicators, TTL.HISTORY);

  return NextResponse.json(indicators);
}
