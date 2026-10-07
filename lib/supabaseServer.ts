import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Khusus Server-Side (Next.js API Route Handlers / Server Actions di Vercel)
 * 
 * PENTING:
 * 1. Di backend Vercel, kita dapat menggunakan SUPABASE_SERVICE_ROLE_KEY
 *    untuk melakukan operasi admin khusus (bypass RLS jika diperlukan, verifikasi webhook, dll).
 * 2. Kunci SERVICE_ROLE_KEY bersifat RAHASIA dan TIDAK BOLEH memiliki prefiks NEXT_PUBLIC_!
 * 3. Kunci ini hanya berjalan di Vercel Serverless Function (sisi backend).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default supabaseServer;
