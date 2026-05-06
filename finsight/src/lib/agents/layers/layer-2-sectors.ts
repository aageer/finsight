/**
 * Layer 2 — Sector Desk Agents
 * ─────────────────────────────
 * 5 sector-specialist agents receive the macro regime from Layer 1
 * and produce sector-level picks with conviction scores.
 */

import { callGemini, getGeminiFlash } from "../gemini-client";
import type {
  ATLASAgent,
  SectorAgentOutput,
  SectorAgentRole,
  SectorPick,
  MacroRegime,
  Layer2Output,
} from "@/types/agent-types";
import type { StockQuote } from "@/types";

// ─── Agent Definitions ───────────────────────────────────

export const SECTOR_AGENTS: ATLASAgent[] = [
  {
    id: "sector-tech-semi",
    name: "TechSemiconductorAgent",
    layer: "SECTOR",
    role: "Technology & Semiconductor Analyst",
    description: "Covers NVDA, AMD, AVGO, INTC, semiconductor cycle",
    status: "IDLE",
    darwinianWeight: 1.0,
    prompt: `You are the TechSemiconductorAgent at FinSight ATLAS. You cover the technology and semiconductor sector. You track AI/ML capex cycles, foundry capacity, chip demand curves, cloud infrastructure spending, and key players: NVDA, AMD, AVGO, INTC, TSM, QCOM, MRVL.`,
  },
  {
    id: "sector-energy",
    name: "EnergyAgent",
    layer: "SECTOR",
    role: "Energy & Commodities Analyst",
    description: "Oil, nat gas, energy transition, clean energy",
    status: "IDLE",
    darwinianWeight: 1.0,
    prompt: `You are the EnergyAgent at FinSight ATLAS. You cover the energy sector: oil (WTI, Brent), natural gas, OPEC dynamics, US shale production, and the energy transition. Key tickers: XOM, CVX, COP, SLB, OXY, ENPH, FSLR.`,
  },
  {
    id: "sector-financials",
    name: "FinancialsAgent",
    layer: "SECTOR",
    role: "Financial Sector Analyst",
    description: "Banks, insurance, fintech, rate sensitivity",
    status: "IDLE",
    darwinianWeight: 1.0,
    prompt: `You are the FinancialsAgent at FinSight ATLAS. You cover banks, insurance, and financial services. You analyze net interest margins, credit quality, loan growth, capital ratios, and rate sensitivity. Key tickers: JPM, BAC, GS, MS, BRK.B, V, MA.`,
  },
  {
    id: "sector-consumer",
    name: "ConsumerAgent",
    layer: "SECTOR",
    role: "Consumer & Retail Analyst",
    description: "Discretionary vs staples, retail trends, consumer health",
    status: "IDLE",
    darwinianWeight: 1.0,
    prompt: `You are the ConsumerAgent at FinSight ATLAS. You cover consumer discretionary and staples. You track consumer confidence, spending trends, e-commerce penetration, and margin pressures. Key tickers: AMZN, COST, WMT, NKE, SBUX, PG, KO.`,
  },
  {
    id: "sector-healthcare",
    name: "HealthcareAgent",
    layer: "SECTOR",
    role: "Healthcare & Biotech Analyst",
    description: "Pharma, biotech, medical devices, FDA catalysts",
    status: "IDLE",
    darwinianWeight: 1.0,
    prompt: `You are the HealthcareAgent at FinSight ATLAS. You cover healthcare: big pharma, biotech, medical devices, and managed care. You track FDA approvals, patent cliffs, pipeline catalysts, and GLP-1 drug trends. Key tickers: LLY, UNH, JNJ, ABBV, MRK, ISRG.`,
  },
];

// ─── Run Individual Sector Agent ─────────────────────────

async function runSectorAgent(
  agent: ATLASAgent,
  role: SectorAgentRole,
  regime: MacroRegime,
  regimeContext: string,
  quotes: StockQuote[]
): Promise<SectorAgentOutput> {
  const model = getGeminiFlash();

  const stockData = quotes
    .slice(0, 8)
    .map(
      (q) =>
        `${q.symbol}: $${q.price.toFixed(2)} (${q.changePercent >= 0 ? "+" : ""}${q.changePercent.toFixed(2)}%) P/E: ${q.pe || "N/A"} MCap: $${(q.marketCap / 1e9).toFixed(0)}B`
    )
    .join("\n");

  const prompt = `${agent.prompt}

MACRO REGIME FROM LAYER 1: ${regime}
REGIME CONTEXT: ${regimeContext}

SECTOR STOCK DATA:
${stockData || "Market data unavailable — use your general knowledge of current sector dynamics."}

Given the macro regime is ${regime}, analyze your sector and provide:
1. Your sector outlook (overweight/neutral/underweight)
2. Your top picks with conviction and direction

Respond in JSON:
{
  "sectorOutlook": "OVERWEIGHT" | "NEUTRAL" | "UNDERWEIGHT",
  "confidence": 0.0 to 1.0,
  "assessment": "2-3 sentence sector assessment given the macro regime",
  "topPicks": [
    {
      "symbol": "TICKER",
      "conviction": 0 to 100,
      "direction": "LONG" | "SHORT" | "FLAT",
      "thesis": "1-2 sentence thesis",
      "catalysts": ["catalyst1", "catalyst2"],
      "risks": ["risk1"]
    }
  ],
  "score": -100 to +100
}

Provide 2-4 picks sorted by conviction. Be specific about why given the ${regime} regime.`;

  const result = await callGemini<SectorAgentOutput>(model, prompt, agent.name);

  return result.data || {
    agentId: agent.id,
    role,
    sectorOutlook: "NEUTRAL",
    confidence: 0.3,
    assessment: `${agent.name}: Unable to generate sector analysis.`,
    topPicks: [],
    score: 0,
  };
}

// ─── Run All Layer 2 Agents ──────────────────────────────

export async function runLayer2(
  regime: MacroRegime,
  regimeContext: string,
  sectorQuotes: Record<string, StockQuote[]>
): Promise<Layer2Output> {
  const roles: SectorAgentRole[] = [
    "TECH_SEMICONDUCTOR",
    "ENERGY",
    "FINANCIALS",
    "CONSUMER",
    "HEALTHCARE",
  ];

  const roleToKey: Record<SectorAgentRole, string> = {
    TECH_SEMICONDUCTOR: "tech",
    ENERGY: "energy",
    FINANCIALS: "financials",
    CONSUMER: "consumer",
    HEALTHCARE: "healthcare",
  };

  // Run all sector agents in parallel
  const results = await Promise.allSettled(
    SECTOR_AGENTS.map((agent, i) =>
      runSectorAgent(
        agent,
        roles[i],
        regime,
        regimeContext,
        sectorQuotes[roleToKey[roles[i]]] || []
      )
    )
  );

  const sectorOutputs: SectorAgentOutput[] = results.map((result, i) => {
    if (result.status === "fulfilled") {
      return { ...result.value, agentId: SECTOR_AGENTS[i].id, role: roles[i] };
    }
    return {
      agentId: SECTOR_AGENTS[i].id,
      role: roles[i],
      sectorOutlook: "NEUTRAL" as const,
      confidence: 0.3,
      assessment: `${SECTOR_AGENTS[i].name} failed to execute.`,
      topPicks: [],
      score: 0,
    };
  });

  // Collect all picks from all sectors
  const allPicks: SectorPick[] = sectorOutputs.flatMap((o) => o.topPicks);

  return {
    regime,
    sectorOutputs,
    allPicks,
    timestamp: new Date().toISOString(),
  };
}
