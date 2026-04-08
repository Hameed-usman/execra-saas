import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/shared/Sidebar';
import { Navbar } from '@/components/shared/Navbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  // Cast session user to match expected properties
  const user = {
    name: session.user.name || 'User',
    email: session.user.email || '',
    tenantId: (session.user as any)?.tenantId || '',
  };

  return (
    <div className="flex h-screen bg-[var(--bg-deep)] text-white overflow-hidden">
      <Sidebar user={user} />
      
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Navbar user={user} />
        
        <main className="flex-1 overflow-y-auto p-8 relative z-10">
          {children}
        </main>

        {/* Subtle background glow from global theme */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(var(--accent-violet-rgb),0.05),transparent_70%)]" />
        </div>
      </div>
    </div>
  );
}
