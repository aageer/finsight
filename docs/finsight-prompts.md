# FinSight — AI-Powered Financial Insights Platform
## Phase-by-Phase Prompts for Claude Code / Cursor / Windsurf

> **How to use:** Copy each prompt into your AI coding tool (Claude Code, Cursor, Windsurf/Antigravity) at the start of each phase. Each prompt is self-contained and gives the AI full context on what to build.

---

## Phase 0 — Project Scaffolding & Architecture

```
You are building "FinSight," an AI-powered financial insights platform. Initialize the project with this stack:

FRONTEND: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui components
BACKEND: Next.js API routes + optional separate Express/FastAPI service
DATABASE: PostgreSQL with Prisma ORM
AUTH: NextAuth.js (Google + credentials providers)
STATE: Zustand for client state, React Query (TanStack Query) for server state
CHARTS: Recharts or Tremor for financial data visualization

Project structure:
/finsight
├── /src
│   ├── /app              # Next.js App Router pages
│   │   ├── /dashboard
│   │   ├── /portfolio
│   │   ├── /watchlist
│   │   ├── /analysis
│   │   └── /settings
│   ├── /components
│   │   ├── /ui            # shadcn base components
│   │   ├── /charts        # financial chart components
│   │   ├── /layout        # nav, sidebar, header
│   │   └── /shared        # reusable business components
│   ├── /lib
│   │   ├── /api           # API client functions
│   │   ├── /hooks         # custom React hooks
│   │   ├── /utils         # helpers, formatters, constants
│   │   └── /validators    # Zod schemas
│   ├── /services          # business logic layer
│   ├── /stores            # Zustand stores
│   └── /types             # TypeScript interfaces & types
├── /prisma
│   └── schema.prisma
├── /public
├── .env.example
├── docker-compose.yml     # PostgreSQL + Redis
└── README.md

Set up:
1. Initialize the Next.js project with TypeScript and Tailwind
2. Install all dependencies (shadcn/ui, prisma, next-auth, zustand, @tanstack/react-query, recharts, zod, axios, date-fns, lucide-react)
3. Create the folder structure above
4. Set up Prisma with a PostgreSQL connection string from .env
5. Create docker-compose.yml with PostgreSQL and Redis services
6. Set up a base layout with a collapsible sidebar, top header bar, and main content area
7. Configure path aliases in tsconfig.json (@/components, @/lib, etc.)
8. Create a .env.example with all required env vars documented
9. Add a basic README with setup instructions

Make the sidebar navigation include: Dashboard, Portfolio, Watchlist, Analysis, and Settings.
Use a dark theme by default with a toggle for light mode.
```

---

## Phase 1 — Database Schema & Auth

```
Continue building FinSight. Set up the database schema and authentication.

PRISMA SCHEMA — create these models:

User:
- id (cuid), email (unique), name, hashedPassword (optional for OAuth), image, 
- createdAt, updatedAt
- relations: portfolios[], watchlists[], alerts[], preferences (1:1)

UserPreferences:
- id, userId (unique FK), defaultCurrency (default "USD"), theme ("dark"/"light"), 
- notificationsEnabled (bool), riskTolerance ("conservative"/"moderate"/"aggressive")

Portfolio:
- id, userId (FK), name, description, isDefault (bool), createdAt, updatedAt
- relations: holdings[]

Holding:
- id, portfolioId (FK), symbol, name, quantity (Decimal), avgCostBasis (Decimal), 
- sector, assetType ("stock"/"etf"/"crypto"/"bond"), addedAt, updatedAt

Watchlist:
- id, userId (FK), name, createdAt
- relations: items[]

WatchlistItem:
- id, watchlistId (FK), symbol, name, addedAt, notes (optional)

Alert:
- id, userId (FK), symbol, alertType ("price_above"/"price_below"/"percent_change"/"volume_spike"),
- threshold (Decimal), isActive (bool), triggeredAt (optional), createdAt

Transaction:
- id, holdingId (FK), type ("buy"/"sell"/"dividend"), quantity (Decimal), 
- pricePerUnit (Decimal), totalAmount (Decimal), date, notes (optional)

AUTH SETUP:
1. Configure NextAuth with Google OAuth and Credentials providers
2. Create sign-in, sign-up pages with clean UI (email/password + Google button)
3. Add middleware to protect /dashboard, /portfolio, /watchlist, /analysis routes
4. Create a session provider wrapper component
5. Add user dropdown menu in the header showing name, email, sign-out option

Run prisma generate and create initial migration.
Seed the database with a demo user that has a sample portfolio with 5-10 common stocks.
```

