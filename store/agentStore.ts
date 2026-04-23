import { create } from 'zustand';

interface AgentStoreState {
  isRunning: boolean;
  currentRunId: string | null;
  pendingCount: number;
  currentGoal: string;
  latestTask: any | null;
  setRunning: (isRunning: boolean) => void;
  setCurrentRunId: (runId: string | null) => void;
  setPendingCount: (count: number) => void;
  setCurrentGoal: (goal: string) => void;
  setLatestTask: (task: any | null) => void;
}

export const useAgentStore = create<AgentStoreState>((set) => ({
  isRunning: false,
  currentRunId: null,
  pendingCount: 0,
  currentGoal: '',
  latestTask: null,
  setRunning: (isRunning) => set({ isRunning }),
  setCurrentRunId: (currentRunId) => set({ currentRunId }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setCurrentGoal: (currentGoal) => set({ currentGoal }),
  setLatestTask: (latestTask) => set({ latestTask }),
}));
