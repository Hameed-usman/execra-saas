import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { AgentTask } from '@/types/agent';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenantId = (session.user as any).tenantId;

    try {
      const response = await fetch(`http://localhost:8000/tasks?tenant_id=${tenantId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
      }

      const tasks = await response.json();
      return NextResponse.json(tasks as AgentTask[]);
    } catch (fetchError) {
      console.error('[AGENT_TASKS_FETCH_ERROR]', fetchError);
      return NextResponse.json(
        { 
          error: 'Agent service temporarily unavailable', 
          code: 'AGENT_OFFLINE' 
        }, 
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('[AGENT_TASKS_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
