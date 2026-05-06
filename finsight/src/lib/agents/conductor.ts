/**
 * ConductorAgent — The orchestrator of the FinSight multi-agent pipeline.
 * Inspired by: TradingAgents (Tauric Research) + ai-hedge-fund (virattt)
 *
 * Pipeline: Analysts → Bull/Bear Debate → Trader → Risk → Report
 */

import { getGeminiPro, getGeminiFlash, getGeminiFlashText, callGemini, isGeminiConfigured } from "./gemini-client";
import { computeAllIndicators, type AllIndicators } from "@/lib/quant/indicators";
import type { StockQuote, OHLCV, CompanyProfile, NewsArticle, FinSightAnalysis } from "@/types";

// ─── Agent Output Types ───────────────────────────────
interface AnalystReport {
  agent: string;
  assessment: string;
  signal: "bullish" | "bearish" | "neutral";
  confidence: number;
  keyFindings: string[];
  score: number; // -100 to +100
}

interface DebateResult {
  bullThesis: string;
  bearThesis: string;
  judgeDecision: string;
  winner: "bull" | "bear" | "tie";
  conviction: number;
}

interface TraderDecision {
  action: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
  conviction: number;
  reasoning: string;
  priceTargets: { bear: number; base: number; bull: number };
}

interface RiskAssessment {
  approved: boolean;
  riskLevel: "low" | "medium" | "high" | "extreme";
  concerns: string[];
  adjustedAction?: string;
}

// ─── Progress Callback ────────────────────────────────
export type ProgressCallback = (stage: string, status: "running" | "complete" | "error", agent?: string, data?: unknown) => void;

// ─── Main Pipeline ────────────────────────────────────
export async function runAnalysisPipeline(
  quote: StockQuote,
  profile: CompanyProfile,
  history: OHLCV[],
  news: NewsArticle[],
  onProgress?: ProgressCallback
): Promise<FinSightAnalysis> {
  // Check if Gemini is configured
  if (!isGeminiConfigured()) {
    return generateMockAnalysis(quote, profile, history);
  }

  const closePrices = history.map((d) => d.close);
  const indicators = computeAllIndicators(closePrices);

  // ─── Phase 1: Analyst Team (Parallel) ───────────────
  onProgress?.("analysts", "running");

  const [fundamental, technical, sentiment, newsAnalysis] = await Promise.allSettled([
    runFundamentalAnalyst(quote, profile),
    runTechnicalAnalyst(quote, indicators),
    runSentimentAnalyst(news, quote.symbol),
    runNewsAnalyst(news, quote.symbol),
  ]);

  const analystReports = [
    fundamental.status === "fulfilled" ? fundamental.value : fallbackReport("FundamentalAnalyst"),
    technical.status === "fulfilled" ? technical.value : fallbackReport("TechnicalAnalyst"),
    sentiment.status === "fulfilled" ? sentiment.value : fallbackReport("SentimentAnalyst"),
    newsAnalysis.status === "fulfilled" ? newsAnalysis.value : fallbackReport("NewsAnalyst"),
  ];

  onProgress?.("analysts", "complete", undefined, analystReports);

  // ─── Phase 2: Bull/Bear Researcher Debate ───────────
  onProgress?.("debate", "running");
  const debate = await runBullBearDebate(analystReports, quote, profile);
  onProgress?.("debate", "complete", undefined, debate);

  // ─── Phase 3: Trader Decision ───────────────────────
  onProgress?.("trader", "running");
  const traderDecision = await runTrader(analystReports, debate, quote, profile);
  onProgress?.("trader", "complete", undefined, traderDecision);

  // ─── Phase 4: Risk Management ───────────────────────
  onProgress?.("risk", "running");
  const riskAssessment = await runRiskManager(traderDecision, indicators, quote);
  onProgress?.("risk", "complete", undefined, riskAssessment);

  // ─── Phase 5: Report Synthesis ──────────────────────
  onProgress?.("report", "running");
  const report = await synthesizeReport(
    quote, profile, analystReports, debate, traderDecision, riskAssessment, indicators, news
  );
  onProgress?.("report", "complete", undefined, report);

  return report;
}

