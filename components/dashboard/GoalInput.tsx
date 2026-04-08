'use client';

import { useState } from 'react';
import { useAgentStore } from '@/store/agentStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function GoalInput() {
  const [localGoal, setLocalGoal] = useState('');
  const { isRunning, setRunning, setCurrentGoal } = useAgentStore();

  const handleExecute = async () => {
    if (!localGoal.trim()) {
      toast.error("Please enter a goal first.");
      return;
    }

    setCurrentGoal(localGoal);
    setRunning(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setRunning(false);
    toast.success("Goal received. Agents will run in Phase 5.");
    setLocalGoal('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 mb-8">
      <Textarea
        value={localGoal}
        onChange={(e) => setLocalGoal(e.target.value)}
        placeholder="Type your goal... e.g. Find 10 fintech investors in Dubai and draft personalized introduction emails for each one."
        disabled={isRunning}
        className="min-h-[120px] bg-slate-900/50 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 text-lg resize-none"
      />
      <div className="flex justify-end">
        <Button 
          onClick={handleExecute} 
          disabled={isRunning || !localGoal.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[150px]"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Agents Running...
            </>
          ) : (
            'Execute Goal'
          )}
        </Button>
      </div>
    </div>
  );
}
