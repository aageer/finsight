# FinSight — AI-Powered Financial Intelligence Platform

Bloomberg Terminal-style AI agentic platform built for **CSCI 5801 — Advanced AI**.

Combines **multi-agent analysis**, **autonomous research** (Karpathy's Autoresearch pattern), and **swarm simulation** (MiroShark/MiroFish) into a unified financial intelligence system.

## Tech Stack (100% Free)

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui | Free |
| Database | Supabase (PostgreSQL) | Free tier |
| Auth | Supabase Auth | Free tier |
| AI/LLM | Groq (Llama 3.3 70B) | Free tier |
| Charts | Recharts, TradingView Lightweight Charts | Open source |
| State | Zustand, TanStack Query | Open source |
| Deployment | Vercel | Free tier |

## Quick Start

```bash
# 1. Clone and install
cd finsight
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and API keys

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.
Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the terminal dashboard.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/dashboard` | Bloomberg-style main dashboard |
| `/portfolio` | Portfolio management with holdings table |
| `/watchlist` | Stock watchlist with alerts |
| `/analysis` | Multi-agent AI stock analysis |
| `/autoresearch` | Autonomous strategy discovery console |
| `/swarm` | MiroShark sentiment swarm simulation studio |
| `/terminal` | Bloomberg-style command interface |
| `/settings` | User preferences, agent config, data export |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open command palette |
| Click sidebar items | Navigate between pages |

## Environment Variables

See `.env.example` for all required variables. At minimum you need:

- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anon key
- `GROQ_API_KEY` — Free API key from [console.groq.com](https://console.groq.com)

## Project Structure

```
finsight/
├── src/
│   ├── app/
│   │   ├── (app)/           # Authenticated pages with sidebar layout
│   │   │   ├── dashboard/
│   │   │   ├── portfolio/
│   │   │   ├── watchlist/
│   │   │   ├── analysis/
│   │   │   ├── autoresearch/
│   │   │   ├── swarm/
│   │   │   ├── terminal/
│   │   │   └── settings/
│   │   ├── layout.tsx       # Root layout with providers
│   │   └── page.tsx         # Landing page
│   ├── components/
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── layout/          # Sidebar, header, market ticker, command palette
│   │   ├── shared/          # Price change, sparkline, agent status dot
│   │   └── providers.tsx    # React Query, Theme, Toast providers
│   ├── lib/
│   │   ├── supabase/        # Supabase client (browser + server)
│   │   └── utils/           # Formatting utilities
│   ├── services/            # Market data service (mock data)
│   ├── stores/              # Zustand stores
│   └── types/               # TypeScript interfaces
├── .env.example
└── package.json
```

## Architecture Pillars

1. **Multi-Agent Analysis** — 6 specialized AI agents (Fundamental, Technical, News, Peer, Knowledge Graph, Risk) analyze stocks in parallel
2. **Autoresearch** — Karpathy-inspired autonomous strategy discovery with `program.md` directives
3. **Swarm Simulation** — MiroShark/MiroFish-powered multi-agent sentiment simulation with investor persona archetypes

## License

Student project — CSCI 5801 Advanced AI
