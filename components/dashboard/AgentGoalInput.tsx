'use client';

import { useState } from 'react';
import { useAgentStore } from '@/store/agentStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Send, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

export function AgentGoalInput() {
  const [goal, setGoal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isRunning, setRunning, setCurrentRunId, setCurrentGoal, resetRun } =
    useAgentStore();

  const charCount = goal.length;
  const isOverLimit = charCount > MAX_LENGTH;
  const isTooShort = charCount > 0 && charCount < MIN_LENGTH;
  const isNearLimit = charCount > 450;

  const canSubmit =
    !isRunning &&
    !isSubmitting &&
    charCount >= MIN_LENGTH &&
    !isOverLimit;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        '/api/agents/run',
        { goal },
        { withCredentials: true },
      );

      const data = response.data;

      if (data?.task_id) {
        // ── This is the ONLY place isRunning is set to true ──────────────────
        setCurrentRunId(data.task_id);
        setCurrentGoal(goal);
        setRunning(true);
        setGoal('');
        toast.success('Pipeline started — watch the activity feed below.');
      } else {
        toast.error('Unexpected response from server. Try again.');
      }
    } catch (error: any) {
      const status = error.response?.status;
      const detail = error.response?.data?.detail;

      if (status === 409) {
        // Execution guard triggered — another run is in progress
        const activeTaskId = detail?.task_id;
        toast.error(
          activeTaskId
            ? `A run is already in progress (${detail.status}). Wait for it to finish.`
            : 'An agent run is already in progress. Please wait.',
          { duration: 6000 },
        );
        // Sync store with the active task so the UI shows its status
        if (activeTaskId) {
          setCurrentRunId(activeTaskId);
          setRunning(true);
        }
      } else if (status === 503 || error.code === 'AGENT_OFFLINE') {
        toast.error('AI backend is offline. Start it with: uvicorn app.main:app --port 8000', {
          duration: 8000,
        });
      } else if (status === 422) {
        toast.error('Goal must be between 10 and 500 characters.');
      } else {
        console.error('[AGENT_RUN_ERROR]', error);
        toast.error('Something went wrong — please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <Textarea
          id="goal-input"
          placeholder="e.g. Find 5 fintech investors in the UK who back early-stage B2B SaaS and send them an intro email"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning || isSubmitting}
          className={cn(
            'min-h-[120px] bg-slate-900/40 border-slate-700 focus:border-violet-500/60',
            'transition-all text-slate-100 placeholder:text-slate-600',
            'resize-none rounded-xl p-4 text-sm leading-relaxed',
            isOverLimit && 'border-red-500/60 focus:border-red-500/60',
            isTooShort && 'border-amber-500/40',
          )}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {isTooShort && (
            <span className="text-[10px] text-amber-500">
              {MIN_LENGTH - charCount} more chars needed
            </span>
          )}
          <span
            className={cn(
              'text-[10px] font-medium transition-colors',
              isOverLimit
                ? 'text-red-400'
                : isNearLimit
                ? 'text-amber-400'
                : 'text-slate-600',
            )}
          >
            {MAX_LENGTH - charCount}
          </span>
        </div>
      </div>

      {isRunning && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/5 border border-violet-500/20">
          <AlertCircle className="h-3.5 w-3.5 text-violet-400 shrink-0" />
          <p className="text-xs text-violet-300">
            A pipeline is running. New submissions are blocked until it finishes.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-600">
          Tip: ⌘+Enter to submit
        </p>

        <div className="flex gap-2">
          {isRunning && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => resetRun()}
              className="text-slate-500 hover:text-slate-300 text-xs h-9"
            >
              Reset
            </Button>
          )}

          <Button
            id="execute-agent-btn"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'bg-gradient-to-r from-violet-600 to-indigo-600',
              'hover:from-violet-500 hover:to-indigo-500',
              'text-white font-semibold px-8 h-11 rounded-xl',
              'shadow-[0_0_20px_rgba(124,58,237,0.25)]',
              'transition-all active:scale-[0.98] group min-w-[180px]',
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Starting...
              </>
            ) : isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Running...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                Execute
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
