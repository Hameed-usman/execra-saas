'use client';

import { useState, useEffect } from 'react';
import { AgentTask, EmailDraft } from '@/types/agent';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Mail, Sparkles, Send, Info, ChevronDown, ChevronUp, Inbox, Edit2, X, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function ApprovalsPage() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedEmails, setExpandedEmails] = useState<Record<string, boolean>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/agent-tasks', { withCredentials: true });
      const fetchedTasks = response.data as AgentTask[];
      // Filter for tasks that need approval
      const approvalTasks = fetchedTasks.filter(t => 
        (t.status as string) === 'approved' || (t.status as string) === 'pending_approval' || (t.status as string) === 'waiting_for_approval'
      );
      setTasks(approvalTasks);
    } catch (error) {
      console.error('[FETCH_APPROVALS_ERROR]', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleExpand = (emailKey: string) => {
    setExpandedEmails(prev => ({ ...prev, [emailKey]: !prev[emailKey] }));
  };

  const startEdit = (emailKey: string, currentTo: string) => {
    setEditingKey(emailKey);
    setEditValue(currentTo === 'research-needed@placeholder.com' ? '' : currentTo);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const handleSaveEdit = async (taskId: string, emailIndex: number) => {
    if (!editValue.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSaving(true);
    try {
      const task = tasks.find(t => t.task_id === taskId);
      if (!task || !task.output?.bd_agent) return;

      const newBdAgent = [...task.output.bd_agent];
      newBdAgent[emailIndex] = { ...newBdAgent[emailIndex], to: editValue };

      await axios.patch(`/api/agent-tasks/${taskId}`, {
        output: { ...task.output, bd_agent: newBdAgent }
      }, { withCredentials: true });

      toast.success('Recipient updated');
      setEditingKey(null);
      fetchTasks();
    } catch (error) {
      console.error('[SAVE_EDIT_ERROR]', error);
      toast.error('Failed to update recipient');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async (taskId: string) => {
    setProcessingId(taskId);
    try {
      const response = await axios.patch(`/api/agent-tasks/${taskId}/approve`, {}, { withCredentials: true });
      const { sent, failed } = response.data;
      
      if (sent > 0 && failed === 0) {
        toast.success(`${sent} emails sent successfully`);
      } else if (sent > 0 && failed > 0) {
        toast.warning(`${sent} sent, ${failed} failed`);
      } else if (failed > 0) {
        toast.error('Send failed — check email configuration');
      } else {
        toast.info('No emails were sent (might be placeholders only)');
      }
      
      fetchTasks(); // Refresh list after action
    } catch (error: any) {
      console.error('[APPROVE_ERROR]', error);
      toast.error('Connection failed — try again');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 font-syne mb-2">Approvals Queue</h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Review and send communication sequences drafted by your AI agents. 
            All drafts are validated for quality before appearing here.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800">
          <Sparkles className="h-3 w-3 text-violet-400" />
          <span>{tasks.length} pending batches</span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-xl font-medium text-slate-200">Zero Pending Drafts</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            Your approval queue is empty. New drafts will appear here as soon as the agents finish their research.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {tasks.map((task) => {
            const emails = task.output?.bd_agent || [];
            // Show all emails now, so they can be edited
            const hasPlaceholders = emails.some(e => e.to === 'research-needed@placeholder.com');

            return (
              <div key={task.task_id} className="space-y-6 relative">
                {/* Task Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm sticky top-0 z-10 shadow-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/20 px-2 py-0">
                        {task.agentType.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-[10px] text-slate-500 font-mono">{task.task_id.substring(0, 8)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-100 italic">"{task.goal}"</h3>
                  </div>
                  
                  <Button 
                    onClick={() => handleApprove(task.task_id)}
                    disabled={processingId === task.task_id}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 px-6 rounded-xl shadow-lg transition-all group shrink-0"
                  >
                    {processingId === task.task_id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    )}
                    Approve & Send All
                  </Button>
                </div>

                {/* Email Cards */}
                <div className="grid grid-cols-1 gap-4 pl-4 border-l-2 border-slate-800">
                  {emails.map((email, idx) => {
                    const emailKey = `${task.task_id}-${idx}`;
                    const isPlaceholder = email.to === 'research-needed@placeholder.com';
                    const isEditing = editingKey === emailKey;

                    return (
                      <Card key={idx} className={cn(
                        "bg-slate-900/30 border-slate-800/50 hover:border-slate-700/50 transition-all overflow-hidden",
                        isPlaceholder && !isEditing && "border-amber-500/20 bg-amber-500/5"
                      )}>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2 flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                                  isPlaceholder ? "bg-amber-500/20" : "bg-slate-800"
                                )}>
                                  <Mail className={cn(
                                    "h-3.5 w-3.5",
                                    isPlaceholder ? "text-amber-500" : "text-slate-400"
                                  )} />
                                </div>
                                
                                {isPlaceholder ? (
                                  <div className="flex items-center gap-2 flex-1">
                                    <Input 
                                      value={editingKey === emailKey ? editValue : ''}
                                      onChange={(e) => {
                                        setEditingKey(emailKey);
                                        setEditValue(e.target.value);
                                      }}
                                      placeholder="Enter investor/friend email..."
                                      className="h-9 bg-slate-950 border-amber-500/30 text-sm focus-visible:ring-amber-500/50"
                                    />
                                    <Button 
                                      size="sm" 
                                      className="bg-amber-600 hover:bg-amber-500 text-white h-9 px-4 font-bold shrink-0 shadow-lg" 
                                      onClick={() => handleSaveEdit(task.task_id, idx)} 
                                      disabled={isSaving}
                                    >
                                      {isSaving && editingKey === emailKey ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save Recipient"}
                                    </Button>
                                  </div>
                                ) : isEditing ? (
                                  <div className="flex items-center gap-2 flex-1">
                                    <Input 
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      placeholder="Enter investor email..."
                                      className="h-8 bg-slate-950 border-slate-700 text-sm"
                                      autoFocus
                                    />
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500" onClick={() => handleSaveEdit(task.task_id, idx)} disabled={isSaving}>
                                      {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-4 w-4" />}
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={cancelEdit}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 group/to overflow-hidden">
                                    <span className="text-sm font-bold truncate text-slate-200">
                                      {email.to}
                                    </span>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => startEdit(emailKey, email.to)}
                                      className="h-6 w-6 opacity-0 group-hover/to:opacity-100 transition-opacity"
                                    >
                                      <Edit2 className="h-3 w-3 text-slate-500" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                              <h4 className="text-xs font-medium text-slate-400 line-clamp-1 italic px-2 border-l border-violet-500/30">
                                {email.subject}
                              </h4>
                              
                              {expandedEmails[emailKey] ? (
                                <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800/50 max-h-[300px] overflow-y-auto custom-scrollbar anim-in slide-in-from-top-2 duration-300">
                                  <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">{email.body}</p>
                                </div>
                              ) : (
                                <p className="mt-2 text-xs text-slate-500 line-clamp-1 px-2 border-l border-slate-800">
                                  {email.body.substring(0, 120)}...
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-2 shrink-0">
                              {!isPlaceholder && (
                                <Button 
                                  size="sm" 
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white h-9 px-4 font-bold shadow-lg"
                                  onClick={() => handleApprove(task.task_id)}
                                  disabled={processingId === task.task_id}
                                >
                                  <Send className="h-3.5 w-3.5 mr-1.5" />
                                  Send Now
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => toggleExpand(emailKey)}
                                className="text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 h-8 px-3"
                              >
                                {expandedEmails[emailKey] ? (
                                  <>
                                    <span className="text-[10px] mr-1">Hide Draft</span>
                                    <ChevronUp className="h-3.5 w-3.5" />
                                  </>
                                ) : (
                                  <>
                                    <span className="text-[10px] mr-1">View Draft</span>
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {hasPlaceholders && (
                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                      <p className="text-xs text-amber-400/80 italic">
                        Some drafts need email addresses. Click the edit icon next to "Needs Email Address" to provide one.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
