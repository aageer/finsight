import { create } from "zustand";
import type { MacroRegime } from "@/types/agent-types";

interface AppState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  activeSymbol: string | null;
  theme: "dark" | "light";
  // ATLAS additions
  currentRegime: MacroRegime;
  agentActivity: number;
  tradingEnabled: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setActiveSymbol: (symbol: string | null) => void;
  setTheme: (theme: "dark" | "light") => void;
  setCurrentRegime: (regime: MacroRegime) => void;
  setAgentActivity: (count: number) => void;
  setTradingEnabled: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  commandPaletteOpen: false,
  activeSymbol: null,
  theme: "dark",
  currentRegime: "TRANSITIONAL",
  agentActivity: 0,
  tradingEnabled: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),
  setTheme: (theme) => set({ theme }),
  setCurrentRegime: (regime) => set({ currentRegime: regime }),
  setAgentActivity: (count) => set({ agentActivity: count }),
  setTradingEnabled: (enabled) => set({ tradingEnabled: enabled }),
}));
