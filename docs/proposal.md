# FinSight: Financial Insights via AI Agent
## CPS 5801 Advanced AI — Project Proposal

**Team:** [Student A Name] · [Student B Name]  
**Course:** CPS 5801 Advanced AI — Kean University  
**Submission Date:** March 31, 2026  
**Instructor:** Prof. Kuan Huang

---

## 1. Application Problem

### 1.1 Problem Statement

Financial analysis is one of the most information-dense, time-sensitive, and cognitively demanding professional tasks. A typical equity analyst must simultaneously synthesize earnings reports, macroeconomic indicators, technical price charts, competitor benchmarks, SEC filings, and breaking news — often under market-hours pressure. Tools like the Bloomberg Terminal provide raw data access, but offer no autonomous reasoning: the human must still perform all the cognitive work.

**FinSight** addresses this gap by building a Bloomberg Terminal-style AI agentic platform that autonomously reasons across multiple data sources, generates structured financial analysis, and delivers institutional-grade insights in natural language. The system is designed to answer complex, multi-step financial questions that no single model call can resolve.

### 1.2 Application Scenario and Target Users

| Dimension | Details |
|-----------|---------|
| **Domain** | Quantitative & qualitative equity analysis |
| **Target Users** | Finance students, retail investors, CFA candidates, junior analysts |
| **Core Task** | Multi-step financial QA and investment analysis |
| **Task Type** | Question Answering (QA) + Tool-augmented Reasoning |
| **Interface** | Web terminal (Next.js dashboard) + Jupyter evaluation notebook |

### 1.3 Input and Output Format

**Input:**
- Natural language query from user (text string)
- Optional parameters: ticker symbol(s), time range, analysis type

**Output:**
- Structured JSON analysis containing: `sentiment`, `sentiment_score`, `recommendation`, `price_targets`, `key_factors`, `risks`, `catalysts`, `sources`
- Natural language summary with reasoning chain
- Source attribution for every factual claim (transparent provenance)

### 1.4 Representative Queries (Increasing Complexity)

| # | Query | Type | Agents Required |
|---|-------|------|-----------------|
| 1 | "What is NVDA's P/E ratio?" | Single-step retrieval | FundamentalAgent |
| 2 | "Compare MSFT vs GOOGL on margins and valuation" | Multi-step comparison | FundamentalAgent, PeerCompAgent |
| 3 | "Should I buy AAPL given macro conditions and news?" | Multi-step reasoning + synthesis | FundamentalAgent, TechnicalAgent, NewsAgent, ReportAgent |
| 4 | "Why did TSLA drop 8% today?" | Causal reasoning across tools | NewsAgent, TechnicalAgent, FundamentalAgent, ReportAgent |
| 5 | "Sharpe ratio of 60/40 NVDA/AAPL portfolio, 1 year" | Computational + retrieval | RiskAgent, FundamentalAgent |

### 1.5 Expected Capabilities and Limitations

**Capabilities:**
- Retrieve live and historical market data via free APIs
- Fundamental analysis (P/E, EPS, revenue, DCF) via specialized agent + API tools
- Technical analysis (RSI, MACD, SMA/EMA) via computation tools
- News sentiment classification via NLP models
- Portfolio risk metrics (VaR, Sharpe, beta, drawdown) via mathematical computation
- Multi-step reasoning via LLM-orchestrated agent pipeline
- Transparent reasoning chains with source attribution

**Limitations:**
- Educational project — not licensed financial advice
- Real-time data accuracy depends on free-tier API rate limits
- Fine-tuning constrained to models runnable on a single free-tier GPU (Colab T4)
- LLM may hallucinate financial figures if retrieval fails; guardrails mitigate but do not eliminate this risk

---

## 2. Proposed Agent System

### 2.1 System Overview

