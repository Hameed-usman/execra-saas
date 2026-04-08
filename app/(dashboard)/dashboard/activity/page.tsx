'use client';

import { useActivityFeed } from '@/hooks/useActivityFeed';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, Inbox } from 'lucide-react';

function getAgentColor(agentName: string) {
  if (agentName.toLowerCase().includes('bd')) return 'bg-blue-500';
  if (agentName.toLowerCase().includes('cfo')) return 'bg-green-500';
  return 'bg-slate-400';
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'running': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'pending_approval': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'approved': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'sent': return 'bg-teal-500/10 text-teal-500 border-teal-500/20';
    case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
}

export default function ActivityPage() {
  const { tasks, isLoading, error } = useActivityFeed();

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
        Failed to load activity history.
      </div>
    );
  }

  const displayTasks = tasks.slice(0, 20);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 font-syne mb-2">Activity History</h1>
        <p className="text-slate-400 text-sm">View all executed goals and agent actions.</p>
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-400 w-[200px]">Agent</TableHead>
              <TableHead className="text-slate-400">Goal / Request</TableHead>
              <TableHead className="text-slate-400 w-[150px]">Status</TableHead>
              <TableHead className="text-slate-400 w-[150px] text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full max-w-md" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : displayTasks.length === 0 ? (
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableCell colSpan={4} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Inbox className="h-10 w-10 text-slate-500 mb-3" />
                    <p className="text-slate-300 font-medium">No activity found</p>
                    <p className="text-sm text-slate-500">Goals executed by agents will appear here.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              displayTasks.map((task) => (
                <TableRow key={task.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-slate-400" />
                        </div>
                        <span className={`absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-slate-900 ${getAgentColor(task.agentName)}`} />
                      </div>
                      <span className="text-sm font-medium capitalize text-slate-200">
                        {task.agentName.replace('_', ' ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300 text-sm max-w-md truncate">
                    {task.goal}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(task.status)} uppercase text-[10px] tracking-wider font-semibold py-0.5`}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-400 text-sm whitespace-nowrap">
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    }).format(new Date(task.createdAt))}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