---

## Phase 2 — Market Data Integration Layer

```
Continue building FinSight. Build the market data service layer.

Create a unified market data service that abstracts multiple data sources. 
Use a provider pattern so we can swap APIs without changing business logic.

MARKET DATA SERVICE (/src/services/marketData.ts):

Interface MarketDataProvider:
- getQuote(symbol: string): Promise<StockQuote>
- getBatchQuotes(symbols: string[]): Promise<StockQuote[]>
- getHistoricalData(symbol: string, range: TimeRange): Promise<OHLCV[]>
- searchSymbol(query: string): Promise<SearchResult[]>
- getMarketMovers(): Promise<{ gainers: Mover[], losers: Mover[], mostActive: Mover[] }>
- getMarketNews(symbol?: string): Promise<NewsArticle[]>
- getCompanyProfile(symbol: string): Promise<CompanyProfile>

Types to create:
- StockQuote: symbol, name, price, change, changePercent, volume, avgVolume, 
  marketCap, pe, eps, high52w, low52w, open, previousClose, dayHigh, dayLow, timestamp
- OHLCV: date, open, high, low, close, volume
- TimeRange: "1D" | "5D" | "1M" | "3M" | "6M" | "1Y" | "5Y" | "MAX"
- CompanyProfile: symbol, name, sector, industry, description, ceo, employees, 
  headquarters, website, marketCap, exchange
- NewsArticle: title, summary, source, url, publishedAt, sentiment, relatedSymbols

PROVIDERS TO IMPLEMENT:
1. Primary: Alpha Vantage (free tier) or Yahoo Finance (unofficial)
2. Fallback: Financial Modeling Prep (free tier)

CACHING LAYER:
- Use Redis (or in-memory Map as fallback) to cache:
  - Quotes: 1 minute TTL
  - Historical data: 1 hour TTL for daily, 1 day for weekly+
  - Company profiles: 24 hour TTL
  - Search results: 1 hour TTL
- Create a CacheService class with get/set/invalidate methods

API ROUTES to create:
- GET /api/market/quote?symbol=AAPL
- GET /api/market/batch?symbols=AAPL,GOOGL,MSFT
- GET /api/market/history?symbol=AAPL&range=1Y
- GET /api/market/search?q=apple
- GET /api/market/movers
- GET /api/market/news?symbol=AAPL (optional symbol filter)
- GET /api/market/profile?symbol=AAPL

Add proper error handling, rate limiting awareness, and request deduplication.
Create a custom hook: useMarketData(symbol) that returns { quote, history, isLoading, error }.
```

---

## Phase 3 — Dashboard & Overview Page

