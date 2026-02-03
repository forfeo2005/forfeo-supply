import { createClient } from '@supabase/supabase-js';

// ⚠️ Mets ces variables dans Render (ou .env en local)
// VITE_SUPABASE_URL=https://xxxx.supabase.co
// VITE_SUPABASE_ANON_KEY=eyJhbGciOi... (anon/public)

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Ne casse pas le build, mais aide énormément au debug
  console.error('❌ Variables Supabase manquantes: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // iOS/Safari: localStorage est OK en général, mais on explicite
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});
