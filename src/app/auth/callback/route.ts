import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SITE_URL = 'https://habits-v2-peach.vercel.app';

console.log('Callback handling with site URL:', SITE_URL);

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('Received callback with code:', code ? 'present' : 'missing');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    await supabase.auth.exchangeCodeForSession(code);
    console.log('Successfully exchanged code for session');
  }

  console.log('Redirecting to:', `${SITE_URL}/`);
  return NextResponse.redirect(`${SITE_URL}/`);
} 