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

    const response = await fetch(`http://localhost:8000/tasks/${id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data as ApproveResponse);

  } catch (err: any) {
    if (err.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Agent service offline', code: 'AGENT_OFFLINE' },
        { status: 503 },
      );
    }
    console.error('[AGENT_APPROVE_ERROR]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}