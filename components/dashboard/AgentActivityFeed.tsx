'use client';

import { useState, useEffect, useRef } from 'react';
import { useAgentStore } from '@/store/agentStore';
import { AgentTask } from '@/types/agent';
import {
  Loader2, CheckCircle2, AlertTriangle, XCircle,
  HelpCircle, Inbox, ChevronDown, ChevronUp,
} from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

/** Statuses that mean the pipeline has fully stopped */
const TERMINAL_STATUSES = new Set([
  'approved', 'failed', 'sent', 'partial', 'waiting_for_input',
]);

export function AgentActivityFeed() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logsExpanded, setLogsExpanded] = useState(false);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isRunning,
    setRunning,   // Only used here to set FALSE when terminal status detected
    latestTask,
    setLatestTask,
    setSteps,
  } = useAgentStore();

  // ── Fetch tasks from backend ─────────────────────────────────────────────────
  // IMPORTANT: This function NEVER calls setRunning(true).
  // isRunning is ONLY set to true by AgentGoalInput when the user clicks Execute.
  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/agent-tasks', { withCredentials: true });
      const fetched = response.data as AgentTask[];
      setTasks(fetched);

      if (fetched.length > 0) {
        const latest = fetched[0];
        setLatestTask(latest);

        // Update real-time step log from the backend
        const stepLog: string[] = latest.output?.step_log ?? [];
        setSteps(stepLog);

        // Auto-resume polling if the latest task is still active
        if (latest.status === 'running' || latest.status === 'pending') {
          setRunning(true);
        } else if (TERMINAL_STATUSES.has(latest.status)) {
          // If the latest task has reached a terminal state, ensure spinner is off
          setRunning(false);
          stopPolling();
        }
      } else {
        // No tasks at all — ensure spinner is off
        setLatestTask(null);
        setRunning(false);
        stopPolling();
      }
    } catch (err) {
      console.error('[FETCH_AGENT_TASKS_ERROR]', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Polling management ───────────────────────────────────────────────────────
  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const scheduleNextPoll = () => {
    stopPolling();
    pollTimerRef.current = setTimeout(async () => {
      // Read isRunning fresh from the store before each poll
      const { isRunning: stillRunning } = useAgentStore.getState();
      if (stillRunning) {
        await fetchTasks();
        scheduleNextPoll();
      }
    }, 3000);
  };

  // Initial fetch on mount — shows existing tasks, does NOT start the spinner
  useEffect(() => {
    fetchTasks();
    return () => stopPolling();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling effect — only starts when isRunning transitions to true
  useEffect(() => {
    if (isRunning) {
      fetchTasks();     // immediate fetch when run starts
      scheduleNextPoll();
    } else {
      stopPolling();
    }
    return () => stopPolling();
  }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Status display ────────────────────────────────────────────────────────────
  const renderStatusBadge = (task: AgentTask) => {
    switch (task.status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 animate-pulse">
            <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
            <span className="text-sm text-slate-400">Queued...</span>
          </div>
        );
      case 'running':
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 text-violet-400 animate-spin" />
            <span className="text-sm text-violet-300 font-medium">Running</span>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-300 font-medium">
              Ready for review
            </span>
          </div>
        );
      case 'waiting_for_input':
        return (
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-amber-300 font-medium">
              Input required
            </span>
          </div>
        );
      case 'retry':
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />
            <span className="text-sm text-amber-300 font-medium">Refining...</span>
          </div>
        );
      case 'sent':
        return (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-blue-300 font-medium">Sent</span>
          </div>
        );
      case 'partial':
        return (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-amber-300 font-medium">
              Partially sent
            </span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-400" />
            <span className="text-sm text-red-300 font-medium">Failed</span>
          </div>
        );
      default:
        return null;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  // Initial load showing a placeholder instead of a blocking spinner
  if (isLoading && tasks.length === 0) {
    return (
      <div className="bg-slate-900/20 border border-slate-800/50 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-3">
        <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
        <p className="text-xs text-slate-600">Syncing with agents...</p>
      </div>
    );
  }

  if (!latestTask && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
        <Inbox className="h-12 w-12 text-slate-600 mb-4" />
        <h3 className="text-base font-medium text-slate-400">No tasks yet</h3>
        <p className="text-sm text-slate-600 mt-1 max-w-sm">
          Enter a goal above and click Execute to start the agent pipeline.
        </p>
      </div>
    );
  }

  const stepLog: string[] = latestTask?.output?.step_log ?? [];
  const userPrompt: string | undefined = (latestTask?.output as any)?.user_prompt;

  return (
    <div className="space-y-3">
      {/* Current task card */}
      {latestTask && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-violet-600 rounded-l-xl" />

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Current Goal
              </p>
              <p className="text-sm text-slate-200 font-medium line-clamp-2">
                {latestTask.goal}
              </p>
            </div>
            <div className="shrink-0 pt-0.5">
              {renderStatusBadge(latestTask)}
            </div>
          </div>

          {/* Human-in-the-loop prompt */}
          {latestTask.status === 'waiting_for_input' && userPrompt && (
            <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-300 leading-relaxed">
                <span className="font-bold">⚠️ Action needed: </span>
                {userPrompt}
              </p>
            </div>
          )}

          {/* Real-time step log */}
          {stepLog.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setLogsExpanded((v) => !v)}
                className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-slate-300 transition-colors mb-2"
              >
                {logsExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3" /> Hide activity log
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" /> Show activity log ({stepLog.length} steps)
                  </>
                )}
              </button>

              {logsExpanded && (
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {stepLog.map((entry, i) => (
                    <p
                      key={i}
                      className={cn(
                        'text-[11px] leading-relaxed',
                        i === stepLog.length - 1
                          ? 'text-slate-300'
                          : 'text-slate-500',
                      )}
                    >
                      {entry}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
