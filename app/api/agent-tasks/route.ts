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
      const agentServiceUrl = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';
      console.log(`[AGENT_TASKS] Fetching from: ${agentServiceUrl}/tasks?tenant_id=${tenantId}`);
      
      const response = await fetch(`${agentServiceUrl}/tasks?tenant_id=${tenantId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown service error' }));
        console.error('[AGENT_TASKS_SERVICE_ERROR]', errorData);
        return NextResponse.json(errorData, { status: response.status });
      }

      const tasks = await response.json();
      return NextResponse.json(tasks as AgentTask[]);
    } catch (fetchError: any) {
      console.error('[AGENT_TASKS_FETCH_ERROR]', {
        message: fetchError.message,
        code: fetchError.code,
        url: process.env.AGENT_SERVICE_URL
      });
      
      return NextResponse.json(
        { 
          error: 'Agent service temporarily unavailable', 
          code: 'AGENT_OFFLINE',
          details: fetchError.message
        }, 
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('[AGENT_TASKS_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
