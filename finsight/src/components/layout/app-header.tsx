"use client";

import { Bell, Command, PanelLeftClose, PanelLeft, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/stores/app-store";

export function AppHeader() {
  const { sidebarOpen, toggleSidebar, setCommandPaletteOpen } = useAppStore();

  return (
    <header className="flex h-9 items-center justify-between border-b border-border bg-[#050505] px-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-[oklch(0.45_0_0)] hover:text-foreground"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? <PanelLeftClose className="h-3 w-3" /> : <PanelLeft className="h-3 w-3" />}
        </Button>

        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex h-6 items-center gap-2 rounded-sm border border-border bg-[#0a0a0a] px-2 font-mono-terminal text-[10px] text-[oklch(0.45_0_0)] transition-colors hover:bg-[#111] hover:text-foreground"
        >
          <Search className="h-3 w-3" />
          <span>Search symbols, commands...</span>
          <kbd className="ml-3 flex items-center gap-0.5 rounded-sm border border-border bg-[#111] px-1 py-0.5 font-mono text-[8px]">
            <Command className="h-2 w-2" />K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="mr-1 flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-positive)] animate-pulse" />
          <span className="font-mono-terminal text-[9px] text-[oklch(0.45_0_0)]">3 AGENTS ACTIVE</span>
        </div>

        <Button variant="ghost" size="icon" className="relative h-6 w-6 text-[oklch(0.45_0_0)] hover:text-foreground">
          <Bell className="h-3 w-3" />
          <Badge
            variant="destructive"
            className="absolute -right-0.5 -top-0.5 h-3 min-w-3 px-0.5 text-[8px]"
          >
            2
          </Badge>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-6 w-6 items-center justify-center rounded-sm text-[oklch(0.45_0_0)] transition-colors hover:bg-[#111] hover:text-foreground">
            <User className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <div className="px-2 py-1">
              <p className="font-mono-terminal text-[11px] font-medium">Demo User</p>
              <p className="font-mono-terminal text-[9px] text-muted-foreground">demo@finsight.ai</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[11px]">Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-[11px]">Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[11px] text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
