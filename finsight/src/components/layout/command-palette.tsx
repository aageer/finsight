"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Briefcase,
  Eye,
  BarChart3,
  FlaskConical,
  Users,
  Terminal,
  Settings,
  Search,
  Bot,
  TrendingUp,
} from "lucide-react";
import { useAppStore } from "@/stores/app-store";

const PAGES = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Portfolio", href: "/portfolio", icon: Briefcase },
  { name: "Watchlist", href: "/watchlist", icon: Eye },
  { name: "Analysis", href: "/analysis", icon: BarChart3 },
  { name: "Autoresearch", href: "/autoresearch", icon: FlaskConical },
  { name: "Swarm Studio", href: "/swarm", icon: Users },
  { name: "Terminal", href: "/terminal", icon: Terminal },
  { name: "Settings", href: "/settings", icon: Settings },
];

const QUICK_SYMBOLS = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA"];

const COMMANDS = [
  { name: "Run Analysis on Symbol...", icon: Bot },
  { name: "Launch Swarm Simulation...", icon: Users },
  { name: "Start Autoresearch Program...", icon: FlaskConical },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [setCommandPaletteOpen]);

  const navigate = (href: string) => {
    setCommandPaletteOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder="Search symbols, pages, commands..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          {PAGES.map((page) => (
            <CommandItem key={page.href} onSelect={() => navigate(page.href)}>
              <page.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              {page.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Symbols">
          {QUICK_SYMBOLS.map((sym) => (
            <CommandItem key={sym} onSelect={() => navigate(`/analysis?symbol=${sym}`)}>
              <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="font-mono-terminal">{sym}</span>
              <span className="ml-2 text-xs text-muted-foreground">View Analysis</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Agent Commands">
          {COMMANDS.map((cmd) => (
            <CommandItem key={cmd.name}>
              <cmd.icon className="mr-2 h-4 w-4 text-[var(--color-accent-orange)]" />
              {cmd.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
