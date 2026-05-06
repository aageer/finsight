/**
 * ATLAS Pipeline API Route
 * Runs the full 4-layer ATLAS pipeline and returns trade signals.
 */

import { NextRequest, NextResponse } from "next/server";
import { runATLASPipeline } from "@/lib/agents/atlas-conductor";
import type { NewsArticle, StockQuote } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { news = [], quotes = {} } = body as {
      news?: NewsArticle[];
      quotes?: Record<string, StockQuote>;
    };

    const result = await runATLASPipeline(news, quotes);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[ATLAS API] Pipeline error:", error);
    return NextResponse.json(
      { error: "ATLAS pipeline failed", message: String(error) },
      { status: 500 }
    );
  }
}
