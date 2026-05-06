import { NextRequest, NextResponse } from "next/server";
import { fetchQuote, fetchCompanyOverview } from "@/lib/api/alpha-vantage";
import { getMockQuote } from "@/services/market-data";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "Missing ?symbol= parameter" }, { status: 400 });
  }

  const sym = symbol.toUpperCase();

  // Try live data first, fall back to mock
  const liveQuote = await fetchQuote(sym);
  if (liveQuote) {
    // Enrich with profile data (market cap, P/E, etc.)
    const profile = await fetchCompanyOverview(sym);
    if (profile) {
      liveQuote.name = profile.name;
      liveQuote.marketCap = profile.marketCap;
    }
    return NextResponse.json(liveQuote);
  }

  // Fallback to mock data
  const mock = getMockQuote(sym);
  return NextResponse.json(mock);
}
