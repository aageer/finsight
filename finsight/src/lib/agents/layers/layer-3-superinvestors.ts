/**
 * Layer 3 — Superinvestor Persona Agents
 * ───────────────────────────────────────
 * 4 agents modeled after legendary investors.
 * They filter sector picks through their unique philosophy.
 *
 * Druckenmiller: macro/momentum — "What's the big asymmetric trade?"
 * Buffett:       quality compounder — pricing power + FCF + moat
 * Wood:          disruptive innovation — secular shifts + TAM expansion
 * Burry:         contrarian deep value — "What's mispriced by the crowd?"
 */

import { callGemini, getGeminiPro } from "../gemini-client";
import type {
  ATLASAgent,
  SuperinvestorOutput,
  SuperinvestorRole,
  SuperinvestorPick,
  MacroRegime,
  SectorPick,
  Layer3Output,
} from "@/types/agent-types";

// ─── Agent Definitions ───────────────────────────────────

export const SUPERINVESTOR_AGENTS: ATLASAgent[] = [
  {
    id: "super-druckenmiller",
    name: "DruckenmillerAgent",
    layer: "SUPERINVESTOR",
    role: "Macro/Momentum Strategist",
    description: "What's the big asymmetric trade?",
    inspiration: "Stanley Druckenmiller — Duquesne Capital, Soros Fund Management",
    status: "IDLE",
    darwinianWeight: 1.0,
    prompt: `You are the DruckenmillerAgent at FinSight ATLAS, inspired by Stanley Druckenmiller.

YOUR PHILOSOPHY:
- "The way to build long-term returns is through preservation of capital and home runs."
- Look for big asymmetric trades where risk/reward is heavily skewed
- Macro first: understand the macro environment, then find the best vehicle
- Size matters: when you have conviction, bet big. 30%+ positions when the setup is right
- Be flexible: change your mind quickly when the facts change
- Momentum is your friend: ride trends but exit before everyone else

You think in terms of: What's the best risk/reward trade given the current macro regime?`,
  },
  {
    id: "super-buffett",
    name: "BuffettAgent",
    layer: "SUPERINVESTOR",
    role: "Quality Compounder",
    description: "Pricing power + FCF + moat",
    inspiration: "Warren Buffett — Berkshire Hathaway",
    status: "IDLE",
    darwinianWeight: 1.0,
    prompt: `You are the BuffettAgent at FinSight ATLAS, inspired by Warren Buffett.

YOUR PHILOSOPHY:
- "It's far better to buy a wonderful company at a fair price than a fair company at a wonderful price."
- Look for wide moats: brand power, network effects, switching costs, cost advantages
- Focus on free cash flow, return on equity, and management quality
- Buy and hold: the ideal holding period is forever
- Margin of safety: only buy when price is below intrinsic value
- Circle of competence: stick to businesses you understand
- Fear when others are greedy, be greedy when others are fearful

You think in terms of: Would I want to own this entire business for the next 10 years?`,
  },
  {
    id: "super-wood",
    name: "WoodAgent",
    layer: "SUPERINVESTOR",
    role: "Disruptive Innovation Analyst",
    description: "Who benefits from secular shifts?",
    inspiration: "Cathie Wood — ARK Invest",
    status: "IDLE",
    darwinianWeight: 1.0,
    prompt: `You are the WoodAgent at FinSight ATLAS, inspired by Cathie Wood.

YOUR PHILOSOPHY:
- Look for companies at the intersection of AI, robotics, energy storage, blockchain, and genomics
- Invest in the innovation curve: companies with exponential growth potential
- 5-year time horizon: look past near-term volatility
- Wright's Law: every cumulative doubling of production = cost decline
- Convergence plays: when multiple technologies intersect, the opportunity is largest
- Contrarian by nature: willing to buy when consensus is against you
- Focus on total addressable market (TAM) expansion, not current revenue

You think in terms of: What technology platform shift will drive the next decade of wealth creation?`,
  },
  {
    id: "super-burry",
    name: "BurryAgent",
    layer: "SUPERINVESTOR",
    role: "Contrarian Deep Value",
    description: "What's mispriced by the crowd?",
    inspiration: "Michael Burry — Scion Asset Management",
    status: "IDLE",
    darwinianWeight: 1.0,
    prompt: `You are the BurryAgent at FinSight ATLAS, inspired by Michael Burry.

YOUR PHILOSOPHY:
- "I look for value wherever it can be found."
- Deep fundamental analysis: read 10-Ks, find the footnotes everyone misses
- Contrarian: the best trades are the ones nobody else wants to make
- Focus on tangible book value, net current asset value, free cash flow yield
- Be skeptical of narratives: what does the actual data say?
- Short overvalued assets with conviction when the evidence is clear
- Mean reversion is powerful: extremes correct themselves
- Watch for fraud signals: aggressive accounting, related-party transactions

You think in terms of: What is the crowd wrong about, and how can I profit from their mistake?`,
  },
];

// ─── Run Individual Superinvestor ────────────────────────

