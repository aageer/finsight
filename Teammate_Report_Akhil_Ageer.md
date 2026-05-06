# Teammate Contribution Report

## CPS 5801 - Advanced AI | Final Report

## Project: FinSight - AI-Powered Financial Intelligence

**Submitted by:** Akhil Ageer
**Date:** May 6, 2026
**Teammate:** Ibrahim Khan Shovo

---

### Project Overview

FinSight is a Bloomberg Terminal-inspired financial intelligence platform that uses a multi-agent Large Language Model (LLM) architecture to democratize institutional-grade stock analysis. The system integrates Google Gemini 2.5 Pro/Flash models within an 8-agent pipeline featuring adversarial Bull/Bear debate, quantitative analysis, and risk management. The full-stack web application comprises 78 source files totaling approximately 11,800 lines of TypeScript/React code, an IEEE conference paper (434 lines of LaTeX), a Jupyter notebook (1,160 lines), and supporting documentation.

---

### My Contributions (Akhil Ageer) - 50%

---

#### 1. System Architecture and Agent Pipeline Design (Task 3 Part 2)

I designed and implemented the complete multi-agent orchestration system, including:

- **ConductorAgent** (`src/lib/agents/conductor.ts`, 22,165 bytes): I built the master orchestrator that coordinates the 4-phase, 8-agent pipeline, managing parallel analyst execution, sequential debate routing, trader decision flow, and risk gate enforcement. It implements structured JSON parsing, error recovery, and fallback logic for each agent.
- **Gemini API Client** (`src/lib/agents/gemini-client.ts`, 3,618 bytes): I wrote a custom concurrency-controlled Gemini API wrapper with semaphore-based rate limiting (max 3 concurrent calls), automatic retry logic, and structured JSON response parsing for both Gemini 2.5 Pro and Flash models.
- **8-Agent Prompt Engineering**: I authored all agent system prompts with distinct personas: FundamentalAnalyst (Damodaran/Buffett), TechnicalAnalyst (quant desk), SentimentAnalyst (NLP specialist), NewsAnalyst (Taleb), Bull Researcher (Cathie Wood), Bear Researcher (Michael Burry), Trader (Druckenmiller), and Risk Manager (Taleb antifragility). Each prompt enforces structured JSON output with confidence scores, signal values, and reasoning chains.

#### 2. ATLAS Extension - 18-Agent Hierarchy (Task 3 Part 2, Advanced)

I designed and implemented the ATLAS-inspired 4-layer agent hierarchy beyond the core assignment requirements:

- **Layer 1, Macro Regime** (`src/lib/agents/layers/layer-1-macro.ts`, 7,516 bytes): I built 6 agents (CentralBank, Geopolitical, Dollar, YieldCurve, Volatility, Sentiment) that collectively determine the market regime (RISK_ON / RISK_OFF / TRANSITIONAL).
- **Layer 2, Sector Rotation** (`src/lib/agents/layers/layer-2-sectors.ts`, 6,620 bytes): I implemented 5 sector desk agents (Tech/Semiconductor, Energy, Financials, Consumer, Healthcare) that receive macro context and recommend sector allocations.
- **Layer 3, Superinvestors** (`src/lib/agents/layers/layer-3-superinvestors.ts`, 9,739 bytes): I created 4 agents modeled after Druckenmiller, Buffett, Wood, and Burry that filter sector recommendations through distinct investment philosophies.
- **Layer 4, Decision** (`src/lib/agents/layers/layer-4-decision.ts`, 10,335 bytes): I built the CRO, Alpha Generator, and CIO agents that make final portfolio decisions.
- **ATLAS Conductor** (`src/lib/agents/atlas-conductor.ts`, 10,247 bytes): I built this orchestrator to manage all 18 agents across the 4 layers with proper data flow and context passing.
- **Darwinian Weight Evolution** (`src/lib/agents/darwinian-weights.ts`, 6,868 bytes): I implemented a self-improvement system where each agent maintains a weight (0.3 to 2.5). Top-quartile agents receive w x 1.05; bottom-quartile receive w x 0.95 after each pipeline execution.

#### 3. Full-Stack Web Application (UI/UX)

I built the complete Next.js 16 web application with Bloomberg Terminal aesthetic:

- **App Shell and Navigation**: I developed the app shell (`app-shell.tsx`), sidebar (`app-sidebar.tsx`, 3,914 bytes), header (`app-header.tsx`, 3,275 bytes) with collapsible navigation across 10 pages: Dashboard, Analysis, Portfolio, Watchlist, Agents Console, ATLAS/Swarm, Autoresearch, Trading, Terminal, Settings.
- **Bloomberg-Style Dashboard** (`src/app/(app)/dashboard/`): I implemented the market ticker strip (`market-ticker.tsx`, 3,218 bytes), portfolio summary panel, agent status panel, market movers table, watchlist quick view, news feed, and alerts bar.
- **Analysis Page** (`src/app/(app)/analysis/`): I built the stock search interface, multi-agent analysis trigger, result visualization with agent reasoning tabs, confidence gauges, and price target ranges.
- **Quants for Everyone UI** (`src/components/analysis/quants-explained.tsx`, 18,390 bytes): I created an interactive dashboard that displays all 7 quantitative indicators with AI-generated plain-English explanations, visual signal meters (bullish/bearish/neutral), and an overall composite quant score gauge.
- **Price Charts** (`src/components/charts/price-chart.tsx`, 5,560 bytes): I implemented a Recharts-based financial chart with OHLCV data, sparklines, and trend overlays.
- **Command Palette** (`command-palette.tsx`, 3,284 bytes): I built a Bloomberg-style Cmd+K command interface for symbol search and page navigation.
- **20 shadcn/ui Components**: I customized Badge, Button, Card, Command, Dialog, Dropdown, Input, Label, Select, Separator, Sheet, Sidebar, Skeleton, Sonner, Switch, Table, Tabs, Textarea, and Tooltip with Bloomberg-dark theme tokens.
- **Zustand State Management**: I built three stores: `agent-store.ts` (4,612 bytes) for agent pipeline state, `app-store.ts` (1,543 bytes) for global UI state, `trading-store.ts` (3,521 bytes) for trading positions.
- **Type System** (`src/types/`): I wrote comprehensive TypeScript type definitions: `agent-types.ts` (8,769 bytes) covering all agent interfaces, pipeline types, and API response shapes; `index.ts` (4,439 bytes) for shared market data types.

