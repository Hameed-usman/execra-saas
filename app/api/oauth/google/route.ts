import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const origin = new URL(req.url).origin;
    const nextAuthUrl = process.env.NEXTAUTH_URL || origin;

    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', nextAuthUrl));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('[GOOGLE_OAUTH] Missing GOOGLE_CLIENT_ID environment variable');
      return NextResponse.redirect(new URL('/dashboard/settings?error=missing_env', nextAuthUrl));
    }

    const redirectUri = `${nextAuthUrl}/api/oauth/google/callback`;
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return NextResponse.redirect(googleAuthUrl);
  } catch (error) {
    console.error('[GOOGLE_OAUTH_GET]', error);
    const origin = new URL(req.url).origin;
    return NextResponse.redirect(new URL('/dashboard/settings?error=google_failed', process.env.NEXTAUTH_URL || origin));
  }
}