// ─── Analyst Agents ───────────────────────────────────

async function runFundamentalAnalyst(quote: StockQuote, profile: CompanyProfile): Promise<AnalystReport> {
  const model = getGeminiFlash();
  const prompt = `You are the FundamentalAnalyst agent at FinSight, an AI hedge fund (inspired by Aswath Damodaran and Warren Buffett).
Analyze the fundamental financial data for ${quote.symbol} (${profile.name}).

DATA:
- Price: $${quote.price} | Change: ${quote.changePercent}%
- Market Cap: $${(quote.marketCap / 1e9).toFixed(1)}B
- P/E: ${quote.pe || "N/A"} | EPS: $${quote.eps || "N/A"}
- Sector: ${profile.sector} | Industry: ${profile.industry}
- 52W High: $${quote.high52w} | 52W Low: $${quote.low52w}

Respond in JSON:
{
  "agent": "FundamentalAnalyst",
  "assessment": "2-3 sentence assessment",
  "signal": "bullish" | "bearish" | "neutral",
  "confidence": 0.0 to 1.0,
  "keyFindings": ["finding1", "finding2", "finding3"],
  "score": -100 to +100
}`;

  const result = await callGemini<AnalystReport>(model, prompt, "FundamentalAnalyst");
  return result.data || fallbackReport("FundamentalAnalyst");
}

async function runTechnicalAnalyst(quote: StockQuote, indicators: AllIndicators): Promise<AnalystReport> {
  const model = getGeminiFlash();
  const prompt = `You are the TechnicalAnalyst agent at FinSight, specializing in quantitative chart analysis (inspired by the quant strategies in Algorithmic_Trading_Machine_Learning).
Analyze the technical indicators for ${quote.symbol}.

COMPUTED INDICATORS:
- RSI(14): ${indicators.rsi.value} — Signal: ${indicators.rsi.signal} (${indicators.rsi.strength})
- MACD: ${indicators.macd.value} — Signal: ${indicators.macd.signal} (${indicators.macd.strength})
- Bollinger %B: ${indicators.bollinger.value} — Bandwidth: ${indicators.bollinger.bandwidth}
- 52W Position: ${indicators.position52w.value}% (High: $${indicators.position52w.high52w}, Low: $${indicators.position52w.low52w})
- Volatility: ${indicators.volatility.value}%
- Max Drawdown: ${indicators.maxDrawdown.value}%
- Overall Quant Score: ${indicators.overallScore}/100

Respond in JSON:
{
  "agent": "TechnicalAnalyst",
  "assessment": "2-3 sentence technical assessment",
  "signal": "bullish" | "bearish" | "neutral",
  "confidence": 0.0 to 1.0,
  "keyFindings": ["finding1", "finding2", "finding3"],
  "score": -100 to +100
}`;

  const result = await callGemini<AnalystReport>(model, prompt, "TechnicalAnalyst");
  return result.data || fallbackReport("TechnicalAnalyst");
}

async function runSentimentAnalyst(news: NewsArticle[], symbol: string): Promise<AnalystReport> {
  const model = getGeminiFlash();
  const headlines = news.slice(0, 8).map((n) => `[${n.sentiment}] ${n.title} (${n.source})`).join("\n");

  const prompt = `You are the SentimentAnalyst agent at FinSight. Analyze market sentiment for ${symbol}.

RECENT HEADLINES:
${headlines}

Respond in JSON:
{
  "agent": "SentimentAnalyst",
  "assessment": "2-3 sentence sentiment assessment",
  "signal": "bullish" | "bearish" | "neutral",
  "confidence": 0.0 to 1.0,
  "keyFindings": ["finding1", "finding2", "finding3"],
  "score": -100 to +100
}`;

  const result = await callGemini<AnalystReport>(model, prompt, "SentimentAnalyst");
  return result.data || fallbackReport("SentimentAnalyst");
}

