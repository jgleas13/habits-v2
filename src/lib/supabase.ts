import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const SITE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://habits-v2-peach.vercel.app'
  : 'http://localhost:3000';

console.log('Initializing Supabase client with site URL:', SITE_URL);

export const supabase = createClientComponentClient({
  options: {
    global: {
      site_url: SITE_URL
    }
  }
}); 