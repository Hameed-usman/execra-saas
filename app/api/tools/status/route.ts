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

    const tools = await db.connectedTool.findMany({
      where: { tenantId },
      select: {
        toolName: true,
        createdAt: true
      }
    });

    return NextResponse.json(tools, { status: 200 });
  } catch (error) {
    console.error('[TOOLS_STATUS_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
