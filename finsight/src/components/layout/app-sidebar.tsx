"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Eye,
  BarChart3,
  FlaskConical,
  Users,
  Terminal,
  Settings,
  TrendingUp,
  Bot,
  Brain,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, key: "F1" },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase, key: "F2" },
  { href: "/watchlist", label: "Watchlist", icon: Eye, key: "F3" },
  { href: "/analysis", label: "Analysis", icon: BarChart3, key: "F4" },
  { href: "/agents-console", label: "Agents", icon: Brain, key: "F5" },
  { href: "/trading", label: "Trading", icon: Zap, key: "F6" },
  { href: "/autoresearch", label: "Research", icon: FlaskConical, key: "F7" },
  { href: "/swarm", label: "Swarm", icon: Users, key: "F8" },
  { href: "/terminal", label: "Terminal", icon: Terminal, key: "F9" },
];

const BOTTOM_ITEMS = [
  { href: "/settings", label: "Settings", icon: Settings, key: "" },
];

export function AppSidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-[#050505] transition-all duration-200",
        collapsed ? "w-12" : "w-44"
      )}
    >
      {/* Logo */}
      <div className="flex h-10 items-center gap-1.5 border-b border-border px-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-[var(--color-accent-orange)]">
          <TrendingUp className="h-3 w-3 text-black" />
        </div>
        {!collapsed && (
          <span className="font-mono-terminal text-xs font-bold tracking-tight text-[var(--color-accent-orange)]">
            FinSight
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex flex-1 flex-col gap-0.5 px-1 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2 rounded-sm px-2 py-1.5 font-mono-terminal text-[10px] font-medium transition-colors",
                isActive
                  ? "bg-[var(--color-accent-orange)]/10 text-[var(--color-accent-orange)]"
                  : "text-[oklch(0.5_0_0)] hover:bg-[#111] hover:text-[oklch(0.75_0_0)]"
              )}
            >
              <item.icon className={cn("h-3.5 w-3.5 shrink-0", isActive && "text-[var(--color-accent-orange)]")} />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  <span className="text-[8px] text-[oklch(0.35_0_0)] group-hover:text-[oklch(0.45_0_0)]">
                    {item.key}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border px-1 py-2">
        {BOTTOM_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-sm px-2 py-1.5 font-mono-terminal text-[10px] font-medium transition-colors",
                isActive
                  ? "bg-[var(--color-accent-orange)]/10 text-[var(--color-accent-orange)]"
                  : "text-[oklch(0.5_0_0)] hover:bg-[#111] hover:text-[oklch(0.75_0_0)]"
              )}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
