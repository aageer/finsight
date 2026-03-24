import type { StockQuote, MarketMover, NewsArticle } from "@/types";

const MOCK_INDICES: StockQuote[] = [
  {
    symbol: "SPY", name: "S&P 500", price: 5842.31, change: 32.45, changePercent: 0.56,
    volume: 3_200_000_000, avgVolume: 2_800_000_000, marketCap: 0, pe: null, eps: null,
    high52w: 6100, low52w: 4800, open: 5810.0, previousClose: 5809.86,
    dayHigh: 5855.0, dayLow: 5805.0, timestamp: new Date().toISOString(),
  },
  {
    symbol: "QQQ", name: "NASDAQ", price: 18456.92, change: 145.23, changePercent: 0.79,
    volume: 2_100_000_000, avgVolume: 1_900_000_000, marketCap: 0, pe: null, eps: null,
    high52w: 19500, low52w: 15200, open: 18320.0, previousClose: 18311.69,
    dayHigh: 18490.0, dayLow: 18300.0, timestamp: new Date().toISOString(),
  },
  {
    symbol: "DIA", name: "DOW", price: 42156.78, change: -89.34, changePercent: -0.21,
    volume: 1_500_000_000, avgVolume: 1_400_000_000, marketCap: 0, pe: null, eps: null,
    high52w: 44000, low52w: 37000, open: 42250.0, previousClose: 42246.12,
    dayHigh: 42300.0, dayLow: 42100.0, timestamp: new Date().toISOString(),
  },
  {
    symbol: "BTC-USD", name: "Bitcoin", price: 87432.50, change: 1245.30, changePercent: 1.44,
    volume: 45_000_000_000, avgVolume: 38_000_000_000, marketCap: 1_720_000_000_000, pe: null, eps: null,
    high52w: 109000, low52w: 58000, open: 86200.0, previousClose: 86187.20,
    dayHigh: 88100.0, dayLow: 85900.0, timestamp: new Date().toISOString(),
  },
  {
    symbol: "TNX", name: "10Y Treasury", price: 4.28, change: -0.03, changePercent: -0.70,
    volume: 0, avgVolume: 0, marketCap: 0, pe: null, eps: null,
    high52w: 5.0, low52w: 3.6, open: 4.31, previousClose: 4.31,
    dayHigh: 4.33, dayLow: 4.26, timestamp: new Date().toISOString(),
  },
  {
    symbol: "VIX", name: "VIX", price: 16.42, change: -0.85, changePercent: -4.92,
    volume: 0, avgVolume: 0, marketCap: 0, pe: null, eps: null,
    high52w: 38, low52w: 12, open: 17.27, previousClose: 17.27,
    dayHigh: 17.50, dayLow: 16.20, timestamp: new Date().toISOString(),
  },
];

const MOCK_HOLDINGS_QUOTES: StockQuote[] = [
  {
    symbol: "AAPL", name: "Apple Inc.", price: 189.42, change: 2.31, changePercent: 1.23,
    volume: 52_000_000, avgVolume: 48_000_000, marketCap: 2_950_000_000_000, pe: 29.8, eps: 6.35,
    high52w: 199.62, low52w: 155.98, open: 187.50, previousClose: 187.11,
    dayHigh: 190.10, dayLow: 187.20, timestamp: new Date().toISOString(),
  },
  {
    symbol: "MSFT", name: "Microsoft Corp.", price: 421.30, change: -1.45, changePercent: -0.34,
    volume: 22_000_000, avgVolume: 25_000_000, marketCap: 3_130_000_000_000, pe: 35.2, eps: 11.97,
    high52w: 468.35, low52w: 362.90, open: 422.50, previousClose: 422.75,
    dayHigh: 423.80, dayLow: 420.10, timestamp: new Date().toISOString(),
  },
  {
    symbol: "NVDA", name: "NVIDIA Corp.", price: 142.89, change: 8.56, changePercent: 6.37,
    volume: 310_000_000, avgVolume: 240_000_000, marketCap: 3_510_000_000_000, pe: 65.1, eps: 2.19,
    high52w: 153.13, low52w: 75.61, open: 135.20, previousClose: 134.33,
    dayHigh: 144.20, dayLow: 134.80, timestamp: new Date().toISOString(),
  },
  {
    symbol: "GOOGL", name: "Alphabet Inc.", price: 176.50, change: 1.82, changePercent: 1.04,
    volume: 28_000_000, avgVolume: 26_000_000, marketCap: 2_180_000_000_000, pe: 23.5, eps: 7.51,
    high52w: 191.75, low52w: 140.53, open: 175.00, previousClose: 174.68,
    dayHigh: 177.20, dayLow: 174.50, timestamp: new Date().toISOString(),
  },
  {
    symbol: "AMZN", name: "Amazon.com Inc.", price: 198.23, change: 3.12, changePercent: 1.60,
    volume: 45_000_000, avgVolume: 42_000_000, marketCap: 2_060_000_000_000, pe: 42.8, eps: 4.63,
    high52w: 215.90, low52w: 151.61, open: 195.80, previousClose: 195.11,
    dayHigh: 199.50, dayLow: 195.20, timestamp: new Date().toISOString(),
  },
  {
    symbol: "META", name: "Meta Platforms", price: 542.18, change: 12.45, changePercent: 2.35,
    volume: 18_000_000, avgVolume: 16_000_000, marketCap: 1_380_000_000_000, pe: 24.6, eps: 22.04,
    high52w: 602.95, low52w: 414.50, open: 530.00, previousClose: 529.73,
    dayHigh: 545.00, dayLow: 528.90, timestamp: new Date().toISOString(),
  },
  {
    symbol: "TSLA", name: "Tesla Inc.", price: 248.92, change: -8.34, changePercent: -3.24,
    volume: 95_000_000, avgVolume: 85_000_000, marketCap: 795_000_000_000, pe: 68.3, eps: 3.65,
    high52w: 488.54, low52w: 138.80, open: 256.00, previousClose: 257.26,
    dayHigh: 258.40, dayLow: 247.50, timestamp: new Date().toISOString(),
  },
];

