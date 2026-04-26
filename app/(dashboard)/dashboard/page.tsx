'use client';

import { GoalInput } from '@/components/dashboard/GoalInput';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { AgentGoalInput } from '@/components/dashboard/AgentGoalInput';
import { AgentActivityFeed } from '@/components/dashboard/AgentActivityFeed';
import { ApprovalsPanel } from '@/components/dashboard/ApprovalsPanel';
import { OfflineBanner } from '@/components/dashboard/OfflineBanner';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { AlertCircle, ChevronRight, Zap } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { tasks } = useActivityFeed();
  const [showOffline, setShowOffline] = useState(false);
  
  const pendingCount = tasks?.filter((t) => (t.status as string) === 'pending_approval').length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {showOffline && <OfflineBanner onDismiss={() => setShowOffline(false)} />}

      {pendingCount > 0 && (
        <Link href="/dashboard/approvals" className="block w-full">
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

      {/* AI AGENT SECTION (NEW) */}
      <section className="space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold uppercase tracking-wider mb-4">
            <Zap className="h-3 w-3" fill="currentColor" />
            AI Agent Pipeline Active
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white font-syne mb-3">
            Startup Strategy Execution
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Your agents are ready. Describe your goal, and they will search, draft, and execute for you.
          </p>
        </div>
        
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
          <AgentGoalInput />
        </div>

        <AgentActivityFeed />
        
        <ApprovalsPanel />
      </section>

      <div className="h-px bg-slate-800/50 w-full my-8" />

      {/* LEGACY / EXISTING SECTIONS */}
      {/* Goal Input Section */}
      <section className="opacity-80">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-200 font-syne mb-2">
            Manual Task Creation
          </h2>
          <p className="text-slate-500 text-sm">
            Old school task management. Use these for non-AI assisted steps.
          </p>
        </div>
        <GoalInput />
      </section>

      {/* Recent Activity Section */}
      <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 opacity-80">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-200">Recent Manual Activity</h2>
          <Link href="/dashboard/activity" className="text-sm text-emerald-500 hover:text-emerald-400 hover:underline">
            View all
          </Link>
        </div>
        <ActivityFeed />
      </section>
    </div>
  );
}
