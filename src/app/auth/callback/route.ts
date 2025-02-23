import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const error_description = requestUrl.searchParams.get('error_description');
    const next = requestUrl.searchParams.get('next') || '/';

    console.log('Auth callback received:', {
      hasCode: !!code,
      error,
      error_description,
      url: requestUrl.toString(),
      next
    });

    if (error || error_description) {
      console.error('OAuth error:', { error, error_description });
      throw new Error(error_description || 'OAuth error');
    }

    if (!code) {
      console.error('No code received in callback');
      throw new Error('No code received');
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    console.log('Exchanging code for session...');
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (sessionError) {
      console.error('Session exchange error:', sessionError);
      throw sessionError;
    }

    console.log('Session exchange successful:', {
      hasSession: !!data.session,
      userId: data.session?.user?.id
    });

    // Use the origin from the request URL
    const redirectTo = new URL(next, requestUrl.origin);
    console.log('Redirecting to:', redirectTo.toString());
    return NextResponse.redirect(redirectTo);
  } catch (error) {
    console.error('Callback error:', error);
    
    // Use the origin from the request URL for error redirect
    const errorUrl = new URL('/login', new URL(request.url).origin);
    errorUrl.searchParams.set('error', error instanceof Error ? error.message : 'Authentication error');
    
    console.log('Redirecting to error page:', errorUrl.toString());
    return NextResponse.redirect(errorUrl);
  }
} 