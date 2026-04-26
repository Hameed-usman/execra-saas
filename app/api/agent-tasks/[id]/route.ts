import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await auth();
    if (!session?.user || !(session.user as any).tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    try {
      const agentServiceUrl = process.env.AGENT_SERVICE_URL || 'http://localhost:8000';
      const response = await fetch(`${agentServiceUrl}/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error('[AGENT_TASK_UPDATE_FETCH_ERROR]', fetchError);
      return NextResponse.json(
        { 
          error: 'Agent service temporarily unavailable', 
          code: 'AGENT_OFFLINE' 
        }, 
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('[AGENT_TASK_UPDATE_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
