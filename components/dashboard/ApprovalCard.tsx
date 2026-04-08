'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Check, X, Mail } from 'lucide-react';
import { Task } from '@prisma/client';

interface ApprovalCardProps {
  task: Task;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing?: boolean;
}

function truncateString(str: string, num: number) {
  if (!str) return '';
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + '...';
}

function getRelativeTime(dateString: Date) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
}

function getAgentColor(agentName: string) {
  if (agentName.toLowerCase().includes('bd')) return 'bg-blue-500';
  if (agentName.toLowerCase().includes('cfo')) return 'bg-green-500';
  return 'bg-slate-400';
}

export function ApprovalCard({ task, onApprove, onReject, isProcessing }: ApprovalCardProps) {
  return (
    <Card className="bg-slate-900 border-slate-800 overflow-hidden text-slate-200">
      <CardHeader className="bg-slate-900 border-b border-slate-800/50 pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                <Bot className="h-5 w-5 text-slate-400" />
              </div>
              <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-slate-900 ${getAgentColor(task.agentName)}`} />
            </div>
            <div>
              <p className="text-sm font-medium capitalize text-slate-100">{task.agentName.replace('_', ' ')}</p>
              <p className="text-xs text-slate-500">{getRelativeTime(task.createdAt)}</p>
            </div>
          </div>
          <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-none">
            Pending Approval
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Goal / Request</p>
          <p className="text-sm text-slate-300 italic">"{task.goal}"</p>
        </div>

        {(task.toEmail || task.subject || task.body) && (
          <div className="bg-slate-950 rounded-md border border-slate-800 p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-slate-500" />
              <span className="text-slate-500 w-16">To:</span>
              <span className="text-slate-300 font-medium truncate">{task.toEmail || '(Not specified)'}</span>
            </div>
            <div className="flex items-start gap-2 text-sm border-t border-slate-800/50 pt-2">
              <span className="text-slate-500 w-16 flex-shrink-0 mt-0.5">Subject:</span>
              <span className="text-slate-200 font-medium">{task.subject || '(No subject)'}</span>
            </div>
            <div className="flex items-start gap-2 text-sm border-t border-slate-800/50 pt-2">
              <span className="text-slate-500 w-16 flex-shrink-0">Body:</span>
              <span className="text-slate-400 whitespace-pre-wrap">{truncateString(task.body || '', 200)}</span>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end gap-3 pt-2 bg-slate-900 border-t border-slate-800/50">
        <Button 
          variant="outline" 
          onClick={() => onReject(task.id)}
          disabled={isProcessing}
          className="border-red-900/50 text-red-500 hover:bg-red-500/10 hover:text-red-400"
        >
          <X className="mr-2 h-4 w-4" />
          Reject
        </Button>
        <Button 
          onClick={() => onApprove(task.id)}
          disabled={isProcessing}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          <Check className="mr-2 h-4 w-4" />
          Approve & Send
        </Button>
      </CardFooter>
    </Card>
  );
}
