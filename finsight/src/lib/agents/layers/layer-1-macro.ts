/**
 * Layer 1 — Macro Regime Agents
 * ─────────────────────────────
 * 6 agents that set the macro backdrop.
 * They answer: Risk on or risk off? What's the macro environment?
 *
 * Agents: CentralBank, Geopolitical, Dollar, YieldCurve, Volatility, Sentiment
 */

import { callGemini, getGeminiFlash } from "../gemini-client";
import type {
  ATLASAgent,
  MacroAgentOutput,
  MacroAgentRole,
  MacroRegime,
  Layer1Output,
} from "@/types/agent-types";
import type { NewsArticle } from "@/types";

// ─── Agent Definitions ───────────────────────────────────

export const MACRO_AGENTS: ATLASAgent[] = [
  {
    id: "macro-central-bank",
    name: "CentralBankAgent",
    layer: "MACRO",
    role: "Central Bank Policy Analyst",
    description: "Analyzes Fed policy, rate expectations, QT/QE signals",
    status: "IDLE",
    darwinianWeight: 1.0,
    prompt: `You are the CentralBankAgent at FinSight ATLAS. You analyze Federal Reserve policy, interest rate expectations, quantitative tightening/easing signals, and their impact on equity markets. You are hawkish-aware and track dot plots, FOMC minutes, and Fed speaker signals.`,
  },
  {
    id: "macro-geopolitical",
    name: "GeopoliticalAgent",
    layer: "MACRO",
    role: "Geopolitical Risk Analyst",
    description: "Monitors global risk events, sanctions, trade wars",
    status: "IDLE",
    darwinianWeight: 1.0,
    prompt: `You are the GeopoliticalAgent at FinSight ATLAS. You analyze global geopolitical risk: wars, sanctions, trade disputes, elections, and their market implications. You assess tail risks and contagion pathways.`,
  },
  {
    id: "macro-dollar",
    name: "DollarAgent",
    layer: "MACRO",
    role: "Dollar & Currency Strategist",
    description: "Tracks DXY strength, currency implications for equities",
    status: "IDLE",
    darwinianWeight: 1.0,
    prompt: `You are the DollarAgent at FinSight ATLAS. You analyze the US Dollar Index (DXY), currency cross-rates, and their implications for US equities. Strong dollar = headwind for multinationals, weak dollar = tailwind. You track real yields and capital flows.`,
  },
  {
    id: "macro-yield-curve",
    name: "YieldCurveAgent",
    layer: "MACRO",
    role: "Yield Curve & Credit Analyst",
    description: "Analyzes 2s10s spread, inversion signals, credit conditions",
    status: "IDLE",
    darwinianWeight: 1.0,
    prompt: `You are the YieldCurveAgent at FinSight ATLAS. You analyze the yield curve (2s10s, 3m10y), credit spreads (IG, HY), and their recession/expansion signals. Yield curve inversion has preceded every modern recession. You track term premium and credit stress.`,
  },
  {
    id: "macro-volatility",
    name: "VolatilityAgent",
    layer: "MACRO",
    role: "Volatility Regime Analyst",
    description: "VIX regime classification, vol surface analysis",
    inspiration: "ATLAS volatility agent evolved to 121,260 bytes in bull markets",
    status: "IDLE",
    darwinianWeight: 1.0,
    prompt: `You are the VolatilityAgent at FinSight ATLAS. You classify the volatility regime: VIX < 15 = calm (risk on), 15-25 = elevated (caution), > 25 = fear (risk off), > 35 = panic. You track VIX term structure (contango vs backwardation), VVIX, and realized vs implied vol spread.`,
  },
  {
    id: "macro-sentiment",
    name: "MarketSentimentAgent",
    layer: "MACRO",
    role: "Market Sentiment Aggregator",
    description: "Aggregates overall market sentiment from news and flows",
    status: "IDLE",
    darwinianWeight: 1.0,
    prompt: `You are the MarketSentimentAgent at FinSight ATLAS. You aggregate market sentiment signals: put/call ratios, AAII sentiment survey, fund flows, margin debt levels, and news sentiment. Extreme bearish sentiment is often contrarian bullish, and vice versa.`,
  },
];

