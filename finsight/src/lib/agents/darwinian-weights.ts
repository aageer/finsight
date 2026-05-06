/**
 * Darwinian Weight System — ATLAS-Inspired
 * ─────────────────────────────────────────
 * Each agent has a weight between 0.3 (floor) and 2.5 (ceiling).
 * Top quartile agents get weight × 1.05 daily.
 * Bottom quartile get × 0.95.
 * The CIO proportionally weights input by these scores.
 * Good agents get louder. Bad agents get quieter.
 */

import type {
  DarwinianWeight,
  AgentScorecard,
  ATLASAgent,
  AgentLayer,
} from "@/types/agent-types";

// ─── Constants ───────────────────────────────────────────

const MIN_WEIGHT = 0.3;
const MAX_WEIGHT = 2.5;
const BOOST_FACTOR = 1.05;
const PENALTY_FACTOR = 0.95;
const STORAGE_KEY = "finsight_darwinian_weights";
const SCORECARD_KEY = "finsight_agent_scorecards";
const MAX_HISTORY = 90; // keep 90 days of weight history

// ─── Weight Management ──────────────────────────────────

export function initializeWeights(agents: ATLASAgent[]): DarwinianWeight[] {
  const existing = loadWeights();
  const existingMap = new Map(existing.map((w) => [w.agentId, w]));

  return agents.map((agent) => {
    if (existingMap.has(agent.id)) {
      return existingMap.get(agent.id)!;
    }
    return {
      agentId: agent.id,
      currentWeight: 1.0, // start neutral
      previousWeight: 1.0,
      streak: 0,
      lastUpdated: new Date().toISOString(),
    };
  });
}

export function loadWeights(): DarwinianWeight[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWeights(weights: DarwinianWeight[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weights));
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Daily Darwinian update: rank agents by score, boost top quartile,
 * penalize bottom quartile, clamp to [MIN_WEIGHT, MAX_WEIGHT].
 */
export function updateWeightsDarwinian(
  weights: DarwinianWeight[],
  agentScores: { agentId: string; score: number }[]
): DarwinianWeight[] {
  if (agentScores.length === 0) return weights;

  // Sort by score descending
  const sorted = [...agentScores].sort((a, b) => b.score - a.score);
  const quartileSize = Math.max(1, Math.floor(sorted.length / 4));

  const topQuartile = new Set(sorted.slice(0, quartileSize).map((s) => s.agentId));
  const bottomQuartile = new Set(
    sorted.slice(-quartileSize).map((s) => s.agentId)
  );

  const weightMap = new Map(weights.map((w) => [w.agentId, w]));

  return weights.map((w) => {
    const prev = w.currentWeight;
    let newWeight = prev;

    if (topQuartile.has(w.agentId)) {
      newWeight = prev * BOOST_FACTOR;
    } else if (bottomQuartile.has(w.agentId)) {
      newWeight = prev * PENALTY_FACTOR;
    }

    // Clamp
    newWeight = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, newWeight));

    // Streak tracking
    const improved = newWeight > prev;
    const newStreak = improved ? Math.max(0, w.streak) + 1 : Math.min(0, w.streak) - 1;

    return {
      ...w,
      previousWeight: prev,
      currentWeight: Number(newWeight.toFixed(4)),
      streak: newStreak,
      lastUpdated: new Date().toISOString(),
    };
  });
}

/**
 * Get the normalized weight for an agent (sums to 1.0 within a layer or globally).
 */
export function getNormalizedWeight(
  agentId: string,
  weights: DarwinianWeight[],
  filterLayer?: AgentLayer,
  agents?: ATLASAgent[]
): number {
  let relevantWeights = weights;

  if (filterLayer && agents) {
    const layerAgentIds = new Set(
      agents.filter((a) => a.layer === filterLayer).map((a) => a.id)
    );
    relevantWeights = weights.filter((w) => layerAgentIds.has(w.agentId));
  }

  const total = relevantWeights.reduce((sum, w) => sum + w.currentWeight, 0);
  const agentWeight = weights.find((w) => w.agentId === agentId);

  if (!agentWeight || total === 0) return 1 / Math.max(1, relevantWeights.length);
  return agentWeight.currentWeight / total;
}

/**
 * Get weight as a visual percentage for UI display.
 */
export function getWeightPercentage(weight: number): number {
  // Map 0.3→2.5 to 0→100
  return Math.round(((weight - MIN_WEIGHT) / (MAX_WEIGHT - MIN_WEIGHT)) * 100);
}

/**
 * Get weight status label for UI.
 */
export function getWeightStatus(weight: number): "hot" | "warm" | "neutral" | "cool" | "cold" {
  if (weight >= 2.0) return "hot";
  if (weight >= 1.5) return "warm";
  if (weight >= 0.8) return "neutral";
  if (weight >= 0.5) return "cool";
  return "cold";
}

// ─── Scorecard Management ────────────────────────────────

export function loadScorecards(): AgentScorecard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SCORECARD_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveScorecards(scorecards: AgentScorecard[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SCORECARD_KEY, JSON.stringify(scorecards));
  } catch {
    // pass
  }
}

export function updateScorecard(
  scorecards: AgentScorecard[],
  agentId: string,
  update: {
    score: number;
    isHit: boolean;
    conviction: number;
    weight: number;
  }
): AgentScorecard[] {
  const idx = scorecards.findIndex((s) => s.agentId === agentId);
  if (idx === -1) return scorecards;

  const card = { ...scorecards[idx] };
  card.totalCalls += 1;

  // Update hit rate (rolling average)
  const prevHits = card.hitRate * (card.totalCalls - 1);
  card.hitRate = (prevHits + (update.isHit ? 1 : 0)) / card.totalCalls;

  // Update avg conviction
  const prevConv = card.avgConviction * (card.totalCalls - 1);
  card.avgConviction = (prevConv + update.conviction) / card.totalCalls;

  // Update weight
  card.weight = update.weight;

  // Append weight history
  card.weightHistory = [
    ...card.weightHistory.slice(-MAX_HISTORY),
    { date: new Date().toISOString().split("T")[0], weight: update.weight },
  ];

  const updated = [...scorecards];
  updated[idx] = card;
  return updated;
}

// ─── Identify Worst Agent (for Autoresearch) ─────────────

export function findWorstAgent(scorecards: AgentScorecard[]): AgentScorecard | null {
  if (scorecards.length === 0) return null;

  return scorecards.reduce((worst, card) => {
    if (card.totalCalls < 3) return worst; // need minimum data
    if (!worst) return card;
    return card.sharpe < worst.sharpe ? card : worst;
  }, null as AgentScorecard | null);
}
