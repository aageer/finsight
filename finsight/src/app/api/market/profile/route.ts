import { NextRequest, NextResponse } from "next/server";
import { fetchCompanyOverview } from "@/lib/api/alpha-vantage";
import { getMockProfile } from "@/services/market-data";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "Missing ?symbol= parameter" }, { status: 400 });
  }

  const liveProfile = await fetchCompanyOverview(symbol.toUpperCase());
  if (liveProfile) {
    return NextResponse.json(liveProfile);
  }

  const mock = getMockProfile(symbol.toUpperCase());
  return NextResponse.json(mock);
}
