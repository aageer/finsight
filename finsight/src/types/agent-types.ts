/**
 * ATLAS-Style Agent Type System
 * ─────────────────────────────
 * Defines the 4-layer agent hierarchy, Darwinian weight system,
 * trade signals, and auto-trading configuration.
 *
 * Inspired by: General Intelligence Capital's ATLAS framework
 */

// ─── Layer Definitions ───────────────────────────────────

export type AgentLayer = "MACRO" | "SECTOR" | "SUPERINVESTOR" | "DECISION";

export type MacroRegime = "RISK_ON" | "RISK_OFF" | "TRANSITIONAL";

export type TradeDirection = "LONG" | "SHORT" | "FLAT";

export type TradingMode = "PAPER" | "LIVE" | "HALTED";

// ─── Agent Identity ──────────────────────────────────────

export interface ATLASAgent {
  id: string;
  name: string;
  layer: AgentLayer;
  role: string;                     // e.g., "Central Bank Policy Analyst"
  description: string;
  inspiration?: string;             // e.g., "Inspired by Stanley Druckenmiller"
  status: "IDLE" | "RUNNING" | "ERROR" | "DISABLED";
  darwinianWeight: number;          // 0.3 (floor) → 2.5 (ceiling)
  lastRunAt?: string;
  prompt: string;                   // current system prompt (evolves via autoresearch)
}

// ─── Layer 1: Macro Agents ───────────────────────────────

export type MacroAgentRole =
  | "CENTRAL_BANK"
  | "GEOPOLITICAL"
  | "DOLLAR"
  | "YIELD_CURVE"
  | "VOLATILITY"
  | "SENTIMENT";

export interface MacroAgentOutput {
  agentId: string;
  role: MacroAgentRole;
  regime: MacroRegime;
  confidence: number;               // 0.0 → 1.0
  assessment: string;               // 2-3 sentence analysis
  keySignals: string[];
  riskFactors: string[];
  score: number;                    // -100 → +100
}

export interface Layer1Output {
  regime: MacroRegime;
  regimeConfidence: number;
  agentOutputs: MacroAgentOutput[];
  consensusSignals: string[];
  timestamp: string;
}

// ─── Layer 2: Sector Agents ──────────────────────────────

export type SectorAgentRole =
  | "TECH_SEMICONDUCTOR"
  | "ENERGY"
  | "FINANCIALS"
  | "CONSUMER"
  | "HEALTHCARE";

export interface SectorPick {
  symbol: string;
  conviction: number;               // 0 → 100
  direction: TradeDirection;
  thesis: string;
  catalysts: string[];
  risks: string[];
}

export interface SectorAgentOutput {
  agentId: string;
  role: SectorAgentRole;
  sectorOutlook: "OVERWEIGHT" | "NEUTRAL" | "UNDERWEIGHT";
  confidence: number;
  assessment: string;
  topPicks: SectorPick[];
  score: number;
}

export interface Layer2Output {
  regime: MacroRegime;              // passed from Layer 1
  sectorOutputs: SectorAgentOutput[];
  allPicks: SectorPick[];
  timestamp: string;
}

// ─── Layer 3: Superinvestor Agents ───────────────────────

export type SuperinvestorRole =
  | "DRUCKENMILLER"                 // macro/momentum
  | "BUFFETT"                       // quality compounder
  | "WOOD"                          // disruptive innovation
  | "BURRY";                        // contrarian deep value

export interface SuperinvestorPick {
  symbol: string;
  direction: TradeDirection;
  conviction: number;
  thesis: string;
  priceTarget?: number;
  timeHorizon: string;
  riskReward: string;
}

export interface SuperinvestorOutput {
  agentId: string;
  role: SuperinvestorRole;
  assessment: string;
  topPicks: SuperinvestorPick[];
  filteredOut: string[];            // symbols considered but rejected (with reasons)
  marketView: string;
  confidence: number;
  score: number;
}

export interface Layer3Output {
  regime: MacroRegime;
  superinvestorOutputs: SuperinvestorOutput[];
  consensusPicks: SuperinvestorPick[];     // ≥2 superinvestors agree
  contestedPicks: SuperinvestorPick[];     // disagreement
  timestamp: string;
}

// ─── Layer 4: Decision Agents ────────────────────────────

