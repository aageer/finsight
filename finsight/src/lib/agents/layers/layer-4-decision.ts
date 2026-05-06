/**
 * Layer 4 — Decision Layer
 * ────────────────────────
 * 3 agents that produce the final trade signals:
 *
 * CRO:             Attacks every idea, finds correlated risks
 * Alpha Discovery: Finds names nobody else mentioned
 * CIO:             Synthesizes all layers → final signals
 */

import { callGemini, getGeminiPro, getGeminiFlash } from "../gemini-client";
import type {
  ATLASAgent,
  CROAssessment,
  AlphaDiscoveryOutput,
  CIODecision,
  TradeSignal,
  MacroRegime,
  SectorPick,
  SuperinvestorPick,
  Layer4Output,
  DarwinianWeight,
} from "@/types/agent-types";
import { getNormalizedWeight } from "../darwinian-weights";

// ─── Agent Definitions ───────────────────────────────────

export const DECISION_AGENTS: ATLASAgent[] = [
  {
    id: "decision-cro",
    name: "CROAgent",
    layer: "DECISION",
    role: "Chief Risk Officer",
    description: "Adversarial risk officer — attacks every idea",
    inspiration: "Inspired by Nassim Taleb's antifragility principles",
    status: "IDLE",
    darwinianWeight: 1.0,
    prompt: `You are the CRO (Chief Risk Officer) at FinSight ATLAS. Your job is adversarial: you ATTACK every investment idea that comes through the pipeline.

YOUR ROLE:
- Find the bear case for every bull thesis
- Identify correlated risks across positions
- Flag concentration risk, sector overlap, and macro vulnerability
- Calculate worst-case scenarios
- Your job is NOT to be popular — it's to prevent catastrophic losses
- Remember: the best risk management prevents the trades that would blow up the portfolio`,
  },
  {
    id: "decision-alpha",
    name: "AlphaDiscoveryAgent",
    layer: "DECISION",
    role: "Alpha Discovery",
    description: "Finds overlooked names nobody else mentioned",
    status: "IDLE",
    darwinianWeight: 1.0,
    prompt: `You are the AlphaDiscoveryAgent at FinSight ATLAS. Your job is to find names that the other agents MISSED.

YOUR ROLE:
- Look for stocks/themes that were not mentioned in the sector or superinvestor analysis
- Find second-order effects: if X is happening, who benefits indirectly?
- Look for supply chain winners, picks-and-shovels plays, and derivative beneficiaries
- Find contrarian ideas that go against the consensus of the other agents
- Maximum 2 new names — quality over quantity`,
  },
  {
    id: "decision-cio",
    name: "CIOAgent",
    layer: "DECISION",
    role: "Chief Investment Officer",
    description: "Final decision maker — synthesizes all layers",
    inspiration: "Inspired by Ray Dalio's systematic approach",
    status: "IDLE",
    darwinianWeight: 1.0,
    prompt: `You are the CIO (Chief Investment Officer) at FinSight ATLAS. You make the FINAL call.

YOUR ROLE:
- Synthesize all inputs from Layer 1 (Macro), Layer 2 (Sectors), Layer 3 (Superinvestors), CRO risk review, and Alpha Discovery
- Weight each agent's input by their Darwinian performance score
- Produce FINAL trade signals with exact conviction levels
- Consider position sizing based on conviction and risk
- You have final authority — but you must justify every decision
- Maximum 5 final signals — concentrated portfolio, not a shotgun approach`,
  },
];

// ─── CRO: Risk Review ───────────────────────────────────

async function runCRO(
  regime: MacroRegime,
  allPicks: (SectorPick | SuperinvestorPick)[],
  consensusPicks: SuperinvestorPick[]
): Promise<CROAssessment> {
  const model = getGeminiFlash();
  const agent = DECISION_AGENTS[0];

  const picksText = allPicks
    .slice(0, 15)
    .map((p) => `${p.symbol}: ${p.direction} (conviction: ${p.conviction}%) — ${p.thesis}`)
    .join("\n");

  const prompt = `${agent.prompt}

MACRO REGIME: ${regime}

ALL PROPOSED TRADES FROM PREVIOUS LAYERS:
${picksText || "No trades proposed."}

CONSENSUS PICKS (≥2 agents agree): ${consensusPicks.map((p) => p.symbol).join(", ") || "None"}

As the CRO, attack these ideas:
1. Find correlated risks across positions
2. Identify the worst-case scenario
3. Flag any position that's too risky for the current regime
4. Recommend position limits

Respond in JSON:
{
  "approved": true | false,
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "EXTREME",
  "correlatedRisks": ["risk1: explanation", "risk2: explanation"],
  "concerns": ["concern1", "concern2", "concern3"],
  "positionLimitRecommendation": 5 to 15 (max % per position),
  "overallRiskScore": 0 to 100 (higher = riskier)
}`;

  const result = await callGemini<CROAssessment>(model, prompt, agent.name);

  return result.data || {
    agentId: agent.id,
    approved: true,
    riskLevel: "MEDIUM",
    correlatedRisks: ["Unable to fully assess correlated risks"],
    concerns: ["CRO analysis unavailable — proceed with caution"],
    positionLimitRecommendation: 8,
    overallRiskScore: 50,
  };
}

// ─── Alpha Discovery ────────────────────────────────────

