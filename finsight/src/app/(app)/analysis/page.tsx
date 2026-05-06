"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Search,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Shield,
  Newspaper,
  ChevronDown,
  ChevronRight,
  Brain,
  Target,
  AlertTriangle,
  Zap,
  Bot,
  Clock,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/shared/section-header";
import { PriceChange } from "@/components/shared/price-change";
import { PriceChart } from "@/components/charts/price-chart";
import { QuantsExplained } from "@/components/analysis/quants-explained";
import { useQuote, useHistory, useProfile, useNews, useIndicators } from "@/lib/hooks/use-market-data";
import type { FinSightAnalysis, TimeRange } from "@/types";
import { cn } from "@/lib/utils";
import { formatCurrency, formatCompactNumber, formatPercent, getChangeColor } from "@/lib/utils/format";

// ─── Recommendation Config ───────────────────────────
const REC_CONFIG: Record<string, { label: string; bg: string; text: string; glow: string }> = {
  strong_buy: { label: "STRONG BUY", bg: "bg-emerald-500/20", text: "text-emerald-400", glow: "shadow-emerald-500/20" },
  buy: { label: "BUY", bg: "bg-green-500/20", text: "text-green-400", glow: "shadow-green-500/20" },
  hold: { label: "HOLD", bg: "bg-amber-500/20", text: "text-amber-400", glow: "shadow-amber-500/20" },
  sell: { label: "SELL", bg: "bg-red-500/20", text: "text-red-400", glow: "shadow-red-500/20" },
  strong_sell: { label: "STRONG SELL", bg: "bg-rose-600/20", text: "text-rose-400", glow: "shadow-rose-600/20" },
};

// ─── Agent Pipeline Steps ─────────────────────────────
const PIPELINE_STEPS = [
  { key: "data", label: "Fetching Market Data", icon: Activity },
  { key: "analysts", label: "Analyst Team (4 Agents)", icon: Brain },
  { key: "debate", label: "Bull vs Bear Debate", icon: Zap },
  { key: "trader", label: "Trader Decision", icon: Target },
  { key: "risk", label: "Risk Assessment", icon: Shield },
  { key: "report", label: "Report Synthesis", icon: Sparkles },
];

function AnalysisContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get("symbol") || "";

  const [searchInput, setSearchInput] = useState(initialSymbol);
  const [activeSymbol, setActiveSymbol] = useState(initialSymbol);
  const [analysis, setAnalysis] = useState<FinSightAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(-1);
  const [range, setRange] = useState<TimeRange>("1Y");
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  // Data hooks
  const { data: quote, isLoading: quoteLoading } = useQuote(activeSymbol || null);
  const { data: history } = useHistory(activeSymbol || null, range);
  const { data: profile } = useProfile(activeSymbol || null);
  const { data: news } = useNews(activeSymbol || null);
  const { data: indicators } = useIndicators(activeSymbol || null);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveSymbol(searchInput.trim().toUpperCase());
      setAnalysis(null);
    }
  }, [searchInput]);

  const runAnalysis = useCallback(async () => {
    if (!activeSymbol) return;
    setAnalyzing(true);
    setAnalysis(null);

    // Simulate pipeline progress
    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      setPipelineStep(i);
      if (i < PIPELINE_STEPS.length - 1) {
        await new Promise((r) => setTimeout(r, i === 1 ? 2000 : 1000));
      }
    }

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: activeSymbol }),
      });
      const data = await res.json();
      if (data.error) {
        console.error("Analysis error:", data.error);
      } else {
        setAnalysis(data as FinSightAnalysis);
      }
    } catch (err) {
      console.error("Analysis fetch error:", err);
    } finally {
      setPipelineStep(PIPELINE_STEPS.length);
      setAnalyzing(false);
    }
  }, [activeSymbol]);

  const toggleAgent = (agent: string) => {
    setExpandedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agent)) next.delete(agent);
      else next.add(agent);
      return next;
    });
  };

  const rec = analysis ? REC_CONFIG[analysis.recommendation] || REC_CONFIG.hold : null;

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-3.5 w-3.5 text-[var(--color-accent-orange)]" />
          <h1 className="font-mono-terminal text-xs font-bold tracking-tight uppercase">AI Stock Analysis</h1>
          <span className="font-mono-terminal text-[9px] text-[oklch(0.4_0_0)]">Gemini 2.5 Pro • 8-Agent Pipeline</span>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-1">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[oklch(0.4_0_0)]" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter ticker symbol (e.g., NVDA, AAPL, TSLA)"
            className="pl-7 h-7 font-mono-terminal text-[11px] bg-[#0a0a0a] border-[#1a1a1a] rounded-sm"
          />
        </div>
        <Button type="submit" variant="outline" className="h-7 px-3 text-[10px] font-mono-terminal rounded-sm">
          <Search className="h-3 w-3 mr-1" /> Lookup
        </Button>
      </form>

      {/* No Symbol State */}
      {!activeSymbol && (
        <div className="terminal-panel flex flex-col items-center justify-center py-10">
          <Bot className="h-8 w-8 text-[oklch(0.2_0_0)] mb-3" />
          <p className="data-dense text-[oklch(0.4_0_0)]">Enter a stock ticker to begin analysis</p>
          <div className="mt-3 flex gap-1">
            {["NVDA", "AAPL", "MSFT", "TSLA", "GOOGL"].map((sym) => (
              <button
                key={sym}
                onClick={() => { setSearchInput(sym); setActiveSymbol(sym); }}
                className="rounded-sm border border-[#1a1a1a] px-2 py-1 font-mono-terminal text-[10px] text-[oklch(0.45_0_0)] hover:border-[var(--color-accent-orange)] hover:text-[var(--color-accent-orange)] transition-colors"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stock Data View */}
      {activeSymbol && (
        <>
          {/* Company Header */}
          {quote && (
            <div className="terminal-panel">
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <span className="data-value text-sm font-bold">{quote.symbol}</span>
                  <Badge variant="outline" className="text-[7px] h-4 px-1 rounded-sm border-[#1a1a1a]">{profile?.exchange || "NASDAQ"}</Badge>
                  <Badge variant="outline" className="text-[7px] h-4 px-1 rounded-sm border-[#1a1a1a] text-[oklch(0.4_0_0)]">{profile?.sector || ""}</Badge>
                  <span className="data-dense text-[oklch(0.4_0_0)]">{profile?.name || quote.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="data-value text-base">{formatCurrency(quote.price)}</span>
                  <PriceChange change={quote.change} changePercent={quote.changePercent} showIcon size="md" />
                </div>
              </div>
              {/* Dense Stats Bar */}
              <div className="flex border-t border-[#1a1a1a] divide-x divide-[#1a1a1a]">
                {[
                  { label: "Mkt Cap", value: formatCompactNumber(quote.marketCap) },
                  { label: "P/E", value: quote.pe?.toFixed(1) || "N/A" },
                  { label: "EPS", value: quote.eps ? `$${quote.eps.toFixed(2)}` : "N/A" },
                  { label: "Volume", value: formatCompactNumber(quote.volume) },
                  { label: "52W High", value: formatCurrency(quote.high52w) },
                  { label: "52W Low", value: formatCurrency(quote.low52w) },
                ].map((stat) => (
                  <div key={stat.label} className="flex-1 px-2 py-1.5">
                    <p className="data-label">{stat.label}</p>
                    <p className="data-value text-[11px] mt-0.5">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart + Analyze Button */}
          <div className="grid grid-cols-12 gap-1">
            <div className="terminal-panel col-span-12 lg:col-span-8">
              <div className="p-1.5">
                {history && history.length > 0 ? (
                  <PriceChart data={history} range={range} onRangeChange={setRange} height={280} />
                ) : (
                  <div className="flex h-[280px] items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-[oklch(0.35_0_0)]" />
                  </div>
                )}
              </div>
            </div>

            {/* Analyze CTA + Pipeline */}
            <div className="col-span-12 lg:col-span-4 space-y-1">
              <div className="terminal-panel border-[var(--color-accent-orange)]/20">
                <div className="p-2">
                  <Button
                    onClick={runAnalysis}
                    disabled={analyzing}
                    className="w-full gap-1.5 bg-[var(--color-accent-orange)] text-black hover:bg-[var(--color-accent-orange)]/90 font-mono-terminal text-[10px] font-bold h-8 rounded-sm"
                  >
                    {analyzing ? (
                      <><Loader2 className="h-3 w-3 animate-spin" /> Running Agent Swarm...</>
                    ) : (
                      <><Sparkles className="h-3 w-3" /> Analyze with AI Agents</>
                    )}
                  </Button>
                  <p className="mt-1.5 text-center text-[8px] text-[oklch(0.4_0_0)]">
                    8-agent pipeline: Analysts → Debate → Trade → Risk → Report
                  </p>

                  {/* Pipeline Steps */}
                  {(analyzing || pipelineStep >= 0) && (
                    <div className="mt-2 space-y-1">
                      {PIPELINE_STEPS.map((step, i) => (
                        <div key={step.key} className="flex items-center gap-1.5">
                          <div className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-sm text-[8px]",
                            i < pipelineStep ? "bg-[var(--color-positive)]/15 text-[var(--color-positive)]" :
                            i === pipelineStep ? "bg-[var(--color-accent-orange)]/15 text-[var(--color-accent-orange)]" :
                            "bg-[#111] text-[oklch(0.35_0_0)]"
                          )}>
                            {i < pipelineStep ? (
                              <CheckCircle2 className="h-2.5 w-2.5" />
                            ) : i === pipelineStep ? (
                              <Loader2 className="h-2.5 w-2.5 animate-spin" />
                            ) : (
                              <span>{i + 1}</span>
                            )}
                          </div>
                          <span className={cn(
                            "font-mono-terminal text-[9px]",
                            i < pipelineStep ? "text-[var(--color-positive)]" :
                            i === pipelineStep ? "text-foreground font-semibold" :
                            "text-[oklch(0.35_0_0)]"
                          )}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* News Sidebar (compact) */}
              {news && news.length > 0 && (
                <div className="terminal-panel">
                  <div className="terminal-header flex items-center gap-1.5">
                    <Newspaper className="h-3 w-3" />
                    LATEST NEWS
                  </div>
                  <div className="divide-y divide-[#1a1a1a]">
                    {news.slice(0, 4).map((article, i) => (
                      <div key={i} className="px-2 py-1.5">
                        <p className="data-dense font-medium leading-tight line-clamp-2">{article.title}</p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <Badge variant="outline" className={cn(
                            "text-[7px] h-3.5 px-1 rounded-sm",
                            article.sentiment === "bullish" ? "text-[var(--color-positive)] border-[var(--color-positive)]/30" :
                            article.sentiment === "bearish" ? "text-[var(--color-negative)] border-[var(--color-negative)]/30" :
                            "text-[oklch(0.4_0_0)] border-[#1a1a1a]"
                          )}>
                            {article.sentiment}
                          </Badge>
                          <span className="text-[8px] text-[oklch(0.35_0_0)]">{article.source}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Quants Explained (shows immediately, no AI needed) ─── */}
          {indicators && (
            <QuantsExplained indicators={indicators} symbol={activeSymbol} />
          )}

          {/* ─── AI Analysis Results ─── */}
          {analysis && (
            <div className="space-y-1">
              {/* Recommendation + Sentiment */}
              <div className="grid grid-cols-12 gap-1">
                {/* Big Recommendation Badge */}
                <div className={cn("terminal-panel col-span-12 md:col-span-4 flex flex-col items-center justify-center py-5", rec?.glow && `shadow-lg ${rec.glow}`)}>
                  <p className="data-label mb-2">AI Recommendation</p>
                  <div className={cn("rounded-sm px-4 py-2 text-lg font-bold font-mono-terminal", rec?.bg, rec?.text)}>
                    {rec?.label || "HOLD"}
                  </div>
                  <p className="mt-1.5 data-dense text-[oklch(0.4_0_0)]">Confidence: {(analysis.confidence * 100).toFixed(0)}%</p>
                </div>

                {/* Sentiment Score */}
                <div className="terminal-panel col-span-12 md:col-span-4 flex flex-col items-center justify-center py-5">
                  <p className="data-label mb-2">Sentiment Score</p>
                  <div className="relative h-16 w-36">
                    <svg viewBox="0 0 200 100" className="w-full h-full">
                      <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="#111" strokeWidth="12" strokeLinecap="round" />
                      <path
                        d="M 20 90 A 80 80 0 0 1 180 90"
                        fill="none"
                        stroke={analysis.sentimentScore > 60 ? "#00D26A" : analysis.sentimentScore < 40 ? "#FF3B3B" : "#F59E0B"}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${(analysis.sentimentScore / 100) * 251} 251`}
                      />
                      <text x="100" y="78" textAnchor="middle" className="fill-foreground font-mono-terminal text-3xl font-bold">
                        {analysis.sentimentScore}
                      </text>
                      <text x="100" y="95" textAnchor="middle" className="fill-[oklch(0.35_0_0)] text-xs">
                        / 100
                      </text>
                    </svg>
                  </div>
                </div>

                {/* Price Targets */}
                <div className="terminal-panel col-span-12 md:col-span-4">
                  <div className="p-2">
                    <p className="data-label text-center mb-2">Price Targets (12M)</p>
                    <div className="space-y-1">
                      {[
                        { label: "Bull 🐂", value: analysis.priceTargets.bull, color: "text-[var(--color-positive)]" },
                        { label: "Base", value: analysis.priceTargets.base, color: "text-foreground" },
                        { label: "Bear 🐻", value: analysis.priceTargets.bear, color: "text-[var(--color-negative)]" },
                      ].map((t) => (
                        <div key={t.label} className="flex items-center justify-between">
                          <span className="data-dense text-[oklch(0.4_0_0)]">{t.label}</span>
                          <span className={cn("data-value text-[11px]", t.color)}>
                            {formatCurrency(t.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 relative h-1.5 rounded-sm bg-[#111]">
                      <div className="absolute inset-y-0 rounded-sm bg-gradient-to-r from-[var(--color-negative)] via-[var(--color-accent-orange)] to-[var(--color-positive)]"
                        style={{ left: "0%", right: "0%" }}
                      />
                      {quote && (
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-3 w-0.5 bg-white rounded-sm"
                          style={{
                            left: `${Math.min(100, Math.max(0, ((quote.price - analysis.priceTargets.bear) / (analysis.priceTargets.bull - analysis.priceTargets.bear)) * 100))}%`,
                          }}
                        />
                      )}
                    </div>
                    <p className="mt-0.5 text-center text-[8px] text-[oklch(0.35_0_0)]">Current: {quote ? formatCurrency(quote.price) : "—"}</p>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div className="terminal-panel">
                <div className="terminal-header flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  AI ANALYSIS SUMMARY
                </div>
                <div className="p-2">
                  {analysis.summary.split("\n").map((para, i) => (
                    <p key={i} className="data-dense leading-relaxed text-[oklch(0.6_0_0)]">{para}</p>
                  ))}
                </div>
              </div>

              {/* Catalysts + Risks */}
              <div className="grid grid-cols-12 gap-1">
                <div className="terminal-panel col-span-12 md:col-span-6">
                  <div className="terminal-header flex items-center gap-1.5">
                    <Zap className="h-3 w-3" />
                    KEY CATALYSTS
                  </div>
                  <div className="divide-y divide-[#1a1a1a]">
                    {analysis.catalysts.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 px-2 py-1.5">
                        {c.impact === "positive" ? (
                          <ArrowUpRight className="h-3 w-3 mt-0.5 text-[var(--color-positive)] shrink-0" />
                        ) : c.impact === "negative" ? (
                          <ArrowDownRight className="h-3 w-3 mt-0.5 text-[var(--color-negative)] shrink-0" />
                        ) : (
                          <Activity className="h-3 w-3 mt-0.5 text-[oklch(0.4_0_0)] shrink-0" />
                        )}
                        <div>
                          <p className="data-dense font-semibold">{c.title}</p>
                          <p className="text-[9px] text-[oklch(0.4_0_0)] mt-0.5">{c.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="terminal-panel col-span-12 md:col-span-6">
                  <div className="terminal-header flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3" />
                    RISK FACTORS
                  </div>
                  <div className="divide-y divide-[#1a1a1a]">
                    {analysis.risks.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 px-2 py-1.5">
                        <AlertTriangle className={cn(
                          "h-3 w-3 mt-0.5 shrink-0",
                          r.severity === "high" ? "text-[var(--color-negative)]" :
                          r.severity === "medium" ? "text-amber-400" :
                          "text-[oklch(0.4_0_0)]"
                        )} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="data-dense font-semibold">{r.title}</p>
                            <Badge variant="outline" className={cn(
                              "text-[7px] uppercase h-3.5 px-1 rounded-sm",
                              r.severity === "high" ? "text-[var(--color-negative)] border-[var(--color-negative)]/30" :
                              r.severity === "medium" ? "text-amber-400 border-amber-400/30" :
                              "text-[oklch(0.4_0_0)] border-[#1a1a1a]"
                            )}>
                              {r.severity}
                            </Badge>
                          </div>
                          <p className="text-[9px] text-[oklch(0.4_0_0)] mt-0.5">{r.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Metrics Table */}
              <div className="terminal-panel">
                <div className="terminal-header flex items-center gap-1.5">
                  <BarChart3 className="h-3 w-3" />
                  KEY METRICS
                </div>
                <div className="flex divide-x divide-[#1a1a1a] border-b border-[#1a1a1a]">
                  {analysis.keyMetrics.map((m, i) => (
                    <div key={i} className="flex-1 px-2 py-1.5">
                      <p className="data-label">{m.name}</p>
                      <p className={cn(
                        "data-value text-[11px] mt-0.5",
                        m.assessment === "positive" ? "text-[var(--color-positive)]" :
                        m.assessment === "negative" ? "text-[var(--color-negative)]" :
                        "text-foreground"
                      )}>
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quants Explained — Educational Section */}
              {indicators && (
                <QuantsExplained indicators={indicators} symbol={activeSymbol} />
              )}

              {/* Sources */}
              <div className="terminal-panel">
                <div className="flex items-center gap-1.5 flex-wrap px-2 py-1.5">
                  <span className="data-label">Sources:</span>
                  {analysis.sources.map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-[7px] h-3.5 px-1 rounded-sm">{s.title}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
      <AnalysisContent />
    </Suspense>
  );
}
