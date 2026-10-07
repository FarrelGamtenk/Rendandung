import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables fallback for Vite
const defaultUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const defaultAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

let cachedClient: SupabaseClient | null = null;
let currentUrl = defaultUrl;
let currentKey = defaultAnonKey;

export function getSupabaseClient(customUrl?: string, customKey?: string): SupabaseClient | null {
  const url = customUrl !== undefined ? customUrl : (localStorage.getItem('sim_rt_supabase_url') || defaultUrl);
  const key = customKey !== undefined ? customKey : (localStorage.getItem('sim_rt_supabase_key') || defaultAnonKey);

  if (!url || !key) {
    return null;
  }

  if (cachedClient && currentUrl === url && currentKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    currentUrl = url;
    currentKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Gagal inisialisasi Supabase client:', err);
    return null;
  }
}

export const supabase = getSupabaseClient();
