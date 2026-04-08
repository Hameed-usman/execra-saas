'use client';

import { useActivityFeed } from '@/hooks/useActivityFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Bot, Inbox } from 'lucide-react';
import { Task } from '@prisma/client';

function getRelativeTime(dateString: Date) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  }
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'running': return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
    case 'pending_approval': return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
    case 'approved': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
    case 'rejected': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
    case 'sent': return 'bg-teal-500/10 text-teal-500 hover:bg-teal-500/20';
    case 'failed': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
    default: return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20';
  }
}

function getAgentColor(agentName: string) {
  if (agentName.toLowerCase().includes('bd')) return 'bg-blue-500';
  if (agentName.toLowerCase().includes('cfo')) return 'bg-green-500';
  return 'bg-slate-400';
}

function truncateString(str: string, num: number) {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + '...';
}

export function ActivityFeed() {
  const { tasks, isLoading, error } = useActivityFeed();

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
        Failed to load activity feed.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start space-x-4 p-4 rounded-lg bg-slate-900/50 border border-slate-800 animate-pulse">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const recentTasks = tasks.slice(0, 10);

  if (recentTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
        <Inbox className="h-12 w-12 text-slate-500 mb-4" />
        <h3 className="text-lg font-medium text-slate-300">No agent activity yet</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">Type a goal above to get started with your AI agents.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentTasks.map((task: Task) => (
        <div key={task.id} className="flex items-start space-x-4 p-4 rounded-lg bg-slate-900/50 border border-slate-800 transition-colors hover:bg-slate-900">
          <div className="mt-1 relative">
            <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
              <Bot className="h-5 w-5 text-slate-400" />
            </div>
            <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-slate-900 ${getAgentColor(task.agentName)}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1 gap-2">
              <p className="text-sm font-medium text-slate-200 capitalize truncate">
                {task.agentName.replace('_', ' ')}
              </p>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {getRelativeTime(task.createdAt)}
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-2 w-full break-words">
              {truncateString(task.goal, 60)}
            </p>
            <div className="flex items-center mt-2">
              <Badge variant="secondary" className={`${getStatusColor(task.status)} uppercase text-[10px] tracking-wider border-none px-2 py-0.5 font-semibold`}>
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
