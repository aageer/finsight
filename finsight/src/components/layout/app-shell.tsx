"use client";

import { useAppStore } from "@/stores/app-store";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { MarketTicker } from "./market-ticker";
import { CommandPalette } from "./command-palette";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar collapsed={!sidebarOpen} />
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-200",
          sidebarOpen ? "ml-56" : "ml-16"
        )}
      >
        <MarketTicker />
        <AppHeader />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