FinSight uses a **Conductor-Agent architecture** — a master orchestrator LLM that decomposes incoming queries into sub-tasks and delegates them to specialized agents. Each agent encapsulates one domain of financial expertise, with its own LLM prompts and external tools. Agents run in parallel where their sub-tasks are independent. A ReportAgent synthesizes all agent outputs into a final structured response.

This design is inspired by:
- **Bloomberg ASKB (2026):** Multi-agent AI for the Bloomberg Terminal using domain-specialized retrieval agents coordinated by an orchestrator
- **ReAct (Yao et al., 2022):** Interleaved reasoning and action framework for LLM tool use

### 2.2 Agent Roster — Roles, LLM Components, and Tools

| Agent | LLM/VLM Component | External Tools | Reasoning Pattern |
|-------|--------------------|----------------|-------------------|
| **ConductorAgent** | Llama 3.3 70B (Groq) | None (pure reasoning) | Intent classification → query decomposition → execution plan → agent dispatch |
| **FundamentalAgent** | Llama 3.1 8B (Groq) | Alpha Vantage API, Financial Modeling Prep API, yfinance | Retrieve metrics → compare to sector → assess valuation |
| **TechnicalAgent** | Llama 3.1 8B (Groq) | yfinance (OHLCV data), pandas_ta (RSI, MACD, SMA/EMA, Bollinger) | Compute indicators → identify signals → classify trend |
| **NewsAgent** | FinBERT (HuggingFace) | RSS feeds, FAISS vector store, sentence-transformers embeddings | Retrieve headlines → embed & search → classify sentiment → summarize |
| **PeerCompAgent** | Llama 3.1 8B (Groq) | Market data APIs | Identify sector peers → retrieve comparative metrics → rank |
| **RiskAgent** | Llama 3.1 8B (Groq) | yfinance (price history), NumPy/SciPy (VaR, Sharpe, beta, max drawdown) | Retrieve prices → compute risk metrics → assess portfolio health |
| **ReportAgent** | Llama 3.3 70B (Groq) | None (LLM synthesis only) | Receive all agent outputs → resolve conflicts → generate structured report with sources |

### 2.3 Agent Communication Protocol

Agents do **not** communicate directly with each other. All communication flows through the ConductorAgent via a structured message-passing protocol:

```
ConductorAgent
    │
    ├──▶ sends: { agent: "FundamentalAgent", task: "Get NVDA P/E, EPS, revenue growth", symbol: "NVDA" }
    │     returns: { pe: 65.1, eps: 2.19, revenue_growth: "122% YoY", source: "Alpha Vantage" }
    │
    ├──▶ sends: { agent: "TechnicalAgent", task: "RSI, MACD, trend for NVDA 3M", symbol: "NVDA" }
    │     returns: { rsi: 72.3, macd_signal: "bullish_crossover", trend: "uptrend", source: "yfinance" }
    │
    ├──▶ sends: { agent: "NewsAgent", task: "Recent NVDA news sentiment", symbol: "NVDA" }
    │     returns: { headlines: [...], overall_sentiment: "bullish", score: 0.82, source: "RSS+FinBERT" }
    │
    └──▶ sends all results to ReportAgent for synthesis
```

### 2.4 Three Approaches Mapped to Assignment Tasks

| Assignment Task | FinSight Implementation | Architecture |
|-----------------|------------------------|--------------|
| **Task 2: Baseline LLM** | Single Llama 3.3 70B call with zero-shot / few-shot / CoT prompting. No tools, no agents. The LLM answers purely from its parametric knowledge. | LLM only |
| **Task 3 Part 1: Fine-tuning** | QLoRA fine-tune Mistral-7B-Instruct on a financial QA dataset (FiQA + FinanceBench + custom CoT pairs). Single model, no tools. | Fine-tuned LLM only |
| **Task 3 Part 2: Tool-based Agent** | Full ConductorAgent orchestrating 6 sub-agents, each with live API tools, RAG retrieval, and computation modules. Multi-step reasoning. | Multi-agent + tools |

---

## 3. System Architecture Flowcharts

