# FinSight — Bloomberg Terminal-Style AI Agentic Financial Intelligence Platform

## Project Guide | CSCI 5801 — Advanced AI

> **FinSight** is a next-generation, Bloomberg Terminal-inspired financial intelligence platform that fuses multi-agent swarm simulation (MiroShark/MiroFish), autonomous research loops (Karpathy's Autoresearch pattern), and agentic AI orchestration into a single cohesive system. It goes beyond dashboards and charts — FinSight **thinks**, **researches**, **simulates**, and **acts** on behalf of the analyst.

---

## Table of Contents

1. [Vision & Philosophy](#1-vision--philosophy)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Phase 0 — Project Scaffolding & Core Infrastructure](#phase-0--project-scaffolding--core-infrastructure)
5. [Phase 1 — Database Schema, Auth & Agent Registry](#phase-1--database-schema-auth--agent-registry)
6. [Phase 2 — Market Data Integration & Knowledge Graph](#phase-2--market-data-integration--knowledge-graph)
7. [Phase 3 — Bloomberg-Style Terminal Dashboard](#phase-3--bloomberg-style-terminal-dashboard)
8. [Phase 4 — Portfolio Management & Risk Engine](#phase-4--portfolio-management--risk-engine)
9. [Phase 5 — Watchlist, Alerts & Real-Time Streaming](#phase-5--watchlist-alerts--real-time-streaming)
10. [Phase 6 — AI Analysis Engine (ASKB-Style)](#phase-6--ai-analysis-engine-askb-style)
11. [Phase 7 — Autoresearch: Autonomous Strategy Discovery](#phase-7--autoresearch-autonomous-strategy-discovery)
12. [Phase 8 — MiroShark/MiroFish: Market Sentiment Swarm Simulation](#phase-8--mirosharkfish-market-sentiment-swarm-simulation)
13. [Phase 9 — Agent Orchestrator & Swarm Control Plane](#phase-9--agent-orchestrator--swarm-control-plane)
14. [Phase 10 — Terminal Command Interface & ASKB Workflows](#phase-10--terminal-command-interface--askb-workflows)
15. [Phase 11 — Settings, Governance & Responsible AI](#phase-11--settings-governance--responsible-ai)
16. [Phase 12 — Polish, Performance & Deployment](#phase-12--polish-performance--deployment)
17. [Bonus — Frontier Features](#bonus--frontier-features)
18. [Research References](#research-references)

---

## 1. Vision & Philosophy

### What Makes FinSight Different

Traditional financial platforms are **passive** — they display data and wait for human queries. FinSight is **active** — it operates on three foundational pillars:

| Pillar | Inspiration | What It Does |
|--------|-------------|--------------|
| **Agentic Analysis** | Bloomberg ASKB | Multi-agent AI system that synthesizes data across structured datasets, news, research, and analytics with transparent source attribution |
| **Autonomous Research** | Karpathy's Autoresearch | Self-improving research loops that run experiments overnight — testing trading hypotheses, optimizing strategies, and discovering alpha without human code |
| **Swarm Intelligence** | MiroFish / MiroShark | Thousands of AI agents with unique personality profiles simulate market reactions, predict sentiment shifts, and forecast crowd behavior before events happen |

### Core Design Principles

1. **Agent-First Architecture** — Every major capability is an autonomous agent, not a static function call
2. **Human-on-the-Loop** — Humans set goals and constraints (via `program.md`-style directives); agents execute
3. **Transparent Reasoning** — Every AI decision includes a full reasoning chain, source attribution, and confidence scoring
4. **Composable Swarms** — Agents can be composed into swarms for emergent intelligence (e.g., 500 simulated traders predicting earnings reactions)
5. **Terminal-Grade UX** — Keyboard-driven, information-dense, zero-latency feel — like Bloomberg, not like a consumer web app

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FinSight Terminal UI                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │Dashboard │ │Portfolio │ │ Analysis │ │ Swarm    │ │ Terminal CLI  │ │
│  │  Panel   │ │ Manager  │ │  Engine  │ │  Studio  │ │  (Cmd+K)     │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘ │
│       │             │            │             │              │         │
├───────┴─────────────┴────────────┴─────────────┴──────────────┴─────────┤
│                     Agent Orchestration Layer                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Conductor Agent (Master Orchestrator)                          │    │
│  │  ├── MarketDataAgent      — real-time data ingestion            │    │
│  │  ├── AnalysisAgent        — fundamental + technical analysis    │    │
│  │  ├── ResearchAgent        — Autoresearch experiment loops       │    │
│  │  ├── SwarmAgent           — MiroShark sentiment simulation      │    │
│  │  ├── RiskAgent            — portfolio risk & compliance         │    │
│  │  ├── NewsAgent            — NLP news processing & sentiment     │    │
│  │  ├── ReportAgent          — structured report generation        │    │
│  │  └── AlertAgent           — threshold monitoring & triggers     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                        Data & Intelligence Layer                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │PostgreSQL│ │  Neo4j   │ │  Redis   │ │ Vector   │ │  Time-Series │ │
│  │  (OLTP)  │ │ (Graph)  │ │ (Cache)  │ │   DB     │ │   Store      │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘ │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                     External Integrations                               │
│  Market APIs │ News APIs │ LLM APIs │ WebSocket Feeds │ SEC EDGAR     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### Frontend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14+ (App Router) | SSR, routing, API routes |
| Language | TypeScript (strict mode) | Type safety across the stack |
| Styling | Tailwind CSS + shadcn/ui | Bloomberg-dark aesthetic, rapid component building |
| State | Zustand + TanStack Query | Client state + server cache with stale-while-revalidate |
| Charts | Lightweight Charts (TradingView) + Recharts | Professional candlestick charts + dashboard visualizations |
| Real-time | Socket.IO / WebSocket | Live price feeds, agent status streaming |
| Terminal | xterm.js or custom | Bloomberg-style command interface |

### Backend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| API | Next.js API Routes + FastAPI (Python) | TypeScript endpoints + Python for ML/agent workloads |
| ORM | Prisma (Node) + SQLAlchemy (Python) | Database abstraction for both runtimes |
| Queue | BullMQ (Redis-backed) | Agent task scheduling, Autoresearch job queue |
| Streaming | Server-Sent Events (SSE) | Agent reasoning stream, live analysis updates |

### Data Layer
| Store | Technology | Purpose |
|-------|-----------|---------|
| Primary DB | PostgreSQL | Users, portfolios, transactions, agent configs |
| Graph DB | Neo4j | Knowledge graphs, entity relationships, MiroShark agent memory |
| Cache | Redis | Quote cache, session store, rate limiting, pub/sub |
| Vector Store | pgvector (PostgreSQL extension) | Semantic search over news, filings, research reports |
| Time-Series | TimescaleDB (PostgreSQL extension) | High-frequency price data, agent experiment logs |

### AI & Agent Layer
| Component | Technology | Purpose |
|-----------|-----------|---------|
| LLM | Claude API (Anthropic) + OpenAI | Primary reasoning engine for analysis agents |
| Agent Framework | LangGraph / CrewAI | Multi-agent orchestration and workflow graphs |
| Embeddings | OpenAI text-embedding-3-small | Document vectorization for RAG |
| Knowledge Graph | Neo4j + LangChain GraphRAG | Structured knowledge extraction (MiroFish pattern) |
| Experiment Runner | Custom (Autoresearch pattern) | Strategy backtesting and optimization loops |

### Infrastructure
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Containers | Docker + Docker Compose | Local dev environment with all services |
| CI/CD | GitHub Actions | Lint, type-check, test, deploy pipeline |
| Deployment | Vercel (frontend) + Railway/Fly.io (Python services) | Production hosting |
| Monitoring | OpenTelemetry + Grafana | Agent observability, latency tracking |

---

## Phase 0 — Project Scaffolding & Core Infrastructure

### Objective
Initialize the monorepo with both the Next.js frontend and the Python agent backend. Establish the Bloomberg-dark terminal aesthetic from day one.

### Project Structure

```
/finsight
├── /apps
│   ├── /web                          # Next.js frontend
│   │   ├── /src
│   │   │   ├── /app                  # App Router pages
│   │   │   │   ├── /dashboard
│   │   │   │   ├── /portfolio
│   │   │   │   ├── /watchlist
│   │   │   │   ├── /analysis
│   │   │   │   ├── /autoresearch     # Autonomous research console
│   │   │   │   ├── /swarm            # MiroShark swarm studio
│   │   │   │   ├── /terminal         # Bloomberg-style command interface
│   │   │   │   └── /settings
│   │   │   ├── /components
│   │   │   │   ├── /ui               # shadcn base components
│   │   │   │   ├── /charts           # financial chart components
│   │   │   │   ├── /terminal         # command palette, terminal widgets
│   │   │   │   ├── /agents           # agent status, reasoning displays
│   │   │   │   ├── /swarm            # swarm visualization components
│   │   │   │   ├── /layout           # nav, sidebar, header, panels
│   │   │   │   └── /shared           # reusable business components
│   │   │   ├── /lib
│   │   │   │   ├── /api              # API client functions
│   │   │   │   ├── /hooks            # custom React hooks
│   │   │   │   ├── /utils            # helpers, formatters, constants
│   │   │   │   ├── /ws               # WebSocket client manager
│   │   │   │   └── /validators       # Zod schemas
│   │   │   ├── /services             # business logic layer
│   │   │   ├── /stores               # Zustand stores
│   │   │   └── /types                # TypeScript interfaces & types
│   │   ├── /prisma
│   │   │   └── schema.prisma
│   │   └── /public
│   │
│   └── /agents                       # Python agent backend
│       ├── /src
│       │   ├── /core                 # Agent base classes, orchestrator
│       │   ├── /agents               # Individual agent implementations
│       │   │   ├── analysis_agent.py
│       │   │   ├── research_agent.py # Autoresearch loop
│       │   │   ├── swarm_agent.py    # MiroShark controller
│       │   │   ├── risk_agent.py
│       │   │   ├── news_agent.py
│       │   │   └── report_agent.py
│       │   ├── /swarm                # MiroShark/MiroFish simulation engine
│       │   │   ├── /personas         # Agent persona definitions
│       │   │   ├── /simulation       # Simulation runtime
│       │   │   ├── /knowledge        # GraphRAG knowledge builder
│       │   │   └── /analysis         # Swarm output analysis
│       │   ├── /autoresearch         # Karpathy-style research automation
│       │   │   ├── program.md        # Human-authored research directives
│       │   │   ├── runner.py         # Experiment execution engine
│       │   │   ├── evaluator.py      # Result evaluation & comparison
│       │   │   └── results.tsv       # Experiment log
│       │   ├── /knowledge            # Knowledge graph builders
│       │   ├── /market_data          # Data providers & caching
│       │   └── /utils                # Shared utilities
│       ├── requirements.txt
│       └── pyproject.toml
│
├── /docs                             # Project documentation
├── docker-compose.yml                # PostgreSQL, Redis, Neo4j, all services
├── .env.example
├── turbo.json                        # Turborepo config (optional monorepo tool)
└── README.md
```

### Setup Deliverables

1. Initialize Next.js 14+ with TypeScript, Tailwind CSS, App Router
2. Initialize Python backend with FastAPI, uvicorn, Poetry/pip
3. Install all dependencies across both apps
4. Create `docker-compose.yml` with: PostgreSQL + TimescaleDB, Redis, Neo4j
5. Bloomberg-dark theme as default — monospace fonts (JetBrains Mono / IBM Plex Mono), dark backgrounds (#0a0a0a, #111111), accent colors (Bloomberg orange #FF6600, signal green #00D26A, signal red #FF3B3B)
6. Collapsible sidebar with: Dashboard, Portfolio, Watchlist, Analysis, Autoresearch, Swarm Studio, Terminal, Settings
7. Top bar with: market ticker strip, search (Cmd+K), agent status indicator, alerts bell, user menu
8. Configure path aliases, ESLint, Prettier, pre-commit hooks
9. `.env.example` with all required environment variables documented

---

## Phase 1 — Database Schema, Auth & Agent Registry

### Objective
Establish the data foundation including the agent registry — every agent in the system is a first-class entity with state, configuration, and audit trail.

### Prisma Schema Models

#### Core Models (User, Portfolio, Holdings, Transactions)
Carry forward all models from the base FinSight schema (User, UserPreferences, Portfolio, Holding, Watchlist, WatchlistItem, Alert, Transaction) with these additions:

#### Agent Registry Models

```prisma
model Agent {
  id            String        @id @default(cuid())
  name          String        // e.g., "AnalysisAgent", "SwarmController"
  type          AgentType
  status        AgentStatus   @default(IDLE)
  config        Json          // agent-specific configuration
  lastRunAt     DateTime?
  lastResult    Json?         // summary of last execution
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  runs          AgentRun[]
  userId        String?       // null = system agent, non-null = user's personal agent
  user          User?         @relation(fields: [userId], references: [id])
}

model AgentRun {
  id            String        @id @default(cuid())
  agentId       String
  agent         Agent         @relation(fields: [agentId], references: [id])
  status        RunStatus     // QUEUED, RUNNING, COMPLETED, FAILED, CANCELLED
  input         Json          // what was sent to the agent
  output        Json?         // what the agent returned
  reasoning     Json?         // step-by-step reasoning chain
  tokensUsed    Int?
  durationMs    Int?
  startedAt     DateTime?
  completedAt   DateTime?
  createdAt     DateTime      @default(now())
  parentRunId   String?       // for nested agent calls
  parentRun     AgentRun?     @relation("AgentRunTree", fields: [parentRunId], references: [id])
  childRuns     AgentRun[]    @relation("AgentRunTree")
}

model ResearchExperiment {
  id            String        @id @default(cuid())
  programId     String        // reference to the program.md directive
  hypothesis    String
  parameters    Json          // experiment configuration
  results       Json?         // metrics, outcomes
  status        ExperimentStatus
  commitHash    String?       // git-style tracking of strategy versions
  metricValue   Float?        // primary optimization metric
  duration      Int?          // seconds
  createdAt     DateTime      @default(now())
  userId        String
  user          User          @relation(fields: [userId], references: [id])
}

model SwarmSimulation {
  id            String        @id @default(cuid())
  name          String
  scenario      Json          // seed data: news, events, market conditions
  agentCount    Int
  personas      Json          // persona distribution configuration
  status        SimulationStatus
  results       Json?         // aggregated simulation outcomes
  sentiment     Json?         // sentiment distribution over time
  startedAt     DateTime?
  completedAt   DateTime?
  createdAt     DateTime      @default(now())
  userId        String
  user          User          @relation(fields: [userId], references: [id])
}

enum AgentType {
  ANALYSIS
  RESEARCH
  SWARM_CONTROLLER
  RISK
  NEWS
  REPORT
  ALERT
  CUSTOM
}

enum AgentStatus {
  IDLE
  RUNNING
  ERROR
  DISABLED
}

enum RunStatus {
  QUEUED
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}

enum ExperimentStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  IMPROVED
  REGRESSED
}

enum SimulationStatus {
  CONFIGURING
  RUNNING
  ANALYZING
  COMPLETED
  FAILED
}
```

### Auth Setup
1. NextAuth with Google OAuth + Credentials providers
2. Role-based access: `USER` (default), `POWER_USER` (swarm access), `ADMIN`
3. API key management for external services per user
4. Protected routes middleware for all authenticated pages
5. Session provider wrapper with user context (preferences, active agents)

---

## Phase 2 — Market Data Integration & Knowledge Graph

### Objective
Build a unified market data layer AND a knowledge graph that serves as the shared memory for all agents.

### Market Data Service (TypeScript — Next.js)

Carry forward the full `MarketDataProvider` interface from the base prompts (getQuote, getBatchQuotes, getHistoricalData, searchSymbol, getMarketMovers, getMarketNews, getCompanyProfile) with these enhancements:

#### Additional Provider Methods
```typescript
interface EnhancedMarketDataProvider extends MarketDataProvider {
  getEarningsCalendar(symbol?: string): Promise<EarningsEvent[]>
  getSECFilings(symbol: string, type?: FilingType): Promise<SECFiling[]>
  getInsiderTransactions(symbol: string): Promise<InsiderTransaction[]>
  getInstitutionalHoldings(symbol: string): Promise<InstitutionalHolding[]>
  getOptionsChain(symbol: string, expiry?: string): Promise<OptionsChain>
  getEconomicIndicators(): Promise<EconomicIndicator[]>
  getSectorPerformance(): Promise<SectorPerformance[]>
}
```

### Knowledge Graph Layer (Python — Neo4j)

This is where FinSight diverges from traditional platforms. Inspired by MiroFish's GraphRAG pipeline:

```
Raw Data Sources → Entity Extraction → Neo4j Knowledge Graph → Agent Queries
```

#### Graph Entities (Neo4j Nodes)
- **Company** — symbol, name, sector, industry, metrics
- **Person** — executives, board members, fund managers
- **Event** — earnings, FDA approvals, mergers, policy changes
- **Sector** — sector-level aggregates and relationships
- **NewsArticle** — title, source, sentiment, entities mentioned
- **Filing** — SEC filings linked to companies
- **Indicator** — macro-economic indicators (CPI, Fed rate, etc.)

#### Graph Relationships
- `COMPANY -[BELONGS_TO]-> SECTOR`
- `PERSON -[MANAGES]-> COMPANY`
- `COMPANY -[COMPETITOR_OF]-> COMPANY`
- `COMPANY -[SUPPLIER_TO]-> COMPANY`
- `EVENT -[AFFECTS]-> COMPANY`
- `NEWS_ARTICLE -[MENTIONS]-> COMPANY`
- `NEWS_ARTICLE -[SENTIMENT {score}]-> COMPANY`
- `INDICATOR -[IMPACTS]-> SECTOR`

#### Knowledge Graph Builder Service
```python
class KnowledgeGraphBuilder:
    """
    Continuously ingests raw data and maintains the Neo4j knowledge graph.
    Runs as a background service with configurable refresh intervals.
    """
    async def ingest_news(self, articles: list[NewsArticle]) -> None
    async def ingest_filing(self, filing: SECFiling) -> None
    async def ingest_earnings(self, event: EarningsEvent) -> None
    async def extract_entities(self, text: str) -> list[Entity]
    async def build_relationships(self, entities: list[Entity]) -> None
    async def query(self, cypher: str) -> list[dict]
    async def semantic_search(self, query: str, top_k: int) -> list[dict]
```

### Vector Store (pgvector)
- Embed all news articles, SEC filings, and research reports
- Enable semantic search: "companies affected by rising interest rates"
- Agents use this for context retrieval (RAG) when generating analysis

### Caching Strategy
| Data Type | TTL | Store |
|-----------|-----|-------|
| Real-time quotes | 15 seconds | Redis |
| Historical data (daily) | 1 hour | Redis |
| Company profiles | 24 hours | Redis |
| News articles | 30 minutes | Redis |
| Knowledge graph | Continuous | Neo4j |
| Embeddings | Permanent | pgvector |
| Agent results | 4 hours | Redis + PostgreSQL |

---

## Phase 3 — Bloomberg-Style Terminal Dashboard

### Objective
Build an information-dense, keyboard-navigable dashboard that feels like a Bloomberg Terminal — not a consumer fintech app.

### Design Language
- **Background**: Pure black (#000000) or near-black (#0a0a0a)
- **Text**: High-contrast white (#FFFFFF) and muted gray (#888888)
- **Accent**: Bloomberg Orange (#FF6600) for highlights and focus states
- **Positive**: Signal Green (#00D26A) — muted, not neon
- **Negative**: Signal Red (#FF3B3B)
- **Font**: Monospace primary (JetBrains Mono), sans-serif secondary (Inter)
- **Density**: Maximize data per pixel — small fonts (12-13px base), tight spacing, multi-panel layouts
- **Borders**: Subtle 1px borders (#222222) separating panels

### Dashboard Layout (4-Panel Grid)

```
┌──────────────────────────────────────────────────────────────┐
│  [Market Ticker Strip — S&P, NASDAQ, DOW, BTC, 10Y, VIX]    │
├──────────────────────────┬───────────────────────────────────┤
│  PORTFOLIO SUMMARY       │  AGENT STATUS PANEL               │
│  Total Value: $124,892   │  AnalysisAgent: IDLE              │
│  Day P&L: +$1,203 (+0.97%)│  ResearchAgent: RUNNING (exp #47)│
│  [30d sparkline]         │  SwarmAgent: IDLE                  │
│  [Allocation donut]      │  NewsAgent: MONITORING             │
│                          │  [View Agent Console →]            │
├──────────────────────────┼───────────────────────────────────┤
│  MARKET MOVERS           │  WATCHLIST QUICK VIEW              │
│  [Gainers│Losers│Active] │  AAPL  $189.42  +1.2%  ████      │
│  NVDA +8.2% | META +5.1%│  MSFT  $421.30  -0.3%  ████      │
│  TSLA -4.3% | BA -3.8%  │  GOOGL $176.50  +0.8%  ████      │
│                          │  [+ Add Symbol]                    │
├──────────────────────────┼───────────────────────────────────┤
│  LIVE NEWS FEED          │  ACTIVE RESEARCH                   │
│  ● Fed signals pause...  │  Strategy: Momentum + Value        │
│  ● AAPL earnings beat... │  Experiments: 47/100               │
│  ● Oil surges on...      │  Best metric: 12.3% CAGR           │
│  [sentiment tags]        │  [View Autoresearch Console →]     │
├──────────────────────────┴───────────────────────────────────┤
│  ALERTS: 3 active │ 1 triggered today │ [Manage Alerts →]    │
└──────────────────────────────────────────────────────────────┘
```

### Key Components
- **MarketTickerStrip** — horizontal scroll, auto-refresh every 15s, flash animation on change
- **PortfolioSummaryPanel** — total value, day P&L, 30d sparkline, allocation donut
- **AgentStatusPanel** — live status of all registered agents with activity indicator
- **MarketMoversTable** — tabbed (Gainers/Losers/Active), click navigates to `/analysis?symbol=`
- **WatchlistQuickView** — top N items with inline sparklines
- **NewsFeedPanel** — streaming news with AI sentiment tags (bullish/bearish/neutral dot)
- **ActiveResearchPanel** — current Autoresearch run status, progress bar, best result
- **AlertsSummaryBar** — active count, triggered count, quick link to manage

### Keyboard Navigation
| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open command palette (search symbols, navigate pages, run agents) |
| `G D` | Go to Dashboard |
| `G P` | Go to Portfolio |
| `G A` | Go to Analysis |
| `G R` | Go to Autoresearch |
| `G S` | Go to Swarm Studio |
| `/` | Focus search |
| `?` | Show all shortcuts |

---

## Phase 4 — Portfolio Management & Risk Engine

### Objective
Full portfolio CRUD with an integrated AI Risk Agent that continuously monitors portfolio health.

### Core Portfolio Features
Carry forward all portfolio management features from the base prompts (portfolio CRUD, holdings table, transactions, allocation charts, performance metrics) plus:

### AI Risk Agent Integration

The **RiskAgent** runs as a background agent that continuously evaluates portfolio risk:

```python
class RiskAgent(BaseAgent):
    """
    Monitors portfolio risk metrics and generates alerts when
    thresholds are breached or anomalies are detected.
    """
    async def analyze_portfolio(self, portfolio_id: str) -> RiskReport:
        # Calculates: VaR (95%, 99%), CVaR, Beta, Sharpe, Sortino,
        # Max Drawdown, Sector Concentration, Correlation Matrix
        ...

    async def stress_test(self, portfolio_id: str, scenarios: list[Scenario]) -> StressTestResult:
        # Simulates: 2008 Financial Crisis, COVID Crash, Rate Hike,
        # Tech Correction, Black Swan custom scenarios
        ...

    async def detect_anomalies(self, portfolio_id: str) -> list[Anomaly]:
        # Flags: unusual concentration, correlated holdings,
        # dividend cuts in income portfolios, earnings risk clustering
        ...
```

### Risk Dashboard (within Portfolio Detail)
- **Value at Risk (VaR)** — 1-day 95% and 99% VaR visualized as a distribution
- **Stress Test Results** — dropdown of historical scenarios with projected P&L impact
- **Correlation Heatmap** — inter-holding correlation matrix
- **Sector Exposure Radar** — radar chart showing sector weights vs. benchmark
- **Risk Score** — 0-100 composite score with breakdown
- **AI Risk Commentary** — natural language explanation of current risk posture

### Advanced Portfolio Analytics
- **Factor Exposure** — decompose returns into market, size, value, momentum factors
- **Tax Lot Tracking** — FIFO, LIFO, specific lot identification for tax optimization
- **Rebalancing Suggestions** — AI agent proposes trades to match target allocation
- **What-If Simulator** — "What if I add 100 shares of NVDA?" → real-time portfolio impact

---

## Phase 5 — Watchlist, Alerts & Real-Time Streaming

### Objective
Build a professional watchlist with comparison mode, a robust alert system, and WebSocket-driven real-time price streaming.

### Watchlist Features
Carry forward all watchlist features from the base prompts plus:

### Real-Time Price Streaming
```typescript
class PriceStreamManager {
  // Connects to Finnhub/Polygon WebSocket
  // Publishes price updates to subscribed components via Zustand
  // Handles reconnection, heartbeat, subscription management
  subscribe(symbols: string[]): void
  unsubscribe(symbols: string[]): void
  onPriceUpdate(callback: (update: PriceUpdate) => void): void
}
```

- Live price ticks on dashboard, watchlist, and portfolio pages
- Flash animation: green flash on uptick, red flash on downtick
- Real-time P&L updates in portfolio view

### Smart Alerts (AI-Enhanced)
Beyond basic price threshold alerts, the **AlertAgent** supports:

| Alert Type | Description |
|-----------|-------------|
| Price Above/Below | Classic threshold triggers |
| Percent Change | Daily % change exceeds threshold |
| Volume Spike | Volume exceeds N× average |
| Earnings Proximity | Alert N days before earnings |
| Sentiment Shift | NewsAgent detects sentiment reversal |
| Correlation Break | Two normally correlated assets diverge |
| Sector Rotation | Significant capital flow between sectors |
| AI Anomaly | AnalysisAgent flags unusual pattern |

---

## Phase 6 — AI Analysis Engine (ASKB-Style)

### Objective
Build a Bloomberg ASKB-inspired multi-agent analysis system. When a user requests analysis on a symbol, a **Conductor Agent** orchestrates multiple specialized agents working in parallel, then synthesizes their outputs.

### Multi-Agent Analysis Flow

```
User: "Analyze NVDA"
        │
        ▼
┌─── Conductor Agent ───────────────────────────────────────┐
│                                                            │
│   Spawns parallel sub-agents:                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│   │ Fundamental   │  │ Technical    │  │ News &       │   │
│   │ Agent         │  │ Agent        │  │ Sentiment    │   │
│   │               │  │              │  │ Agent        │   │
│   │ P/E, Revenue  │  │ RSI, MACD,   │  │ Recent news, │   │
│   │ Growth, FCF,  │  │ SMA crosses, │  │ NLP sentiment│   │
│   │ Margins, DCF  │  │ Support/Res  │  │ social pulse │   │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│          │                  │                  │            │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│   │ Peer Comp    │  │ Knowledge    │  │ Risk         │   │
│   │ Agent        │  │ Graph Agent  │  │ Assessment   │   │
│   │              │  │              │  │ Agent        │   │
│   │ Sector peers,│  │ Entity rels, │  │ Volatility,  │   │
│   │ relative val │  │ supply chain │  │ event risk,  │   │
│   │ comparison   │  │ dependencies │  │ downside     │   │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│          │                  │                  │            │
│          └──────────────────┼──────────────────┘            │
│                             ▼                               │
│                    Synthesis & Report                        │
│                    ┌──────────────────┐                     │
│                    │ ReportAgent      │                     │
│                    │ Merges all agent │                     │
│                    │ outputs into     │                     │
│                    │ structured report│                     │
│                    └──────────────────┘                     │
└────────────────────────────────────────────────────────────┘
```

### Structured Analysis Output

```typescript
interface FinSightAnalysis {
  symbol: string
  generatedAt: string
  agents: AgentContribution[]   // which agents contributed, with reasoning chains

  // Synthesis
  summary: string               // 2-3 sentence executive summary
  sentiment: "strong_bullish" | "bullish" | "neutral" | "bearish" | "strong_bearish"
  sentimentScore: number        // 0-100
  confidence: number            // 0-100 (how confident the synthesis is)
  recommendation: "strong_buy" | "buy" | "hold" | "sell" | "strong_sell"

  // Fundamental
  fundamentalOutlook: string
  intrinsicValue: { dcf: number; comparables: number; average: number }
  keyMetrics: MetricAssessment[]

  // Technical
  technicalOutlook: string
  supportLevels: number[]
  resistanceLevels: number[]
  trendDirection: "up" | "down" | "sideways"
  technicalSignals: TechnicalSignal[]

  // Catalysts & Risks
  catalysts: CatalystItem[]
  risks: RiskItem[]
  upcomingEvents: EventItem[]

  // Price Targets
  priceTargets: { bear: number; base: number; bull: number; timeframe: string }

  // Knowledge Graph Insights
  supplyChainRisks: string[]
  competitiveDynamics: string
  sectorTailwinds: string[]
  sectorHeadwinds: string[]

  // Sources
  sources: SourceAttribution[]  // transparent source tracking (Bloomberg ASKB pattern)
}
```

### Analysis Page UI Sections
1. **Interactive Price Chart** — Candlestick with volume, overlays (SMA, EMA, Bollinger), indicators (RSI, MACD)
2. **Company Profile Card** — Logo, sector, key stats, 52-week range slider
3. **AI Multi-Agent Analysis Panel** — The main event: sentiment gauge, agent reasoning tabs, price target range, recommendation badge
4. **Agent Reasoning Viewer** — Expandable panel showing each agent's individual analysis with confidence scores
5. **Financials** — Income Statement, Balance Sheet, Cash Flow, Key Ratios (quarterly/annual toggle)
6. **Knowledge Graph Explorer** — Visual graph showing entity relationships for the symbol
7. **News & Sentiment Timeline** — Chronological news with sentiment scores plotted over time
8. **Peer Comparison** — Auto-detected peers with comparative metrics and bar charts

---

## Phase 7 — Autoresearch: Autonomous Strategy Discovery

### Objective
Implement Karpathy's Autoresearch pattern for autonomous financial strategy discovery. Instead of training ML models, the FinSight Autoresearch loop autonomously tests, evaluates, and iterates on **trading and investment strategies**.

### Core Concept

```
┌─────────────────────────────────────────────────────┐
│                  Autoresearch Loop                    │
│                                                       │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│   │  Human    │───▶│  Agent   │───▶│ Evaluate │      │
│   │ Writes    │    │ Modifies │    │ Results  │      │
│   │program.md │    │strategy.py│   │ Against  │──┐   │
│   │(goals &   │    │(the only │    │ Metrics  │  │   │
│   │constraints)│   │ editable │    │          │  │   │
│   └──────────┘    │  file)   │    └──────────┘  │   │
│                    └──────────┘                   │   │
│                         ▲                        │   │
│                         └────────────────────────┘   │
│                        iterate until convergence      │
│                                                       │
│   Results logged to results.tsv                       │
│   Best strategies committed to strategy_archive/      │
└─────────────────────────────────────────────────────┘
```

### Three-File Architecture (Adapted from Karpathy)

#### 1. `program.md` — Human-Authored Research Directives
```markdown
# FinSight Autoresearch Program

## Objective
Discover a momentum + mean-reversion hybrid strategy that achieves:
- CAGR > 15% over 5-year backtest (2019-2024)
- Maximum Drawdown < 20%
- Sharpe Ratio > 1.5
- Minimum 50 trades per year (no overfitting to few signals)

## Universe
S&P 500 constituents. No penny stocks. Minimum $1B market cap.

## Constraints
- Long-only (no shorting in this experiment)
- Maximum 20 positions at any time
- Maximum 10% allocation per position
- Transaction costs: 0.1% per trade
- Rebalance frequency: weekly

## Budget
- 5 minutes per experiment (backtest runtime)
- 100 experiments maximum
- Optimize for: sharpe_ratio (primary), cagr (secondary)

## Off-Limits
- Do not use future data (no look-ahead bias)
- Do not install new packages
- Do not modify prepare.py or evaluate.py
```

#### 2. `strategy.py` — The Only File the Agent Modifies
```python
"""
FinSight Autoresearch — Strategy Definition
This is the ONLY file the agent can modify.
"""

class Strategy:
    def __init__(self, config: dict):
        self.lookback = config.get("lookback", 20)
        self.momentum_window = config.get("momentum_window", 60)
        self.mean_reversion_threshold = config.get("mr_threshold", 2.0)
        # ... agent iterates on these parameters and logic

    def generate_signals(self, market_data: pd.DataFrame) -> pd.DataFrame:
        """Return a DataFrame of signals: symbol, date, action, weight"""
        # Agent modifies this logic each experiment
        ...

    def position_sizing(self, signals: pd.DataFrame, portfolio_value: float) -> pd.DataFrame:
        """Determine position sizes given signals and available capital"""
        ...
```

#### 3. `evaluate.py` — Fixed Evaluation (Read-Only)
```python
"""
Fixed evaluation harness. Agent CANNOT modify this file.
Runs the strategy against historical data and computes metrics.
"""

def run_backtest(strategy: Strategy, data: pd.DataFrame, initial_capital: float) -> BacktestResult:
    # Simulates the strategy over historical data
    # Returns: CAGR, Sharpe, Sortino, Max Drawdown, total trades, equity curve
    ...

def compare_to_benchmark(result: BacktestResult, benchmark: pd.Series) -> ComparisonResult:
    # Compares strategy performance to S&P 500 buy-and-hold
    ...
```

### Autoresearch Console UI (`/autoresearch`)

```
┌──────────────────────────────────────────────────────────────┐
│  AUTORESEARCH CONSOLE                          [New Program] │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Active Program: "Momentum + Mean-Reversion Hybrid"           │
│  Status: RUNNING — Experiment 47 of 100                       │
│  ████████████████████░░░░░░░░░░░░  47%                       │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  EXPERIMENT LOG (live)                                   │ │
│  │  #47  Sharpe: 1.82  CAGR: 17.3%  MDD: -14.2%  ✓ BEST  │ │
│  │  #46  Sharpe: 1.45  CAGR: 14.1%  MDD: -18.7%          │ │
│  │  #45  Sharpe: 0.92  CAGR: 11.8%  MDD: -22.1%  ✗ FAIL  │ │
│  │  #44  Sharpe: 1.67  CAGR: 16.8%  MDD: -15.4%          │ │
│  │  ...                                                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │ CONVERGENCE CHART    │  │ BEST STRATEGY DETAILS        │ │
│  │ [Sharpe over time]   │  │ Exp #47                      │ │
│  │                      │  │ Sharpe: 1.82 (target: 1.5)   │ │
│  │    ╱──╱╲──╱──▲       │  │ CAGR: 17.3% (target: 15%)   │ │
│  │  ╱──╱       best     │  │ MDD: -14.2% (limit: -20%)   │ │
│  │ ╱                    │  │ Trades/yr: 87                │ │
│  │                      │  │ [View Strategy Code]         │ │
│  │                      │  │ [Deploy to Paper Trading]    │ │
│  └──────────────────────┘  └──────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ AGENT REASONING (Exp #47)                                │ │
│  │ "Increased momentum lookback from 40 to 60 days based   │ │
│  │  on exp #44's improvement. Added RSI filter to avoid     │ │
│  │  entering overbought positions. This reduced max         │ │
│  │  drawdown by 1.2% while maintaining CAGR. Next: test    │ │
│  │  volume confirmation filter."                            │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Key Features
- **Program Editor** — Edit `program.md` directives in a split-pane markdown editor
- **Live Experiment Log** — Streaming updates as each experiment completes
- **Convergence Chart** — Plot of primary metric over experiment iterations
- **Strategy Diff Viewer** — See exactly what the agent changed between experiments
- **Best Strategy Inspector** — View code, backtest equity curve, trade log
- **Deploy to Paper Trading** — One-click deployment of best strategy to simulated trading
- **Strategy Archive** — History of all programs and their best-discovered strategies

---

## Phase 8 — MiroShark/MiroFish: Market Sentiment Swarm Simulation

### Objective
Integrate a MiroShark-inspired multi-agent swarm simulation engine that generates hundreds of AI agents — each with unique investor personas — to simulate market reactions to events before they happen.

### Core Architecture

```
┌────────────────────────────────────────────────────────────┐
│                 MiroShark Swarm Engine                       │
│                                                              │
│  1. KNOWLEDGE EXTRACTION                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Seed Data → GraphRAG → Neo4j Knowledge Graph        │   │
│  │  (news, earnings, Fed minutes, SEC filings)          │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│  2. PERSONA GENERATION                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Generate N agents with unique profiles:              │   │
│  │  • Retail day trader (high risk, momentum-driven)     │   │
│  │  • Institutional PM (fundamental, long-term)          │   │
│  │  • Quant trader (systematic, data-driven)             │   │
│  │  • Hedge fund manager (macro, event-driven)           │   │
│  │  • Retail investor (passive, index-focused)           │   │
│  │  • Options trader (volatility-focused)                │   │
│  │  Each has: personality, risk tolerance, portfolio,     │   │
│  │  information sources, behavioral biases               │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│  3. SIMULATION                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Agents interact on simulated market forum:           │   │
│  │  • Post opinions, react to news                       │   │
│  │  • Influence each other's sentiment                   │   │
│  │  • Make simulated buy/sell decisions                   │   │
│  │  • Track sentiment evolution over rounds               │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│  4. ANALYSIS & REPORTING                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ReportAgent synthesizes:                             │   │
│  │  • Aggregate sentiment trajectory                     │   │
│  │  • Consensus price impact prediction                  │   │
│  │  • Divergence between agent archetypes                │   │
│  │  • Key opinion drivers                                │   │
│  │  • Confidence intervals                               │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### Persona Archetypes

```python
PERSONA_ARCHETYPES = {
    "retail_momentum": {
        "name": "Momentum Mike",
        "type": "retail",
        "risk_tolerance": "aggressive",
        "strategy": "momentum",
        "biases": ["recency_bias", "herd_mentality", "fomo"],
        "information_sources": ["reddit", "twitter", "cnbc"],
        "portfolio_size": "small",
        "time_horizon": "days_to_weeks",
        "weight": 0.30,  # 30% of simulated population
    },
    "institutional_fundamental": {
        "name": "Fund Manager Fiona",
        "type": "institutional",
        "risk_tolerance": "moderate",
        "strategy": "fundamental_value",
        "biases": ["anchoring", "confirmation_bias"],
        "information_sources": ["bloomberg", "sec_filings", "earnings_calls"],
        "portfolio_size": "large",
        "time_horizon": "months_to_years",
        "weight": 0.20,
    },
    "quant_systematic": {
        "name": "Quant Quinn",
        "type": "quant",
        "risk_tolerance": "calculated",
        "strategy": "systematic_multi_factor",
        "biases": ["overfitting_bias"],
        "information_sources": ["data_feeds", "academic_papers"],
        "portfolio_size": "large",
        "time_horizon": "variable",
        "weight": 0.15,
    },
    "hedge_macro": {
        "name": "Macro Marcus",
        "type": "hedge_fund",
        "risk_tolerance": "high",
        "strategy": "global_macro_event_driven",
        "biases": ["overconfidence"],
        "information_sources": ["fed_minutes", "geopolitical_intel", "options_flow"],
        "portfolio_size": "very_large",
        "time_horizon": "weeks_to_months",
        "weight": 0.10,
    },
    "retail_passive": {
        "name": "Index Irene",
        "type": "retail",
        "risk_tolerance": "conservative",
        "strategy": "buy_and_hold_index",
        "biases": ["status_quo_bias", "loss_aversion"],
        "information_sources": ["financial_advisor", "mainstream_news"],
        "portfolio_size": "medium",
        "time_horizon": "years",
        "weight": 0.20,
    },
    "options_volatility": {
        "name": "Vol Trader Vic",
        "type": "professional",
        "risk_tolerance": "high",
        "strategy": "volatility_arbitrage",
        "biases": ["complexity_bias"],
        "information_sources": ["options_chain", "vix", "skew"],
        "portfolio_size": "medium",
        "time_horizon": "days",
        "weight": 0.05,
    },
}
```

### Swarm Studio UI (`/swarm`)

```
┌──────────────────────────────────────────────────────────────┐
│  SWARM STUDIO — Market Sentiment Simulation    [New Scenario]│
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Scenario: "Fed announces 50bp rate cut — NVDA impact"       │
│  Agents: 500 │ Rounds: 10 │ Status: COMPLETED                │
│                                                               │
│  ┌────────────────────────────────────────┐ ┌──────────────┐ │
│  │  SENTIMENT EVOLUTION                   │ │ AGENT SPLIT  │ │
│  │                                        │ │              │ │
│  │  Bullish  ████████████████ 62%         │ │ [Pie chart]  │ │
│  │  Neutral  ██████ 23%                   │ │ Bullish: 62% │ │
│  │  Bearish  ████ 15%                     │ │ Neutral: 23% │ │
│  │                                        │ │ Bearish: 15% │ │
│  │  [Line chart: sentiment over rounds]   │ │              │ │
│  └────────────────────────────────────────┘ └──────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  ARCHETYPE BREAKDOWN                                     │ │
│  │  Retail Momentum:    ████████████████████ 85% Bullish    │ │
│  │  Institutional:      ██████████████ 58% Bullish          │ │
│  │  Quant:              ████████████ 52% Bullish            │ │
│  │  Hedge Macro:        ████████████████ 70% Bullish        │ │
│  │  Retail Passive:     ████████ 40% Neutral                │ │
│  │  Options/Vol:        ██████████████████ 75% Bullish      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │ PREDICTED IMPACT     │  │ CHAT WITH AGENTS             │ │
│  │                      │  │                              │ │
│  │ Price: +4.2% to +8.5%│  │ You: "Why are you bearish?" │ │
│  │ Volume: 2.3x normal  │  │                              │ │
│  │ VIX Impact: -12%     │  │ Agent #247 (Quant Quinn):   │ │
│  │ Confidence: 72%      │  │ "Rate cuts signal economic   │ │
│  │                      │  │  weakness. My models show    │ │
│  │ [Export Report]      │  │  NVDA's current P/E already  │ │
│  │                      │  │  prices in 2 cuts..."        │ │
│  └──────────────────────┘  └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Key Features
- **Scenario Builder** — Define the event, affected symbols, market conditions, and agent count
- **Persona Distribution Slider** — Adjust the mix of agent archetypes
- **Real-Time Simulation Viewer** — Watch agents post opinions, react, and shift sentiment live
- **Sentiment Evolution Chart** — Animated line chart of sentiment over simulation rounds
- **Archetype Breakdown** — How each investor type is reacting differently
- **Chat with Agents** — Click any simulated agent to interview them about their reasoning
- **Prediction Summary** — Aggregated price impact prediction with confidence intervals
- **Historical Accuracy Tracker** — Compare past simulation predictions vs. actual market outcomes

### Pre-Built Scenario Templates
| Scenario | Seed Data |
|----------|-----------|
| Earnings Beat/Miss | Historical earnings, guidance, analyst expectations |
| Fed Rate Decision | FOMC minutes, dot plot, economic indicators |
| M&A Announcement | Acquirer/target fundamentals, sector dynamics |
| Product Launch | Competitive landscape, market sizing, historical launches |
| Regulatory Action | Policy text, affected companies, sector impact |
| Geopolitical Event | News articles, supply chain mapping, commodity exposure |
| Black Swan Stress Test | Custom extreme scenario definition |

---

## Phase 9 — Agent Orchestrator & Swarm Control Plane

### Objective
Build the central nervous system that coordinates all agents — scheduling, dependency resolution, resource allocation, and observability.

### Conductor Agent (Master Orchestrator)

```python
class ConductorAgent:
    """
    The master orchestrator that routes user requests to the appropriate
    agents or agent compositions. Inspired by Bloomberg ASKB's multi-agent
    coordination architecture.
    """

    async def process_request(self, request: UserRequest) -> AgentResponse:
        plan = await self.plan(request)          # decompose into sub-tasks
        agents = await self.assign(plan)          # map sub-tasks to agents
        results = await self.execute(agents)      # run agents (parallel where possible)
        synthesis = await self.synthesize(results) # merge outputs
        return synthesis

    async def plan(self, request: UserRequest) -> ExecutionPlan:
        """Use LLM to decompose complex requests into agent-compatible sub-tasks"""
        ...

    async def assign(self, plan: ExecutionPlan) -> list[AgentAssignment]:
        """Map sub-tasks to available agents based on capability matching"""
        ...

    async def execute(self, assignments: list[AgentAssignment]) -> list[AgentResult]:
        """Execute agents with dependency-aware parallel scheduling"""
        ...

    async def synthesize(self, results: list[AgentResult]) -> AgentResponse:
        """Merge multiple agent outputs into a coherent response"""
        ...
```

### Agent Lifecycle Management
```
REGISTERED → IDLE → QUEUED → RUNNING → COMPLETED
                                  ↓
                               FAILED → RETRY (max 3) → DEAD_LETTER
```

### Observability Dashboard (within Settings or `/admin`)
- **Agent Registry** — All registered agents with status, last run, success rate
- **Run Timeline** — Gantt chart showing agent executions over time
- **Token Usage** — Per-agent and per-user token consumption tracking
- **Reasoning Inspector** — Click any run to see the full reasoning chain
- **Error Logs** — Failed runs with stack traces and retry history
- **Resource Monitor** — API rate limits, queue depth, cache hit rates

---

## Phase 10 — Terminal Command Interface & ASKB Workflows

### Objective
Build a Bloomberg-style command interface where power users can type natural language or structured commands to interact with all FinSight capabilities.

### Command Palette (`Cmd+K`)
A supercharged command palette that goes beyond navigation:

```
┌──────────────────────────────────────────────────────────────┐
│  FinSight Terminal                                     [ESC] │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ > analyze NVDA with full agent pipeline                │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  COMMANDS                                                     │
│  ○ analyze <symbol>           Run multi-agent analysis        │
│  ○ compare <sym1> vs <sym2>   Side-by-side comparison         │
│  ○ swarm <scenario>           Launch sentiment simulation     │
│  ○ research <directive>       Start Autoresearch program      │
│  ○ risk <portfolio>           Run risk assessment             │
│  ○ screen <criteria>          Run stock screener              │
│  ○ alert <symbol> <condition> Set up smart alert              │
│  ○ ask <question>             Ask AI about your portfolio     │
│                                                               │
│  RECENT                                                       │
│  ● analyze AAPL — 2 hours ago                                 │
│  ● swarm "Fed rate cut impact on tech" — yesterday            │
│  ● research "momentum strategy" — 3 days ago                  │
└──────────────────────────────────────────────────────────────┘
```

### ASKB-Style Workflows
Inspired by Bloomberg's ASKB Workflows feature — users can define and save multi-step analytical workflows:

```typescript
interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  schedule?: CronExpression   // optional recurring execution
  isShared: boolean           // shareable with team
}

interface WorkflowStep {
  agent: AgentType
  action: string
  parameters: Record<string, any>
  dependsOn?: string[]        // step IDs this depends on
  outputAs: string            // variable name for downstream steps
}
```

#### Example Workflows

**Pre-Earnings Analysis Workflow:**
1. FundamentalAgent: Pull latest financials and analyst estimates
2. NewsAgent: Aggregate last 30 days of news + sentiment
3. SwarmAgent: Simulate 200 agents reacting to earnings scenarios (beat/miss/inline)
4. TechnicalAgent: Identify key support/resistance levels
5. ReportAgent: Synthesize into structured pre-earnings brief

**Morning Market Brief Workflow (scheduled: 8:00 AM daily):**
1. MarketDataAgent: Pull overnight futures, Asia/Europe market close
2. NewsAgent: Top 10 stories with sentiment scoring
3. AlertAgent: Check all user alerts against pre-market data
4. RiskAgent: Portfolio risk update with overnight moves applied
5. ReportAgent: Generate personalized morning brief email/notification

---

## Phase 11 — Settings, Governance & Responsible AI

### Objective
Build comprehensive settings with special attention to AI governance — transparency, control, and responsible use.

### Settings Tabs

Carry forward all settings from the base prompts (Profile, Preferences, Notifications, Data & Privacy) plus:

#### AI & Agent Settings Tab
- **Agent Permissions** — Per-agent toggle: enable/disable, set rate limits
- **LLM Provider Selection** — Choose between Claude, GPT-4, or local models per agent
- **Token Budget** — Monthly token usage limit with alerts at 80% and 100%
- **Reasoning Transparency** — Toggle: always show agent reasoning chains vs. summary only
- **Autoresearch Limits** — Max experiments per program, compute budget, auto-stop conditions
- **Swarm Defaults** — Default agent count, simulation rounds, persona distribution

#### Responsible AI Tab
- **Disclaimer Acknowledgment** — "AI-generated analysis is not financial advice" — required on first use
- **Confidence Thresholds** — Set minimum confidence for recommendations to be shown
- **Source Attribution** — Toggle: always show sources vs. on-demand
- **Bias Monitoring** — View detected biases in AI outputs (sector bias, recency bias, etc.)
- **Audit Log** — Complete history of all AI-generated analyses and recommendations
- **Human Override Log** — Track when users disagreed with AI recommendations and actual outcomes

---

## Phase 12 — Polish, Performance & Deployment

### Performance
1. React.memo + useMemo for all chart components
2. Virtual scrolling (TanStack Virtual) for large tables
3. Route-based code splitting with dynamic imports
4. WebSocket connection pooling and message batching
5. Agent result streaming via SSE (don't wait for full completion)
6. Redis pipeline for batch cache operations
7. Neo4j query optimization with proper indexes
8. Request deduplication in market data service

### Error Handling
1. Global error boundary with Bloomberg-style error panel (not a sad face)
2. Agent-specific error handling with automatic retry and fallback
3. Circuit breaker pattern for external API calls
4. Graceful degradation: if one agent fails, show partial results from others
5. Custom 404/500 pages matching terminal aesthetic

### Accessibility
1. Full keyboard navigation for all panels and modals
2. ARIA labels for all charts, gauges, and interactive elements
3. High-contrast mode (already dark theme, but ensure WCAG AA for all text)
4. Screen reader announcements for live price changes and agent status updates
5. Reduced motion option for flash animations

### Testing
1. Unit tests for financial calculations, formatters, portfolio math
2. Agent integration tests with mocked LLM responses
3. Swarm simulation deterministic tests with seeded randomness
4. Autoresearch loop tests with mock backtest data
5. E2E test: sign in → add holding → run analysis → view report
6. Load testing for WebSocket connections and concurrent agent runs

### Deployment
1. Multi-stage Docker builds for web and agent services
2. `docker-compose.yml` with PostgreSQL, Redis, Neo4j, web, agents
3. Vercel deployment for Next.js frontend
4. Railway/Fly.io for Python agent backend
5. GitHub Actions CI/CD: lint → type-check → test → build → deploy
6. Health check endpoints: `/api/health`, `/api/agents/health`
7. Environment variable documentation for all services

---

## Bonus — Frontier Features

### Feature A — Portfolio Digital Twin (MiroShark Extension)
Create a "Digital Twin" of the user's portfolio where 500 simulated analysts debate its strengths and weaknesses. The portfolio becomes the scenario seed, and agents discuss whether to hold, rebalance, or exit positions.

### Feature B — Autonomous Portfolio Manager
Combine Autoresearch + SwarmAgent + RiskAgent into a fully autonomous portfolio manager that:
- Discovers strategies via Autoresearch
- Validates strategies via Swarm sentiment simulation
- Executes rebalancing (paper trading mode)
- Reports daily with full transparency

### Feature C — Natural Language Backtester
"Backtest a portfolio of the top 10 momentum stocks in the S&P 500, rebalanced monthly, from 2019 to 2024" — the Conductor Agent decomposes this into sub-tasks, and the ResearchAgent executes the backtest.

### Feature D — Multi-Agent Debate Mode
For any stock analysis, spawn two adversarial agents — a Bull Agent and a Bear Agent — and have them debate in real-time. The user watches the debate unfold and forms their own opinion. A Moderator Agent scores the debate.

### Feature E — Market Regime Detector
An agent that monitors macro indicators, cross-asset correlations, and volatility patterns to classify the current market regime (Risk-On, Risk-Off, Transition, Crisis) and adjusts all other agents' behavior accordingly.

### Feature F — Voice-Driven Terminal
"Hey FinSight, what's my portfolio doing today?" — voice input → Conductor Agent → multi-agent analysis → voice response with on-screen visualization.

### Feature G — Collaborative Swarm
Multiple users contribute persona definitions to a shared swarm simulation. Crowdsourced market intelligence where each user's domain expertise shapes agent behavior.

### Feature H — Agent Marketplace
Users can create, share, and publish custom agents. An agent that specializes in biotech FDA catalysts? Package it and share with the community.

---

## Research References

| Topic | Resource | Relevance |
|-------|----------|-----------|
| Karpathy's Autoresearch | [github.com/karpathy/autoresearch](https://github.com/karpathy/autoresearch) | Autonomous research loop pattern — `program.md` + constrained agent editing + evaluation loop |
| MiroFish | [github.com/666ghj/MiroFish](https://github.com/666ghj/MiroFish) | Multi-agent swarm intelligence for predictive simulation with 700K agents |
| MiroShark | [github.com/aaronjmars/MiroShark](https://github.com/aaronjmars/MiroShark) | Sanitized English-language MiroFish fork — universal swarm simulation engine |
| Bloomberg ASKB | [Bloomberg Agentic AI Terminal](https://www.marketsmedia.com/bloomberg-introduces-agentic-ai-to-the-terminal/) | Multi-agent AI system for financial data synthesis with transparent attribution |
| LangGraph | [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) | Agent orchestration framework for multi-agent workflows |
| CrewAI | [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) | Framework for orchestrating role-playing AI agents |
| Karpathy on Code Agents | [Vibe Coding & Self-Improvement Loop](https://www.nextbigfuture.com/2026/03/andrej-karpathy-on-code-agents-autoresearch-and-the-self-improvement-loopy-era-of-ai.html) | 2026 vision: humans direct, agents execute — 80% AI-written code |
| Neo4j GraphRAG | [Neo4j Knowledge Graphs](https://neo4j.com/developer/graph-rag/) | Graph-based retrieval augmented generation for structured knowledge |

---

## Getting Started

```bash
# Clone and setup
git clone <repo-url> finsight
cd finsight

# Start infrastructure
docker-compose up -d   # PostgreSQL, Redis, Neo4j

# Setup frontend
cd apps/web
cp .env.example .env.local   # Fill in API keys
npm install
npx prisma generate
npx prisma db push
npm run dev

# Setup agent backend
cd apps/agents
cp .env.example .env         # Fill in LLM API keys
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### Required API Keys
| Service | Purpose | Free Tier |
|---------|---------|-----------|
| Alpha Vantage / Financial Modeling Prep | Market data | Yes (limited) |
| Anthropic (Claude) | Primary LLM for agents | Pay per token |
| OpenAI | Embeddings + fallback LLM | Pay per token |
| Finnhub | WebSocket price streaming | Yes (limited) |
| Neo4j Aura | Knowledge graph (or run locally) | Free tier available |

---

> **FinSight** is not just a financial dashboard — it is an **autonomous financial intelligence system** where agents research, simulate, analyze, and act. The human sets the direction. The agents do the work.
