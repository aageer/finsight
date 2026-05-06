/**
 * POST /api/analysis — Main AI Analysis Endpoint
 * Runs the full multi-agent pipeline and streams progress via SSE.
 */

import { NextRequest, NextResponse } from "next/server";
import { runAnalysisPipeline } from "@/lib/agents/conductor";
import { fetchQuote, fetchCompanyOverview, fetchDailyPrices, fetchNews } from "@/lib/api/alpha-vantage";
import { getMockQuote, getMockProfile, getMockHistory, getMockNews } from "@/services/market-data";
import { getCached, setCache, TTL } from "@/lib/api/cache";
import type { FinSightAnalysis } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const symbol = (body.symbol || "").toUpperCase();

    if (!symbol) {
      return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
    }

    // Check cache first
    const cacheKey = `analysis:${symbol}`;
    const cached = getCached<FinSightAnalysis>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Fetch all data (live → mock fallback)
    const [quote, profile, history, news] = await Promise.all([
      fetchQuote(symbol).then((r) => r || getMockQuote(symbol)),
      fetchCompanyOverview(symbol).then((r) => r || getMockProfile(symbol)),
      fetchDailyPrices(symbol).then((r) => r || getMockHistory(symbol)),
      fetchNews(symbol).then((r) => r || getMockNews()),
    ]);

    // Run the full multi-agent pipeline
    const analysis = await runAnalysisPipeline(
      quote,
      profile,
      history,
      news
    );

    // Cache for 4 hours
    setCache(cacheKey, analysis, TTL.ANALYSIS);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("[Analysis API] Error:", error);
    return NextResponse.json(
      { error: "Analysis pipeline failed. Check server logs." },
      { status: 500 }
    );
  }
}
