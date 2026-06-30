import { createClient } from '@supabase/supabase-js';

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cuoelpiwhxotegztveka.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_YtTgK34LDLuaCtoBmTt12A_nH680gGJ';

if (supabaseUrl) {
  // Strip trailing '/rest/v1/' or similar that a user might copy from settings
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

// Check if credentials are present
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured && typeof window !== 'undefined') {
  console.warn(
    '⚠️ CiviLog: Supabase credentials are not configured in your .env.local file. ' +
    'The application will gracefully fall back to client-side localStorage simulation.'
  );
}

export const supabase = isConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
