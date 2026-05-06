import { NextRequest, NextResponse } from "next/server";
import { fetchNews } from "@/lib/api/alpha-vantage";
import { getMockNews } from "@/services/market-data";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") || undefined;

  const liveNews = await fetchNews(symbol?.toUpperCase());
  if (liveNews && liveNews.length > 0) {
    return NextResponse.json(liveNews);
  }

  const mock = getMockNews();
  return NextResponse.json(mock);
}
