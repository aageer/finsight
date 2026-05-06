"use client";

import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  FlaskConical,
  Users,
  Bot,
  ArrowRight,
  Terminal,
  Shield,
  Zap,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Bot,
    title: "Multi-Agent Analysis",
    description: "8 Gemini-powered agents: 4 Analysts → Bull/Bear Debate → Trader → Risk Manager → Report. Inspired by TradingAgents & ai-hedge-fund.",
    color: "#ff6600",
  },
  {
    icon: FlaskConical,
    title: "Quants for Everyone",
    description: "RSI, MACD, Bollinger Bands, SMA crossovers computed in pure JS — then explained in plain English by AI. Wall Street, decoded.",
    color: "#00d26a",
  },
  {
    icon: Users,
    title: "Investor Personas",
    description: "Agents inspired by Buffett, Damodaran, Cathie Wood, and Michael Burry debate your stock's future in real-time.",
    color: "#3b82f6",
  },
  {
    icon: BarChart3,
    title: "Bloomberg × OpenBB Dashboard",
    description: "Information-dense, keyboard-driven UI. Real-time data, portfolio tracking, market movers — inspired by OpenBB & Bloomberg.",
    color: "#a855f7",
  },
  {
    icon: Shield,
    title: "AI Risk Manager",
    description: "Nassim Taleb-inspired risk analysis: volatility, max drawdown, and VaR computed before every trade recommendation.",
    color: "#f59e0b",
  },
  {
    icon: Terminal,
    title: "Terminal Interface",
    description: "Bloomberg-style command palette. Type 'analyze NVDA' and watch 8 agents work in parallel.",
    color: "#ec4899",
  },
];

const AGENTS = [
  { name: "AnalysisAgent", status: "IDLE" },
  { name: "ResearchAgent", status: "RUNNING" },
  { name: "SwarmAgent", status: "IDLE" },
  { name: "NewsAgent", status: "RUNNING" },
  { name: "RiskAgent", status: "IDLE" },
  { name: "AlertAgent", status: "RUNNING" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[oklch(0.04_0_0)] text-white">
      {/* Header */}
      <header className="border-b border-[oklch(0.15_0_0)]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#ff6600]">
              <TrendingUp className="h-4 w-4 text-black" />
            </div>
            <span className="font-mono text-lg font-bold tracking-tight text-[#ff6600]">FinSight</span>
          </div>
          <Link href="/dashboard">
            <Button className="bg-[#ff6600] text-black hover:bg-[#ff6600]/90">
              Launch Terminal <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-[oklch(0.2_0_0)] bg-[oklch(0.08_0_0)] px-4 py-1.5">
          <Zap className="h-3.5 w-3.5 text-[#ff6600]" />
          <span className="font-mono text-xs text-[#ff6600]">CSCI 5801 — Advanced AI Project</span>
        </div>

        <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          AI-Powered{" "}
          <span className="text-[#ff6600]">Financial Intelligence</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
          A Bloomberg Terminal-style platform fusing multi-agent analysis (Gemini 2.5 Pro),
          quantitative indicators, and AI-powered investment debates into a single
          agentic system — making Wall Street-grade analysis accessible to everyone.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="bg-[#ff6600] text-black hover:bg-[#ff6600]/90">
              <Terminal className="mr-2 h-4 w-4" />
              Open Dashboard
            </Button>
          </Link>
          <Link href="/analysis">
            <Button size="lg" variant="outline" className="border-[oklch(0.2_0_0)] text-zinc-300 hover:bg-[oklch(0.1_0_0)]">
              <Brain className="mr-2 h-4 w-4" />
              Try AI Analysis
            </Button>
          </Link>
        </div>

        {/* Agent Status Mockup */}
        <div className="mx-auto mt-12 max-w-md">
          <div className="rounded-lg border border-[oklch(0.15_0_0)] bg-[oklch(0.06_0_0)] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Bot className="h-4 w-4 text-[#ff6600]" />
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">Agent Network Status</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {AGENTS.map((agent) => (
                <div key={agent.name} className="flex items-center gap-2 rounded border border-[oklch(0.15_0_0)] bg-[oklch(0.08_0_0)] px-3 py-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${agent.status === "RUNNING" ? "bg-[#00d26a] animate-pulse" : "bg-zinc-600"}`} />
                  <span className="font-mono text-[10px] text-zinc-400">{agent.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Three Pillars of Intelligence</h2>
          <p className="mt-2 text-zinc-500">Powered by cutting-edge agentic AI research</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-[oklch(0.15_0_0)] bg-[oklch(0.06_0_0)] p-6 transition-colors hover:border-[oklch(0.25_0_0)]"
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <feature.icon className="h-5 w-5" style={{ color: feature.color }} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-zinc-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-t border-[oklch(0.15_0_0)] py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="mb-8 font-mono text-xs uppercase tracking-wider text-zinc-500">Built With</h2>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500">
            {["Next.js 16", "TypeScript", "Tailwind CSS", "Gemini 2.5 Pro", "Google AI Studio", "shadcn/ui", "Recharts", "Zustand", "TanStack Query", "Alpha Vantage"].map((tech) => (
              <span key={tech} className="rounded-full border border-[oklch(0.15_0_0)] px-3 py-1 font-mono text-xs">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[oklch(0.15_0_0)] py-8">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="font-mono text-xs text-zinc-600">
            FinSight — CSCI 5801 Advanced AI — Powered by Gemini Ultra — Free & Open Source
          </p>
        </div>
      </footer>
    </div>
  );
}
