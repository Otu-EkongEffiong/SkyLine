// src/lib/supabaseClient.js
//
// Browser-side Supabase client using the ANON key (safe to expose).
// All reads/writes through this client are subject to Row Level
// Security — a signed-in user can only see/modify their own
// passenger_profiles, saved_visas, and trips, per the policies in
// supabase/schema.sql.
//
// NEVER import the service-role key here — that belongs only in
// netlify/functions/_lib/supabaseAdmin.js.

// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Profiles, visas, and trips will not save until these are set in .env.local (dev) ' +
    'and in Netlify Site settings → Environment variables (production).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'skypath-travel-auth-token', // Explicit storage key isolates the instance
    detectSessionInUrl: true
  }
});