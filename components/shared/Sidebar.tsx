'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Activity, CheckSquare, Settings, CreditCard, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAgentStore } from '@/store/agentStore';
import { useActivityFeed } from '@/hooks/useActivityFeed';

interface SidebarProps {
  user?: {
    name?: string | null;
  };
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Activity', href: '/dashboard/activity', icon: Activity },
  { name: 'Approvals', href: '/dashboard/approvals', icon: CheckSquare },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { tasks } = useActivityFeed();
  const pendingCount = tasks?.filter((t) => t.status === 'pending_approval').length || 0;

  // Get user initials for the avatar
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'U';

  return (
    <div className="flex flex-col w-[240px] h-full bg-[var(--bg-surface)] border-r border-white/5 relative z-20">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--gradient-brand)]">
          <Zap size={16} className="text-white" fill="white" />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-[var(--gradient-brand)] tracking-tight">Execra</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isExactDashboard = item.href === '/dashboard';
          // Ensure exact match for /dashboard otherwise all routes are active
          const isCurrentRoute = isExactDashboard 
            ? pathname === '/dashboard' 
            : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isCurrentRoute
                  ? "bg-[rgba(97,75,255,0.15)] border border-[rgba(97,75,255,0.3)] text-white shadow-[0_0_15px_rgba(97,75,255,0.1)]"
                  : "border border-transparent text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-4 h-4 mr-3 transition-colors", isCurrentRoute ? "text-[var(--accent-violet)]" : "text-slate-500 group-hover:text-slate-300")} />
              {item.name}
              
              {/* Badge for Approvals */}
              {item.name === 'Approvals' && pendingCount > 0 && (
                <span className={cn(
                  "ml-auto inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold",
                  isCurrentRoute 
                    ? "bg-[rgba(97,75,255,0.3)] text-white border border-[rgba(97,75,255,0.5)]" 
                    : "bg-white/10 text-slate-300 border border-white/5"
                )}>
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Avatar Area */}
      <div className="p-4 border-t border-white/5 m-4 rounded-xl bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--gradient-brand)] text-white font-bold text-sm shadow-lg">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || 'Founder'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
