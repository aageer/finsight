# FinSight — Complete Project Guide
## AI-Powered Financial Intelligence Platform with Multi-Agent ATLAS System

> **Course**: 5801 Advanced AI • **Author**: Akhila Geer  
> **Stack**: Next.js 16 + TypeScript + Gemini 2.5 Pro/Flash + Alpha Vantage + Alpaca  
> **Architecture**: Bloomberg Terminal UI • Multi-Agent Orchestration • Darwinian Weight Evolution

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Prerequisites & Environment Setup](#2-prerequisites--environment-setup)
3. [Quick Start (5 Minutes)](#3-quick-start-5-minutes)
4. [Architecture Deep Dive](#4-architecture-deep-dive)
5. [AI Agent System — ATLAS Pipeline](#5-ai-agent-system--atlas-pipeline)
6. [Single-Stock Analysis Pipeline](#6-single-stock-analysis-pipeline)
7. [ATLAS Portfolio Trading Pipeline](#7-atlas-portfolio-trading-pipeline)
8. [API Integrations](#8-api-integrations)
9. [Performance Optimizations](#9-performance-optimizations)
10. [Demo Walkthrough](#10-demo-walkthrough)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Project Overview

FinSight is an AI-powered financial intelligence platform that orchestrates **16 specialized AI agents** powered by Google Gemini to analyze markets, debate investment theses, and execute autonomous trades with strict risk guardrails.

### Key Features
- **Bloomberg Terminal UI** — Pure-black, high-density, monospace terminal aesthetic
- **Multi-Agent Analysis** — 8-agent pipeline for single-stock deep analysis
- **ATLAS Portfolio Pipeline** — 16-agent, 4-layer autonomous trading system
- **Darwinian Weight Evolution** — Agents compete; top performers gain influence
- **Real-Time Market Data** — Alpha Vantage live quotes with intelligent mock fallbacks
- **Risk-Limited Trading** — Dollar-limited, kill-switch-protected Alpaca paper/live trading

### Pages
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Portfolio overview, market movers, agent status, news feed |
| Analysis | `/analysis` | Single-stock AI analysis — search, chart, run 8-agent pipeline |
| Portfolio | `/portfolio` | Holdings, allocation breakdown, performance metrics |
| Trading | `/trading` | Auto-trading HUD — kill switch, positions, execution history |
| Agents Console | `/agents-console` | ATLAS pipeline runner, agent status monitoring |
| Watchlist | `/watchlist` | Tracked stocks with price alerts |
| Terminal | `/terminal` | AI chat terminal for freeform market queries |
| Swarm | `/swarm` | Multi-agent swarm visualization (experimental) |

---

## 2. Prerequisites & Environment Setup

### System Requirements
- **Node.js** 18+ (recommended: 20+)
- **npm** 9+ (comes with Node.js)
- **macOS/Linux/Windows** (developed on macOS M4)

### Step 1: Clone & Install

```bash
cd "/Users/akhilageer/Kean/5801-Adv-AI/FinSight Project/finsight"
npm install
```

### Step 2: Configure Environment Variables

Create/edit `.env.local` in the project root:

```bash
# ─── REQUIRED ───────────────────────────────────────
# Google Gemini API — powers all AI agent analysis
# Get yours: https://aistudio.google.com/apikey
GOOGLE_API_KEY=your_gemini_api_key_here

# Alpha Vantage — real-time stock data & fundamentals
# Get yours: https://www.alphavantage.co/support/#api-key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here

# ─── OPTIONAL ───────────────────────────────────────
# Alpaca Markets — paper/live trading execution
# Get yours: https://app.alpaca.markets/signup
ALPACA_API_KEY=your_alpaca_key
ALPACA_SECRET_KEY=your_alpaca_secret
ALPACA_BASE_URL=https://paper-api.alpaca.markets  # paper trading

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: API Key Details

| API | Free Tier | Rate Limit | Used For |
|-----|-----------|------------|----------|
| **Gemini** | $0 (Google AI Studio) | 15 RPM free | All AI analysis, agent reasoning |
| **Alpha Vantage** | Free (25 req/day) | 5 req/min | Stock quotes, charts, fundamentals |
| **Alpaca** | Free (paper trading) | Unlimited paper | Trade execution (optional) |

> **Note**: Alpha Vantage free tier has a 25 request/day limit. The app includes intelligent mock data fallbacks so it works even when rate-limited.

---

## 3. Quick Start (5 Minutes)

```bash
# 1. Navigate to project
cd "/Users/akhilageer/Kean/5801-Adv-AI/FinSight Project/finsight"

# 2. Install dependencies (if needed)
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
open http://localhost:3000
```

The app redirects to `/dashboard`. You should see:
- **Pure black** Bloomberg Terminal interface
- **Market ticker** at the top with regime status
- **Sidebar** with function key hints (F1-F9)
- **Dashboard grid** with portfolio value, stock cards, market movers
- **Agent status** panel showing ATLAS agents

### Verify AI Agents Work

1. Navigate to `/analysis`
2. Type `NVDA` in the search bar → click **Lookup**
3. Click **"Analyze with AI Agents"** (orange button)
4. Watch the 6-step pipeline progress:
   - ✅ Fetching Market Data
   - ✅ Analyst Team (4 Agents)
   - ✅ Bull vs Bear Debate
   - ✅ Trader Decision
   - ✅ Risk Assessment
   - ✅ Report Synthesis
5. View results: Recommendation badge, sentiment score, price targets, catalysts, risks

---

## 4. Architecture Deep Dive

### Tech Stack

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND (Next.js 16 App Router)                   │
│  ├── TypeScript + Tailwind CSS                      │
│  ├── Zustand (state management, granular selectors) │
│  ├── TanStack Query (API caching, deduplication)    │
│  └── Bloomberg Terminal UI (custom CSS utilities)   │
├─────────────────────────────────────────────────────┤
│  API ROUTES (Server-side)                           │
│  ├── /api/analysis      → Single-stock 8-agent     │
│  ├── /api/atlas/pipeline → ATLAS 16-agent pipeline  │
│  ├── /api/trading        → Alpaca trade execution   │
│  ├── /api/market/*       → Alpha Vantage proxy      │
│  └── /api/market/news    → Aggregated news feed     │
├─────────────────────────────────────────────────────┤
│  AI ORCHESTRATION LAYER                             │
│  ├── gemini-client.ts    → Gemini API + semaphore   │
│  ├── conductor.ts        → Single-stock pipeline    │
│  ├── atlas-conductor.ts  → ATLAS 4-layer pipeline   │
│  └── darwinian-weights.ts → Agent weight evolution  │
├─────────────────────────────────────────────────────┤
│  EXTERNAL APIS                                      │
│  ├── Google Gemini 2.5 Pro (reasoning) + Flash      │
│  ├── Alpha Vantage (market data)                    │
│  └── Alpaca Markets (trading execution)             │
└─────────────────────────────────────────────────────┘
```

### File Structure (Key Files)

```
src/
├── app/
│   ├── (app)/
│   │   ├── dashboard/page.tsx     # Main dashboard
│   │   ├── analysis/page.tsx      # Stock analysis + AI
│   │   ├── trading/page.tsx       # Auto-trading HUD
│   │   ├── agents-console/page.tsx # ATLAS pipeline runner
│   │   └── ...
│   ├── api/
│   │   ├── analysis/route.ts      # Single-stock AI endpoint
│   │   ├── atlas/pipeline/route.ts # ATLAS pipeline endpoint
│   │   ├── trading/route.ts       # Trade execution
│   │   └── market/                # Market data proxy
│   └── globals.css                # Design tokens + terminal utils
├── components/
│   ├── layout/                    # Shell, sidebar, header, ticker
│   ├── charts/                    # Price charts, sparklines
│   ├── analysis/                  # Quants explained, indicators
│   └── shared/                    # Reusable components
├── lib/
│   ├── agents/
│   │   ├── gemini-client.ts       # Gemini API wrapper + concurrency
│   │   ├── conductor.ts           # 8-agent analysis pipeline
│   │   ├── atlas-conductor.ts     # 16-agent ATLAS pipeline
│   │   ├── darwinian-weights.ts   # Evolutionary weight system
│   │   └── layers/
│   │       ├── layer-1-macro.ts   # Economic regime analysis
│   │       ├── layer-2-sectors.ts # Sector rotation signals
│   │       ├── layer-3-superinvestors.ts # Legendary investor sims
│   │       └── layer-4-decision.ts     # CRO + AlphaGen + CIO
│   ├── api/
│   │   └── alpha-vantage.ts       # Alpha Vantage client
│   ├── hooks/
│   │   └── use-market-data.ts     # TanStack Query hooks
│   └── trading/
│       ├── trade-executor.ts      # Alpaca execution layer
│       └── risk-limits.ts         # Risk guardrails
├── stores/
│   ├── app-store.ts               # UI state
│   ├── agent-store.ts             # Agent pipeline state
│   └── trading-store.ts           # Trading positions & config
└── types/
    ├── index.ts                   # Core types
    └── agent-types.ts             # ATLAS agent types
```

---

## 5. AI Agent System — ATLAS Pipeline

### Two Pipelines

FinSight has **two distinct AI pipelines**:

| Pipeline | Agents | Trigger | Purpose |
|----------|--------|---------|---------|
| **Single-Stock Analysis** | 8 agents | `/analysis` page button | Deep-dive one stock: fundamentals, technicals, sentiment, catalysts, risks |
| **ATLAS Portfolio Trading** | 16 agents | `/agents-console` page | Full portfolio: macro regime → sector rotation → stock picks → execution signals |

### ATLAS 4-Layer Architecture

```
Layer 1: MACRO REGIME (4 agents)
  ├── Macro Strategist — GDP, inflation, rates, employment
  ├── Geopolitical Analyst — trade wars, conflicts, sanctions
  ├── Monetary Policy Hawk — Fed policy, yield curves, liquidity
  └── Market Technician — S&P500 trend, VIX, breadth, momentum
  → Output: MarketRegime (RISK_ON | RISK_OFF | TRANSITIONAL)

Layer 2: SECTOR ROTATION (4 agents)
  ├── Sector Rotation — GICS sectors ranked by regime
  ├── Growth Scout — high-growth-at-reasonable-price picks
  ├── Value Hunter — undervalued, margin-of-safety picks
  └── Momentum Tracker — price momentum, relative strength
  → Output: SectorSignals + stock recommendations per agent

Layer 3: SUPERINVESTORS (4 agents)
  ├── Warren Buffett — moats, ROIC, pricing power, long-term
  ├── Ray Dalio — all-weather, risk parity, macro overlay
  ├── Cathie Wood — disruptive innovation, TAM expansion
  └── Jim Simons — quantitative signals, mean reversion
  → Output: ConvictionPicks per legendary investor persona

Layer 4: DECISION (4 agents)
  ├── Chief Risk Officer — portfolio VaR, correlation, sizing
  ├── Alpha Generator — synthesize all layers, rank opportunities
  └── Chief Investment Officer — final conviction filter, approve/veto
  → Output: FinalSignals [{symbol, direction, conviction, size}]
```

### Darwinian Weight Evolution

After each pipeline run, agent weights are updated based on accuracy:

```typescript
// Agents that predicted correctly → weight increases
// Agents that predicted wrong → weight decreases
// Weight range: 0.1 to 3.0x (prevents any single agent from dominating)
updateWeightsDarwinian(agentId, prediction, actualOutcome);
```

This means the system **gets smarter over time** — the best-performing agents gain more influence in future decisions.

---

## 6. Single-Stock Analysis Pipeline

### How It Works (Step by Step)

**File**: `src/lib/agents/conductor.ts`  
**API Route**: `src/app/api/analysis/route.ts`  
**Frontend**: `src/app/(app)/analysis/page.tsx`

```
User enters "NVDA" → clicks "Analyze with AI Agents"
    │
    ▼
Step 1: FETCH DATA
    ├── Quote (price, volume, P/E, EPS, market cap)
    ├── Historical prices (1Y)
    ├── Technical indicators (RSI, MACD, SMA, Bollinger)
    ├── Company profile (sector, industry, description)
    └── News articles (latest 10)
    │
    ▼
Step 2: RUN 4 ANALYST AGENTS (parallel, Gemini 2.5 Pro)
    ├── Fundamental Analyst — valuation, earnings, growth
    ├── Technical Analyst — chart patterns, trend, momentum
    ├── Sentiment Analyst — news tone, social buzz, institutional
    └── Risk Analyst — volatility, drawdown, correlation
    │
    ▼
Step 3: BULL vs BEAR DEBATE (Gemini 2.5 Pro)
    ├── Bull Agent — makes strongest case for buying
    ├── Bear Agent — makes strongest case against
    └── Each reads all 4 analyst reports
    │
    ▼
Step 4: TRADER DECISION (Gemini 2.5 Pro)
    ├── Reads analyst reports + debate transcript
    ├── Outputs: recommendation, confidence, price targets
    └── Generates catalyst list and risk factors
    │
    ▼
Step 5: RISK ASSESSMENT (Gemini 2.5 Flash)
    ├── Position sizing recommendation
    ├── Stop-loss levels
    └── Portfolio correlation check
    │
    ▼
Step 6: REPORT SYNTHESIS (Gemini 2.5 Flash)
    ├── Human-readable executive summary
    ├── Key metrics table
    └── Source citations
    │
    ▼
RESULT → FinSightAnalysis object displayed on page
    ├── Recommendation: STRONG BUY / BUY / HOLD / SELL / STRONG SELL
    ├── Confidence: 0-100%
    ├── Sentiment Score: 0-100
    ├── Price Targets: Bull / Base / Bear (12-month)
    ├── Key Catalysts (positive/negative/neutral)
    ├── Risk Factors (high/medium/low severity)
    └── Key Metrics (revenue growth, margins, PE ratio...)
```

### Concurrency Control

The Gemini client uses a **semaphore** to limit concurrent API calls:

```typescript
// gemini-client.ts
const MAX_CONCURRENT = 3; // Prevents CPU saturation on M4
const semaphore = new Semaphore(MAX_CONCURRENT);

export async function callGemini(prompt: string, model?: string) {
  return semaphore.acquire(async () => {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const m = genAI.getGenerativeModel({ model: model || "gemini-2.5-pro-preview-05-06" });
    const result = await m.generateContent(prompt);
    return result.response.text();
  });
}
```

---

## 7. ATLAS Portfolio Trading Pipeline

### How It Works

**File**: `src/lib/agents/atlas-conductor.ts`  
**API Route**: `src/app/api/atlas/pipeline/route.ts`  
**Frontend**: `src/app/(app)/agents-console/page.tsx`

```
User clicks "Run ATLAS Pipeline" on Agents Console
    │
    ▼
LAYER 1: MACRO REGIME DETECTION
    ├── 4 agents run in parallel
    ├── Each analyzes current economic conditions
    ├── Agents vote on regime: RISK_ON / RISK_OFF / TRANSITIONAL
    └── Weighted consensus determines final regime
    │
    ▼
LAYER 2: SECTOR ROTATION
    ├── 4 agents run with regime context
    ├── Each recommends top sectors for current regime
    ├── Agents suggest specific stock picks per sector
    └── Darwinian weights amplify high-performing agents
    │
    ▼
LAYER 3: SUPERINVESTOR SIMULATION
    ├── Buffett, Dalio, Wood, Simons personas run in parallel
    ├── Each evaluates the Layer 2 stock candidates
    ├── Each applies their own investment philosophy
    └── Output: conviction-ranked picks per investor
    │
    ▼
LAYER 4: DECISION LAYER
    ├── CRO: Risk check — correlation, concentration, VaR
    ├── Alpha Generator: Synthesize all layers into ranked opportunities
    ├── CIO: Final approval — sets conviction thresholds, vetoes bad ideas
    └── Output: FinalSignals ready for execution
    │
    ▼
DARWINIAN WEIGHT UPDATE
    ├── Compare to previous pipeline results
    ├── Agents that were right → weight ↑
    ├── Agents that were wrong → weight ↓
    └── Weights persist across sessions
    │
    ▼
TRADING EXECUTION (if enabled)
    ├── Signals appear on /trading page
    ├── User clicks "Execute All" (human-on-the-loop)
    ├── Alpaca API executes market orders (paper or live)
    └── Risk limits enforced: max per trade, daily limit, position %
```

### Risk Guardrails

```typescript
// risk-limits.ts
const DEFAULT_LIMITS = {
  maxPerTrade: 5000,           // Max $5K per single trade
  maxDaily: 25000,             // Max $25K total daily trading
  dailyLossLimit: 2000,        // Stop if $2K loss in a day
  maxPositions: 10,            // Max 10 concurrent positions
  maxPortfolioAllocation: 20,  // Max 20% in any single stock
  maxDrawdown: 10,             // Max 10% drawdown from peak
  cashReserve: 20,             // Keep 20% cash always
};
```

---

## 8. API Integrations

### Google Gemini API

```typescript
// All prompts use structured JSON output format
const prompt = `
You are a {role}. Analyze the following data and respond in JSON:
${JSON.stringify(marketData)}

Respond with:
{
  "recommendation": "STRONG_BUY|BUY|HOLD|SELL|STRONG_SELL",
  "confidence": 0.85,
  "reasoning": "...",
  "catalysts": [...],
  "risks": [...]
}`;
```

**Models Used**:
- **Gemini 2.5 Pro** — Complex reasoning tasks (analysts, debate, trader)
- **Gemini 2.5 Flash** — Fast tasks (risk assessment, report synthesis)

### Alpha Vantage API

```typescript
// Endpoints used:
// GLOBAL_QUOTE           → real-time stock quote
// TIME_SERIES_DAILY      → historical prices
// OVERVIEW               → company fundamentals
// NEWS_SENTIMENT         → market news
// RSI, MACD, SMA, BBANDS → technical indicators
```

### Alpaca Markets API

```typescript
// Paper trading by default
// Endpoints used:
// GET  /v2/account               → account info
// GET  /v2/positions             → open positions
// POST /v2/orders                → place market order
// DELETE /v2/positions/{symbol}  → close position
// DELETE /v2/orders              → cancel all orders
```

---

## 9. Performance Optimizations

### Problem: M4 MacBook Freezing

The original codebase had **14+ concurrent API calls** on dashboard load and the agent pipeline ran **16 agents simultaneously**, saturating CPU/memory.

### Solutions Implemented

| Fix | File | Impact |
|-----|------|--------|
| **Batch Quote Hook** | `use-market-data.ts` | Centralized fetching, 14→7 API calls |
| **Memoized Sparklines** | `dashboard/page.tsx` | `useRef` cache prevents regeneration |
| **Granular Selectors** | `trading/page.tsx` | Zustand `(s) => s.field` prevents re-renders |
| **Concurrency Semaphore** | `gemini-client.ts` | Max 3 concurrent Gemini calls |
| **TanStack Query Cache** | `use-market-data.ts` | `staleTime: 30s` deduplication |

---

## 10. Demo Walkthrough

### Script (5-minute demo)

#### Act 1: Dashboard (60s)
1. Open `http://localhost:3000/dashboard`
2. Point out: Pure-black Bloomberg UI, market ticker, regime indicator
3. Show: Real-time stock cards with sparklines
4. Show: Agent swarm status panel (Gemini 2.5 badge)
5. Point out: LIVE indicator, market news with sentiment badges

#### Act 2: AI Stock Analysis (120s)
1. Click **Analysis** in sidebar (or press F4)
2. Type `NVDA` → Lookup
3. Show: Price chart, company header, dense stats bar
4. Click **"Analyze with AI Agents"**
5. Watch pipeline progress bar (6 steps)
6. When complete, show:
   - Recommendation badge (STRONG BUY / BUY / etc.)
   - Sentiment gauge (0-100)
   - Price targets (Bull 🐂 / Base / Bear 🐻) with range bar
   - AI summary
   - Catalysts vs Risks side-by-side
   - Key metrics strip
   - Quants Explained (educational indicators)

#### Act 3: Trading HUD (60s)
1. Navigate to **Trading** (F6)
2. Show: Mode toggle (PAPER / LIVE / HALTED)
3. Show: Kill switch button
4. Show: Trading limits (configurable)
5. Show: Daily limit usage bar
6. Show: Open positions / trade history

#### Act 4: Agent Architecture (60s)
1. Navigate to **Agents Console** (F5)
2. Explain the 4-layer ATLAS pipeline
3. Show: Agent list with status indicators
4. Explain: Darwinian weights — agents compete, best ones gain influence

### Key Talking Points for Presentation
- **16 specialized AI agents** working together
- **Structured debates** — Bull vs Bear ensures balanced analysis
- **Darwinian evolution** — system improves over time
- **Risk guardrails** — dollar limits, kill switch, position caps
- **Bloomberg-grade UI** — professional information density
- **Real market data** — Alpha Vantage integration

---

## 11. Troubleshooting

### "Analysis returns error"
- Check `GOOGLE_API_KEY` in `.env.local`
- Free Gemini tier: 15 requests/minute limit
- The semaphore queues requests; wait ~30s between analyses

### "Stock data shows mock values"
- Alpha Vantage free tier: 25 requests/day, 5/minute
- After limit, the app uses intelligent mock data automatically
- Solution: Wait for rate limit reset or upgrade API key

### "MacBook gets hot during analysis"
- This is expected — the pipeline runs 8+ Gemini API calls
- The semaphore limits to 3 concurrent calls (won't freeze)
- CPU should stay under 80% usage

### "Trading page shows no positions"
- Alpaca API keys are optional
- Without them, the page shows mock paper trading data
- To enable real paper trading: add Alpaca keys to `.env.local`

### Common Commands

```bash
# Start dev server
npm run dev

# Build production (verify no errors)
npx next build

# Kill stale dev server
kill $(lsof -t -i:3000)

# Clear Next.js cache
rm -rf .next
```

---

## Summary

FinSight demonstrates a **production-grade AI-agentic system** for financial intelligence:

1. **Multi-Agent Architecture** — 16 specialized agents with distinct roles
2. **Structured Decision Making** — Data → Analysis → Debate → Decision → Risk → Execute
3. **Evolutionary Learning** — Darwinian weights reward accurate agents
4. **Professional UI** — Bloomberg Terminal-grade information density
5. **Safety First** — Dollar limits, kill switch, human approval gate

The system is designed to show how **AI agents can collaborate, debate, and make complex decisions** — with proper safeguards to prevent runaway execution.
