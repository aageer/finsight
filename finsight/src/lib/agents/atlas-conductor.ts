/**
 * ATLAS Conductor — 4-Layer Sequential Pipeline
 * ──────────────────────────────────────────────
 * Orchestrates the full ATLAS pipeline:
 *   Layer 1 (Macro) → Layer 2 (Sectors) → Layer 3 (Superinvestors) → Layer 4 (Decision)
 *
 * The original conductor.ts is preserved as the single-stock analysis pipeline.
 * This is the portfolio-level ATLAS pipeline for autonomous trading.
 */

import { runLayer1, MACRO_AGENTS } from "./layers/layer-1-macro";
import { runLayer2, SECTOR_AGENTS } from "./layers/layer-2-sectors";
import { runLayer3, SUPERINVESTOR_AGENTS } from "./layers/layer-3-superinvestors";
import { runLayer4, DECISION_AGENTS } from "./layers/layer-4-decision";
import {
  initializeWeights,
  loadWeights,
  saveWeights,
  updateWeightsDarwinian,
} from "./darwinian-weights";
import type {
  ATLASAgent,
  ATLASPipelineOutput,
  Layer1Output,
  Layer2Output,
  Layer3Output,
  Layer4Output,
  DarwinianWeight,
} from "@/types/agent-types";
import type { NewsArticle, StockQuote } from "@/types";

// ─── All Agents Registry ─────────────────────────────────

export function getAllAgents(): ATLASAgent[] {
  return [
    ...MACRO_AGENTS,
    ...SECTOR_AGENTS,
    ...SUPERINVESTOR_AGENTS,
    ...DECISION_AGENTS,
  ];
}

export function getAgentCount(): number {
  return getAllAgents().length;
}

// ─── Progress Event Types ────────────────────────────────

export type ATLASProgressStage =
  | "init"
  | "layer1"
  | "layer2"
  | "layer3"
  | "layer4-cro"
  | "layer4-alpha"
  | "layer4-cio"
  | "darwinian"
  | "complete"
  | "error";

export type ATLASProgressCallback = (
  stage: ATLASProgressStage,
  status: "running" | "complete" | "error",
  data?: {
    message?: string;
    agentCount?: number;
    layerOutput?: Layer1Output | Layer2Output | Layer3Output | Layer4Output;
    pipelineOutput?: ATLASPipelineOutput;
    error?: string;
  }
) => void;

// ─── Generate Market Context ─────────────────────────────