const MOCK_GAINERS: MarketMover[] = [
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 142.89, change: 8.56, changePercent: 6.37, volume: 310_000_000 },
  { symbol: "META", name: "Meta Platforms", price: 542.18, change: 12.45, changePercent: 2.35, volume: 18_000_000 },
  { symbol: "AMZN", name: "Amazon.com", price: 198.23, change: 3.12, changePercent: 1.60, volume: 45_000_000 },
  { symbol: "BTC-USD", name: "Bitcoin", price: 87432.50, change: 1245.30, changePercent: 1.44, volume: 45_000_000_000 },
  { symbol: "AAPL", name: "Apple Inc.", price: 189.42, change: 2.31, changePercent: 1.23, volume: 52_000_000 },
];

const MOCK_LOSERS: MarketMover[] = [
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.92, change: -8.34, changePercent: -3.24, volume: 95_000_000 },
  { symbol: "BA", name: "Boeing Co.", price: 178.45, change: -4.56, changePercent: -2.49, volume: 12_000_000 },
  { symbol: "DIS", name: "Walt Disney", price: 98.34, change: -1.87, changePercent: -1.87, volume: 8_000_000 },
  { symbol: "INTC", name: "Intel Corp.", price: 22.15, change: -0.38, changePercent: -1.69, volume: 32_000_000 },
  { symbol: "TNX", name: "10Y Treasury", price: 4.28, change: -0.03, changePercent: -0.70, volume: 0 },
];

const MOCK_ACTIVE: MarketMover[] = [
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 142.89, change: 8.56, changePercent: 6.37, volume: 310_000_000 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.92, change: -8.34, changePercent: -3.24, volume: 95_000_000 },
  { symbol: "AAPL", name: "Apple Inc.", price: 189.42, change: 2.31, changePercent: 1.23, volume: 52_000_000 },
  { symbol: "AMZN", name: "Amazon.com", price: 198.23, change: 3.12, changePercent: 1.60, volume: 45_000_000 },
  { symbol: "INTC", name: "Intel Corp.", price: 22.15, change: -0.38, changePercent: -1.69, volume: 32_000_000 },
];

const MOCK_NEWS: NewsArticle[] = [
  {
    title: "NVIDIA Surges on Record Data Center Revenue",
    summary: "NVIDIA reported quarterly earnings that beat analyst expectations driven by unprecedented AI chip demand.",
    source: "Reuters", url: "#", publishedAt: new Date(Date.now() - 1800000).toISOString(),
    sentiment: "bullish", relatedSymbols: ["NVDA"],
  },
  {
    title: "Fed Signals Potential Rate Cut in June Meeting",
    summary: "Federal Reserve minutes suggest committee members are open to easing monetary policy if inflation continues to cool.",
    source: "Bloomberg", url: "#", publishedAt: new Date(Date.now() - 3600000).toISOString(),
    sentiment: "bullish", relatedSymbols: ["SPY", "QQQ"],
  },
  {
    title: "Tesla Faces Increased Competition in China EV Market",
    summary: "BYD and other domestic manufacturers are eroding Tesla's market share with aggressive pricing strategies.",
    source: "CNBC", url: "#", publishedAt: new Date(Date.now() - 7200000).toISOString(),
    sentiment: "bearish", relatedSymbols: ["TSLA"],
  },
  {
    title: "Apple Vision Pro Sales Below Expectations",
    summary: "Industry analysts report slower-than-expected adoption of Apple's mixed reality headset in enterprise markets.",
    source: "WSJ", url: "#", publishedAt: new Date(Date.now() - 10800000).toISOString(),
    sentiment: "bearish", relatedSymbols: ["AAPL"],
  },
  {
    title: "S&P 500 Hits All-Time High Amid Tech Rally",
    summary: "Broad market indices pushed higher led by mega-cap technology stocks and improving economic outlook.",
    source: "MarketWatch", url: "#", publishedAt: new Date(Date.now() - 14400000).toISOString(),
    sentiment: "bullish", relatedSymbols: ["SPY"],
  },
];