#### 4. API Layer

I built the entire backend API layer:

- **Market Data API Routes** (`src/app/api/market/`): 6 API endpoints (`/quote`, `/history`, `/profile`, `/news`, `/search`, `/indicators`) proxying Alpha Vantage with server-side caching and rate limit protection.
- **Analysis API** (`src/app/api/analysis/route.ts`, 1,861 bytes): Endpoint that triggers the multi-agent pipeline and returns structured JSON results.
- **ATLAS Pipeline API** (`src/app/api/atlas/pipeline/`): Endpoint for triggering the 18-agent ATLAS pipeline.
- **Trading API** (`src/app/api/trading/`): Routes for paper trading via Alpaca Markets integration.

#### 5. Auto-Trading Integration

I implemented the autonomous paper trading system:

- **Alpaca Client** (`src/lib/trading/alpaca-client.ts`, 6,558 bytes): Paper trading integration with the Alpaca Markets API for autonomous order execution.
- **Risk Limits Engine** (`src/lib/trading/risk-limits.ts`, 5,717 bytes): Configurable guardrails: max 10% single position, 15% portfolio drawdown auto-halt, 20% minimum cash reserve, and one-click kill switch.
- **Trade Executor** (`src/lib/trading/trade-executor.ts`, 6,266 bytes): Translates agent recommendations into executable paper trades with proper sizing and risk enforcement.

#### 6. Baseline LLM Agent (Task 2)

- I developed the baseline single-LLM agent using chain-of-thought prompting with Gemini 2.5 Pro.
- I designed the 5-step CoT prompt structure: (1) assess fundamentals, (2) evaluate technicals, (3) consider sentiment, (4) weigh risks, (5) formulate recommendation.
- I implemented structured JSON output with 5-class recommendation, confidence score, reasoning, bull/bear cases, and price targets.

#### 7. IEEE Conference Paper

I co-authored the IEEE conference paper (`IEEE_Paper/main.tex`, 434 lines). Specifically, I was the primary author of:

- Abstract
- Introduction (Section 1)
- System Architecture (Section 3)
- Baseline Agent (Section 4)
- Improved Systems: Tool-Based Multi-Agent and ATLAS Extension (Sections 5.2 and 5.3)
- Conclusion (Section 7)
- All architecture diagrams (Figure 1) and technology stack tables (Tables I, III)

#### 8. Jupyter Notebook and Documentation

- I led the organization and structure of the Jupyter notebook (`FinSight_Midterm_Report.ipynb`, 1,160 lines).
- I wrote the Problem Definition recap, System Architecture diagrams, and multi-agent pipeline demonstration code.
- I authored the `ProjectGuide.md` (71,957 bytes), a comprehensive 12-phase development guide covering the full system vision.
- I created `Final_Project_report.md` (25,153 bytes), the detailed markdown version of the final project report.

#### 9. Final Presentation

- I co-created the final presentation slides (`CPS 5801 Final Presentation.pdf`).
- I recorded the first half of the 8-minute demo video covering system architecture, the multi-agent pipeline walkthrough, and the live application demo.

---

### Summary of My Deliverables

| Deliverable                                                               | Status   |
| ------------------------------------------------------------------------- | -------- |
| Next.js Web Application (78 files, ~11,800 LOC)                           | Complete |
| 8-Agent Pipeline + ConductorAgent (22,165 bytes)                          | Complete |
| ATLAS 18-Agent Extension + Darwinian Weights (4 layer files + conductor)  | Complete |
| Auto-Trading Integration (Alpaca + Risk Limits + Executor)                | Complete |
| Baseline LLM Agent with CoT Prompting (Task 2)                            | Complete |
| API Layer (6 market endpoints + analysis + ATLAS + trading)               | Complete |
| 20 shadcn/ui Components + 3 Zustand Stores + Type System                  | Complete |
| IEEE Paper Sections (Abstract, Intro, Architecture, Baseline, Conclusion) | Complete |
| Jupyter Notebook Structure + Multi-Agent Demo Code                        | Complete |
| ProjectGuide.md + Final_Project_report.md                                 | Complete |
| Final Presentation (slides + video first half)                            | Complete |

**Contribution breakdown: Akhil Ageer - 50%, Ibrahim Khan Shovo - 50%.**
