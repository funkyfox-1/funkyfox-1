import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials safely from Vite env using direct static access for Vite AST substitution
const envUrl =
  (typeof import.meta !== 'undefined' && (import.meta as any).env ? import.meta.env.VITE_SUPABASE_URL : '') ||
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : '') ||
  '';

const envKey =
  (typeof import.meta !== 'undefined' && (import.meta as any).env
    ? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
    : '') ||
  (typeof process !== 'undefined'
    ? process.env?.VITE_SUPABASE_PUBLISHABLE_KEY || process.env?.VITE_SUPABASE_ANON_KEY
    : '') ||
  '';

// Normalize URL (strip trailing slashes or /rest/v1 paths if pasted from Supabase REST endpoint)
const supabaseUrl = (envUrl || '').trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (envKey || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('YOUR_')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export interface SupabaseConfigStatus {
  configured: boolean;
  url: string;
  hasAnonKey: boolean;
  storageBucketReady: boolean;
}

export function getSupabaseStatus(): SupabaseConfigStatus {
  return {
    configured: isSupabaseConfigured,
    url: supabaseUrl ? supabaseUrl.replace(/^(https:\/\/[^.]+).*/, '$1.supabase.co') : 'Not Configured',
    hasAnonKey: Boolean(supabaseAnonKey),
    storageBucketReady: isSupabaseConfigured,
  };
}
