'use client';

import { useEffect, useState } from 'react';
import { AgentTask } from '@/types/agent';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, Inbox } from 'lucide-react';
import axios from 'axios';

function getStatusStyle(status: string) {
  switch (status) {
    case 'running':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'approved':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'waiting_for_input':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'sent':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'partial':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'failed':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export default function ActivityPage() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get('/api/agent-tasks', { withCredentials: true })
      .then((r) => setTasks(r.data))
      .catch(() => setError('Failed to load activity history.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 font-syne mb-1">
          Activity History
        </h1>
        <p className="text-slate-400 text-sm">
          All agent pipeline runs for your workspace.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left">
              <th className="text-slate-500 font-medium px-4 py-3 w-48">Agent</th>
              <th className="text-slate-500 font-medium px-4 py-3">Goal</th>
              <th className="text-slate-500 font-medium px-4 py-3 w-40">Status</th>
              <th className="text-slate-500 font-medium px-4 py-3 w-36 text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-800/60">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-full max-w-md" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                </tr>
              ))
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <div className="flex flex-col items-center">
                    <Inbox className="h-10 w-10 text-slate-600 mb-3" />
                    <p className="text-slate-400 font-medium">No activity yet</p>
                    <p className="text-slate-600 text-xs mt-1">
                      Submit a goal on the Dashboard to see pipeline runs here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.slice(0, 30).map((task) => (
                <tr
                  key={task.task_id}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                        <Bot className="h-3.5 w-3.5 text-violet-400" />
                      </div>
                      <span className="text-slate-300 capitalize font-medium">
                        {task.agentType.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 max-w-xs truncate">
                    {task.goal}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={`${getStatusStyle(task.status)} text-[10px] uppercase tracking-wider font-semibold py-0.5`}
                    >
                      {task.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 text-xs whitespace-nowrap">
                    {formatDate(task.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
