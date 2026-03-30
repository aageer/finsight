# FinSight: Financial Insights via AI Agent
## CPS 5801 Advanced AI — Project Proposal

**Team:** [Student A Name] · [Student B Name]  
**Course:** CPS 5801 Advanced AI — Kean University  
**Submission Date:** March 31, 2026  
**Instructor:** Prof. Kuan Huang

---

## 1. Application Problem

### 1.1 Problem Statement

Financial analysis is one of the most information-dense, time-sensitive, and cognitively demanding tasks in professional work. A typical equity analyst must simultaneously synthesize earnings reports, macroeconomic indicators, technical price charts, competitor benchmarks, SEC filings, and breaking news — often under market-hours pressure. Tools like the Bloomberg Terminal provide raw data access, but offer no autonomous reasoning: the human must still do all the cognitive work.

**FinSight** addresses this gap by building a Bloomberg Terminal-style AI agentic platform that autonomously reasons across multiple data sources, generates structured financial analysis, and delivers institutional-grade insights in natural language. The system is designed to answer complex, multi-step financial questions that no single model call can resolve.

### 1.2 Application Scenario

| Dimension | Details |
|-----------|---------|
| **Domain** | Quantitative & qualitative equity analysis |
| **Target Users** | Finance students, retail investors, CFA candidates, junior analysts |
| **Core Task** | Multi-step financial QA and investment analysis |
| **Task Type** | Question Answering (QA) + Tool-augmented Reasoning |
| **Interface** | Web terminal (Next.js dashboard) + Jupyter evaluation notebook |

### 1.3 Representative User Queries

| Query | Complexity |
|-------|-----------|
| "What is NVDA's P/E ratio today?" | Single-step retrieval |
| "Compare MSFT and GOOGL on revenue growth, margins, and valuation over 3 years" | Multi-step comparison |
| "Should I buy AAPL given current macro conditions and recent news?" | Multi-step reasoning + synthesis |
| "Explain why TSLA dropped 8% today using news and technical signals" | Causal reasoning across tools |
| "What is the Sharpe ratio of a 60/40 NVDA/AAPL portfolio over 1 year?" | Computational + retrieval |

### 1.4 Input and Output Format

**Input:**
- Natural language query from user (text)
- Optional: symbol(s), time range, analysis type

**Output:**
- Structured JSON analysis (`sentiment`, `recommendation`, `price_targets`, `key_factors`, `risks`, `catalysts`)
- Natural language explanation
- Source attribution (transparent reasoning chain)
- Optional: charts (price history, portfolio allocation, peer comparison)

### 1.5 System Capabilities and Limitations

**Capabilities:**
- Retrieval of live and historical market data
- Fundamental and technical analysis via specialized agent tools
- News sentiment classification
- Portfolio risk assessment
- Multi-step reasoning via LLM orchestration

**Limitations:**
- Does not provide licensed financial advice (educational purposes only)
- Real-time data accuracy depends on free-tier API availability
- Fine-tuning is constrained to open-weight models runnable on a single GPU
- LLM outputs may contain hallucinated financial figures if retrieval fails — guardrails are implemented but not infallible

---

## 2. Proposed Agent System

### 2.1 System Overview

FinSight is built around a **Conductor Agent** — a master orchestrator that decomposes incoming financial queries into sub-tasks and delegates them to specialized agents. Each agent is a purpose-built module with its own tools and prompt design. The agents operate in parallel where possible and their outputs are synthesized by a **ReportAgent** into a coherent, structured final response.

This architecture is directly inspired by Bloomberg's ASKB multi-agent system (March 2026), which uses "domain-specialized retrieval agents coordinated by an orchestrator" to enable precise cross-domain financial analysis.

### 2.2 Agent Roster

| Agent | Role | Key Tools |
|-------|------|-----------|
| **ConductorAgent** | Master orchestrator; decomposes queries, assigns agents, synthesizes results | LLM reasoning (Groq/Llama 3.3) |
| **FundamentalAgent** | P/E, EPS, revenue growth, DCF valuation, margins | Alpha Vantage API, Financial Modeling Prep |
| **TechnicalAgent** | RSI, MACD, SMA/EMA crossovers, support/resistance | Yahoo Finance (yfinance), TA-Lib |
| **NewsAgent** | Headline extraction, NLP sentiment classification | RSS feeds, HuggingFace sentiment model |
| **PeerCompAgent** | Sector peer identification and comparative valuation | Market data API + LLM reasoning |
| **RiskAgent** | Portfolio VaR, beta, Sharpe ratio, max drawdown | NumPy/SciPy, historical price data |
| **ReportAgent** | Merges all agent outputs into structured final response | LLM synthesis prompt |

