import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ApproveResponse } from '@/types/agent';

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

    try {
      const response = await fetch(`http://localhost:8000/tasks/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(errorData, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(data as ApproveResponse);
    } catch (fetchError) {
      console.error('[AGENT_APPROVE_FETCH_ERROR]', fetchError);
      return NextResponse.json(
        { 
          error: 'Agent service temporarily unavailable', 
          code: 'AGENT_OFFLINE' 
        }, 
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('[AGENT_APPROVE_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