async function runNewsAnalyst(news: NewsArticle[], symbol: string): Promise<AnalystReport> {
  const model = getGeminiFlash();
  const articles = news.slice(0, 6).map((n) => `- ${n.title}: ${n.summary} [${n.source}]`).join("\n");

  const prompt = `You are the NewsAnalyst agent at FinSight (inspired by Nassim Taleb's approach to tail risks).
Analyze the news events and their macro/micro impact on ${symbol}.

ARTICLES:
${articles}

Respond in JSON:
{
  "agent": "NewsAnalyst",
  "assessment": "2-3 sentence news impact assessment",
  "signal": "bullish" | "bearish" | "neutral",
  "confidence": 0.0 to 1.0,
  "keyFindings": ["finding1", "finding2", "finding3"],
  "score": -100 to +100
}`;

  const result = await callGemini<AnalystReport>(model, prompt, "NewsAnalyst");
  return result.data || fallbackReport("NewsAnalyst");
}

// ─── Bull/Bear Debate ─────────────────────────────────

async function runBullBearDebate(reports: AnalystReport[], quote: StockQuote, profile: CompanyProfile): Promise<DebateResult> {
  const model = getGeminiPro();
  const reportsText = reports.map((r) => `[${r.agent}] Signal: ${r.signal}, Score: ${r.score}, Assessment: ${r.assessment}`).join("\n");

  const prompt = `You are the InvestmentDebateJudge at FinSight (inspired by TradingAgents research debate system).

ANALYST REPORTS for ${quote.symbol} (${profile.name}, ${profile.sector}):
${reportsText}

Run an internal Bull vs Bear debate:
1. The Bull Researcher (inspired by Cathie Wood) must build the strongest bullish case citing analyst data
2. The Bear Researcher (inspired by Michael Burry) must build the strongest bearish case citing analyst data
3. As the judge, evaluate both arguments objectively

Respond in JSON:
{
  "bullThesis": "2-3 sentences making the strongest bull case",
  "bearThesis": "2-3 sentences making the strongest bear case",
  "judgeDecision": "2-3 sentences explaining who wins and why",
  "winner": "bull" | "bear" | "tie",
  "conviction": 0.0 to 1.0
}`;

  const result = await callGemini<DebateResult>(model, prompt, "InvestmentDebate");
  return result.data || { bullThesis: "Insufficient data for bull case.", bearThesis: "Insufficient data for bear case.", judgeDecision: "Unable to determine.", winner: "tie", conviction: 0.5 };
}

// ─── Trader Agent ─────────────────────────────────────

async function runTrader(reports: AnalystReport[], debate: DebateResult, quote: StockQuote, profile: CompanyProfile): Promise<TraderDecision> {
  const model = getGeminiPro();
  const avgScore = reports.reduce((s, r) => s + r.score, 0) / reports.length;

  const prompt = `You are the TraderAgent at FinSight (inspired by Stanley Druckenmiller's macro approach and Peter Lynch's practical investing).

SYMBOL: ${quote.symbol} (${profile.name}) — Current Price: $${quote.price}
AVG ANALYST SCORE: ${avgScore.toFixed(0)}/100
DEBATE WINNER: ${debate.winner} (Conviction: ${debate.conviction})
JUDGE: ${debate.judgeDecision}

Based on all inputs, make your trading decision.

Respond in JSON:
{
  "action": "strong_buy" | "buy" | "hold" | "sell" | "strong_sell",
  "conviction": 0.0 to 1.0,
  "reasoning": "2-3 sentence reasoning",
  "priceTargets": { "bear": number, "base": number, "bull": number }
}

Price targets should be realistic within a 12-month timeframe based on the stock's current price of $${quote.price}.`;

  const result = await callGemini<TraderDecision>(model, prompt, "TraderAgent");
  return result.data || {
    action: "hold",
    conviction: 0.5,
    reasoning: "Insufficient data for a confident assessment.",
    priceTargets: { bear: quote.price * 0.85, base: quote.price * 1.05, bull: quote.price * 1.25 },
  };
}

