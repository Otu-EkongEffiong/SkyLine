import { createClient } from '@supabase/supabase-js';
 
let cachedClient = null;
 
export function getSupabaseAdmin() {
  if (cachedClient) return cachedClient;
 
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
 
  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server credentials are not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
  }
 
  cachedClient = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cachedClient;
}