export function getMarketIndices(): StockQuote[] {
  return MOCK_INDICES;
}

export function getWatchlistQuotes(): StockQuote[] {
  return MOCK_HOLDINGS_QUOTES;
}

export function getMarketMovers() {
  return { gainers: MOCK_GAINERS, losers: MOCK_LOSERS, mostActive: MOCK_ACTIVE };
}

export function getMarketNews(): NewsArticle[] {
  return MOCK_NEWS;
}

export function getPortfolioSummary() {
  return {
    totalValue: 124_892.45,
    totalCostBasis: 108_450.00,
    dayChange: 1_203.42,
    dayChangePercent: 0.97,
    totalGain: 16_442.45,
    totalGainPercent: 15.16,
  };
}

export function getPortfolioHoldings() {
  return [
    { id: "1", symbol: "AAPL", name: "Apple Inc.", quantity: 50, avgCostBasis: 165.20, currentPrice: 189.42, marketValue: 9471.00, gainLoss: 1211.00, gainLossPercent: 14.67, dayChange: 2.31, dayChangePercent: 1.23, weight: 7.58, sector: "Technology", assetType: "stock" as const },
    { id: "2", symbol: "MSFT", name: "Microsoft Corp.", quantity: 30, avgCostBasis: 350.00, currentPrice: 421.30, marketValue: 12639.00, gainLoss: 2139.00, gainLossPercent: 20.37, dayChange: -1.45, dayChangePercent: -0.34, weight: 10.12, sector: "Technology", assetType: "stock" as const },
    { id: "3", symbol: "NVDA", name: "NVIDIA Corp.", quantity: 100, avgCostBasis: 95.50, currentPrice: 142.89, marketValue: 14289.00, gainLoss: 4739.00, gainLossPercent: 49.63, dayChange: 8.56, dayChangePercent: 6.37, weight: 11.44, sector: "Technology", assetType: "stock" as const },
    { id: "4", symbol: "GOOGL", name: "Alphabet Inc.", quantity: 40, avgCostBasis: 142.80, currentPrice: 176.50, marketValue: 7060.00, gainLoss: 1348.00, gainLossPercent: 23.60, dayChange: 1.82, dayChangePercent: 1.04, weight: 5.65, sector: "Technology", assetType: "stock" as const },
    { id: "5", symbol: "AMZN", name: "Amazon.com", quantity: 25, avgCostBasis: 160.00, currentPrice: 198.23, marketValue: 4955.75, gainLoss: 955.75, gainLossPercent: 23.89, dayChange: 3.12, dayChangePercent: 1.60, weight: 3.97, sector: "Consumer Cyclical", assetType: "stock" as const },
  ];
}

export function getAgentStatuses() {
  return [
    { id: "1", name: "AnalysisAgent", type: "ANALYSIS" as const, status: "IDLE" as const, description: "Multi-factor stock analysis" },
    { id: "2", name: "ResearchAgent", type: "RESEARCH" as const, status: "RUNNING" as const, description: "Autonomous strategy discovery", lastRunAt: new Date().toISOString() },
    { id: "3", name: "SwarmAgent", type: "SWARM_CONTROLLER" as const, status: "IDLE" as const, description: "Market sentiment simulation" },
    { id: "4", name: "NewsAgent", type: "NEWS" as const, status: "RUNNING" as const, description: "Real-time news monitoring", lastRunAt: new Date().toISOString() },
    { id: "5", name: "RiskAgent", type: "RISK" as const, status: "IDLE" as const, description: "Portfolio risk assessment" },
    { id: "6", name: "AlertAgent", type: "ALERT" as const, status: "RUNNING" as const, description: "Price & event monitoring", lastRunAt: new Date().toISOString() },
  ];
}