### 3.1 Master Architecture — Complete Agentic Pipeline

This diagram shows every component of the full tool-based agent system (Task 3 Part 2), with LLM components and tool modules clearly separated:

```
                         ┌────────────────────────────┐
                         │    USER QUERY (text)        │
                         │  "Should I buy NVDA?"       │
                         └─────────────┬──────────────┘
                                       │
                    ╔══════════════════════════════════════════╗
                    ║         CONDUCTOR AGENT                  ║
                    ║  ┌─────────────────────────────────┐    ║
                    ║  │  LLM: Llama 3.3 70B (Groq)     │    ║
                    ║  │                                  │    ║
                    ║  │  Step 1: Parse intent            │    ║
                    ║  │    → symbol=NVDA, type=buy/sell  │    ║
                    ║  │  Step 2: Select agents           │    ║
                    ║  │    → Fundamental, Technical,     │    ║
                    ║  │      News, Risk                  │    ║
                    ║  │  Step 3: Build execution plan    │    ║
                    ║  │    → parallel: [F,T,N] then R    │    ║
                    ║  └─────────────────────────────────┘    ║
                    ╚══════════╤═══╤═══╤═══╤══════════════════╝
                               │   │   │   │
          ┌────────────────────┘   │   │   └───────────────────┐
          │                        │   │                        │
          ▼                        ▼   ▼                        ▼
╔═══════════════════╗  ╔══════════════════╗  ╔═══════════════╗  ╔══════════════════╗
║ FUNDAMENTAL AGENT ║  ║ TECHNICAL AGENT  ║  ║  NEWS AGENT   ║  ║   RISK AGENT     ║
║                   ║  ║                  ║  ║               ║  ║                  ║
║ ┌───────────────┐ ║  ║ ┌──────────────┐║  ║ ┌───────────┐║  ║ ┌──────────────┐ ║
║ │LLM:Llama 3.1  │ ║  ║ │LLM:Llama 3.1│║  ║ │FinBERT    │║  ║ │LLM:Llama 3.1 │ ║
║ │8B (Groq)      │ ║  ║ │8B (Groq)     │║  ║ │(HuggingFace)  ║ │8B (Groq)     │ ║
║ └───────┬───────┘ ║  ║ └──────┬───────┘║  ║ └─────┬─────┘║  ║ └──────┬───────┘ ║
║         │         ║  ║        │        ║  ║       │      ║  ║        │         ║
║    ┌────▼────┐    ║  ║   ┌────▼────┐   ║  ║  ┌────▼───┐  ║  ║   ┌────▼────┐    ║
║    │ TOOLS:  │    ║  ║   │ TOOLS:  │   ║  ║  │ TOOLS: │  ║  ║   │ TOOLS:  │    ║
║    │•Alpha   │    ║  ║   │•yfinance│   ║  ║  │•RSS    │  ║  ║   │•yfinance│    ║
║    │ Vantage │    ║  ║   │ (OHLCV) │   ║  ║  │ feeds  │  ║  ║   │ (prices)│    ║
║    │•FMP API │    ║  ║   │•pandas  │   ║  ║  │•FAISS  │  ║  ║   │•NumPy/  │    ║
║    │•yfinance│    ║  ║   │ _ta     │   ║  ║  │ vector │  ║  ║   │ SciPy   │    ║
║    │         │    ║  ║   │(RSI,    │   ║  ║  │ store  │  ║  ║   │(VaR,    │    ║
║    │         │    ║  ║   │ MACD,   │   ║  ║  │•sent.- │  ║  ║   │ Sharpe, │    ║
║    │         │    ║  ║   │ SMA,    │   ║  ║  │ transf.│  ║  ║   │ beta,   │    ║
║    │         │    ║  ║   │ EMA,    │   ║  ║  │ embed. │  ║  ║   │ max DD) │    ║
║    │         │    ║  ║   │ BB)     │   ║  ║  │        │  ║  ║   │         │    ║
║    └────┬────┘    ║  ║   └────┬────┘   ║  ║  └────┬───┘  ║  ║   └────┬────┘    ║
║         │         ║  ║        │        ║  ║       │      ║  ║        │         ║
║    ┌────▼────┐    ║  ║   ┌────▼────┐   ║  ║  ┌────▼───┐  ║  ║   ┌────▼────┐    ║
║    │REASONING│    ║  ║   │REASONING│   ║  ║  │REASON. │  ║  ║   │REASONING│    ║
║    │1.Get P/E│    ║  ║   │1.Get    │   ║  ║  │1.Fetch │  ║  ║   │1.Get 1Y │    ║
║    │2.Get EPS│    ║  ║   │  OHLCV  │   ║  ║  │  news  │  ║  ║   │  prices │    ║
║    │3.Get rev│    ║  ║   │2.Calc   │   ║  ║  │2.Embed │  ║  ║   │2.Calc   │    ║
║    │  growth │    ║  ║   │  RSI    │   ║  ║  │  & RAG │  ║  ║   │  returns│    ║
║    │4.Compare│    ║  ║   │3.Calc   │   ║  ║  │3.Class.│  ║  ║   │3.Calc   │    ║
║    │  sector │    ║  ║   │  MACD   │   ║  ║  │  sent. │  ║  ║   │  VaR    │    ║
║    │5.Assess │    ║  ║   │4.ID sup/│   ║  ║  │4.Score │  ║  ║   │4.Calc   │    ║
║    │  value  │    ║  ║   │  resist │   ║  ║  │  aggr. │  ║  ║   │  Sharpe │    ║
║    └────┬────┘    ║  ║   │5.Trend  │   ║  ║  └────┬───┘  ║  ║   │5.Assess │    ║
║         │         ║  ║   └────┬────┘   ║  ║       │      ║  ║   └────┬────┘    ║
║         ▼         ║  ║        ▼        ║  ║       ▼      ║  ║        ▼         ║
║   { pe: 65.1,    ║  ║  { rsi: 72.3,  ║  ║ { sentiment: ║  ║  { sharpe: 1.4, ║
║     eps: 2.19,   ║  ║    macd: "bull",║  ║   "bullish", ║  ║    var_95: -4.2%,║
║     rev: "+122%",║  ║    trend: "up", ║  ║   score:0.82,║  ║    beta: 1.8,   ║
║     assessment:  ║  ║    support:     ║  ║   headlines: ║  ║    max_dd:      ║
║     "expensive"} ║  ║    [130, 125] } ║  ║   [...] }    ║  ║    "-18%" }     ║
╚════════╤══════════╝  ╚═══════╤════════╝  ╚══════╤═══════╝  ╚═══════╤═════════╝
         │                     │                   │                   │
         └──────────┬──────────┴──────┬────────────┘                   │
                    │                 │                                 │
                    ▼                 ▼                                 │
              ╔═══════════════════════════════════════╗                 │
              ║         REPORT AGENT                  ║◀────────────────┘
              ║  ┌─────────────────────────────────┐  ║
              ║  │  LLM: Llama 3.3 70B (Groq)     │  ║
              ║  │                                  │  ║
              ║  │  Step 1: Receive all agent JSON  │  ║
              ║  │  Step 2: Resolve conflicts       │  ║
              ║  │    (e.g., bullish news vs high   │  ║
              ║  │     valuation)                   │  ║
              ║  │  Step 3: Weight evidence          │  ║
              ║  │  Step 4: Generate recommendation │  ║
              ║  │  Step 5: Attach source citations  │  ║
              ║  └─────────────────────────────────┘  ║
              ╚═══════════════════╤════════════════════╝
                                  │
                                  ▼
              ┌──────────────────────────────────────────┐
              │     STRUCTURED ANALYSIS OUTPUT            │
              │                                          │
              │  sentiment: "bullish"                    │
              │  sentiment_score: 74                     │
              │  recommendation: "buy"                   │
              │  confidence: 68                          │
              │  price_targets: {bear:120, base:155,     │
              │                  bull:180}               │
              │  key_factors: [                          │
              │    {factor:"AI chip demand", impact:"+"},│
              │    {factor:"High P/E (65x)", impact:"-"}│
              │  ]                                       │
              │  risks: ["Valuation stretched",          │
              │          "China export controls"]        │
              │  catalysts: ["Data center expansion",    │
              │              "New GPU architecture"]     │
              │  sources: ["Alpha Vantage", "FinBERT",   │
              │            "yfinance", "RSS/Reuters"]    │
              └──────────────────────────────────────────┘
```

