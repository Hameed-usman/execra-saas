import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { encrypt } from '@/lib/encryption';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = (session.user as any).tenantId;
    
    const body = await req.json();
    const { stripeKey } = body;

    if (!stripeKey || typeof stripeKey !== 'string' || !stripeKey.startsWith('sk_')) {
      return NextResponse.json({ error: 'Invalid Stripe Secret Key. Must start with sk_' }, { status: 400 });
    }

    // Never store plaintext secrets
    const encryptedKey = encrypt(stripeKey);

    await db.connectedTool.upsert({
      where: {
        tenantId_toolName: {
          tenantId,
          toolName: 'stripe'
        }
      },
      update: {
        accessToken: encryptedKey
      },
      create: {
        tenantId,
        toolName: 'stripe',
        accessToken: encryptedKey,
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[STRIPE_CONNECT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
