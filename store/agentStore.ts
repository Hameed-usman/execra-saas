import { create } from 'zustand';
import { AgentTask } from '@/types/agent';

interface AgentStoreState {
  // Whether a pipeline is actively running (ONLY set by AgentGoalInput on user click)
  isRunning: boolean;
  // ID of the current in-progress run
  currentRunId: string | null;
  // The goal text the user submitted
  currentGoal: string;
  // The latest task object polled from the backend
  latestTask: AgentTask | null;
  // Real-time step log entries from output.step_log
  steps: string[];

  setRunning: (v: boolean) => void;
  setCurrentRunId: (id: string | null) => void;
  setCurrentGoal: (goal: string) => void;
  setLatestTask: (task: AgentTask | null) => void;
  setSteps: (steps: string[]) => void;
  resetRun: () => void;
}

export const useAgentStore = create<AgentStoreState>((set) => ({
  isRunning: false,
  currentRunId: null,
  currentGoal: '',
  latestTask: null,
  steps: [],

  setRunning: (isRunning) => set({ isRunning }),
  setCurrentRunId: (currentRunId) => set({ currentRunId }),
  setCurrentGoal: (currentGoal) => set({ currentGoal }),
  setLatestTask: (latestTask) => set({ latestTask }),
  setSteps: (steps) => set({ steps }),

  // Call this to fully reset after a run completes or is dismissed
  resetRun: () =>
    set({ isRunning: false, currentRunId: null, currentGoal: '', steps: [] }),
}));
