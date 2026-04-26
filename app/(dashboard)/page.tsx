'use client';

import { GoalInput } from '@/components/dashboard/GoalInput';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { tasks } = useActivityFeed();
  
  const pendingCount = tasks?.filter((t) => (t.status as string) === 'pending_approval').length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {pendingCount > 0 && (
        <Link href="/approvals" className="block w-full">
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 flex items-center justify-between hover:bg-orange-500/20 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-400">Action Required</p>
                <p className="text-xs text-orange-500/80">You have {pendingCount} task{pendingCount !== 1 && 's'} waiting for your approval.</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-orange-500 opacity-70 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
          </div>
        </Link>
      )}

      {/* Goal Input Section */}
      <section>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100 font-syne mb-2">
            What do you want to achieve?
          </h1>
          <p className="text-slate-400">
            Tell your agents what to do. They will plan the steps and execute them.
          </p>
        </div>
        <GoalInput />
      </section>

      {/* Recent Activity Section */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-200">Recent Activity</h2>
          <Link href="/activity" className="text-sm text-emerald-500 hover:text-emerald-400 hover:underline">
            View all
          </Link>
        </div>
        <ActivityFeed />
      </section>
    </div>
  );
}