export type DecisionRole = "CRO" | "ALPHA_DISCOVERY" | "CIO";

export interface CROAssessment {
  agentId: string;
  approved: boolean;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  correlatedRisks: string[];
  concerns: string[];
  positionLimitRecommendation: number;   // max % per position
  overallRiskScore: number;              // 0-100
}

export interface AlphaDiscoveryOutput {
  agentId: string;
  newNames: SectorPick[];               // names nobody else mentioned
  contrarian: string;                    // contrarian thesis
}

export interface CIODecision {
  agentId: string;
  finalSignals: TradeSignal[];
  portfolioView: string;
  regimeAssessment: string;
  confidence: number;
  reasoning: string;
}

export interface Layer4Output {
  cro: CROAssessment;
  alphaDiscovery: AlphaDiscoveryOutput;
  cio: CIODecision;
  timestamp: string;
}

// ─── Trade Signals ───────────────────────────────────────

export interface TradeSignal {
  symbol: string;
  direction: TradeDirection;
  conviction: number;                // 0 → 100
  suggestedSize: number;             // % of portfolio
  priceTarget?: number;
  stopLoss?: number;
  timeHorizon: string;
  reasoning: string;
  contributingAgents: string[];      // which agents supported this
  layers: AgentLayer[];              // which layers contributed
}

// ─── Full Pipeline Output ────────────────────────────────

export interface ATLASPipelineOutput {
  id: string;
  timestamp: string;
  layer1: Layer1Output;
  layer2: Layer2Output;
  layer3: Layer3Output;
  layer4: Layer4Output;
  finalSignals: TradeSignal[];
  regimeSummary: string;
  totalAgentsRun: number;
  pipelineDurationMs: number;
}

// ─── Darwinian Weight System ─────────────────────────────

export interface DarwinianWeight {
  agentId: string;
  currentWeight: number;             // 0.3 → 2.5
  previousWeight: number;
  streak: number;                    // positive = consecutive improvements
  lastUpdated: string;
}

export interface AgentScorecard {
  agentId: string;
  name: string;
  layer: AgentLayer;
  rollingSharpeDays: number;         // over how many days
  sharpe: number;
  hitRate: number;                   // % of correct directional calls
  avgConviction: number;
  totalCalls: number;
  bestCall: string;                  // e.g., "NVDA +45%"
  worstCall: string;
  weight: number;
  weightHistory: { date: string; weight: number }[];
}

// ─── Autoresearch ────────────────────────────────────────

export interface AutoresearchExperiment {
  id: string;
  targetAgentId: string;
  targetAgentName: string;
  hypothesis: string;                // what change was tried
  promptBefore: string;
  promptAfter: string;
  sharpeBefore: number;
  sharpeAfter?: number;
  status: "RUNNING" | "IMPROVED" | "REVERTED" | "PENDING";
  durationDays: number;
  createdAt: string;
  completedAt?: string;
}

// ─── Auto-Trading Configuration ──────────────────────────

export interface AutoTradeConfig {
  mode: TradingMode;
  maxPerTrade: number;               // max $ per single trade
  maxDaily: number;                  // max $ spent per day
  maxPortfolioAllocation: number;    // max % of portfolio per position
  maxPositions: number;              // max number of open positions
  dailyLossLimit: number;            // halt trading if daily loss exceeds this $
  maxDrawdown: number;               // halt if total drawdown exceeds this %
  cashReserve: number;               // keep this % in cash always
  requireConfirmation: boolean;      // true for live, false for paper
  allowedAssetTypes: ("stock" | "etf")[];
  blacklistedSymbols: string[];
}

export interface TradeExecution {
  id: string;
  signalId: string;
  symbol: string;
  direction: TradeDirection;
  quantity: number;
  price: number;
  totalValue: number;
  status: "PENDING" | "FILLED" | "PARTIAL" | "REJECTED" | "CANCELLED";
  alpacaOrderId?: string;
  contributingAgents: string[];
  executedAt: string;
  pnl?: number;
}

export interface TradingDaySummary {
  date: string;
  tradesExecuted: number;
  totalBought: number;
  totalSold: number;
  realizedPnl: number;
  unrealizedPnl: number;
  dollarLimitUsed: number;
  dollarLimitRemaining: number;
}
