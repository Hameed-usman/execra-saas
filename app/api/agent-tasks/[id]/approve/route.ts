import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ApproveResponse } from '@/types/agent';

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }  // folder is [id]
) {
  try {
    const { id } = await params;   // ← was wrongly reading params.task_id

    const session = await auth();
    if (!session?.user || !(session.user as any).tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentServiceUrl = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';
    console.log(`[AGENT_APPROVE] Approving task ${id} at: ${agentServiceUrl}/tasks/${id}/approve`);

    const response = await fetch(`${agentServiceUrl}/tasks/${id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown service error' }));
      console.error('[AGENT_APPROVE_SERVICE_ERROR]', errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data as ApproveResponse);

  } catch (err: any) {
    console.error('[AGENT_APPROVE_FETCH_ERROR]', {
      message: err.message,
      code: err.code || err.cause?.code,
      url: process.env.AGENT_SERVICE_URL
    });

    if (err.cause?.code === 'ECONNREFUSED' || err.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { 
          error: 'Agent service offline', 
          code: 'AGENT_OFFLINE',
          details: err.message
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}