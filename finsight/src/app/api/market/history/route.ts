import { NextRequest, NextResponse } from "next/server";
import { fetchDailyPrices } from "@/lib/api/alpha-vantage";
import { getMockHistory } from "@/services/market-data";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "Missing ?symbol= parameter" }, { status: 400 });
  }

  const range = req.nextUrl.searchParams.get("range") || "1Y";
  const outputSize = ["5Y", "MAX"].includes(range) ? "full" : "compact";

  const liveData = await fetchDailyPrices(symbol.toUpperCase(), outputSize as "compact" | "full");
  if (liveData && liveData.length > 0) {
    // Filter by range
    const filtered = filterByRange(liveData, range);
    return NextResponse.json(filtered);
  }

  // Fallback to mock
  const mock = getMockHistory(symbol.toUpperCase());
  return NextResponse.json(mock);
}

function filterByRange(
  data: { date: string; open: number; high: number; low: number; close: number; volume: number }[],
  range: string
) {
  const now = new Date();
  const cutoff = new Date();

  switch (range) {
    case "1M": cutoff.setMonth(now.getMonth() - 1); break;
    case "3M": cutoff.setMonth(now.getMonth() - 3); break;
    case "6M": cutoff.setMonth(now.getMonth() - 6); break;
    case "1Y": cutoff.setFullYear(now.getFullYear() - 1); break;
    case "5Y": cutoff.setFullYear(now.getFullYear() - 5); break;
    default: return data;
  }

  return data.filter((d) => new Date(d.date) >= cutoff);
}