### 3.2 Three-Approach Comparison Architectures

These diagrams show how the system simplifies for each of the three required approaches:

**Approach 1 — Baseline LLM (Task 2): No tools, no agents**

```
User Query ──▶ [ Llama 3.3 70B ] ──▶ Answer
                    │
                    └── Prompt strategies:
                        • Zero-shot
                        • Few-shot (5 examples)
                        • Chain-of-Thought
                    
                    No external data.
                    Relies entirely on parametric knowledge.
```

**Approach 2 — Fine-tuned LLM (Task 3 Part 1): Improved model, no tools**

```
                  ┌──────────────────────────┐
                  │  Training Phase (offline) │
                  │                          │
                  │  FiQA + FinanceBench     │
                  │  + Custom CoT pairs      │
                  │         │                │
                  │         ▼                │
                  │  QLoRA fine-tune         │
                  │  Mistral-7B-Instruct     │
                  │  (4-bit, Colab T4)       │
                  └────────────┬─────────────┘
                               │
                               ▼
User Query ──▶ [ Fine-tuned Mistral-7B ] ──▶ Answer
                    
                    No external data.
                    Better financial domain knowledge
                    from fine-tuning.
```

**Approach 3 — Tool-based Multi-Agent (Task 3 Part 2): Full system**

```
User Query ──▶ ConductorAgent (LLM: Llama 3.3 70B)
                    │
            ┌───────┼───────┬───────────┐
            ▼       ▼       ▼           ▼
        Fundamental Technical News     Risk
         Agent      Agent   Agent     Agent
        (LLM+API)  (LLM+  (FinBERT  (LLM+
                   pandas  +FAISS    NumPy/
                    _ta)    +RSS)    SciPy)
            │       │       │           │
            └───────┼───────┴───────────┘
                    ▼
              ReportAgent (LLM: Llama 3.3 70B)
                    │
                    ▼
           Structured Analysis
           with source attribution
```