### 2.3 Three-Approach Structure (Mapped to Assignment Tasks)

| Assignment Task | FinSight Implementation |
|-----------------|------------------------|
| Task 2: Baseline LLM/VLM | Single-agent zero-shot/few-shot prompting with a pretrained LLM (Groq Llama 3.3 70B) using chain-of-thought reasoning |
| Task 3 Part 1: Fine-tuning | LoRA fine-tune a 7B model (Mistral-7B or Llama-3.1-8B) on a custom financial QA dataset compiled from public sources |
| Task 3 Part 2: Tool-based Agent | Full multi-agent orchestration with live market data retrieval (RAG), technical indicators, and news sentiment |

---

## 3. System Architecture

### 3.1 Architecture Flowchart

```
┌──────────────────────────────────────────────────────────────────────┐
│                         FinSight Platform                            │
│                      (Next.js Web Terminal)                          │
└──────────────────────────────┬───────────────────────────────────────┘
                               │  Natural Language Query
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        ConductorAgent                                │
│                  (Groq Llama 3.3 70B / GPT-4o-mini)                  │
│                                                                      │
│   1. Parse intent and extract entities (symbol, task type, range)    │
│   2. Build execution plan (which agents, which order, parallel?)     │
│   3. Invoke sub-agents                                               │
│   4. Collect results and call ReportAgent                            │
└────────┬────────┬────────┬────────┬────────┬────────┬───────────────┘
         │        │        │        │        │        │
         ▼        ▼        ▼        ▼        ▼        ▼
  ┌──────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
  │Fundamental│ │Tech  │ │News  │ │Peer  │ │Risk  │ │Custom│
  │  Agent   │ │Agent │ │Agent │ │Comp  │ │Agent │ │Agent │
  └─────┬────┘ └──┬───┘ └──┬───┘ │Agent │ └──┬───┘ └──────┘
        │         │        │     └──┬───┘    │
        ▼         ▼        ▼        ▼        ▼
  ┌──────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
  │Alpha Vantage│ │yfinance│ │RSS + │ │Market│ │Price │
  │FMP API   │ │TA-Lib│ │HF NLP│ │ Data │ │History│
  └──────────┘ └──────┘ └──────┘ └──────┘ └──────┘
         │        │        │        │        │
         └────────┴────────┴────────┴────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │  ReportAgent    │
                    │  (LLM Synthesis)│
                    └────────┬────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  Structured Analysis Output  │
              │  • Sentiment + Score         │
              │  • Recommendation            │
              │  • Price Targets (Bear/Base/ │
              │    Bull)                     │
              │  • Key Factors               │
              │  • Risks & Catalysts         │
              │  • Source Attribution        │
              └──────────────────────────────┘
```

### 3.2 Data Flow

```
User Query → Intent Parsing → Execution Plan → Parallel Agent Dispatch
     → Tool Calls (APIs, RAG, calculations) → Agent Results
          → ReportAgent (LLM synthesis) → Final Structured Response
               → Web UI rendering → User
```

### 3.3 Reasoning Workflow

FinSight uses a **Chain-of-Thought (CoT)** reasoning pattern at two levels:

1. **ConductorAgent level:** The LLM explicitly reasons about query decomposition before assigning agents — e.g., "This query about NVDA earnings requires fundamental data, recent news, and peer context. I will invoke FundamentalAgent, NewsAgent, and PeerCompAgent in parallel, then synthesize."

2. **Individual agent level:** Each agent uses structured prompts with CoT reasoning — e.g., FundamentalAgent: "Step 1: retrieve P/E. Step 2: compare to sector average. Step 3: assess whether valuation is stretched."

---

## 4. Tools and Models

### 4.1 Language Models

| Model | Provider | Tier | Use |
|-------|----------|------|-----|
| Llama 3.3 70B Versatile | Groq | Free | Primary reasoning (ConductorAgent, ReportAgent) |
| Llama 3.1 8B Instruct | Groq | Free | Individual agent reasoning |
| Mistral-7B-Instruct | HuggingFace | Free | Fine-tuning baseline (Task 3 Part 1) |
| DistilBERT / FinBERT | HuggingFace | Free | News sentiment classification (NewsAgent) |

