"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronRight, Terminal } from "lucide-react";

const WELCOME_BLOCK = [
  "Welcome to FinSight Terminal. Type 'help' for available commands.",
  "",
  "> market summary",
  "SPY   +0.56%",
  "QQQ   +0.79%",
  "DIA   -0.21%",
  "",
];

const HELP_LINES = [
  "analyze <symbol>",
  "compare <sym1> vs <sym2>",
  "swarm <scenario>",
  "research <directive>",
  "risk <portfolio>",
  "screen <criteria>",
  "alert <symbol> <condition>",
  "help",
];

export default function TerminalPage() {
  const [lines, setLines] = useState<string[]>(() => [...WELCOME_BLOCK]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const runCommand = useCallback((raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;

    setLines((prev) => [...prev, `> ${cmd}`]);

    if (cmd.toLowerCase() === "help") {
      setLines((prev) => [
        ...prev,
        "Available commands:",
        ...HELP_LINES.map((h) => `  ${h}`),
        "",
      ]);
      return;
    }

    if (cmd.toLowerCase() === "market summary") {
      setLines((prev) => [
        ...prev,
        "SPY   +0.56%",
        "QQQ   +0.79%",
        "DIA   -0.21%",
        "",
      ]);
      return;
    }

    setLines((prev) => [...prev, `Unknown command: ${cmd.split(/\s+/)[0]}. Type 'help'.`, ""]);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runCommand(input);
    setInput("");
  };

  return (
    <div className="-m-4 flex min-h-[calc(100dvh-7rem)] flex-col bg-[oklch(0.04_0_0)] text-[var(--color-positive)]">
      <div className="flex shrink-0 items-center gap-2 border-b border-[#1a1a1a] px-2 py-1.5">
        <Terminal className="size-3.5 text-[var(--color-accent-orange)]" />
        <span className="font-mono-terminal text-xs font-medium text-[var(--color-accent-orange)]">
          FinSight Terminal v0.1.0
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-1 font-mono-terminal text-[11px] leading-relaxed">
        {lines.map((line, i) => {
          if (line === "") {
            return <div key={i} className="h-2 shrink-0" aria-hidden />;
          }
          const isPrompt = line.startsWith("> ");
          return (
            <div
              key={i}
              className={
                isPrompt ? "text-[var(--color-accent-orange)]" : "text-[var(--color-positive)]"
              }
            >
              {line}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <Card className="m-0 shrink-0 rounded-none border-0 border-t border-[#1a1a1a] bg-transparent py-0 shadow-none ring-0">
        <CardHeader className="px-2 py-1.5 pb-1">
          <div className="flex items-center gap-1 font-mono-terminal text-[10px] text-[var(--color-accent-orange)]/90">
            <ChevronRight className="size-3" />
            <span>commands</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 px-2 pb-2 pt-0">
          <div className="font-mono-terminal text-[10px] leading-5 text-[var(--color-positive)]/85">
            {HELP_LINES.join(" · ")}
          </div>
          <form onSubmit={onSubmit} className="flex items-center gap-1 border-t border-[#1a1a1a] pt-2">
            <span className="shrink-0 font-mono-terminal text-sm text-[var(--color-accent-orange)]">
              &gt;
            </span>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a command..."
              className="h-7 border-0 bg-transparent px-1 font-mono-terminal text-[11px] text-[var(--color-positive)] shadow-none ring-0 placeholder:text-[var(--color-positive)]/35 focus-visible:ring-0"
              autoComplete="off"
              spellCheck={false}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