// ─── Risk Manager ─────────────────────────────────────

async function runRiskManager(trader: TraderDecision, indicators: AllIndicators, quote: StockQuote): Promise<RiskAssessment> {
  const model = getGeminiFlash();

  const prompt = `You are the RiskManager at FinSight (inspired by Nassim Taleb's antifragility principles).

TRADER PROPOSAL: ${trader.action} ${quote.symbol} at $${quote.price} (Conviction: ${trader.conviction})
RISK METRICS:
- Volatility: ${indicators.volatility.value}%
- Max Drawdown: ${indicators.maxDrawdown.value}%
- RSI: ${indicators.rsi.value} (${indicators.rsi.signal})

Evaluate the trader's proposal from a risk management perspective.

Respond in JSON:
{
  "approved": true | false,
  "riskLevel": "low" | "medium" | "high" | "extreme",
  "concerns": ["concern1", "concern2"],
  "adjustedAction": null or "hold" (if you reject the proposal)
}`;

  const result = await callGemini<RiskAssessment>(model, prompt, "RiskManager");
  return result.data || { approved: true, riskLevel: "medium", concerns: ["Unable to fully assess risk with available data."] };
}

// ─── Report Synthesizer ───────────────────────────────

async function synthesizeReport(
  quote: StockQuote,
  profile: CompanyProfile,
  reports: AnalystReport[],
  debate: DebateResult,
  trader: TraderDecision,
  risk: RiskAssessment,
  indicators: AllIndicators,
  news: NewsArticle[]
): Promise<FinSightAnalysis> {
  const model = getGeminiFlashText();

  const finalAction = risk.approved ? trader.action : (risk.adjustedAction || "hold") as FinSightAnalysis["recommendation"];

  const prompt = `You are the ReportAgent at FinSight. Synthesize all agent outputs into a final comprehensive analysis report.

SYMBOL: ${quote.symbol} (${profile.name})
SECTOR: ${profile.sector} | INDUSTRY: ${profile.industry}
PRICE: $${quote.price} | CHANGE: ${quote.changePercent}%

ANALYST REPORTS:
${reports.map((r) => `- ${r.agent}: ${r.signal} (Score: ${r.score}) — ${r.assessment}`).join("\n")}

DEBATE: Winner = ${debate.winner}, Judge says: ${debate.judgeDecision}

TRADER: ${trader.action} (Conviction: ${trader.conviction}) — ${trader.reasoning}
PRICE TARGETS: Bear $${trader.priceTargets.bear?.toFixed(2)} | Base $${trader.priceTargets.base?.toFixed(2)} | Bull $${trader.priceTargets.bull?.toFixed(2)}

RISK: ${risk.approved ? "APPROVED" : "REJECTED"} — Level: ${risk.riskLevel}
${risk.concerns.length > 0 ? "Concerns: " + risk.concerns.join(", ") : ""}

QUANT INDICATORS:
- RSI: ${indicators.rsi.value} | MACD Signal: ${indicators.macd.signal}
- Volatility: ${indicators.volatility.value}% | Overall Quant Score: ${indicators.overallScore}

Write a comprehensive 3-4 paragraph summary report in flowing prose (Perplexity-style) that synthesizes all findings, explains the reasoning chain, and gives a clear recommendation. Include what normal people should understand about this stock.

Also list 3 key catalysts (positive or negative) and 3 risk factors.

Respond in JSON:
{
  "summary": "3-4 paragraph Perplexity-style analysis summary",
  "fundamentalOutlook": "1-2 sentence fundamental outlook",
  "technicalOutlook": "1-2 sentence technical outlook",
  "catalysts": [{"title": "...", "impact": "positive"|"negative"|"neutral", "detail": "..."}],
  "risks": [{"title": "...", "severity": "high"|"medium"|"low", "detail": "..."}],
  "keyMetrics": [{"name": "...", "value": "...", "assessment": "positive"|"negative"|"neutral"}]
}`;

  const result = await callGemini<{
    summary: string;
    fundamentalOutlook: string;
    technicalOutlook: string;
    catalysts: FinSightAnalysis["catalysts"];
    risks: FinSightAnalysis["risks"];
    keyMetrics: FinSightAnalysis["keyMetrics"];
  }>(model, prompt, "ReportAgent");

  const reportData = result.data;

  // Map sentiment
  const avgScore = reports.reduce((s, r) => s + r.score, 0) / reports.length;
  const sentimentMap: Record<string, FinSightAnalysis["sentiment"]> = {
    strong_buy: "strong_bullish",
    buy: "bullish",
    hold: "neutral",
    sell: "bearish",
    strong_sell: "strong_bearish",
  };

  return {
    symbol: quote.symbol,
    generatedAt: new Date().toISOString(),
    summary: reportData?.summary || "Analysis completed with limited data. Please configure your GOOGLE_API_KEY for full AI-powered insights.",
    sentiment: sentimentMap[finalAction] || "neutral",
    sentimentScore: Math.round(((avgScore + 100) / 200) * 100),
    confidence: trader.conviction,
    recommendation: finalAction as FinSightAnalysis["recommendation"],
    fundamentalOutlook: reportData?.fundamentalOutlook || reports[0]?.assessment || "N/A",
    technicalOutlook: reportData?.technicalOutlook || reports[1]?.assessment || "N/A",
    catalysts: reportData?.catalysts || [{ title: "AI Analysis", impact: "neutral", detail: "Configure GOOGLE_API_KEY for full analysis." }],
    risks: reportData?.risks || [{ title: "Data Limitations", severity: "medium", detail: "Using limited data sources." }],
    priceTargets: {
      bear: trader.priceTargets.bear || quote.price * 0.85,
      base: trader.priceTargets.base || quote.price * 1.05,
      bull: trader.priceTargets.bull || quote.price * 1.25,
      timeframe: "12 months",
    },
    keyMetrics: reportData?.keyMetrics || [
      { name: "P/E Ratio", value: String(quote.pe || "N/A"), assessment: "neutral" },
      { name: "RSI", value: String(indicators.rsi.value), assessment: indicators.rsi.signal === "bullish" ? "positive" : indicators.rsi.signal === "bearish" ? "negative" : "neutral" },
    ],
    sources: [
      { title: "Fundamental Analysis", type: "agent" },
      { title: "Technical Analysis (Quant Engine)", type: "agent" },
      { title: "Sentiment Analysis", type: "agent" },
      { title: "Market News", type: "data" },
      { title: "Alpha Vantage", type: "data" },
    ],
  };
}

