-- ====================================================================
-- SKEMA DATABASE SUPABASE UNTUK SISTEM INFORMASI RT/RW PERUMAHAN
-- Perumahan Griya Harmoni Asri (RT 04 / RW 08)
-- Salin dan jalankan script ini di menu "SQL Editor" pada Dashboard Supabase
-- ====================================================================

-- 1. TABEL: warga
-- Menyimpan data profil warga dan nomor rumah di lingkungan RT/RW
CREATE TABLE IF NOT EXISTS public.warga (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blok_rumah VARCHAR(20) NOT NULL,              -- Contoh: "A1/01", "B2/14"
    nama_lengkap VARCHAR(150) NOT NULL,          -- Nama Kepala Keluarga / Penghuni
    no_hp VARCHAR(25) NOT NULL,                  -- Nomor WhatsApp / Telp (Contoh: "081234567890")
    status_penghuni VARCHAR(20) NOT NULL CHECK (status_penghuni IN ('Tetap', 'Kontrak')),
    jumlah_anggota INT DEFAULT 1,                -- Jumlah jiwa dalam satu rumah
    pekerjaan VARCHAR(100),                      -- Pekerjaan (opsional)
    plat_nomor VARCHAR(50),                      -- Plat nomor kendaraan utama
    catatan TEXT,                                -- Catatan tambahan
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pencarian untuk warga
CREATE INDEX IF NOT EXISTS idx_warga_blok ON public.warga(blok_rumah);
CREATE INDEX IF NOT EXISTS idx_warga_nama ON public.warga(nama_lengkap);

-- 2. TABEL: iuran
-- Menyimpan pencatatan pembayaran iuran bulanan warga per tahun (Jan - Des)
CREATE TABLE IF NOT EXISTS public.iuran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warga_id UUID NOT NULL REFERENCES public.warga(id) ON DELETE CASCADE,
    tahun INT NOT NULL,                          -- Contoh: 2025, 2026
    bulan INT NOT NULL CHECK (bulan BETWEEN 1 AND 12), -- 1 = Januari, 12 = Desember
    jumlah_bayar NUMERIC(12, 2) NOT NULL DEFAULT 100000, -- Nominal iuran (Rp 100.000)
    status_bayar VARCHAR(20) NOT NULL DEFAULT 'Lunas' CHECK (status_bayar IN ('Lunas', 'Belum Bayar', 'Menunggu')),
    tanggal_bayar DATE,                          -- Tanggal transaksi
    metode_bayar VARCHAR(30) DEFAULT 'Transfer' CHECK (metode_bayar IN ('Transfer', 'Tunai', 'QRIS')),
    nomor_kuitansi VARCHAR(50),                  -- Contoh: "KWT-2026-03-A101"
    dicatat_oleh VARCHAR(100),                   -- Nama bendahara / admin RT
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_warga_tahun_bulan UNIQUE (warga_id, tahun, bulan)
);

-- Index pencarian untuk rekap iuran
CREATE INDEX IF NOT EXISTS idx_iuran_tahun ON public.iuran(tahun);
CREATE INDEX IF NOT EXISTS idx_iuran_warga ON public.iuran(warga_id);

