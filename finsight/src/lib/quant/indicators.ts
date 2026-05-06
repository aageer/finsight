/**
 * Pure-JavaScript Quant Indicators Engine
 * Inspired by: Luchkata/Algorithmic_Trading_Machine_Learning
 *
 * No Python, no external libs. All computed in-browser or on server.
 * Each function returns both the numeric value AND a human-readable signal.
 */

export interface IndicatorResult {
  name: string;
  value: number;
  signal: "bullish" | "bearish" | "neutral";
  strength: "strong" | "moderate" | "weak";
  description: string; // plain-English explanation (filled by AI later)
}

// ─── SMA ──────────────────────────────────────────────
export function computeSMA(prices: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      result.push(slice.reduce((s, v) => s + v, 0) / period);
    }
  }
  return result;
}

// ─── EMA ──────────────────────────────────────────────
export function computeEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const result: number[] = [prices[0]];
  for (let i = 1; i < prices.length; i++) {
    result.push(prices[i] * k + result[i - 1] * (1 - k));
  }
  return result;
}

// ─── RSI (Relative Strength Index) ────────────────────
export function computeRSI(prices: number[], period = 14): IndicatorResult & { series: number[] } {
  const changes = prices.slice(1).map((p, i) => p - prices[i]);
  const gains: number[] = [];
  const losses: number[] = [];

  changes.forEach((c) => {
    gains.push(c > 0 ? c : 0);
    losses.push(c < 0 ? Math.abs(c) : 0);
  });

  const rsiSeries: number[] = [];
  let avgGain = gains.slice(0, period).reduce((s, v) => s + v, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((s, v) => s + v, 0) / period;

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsiSeries.push(100 - 100 / (1 + rs));
  }

  const currentRSI = rsiSeries.length > 0 ? rsiSeries[rsiSeries.length - 1] : 50;

  let signal: IndicatorResult["signal"] = "neutral";
  let strength: IndicatorResult["strength"] = "weak";

  if (currentRSI > 70) { signal = "bearish"; strength = currentRSI > 80 ? "strong" : "moderate"; }
  else if (currentRSI < 30) { signal = "bullish"; strength = currentRSI < 20 ? "strong" : "moderate"; }
  else if (currentRSI > 50) { signal = "bullish"; strength = "weak"; }
  else { signal = "bearish"; strength = "weak"; }

  return {
    name: "RSI",
    value: Math.round(currentRSI * 100) / 100,
    signal,
    strength,
    description: "",
    series: rsiSeries,
  };
}

// ─── MACD ─────────────────────────────────────────────
export interface MACDResult extends IndicatorResult {
  macdLine: number[];
  signalLine: number[];
  histogram: number[];
}

export function computeMACD(
  prices: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MACDResult {
  const emaFast = computeEMA(prices, fastPeriod);
  const emaSlow = computeEMA(prices, slowPeriod);

  const macdLine = emaFast.map((f, i) => f - emaSlow[i]);
  const signalLine = computeEMA(macdLine.slice(slowPeriod - 1), signalPeriod);

  // Pad signal line to match macdLine length
  const paddedSignal = Array(macdLine.length - signalLine.length)
    .fill(NaN)
    .concat(signalLine);

  const histogram = macdLine.map((m, i) =>
    isNaN(paddedSignal[i]) ? 0 : m - paddedSignal[i]
  );

  const lastMACD = macdLine[macdLine.length - 1];
  const lastSignal = paddedSignal[paddedSignal.length - 1];
  const lastHist = histogram[histogram.length - 1];
  const prevHist = histogram[histogram.length - 2] || 0;

  let signal: IndicatorResult["signal"] = "neutral";
  let strength: IndicatorResult["strength"] = "weak";

  if (lastMACD > lastSignal && lastHist > 0) {
    signal = "bullish";
    strength = lastHist > prevHist ? "strong" : "moderate";
  } else if (lastMACD < lastSignal && lastHist < 0) {
    signal = "bearish";
    strength = lastHist < prevHist ? "strong" : "moderate";
  }

  return {
    name: "MACD",
    value: Math.round(lastMACD * 1000) / 1000,
    signal,
    strength,
    description: "",
    macdLine,
    signalLine: paddedSignal,
    histogram,
  };
}

// ─── Bollinger Bands ──────────────────────────────────
export interface BollingerResult extends IndicatorResult {
  upper: number[];
  middle: number[];
  lower: number[];
  bandwidth: number;
  percentB: number;
}

export function computeBollingerBands(
  prices: number[],
  period = 20,
  stdDevMultiplier = 2
): BollingerResult {
  const sma = computeSMA(prices, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = sma[i];
      const variance = slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period;
      const stdDev = Math.sqrt(variance);
      upper.push(mean + stdDevMultiplier * stdDev);
      lower.push(mean - stdDevMultiplier * stdDev);
    }
  }

  const lastPrice = prices[prices.length - 1];
  const lastUpper = upper[upper.length - 1];
  const lastLower = lower[lower.length - 1];
  const lastMiddle = sma[sma.length - 1];
  const bandwidth = ((lastUpper - lastLower) / lastMiddle) * 100;
  const percentB = ((lastPrice - lastLower) / (lastUpper - lastLower)) * 100;

  let signal: IndicatorResult["signal"] = "neutral";
  let strength: IndicatorResult["strength"] = "weak";

  if (percentB > 100) { signal = "bearish"; strength = "strong"; }
  else if (percentB > 80) { signal = "bearish"; strength = "moderate"; }
  else if (percentB < 0) { signal = "bullish"; strength = "strong"; }
  else if (percentB < 20) { signal = "bullish"; strength = "moderate"; }

  // Squeeze detection
  if (bandwidth < 10) {
    strength = "strong"; // squeeze → expect big move
  }

  return {
    name: "Bollinger Bands",
    value: Math.round(percentB * 100) / 100,
    signal,
    strength,
    description: "",
    upper,
    middle: sma,
    lower,
    bandwidth: Math.round(bandwidth * 100) / 100,
    percentB: Math.round(percentB * 100) / 100,
  };
}

