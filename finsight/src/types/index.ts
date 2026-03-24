export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  pe: number | null;
  eps: number | null;
  high52w: number;
  low52w: number;
  open: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  timestamp: string;
}

export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TimeRange = "1D" | "5D" | "1M" | "3M" | "6M" | "1Y" | "5Y" | "MAX";

export interface CompanyProfile {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  description: string;
  ceo: string;
  employees: number;
  headquarters: string;
  website: string;
  marketCap: number;
  exchange: string;
  logo?: string;
}

export interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: "bullish" | "bearish" | "neutral";
  relatedSymbols: string[];
}

export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export type AgentType =
  | "ANALYSIS"
  | "RESEARCH"
  | "SWARM_CONTROLLER"
  | "RISK"
  | "NEWS"
  | "REPORT"
  | "ALERT"
  | "CUSTOM";

export type AgentStatus = "IDLE" | "RUNNING" | "ERROR" | "DISABLED";

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  description: string;
  lastRunAt?: string;
  lastResult?: Record<string, unknown>;
}

export interface AgentRun {
  id: string;
  agentId: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  reasoning?: string[];
  tokensUsed?: number;
  durationMs?: number;
  startedAt?: string;
  completedAt?: string;
}

export interface ResearchExperiment {
  id: string;
  programId: string;
  hypothesis: string;
  parameters: Record<string, unknown>;
  results?: Record<string, unknown>;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "IMPROVED" | "REGRESSED";
  metricValue?: number;
  duration?: number;
  createdAt: string;
}

export interface SwarmSimulation {
  id: string;
  name: string;
  scenario: Record<string, unknown>;
  agentCount: number;
  status: "CONFIGURING" | "RUNNING" | "ANALYZING" | "COMPLETED" | "FAILED";
  results?: {
    bullish: number;
    neutral: number;
    bearish: number;
    predictedImpact: string;
    confidence: number;
  };
  createdAt: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCostBasis: number;
  dayChange: number;
  dayChangePercent: number;
  totalGain: number;
  totalGainPercent: number;
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgCostBasis: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  weight: number;
  sector: string;
  assetType: "stock" | "etf" | "crypto" | "bond";
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  addedAt: string;
  notes?: string;
}

export interface Alert {
  id: string;
  symbol: string;
  alertType: "price_above" | "price_below" | "percent_change" | "volume_spike" | "sentiment_shift";
  threshold: number;
  isActive: boolean;
  triggeredAt?: string;
  createdAt: string;
}

export interface FinSightAnalysis {
  symbol: string;
  generatedAt: string;
  summary: string;
  sentiment: "strong_bullish" | "bullish" | "neutral" | "bearish" | "strong_bearish";
  sentimentScore: number;
  confidence: number;
  recommendation: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
  fundamentalOutlook: string;
  technicalOutlook: string;
  catalysts: { title: string; impact: "positive" | "negative" | "neutral"; detail: string }[];
  risks: { title: string; severity: "high" | "medium" | "low"; detail: string }[];
  priceTargets: { bear: number; base: number; bull: number; timeframe: string };
  keyMetrics: { name: string; value: string; assessment: "positive" | "negative" | "neutral" }[];
  sources: { title: string; url?: string; type: string }[];
}