-- 3. TABEL: berita
-- Menyimpan pengumuman, jadwal kerja bakti, keamanan, dan agenda RT/RW
CREATE TABLE IF NOT EXISTS public.berita (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    kategori VARCHAR(50) NOT NULL CHECK (kategori IN ('Kerja Bakti', 'Keamanan', 'Kegiatan', 'Keuangan', 'Info Penting')),
    isi TEXT NOT NULL,
    ringkasan VARCHAR(300),
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    penulis VARCHAR(100) DEFAULT 'Pengurus RT 04',
    is_pinned BOOLEAN DEFAULT FALSE,             -- Pin di posisi teratas
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pencarian untuk berita
CREATE INDEX IF NOT EXISTS idx_berita_tanggal ON public.berita(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_berita_kategori ON public.berita(kategori);

-- 4. TABEL: pengaturan_rt
-- Pengaturan nominal standar kas, rekening iuran, dan kontak pengurus
CREATE TABLE IF NOT EXISTS public.pengaturan_rt (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'primary',
    nama_perumahan VARCHAR(150) DEFAULT 'Komplek Griya Harmoni Asri',
    rt_rw VARCHAR(50) DEFAULT 'RT 04 / RW 08',
    kelurahan VARCHAR(100) DEFAULT 'Sukamaju',
    kecamatan VARCHAR(100) DEFAULT 'Cilodong',
    kota VARCHAR(100) DEFAULT 'Kota Depok',
    nominal_iuran NUMERIC(12, 2) DEFAULT 100000,
    nama_bank VARCHAR(50) DEFAULT 'BCA',
    no_rekening VARCHAR(50) DEFAULT '8820-1928-44',
    atas_nama_rekening VARCHAR(100) DEFAULT 'Kas RT 04 Griya Harmoni',
    nomor_hotline_keamanan VARCHAR(25) DEFAULT '0812-9988-7766',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Aktifkan RLS di setiap tabel
ALTER TABLE public.warga ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iuran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengaturan_rt ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses:
-- 1. Publik (Anon) memiliki hak BACA (SELECT) untuk transparansi
CREATE POLICY "Publik dapat membaca data warga" 
    ON public.warga FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Publik dapat membaca rekap iuran" 
    ON public.iuran FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Publik dapat membaca pengumuman berita" 
    ON public.berita FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Publik dapat membaca profil pengaturan" 
    ON public.pengaturan_rt FOR SELECT TO anon, authenticated USING (true);

-- 2. Admin Pengurus (Authenticated) memiliki hak penuh (INSERT, UPDATE, DELETE)
CREATE POLICY "Pengurus dapat mengelola data warga" 
    ON public.warga FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Pengurus dapat mencatat dan mengedit iuran" 
    ON public.iuran FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Pengurus dapat mengelola berita" 
    ON public.berita FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Pengurus dapat mengubah pengaturan RT" 
    ON public.pengaturan_rt FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ====================================================================
-- SAMPLE DATA AWAL (SEED DATA UNTUK UJI COBA)
-- ====================================================================

INSERT INTO public.pengaturan_rt (id, nama_perumahan, rt_rw, kelurahan, kecamatan, kota, nominal_iuran)
VALUES ('primary', 'Komplek Depkes', 'RT 04 / RW 08', 'Sukamaju', 'Cilodong', 'Kota Depok', 100000)
ON CONFLICT (id) DO NOTHING;

-- Data Berita & Pengumuman Awal (Informasi Umum RT)
INSERT INTO public.berita (judul, kategori, ringkasan, isi, tanggal, penulis, is_pinned)
VALUES
    (
        'Jadwal Kerja Bakti & Fogging Nyamuk DBD Menjelang Musim Penghujan',
        'Kerja Bakti',
        'Diharapkan seluruh warga hadir dalam giat bersih saluran got dan pemangkasan dahan pohon.',
        'Sehubungan dengan antisipasi musim hujan dan pencegahan penyakit demam berdarah (DBD), Pengurus RT mengundang seluruh bapak/ibu warga Griya Harmoni untuk berpartisipasi dalam Kerja Bakti Serentak dan pelaksanaan Fogging.\n\nPelaksanaan:\n- Hari/Tanggal: Minggu, 12 Oktober 2026\n- Pukul: 07.00 WIB - Selesai\n- Titik Kumpul: Lapangan Fasum Blok B\n- Perlengkapan: Cangkul, sapu lidi, sarung tangan\n\nSnack dan konsumsi disediakan oleh panitia RT. Partisipasi warga sangat kami harapkan demi kebersihan dan kesehatan lingkungan bersama.',
        '2026-10-05',
        'Sie Kebersihan & Lingkungan',
        TRUE
    ),
    (
        'Peningkatan Patroli Keamanan & Registrasi Tamu Menginap 1x24 Jam',
        'Keamanan',
        'Pos sekuriti memberlakukan kartu tamu untuk tamu luar dan kurir demi menjaga ketertiban.',
        'Mengingat telah dipasangnya 8 titik CCTV baru di jalur utama gerbang cluster, kami mengingatkan kembali peraturan tata tertib lingkungan:\n\n1. Seluruh tamu yang menginap lebih dari 1x24 jam wajib melapor ke pengurus RT atau Pos Security.\n2. Portal gerbang timur ditutup pukul 22.00 WIB setiap malam, akses keluar masuk melalui Gerbang Utama.\n3. Batas kecepatan kendaraan di dalam komplek maksimal 20 km/jam.\n\nTerima kasih atas kerja sama seluruh warga demi terciptanya lingkungan yang aman dan kondusif.',
        '2026-10-01',
        'Sie Keamanan & Ketertiban',
        FALSE
    ),
    (
        'Laporan Kas & Transparansi Keuangan Iuran Warga Bulan September 2026',
        'Keuangan',
        'Saldo akhir kas RT bulan September tercatat sebesar Rp 18.450.000 dengan rincian terbuka.',
        'Berikut rangkuman laporan kas RT bulan September 2026:\n\n- Saldo Awal: Rp 14.200.000\n- Pemasukan Iuran: Rp 8.800.000\n- Pengeluaran Operasional (Gaji 3 Satpam & Petugas Sampah): Rp 4.250.000\n- Perawatan Lampu Penerangan Jalan Umum (PJU): Rp 300.000\n- Saldo Kas Akhir: Rp 18.450.000\n\nLaporan pembukuan lengkap beserta nota dan bukti kuitansi dapat diakses di papan pengumuman sekretariat RT.',
        '2026-09-30',
        'Bendahara RT 04',
        FALSE
    )
ON CONFLICT DO NOTHING;
