# Sistem Informasi RT/RW Komp. Perumahan (SIM RT/RW)

Aplikasi web Sistem Informasi Lingkungan Warga, Rekapitulasi Iuran Bulanan 12 Bulan, dan Portal Berita & Pengumuman RT/RW berbasis **Next.js (App Router)**, **Tailwind CSS**, dan **Supabase (Database & Auth)**, siap di-deploy langsung ke **Vercel**.

---

## 🚀 Fitur Utama

1. **Modul Data Warga & Alamat Rumah**
   - Menampilkan daftar warga terdata berdasarkan alamat rumah (Blok/Nomor Rumah, Nama Kepala Keluarga, No. HP/WhatsApp, Status Penghuni: Tetap/Kontrak).
   - Fitur pencarian instan & filter data warga berdasarkan Blok atau Nama.
   - Tombol langsung chat WhatsApp ke warga (`wa.me`).
   - CRUD Pengurus RT: Tambah Warga, Edit, dan Hapus.

2. **Modul Pencatatan Iuran Bulanan (Per Tahun)**
   - Grid/Tabel rekapitulasi iuran bulanan 12 bulan (Januari - Desember) per kepala keluarga.
   - Indikator status pembayaran per rumah (Hijau = Lunas, Merah = Belum Bayar).
   - Ringkasan pemasukan iuran: Total Terkumpul, Target Tahunan, % Realisasi.
   - Generator Kuitansi Digital resmi RT/RW lengkap dengan nomor kuitansi, stempel digital, dan opsi cetak / bagikan ke WhatsApp warga.
   - Export rekapitulasi ke file CSV / Spreadsheet.

3. **Modul Berita & Pengumuman RT/RW**
   - Kartu pengumuman dengan tanggal, judul, isi/deskripsi, kategori (Kerja Bakti, Keamanan, Kegiatan, Keuangan, Info Penting).
   - Sistem Pinned Announcement untuk pengumuman darurat/krusial.
   - CRUD Pengurus RT untuk menerbitkan dan mengelola pengumuman.

4. **Hak Akses & Otentikasi (Supabase Auth)**
   - **Mode Publik / Warga**: Akses transparan read-only untuk mengecek iuran rumah sendiri, membaca pengumuman, dan melihat direktori warga.
   - **Mode Pengurus (Admin)**: Login untuk mencatat pelunasan iuran, menambah/mengubah warga, dan menerbitkan pengumuman.
   - Dilengkapi *Mode Demo Instan* (`admin@griyaharmoni.id` / `admin123`) untuk pengujian langsung tanpa konfigurasi awal.

---

## 🛠️ Panduan Langkah: Menghubungkan Supabase ke Vercel

### Langkah 1: Buat Proyek di Supabase
1. Buka [https://supabase.com](https://supabase.com) dan login/daftar akun.
2. Klik **"New Project"**, pilih Region terdekat (misal: *Singapore*).
3. Berikan nama proyek (contoh: `sim-rtrw-perumahan`) dan tentukan Database Password.

### Langkah 2: Jalankan Skema Database SQL
1. Buka menu **"SQL Editor"** di sidebar kiri Supabase.
2. Buka file `supabase/schema.sql` dari repositori ini, salin seluruh isinya, lalu tempelkan di SQL Editor.
3. Klik tombol hijau **"Run"**. Seluruh tabel (`warga`, `iuran`, `berita`, `pengaturan_rt`) dan Row Level Security (RLS) policies akan terbuat otomatis.

### Langkah 3: Ambil API Keys Supabase
1. Di dashboard Supabase, buka menu **Project Settings → API**.
2. Salin:
   - **Project URL** (contoh: `https://xyzabc.supabase.co`)
   - **anon / public key** (JWT token panjang)

### Langkah 4: Hubungkan ke Vercel
1. Push kode ke GitHub Anda:
   ```bash
   git init
   git add .
   git commit -m "Initial commit SIM RT/RW"
   git push origin main
   ```
2. Buka [https://vercel.com](https://vercel.com), klik **"Add New... → Project"** dan pilih repositori Anda.
3. Di bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL` = (Project URL dari Langkah 3)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (anon key dari Langkah 3)
4. Klik **"Deploy"**. Dalam 1-2 menit aplikasi sudah aktif secara live!

---

## 📂 Struktur File Next.js App Router

```text
├── app/
│   ├── layout.tsx             # Root layout & font Plus Jakarta Sans
│   ├── page.tsx               # Halaman utama / dashboard ringkasan warga
│   ├── warga/page.tsx         # Modul direktori data warga & alamat
│   ├── iuran/page.tsx         # Modul rekapitulasi iuran matriks 12 bulan
│   ├── berita/page.tsx        # Modul pengumuman & agenda kegiatan RT/RW
│   └── login/page.tsx         # Portal login pengurus (Supabase Auth)
├── lib/
│   └── supabaseClient.js      # Inisialisasi Supabase client (@supabase/supabase-js)
├── supabase/
│   └── schema.sql             # Skema DDL tabel warga, iuran, berita, RLS
├── .env.example               # Contoh environment variable
└── package.json
```