// ─── Golden / Death Cross ─────────────────────────────
export interface CrossoverResult extends IndicatorResult {
  sma50: number;
  sma200: number;
  crossType: "golden_cross" | "death_cross" | "none";
}

export function detectGoldenDeathCross(prices: number[]): CrossoverResult {
  const sma50 = computeSMA(prices, 50);
  const sma200 = computeSMA(prices, 200);

  const last50 = sma50[sma50.length - 1];
  const last200 = sma200[sma200.length - 1];
  const prev50 = sma50[sma50.length - 2] || last50;
  const prev200 = sma200[sma200.length - 2] || last200;

  let crossType: CrossoverResult["crossType"] = "none";
  let signal: IndicatorResult["signal"] = "neutral";
  let strength: IndicatorResult["strength"] = "weak";

  if (prev50 <= prev200 && last50 > last200) {
    crossType = "golden_cross";
    signal = "bullish";
    strength = "strong";
  } else if (prev50 >= prev200 && last50 < last200) {
    crossType = "death_cross";
    signal = "bearish";
    strength = "strong";
  } else if (last50 > last200) {
    signal = "bullish";
    strength = "moderate";
  } else if (last50 < last200) {
    signal = "bearish";
    strength = "moderate";
  }

  return {
    name: "SMA Crossover (50/200)",
    value: Math.round(((last50 - last200) / last200) * 10000) / 100,
    signal,
    strength,
    description: "",
    sma50: Math.round(last50 * 100) / 100,
    sma200: Math.round(last200 * 100) / 100,
    crossType,
  };
}

// ─── 52-Week Position ─────────────────────────────────
export function compute52WeekPosition(prices: number[]): IndicatorResult & { high52w: number; low52w: number } {
  // Use last 252 trading days (~1 year)
  const yearPrices = prices.slice(-252);
  const high = Math.max(...yearPrices);
  const low = Math.min(...yearPrices);
  const current = yearPrices[yearPrices.length - 1];
  const position = ((current - low) / (high - low)) * 100;

  let signal: IndicatorResult["signal"] = "neutral";
  let strength: IndicatorResult["strength"] = "weak";

  if (position > 90) { signal = "bearish"; strength = "moderate"; }
  else if (position > 70) { signal = "bullish"; strength = "weak"; }
  else if (position < 10) { signal = "bullish"; strength = "strong"; }
  else if (position < 30) { signal = "bearish"; strength = "weak"; }

  return {
    name: "52-Week Position",
    value: Math.round(position * 100) / 100,
    signal,
    strength,
    description: "",
    high52w: Math.round(high * 100) / 100,
    low52w: Math.round(low * 100) / 100,
  };
}

