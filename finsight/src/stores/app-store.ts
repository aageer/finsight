import { create } from "zustand";

interface AppState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  activeSymbol: string | null;
  theme: "dark" | "light";
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setActiveSymbol: (symbol: string | null) => void;
  setTheme: (theme: "dark" | "light") => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  commandPaletteOpen: false,
  activeSymbol: null,
  theme: "dark",
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),
  setTheme: (theme) => set({ theme }),
}));
