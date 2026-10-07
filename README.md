# Sistem Informasi RT/RW Komp. Perumahan (SIM RT/RW)

Aplikasi web Sistem Informasi Lingkungan Warga, Rekapitulasi Iuran Bulanan 12 Bulan, dan Portal Berita & Pengumuman RT/RW berbasis **Next.js (App Router)**, **Tailwind CSS**, dan **Supabase (Database & Auth)**, siap di-deploy langsung ke **Vercel** lengkap dengan **Backend Serverless (Route Handlers)**.

---

## ⚙️ Bagaimana Backend Bekerja di Vercel?

Di Vercel, Anda **tidak memerlukan VPS Linux / server Express terpisah**. Next.js App Router mengadopsi model **Serverless Function**:

1. **Folder `app/api/.../route.ts` otomatis menjadi Backend API**:
   - `GET /api/warga` & `POST /api/warga` (Manajemen data warga)
   - `GET /api/iuran` & `POST /api/iuran` (Rekapitulasi iuran & pembuatan kuitansi server-side)
   - `GET /api/berita` & `POST /api/berita` (Penerbitan pengumuman RT)

2. **Supabase Client Sisi Server (`lib/supabaseServer.ts`)**:
   - Menggunakan `SUPABASE_SERVICE_ROLE_KEY` yang disimpan aman di environment variable Vercel.
   - Kunci ini **tidak pernah bocor ke browser/klien**, memungkinkan eksekusi transaksi terpercaya (validasi pembayaran, bypassing RLS untuk fungsi admin sistem).

---

## 🚀 Panduan Deploy Backend & Frontend ke Vercel

### 1. Eksekusi Skema Database di Supabase
1. Buka [https://supabase.com](https://supabase.com), buat project baru.
2. Buka menu **SQL Editor**, salin file `supabase/schema.sql`, dan jalankan (**Run**).

### 2. Salin API Keys dari Supabase
Buka **Project Settings → API** di Supabase:
- `Project URL`
- `anon public key` (untuk frontend client)
- `service_role secret` (untuk backend serverless Vercel)

### 3. Tambahkan Environment Variables di Vercel Dashboard
Sebelum klik Deploy di Vercel, tambahkan variabel berikut:
```env
# Frontend & App Router
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...

# Khusus Backend Serverless (Rahasia, tanpa NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...
```

### 4. Deploy
Push repositori ke GitHub, lalu impor ke Vercel. Vercel akan otomatis membangun frontend dan seluruh backend serverless endpoints.
