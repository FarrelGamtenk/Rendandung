import React, { useState } from 'react';
import { 
  BookOpen, Copy, Check, Terminal, ExternalLink, 
  Database, Globe, Shield, FileCode2, ArrowRight, RefreshCw, Key
} from 'lucide-react';
import { getSupabaseClient } from '../lib/supabaseClient';

interface PanduanModuleProps {
  onOpenSupabaseConfig: () => void;
  isSupabaseConnected: boolean;
}

export const PanduanModule: React.FC<PanduanModuleProps> = ({
  onOpenSupabaseConfig,
  isSupabaseConnected,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'langkah' | 'sql' | 'struktur' | 'koneksi'>('langkah');
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  // State untuk pengujian koneksi live
  const [testUrl, setTestUrl] = useState(localStorage.getItem('sim_rt_supabase_url') || '');
  const [testKey, setTestKey] = useState(localStorage.getItem('sim_rt_supabase_key') || '');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const sqlSchemaText = `-- ====================================================================
-- SKEMA DATABASE SUPABASE UNTUK SISTEM INFORMASI RT/RW PERUMAHAN
-- Perumahan Griya Harmoni Asri (RT 04 / RW 08)
-- Salin dan jalankan script ini di menu "SQL Editor" pada Dashboard Supabase
-- ====================================================================

-- 1. TABEL: warga (Data Penghuni & Rumah)
CREATE TABLE IF NOT EXISTS public.warga (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blok_rumah VARCHAR(20) NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    no_hp VARCHAR(25) NOT NULL,
    status_penghuni VARCHAR(20) NOT NULL CHECK (status_penghuni IN ('Tetap', 'Kontrak')),
    jumlah_anggota INT DEFAULT 1,
    pekerjaan VARCHAR(100),
    plat_nomor VARCHAR(50),
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_warga_blok ON public.warga(blok_rumah);
CREATE INDEX IF NOT EXISTS idx_warga_nama ON public.warga(nama_lengkap);

-- 2. TABEL: iuran (Rekap Iuran Bulanan 1-12)
CREATE TABLE IF NOT EXISTS public.iuran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warga_id UUID NOT NULL REFERENCES public.warga(id) ON DELETE CASCADE,
    tahun INT NOT NULL,
    bulan INT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    jumlah_bayar NUMERIC(12, 2) NOT NULL DEFAULT 100000,
    status_bayar VARCHAR(20) NOT NULL DEFAULT 'Lunas' CHECK (status_bayar IN ('Lunas', 'Belum Bayar', 'Menunggu')),
    tanggal_bayar DATE,
    metode_bayar VARCHAR(30) DEFAULT 'Transfer' CHECK (metode_bayar IN ('Transfer', 'Tunai', 'QRIS')),
    nomor_kuitansi VARCHAR(50),
    dicatat_oleh VARCHAR(100),
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_warga_tahun_bulan UNIQUE (warga_id, tahun, bulan)
);

CREATE INDEX IF NOT EXISTS idx_iuran_tahun ON public.iuran(tahun);
CREATE INDEX IF NOT EXISTS idx_iuran_warga ON public.iuran(warga_id);

-- 3. TABEL: berita (Pengumuman & Agenda RT)
CREATE TABLE IF NOT EXISTS public.berita (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    kategori VARCHAR(50) NOT NULL CHECK (kategori IN ('Kerja Bakti', 'Keamanan', 'Kegiatan', 'Keuangan', 'Info Penting')),
    isi TEXT NOT NULL,
    ringkasan VARCHAR(300),
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    penulis VARCHAR(100) DEFAULT 'Pengurus RT 04',
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.warga ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iuran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;

-- Publik bisa melihat data (transparansi warga)
CREATE POLICY "Publik dapat membaca data warga" ON public.warga FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Publik dapat membaca rekap iuran" ON public.iuran FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Publik dapat membaca berita" ON public.berita FOR SELECT TO anon, authenticated USING (true);

-- Pengurus RT (Authenticated) memiliki hak penuh CRUD
CREATE POLICY "Pengurus kelola warga" ON public.warga FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Pengurus kelola iuran" ON public.iuran FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Pengurus kelola berita" ON public.berita FOR ALL TO authenticated USING (true) WITH CHECK (true);`;

  const envSampleText = `# Environment Variables untuk Next.js (Simpan di .env.local atau Vercel Dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlSchemaText);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envSampleText);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus('Menghubungi server Supabase...');

    if (!testUrl || !testKey) {
      setTestStatus('Error: Masukkan URL dan Anon Key Supabase terlebih dahulu.');
      setIsTesting(false);
      return;
    }

    try {
      localStorage.setItem('sim_rt_supabase_url', testUrl);
      localStorage.setItem('sim_rt_supabase_key', testKey);

      const client = getSupabaseClient(testUrl, testKey);
      if (!client) {
        setTestStatus('Error: Format URL atau Key Supabase tidak valid.');
        setIsTesting(false);
        return;
      }

      // Tes query tabel warga
      const { data, error } = await client.from('warga').select('id, nama_lengkap').limit(3);

      if (error) {
        setTestStatus(`Terhubung ke Supabase, namun query gagal: ${error.message}. Pastikan skema SQL sudah dijalankan di Supabase.`);
      } else {
        setTestStatus(`Berhasil terhubung ke Supabase! Ditemukan ${data?.length || 0} baris data warga di database live.`);
      }
    } catch (err: any) {
      setTestStatus(`Gagal koneksi: ${err.message || 'Periksa koneksi internet dan credentials Supabase'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-emerald-600" />
          Dokumentasi & Panduan Deploy ke Vercel + Supabase
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Panduan langkah demi langkah membangun, menghubungkan database Supabase, dan mendeploy aplikasi Sistem Informasi RT/RW ke Vercel.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl max-w-2xl text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveSubTab('langkah')}
          className={`flex-1 py-2 px-3 rounded-lg transition-colors text-center ${
            activeSubTab === 'langkah'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          1. Panduan Vercel
        </button>
        <button
          onClick={() => setActiveSubTab('sql')}
          className={`flex-1 py-2 px-3 rounded-lg transition-colors text-center ${
            activeSubTab === 'sql'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          2. Skema SQL
        </button>
        <button
          onClick={() => setActiveSubTab('struktur')}
          className={`flex-1 py-2 px-3 rounded-lg transition-colors text-center ${
            activeSubTab === 'struktur'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          3. Next.js App Router
        </button>
        <button
          onClick={() => setActiveSubTab('koneksi')}
          className={`flex-1 py-2 px-3 rounded-lg transition-colors text-center ${
            activeSubTab === 'koneksi'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          4. Uji Koneksi Live
        </button>
      </div>

      {/* TAB CONTENT 1: PANDUAN LANGKAH DEPLOY VERCEL */}
      {activeSubTab === 'langkah' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center font-mono">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Buat Proyek di Supabase</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Buka <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">supabase.com</a>, buat akun gratis, lalu klik <strong>"New Project"</strong>. Berikan nama proyek (misal: <code>sim-rtrw-griyaharmoni</code>) dan tentukan Database Password yang aman.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center font-mono">
                  2
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Jalankan SQL Schema di SQL Editor</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Di dashboard Supabase, buka menu <strong>"SQL Editor"</strong> di sidebar kiri. Buat "New Query", paste skema database yang telah kami sertakan (Tab 2), lalu klik tombol hijau <strong>"Run"</strong>. Tabel <code>warga</code>, <code>iuran</code>, dan <code>berita</code> akan otomatis terbuat beserta RLS rules.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center font-mono">
                  3
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Salin API Keys Supabase</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Buka menu <strong>Project Settings → API</strong>. Salin dua variabel penting:
                <br />
                • <code>Project URL</code> (masukkan ke <code>NEXT_PUBLIC_SUPABASE_URL</code>)
                <br />
                • <code>anon public key</code> (masukkan ke <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>)
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center font-mono">
                  4
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Deploy Langsung ke Vercel</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Push kode proyek Next.js Anda ke GitHub. Buka <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">vercel.com</a>, klik <strong>"Add New... → Project"</strong>, dan pilih repositori Anda.
              </p>
            </div>
          </div>

          {/* Step 5 Highlight: Environment Variables in Vercel */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                  LANGKAH 5 (KRUSIAL)
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Konfigurasi Environment Variables di Dashboard Vercel
                </h3>
              </div>
              <button
                onClick={handleCopyEnv}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedEnv ? 'Tersalin!' : 'Salin Contoh Env'}
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Sebelum menekan tombol <strong>"Deploy"</strong> di Vercel, buka bagian <strong>"Environment Variables"</strong> pada halaman konfigurasi proyek Vercel dan tambahkan 2 variabel berikut:
            </p>

            <pre className="p-4 bg-slate-950 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800 custom-scrollbar">
              {envSampleText}
            </pre>

            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Prefiks <code>NEXT_PUBLIC_</code> wajib disertakan agar Supabase Client dapat dibaca di sisi browser Next.js App Router.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: SKEMA SQL SUPABASE */}
      {activeSubTab === 'sql' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Skema Database SQL Lengkap (Tabel `warga`, `iuran`, `berita`, RLS)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                File tersimpan di: <code>/supabase/schema.sql</code>. Siap di-copy & paste ke SQL Editor Supabase.
              </p>
            </div>
            <button
              onClick={handleCopySQL}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
            >
              {copiedSQL ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedSQL ? 'Berhasil Disalin ke Clipboard!' : 'Salin Seluruh Skema SQL'}
            </button>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 overflow-hidden relative">
            <pre className="text-xs text-slate-200 font-mono overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar p-2 leading-relaxed">
              {sqlSchemaText}
            </pre>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: STRUKTUR NEXT.JS APP ROUTER */}
      {activeSubTab === 'struktur' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Struktur Proyek Next.js (App Router) yang Disediakan
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Aplikasi ini dirancang modular sesuai best-practice Next.js 14/15 App Router:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-mono font-bold text-emerald-700">/lib/supabaseClient.js</span>
                <p className="text-slate-600">
                  Inisialisasi klien Supabase menggunakan <code>createClient()</code> dari <code>@supabase/supabase-js</code> dengan env var <code>NEXT_PUBLIC_SUPABASE_URL</code> dan <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-mono font-bold text-slate-800">/app/page.tsx</span>
                <p className="text-slate-600">
                  Landing dashboard utama warga: metrik kepala keluarga, persentase iuran terkumpul, ringkasan pengumuman darurat dan kontak pos keamanan.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-mono font-bold text-slate-800">/app/warga/page.tsx</span>
                <p className="text-slate-600">
                  Direktori warga terdata: filter blok rumah, pencarian nama kepala keluarga, WhatsApp click-to-chat, status tetap/kontrak, dan modal CRUD pengurus.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-mono font-bold text-slate-800">/app/iuran/page.tsx</span>
                <p className="text-slate-600">
                  Matriks rekapitulasi iuran bulanan 12 bulan (Jan - Des): indikator warna lunas/menunggak, pencatatan transaksi, generator kuitansi digital, dan export CSV.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-mono font-bold text-slate-800">/app/berita/page.tsx</span>
                <p className="text-slate-600">
                  Portal pengumuman dan berita RT/RW: agenda gotong royong, jadwal siskamling, transparansi kas bulanan, dan sistem pin pengumuman penting.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-mono font-bold text-slate-800">/supabase/schema.sql</span>
                <p className="text-slate-600">
                  Skema DDL SQL lengkap mencakup tabel <code>warga</code>, <code>iuran</code>, <code>berita</code>, RLS security policies, dan seed data awal.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: UJI KONEKSI LIVE SUPABASE */}
      {activeSubTab === 'koneksi' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              Hubungkan Database Supabase Proyek Anda Sendiri
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Masukkan Project URL dan Anon Key dari dashboard Supabase Anda untuk langsung menguji query secara langsung di browser tanpa perlu deploy terlebih dahulu.
            </p>
          </div>

          <div className="space-y-4 max-w-xl text-xs sm:text-sm">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Project URL (Supabase)</label>
              <input
                type="text"
                placeholder="https://xyzabcdefg.supabase.co"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Anon Public Key (Supabase)</label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 text-xs shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                {isTesting ? 'Menguji...' : 'Uji Koneksi & Simpan'}
              </button>

              <button
                onClick={() => {
                  setTestUrl('');
                  setTestKey('');
                  localStorage.removeItem('sim_rt_supabase_url');
                  localStorage.removeItem('sim_rt_supabase_key');
                  setTestStatus('Kredensial kustom dihapus. Menggunakan data demo bawaan.');
                }}
                className="px-3.5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs"
              >
                Reset ke Mode Demo
              </button>
            </div>

            {testStatus && (
              <div
                className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                  testStatus.includes('Berhasil')
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : testStatus.includes('Error') || testStatus.includes('Gagal')
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                {testStatus}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