### 3.3 Detailed Reasoning Workflow — ConductorAgent

This flowchart shows the internal reasoning loop of the ConductorAgent:

```
┌─────────────────────────────────────────────────────┐
│              ConductorAgent Reasoning Loop           │
│                                                      │
│  INPUT: User query (string)                          │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ STEP 1: INTENT CLASSIFICATION (LLM call)    │    │
│  │                                              │    │
│  │ Prompt: "Classify this financial query:      │    │
│  │   - single_lookup (one metric, one symbol)   │    │
│  │   - comparison (multiple symbols)            │    │
│  │   - analysis (buy/sell/hold assessment)      │    │
│  │   - computation (portfolio math)             │    │
│  │   - explanation (why did X happen?)          │    │
│  │                                              │    │
│  │ Also extract: symbols[], time_range, etc."   │    │
│  └──────────────────┬──────────────────────────┘    │
│                     │                                │
│                     ▼                                │
│  ┌─────────────────────────────────────────────┐    │
│  │ STEP 2: AGENT SELECTION (rule-based)         │    │
│  │                                              │    │
│  │ if intent == "single_lookup":                │    │
│  │     agents = [FundamentalAgent]              │    │
│  │ elif intent == "analysis":                   │    │
│  │     agents = [Fundamental, Technical,        │    │
│  │               News, Risk]                    │    │
│  │ elif intent == "computation":                │    │
│  │     agents = [RiskAgent, FundamentalAgent]   │    │
│  │ elif intent == "comparison":                 │    │
│  │     agents = [Fundamental, PeerComp]         │    │
│  │ elif intent == "explanation":                │    │
│  │     agents = [News, Technical, Fundamental]  │    │
│  └──────────────────┬──────────────────────────┘    │
│                     │                                │
│                     ▼                                │
│  ┌─────────────────────────────────────────────┐    │
│  │ STEP 3: PARALLEL DISPATCH                    │    │
│  │                                              │    │
│  │ Send task to each selected agent             │    │
│  │ Agents run concurrently (async)              │    │
│  │ Each agent returns structured JSON result    │    │
│  │ Timeout: 30 seconds per agent                │    │
│  └──────────────────┬──────────────────────────┘    │
│                     │                                │
│                     ▼                                │
│  ┌─────────────────────────────────────────────┐    │
│  │ STEP 4: RESULT COLLECTION & VALIDATION      │    │
│  │                                              │    │
│  │ Collect all agent results                    │    │
│  │ Check for failures → retry once or skip      │    │
│  │ Validate JSON schema of each result          │    │
│  └──────────────────┬──────────────────────────┘    │
│                     │                                │
│                     ▼                                │
│  ┌─────────────────────────────────────────────┐    │
│  │ STEP 5: SYNTHESIS (ReportAgent LLM call)    │    │
│  │                                              │    │
│  │ Send all agent results to ReportAgent        │    │
│  │ ReportAgent resolves conflicts, weighs       │    │
│  │ evidence, generates final recommendation     │    │
│  │ with source citations                        │    │
│  └──────────────────┬──────────────────────────┘    │
│                     │                                │
│                     ▼                                │
│  OUTPUT: FinSightAnalysis JSON + natural language    │
└─────────────────────────────────────────────────────┘
```

