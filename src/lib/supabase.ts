import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Create a Supabase client with better error handling
const createClient = () => {
  const client = createClientComponentClient();
  
  // Log initialization
  console.log('Supabase client initialized with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  return client;
};

export const supabase = createClient(); 