```
Continue building FinSight. Build the main dashboard page at /dashboard.

DASHBOARD LAYOUT (responsive grid):

TOP ROW — Market Summary Bar:
- Show S&P 500, NASDAQ, DOW, BTC-USD, 10Y Treasury in a horizontal scroll strip
- Each shows: name, current price, change, changePercent with green/red coloring
- Auto-refreshes every 60 seconds
- Subtle pulse animation on price changes

SECOND ROW — Two cards side by side:
LEFT CARD - Portfolio Summary:
- Total portfolio value (large number with currency formatting)
- Today's gain/loss (dollar + percentage, green/red)
- A mini sparkline of portfolio value over last 30 days
- Asset allocation donut chart (by sector or asset type)
- "View Portfolio →" link

RIGHT CARD - Watchlist Quick View:
- Show top 5 watchlist items with: symbol, price, change%, mini sparkline (7d)
- Quick add button (opens symbol search modal)
- "View All →" link

THIRD ROW — Full width:
- Market Movers: Three tabs (Top Gainers / Top Losers / Most Active)
- Show 5 items per tab: symbol, name, price, change%, volume
- Clicking any row navigates to /analysis?symbol=XXX

FOURTH ROW — Two cards:
LEFT - Recent Transactions:
- Last 5 buy/sell/dividend transactions from all portfolios
- Show: date, type badge, symbol, quantity, price, total

RIGHT - Market News Feed:
- Latest 5 news headlines with sentiment indicator (bullish/bearish/neutral dot)
- Source and time ago
- Clicking opens article in new tab

BOTTOM — Alerts Summary:
- Active alerts count badge
- Last 3 triggered alerts with details
- "Manage Alerts →" link

COMPONENTS TO CREATE:
- MarketTicker (horizontal scrolling market bar)
- PortfolioSummaryCard
- WatchlistQuickView
- MarketMoversTable (with tabs)
- RecentTransactions
- NewsFeed
- AlertsSummary
- SparklineChart (tiny inline chart component)
- PriceChange (formatted +/- with colors)

Use skeleton loaders for all data-fetching states.
All numbers should use proper financial formatting (commas, 2 decimal places, $ prefix).
Make everything responsive: stack cards vertically on mobile.
```

---

## Phase 4 — Portfolio Management

```
Continue building FinSight. Build the portfolio management pages.

PAGE: /portfolio — Portfolio List & Overview:
- Show all user portfolios as cards with: name, total value, today's change, holding count
- "Create Portfolio" button opens a modal (name, description, set as default checkbox)
- Click a portfolio card → /portfolio/[id]

PAGE: /portfolio/[id] — Single Portfolio Detail:

TOP SECTION:
- Portfolio name (editable inline), description
- Total value, total cost basis, total gain/loss ($, %), today's change
- Time period selector (1D, 1W, 1M, 3M, 6M, 1Y, ALL)
- Line chart showing portfolio value over selected period

HOLDINGS TABLE (sortable):
Columns: Symbol, Name, Shares, Avg Cost, Current Price, Market Value, 
         Gain/Loss ($), Gain/Loss (%), Today's Change, Weight (%), Actions
- Sort by any column (click header)
- Color code gains green, losses red
- Each row expandable to show transaction history for that holding
- Actions: Edit, Add Transaction, Remove

ALLOCATION CHARTS (tabs):
- By Sector: donut/pie chart
- By Asset Type: donut/pie chart  
- By Individual Holding: treemap chart showing proportional sizes

TRANSACTION FUNCTIONALITY:
- "Add Transaction" button opens a modal:
  - Symbol search with autocomplete
  - Type: Buy / Sell / Dividend
  - Date picker (defaults to today)
  - Quantity input
  - Price per unit (auto-fills current price, but editable)
  - Total auto-calculates
  - Notes field
- On sell: validate user has enough shares
- On dividend: only needs date and total amount

PERFORMANCE METRICS CARD:
- Total Return (%) 
- Annualized Return
- Best performing holding
- Worst performing holding
- Portfolio Beta (if calculable)
- Sharpe Ratio (simplified)

Create all CRUD API routes:
- POST/GET /api/portfolios
- GET/PATCH/DELETE /api/portfolios/[id]
- POST/GET /api/portfolios/[id]/holdings
- PATCH/DELETE /api/portfolios/[id]/holdings/[holdingId]
- POST/GET /api/portfolios/[id]/transactions
- GET /api/portfolios/[id]/performance?range=1Y

Use optimistic updates for add/edit/delete operations.
Add confirmation dialogs for destructive actions.
```

---

## Phase 5 — Watchlist & Alerts

