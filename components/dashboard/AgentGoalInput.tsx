'use client';

import { useState } from 'react';
import { useAgentStore } from '@/store/agentStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

export function AgentGoalInput() {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isRunning, setRunning, setCurrentRunId } = useAgentStore();

  const charCount = goal.length;
  const isOverLimit = charCount > 500;
  const isNearLimit = charCount > 450;

  const handleSubmit = async () => {
    if (!goal.trim() || isOverLimit || isRunning) return;

    setIsLoading(true);
    try {
      const response = await axios.post('/api/agents/run', { goal }, { withCredentials: true });
      
      if (response.data.task_id) {
        setCurrentRunId(response.data.task_id);
        setRunning(true);
        setGoal('');
        toast.success('Agent started successfully!');
      }
    } catch (error: any) {
      console.error('[AGENT_RUN_ERROR]', error);
      if (error.response?.data?.code === 'AGENT_OFFLINE') {
        // Handled by global banner, but we can show a specific message
        toast.error('Agent service is offline. Please wait or try again.');
      } else {
        toast.error('Something went wrong — try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <Textarea
          placeholder="e.g. Find 5 fintech investors in the UAE who back early-stage B2B SaaS"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          disabled={isRunning || isLoading}
          className={cn(
            "min-h-[120px] bg-slate-900/40 border-slate-800 focus:border-violet-500/50 transition-all text-slate-100 placeholder:text-slate-500 resize-none rounded-xl p-4 pr-12",
            isOverLimit && "border-red-500/50 focus:border-red-500/50"
          )}
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          <span className={cn(
            "text-[10px] font-medium transition-colors",
            isOverLimit ? "text-red-500" : isNearLimit ? "text-amber-500" : "text-slate-500"
          )}>
            {500 - charCount} characters remaining
          </span>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={isRunning || isLoading || charCount === 0 || isOverLimit}
          className="bg-gradient-to-r from-violet-600 to-teal-600 hover:from-violet-500 hover:to-teal-500 text-white font-semibold px-8 py-6 rounded-xl shadow-[0_0_20px_rgba(97,75,255,0.2)] transition-all transform active:scale-[0.98] group relative min-w-[200px]"
          title={isRunning ? "Task in progress" : ""}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Send className="h-5 w-5 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          )}
          {isRunning ? "Task in progress" : "Execute AI Strategy"}
        </Button>
      </div>
    </div>
  );
}
