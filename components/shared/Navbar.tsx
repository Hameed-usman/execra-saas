'use client';

import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

interface NavbarProps {
  user: {
    name: string;
    email: string;
    tenantId: string;
  };
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  
  // Dynamic page title based on pathname
  let pageTitle = 'Dashboard';
  let subtitle = "Here's what's happening with your startup";
  if (pathname?.includes('/activity')) { pageTitle = 'Activity Log'; subtitle = 'Review agent actions & system events'; }
  if (pathname?.includes('/approvals')) { pageTitle = 'Approvals'; subtitle = 'Authorize pending agent execution tasks'; }
  if (pathname?.includes('/settings')) { pageTitle = 'Settings'; subtitle = 'Configure platform preferences'; }
  if (pathname?.includes('/billing')) { pageTitle = 'Billing'; subtitle = 'Manage your plan and invoices'; }

  return (
    <div className="h-20 flex items-center justify-between px-8 bg-[var(--bg-surface)] border-b border-white/5 shadow-sm sticky top-0 z-20 backdrop-blur-md bg-opacity-80">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">{pageTitle}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold text-white">{user.name}</span>
          <span className="text-xs text-slate-400">{user.email}</span>
        </div>
        
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center justify-center p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all group"
          title="Logout"
        >
          <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}