### 4.2 Market Data Tools

| Tool | Source | Cost | Purpose |
|------|--------|------|---------|
| `yfinance` | Yahoo Finance | Free | Historical OHLCV data, company info |
| Alpha Vantage API | Alpha Vantage | Free tier | Real-time quotes, fundamentals, news |
| Financial Modeling Prep | FMP | Free tier | Income statement, balance sheet, ratios |
| `ta-lib` / `pandas_ta` | Open source | Free | Technical indicators (RSI, MACD, Bollinger) |

### 4.3 Agent Framework and Retrieval

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Agent orchestration | LangChain / custom Python | Tool dispatch, output parsing, memory |
| Retrieval-Augmented Generation | FAISS + sentence-transformers | News and filing context retrieval |
| Vector store | FAISS (local) | Store and search news embeddings |
| Embeddings | `sentence-transformers/all-MiniLM-L6-v2` | Free, local, no API cost |
| Fine-tuning | LoRA via `peft` + `transformers` | Mistral-7B parameter-efficient tuning |
| Evaluation notebook | Jupyter (.ipynb) | All tasks, metrics, ablation |

### 4.4 Fine-Tuning Dataset (Task 3 Part 1)

The FinancialQA dataset will be compiled from:

- **FiQA** (Financial Opinion Mining QA) — public benchmark (~6,600 QA pairs)
- **FinanceBench** — earnings-based financial QA (public, ~150 questions)
- **Custom augmentation** — 200+ manually crafted CoT QA pairs from actual 10-K filings and earnings transcripts

Fine-tuning approach: **LoRA (Low-Rank Adaptation)** on Mistral-7B-Instruct with 4-bit quantization (QLoRA) using a single GPU (Google Colab T4, free tier).

---

## 5. Evaluation Plan

### 5.1 Primary Evaluation Metrics

Since FinSight is a **financial QA and reasoning system**, we use the following metrics:

| Metric | Definition | Applies To |
|--------|-----------|-----------|
| **Answer Accuracy** | % of factual answers that match ground truth (within ±5% for numeric) | All three approaches |
| **Task Success Rate** | % of multi-step queries where the agent successfully produces a complete, parseable response | All three approaches |
| **F1 Score** | Token-level F1 between generated answer and reference answer (for open-ended questions) | All three approaches |
| **Sentiment F1** | Classification F1 on news sentiment (bullish/neutral/bearish) against labeled test set | NewsAgent specifically |
| **Reasoning Chain Quality** | Human-rated 1–5 score on coherence and correctness of CoT reasoning steps | Sampled subset |

### 5.2 Evaluation Dataset

| Dataset | Size | Source | Task |
|---------|------|--------|------|
| FiQA test split | 648 QA pairs | Public benchmark | Financial QA |
| FinanceBench | 150 questions | Public benchmark | Earnings QA |
| Custom FinSight eval set | 50 queries | Hand-crafted by team | End-to-end agent evaluation |
| Financial PhraseBank | 4,840 sentences | Public (Malo et al.) | News sentiment classification |

**Total evaluation set: ~900 instances** (well above the minimum required for rigorous evaluation).

### 5.3 Comparison Table (Task 4)

| Method | Answer Accuracy | F1 Score | Task Success Rate | Notes |
|--------|-----------------|----------|-------------------|-------|
| Baseline LLM (Task 2) | TBD | TBD | TBD | Zero-shot Llama 3.3 70B, no tools |
| Fine-tuned LLM (Task 3 Part 1) | TBD | TBD | TBD | QLoRA Mistral-7B on FinancialQA |
| Tool-based Agent (Task 3 Part 2) | TBD | TBD | TBD | Full multi-agent with live data |

*Filled with actual results at midterm and final report stages.*

### 5.4 Ablation Study Design

To understand the contribution of each component:

| Ablation | What is removed | Expected impact |
|----------|----------------|-----------------|
| No RAG | Remove news retrieval from NewsAgent | Reduced sentiment accuracy on recent events |
| No CoT | Remove chain-of-thought prompts from ConductorAgent | Degraded multi-step reasoning |
| No fine-tuning | Use base Mistral-7B instead of LoRA-tuned | Lower accuracy on financial terminology |
| Single agent vs. multi-agent | Replace all agents with one general LLM call | Lower accuracy on complex queries |
| No tool use | Remove all API calls, rely on parametric LLM knowledge | High factual error rate on recent data |