```
Continue building FinSight. Build watchlist and alerts features.

PAGE: /watchlist

WATCHLIST MANAGEMENT:
- Tab bar showing all user watchlists + "Create New" tab
- Default watchlist created on first visit
- Each watchlist is a sortable table:
  Columns: Symbol, Name, Price, Change, Change%, 52w High, 52w Low, 
           Volume, Market Cap, P/E, Sector, Added Date, Notes, Actions
- Bulk actions: Select multiple → Remove / Move to another watchlist
- Drag to reorder items within a watchlist

ADD TO WATCHLIST:
- "Add Symbol" button with search modal
  - Real-time symbol search as user types
  - Shows: symbol, name, exchange, current price
  - Optional notes field
  - Select which watchlist to add to (default = current)
- Also add "Add to Watchlist" button on individual stock analysis pages

WATCHLIST COMPARISON MODE:
- Toggle "Compare" mode
- Select 2-5 watchlist items
- Shows an overlaid line chart (normalized % change) for selected items
- Time range selector: 1M, 3M, 6M, 1Y

ALERTS SYSTEM:

Alert Types:
1. Price Above — triggers when price >= threshold
2. Price Below — triggers when price <= threshold  
3. Percent Change (daily) — triggers when |daily change%| >= threshold
4. Volume Spike — triggers when volume >= X * average volume

PAGE: /watchlist/alerts (or a tab within /watchlist)
- Active alerts table: symbol, type, threshold, status, created date, actions
- Triggered alerts history: symbol, type, threshold, triggered price, triggered date
- Create alert modal: symbol search, alert type selector, threshold input, 
  optional expiration date

Alert Checking Service:
- Create /api/cron/check-alerts endpoint
- Compares current quotes against active alert thresholds
- When triggered: mark alert as triggered, store triggeredAt and triggeredPrice
- For now, show triggered alerts in the UI (future: email/push notifications)
- Add a "triggered alerts" notification bell icon in the header with unread count

API ROUTES:
- CRUD: /api/watchlists, /api/watchlists/[id], /api/watchlists/[id]/items
- CRUD: /api/alerts
- POST: /api/cron/check-alerts (for cron job or manual trigger)

Add toast notifications when alerts trigger during an active session.
```

---

## Phase 6 — AI-Powered Analysis Engine

```
Continue building FinSight. Build the AI-powered stock analysis page.

PAGE: /analysis (and /analysis?symbol=AAPL)

SYMBOL SEARCH BAR (top):
- Large search input with autocomplete
- Recent searches shown as chips below
- Trending symbols as suggestions

WHEN A SYMBOL IS SELECTED, show a full analysis page:

SECTION 1 — Price Chart (Interactive):
- Candlestick chart (OHLC) with volume bars below
- Time ranges: 1D (5min candles), 5D (30min), 1M, 3M, 6M, 1Y, 5Y (daily candles)
- Overlay toggles: SMA(20), SMA(50), SMA(200), EMA(12), EMA(26), Bollinger Bands
- Indicators panel below: RSI(14), MACD(12,26,9), Volume with moving average
- Crosshair with price/date tooltip on hover
- Draw mode: trend lines (stretch goal)

SECTION 2 — Company Overview Card:
- Company name, logo (use clearbit logo API: logo.clearbit.com/domain.com), 
  sector, industry, exchange
- Current price, change, market cap, P/E, EPS, dividend yield
- 52-week range visualized as a slider/bar with current price marked
- Brief company description (expandable)

SECTION 3 — AI Insight Panel (THE KEY FEATURE):
- "Generate AI Analysis" button
- Sends to an API route that calls Claude/OpenAI with structured financial data
- The prompt should include: current price data, key metrics, recent price action, 
  sector performance, and recent news headlines
- AI returns structured analysis:
  {
    summary: "2-3 sentence overview",
    sentiment: "bullish" | "bearish" | "neutral",
    sentimentScore: 0-100,
    keyFactors: [{ factor: string, impact: "positive"|"negative"|"neutral", detail: string }],
    technicalOutlook: string,
    fundamentalOutlook: string,
    risks: string[],
    catalysts: string[],
    priceTargets: { bear: number, base: number, bull: number },
    recommendation: "strong_buy"|"buy"|"hold"|"sell"|"strong_sell",
    confidence: 0-100
  }
- Display as a beautiful card with:
  - Sentiment gauge (semicircle meter)
  - Key factors as colored cards (green/red/gray)
  - Bull/Base/Bear price targets on a range visualization
  - Recommendation badge
  - Expandable sections for technical/fundamental outlook

SECTION 4 — Financials Tab Panel:
Tabs: Income Statement | Balance Sheet | Cash Flow | Key Ratios
- Show last 4 quarters or last 4 years (toggle)
- Simple table with key line items
- Sparklines for trend of each metric

SECTION 5 — News & Sentiment:
- Recent news articles related to the symbol
- Each article has an AI-generated sentiment tag
- Overall news sentiment score as a small chart

SECTION 6 — Peer Comparison:
- Auto-detect 4-5 peers in same sector
- Comparison table: P/E, Market Cap, Revenue Growth, Profit Margin, Dividend Yield
- Bar chart comparing key metrics

API ROUTES:
- POST /api/analysis/ai — accepts { symbol, quote, metrics, news } → returns AI analysis
- GET /api/analysis/financials?symbol=AAPL&type=income&period=quarterly
- GET /api/analysis/peers?symbol=AAPL

Add a loading state with animated skeleton for the AI analysis.
Cache AI analysis results for 4 hours per symbol.
Add "Save Analysis" button that stores the result tied to the user.
```