// ─── Volatility ───────────────────────────────────────
export function computeVolatility(prices: number[], period = 30): IndicatorResult {
  const returns = prices.slice(1).map((p, i) => Math.log(p / prices[i]));
  const recentReturns = returns.slice(-period);

  const mean = recentReturns.reduce((s, v) => s + v, 0) / recentReturns.length;
  const variance = recentReturns.reduce((s, v) => s + (v - mean) ** 2, 0) / (recentReturns.length - 1);
  const dailyVol = Math.sqrt(variance);
  const annualizedVol = dailyVol * Math.sqrt(252) * 100;

  let signal: IndicatorResult["signal"] = "neutral";
  let strength: IndicatorResult["strength"] = "weak";

  if (annualizedVol > 50) { signal = "bearish"; strength = "strong"; }
  else if (annualizedVol > 35) { signal = "bearish"; strength = "moderate"; }
  else if (annualizedVol < 15) { signal = "bullish"; strength = "moderate"; }

  return {
    name: "Volatility (Annualized)",
    value: Math.round(annualizedVol * 100) / 100,
    signal,
    strength,
    description: "",
  };
}

// ─── Max Drawdown ─────────────────────────────────────
export function computeMaxDrawdown(prices: number[]): IndicatorResult & { peakDate: number; troughDate: number } {
  let peak = prices[0];
  let maxDD = 0;
  let peakIdx = 0;
  let troughIdx = 0;
  let tempPeakIdx = 0;

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > peak) {
      peak = prices[i];
      tempPeakIdx = i;
    }
    const dd = (peak - prices[i]) / peak;
    if (dd > maxDD) {
      maxDD = dd;
      peakIdx = tempPeakIdx;
      troughIdx = i;
    }
  }

  const mddPercent = maxDD * 100;

  let signal: IndicatorResult["signal"] = "neutral";
  let strength: IndicatorResult["strength"] = "weak";

  if (mddPercent > 30) { signal = "bearish"; strength = "strong"; }
  else if (mddPercent > 20) { signal = "bearish"; strength = "moderate"; }
  else if (mddPercent < 10) { signal = "bullish"; strength = "moderate"; }

  return {
    name: "Max Drawdown",
    value: -Math.round(mddPercent * 100) / 100,
    signal,
    strength,
    description: "",
    peakDate: peakIdx,
    troughDate: troughIdx,
  };
}

// ─── Run All Indicators ───────────────────────────────
export interface AllIndicators {
  rsi: ReturnType<typeof computeRSI>;
  macd: MACDResult;
  bollinger: BollingerResult;
  crossover: CrossoverResult;
  position52w: ReturnType<typeof compute52WeekPosition>;
  volatility: IndicatorResult;
  maxDrawdown: ReturnType<typeof computeMaxDrawdown>;
  overallSignal: "bullish" | "bearish" | "neutral";
  overallScore: number; // -100 to +100
}

export function computeAllIndicators(closePrices: number[]): AllIndicators {
  const rsi = computeRSI(closePrices);
  const macd = computeMACD(closePrices);
  const bollinger = computeBollingerBands(closePrices);
  const crossover = closePrices.length >= 200
    ? detectGoldenDeathCross(closePrices)
    : { name: "SMA Crossover (50/200)", value: 0, signal: "neutral" as const, strength: "weak" as const, description: "", sma50: 0, sma200: 0, crossType: "none" as const };
  const position52w = compute52WeekPosition(closePrices);
  const volatility = computeVolatility(closePrices);
  const maxDrawdown = computeMaxDrawdown(closePrices);

  // Aggregate score: each indicator votes -1, 0, or +1, weighted by strength
  const indicators = [rsi, macd, bollinger, crossover, position52w, volatility, maxDrawdown];
  const strengthWeight = { strong: 1.5, moderate: 1.0, weak: 0.5 };
  const signalValue = { bullish: 1, neutral: 0, bearish: -1 };

  let score = 0;
  let totalWeight = 0;
  for (const ind of indicators) {
    const w = strengthWeight[ind.strength];
    score += signalValue[ind.signal] * w;
    totalWeight += w;
  }

  const normalizedScore = totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0;
  const overallSignal: AllIndicators["overallSignal"] =
    normalizedScore > 20 ? "bullish" : normalizedScore < -20 ? "bearish" : "neutral";

  return {
    rsi,
    macd,
    bollinger,
    crossover,
    position52w,
    volatility,
    maxDrawdown,
    overallSignal,
    overallScore: normalizedScore,
  };
}
