/**
 * Agent Store — Zustand state for the ATLAS agent system
 */

import { create } from "zustand";
import type {
  ATLASAgent,
  ATLASPipelineOutput,
  MacroRegime,
  DarwinianWeight,
  AgentScorecard,
  AutoresearchExperiment,
  AgentLayer,
} from "@/types/agent-types";
import { getAllAgents } from "@/lib/agents/atlas-conductor";
import { loadWeights, loadScorecards } from "@/lib/agents/darwinian-weights";

interface AgentState {
  // Agent registry
  agents: ATLASAgent[];
  activeAgentCount: number;

  // Pipeline
  lastPipelineOutput: ATLASPipelineOutput | null;
  pipelineRunning: boolean;
  pipelineStage: string;
  pipelineProgress: number; // 0-100

  // Regime
  currentRegime: MacroRegime;
  regimeConfidence: number;

  // Darwinian weights
  weights: DarwinianWeight[];
  scorecards: AgentScorecard[];

  // Autoresearch
  experiments: AutoresearchExperiment[];

  // Actions
  initAgents: () => void;
  setAgentStatus: (agentId: string, status: ATLASAgent["status"]) => void;
  setPipelineRunning: (running: boolean) => void;
  setPipelineStage: (stage: string, progress: number) => void;
  setPipelineOutput: (output: ATLASPipelineOutput) => void;
  setRegime: (regime: MacroRegime, confidence: number) => void;
  updateWeights: (weights: DarwinianWeight[]) => void;
  addExperiment: (experiment: AutoresearchExperiment) => void;
  updateExperiment: (id: string, update: Partial<AutoresearchExperiment>) => void;
  getAgentsByLayer: (layer: AgentLayer) => ATLASAgent[];
}

export const useAgentStore = create<AgentState>((set, get) => ({
  // Initial state
  agents: [],
  activeAgentCount: 0,
  lastPipelineOutput: null,
  pipelineRunning: false,
  pipelineStage: "",
  pipelineProgress: 0,
  currentRegime: "TRANSITIONAL",
  regimeConfidence: 0.5,
  weights: [],
  scorecards: [],
  experiments: [],

  // Actions
  initAgents: () => {
    const agents = getAllAgents();
    const weights = loadWeights();
    const scorecards = loadScorecards();

    // Apply saved weights to agents
    const weightMap = new Map(weights.map((w) => [w.agentId, w.currentWeight]));
    const agentsWithWeights = agents.map((a) => ({
      ...a,
      darwinianWeight: weightMap.get(a.id) || 1.0,
    }));

    set({
      agents: agentsWithWeights,
      weights: weights.length > 0 ? weights : agents.map((a) => ({
        agentId: a.id,
        currentWeight: 1.0,
        previousWeight: 1.0,
        streak: 0,
        lastUpdated: new Date().toISOString(),
      })),
      scorecards: scorecards.length > 0 ? scorecards : agents.map((a) => ({
        agentId: a.id,
        name: a.name,
        layer: a.layer,
        rollingSharpeDays: 30,
        sharpe: 0,
        hitRate: 0.5,
        avgConviction: 50,
        totalCalls: 0,
        bestCall: "—",
        worstCall: "—",
        weight: 1.0,
        weightHistory: [],
      })),
    });
  },

  setAgentStatus: (agentId, status) => {
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, status } : a
      ),
      activeAgentCount: state.agents.filter(
        (a) => (a.id === agentId ? status : a.status) === "RUNNING"
      ).length,
    }));
  },

  setPipelineRunning: (running) => {
    set({
      pipelineRunning: running,
      ...(running ? { pipelineStage: "Initializing...", pipelineProgress: 0 } : {}),
    });
  },

  setPipelineStage: (stage, progress) => {
    set({ pipelineStage: stage, pipelineProgress: progress });
  },

  setPipelineOutput: (output) => {
    set({
      lastPipelineOutput: output,
      pipelineRunning: false,
      pipelineProgress: 100,
      pipelineStage: "Complete",
      currentRegime: output.layer1.regime,
      regimeConfidence: output.layer1.regimeConfidence,
    });
  },

  setRegime: (regime, confidence) => {
    set({ currentRegime: regime, regimeConfidence: confidence });
  },

  updateWeights: (weights) => {
    set((state) => {
      const weightMap = new Map(weights.map((w) => [w.agentId, w.currentWeight]));
      return {
        weights,
        agents: state.agents.map((a) => ({
          ...a,
          darwinianWeight: weightMap.get(a.id) || a.darwinianWeight,
        })),
      };
    });
  },

  addExperiment: (experiment) => {
    set((state) => ({
      experiments: [experiment, ...state.experiments].slice(0, 100),
    }));
  },

  updateExperiment: (id, update) => {
    set((state) => ({
      experiments: state.experiments.map((e) =>
        e.id === id ? { ...e, ...update } : e
      ),
    }));
  },

  getAgentsByLayer: (layer) => {
    return get().agents.filter((a) => a.layer === layer);
  },
}));
