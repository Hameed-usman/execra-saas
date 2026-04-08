import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { encrypt } from '@/lib/encryption';

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const nextAuthUrl = process.env.NEXTAUTH_URL || origin;
  
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard/settings?error=gmail_failed', nextAuthUrl));
    }

    const session = await auth();
    if (!session?.user || !(session.user as any).tenantId) {
      return NextResponse.redirect(new URL('/login', nextAuthUrl));
    }

    const tenantId = (session.user as any).tenantId;

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${nextAuthUrl}/api/oauth/google/callback`;

    if (!clientId || !clientSecret) {
      console.error('[GOOGLE_OAUTH_CALLBACK] Missing Google App Credentials');
      return NextResponse.redirect(new URL('/dashboard/settings?error=missing_env', nextAuthUrl));
    }

    // Exchange authorization code for access and refresh tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('[GOOGLE_OAUTH_CALLBACK] Token exchange failed', errorData);
      return NextResponse.redirect(new URL('/dashboard/settings?error=gmail_failed', nextAuthUrl));
    }

    const data = await tokenResponse.json();
    
    if (!data.access_token) {
      return NextResponse.redirect(new URL('/dashboard/settings?error=gmail_failed', nextAuthUrl));
    }

    // Encrypt tokens before storing in the database
    const encryptedAccessToken = encrypt(data.access_token);
    const encryptedRefreshToken = data.refresh_token ? encrypt(data.refresh_token) : null;
    
    let expiresAt: Date | null = null;
    if (data.expires_in) {
      // Calculate absolute expiration time based on expires_in (seconds)
      expiresAt = new Date(Date.now() + data.expires_in * 1000);
    }

    // Upsert the connected tool tied directly to this tenant
    await db.connectedTool.upsert({
      where: {
        tenantId_toolName: {
          tenantId,
          toolName: 'gmail'
        }
      },
      create: {
        tenantId,
        toolName: 'gmail',
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt
      },
      update: {
        accessToken: encryptedAccessToken,
        ...(encryptedRefreshToken && { refreshToken: encryptedRefreshToken }),
        ...(expiresAt && { expiresAt })
      }
    });

    return NextResponse.redirect(new URL('/dashboard/settings?connected=gmail', nextAuthUrl));
  } catch (error) {
    console.error('[GOOGLE_OAUTH_CALLBACK]', error);
    return NextResponse.redirect(new URL('/dashboard/settings?error=gmail_failed', nextAuthUrl));
  }
}
