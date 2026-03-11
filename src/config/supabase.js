import { createClient } from '@supabase/supabase-js';
import env from './env.js';

// Public client — uses anon key, respects RLS policies
export const supabase = createClient(env.supabase.url, env.supabase.anonKey);

// Admin client — uses service_role key, bypasses RLS (for caching/admin ops)
export const supabaseAdmin = env.supabase.serviceRoleKey
  ? createClient(env.supabase.url, env.supabase.serviceRoleKey)
  : supabase;
