import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

const VALID_STATUSES = ['approved', 'rejected', 'sent', 'failed'];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const body = await req.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
    }

    // Safely resolve params which may be a Promise in Next.js 15
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const task = await db.task.findUnique({
      where: { id }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Forbidden. You do not have access to this task.' }, { status: 403 });
    }

    const updatedTask = await db.task.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updatedTask, { status: 200 });

  } catch (error) {
    console.error('[TASK_PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
