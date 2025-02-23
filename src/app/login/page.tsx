'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <h1 className="text-2xl font-bold text-center mb-8">Sign in to Habit Tracker</h1>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google']}
            redirectTo={`${window.location.origin}/auth/callback`}
          />
        </div>
      </div>
    </div>
  );
} 