### 3.4 Individual Agent Reasoning — Example: FundamentalAgent

```
INPUT: { symbol: "NVDA", task: "fundamental analysis" }
    │
    ▼
┌───────────────────────────────────────┐
│ TOOL CALL 1: Alpha Vantage API       │
│ → GET /query?function=OVERVIEW&symbol │
│ → Returns: P/E, EPS, MarketCap, etc. │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ TOOL CALL 2: FMP API                 │
│ → GET /income-statement/NVDA         │
│ → Returns: revenue, net income,      │
│   margins (4 quarters)               │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ TOOL CALL 3: yfinance                │
│ → Sector average P/E for comparison  │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│ LLM REASONING (Llama 3.1 8B)        │
│                                       │
│ Prompt: "Given these financial data   │
│ for NVDA:                             │
│   P/E: 65.1 (sector avg: 32.4)       │
│   EPS: $2.19                          │
│   Revenue growth: +122% YoY          │
│   Net margin: 55.6%                   │
│                                       │
│ Step-by-step, assess the fundamental  │
│ outlook. Is the valuation justified   │
│ by growth? What are the risks?"       │
│                                       │
│ → Chain-of-thought reasoning          │
└───────────────┬───────────────────────┘
                │
                ▼
OUTPUT: {
  pe: 65.1, eps: 2.19,
  revenue_growth: "+122%",
  margin: "55.6%",
  sector_pe_avg: 32.4,
  assessment: "Premium valuation justified
    by exceptional growth, but risk of
    multiple compression if growth slows",
  source: "Alpha Vantage, FMP, yfinance"
}
```

---

## 4. Tools and Models

### 4.1 Language Models (All Free)

