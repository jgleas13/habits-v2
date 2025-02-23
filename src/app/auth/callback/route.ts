import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('Callback received from URL:', requestUrl.toString());

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    await supabase.auth.exchangeCodeForSession(code);
    console.log('Successfully exchanged code for session');
  }

  // Get the origin of the request
  const origin = requestUrl.origin;
  console.log('Request origin:', origin);

  // Always redirect to the root path of wherever the request came from
  return NextResponse.redirect(`${origin}/`);
} 