---

## Phase 7 — Settings & User Preferences

```
Continue building FinSight. Build the settings page.

PAGE: /settings (tabbed layout)

TAB 1 — Profile:
- Edit name, email (read-only if OAuth), avatar upload
- Connected accounts (show Google if linked)
- Change password (if credentials auth)
- Delete account (with double confirmation modal)

TAB 2 — Preferences:
- Default currency: dropdown (USD, EUR, GBP, JPY, CAD, AUD)
- Theme: Light / Dark / System toggle cards with preview
- Number format: 1,234.56 vs 1.234,56
- Default portfolio: dropdown of user's portfolios
- Default chart type: Line / Candlestick / Area
- Default time range: 1M / 3M / 6M / 1Y
- Risk tolerance: Conservative / Moderate / Aggressive (affects AI analysis tone)

TAB 3 — Notifications:
- Master toggle: Enable/Disable all
- Alert notifications: on/off
- Daily portfolio summary: on/off  
- Weekly market recap: on/off
- News alerts for watchlist items: on/off
(For now these are just preferences stored in DB — actual email/push is future work)

TAB 4 — Data & Privacy:
- Export all data as JSON
- Export portfolio as CSV
- Export transaction history as CSV
- Clear all AI analysis history
- Privacy: toggle anonymous analytics

API ROUTES:
- GET/PATCH /api/user/profile
- GET/PATCH /api/user/preferences
- POST /api/user/export (returns zip with all data)
- DELETE /api/user (account deletion)

Use react-hook-form with Zod validation for all forms.
Show success toasts on save. Auto-save preferences with debounce.
Apply user preferences throughout the app (currency formatting, theme, chart defaults).
```

---

## Phase 8 — Polish, Performance & Deployment

