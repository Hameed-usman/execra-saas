import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { AgentRunResponse } from '@/types/agent';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const tenantId = (session.user as any).tenantId;

    const body = await req.json();
    const { goal } = body;

    if (!goal) {
      return NextResponse.json({ error: 'Goal is required' }, { status: 400 });
    }

    try {
      const agentServiceUrl = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';
      console.log(`[AGENT_RUN] Sending request to: ${agentServiceUrl}/agent/run`);

      const response = await fetch(`${agentServiceUrl}/agent/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goal, tenant_id: tenantId }),
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { error: text || 'Internal Server Error' };
      }

      if (!response.ok) {
        console.error('[AGENT_RUN_SERVICE_ERROR]', data);
        return NextResponse.json(data, { status: response.status });
      }

      return NextResponse.json(data as AgentRunResponse);
    } catch (fetchError: any) {
      console.error('[AGENT_RUN_FETCH_ERROR]', {
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
    console.error('[AGENT_RUN_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