| Model | Provider | Cost | Role in System |
|-------|----------|------|----------------|
| Llama 3.3 70B Versatile | Groq | Free tier | ConductorAgent reasoning, ReportAgent synthesis |
| Llama 3.1 8B Instruct | Groq | Free tier | Individual agent reasoning (Fundamental, Technical, Peer, Risk) |
| Mistral-7B-Instruct | HuggingFace | Free (open weights) | Fine-tuning target (Task 3 Part 1), QLoRA on Colab T4 |
| FinBERT | HuggingFace | Free (open weights) | NewsAgent — financial sentiment classification |
| all-MiniLM-L6-v2 | sentence-transformers | Free (open weights) | News embedding for RAG retrieval |

### 4.2 External Data Tools (All Free)

| Tool | Source | Purpose |
|------|--------|---------|
| `yfinance` (Python) | Yahoo Finance | Historical OHLCV, company info, sector data |
| Alpha Vantage API | alphavantage.co | Real-time quotes, company overview, earnings |
| Financial Modeling Prep | financialmodelingprep.com | Income statement, balance sheet, ratios |
| `pandas_ta` (Python) | Open source | Technical indicators: RSI, MACD, SMA, EMA, Bollinger Bands |
| FAISS | Meta (open source) | Local vector store for RAG news retrieval |
| RSS feeds | Reuters, CNBC, etc. | News headline ingestion |

### 4.3 Agent Framework and Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Agent orchestration | LangChain / custom Python | Tool dispatch, prompt templates, output parsing |
| RAG retrieval | FAISS + sentence-transformers | Semantic search over news embeddings |
| Fine-tuning | `peft` (LoRA) + `transformers` + `bitsandbytes` | QLoRA 4-bit fine-tuning on Colab T4 |
| Web frontend | Next.js 14, TypeScript, Tailwind, shadcn/ui | Bloomberg-style terminal dashboard |
| Backend DB | Supabase (PostgreSQL, free tier) | User data, saved analyses |
| Deployment | Vercel (free tier) | Web hosting |
| Evaluation | Jupyter notebook (.ipynb) | All experiments, metrics, ablation |

### 4.4 Fine-Tuning Dataset (Task 3 Part 1)

| Dataset | Size | Source | Content |
|---------|------|--------|---------|
| FiQA | ~6,600 QA pairs | Public benchmark (Maia et al., 2018) | Financial opinion QA |
| FinanceBench | ~150 questions | Public benchmark (Islam et al., 2023) | Earnings-based financial QA |
| Custom CoT pairs | 200+ pairs | Hand-crafted from 10-K filings | Step-by-step financial reasoning |
| **Total** | **~7,000 pairs** | | |

Fine-tuning config: QLoRA (4-bit quantization), rank=16, alpha=32, learning rate 2e-4, 3 epochs, on Google Colab T4 (free).

---

## 5. Evaluation Plan

### 5.1 Evaluation Metrics

| Metric | Definition | Applies To |
|--------|-----------|-----------|
| **Answer Accuracy** | % of factual answers matching ground truth (±5% tolerance for numeric values) | All three approaches |
| **Task Success Rate** | % of queries where the system produces a complete, correctly structured response | All three approaches |
| **F1 Score** | Token-level F1 between generated and reference answers | All three approaches |
| **Sentiment F1** | Classification F1 for news sentiment (bullish/neutral/bearish) | NewsAgent |
| **Reasoning Quality** | Human-rated 1–5 score on CoT coherence and correctness (sampled) | All three approaches |

### 5.2 Evaluation Datasets

| Dataset | Size | Task | Source |
|---------|------|------|--------|
| FiQA test split | 648 QA pairs | Financial QA | Public benchmark |
| FinanceBench | 150 questions | Earnings-based QA | Public benchmark |
| Custom FinSight eval set | 50 queries | End-to-end agent testing | Team-crafted |
| Financial PhraseBank | 4,840 sentences | Sentiment classification | Public (Malo et al.) |
| **Total** | **~5,700 instances** | | |

### 5.3 Quantitative Comparison Table (Task 4)

