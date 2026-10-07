import { createClient } from '@supabase/supabase-js';

// Ambil URL dan Anon Key dari environment variable Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Inisialisasi Supabase Client
 * Digunakan untuk koneksi ke database Supabase dan otentikasi (Supabase Auth).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