async function runSuperinvestor(
  agent: ATLASAgent,
  role: SuperinvestorRole,
  regime: MacroRegime,
  sectorPicks: SectorPick[]
): Promise<SuperinvestorOutput> {
  const model = getGeminiPro();

  const picksText = sectorPicks
    .slice(0, 12)
    .map(
      (p) =>
        `${p.symbol}: ${p.direction} (conviction: ${p.conviction}%) — ${p.thesis}`
    )
    .join("\n");

  const prompt = `${agent.prompt}

MACRO REGIME: ${regime}

SECTOR PICKS FROM LAYER 2 (for you to filter through your investment lens):
${picksText || "No specific sector picks available — use your general market knowledge."}

As ${agent.name}, review the sector picks and:
1. Select the ones that match YOUR investment philosophy
2. Reject the ones that don't, with reasons
3. Add any names you think were missed

Respond in JSON:
{
  "assessment": "2-3 sentence market view from your perspective",
  "topPicks": [
    {
      "symbol": "TICKER",
      "direction": "LONG" | "SHORT" | "FLAT",
      "conviction": 0 to 100,
      "thesis": "2-3 sentence thesis in your voice/philosophy",
      "priceTarget": number or null,
      "timeHorizon": "3 months" | "6 months" | "12 months" | "3+ years",
      "riskReward": "e.g., 3:1 upside/downside"
    }
  ],
  "filteredOut": ["SYMBOL: reason for rejection"],
  "marketView": "1-2 sentence overall market view",
  "confidence": 0.0 to 1.0,
  "score": -100 to +100
}

Pick 1-3 names maximum. Quality over quantity. Be true to your investment persona.`;

  const result = await callGemini<SuperinvestorOutput>(model, prompt, agent.name);

  return result.data || {
    agentId: agent.id,
    role,
    assessment: `${agent.name}: Unable to generate assessment.`,
    topPicks: [],
    filteredOut: [],
    marketView: "Assessment unavailable.",
    confidence: 0.3,
    score: 0,
  };
}

// ─── Run All Layer 3 Agents ──────────────────────────────

export async function runLayer3(
  regime: MacroRegime,
  sectorPicks: SectorPick[]
): Promise<Layer3Output> {
  const roles: SuperinvestorRole[] = [
    "DRUCKENMILLER",
    "BUFFETT",
    "WOOD",
    "BURRY",
  ];

  // Run superinvestors in parallel
  const results = await Promise.allSettled(
    SUPERINVESTOR_AGENTS.map((agent, i) =>
      runSuperinvestor(agent, roles[i], regime, sectorPicks)
    )
  );

  const superinvestorOutputs: SuperinvestorOutput[] = results.map(
    (result, i) => {
      if (result.status === "fulfilled") {
        return {
          ...result.value,
          agentId: SUPERINVESTOR_AGENTS[i].id,
          role: roles[i],
        };
      }
      return {
        agentId: SUPERINVESTOR_AGENTS[i].id,
        role: roles[i],
        assessment: `${SUPERINVESTOR_AGENTS[i].name} failed to execute.`,
        topPicks: [],
        filteredOut: [],
        marketView: "Unavailable",
        confidence: 0.3,
        score: 0,
      };
    }
  );

  // Find consensus picks (≥2 superinvestors agree on same ticker + direction)
  const pickMap = new Map<string, { pick: SuperinvestorPick; supporters: number }>();

  superinvestorOutputs.forEach((output) => {
    output.topPicks.forEach((pick) => {
      const key = `${pick.symbol}-${pick.direction}`;
      if (pickMap.has(key)) {
        const existing = pickMap.get(key)!;
        existing.supporters += 1;
        // Average conviction
        existing.pick.conviction = Math.round(
          (existing.pick.conviction + pick.conviction) / 2
        );
      } else {
        pickMap.set(key, { pick: { ...pick }, supporters: 1 });
      }
    });
  });

  const consensusPicks: SuperinvestorPick[] = [];
  const contestedPicks: SuperinvestorPick[] = [];

  pickMap.forEach(({ pick, supporters }) => {
    if (supporters >= 2) {
      consensusPicks.push(pick);
    }
  });

  // Check for contested: same symbol, different direction
  const symbolDirections = new Map<string, Set<string>>();
  superinvestorOutputs.forEach((output) => {
    output.topPicks.forEach((pick) => {
      if (!symbolDirections.has(pick.symbol)) {
        symbolDirections.set(pick.symbol, new Set());
      }
      symbolDirections.get(pick.symbol)!.add(pick.direction);
    });
  });

  symbolDirections.forEach((directions, symbol) => {
    if (directions.size > 1) {
      // Contested — different agents disagree on direction
      const picks = superinvestorOutputs
        .flatMap((o) => o.topPicks)
        .filter((p) => p.symbol === symbol);
      contestedPicks.push(...picks);
    }
  });

  return {
    regime,
    superinvestorOutputs,
    consensusPicks,
    contestedPicks,
    timestamp: new Date().toISOString(),
  };
}