```
Continue building FinSight. Final polish and deployment preparation.

PERFORMANCE:
1. Add React.memo to expensive chart components
2. Implement virtual scrolling for large tables (holdings, transactions)
3. Add route-based code splitting (dynamic imports for heavy pages like /analysis)
4. Optimize images: use next/image, lazy load logos
5. Add stale-while-revalidate patterns in React Query config
6. Debounce search inputs (300ms)
7. Add request deduplication in the market data service

ERROR HANDLING:
1. Create a global error boundary component with a friendly fallback UI
2. Add toast notification system (success, error, warning, info)
3. Handle API errors gracefully: show inline error states, not blank pages
4. Add retry logic for failed market data requests (3 attempts, exponential backoff)
5. Create a /500 and /404 custom page

ACCESSIBILITY:
1. Audit all components for keyboard navigation
2. Add ARIA labels to charts and interactive elements
3. Ensure color contrast meets WCAG AA for all financial data (green/red on dark bg)
4. Add screen reader text for price changes ("Apple stock up 2.3 percent")
5. Focus management for modals and dropdowns

SEO & META:
1. Add proper meta tags, Open Graph tags for shared pages
2. Create a landing page at / (not behind auth) showcasing the platform
3. Add structured data for the landing page

TESTING:
1. Add unit tests for financial calculation utilities (gain/loss, percentages, formatting)
2. Add integration tests for critical API routes (portfolio CRUD, market data)
3. Add E2E test for core flow: sign in → add holding → view dashboard

DEPLOYMENT:
1. Create production Dockerfile (multi-stage build)
2. Update docker-compose.yml with production config
3. Create a Vercel deployment config (vercel.json) as primary deploy target
4. Set up environment variable documentation for production
5. Add health check endpoint: GET /api/health
6. Create a CI/CD GitHub Actions workflow:
   - Run linting (ESLint)
   - Run type checking (tsc --noEmit)
   - Run tests
   - Build
   - Deploy to Vercel (on main branch)

FINAL TOUCHES:
1. Add a command palette (Cmd+K) for quick navigation and symbol search
2. Add keyboard shortcuts: G+D (dashboard), G+P (portfolio), G+W (watchlist), G+A (analysis)
3. Add a "What's New" changelog modal
4. Loading states: use skeleton screens everywhere, not spinners
5. Add subtle animations with Framer Motion: page transitions, card hovers, number counters
6. Ensure all monetary values respect user's currency preference
7. Add a PWA manifest for mobile installability
```

---

## Bonus Phase — Advanced Features (Pick & Choose)

```
BONUS FEATURES for FinSight — implement any of these independently:

FEATURE A — Portfolio Backtesting:
Add a /backtest page where users can:
- Input a hypothetical portfolio (symbols + weights)
- Select a time period (1Y, 3Y, 5Y, 10Y)
- Run a backtest showing: total return, CAGR, max drawdown, Sharpe ratio, 
  Sortino ratio, volatility
- Compare against S&P 500 benchmark
- Show an equity curve chart and drawdown chart

FEATURE B — Screener:
Add a /screener page with:
- Filter stocks by: market cap range, P/E range, sector, dividend yield, 
  52-week performance, volume
- Results table with sortable columns
- Save screener presets
- Export results as CSV

FEATURE C — AI Chat Assistant:
Add a floating chat widget (bottom right) that:
- Lets users ask natural language questions about their portfolio
- Context-aware: knows user's holdings, watchlist, recent transactions
- Examples: "How is my portfolio doing?", "Should I add more tech exposure?",
  "What's the news on AAPL?", "Compare MSFT vs GOOGL"
- Uses Claude API with structured context injection
- Chat history persisted per session

FEATURE D — Social / Sharing:
- Share portfolio performance as an image card (like Spotify Wrapped)
- Public portfolio page (opt-in) with shareable link
- Monthly performance report auto-generated as PDF

FEATURE E — Real-time WebSocket Prices:
- Integrate with a WebSocket market data feed (e.g., Finnhub WS)
- Live price updates on dashboard and portfolio pages
- Flash animation on price changes (green flash up, red flash down)
- Live P&L updates
```

---

## Tips for Using These Prompts

1. **One phase at a time** — Don't overload the AI. Complete and test each phase before moving on.
2. **Reference previous work** — After Phase 0, start each prompt with "Continue building FinSight" so the AI knows to build on existing code.
3. **Debug iteratively** — If something breaks, paste the error and ask the AI to fix it specifically.
4. **Customize** — Swap out shadcn/ui for Material UI, or PostgreSQL for MongoDB, etc. based on your preference.
5. **API keys** — You'll need at least one financial data API key (Alpha Vantage is free) and an AI API key for the analysis feature.
