import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;

    const tasks = await db.task.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error('[TASKS_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    const body = await req.json();
    const { agentName, goal, status, toEmail, subject, body: taskBody } = body;

    if (!agentName || !goal) {
      return NextResponse.json({ error: 'Missing required fields: agentName and goal are required' }, { status: 400 });
    }

    const task = await db.task.create({
      data: {
        tenantId,
        agentName,
        goal,
        status: status || 'pending_approval',
        toEmail,
        subject,
        body: taskBody
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('[TASKS_POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
