'use client';

import { useState, useEffect } from 'react';
import { useAgentStore } from '@/store/agentStore';
import { AgentTask, EmailDraft } from '@/types/agent';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Send, ChevronDown, ChevronUp, Mail, AlertCircle, Sparkles, Info } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

export function ApprovalsPanel() {
  const [latestTask, setLatestTask] = useState<AgentTask | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [expandedEmails, setExpandedEmails] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { setRunning } = useAgentStore();

  const fetchLatestTask = async () => {
    try {
      const response = await axios.get('/api/agent-tasks', { withCredentials: true });
      const tasks = response.data as AgentTask[];
      if (tasks.length > 0 && tasks[0].status === 'approved') {
        setLatestTask(tasks[0]);
      } else {
        setLatestTask(null);
      }
    } catch (error) {
      console.error('[FETCH_APPROVALS_ERROR]', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestTask();
    const interval = setInterval(fetchLatestTask, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (to: string) => {
    setExpandedEmails(prev => ({ ...prev, [to]: !prev[to] }));
  };

  const handleApproveAll = async () => {
    if (!latestTask) return;
    setIsApproving(true);

    try {
      const response = await axios.patch(`/api/agent-tasks/${latestTask.task_id}/approve`, {}, { withCredentials: true });
      const { sent, failed } = response.data;

      if (sent > 0 && failed === 0) {
        toast.success(`${sent} emails sent successfully`);
        setLatestTask(null); // Hide panel on success
      } else if (sent > 0 && failed > 0) {
        toast.warning(`${sent} sent, ${failed} failed`);
      } else if (failed > 0) {
        toast.error('Send failed — check email configuration');
      }
    } catch (error: any) {
      console.error('[APPROVE_ERROR]', error);
      toast.error('Connection failed — try again');
    } finally {
      setIsApproving(false);
      setRunning(false);
    }
  };

  if (isLoading || !latestTask || latestTask.status !== 'approved') return null;

  const emails = latestTask.output?.bd_agent || [];
  const realEmails = emails.filter(e => e.to !== 'research-needed@placeholder.com');
  const placeholderCount = emails.length - realEmails.length;

  if (emails.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-slate-500 mx-auto opacity-50" />
        <p className="text-slate-300">No emails were drafted — try running the agent again</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-100 font-syne">Review Drafted Emails</h2>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            {realEmails.length} Ready
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {realEmails.map((email, idx) => (
          <Card key={idx} className="bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80 transition-all overflow-hidden group">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-sm font-bold text-slate-200 truncate">{email.to}</span>
                  </div>
                  <h4 className="text-xs font-medium text-slate-400 line-clamp-1 italic px-2 border-l border-violet-500/30">
                    Subject: {email.subject}
                  </h4>
                  
                  {expandedEmails[email.to] ? (
                    <div className="mt-4 p-4 rounded-lg bg-slate-950/80 border border-slate-800/50 max-h-[200px] overflow-y-auto custom-scrollbar anim-in slide-in-from-top-2 duration-300">
                      <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">{email.body}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-1 px-2 border-l border-slate-800">
                      {email.body.substring(0, 100)}...
                    </p>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleExpand(email.to)}
                  className="ml-4 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 h-8 px-2"
                >
                  {expandedEmails[email.to] ? (
                    <>
                      <span className="text-[10px] mr-1">Hide</span>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] mr-1">View Full Email</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {placeholderCount > 0 && (
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 flex items-center gap-3">
          <Info className="h-4 w-4 text-blue-500" />
          <p className="text-xs text-blue-400/80 italic">
            {placeholderCount} emails need manual research — investor addresses not found
          </p>
        </div>
      )}

      <div className="pt-4 flex justify-end sticky bottom-0 bg-gradient-to-t from-[var(--bg-deep)] to-transparent py-4">
        <Button 
          onClick={handleApproveAll}
          disabled={isApproving}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-10 py-6 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all group"
        >
          {isApproving ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Send className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
          )}
          Approve & Send All
        </Button>
      </div>
    </div>
  );
}
