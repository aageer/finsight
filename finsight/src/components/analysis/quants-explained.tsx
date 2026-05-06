"use client";

import { useState } from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Waves,
  Target,
  Gauge,
  ArrowDown,
  Crosshair,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AllIndicators } from "@/lib/quant/indicators";

// ─── Plain-English Explanations Generator ─────────────
function getIndicatorExplanation(name: string, value: number, signal: string, strength: string): string {
  switch (name) {
    case "RSI":
      if (value > 80) return `RSI is at ${value} — deep in overbought territory. Think of it like a runner who sprinted full speed for miles. The stock has been rising so fast that a pullback is very likely. Historically, stocks at this RSI level correct within days.`;
      if (value > 70) return `RSI is at ${value} — overbought territory. The stock has been climbing steadily, like a rubber band that's stretched tight. It could keep going, but the strain is showing. In strong uptrends, RSI can stay overbought for a while, but it's a yellow flag.`;
      if (value > 55) return `RSI is at ${value} — showing mild bullish momentum. This is like a jogger with a comfortable pace — there's room to accelerate. The buying pressure slightly outweighs selling, which is healthy.`;
      if (value > 45) return `RSI is at ${value} — in the neutral zone. Neither buyers nor sellers are in control. The stock is at an equilibrium, like a tug-of-war where both sides are evenly matched.`;
      if (value > 30) return `RSI is at ${value} — showing mild bearish pressure. Sellers have a slight edge, but it's not extreme. Think of it like a boat gently drifting downstream.`;
      if (value > 20) return `RSI is at ${value} — oversold territory. The stock has been falling significantly. Like a clearance sale, the price may be a bargain — but the selling could also indicate real problems.`;
      return `RSI is at ${value} — extremely oversold. This is rare and often signals capitulation selling. Like finding a designer item at 90% off, it could be a steal… or there's a reason nobody wants it.`;

    case "MACD":
      if (signal === "bullish" && strength === "strong") return `MACD shows a strong bullish signal. The fast-moving average has crossed above the slow one with increasing momentum — like a car going from 30 to 60 mph. This crossover pattern has historically preceded upward price moves.`;
      if (signal === "bullish") return `MACD is flashing a bullish signal. Two moving averages that track the stock's momentum are converging in a positive way. Think of it like two runners — the faster one just overtook the slower one, suggesting the pace is picking up.`;
      if (signal === "bearish" && strength === "strong") return `MACD shows a strong bearish signal. The fast-moving average has dropped below the slow one with widening separation — like a plane losing altitude and speed simultaneously. This pattern often precedes further declines.`;
      if (signal === "bearish") return `MACD is flashing a bearish signal. The stock's short-term momentum has dipped below its longer-term trend — like a student whose recent test scores just fell below their semester average. It suggests fading enthusiasm.`;
      return `MACD is in neutral territory. The momentum indicators haven't committed to a direction. Like a compass spinning between north and south, we need more data before a clear signal emerges.`;

    case "Bollinger Bands":
      if (value > 100) return `Price is ABOVE the upper Bollinger Band (%B: ${value}%). This is like a boat that's sailed past the harbor buoy — it's in unusual territory. The stock has pushed beyond 2 standard deviations from its average, which historically is unsustainable. A return toward the middle band is likely.`;
      if (value > 80) return `Price is near the upper Bollinger Band (%B: ${value}%). The stock is at the top of its normal trading range. Like reaching the ceiling of a room — you can touch it, but you can't go much higher without breaking through.`;
      if (value > 50) return `Price is in the upper half of the Bollinger Bands (%B: ${value}%). This is healthy bullish territory — like being above the midpoint on a ladder. The stock is trending above its average but isn't overextended.`;
      if (value > 20) return `Price is in the lower half of the Bollinger Bands (%B: ${value}%). The stock is trading below its average — like being on the bottom half of a seesaw. It could be finding support, or preparing for a further drop.`;
      if (value > 0) return `Price is near the lower Bollinger Band (%B: ${value}%). The stock is at the floor of its normal trading range. Like a ball bouncing near the ground — it often bounces back up, but sometimes it can break through the floor.`;
      return `Price has broken BELOW the lower Bollinger Band (%B: ${value}%). This is unusual — like a ball that crashed through the floor. It can signal extreme selling pressure or a major negative event. Watch for a potential bounce or continued freefall.`;

    case "SMA Crossover (50/200)":
      if (value > 5) return `The 50-day average is ${value}% ABOVE the 200-day average — a bullish trend. Think of it like a student whose recent monthly grades are significantly better than their yearly average. The medium-term trend is stronger than the long-term trend, confirming upward momentum.`;
      if (value > 0) return `The 50-day average is slightly above the 200-day average (${value}%). This is a mildly bullish setup — like a tide that's slowly coming in. If this gap widens, it could become a "Golden Cross" signal celebrated by traders.`;
      if (value > -5) return `The 50-day average is slightly below the 200-day average (${value}%). This is a cautious zone — the medium-term trend is weaker than the long-term trend, like a student whose recent grades dipped below their yearly average. It could recover, or signal deeper weakness.`;
      return `The 50-day average is ${Math.abs(value)}% BELOW the 200-day average — a bearish trend. This is a "Death Cross" territory. Like a river flowing downhill — the current is against you. Historically, this pattern precedes extended downward moves, though reversals do happen.`;

    case "52-Week Position":
      if (value > 90) return `The stock is trading at ${value}% of its 52-week range — near its yearly high. Like a mountain climber near the summit, the view is great but there's less room to go up. It could signal strong momentum or a potential top.`;
      if (value > 60) return `At ${value}% of its 52-week range, the stock is in the upper third. This is positive — it's been climbing and has room to run. Like being 60% up a ladder, there's still upside potential.`;
      if (value > 40) return `At ${value}% of its 52-week range, the stock is in the middle ground. It's not near its highs or lows — a balanced position. Like being at sea level, it could go either way from here.`;
      if (value > 10) return `At ${value}% of its 52-week range, the stock is near its yearly lows. Like a stock on clearance — it might be undervalued and due for a rebound, or there may be fundamental reasons for the decline.`;
      return `At just ${value}% of its 52-week range, the stock is near its absolute low for the year. This is extreme territory. Like reaching the bottom of a well — historically, stocks at this level either bounce sharply or continue declining due to serious problems.`;

    case "Volatility (Annualized)":
      if (value > 50) return `Annualized volatility of ${value}% is very high. This means the stock could swing ${(value / Math.sqrt(252)).toFixed(1)}% in a single day. Like riding a roller coaster — exciting, but not for the faint-hearted. If you had $10,000 invested, you might see $${(100 * value / Math.sqrt(252)).toFixed(0)} swings daily.`;
      if (value > 35) return `Annualized volatility of ${value}% is elevated. The stock is moving more than average — like driving on a bumpy road. There's more uncertainty, which means more risk but also more opportunity for active traders.`;
      if (value > 20) return `Annualized volatility of ${value}% is moderate — typical for an actively traded stock. Like cruising on a highway with some gentle curves. Your $10,000 investment might fluctuate about $${(100 * value / Math.sqrt(252)).toFixed(0)} per day.`;
      return `Annualized volatility of just ${value}% is quite low — the stock moves gently. Like sailing on calm waters. This stability is good for risk-averse investors but offers fewer short-term trading opportunities.`;

    case "Max Drawdown":
      const absVal = Math.abs(value);
      if (absVal > 30) return `The worst peak-to-trough decline was ${absVal.toFixed(1)}%. If you invested $10,000 at the peak, the worst you would have temporarily lost is $${(100 * absVal).toFixed(0)}. That's a significant drop — like a house losing a third of its value. Recovery from drawdowns this large can take months.`;
      if (absVal > 20) return `Maximum drawdown of ${absVal.toFixed(1)}%. If you had $10,000 at the peak, you'd have temporarily seen it drop to about $${(10000 * (1 - absVal / 100)).toFixed(0)}. This is a meaningful decline but within normal range for individual stocks.`;
      if (absVal > 10) return `Maximum drawdown of ${absVal.toFixed(1)}% — relatively contained. A $10,000 investment would have dipped to about $${(10000 * (1 - absVal / 100)).toFixed(0)} at worst. This suggests the stock has been relatively resilient.`;
      return `Maximum drawdown of just ${absVal.toFixed(1)}% — very small. The stock has been remarkably stable, barely dipping from its peaks. Like a car with excellent shock absorbers — smooth ride.`;

    default:
      return `${name} is at ${value}. This indicator is ${signal} with ${strength} conviction.`;
  }
}