// ─── Mock Analysis (when Gemini is not configured) ────

function generateMockAnalysis(quote: StockQuote, profile: CompanyProfile, history: OHLCV[]): FinSightAnalysis {
  const indicators = computeAllIndicators(history.map((h) => h.close));

  return {
    symbol: quote.symbol,
    generatedAt: new Date().toISOString(),
    summary: `${profile.name} (${quote.symbol}) is currently trading at $${quote.price.toFixed(2)}, ${quote.changePercent >= 0 ? "up" : "down"} ${Math.abs(quote.changePercent).toFixed(2)}% today. The stock is in the ${profile.sector} sector. Our multi-agent analysis system has evaluated fundamental metrics, technical indicators, market sentiment, and recent news to provide this comprehensive assessment.\n\nBased on our quant engine analysis, the RSI stands at ${indicators.rsi.value} (${indicators.rsi.signal}), MACD is showing a ${indicators.macd.signal} signal, and the overall technical score is ${indicators.overallScore}/100. The stock's volatility is ${indicators.volatility.value}% annualized.\n\nTo get full AI-powered analysis from our Gemini 2.5 agent swarm, please configure your GOOGLE_API_KEY in the .env.local file. The free tier from Google AI Studio provides generous credits through your Gemini Ultra membership.`,
    sentiment: indicators.overallSignal === "bullish" ? "bullish" : indicators.overallSignal === "bearish" ? "bearish" : "neutral",
    sentimentScore: Math.round(((indicators.overallScore + 100) / 200) * 100),
    confidence: 0.6,
    recommendation: indicators.overallScore > 30 ? "buy" : indicators.overallScore < -30 ? "sell" : "hold",
    fundamentalOutlook: `P/E ratio of ${quote.pe || "N/A"} with EPS of $${quote.eps || "N/A"} in the ${profile.industry} industry.`,
    technicalOutlook: `RSI at ${indicators.rsi.value} (${indicators.rsi.signal}), MACD ${indicators.macd.signal}, overall quant score ${indicators.overallScore}/100.`,
    catalysts: [
      { title: "Technical Momentum", impact: indicators.overallSignal === "bullish" ? "positive" : "negative", detail: `Overall quant score of ${indicators.overallScore} suggests ${indicators.overallSignal} momentum.` },
      { title: "Sector Performance", impact: "neutral", detail: `${profile.sector} sector dynamics will influence near-term performance.` },
      { title: "Market Conditions", impact: "neutral", detail: "Broader market conditions and macro environment remain a key driver." },
    ],
    risks: [
      { title: "Market Volatility", severity: indicators.volatility.value > 35 ? "high" : "medium", detail: `Annualized volatility at ${indicators.volatility.value}%.` },
      { title: "Technical Overextension", severity: indicators.rsi.value > 70 || indicators.rsi.value < 30 ? "high" : "low", detail: `RSI at ${indicators.rsi.value} — ${indicators.rsi.value > 70 ? "overbought territory" : indicators.rsi.value < 30 ? "oversold territory" : "normal range"}.` },
      { title: "Drawdown Risk", severity: Math.abs(indicators.maxDrawdown.value) > 20 ? "high" : "medium", detail: `Maximum drawdown of ${indicators.maxDrawdown.value}% in the analysis period.` },
    ],
    priceTargets: {
      bear: +(quote.price * 0.85).toFixed(2),
      base: +(quote.price * 1.08).toFixed(2),
      bull: +(quote.price * 1.25).toFixed(2),
      timeframe: "12 months",
    },
    keyMetrics: [
      { name: "P/E Ratio", value: String(quote.pe?.toFixed(1) || "N/A"), assessment: (quote.pe || 0) < 25 ? "positive" : (quote.pe || 0) > 50 ? "negative" : "neutral" },
      { name: "RSI (14)", value: String(indicators.rsi.value), assessment: indicators.rsi.signal === "bullish" ? "positive" : indicators.rsi.signal === "bearish" ? "negative" : "neutral" },
      { name: "MACD", value: indicators.macd.signal, assessment: indicators.macd.signal === "bullish" ? "positive" : indicators.macd.signal === "bearish" ? "negative" : "neutral" },
      { name: "Volatility", value: `${indicators.volatility.value}%`, assessment: indicators.volatility.value < 25 ? "positive" : indicators.volatility.value > 40 ? "negative" : "neutral" },
      { name: "Quant Score", value: `${indicators.overallScore}/100`, assessment: indicators.overallScore > 20 ? "positive" : indicators.overallScore < -20 ? "negative" : "neutral" },
    ],
    sources: [
      { title: "FinSight Quant Engine", type: "agent" },
      { title: "Mock Data (configure GOOGLE_API_KEY for live analysis)", type: "system" },
    ],
  };
}

function fallbackReport(agent: string): AnalystReport {
  return {
    agent,
    assessment: "Unable to generate assessment — API key may be missing or rate-limited.",
    signal: "neutral",
    confidence: 0.3,
    keyFindings: ["Insufficient data for full analysis"],
    score: 0,
  };
}
