'use client';

import { useState, useEffect } from 'react';
import { useAgentStore } from '@/store/agentStore';
import { AgentTask, EmailDraft } from '@/types/agent';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Send, ChevronDown, ChevronUp, Mail, AlertCircle, Sparkles, Info, Edit2, X, Check } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export function ApprovalsPanel() {
  const [isApproving, setIsApproving] = useState(false);
  const [expandedEmails, setExpandedEmails] = useState<Record<string, boolean>>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { isRunning, setRunning, latestTask, setLatestTask } = useAgentStore();

  const toggleExpand = (to: string) => {
    setExpandedEmails(prev => ({ ...prev, [to]: !prev[to] }));
  };

  const startEdit = (index: number, currentTo: string) => {
    setEditingIndex(index);
    setEditValue(currentTo === 'research-needed@placeholder.com' ? '' : currentTo);
  };

  const handleSaveEdit = async (index: number) => {
    if (!latestTask) return;
    if (!editValue.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSaving(true);
    try {
      const newBdAgent = [...(latestTask.output?.bd_agent || [])];
      newBdAgent[index] = { ...newBdAgent[index], to: editValue };

      await axios.patch(`/api/agent-tasks/${latestTask.task_id}`, {
        output: { ...latestTask.output, bd_agent: newBdAgent }
      }, { withCredentials: true });

      toast.success('Recipient updated');
      setEditingIndex(null);
      
      // Update local state in store
      setLatestTask({
        ...latestTask,
        output: { ...latestTask.output, bd_agent: newBdAgent }
      });
    } catch (error) {
      console.error('[SAVE_EDIT_ERROR]', error);
      toast.error('Failed to update recipient');
    } finally {
      setIsSaving(false);
    }
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

  if (!latestTask || !(['approved', 'pending_approval', 'waiting_for_input', 'waiting_for_approval'] as string[]).includes(latestTask.status as string)) return null;

  const emails = latestTask.output?.bd_agent || [];
  const hasPlaceholders = emails.some(e => e.to === 'research-needed@placeholder.com');
  const readyCount = emails.filter(e => e.to !== 'research-needed@placeholder.com').length;

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
            {readyCount} Ready
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {emails.map((email, idx) => {
          const isPlaceholder = email.to === 'research-needed@placeholder.com';
          const isEditing = editingIndex === idx;

          return (
            <Card key={idx} className={cn(
              "bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80 transition-all overflow-hidden group",
              isPlaceholder && !isEditing && "border-amber-500/20 bg-amber-500/5"
            )}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className={cn(
                        "h-3.5 w-3.5",
                        isPlaceholder ? "text-amber-500" : "text-slate-500"
                      )} />
                      
                      {isPlaceholder ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input 
                            value={editingIndex === idx ? editValue : ''}
                            onChange={(e) => {
                              setEditingIndex(idx);
                              setEditValue(e.target.value);
                            }}
                            placeholder="Enter friend/investor email..."
                            className="h-9 bg-slate-950 border-amber-500/30 text-sm focus-visible:ring-amber-500/50"
                          />
                          <Button 
                            size="sm" 
                            className="bg-amber-600 hover:bg-amber-500 text-white h-9 px-4 font-bold shrink-0" 
                            onClick={() => {
                              setEditValue(editValue); // Ensure we use current value
                              handleSaveEdit(idx);
                            }} 
                            disabled={isSaving || (editingIndex === idx && !editValue)}
                          >
                            {isSaving && editingIndex === idx ? <Loader2 className="h-3 w-3 animate-spin" /> : "Set Email"}
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
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500" onClick={() => handleSaveEdit(idx)} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-4 w-4" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => setEditingIndex(null)}>
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
                            onClick={() => startEdit(idx, email.to)}
                            className="h-6 w-6 opacity-0 group-hover/to:opacity-100 transition-opacity"
                          >
                            <Edit2 className="h-3 w-3 text-slate-500" />
                          </Button>
                        </div>
                      )}
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
                  
                  <div className="flex flex-col gap-2 shrink-0">
                    {!isPlaceholder && (
                      <Button 
                        size="sm" 
                        className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 h-8 font-bold"
                        onClick={handleApproveAll} // Reusing the same logic for simplicity
                        disabled={isApproving}
                      >
                        <Send className="h-3 w-3 mr-1.5" />
                        Send Now
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleExpand(email.to)}
                      className="text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 h-8 px-2"
                    >
                      {expandedEmails[email.to] ? (
                        <>
                          <span className="text-[10px] mr-1">Hide</span>
                          <ChevronUp className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] mr-1">Preview</span>
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
      </div>

      {hasPlaceholders && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <p className="text-xs text-amber-400/80 italic">
            Some drafts need email addresses. Click the edit icon to provide one.
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
