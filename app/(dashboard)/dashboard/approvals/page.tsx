'use client';

import { useActivityFeed } from '@/hooks/useActivityFeed';
import { ApprovalCard } from '@/components/dashboard/ApprovalCard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function ApprovalsPage() {
  const { tasks, isLoading, error } = useActivityFeed();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingTasks = tasks.filter((task) => task.status === 'pending_approval');

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const response = await axios.patch(`/api/tasks/${id}`, { status });
      return response.data;
    },
    onMutate: (variables) => {
      setProcessingId(variables.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(`Task ${variables.status} successfully.`);
    },
    onError: () => {
      toast.error("Failed to update task status.");
    },
    onSettled: () => {
      setProcessingId(null);
    }
  });

  const handleApprove = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'approved' });
  };

  const handleReject = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'rejected' });
  };

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
        Failed to load pending approvals.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 font-syne mb-2">Pending Approvals</h1>
        <p className="text-slate-400 text-sm">Review drafted communications and proposed actions from your agents.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : pendingTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-lg font-medium text-slate-300">All caught up!</h3>
          <p className="text-sm text-slate-500 mt-1">No pending approvals at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingTasks.map((task) => (
            <ApprovalCard 
              key={task.id} 
              task={task} 
              onApprove={handleApprove} 
              onReject={handleReject}
              isProcessing={processingId === task.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
