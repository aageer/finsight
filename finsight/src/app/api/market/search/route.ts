import { NextRequest, NextResponse } from "next/server";
import { searchSymbol } from "@/lib/api/alpha-vantage";

const FALLBACK_SYMBOLS = [
  { symbol: "AAPL", name: "Apple Inc", type: "Equity", region: "United States", matchScore: "1.0" },
  { symbol: "MSFT", name: "Microsoft Corporation", type: "Equity", region: "United States", matchScore: "1.0" },
  { symbol: "NVDA", name: "NVIDIA Corporation", type: "Equity", region: "United States", matchScore: "1.0" },
  { symbol: "GOOGL", name: "Alphabet Inc", type: "Equity", region: "United States", matchScore: "1.0" },
  { symbol: "AMZN", name: "Amazon.com Inc", type: "Equity", region: "United States", matchScore: "1.0" },
  { symbol: "META", name: "Meta Platforms Inc", type: "Equity", region: "United States", matchScore: "1.0" },
  { symbol: "TSLA", name: "Tesla Inc", type: "Equity", region: "United States", matchScore: "1.0" },
  { symbol: "JPM", name: "JPMorgan Chase & Co", type: "Equity", region: "United States", matchScore: "1.0" },
  { symbol: "V", name: "Visa Inc", type: "Equity", region: "United States", matchScore: "1.0" },
  { symbol: "WMT", name: "Walmart Inc", type: "Equity", region: "United States", matchScore: "1.0" },
];

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  const results = await searchSymbol(query);
  if (results.length > 0) {
    return NextResponse.json(results);
  }

  // Fallback: filter from hardcoded list
  const filtered = FALLBACK_SYMBOLS.filter(
    (s) =>
      s.symbol.toLowerCase().includes(query.toLowerCase()) ||
      s.name.toLowerCase().includes(query.toLowerCase())
  );
  return NextResponse.json(filtered);
}