---

## 6. Implementation Plan

### 6.1 Phase Mapping to Timeline

| Phase | Dates | Deliverable | Tasks Covered |
|-------|-------|-------------|---------------|
| **Phase 0: Scaffold** | Done | Next.js platform live | Architecture, UI |
| **Phase 1: Baseline Agent** | Mar 31 – Apr 10 | Jupyter notebook v1 | Task 2 |
| **Phase 2: Fine-tuning** | Apr 10 – Apr 17 | Notebook v2 + midterm report | Task 3 Part 1 |
| **Phase 3: Tool Agent** | Apr 17 – Apr 25 | Full agent system | Task 3 Part 2 |
| **Phase 4: Evaluation** | Apr 25 – Apr 30 | Ablation + comparison table | Task 4 |
| **Phase 5: Final** | Apr 30 – May 6 | IEEE paper + final notebook | Full project |

### 6.2 Notebook Structure (Jupyter)

The project notebook will be organized into these sections:

```
finsight_notebook.ipynb
├── 0. Setup & Dependencies
├── 1. Dataset Preparation (FiQA, FinanceBench, custom set)
├── 2. Baseline LLM Agent (Task 2)
│   ├── 2a. Zero-shot prompting
│   ├── 2b. Few-shot prompting
│   ├── 2c. Chain-of-thought prompting
│   └── 2d. Baseline evaluation results
├── 3. Fine-Tuned LLM (Task 3 Part 1)
│   ├── 3a. Dataset formatting for LoRA fine-tuning
│   ├── 3b. QLoRA training (Mistral-7B on Colab T4)
│   └── 3c. Fine-tuned model evaluation
├── 4. Tool-Based Multi-Agent System (Task 3 Part 2)
│   ├── 4a. ConductorAgent implementation
│   ├── 4b. FundamentalAgent + market data tools
│   ├── 4c. TechnicalAgent + TA indicators
│   ├── 4d. NewsAgent + sentiment RAG
│   ├── 4e. RiskAgent + portfolio math
│   └── 4f. Tool-based agent evaluation
└── 5. Ablation Study & Comparison (Task 4)
    ├── 5a. Three-way comparison table
    └── 5b. Component ablation results
```

---

## 7. Related Work

- **Bloomberg ASKB (2026):** Bloomberg's production multi-agent AI for the Terminal uses domain-specialized agents coordinated by an orchestrator — the closest real-world precedent for FinSight.
- **FinBERT (Araci, 2019):** Domain-adapted BERT for financial sentiment classification — directly used in our NewsAgent.
- **FiQA (Maia et al., 2018):** Benchmark for financial opinion QA used in our evaluation.
- **FinanceBench (Islam et al., 2023):** Earnings-based financial QA benchmark used for evaluation.
- **ReAct (Yao et al., 2022):** Reasoning and acting framework for LLM tool use — foundational to ConductorAgent design.
- **LoRA (Hu et al., 2021):** Parameter-efficient fine-tuning method used in Task 3 Part 1.
- **LangChain:** Agent orchestration framework used for tool dispatch and memory management.
- **Karpathy's Autoresearch (2026):** Autonomous experiment loop pattern — inspirational for the Autoresearch module of FinSight.

---

## 8. Expected Outcomes

By project completion, FinSight will demonstrate:

1. A **quantitative improvement** of the tool-based multi-agent system over the zero-shot baseline on answer accuracy and task success rate (estimated +20–30% based on related work).
2. A **measurable improvement** from LoRA fine-tuning on financial QA accuracy compared to the base model (estimated +10–15% on FiQA).
3. **Ablation study** validating the contribution of each system component.
4. A **live web platform** (Next.js) showcasing the agent system in a Bloomberg Terminal aesthetic.
5. A **reproducible Jupyter notebook** with all three approaches, evaluation code, and results.

---

## Appendix: Project Repository

- **GitHub:** [https://github.com/aageer/finsight](https://github.com/aageer/finsight)
- **Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase, Groq (free LLM), Python (LangChain, peft, transformers, yfinance)
- **Cost:** $0 — 100% free and open-source APIs and models

---

*Submitted for CPS 5801 Advanced AI — Kean University — Spring 2026*