// ─── Run Individual Macro Agent ──────────────────────────

async function runMacroAgent(
  agent: ATLASAgent,
  role: MacroAgentRole,
  news: NewsArticle[],
  context: string
): Promise<MacroAgentOutput> {
  const model = getGeminiFlash();

  const headlines = news
    .slice(0, 6)
    .map((n) => `[${n.sentiment}] ${n.title} (${n.source})`)
    .join("\n");

  const prompt = `${agent.prompt}

CURRENT MARKET CONTEXT:
${context}

RECENT NEWS HEADLINES:
${headlines}

Based on your analysis, determine the current macro regime and provide your assessment.

Respond in JSON:
{
  "regime": "RISK_ON" | "RISK_OFF" | "TRANSITIONAL",
  "confidence": 0.0 to 1.0,
  "assessment": "2-3 sentence analysis of the current macro environment from your perspective",
  "keySignals": ["signal1", "signal2", "signal3"],
  "riskFactors": ["risk1", "risk2"],
  "score": -100 to +100 (positive = bullish macro, negative = bearish macro)
}`;

  const result = await callGemini<MacroAgentOutput>(model, prompt, agent.name);

  return result.data || {
    agentId: agent.id,
    role,
    regime: "TRANSITIONAL",
    confidence: 0.3,
    assessment: `${agent.name}: Unable to generate assessment — API may be rate-limited.`,
    keySignals: ["Insufficient data"],
    riskFactors: ["Analysis unavailable"],
    score: 0,
  };
}

// ─── Run All Layer 1 Agents ──────────────────────────────

export async function runLayer1(
  news: NewsArticle[],
  marketContext: string
): Promise<Layer1Output> {
  const roles: MacroAgentRole[] = [
    "CENTRAL_BANK",
    "GEOPOLITICAL",
    "DOLLAR",
    "YIELD_CURVE",
    "VOLATILITY",
    "SENTIMENT",
  ];

  // Run all macro agents in parallel
  const results = await Promise.allSettled(
    MACRO_AGENTS.map((agent, i) =>
      runMacroAgent(agent, roles[i], news, marketContext)
    )
  );

  const agentOutputs: MacroAgentOutput[] = results.map((result, i) => {
    if (result.status === "fulfilled") {
      return { ...result.value, agentId: MACRO_AGENTS[i].id, role: roles[i] };
    }
    return {
      agentId: MACRO_AGENTS[i].id,
      role: roles[i],
      regime: "TRANSITIONAL" as MacroRegime,
      confidence: 0.3,
      assessment: `${MACRO_AGENTS[i].name} failed to execute.`,
      keySignals: [],
      riskFactors: ["Agent execution failed"],
      score: 0,
    };
  });

  // Determine consensus regime by weighted voting
  const regimeVotes: Record<MacroRegime, number> = {
    RISK_ON: 0,
    RISK_OFF: 0,
    TRANSITIONAL: 0,
  };

  agentOutputs.forEach((output) => {
    const weight = MACRO_AGENTS.find((a) => a.id === output.agentId)?.darwinianWeight || 1.0;
    regimeVotes[output.regime] += weight * output.confidence;
  });

  const regime = (Object.entries(regimeVotes).sort(
    (a, b) => b[1] - a[1]
  )[0][0]) as MacroRegime;

  const totalVotes = Object.values(regimeVotes).reduce((s, v) => s + v, 0);
  const regimeConfidence = totalVotes > 0 ? regimeVotes[regime] / totalVotes : 0.5;

  // Collect consensus signals
  const signalCounts = new Map<string, number>();
  agentOutputs.forEach((o) => {
    o.keySignals.forEach((s) => {
      signalCounts.set(s, (signalCounts.get(s) || 0) + 1);
    });
  });
  const consensusSignals = [...signalCounts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([signal]) => signal);

  return {
    regime,
    regimeConfidence: Number(regimeConfidence.toFixed(3)),
    agentOutputs,
    consensusSignals,
    timestamp: new Date().toISOString(),
  };
}