| Method | Answer Accuracy | F1 Score | Task Success Rate | Notes |
|--------|-----------------|----------|-------------------|-------|
| Baseline LLM (Task 2) | TBD | TBD | TBD | Zero-shot / few-shot / CoT, no tools |
| Fine-tuned LLM (Task 3.1) | TBD | TBD | TBD | QLoRA Mistral-7B, no tools |
| Tool-based Agent (Task 3.2) | TBD | TBD | TBD | Full multi-agent pipeline with tools |

### 5.4 Ablation Study Design

| Experiment | Component Removed | Hypothesis |
|-----------|-------------------|------------|
| A1: No RAG | Remove FAISS retrieval from NewsAgent | Recent-event accuracy drops significantly |
| A2: No CoT | Remove chain-of-thought prompting from all agents | Multi-step reasoning degrades |
| A3: No fine-tuning | Replace QLoRA model with base Mistral-7B | Financial terminology accuracy drops |
| A4: Single agent | Replace multi-agent with one LLM call | Complex queries fail more often |
| A5: No tools | Remove all API/computation tools | Factual accuracy on live data collapses |

---

## 6. Implementation Timeline

| Phase | Dates | Deliverable | Assignment Task |
|-------|-------|-------------|-----------------|
| Phase 0: Scaffold | Done | Next.js platform + project architecture | — |
| Phase 1: Baseline | Mar 31 – Apr 10 | Notebook v1: zero-shot, few-shot, CoT baselines | Task 2 |
| Phase 2: Fine-tune | Apr 10 – Apr 17 | Notebook v2: QLoRA training + eval + midterm report | Task 3 Part 1 |
| Phase 3: Tool Agent | Apr 17 – Apr 25 | Full multi-agent system with live tools | Task 3 Part 2 |
| Phase 4: Evaluation | Apr 25 – Apr 30 | Three-way comparison + ablation + presentation | Task 4 |
| Phase 5: Final | Apr 30 – May 6 | IEEE paper + final notebook + teammate report | All |

---

## 7. Related Work

- **Bloomberg ASKB (2026):** Production multi-agent AI for the Bloomberg Terminal — domain-specialized agents coordinated by an orchestrator. Closest real-world precedent.
- **ReAct (Yao et al., 2022):** Interleaved reasoning and acting in LLM agents — foundational pattern for ConductorAgent.
- **FinBERT (Araci, 2019):** Domain-adapted BERT for financial sentiment — used directly in NewsAgent.
- **FiQA (Maia et al., 2018):** Financial opinion mining QA benchmark — primary evaluation dataset.
- **FinanceBench (Islam et al., 2023):** Earnings-focused financial QA — secondary evaluation dataset.
- **LoRA (Hu et al., 2021):** Low-rank adaptation for parameter-efficient fine-tuning — used in Task 3 Part 1.
- **LangChain (2023):** Open-source agent orchestration framework — used for tool dispatch.
- **Karpathy's Autoresearch (2026):** Autonomous ML experiment pattern — inspiration for strategy discovery module.

---

## 8. Expected Outcomes

1. **Tool-based agent outperforms baseline** by +20–30% on answer accuracy and task success rate for multi-step queries (based on ReAct and RAG literature).
2. **Fine-tuned model outperforms base** by +10–15% on financial QA accuracy (based on LoRA fine-tuning literature).
3. **Ablation study validates** the independent contribution of RAG, CoT, multi-agent dispatch, and tool use.
4. **Live web platform** demonstrates the agent system in a polished Bloomberg Terminal-style UI.
5. **Reproducible Jupyter notebook** with all three approaches, evaluation code, and results.

---

## Appendix

- **GitHub:** [https://github.com/aageer/finsight](https://github.com/aageer/finsight)
- **Stack:** Next.js 14, TypeScript, Tailwind, Supabase, Groq (free), Python (LangChain, peft, transformers, yfinance)
- **Total cost:** $0 — all free-tier and open-source

---

*Submitted for CPS 5801 Advanced AI — Kean University — Spring 2026*
