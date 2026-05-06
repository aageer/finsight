/**
 * Trading Store — Zustand state for auto-trading
 */

import { create } from "zustand";
import type {
  AutoTradeConfig,
  TradeExecution,
  TradingDaySummary,
  TradingMode,
} from "@/types/agent-types";
import { getDefaultTradeConfig } from "@/lib/trading/trade-executor";

interface TradingState {
  // Configuration
  config: AutoTradeConfig;

  // State
  isKillSwitchActive: boolean;
  positions: Array<{
    symbol: string;
    qty: number;
    side: "long" | "short";
    marketValue: number;
    costBasis: number;
    unrealizedPnl: number;
    unrealizedPnlPct: number;
    currentPrice: number;
    avgEntryPrice: number;
  }>;

  // History
  executions: TradeExecution[];
  daySummary: TradingDaySummary | null;

  // Account
  portfolioValue: number;
  buyingPower: number;
  cash: number;
  dailyPnl: number;
  peakValue: number;

  // Actions
  setConfig: (config: Partial<AutoTradeConfig>) => void;
  setMode: (mode: TradingMode) => void;
  setKillSwitch: (active: boolean) => void;
  addExecution: (execution: TradeExecution) => void;
  setPositions: (positions: TradingState["positions"]) => void;
  setDaySummary: (summary: TradingDaySummary) => void;
  setAccountInfo: (info: { portfolioValue: number; buyingPower: number; cash: number; dailyPnl: number }) => void;
  clearHistory: () => void;
}

const TRADING_CONFIG_KEY = "finsight_trading_config";

function loadSavedConfig(): AutoTradeConfig {
  if (typeof window === "undefined") return getDefaultTradeConfig();
  try {
    const raw = localStorage.getItem(TRADING_CONFIG_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return { ...getDefaultTradeConfig(), ...saved };
    }
  } catch { /* pass */ }
  return getDefaultTradeConfig();
}

function saveConfig(config: AutoTradeConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TRADING_CONFIG_KEY, JSON.stringify(config));
  } catch { /* pass */ }
}

export const useTradingStore = create<TradingState>((set, get) => ({
  config: loadSavedConfig(),
  isKillSwitchActive: false,
  positions: [],
  executions: [],
  daySummary: null,
  portfolioValue: 100_000, // paper trading default
  buyingPower: 100_000,
  cash: 100_000,
  dailyPnl: 0,
  peakValue: 100_000,

  setConfig: (partial) => {
    set((state) => {
      const newConfig = { ...state.config, ...partial };
      saveConfig(newConfig);
      return { config: newConfig };
    });
  },

  setMode: (mode) => {
    set((state) => {
      const newConfig = {
        ...state.config,
        mode,
        requireConfirmation: mode === "LIVE",
      };
      saveConfig(newConfig);
      return {
        config: newConfig,
        isKillSwitchActive: mode === "HALTED",
      };
    });
  },

  setKillSwitch: (active) => {
    set((state) => {
      if (active) {
        const newConfig = { ...state.config, mode: "HALTED" as TradingMode };
        saveConfig(newConfig);
        return { isKillSwitchActive: true, config: newConfig };
      }
      return { isKillSwitchActive: false };
    });
  },

  addExecution: (execution) => {
    set((state) => ({
      executions: [execution, ...state.executions].slice(0, 500),
    }));
  },

  setPositions: (positions) => set({ positions }),

  setDaySummary: (summary) => set({ daySummary: summary }),

  setAccountInfo: (info) => {
    set((state) => ({
      ...info,
      peakValue: Math.max(state.peakValue, info.portfolioValue),
    }));
  },

  clearHistory: () => set({ executions: [], daySummary: null }),
}));