function generateMarketContext(
  news: NewsArticle[],
  quotes?: Record<string, StockQuote>
): string {
  const quoteLines = quotes
    ? Object.entries(quotes)
        .slice(0, 10)
        .map(
          ([sym, q]) =>
            `${sym}: $${q.price.toFixed(2)} (${q.changePercent >= 0 ? "+" : ""}${q.changePercent.toFixed(2)}%)`
        )
        .join(", ")
    : "No live quotes available";

  const sentimentBreakdown = news.reduce(
    (acc, n) => {
      acc[n.sentiment] = (acc[n.sentiment] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return `Market snapshot: ${quoteLines}. News sentiment: ${JSON.stringify(sentimentBreakdown)}.`;
}

// ─── Main ATLAS Pipeline ─────────────────────────────────

export async function runATLASPipeline(
  news: NewsArticle[],
  quotes?: Record<string, StockQuote>,
  onProgress?: ATLASProgressCallback
): Promise<ATLASPipelineOutput> {
  const startTime = Date.now();
  const pipelineId = `atlas-${Date.now()}`;
  const allAgents = getAllAgents();

  // Initialize Darwinian weights
  let weights = initializeWeights(allAgents);

  onProgress?.("init", "running", {
    message: `Initializing ATLAS pipeline with ${allAgents.length} agents across 4 layers...`,
    agentCount: allAgents.length,
  });

  // Build market context
  const marketContext = generateMarketContext(news, quotes);

  // ─── Layer 1: Macro Regime ───────────────────────────
  onProgress?.("layer1", "running", {
    message: `Layer 1: Running ${MACRO_AGENTS.length} macro agents...`,
    agentCount: MACRO_AGENTS.length,
  });

  let layer1: Layer1Output;
  try {
    layer1 = await runLayer1(news, marketContext);
    onProgress?.("layer1", "complete", {
      message: `Regime: ${layer1.regime} (${(layer1.regimeConfidence * 100).toFixed(0)}% confidence)`,
      layerOutput: layer1,
    });
  } catch (error) {
    onProgress?.("layer1", "error", { error: String(error) });
    layer1 = {
      regime: "TRANSITIONAL",
      regimeConfidence: 0.5,
      agentOutputs: [],
      consensusSignals: [],
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Layer 2: Sector Desks ──────────────────────────
  onProgress?.("layer2", "running", {
    message: `Layer 2: Running ${SECTOR_AGENTS.length} sector agents (Regime: ${layer1.regime})...`,
    agentCount: SECTOR_AGENTS.length,
  });

  // Group quotes by sector (approximate)
  const sectorQuotes: Record<string, StockQuote[]> = {
    tech: [],
    energy: [],
    financials: [],
    consumer: [],
    healthcare: [],
  };

  if (quotes) {
    const sectorMap: Record<string, string> = {
      NVDA: "tech", AMD: "tech", AVGO: "tech", INTC: "tech", MSFT: "tech", AAPL: "tech", GOOGL: "tech", META: "tech",
      XOM: "energy", CVX: "energy", COP: "energy",
      JPM: "financials", BAC: "financials", GS: "financials",
      AMZN: "consumer", COST: "consumer", WMT: "consumer", TSLA: "consumer",
      LLY: "healthcare", UNH: "healthcare", JNJ: "healthcare",
    };
    Object.entries(quotes).forEach(([sym, q]) => {
      const sector = sectorMap[sym];
      if (sector) sectorQuotes[sector].push(q);
    });
  }

  let layer2: Layer2Output;
  try {
    const regimeContext = layer1.agentOutputs
      .map((o) => `${o.role}: ${o.assessment}`)
      .join(" | ");
    layer2 = await runLayer2(layer1.regime, regimeContext, sectorQuotes);
    onProgress?.("layer2", "complete", {
      message: `${layer2.allPicks.length} sector picks generated`,
      layerOutput: layer2,
    });
  } catch (error) {
    onProgress?.("layer2", "error", { error: String(error) });
    layer2 = {
      regime: layer1.regime,
      sectorOutputs: [],
      allPicks: [],
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Layer 3: Superinvestors ────────────────────────
  onProgress?.("layer3", "running", {
    message: `Layer 3: Running ${SUPERINVESTOR_AGENTS.length} superinvestor agents...`,
    agentCount: SUPERINVESTOR_AGENTS.length,
  });

  let layer3: Layer3Output;
  try {
    layer3 = await runLayer3(layer1.regime, layer2.allPicks);
    onProgress?.("layer3", "complete", {
      message: `${layer3.consensusPicks.length} consensus picks, ${layer3.contestedPicks.length} contested`,
      layerOutput: layer3,
    });
  } catch (error) {
    onProgress?.("layer3", "error", { error: String(error) });
    layer3 = {
      regime: layer1.regime,
      superinvestorOutputs: [],
      consensusPicks: [],
      contestedPicks: [],
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Layer 4: Decision ──────────────────────────────
  // CRO
  onProgress?.("layer4-cro", "running", { message: "Layer 4: CRO reviewing all picks..." });

  let layer4: Layer4Output;
  try {
    layer4 = await runLayer4(
      layer1.regime,
      layer1.regimeConfidence,
      layer2.allPicks,
      layer3.superinvestorOutputs.flatMap((o) => o.topPicks),
      layer3.consensusPicks,
      weights,
      allAgents
    );

    onProgress?.("layer4-cro", "complete", {
      message: `CRO: ${layer4.cro.riskLevel} risk, ${layer4.cro.approved ? "APPROVED" : "BLOCKED"}`,
    });

    onProgress?.("layer4-alpha", "complete", {
      message: `Alpha Discovery: ${layer4.alphaDiscovery.newNames.length} new names found`,
    });

    onProgress?.("layer4-cio", "complete", {
      message: `CIO: ${layer4.cio.finalSignals.length} final trade signals`,
      layerOutput: layer4,
    });
  } catch (error) {
    onProgress?.("layer4-cio", "error", { error: String(error) });
    layer4 = {
      cro: {
        agentId: "decision-cro",
        approved: false,
        riskLevel: "HIGH",
        correlatedRisks: ["Pipeline error"],
        concerns: ["Layer 4 failed to execute"],
        positionLimitRecommendation: 5,
        overallRiskScore: 80,
      },
      alphaDiscovery: {
        agentId: "decision-alpha",
        newNames: [],
        contrarian: "Unable to generate.",
      },
      cio: {
        agentId: "decision-cio",
        finalSignals: [],
        portfolioView: "Pipeline error — no signals generated.",
        regimeAssessment: layer1.regime,
        confidence: 0,
        reasoning: "Pipeline execution failed at Layer 4.",
      },
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Darwinian Weight Update ────────────────────────
  onProgress?.("darwinian", "running", { message: "Updating Darwinian agent weights..." });

  const agentScores = [
    ...layer1.agentOutputs.map((o) => ({ agentId: o.agentId, score: o.score })),
    ...layer2.sectorOutputs.map((o) => ({ agentId: o.agentId, score: o.score })),
    ...layer3.superinvestorOutputs.map((o) => ({ agentId: o.agentId, score: o.score })),
  ];

  weights = updateWeightsDarwinian(weights, agentScores);
  saveWeights(weights);

  onProgress?.("darwinian", "complete", { message: "Darwinian weights updated" });

  // ─── Build Final Output ─────────────────────────────

  const pipelineOutput: ATLASPipelineOutput = {
    id: pipelineId,
    timestamp: new Date().toISOString(),
    layer1,
    layer2,
    layer3,
    layer4,
    finalSignals: layer4.cio.finalSignals,
    regimeSummary: `${layer1.regime} (${(layer1.regimeConfidence * 100).toFixed(0)}% confidence). ${layer4.cio.regimeAssessment}`,
    totalAgentsRun: allAgents.length,
    pipelineDurationMs: Date.now() - startTime,
  };

  onProgress?.("complete", "complete", {
    message: `ATLAS pipeline complete: ${pipelineOutput.finalSignals.length} signals in ${(pipelineOutput.pipelineDurationMs / 1000).toFixed(1)}s`,
    pipelineOutput,
  });

  return pipelineOutput;
}