// ─── Icon mapping ─────────────────────────────────────
const INDICATOR_ICONS: Record<string, typeof Activity> = {
  "RSI": Gauge,
  "MACD": Activity,
  "Bollinger Bands": Waves,
  "SMA Crossover (50/200)": Crosshair,
  "52-Week Position": Target,
  "Volatility (Annualized)": BarChart3,
  "Max Drawdown": ArrowDown,
};

// ─── Signal Colors ────────────────────────────────────
const SIGNAL_COLORS = {
  bullish: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  bearish: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  neutral: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
};

const STRENGTH_BADGE = {
  strong: { label: "STRONG", color: "bg-white/10 text-white" },
  moderate: { label: "MODERATE", color: "bg-white/5 text-zinc-400" },
  weak: { label: "WEAK", color: "bg-white/5 text-zinc-500" },
};

// ─── Component ────────────────────────────────────────
interface QuantsExplainedProps {
  indicators: AllIndicators;
  symbol: string;
}

export function QuantsExplained({ indicators, symbol }: QuantsExplainedProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["RSI", "MACD"]));

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const indicatorList = [
    { ...indicators.rsi, name: "RSI" },
    { ...indicators.macd, name: "MACD" },
    { ...indicators.bollinger, name: "Bollinger Bands" },
    ...(indicators.crossover.sma50 > 0 ? [{ ...indicators.crossover, name: "SMA Crossover (50/200)" }] : []),
    { ...indicators.position52w, name: "52-Week Position" },
    { ...indicators.volatility, name: "Volatility (Annualized)" },
    { ...indicators.maxDrawdown, name: "Max Drawdown" },
  ];

  return (
    <Card className="border-border bg-[oklch(0.08_0_0)]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[var(--color-accent-orange)]" />
          <h3 className="font-mono-terminal text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quants Explained — {symbol}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Overall Score */}
          <div className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1",
            indicators.overallSignal === "bullish" ? "bg-emerald-500/10" :
            indicators.overallSignal === "bearish" ? "bg-red-500/10" :
            "bg-amber-500/10"
          )}>
            {indicators.overallSignal === "bullish" ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            ) : indicators.overallSignal === "bearish" ? (
              <TrendingDown className="h-3.5 w-3.5 text-red-400" />
            ) : (
              <Activity className="h-3.5 w-3.5 text-amber-400" />
            )}
            <span className={cn(
              "font-mono-terminal text-xs font-bold",
              indicators.overallSignal === "bullish" ? "text-emerald-400" :
              indicators.overallSignal === "bearish" ? "text-red-400" :
              "text-amber-400"
            )}>
              {indicators.overallScore > 0 ? "+" : ""}{indicators.overallScore}
            </span>
            <span className="text-[9px] text-muted-foreground">/100</span>
          </div>
        </div>
      </div>

      <CardContent className="p-0 divide-y divide-border">
        {indicatorList.map((ind) => {
          const isOpen = expanded.has(ind.name);
          const Icon = INDICATOR_ICONS[ind.name] || Activity;
          const signalColor = SIGNAL_COLORS[ind.signal];
          const strengthBadge = STRENGTH_BADGE[ind.strength];
          const explanation = getIndicatorExplanation(ind.name, ind.value, ind.signal, ind.strength);

          // Format value nicely
          let displayValue = String(ind.value);
          if (ind.name === "RSI") displayValue = ind.value.toFixed(1);
          else if (ind.name === "MACD") displayValue = ind.value.toFixed(3);
          else if (ind.name === "Bollinger Bands") displayValue = `${ind.value.toFixed(1)}%`;
          else if (ind.name === "SMA Crossover (50/200)") displayValue = `${ind.value >= 0 ? "+" : ""}${ind.value.toFixed(2)}%`;
          else if (ind.name === "52-Week Position") displayValue = `${ind.value.toFixed(1)}%`;
          else if (ind.name === "Volatility (Annualized)") displayValue = `${ind.value.toFixed(1)}%`;
          else if (ind.name === "Max Drawdown") displayValue = `${ind.value.toFixed(1)}%`;

          return (
            <div key={ind.name} className="hover:bg-muted/10 transition-colors">
              {/* Header row — always visible */}
              <button
                onClick={() => toggle(ind.name)}
                className="flex items-center justify-between w-full px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", signalColor.bg)}>
                    <Icon className={cn("h-4 w-4", signalColor.text)} />
                  </div>
                  <div>
                    <p className="font-mono-terminal text-xs font-semibold">{ind.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("font-mono-terminal text-sm font-bold", signalColor.text)}>
                        {displayValue}
                      </span>
                      <Badge className={cn("text-[8px] uppercase", signalColor.bg, signalColor.text, "border-0")}>
                        {ind.signal}
                      </Badge>
                      <Badge className={cn("text-[8px] uppercase border-0", strengthBadge.color)}>
                        {strengthBadge.label}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Mini signal indicator */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((bar) => {
                      const signalStrength = ind.signal === "bullish"
                        ? (ind.strength === "strong" ? 5 : ind.strength === "moderate" ? 3 : 2)
                        : ind.signal === "bearish"
                        ? (ind.strength === "strong" ? 5 : ind.strength === "moderate" ? 3 : 2)
                        : 1;
                      const active = bar <= signalStrength;
                      return (
                        <div
                          key={bar}
                          className={cn(
                            "w-1 rounded-full transition-all",
                            active
                              ? cn("h-3", ind.signal === "bullish" ? "bg-emerald-400" : ind.signal === "bearish" ? "bg-red-400" : "bg-amber-400")
                              : "h-2 bg-muted/30"
                          )}
                        />
                      );
                    })}
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded explanation — plain English */}
              {isOpen && (
                <div className="px-4 pb-4 pl-[60px]">
                  <div className={cn("rounded-lg border p-3", signalColor.border, "bg-muted/5")}>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
