'use client';

import { useState, useEffect, useRef } from 'react';
import { useAgentStore } from '@/store/agentStore';
import { AgentTask } from '@/types/agent';
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Info, Inbox } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

const STATUS_TEXT = [
  "Planner mapping your goal...",
  "BD Agent searching investors...",
  "Critic reviewing email quality..."
];

export function AgentActivityFeed() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { isRunning, setRunning, latestTask, setLatestTask } = useAgentStore();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/agent-tasks', { withCredentials: true });
      const fetchedTasks = response.data as AgentTask[];
      setTasks(fetchedTasks);

      if (fetchedTasks.length > 0) {
        const latest = fetchedTasks[0];
        setLatestTask(latest);

        // Update global running state based on latest task
        if (latest.status === 'pending' || latest.status === 'running') {
          // BUG 1 FIX: Only trigger spinner if task is NOT stale (less than 10 mins old)
          const createdTime = new Date(latest.createdAt).getTime();
          const now = new Date().getTime();
          const diffMins = (now - createdTime) / (1000 * 60);
          
          if (diffMins < 10) {
            setRunning(true);
          } else {
            console.log("[EXECRA] Latest task is stale (>10m), not auto-running.");
            setRunning(false);
          }
        } else {
          setRunning(false);
        }
      } else {
        setRunning(false);
        setLatestTask(null);
      }
    } catch (error) {
      console.error('[FETCH_AGENT_TASKS_ERROR]', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, []);

  // Robust polling logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const poll = async () => {
      if (!isRunning) return;
      
      await fetchTasks();
      
      // Schedule next poll only if still running
      if (isRunning) {
        timeoutId = setTimeout(poll, 3000);
      }
    };

    if (isRunning) {
      poll();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isRunning]);

  // Status text cycling logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (latestTask?.status === 'running') {
      interval = setInterval(() => {
        setStatusIndex((prev) => (prev + 1) % STATUS_TEXT.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [latestTask?.status]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        <p className="text-sm text-slate-500">Loading activity...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
        <Inbox className="h-12 w-12 text-slate-500 mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-slate-300">No tasks yet</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">Enter a goal above to get started with your AI agents.</p>
      </div>
    );
  }

  const renderStatus = (task: AgentTask) => {
    switch (task.status) {
      case 'pending':
        return (
          <div className="flex items-center gap-3 animate-pulse">
            <Loader2 className="h-5 w-5 text-slate-500 animate-spin" />
            <span className="text-sm text-slate-400 font-medium">Preparing your request...</span>
          </div>
        );
      case 'running':
        return (
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
            <span className="text-sm text-violet-100 font-medium transition-all duration-500">
              {STATUS_TEXT[statusIndex]}
            </span>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span className="text-sm text-emerald-400 font-medium">Emails ready for review</span>
          </div>
        );
      case 'retry':
        return (
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
            <span className="text-sm text-amber-400 font-medium">Refining email quality...</span>
          </div>
        );
      case 'sent':
        return (
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-blue-400 font-medium">All emails sent successfully</span>
          </div>
        );
      case 'partial':
        return (
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span className="text-sm text-amber-400 font-medium">Some emails sent — check results below</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm text-red-400 font-medium">Agent encountered an error — try again</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-violet-600" />
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current AI Goal</h3>
            <p className="text-sm text-slate-200 font-medium line-clamp-1 italic">
              "{latestTask?.critic_feedback ? "Rethinking..." : ""} {latestTask?.goal ?? '...'}..."
            </p>
          </div>
          <div className="flex-shrink-0">
            {latestTask && renderStatus(latestTask)}
          </div>
        </div>
      </div>
    </div>
  );
}