async function runAlphaDiscovery(
  regime: MacroRegime,
  existingPicks: string[]
): Promise<AlphaDiscoveryOutput> {
  const model = getGeminiFlash();
  const agent = DECISION_AGENTS[1];

  const prompt = `${agent.prompt}

MACRO REGIME: ${regime}

SYMBOLS ALREADY COVERED BY OTHER AGENTS: ${existingPicks.join(", ") || "None"}

Find 1-2 names that NOBODY else mentioned. Look for:
- Second-order beneficiaries
- Supply chain winners
- Picks-and-shovels plays
- Contrarian contrarian opportunities

Respond in JSON:
{
  "newNames": [
    {
      "symbol": "TICKER",
      "conviction": 0 to 100,
      "direction": "LONG" | "SHORT",
      "thesis": "2-3 sentence thesis for why this was missed",
      "catalysts": ["catalyst1"],
      "risks": ["risk1"]
    }
  ],
  "contrarian": "1-2 sentence contrarian view on the overall consensus"
}`;

  const result = await callGemini<AlphaDiscoveryOutput>(model, prompt, agent.name);

  return result.data || {
    agentId: agent.id,
    newNames: [],
    contrarian: "Unable to generate contrarian analysis.",
  };
}

// ─── CIO: Final Decision ────────────────────────────────

async function runCIO(
  regime: MacroRegime,
  regimeConfidence: number,
  sectorPicks: SectorPick[],
  superinvestorPicks: SuperinvestorPick[],
  consensusPicks: SuperinvestorPick[],
  cro: CROAssessment,
  alpha: AlphaDiscoveryOutput,
  weights: DarwinianWeight[],
  agents: ATLASAgent[]
): Promise<CIODecision> {
  const model = getGeminiPro();
  const agent = DECISION_AGENTS[2];

  // Build weighted summary
  const sectorSummary = sectorPicks
    .slice(0, 10)
    .map((p) => `${p.symbol}: ${p.direction} (${p.conviction}%) — ${p.thesis}`)
    .join("\n");

  const superSummary = superinvestorPicks
    .slice(0, 8)
    .map((p) => `${p.symbol}: ${p.direction} (${p.conviction}%) — ${p.thesis}`)
    .join("\n");

  const consensusText = consensusPicks
    .map((p) => `${p.symbol}: ${p.direction} (${p.conviction}%)`)
    .join(", ");

  const alphaText = alpha.newNames
    .map((p) => `${p.symbol}: ${p.direction} (${p.conviction}%) — ${p.thesis}`)
    .join("\n");

  const prompt = `${agent.prompt}

═══ PIPELINE INPUTS ═══

MACRO REGIME: ${regime} (confidence: ${(regimeConfidence * 100).toFixed(0)}%)

SECTOR PICKS (Layer 2):
${sectorSummary || "None"}

SUPERINVESTOR PICKS (Layer 3):
${superSummary || "None"}

CONSENSUS (≥2 agree): ${consensusText || "None"}

CRO RISK ASSESSMENT:
- Approved: ${cro.approved}
- Risk Level: ${cro.riskLevel}
- Concerns: ${cro.concerns.join("; ")}
- Max Position Size: ${cro.positionLimitRecommendation}%

ALPHA DISCOVERY (missed names):
${alphaText || "None"}
Contrarian view: ${alpha.contrarian}

═══ YOUR DECISION ═══

Make your final call. Produce 1-5 trade signals. Weight your inputs by agent performance. Explain your reasoning chain.

Respond in JSON:
{
  "finalSignals": [
    {
      "symbol": "TICKER",
      "direction": "LONG" | "SHORT" | "FLAT",
      "conviction": 0 to 100,
      "suggestedSize": 2 to 15 (% of portfolio),
      "priceTarget": number or null,
      "stopLoss": number or null,
      "timeHorizon": "1 week" | "1 month" | "3 months" | "6 months" | "12 months",
      "reasoning": "2-3 sentence specific reasoning",
      "contributingAgents": ["agent1", "agent2"],
      "layers": ["MACRO", "SECTOR", "SUPERINVESTOR", "DECISION"]
    }
  ],
  "portfolioView": "2-3 sentence overall portfolio positioning view",
  "regimeAssessment": "1-2 sentence regime assessment",
  "confidence": 0.0 to 1.0,
  "reasoning": "3-4 sentence detailed reasoning for your final decisions"
}`;

  const result = await callGemini<CIODecision>(model, prompt, agent.name);

  return result.data || {
    agentId: agent.id,
    finalSignals: [],
    portfolioView: "Unable to generate portfolio view.",
    regimeAssessment: `Current regime: ${regime}`,
    confidence: 0.3,
    reasoning: "CIO analysis unavailable.",
  };
}

// ─── Run All Layer 4 Agents ──────────────────────────────

export async function runLayer4(
  regime: MacroRegime,
  regimeConfidence: number,
  sectorPicks: SectorPick[],
  superinvestorPicks: SuperinvestorPick[],
  consensusPicks: SuperinvestorPick[],
  weights: DarwinianWeight[],
  allAgents: ATLASAgent[]
): Promise<Layer4Output> {
  // 1. CRO reviews all picks
  const allPicks = [...sectorPicks, ...superinvestorPicks];
  const cro = await runCRO(regime, allPicks, consensusPicks);

  // 2. Alpha Discovery finds missed names
  const existingSymbols = [...new Set(allPicks.map((p) => p.symbol))];
  const alphaDiscovery = await runAlphaDiscovery(regime, existingSymbols);

  // 3. CIO makes final call
  const cio = await runCIO(
    regime,
    regimeConfidence,
    sectorPicks,
    superinvestorPicks,
    consensusPicks,
    cro,
    alphaDiscovery,
    weights,
    allAgents
  );

  return {
    cro: { ...cro, agentId: DECISION_AGENTS[0].id },
    alphaDiscovery: { ...alphaDiscovery, agentId: DECISION_AGENTS[1].id },
    cio: { ...cio, agentId: DECISION_AGENTS[2].id },
    timestamp: new Date().toISOString(),
  };
}
