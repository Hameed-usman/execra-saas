'use client';

import { useAgentStore } from '@/store/agentStore';
import { ApprovalsPanel } from '@/components/dashboard/ApprovalsPanel';
import { CheckCircle2, Inbox } from 'lucide-react';

export default function ApprovalsPage() {
  const { latestTask } = useAgentStore();

  const showableStatuses = new Set(['approved', 'waiting_for_input', 'sent', 'partial']);
  const hasTask = latestTask && showableStatuses.has(latestTask.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100 font-syne mb-1">
          Approvals
        </h1>
        <p className="text-slate-400 text-sm">
          Review and send AI-drafted emails. Emails are only sent after your explicit approval.
        </p>
      </div>

      {hasTask ? (
        <ApprovalsPanel />
      ) : (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            {latestTask ? (
              <Inbox className="h-6 w-6 text-slate-500" />
            ) : (
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            )}
          </div>
          <h3 className="text-lg font-medium text-slate-300">
            {latestTask ? 'Pipeline still running…' : 'Nothing to approve yet'}
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            {latestTask
              ? 'Check back once the agent finishes drafting emails.'
              : 'Submit a goal on the Dashboard to start the agent pipeline.'}
          </p>
        </div>
      )}
    </div>
  );
}
