import React, { useState } from 'react';
import { 
  BookOpen, Copy, Check, Terminal, ExternalLink, 
  Database, Globe, Shield, FileCode2, ArrowRight, RefreshCw, 
  Server, Cpu, Lock, Send, Code, Layers, ListFilter, Play, CheckCircle2
} from 'lucide-react';
import { getSupabaseClient } from '../lib/supabaseClient';

interface PanduanModuleProps {
  onOpenSupabaseConfig: () => void;
  isSupabaseConnected: boolean;
}

interface ApiEndpointDoc {
  id: string;
  method: 'GET' | 'POST';
  path: string;
  title: string;
  description: string;
  access: 'Publik / Warga' | 'Khusus Admin Pengurus';
  params?: { name: string; type: string; required: boolean; description: string }[];
  bodyExample?: string;
  responseSuccess: string;
  responseError: string;
  curlExample: string;
}

export const PanduanModule: React.FC<PanduanModuleProps> = ({
  onOpenSupabaseConfig,
  isSupabaseConnected,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'katalog_api' | 'setup_api' | 'backend' | 'sql' | 'struktur' | 'koneksi'>('katalog_api');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('get_warga');

  // State untuk pengujian koneksi live
  const [testUrl, setTestUrl] = useState(localStorage.getItem('sim_rt_supabase_url') || '');
  const [testKey, setTestKey] = useState(localStorage.getItem('sim_rt_supabase_key') || '');
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Selected backend code file to view in Backend tab
  const [selectedBackendFile, setSelectedBackendFile] = useState<'serverClient' | 'apiWarga' | 'apiIuran' | 'apiBerita'>('serverClient');

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const apiEndpoints: ApiEndpointDoc[] = [
    {
      id: 'get_warga',
      method: 'GET',
      path: '/api/warga',
      title: 'Ambil Data Seluruh Warga & Pencarian',
      description: 'Mengambil daftar seluruh kepala keluarga terdaftar. Mendukung pencarian teks (nama, nomor HP, plat nomor) serta filter spesifik per blok perumahan.',
      access: 'Publik / Warga',
      params: [
        { name: 'search', type: 'string', required: false, description: 'Kata kunci pencarian (misal: "Bambang", "0812", "B 1234")' },
        { name: 'blok', type: 'string', required: false, description: 'Filter kode blok perumahan (misal: "Blok A1", "Blok B2")' },
      ],
      curlExample: `curl -X GET "https://domain-anda.vercel.app/api/warga?search=Bambang&blok=Blok%20A1"`,
      responseSuccess: `{
  "success": true,
  "data": [
    {
      "id": "11111111-1111-1111-1111-111111111101",
      "blok_rumah": "Blok A1 No. 01",
      "nama_lengkap": "Bambang Triyono, S.T.",
      "no_hp": "081288223344",
      "status_penghuni": "Tetap",
      "jumlah_anggota": 4,
      "pekerjaan": "Wiraswasta / Ketua RT",
      "plat_nomor": "B 1234 KAA",
      "catatan": "Ketua RT 04",
      "created_at": "2026-01-15T08:00:00Z"
    }
  ]
}`,
      responseError: `{
  "success": false,
  "error": "Failed to fetch warga records"
}`,
    },
    {
      id: 'post_warga',
      method: 'POST',
      path: '/api/warga',
      title: 'Tambah Kepala Keluarga / Warga Baru',
      description: 'Menambahkan catatan warga baru ke database perumahan. Divalidasi di sisi serverless sebelum disimpan ke Supabase.',
      access: 'Khusus Admin Pengurus',
      bodyExample: `{
  "blok_rumah": "Blok A2 No. 06",
  "nama_lengkap": "Ir. Joko Sutrisno",
  "no_hp": "081234567890",
  "status_penghuni": "Tetap",
  "jumlah_anggota": 3,
  "pekerjaan": "Arsitek Lanskap",
  "plat_nomor": "B 5432 JST",
  "catatan": "Pindahan dari Bandung"
}`,
      curlExample: `curl -X POST "https://domain-anda.vercel.app/api/warga" \\
  -H "Content-Type: application/json" \\
  -d '{
    "blok_rumah": "Blok A2 No. 06",
    "nama_lengkap": "Ir. Joko Sutrisno",
    "no_hp": "081234567890",
    "status_penghuni": "Tetap",
    "jumlah_anggota": 3
  }'`,
      responseSuccess: `{
  "success": true,
  "message": "Data warga berhasil ditambahkan",
  "data": {
    "id": "778899aa-bbcc-ddee-ff00-112233445566",
    "blok_rumah": "Blok A2 No. 06",
    "nama_lengkap": "Ir. Joko Sutrisno",
    "no_hp": "081234567890",
    "status_penghuni": "Tetap",
    "jumlah_anggota": 3,
    "created_at": "2026-10-07T07:15:00Z"
  }
}`,
      responseError: `{
  "success": false,
  "error": "Kolom blok_rumah, nama_lengkap, no_hp, dan status_penghuni wajib diisi"
}`,
    },
    {
      id: 'get_iuran',
      method: 'GET',
      path: '/api/iuran',
      title: 'Rekapitulasi Iuran 12 Bulan & Ringkasan Kas',
      description: 'Mengambil riwayat pembayaran iuran warga untuk tahun tertentu (default tahun berjalan), lengkap dengan join nama warga dan total kalkulasi penerimaan kas.',
      access: 'Publik / Warga',
      params: [
        { name: 'tahun', type: 'integer', required: false, description: 'Tahun rekap iuran (misal: 2026, 2025). Default: tahun berjalan' },
      ],
      curlExample: `curl -X GET "https://domain-anda.vercel.app/api/iuran?tahun=2026"`,
      responseSuccess: `{
  "success": true,
  "tahun": 2026,
  "totalTerkumpul": 1800000,
  "totalTransaksi": 18,
  "data": [
    {
      "id": "iuran-uuid-1",
      "warga_id": "warga-uuid-1",
      "tahun": 2026,
      "bulan": 1,
      "jumlah_bayar": 100000,
      "status_bayar": "Lunas",
      "tanggal_bayar": "2026-01-05",
      "metode_bayar": "Transfer",
      "nomor_kuitansi": "KWT-2026-01-A101",
      "warga": {
        "blok_rumah": "Blok A1 No. 01",
        "nama_lengkap": "Bambang Triyono, S.T.",
        "no_hp": "081288223344"
      }
    }
  ]
}`,
      responseError: `{
  "success": false,
  "error": "Database error query iuran"
}`,
    },
    {
      id: 'post_iuran',
      method: 'POST',
      path: '/api/iuran',
      title: 'Pencatatan Pembayaran Iuran & Generate Kuitansi',
      description: 'Mencatat pelunasan iuran bulanan untuk rumah warga. Nomor kuitansi resmi (KWT-TAHUN-BULAN-RANDOM) otomatis dihasilkan secara atomik di backend.',
      access: 'Khusus Admin Pengurus',
      bodyExample: `{
  "warga_id": "11111111-1111-1111-1111-111111111101",
  "tahun": 2026,
  "bulan": 3,
  "jumlah_bayar": 100000,
  "metode_bayar": "Transfer",
  "keterangan": "Lunas transfer BCA Kas RT"
}`,
      curlExample: `curl -X POST "https://domain-anda.vercel.app/api/iuran" \\
  -H "Content-Type: application/json" \\
  -d '{
    "warga_id": "11111111-1111-1111-1111-111111111101",
    "tahun": 2026,
    "bulan": 3,
    "jumlah_bayar": 100000,
    "metode_bayar": "Transfer"
  }'`,
      responseSuccess: `{
  "success": true,
  "message": "Pembayaran iuran berhasil dicatat oleh backend",
  "data": {
    "id": "iuran-uuid-generated",
    "warga_id": "11111111-1111-1111-1111-111111111101",
    "tahun": 2026,
    "bulan": 3,
    "jumlah_bayar": 100000,
    "status_bayar": "Lunas",
    "tanggal_bayar": "2026-03-02",
    "metode_bayar": "Transfer",
    "nomor_kuitansi": "KWT-2026-03-8472",
    "dicatat_oleh": "Bendahara RT (via Vercel Backend)"
  }
}`,
      responseError: `{
  "success": false,
  "error": "Bulan harus bernilai antara 1 s.d. 12"
}`,
    },
    {
      id: 'get_berita',
      method: 'GET',
      path: '/api/berita',
      title: 'Daftar Pengumuman, Agenda & Berita Lingkungan',
      description: 'Mengambil seluruh artikel berita dan pengumuman warga. Otomatis menempatkan pengumuman bertanda penting (is_pinned) pada urutan teratas.',
      access: 'Publik / Warga',
      params: [
        { name: 'kategori', type: 'string', required: false, description: 'Filter kategori: "Kerja Bakti", "Keamanan", "Kegiatan", "Keuangan", "Info Penting"' },
      ],
      curlExample: `curl -X GET "https://domain-anda.vercel.app/api/berita?kategori=Keamanan"`,
      responseSuccess: `{
  "success": true,
  "data": [
    {
      "id": "berita-uuid-1",
      "judul": "Giat Kerja Bakti & Fogging Nyamuk DBD",
      "kategori": "Kerja Bakti",
      "ringkasan": "Kerja bakti hari Minggu pagi di fasum Blok B.",
      "isi": "Sehubungan dengan musim penghujan...",
      "tanggal": "2026-10-05",
      "penulis": "Sie Kebersihan & Lingkungan",
      "is_pinned": true
    }
  ]
}`,
      responseError: `{
  "success": false,
  "error": "Gagal mengambil data pengumuman"
}`,
    },
    {
      id: 'post_berita',
      method: 'POST',
      path: '/api/berita',
      title: 'Penerbitan Pengumuman Baru',
      description: 'Menerbitkan pengumuman resmi dari pengurus RT/RW ke papan informasi digital seluruh warga.',
      access: 'Khusus Admin Pengurus',
      bodyExample: `{
  "judul": "Sosialisasi Jadwal Posyandu Balita & Lansia",
  "kategori": "Kegiatan",
  "isi": "Pemeriksaan kesehatan gratis diadakan pada hari Sabtu pukul 08.30 di Balai Warga.",
  "ringkasan": "Pemeriksaan kesehatan gratis di Balai Warga Sabtu ini.",
  "penulis": "Kader Posyandu Dahlia",
  "is_pinned": false
}`,
      curlExample: `curl -X POST "https://domain-anda.vercel.app/api/berita" \\
  -H "Content-Type: application/json" \\
  -d '{
    "judul": "Sosialisasi Jadwal Posyandu",
    "kategori": "Kegiatan",
    "isi": "Pemeriksaan kesehatan gratis...",
    "penulis": "Kader Posyandu"
  }'`,
      responseSuccess: `{
  "success": true,
  "message": "Pengumuman berhasil diterbitkan",
  "data": {
    "id": "berita-uuid-new",
    "judul": "Sosialisasi Jadwal Posyandu",
    "kategori": "Kegiatan",
    "tanggal": "2026-10-07",
    "penulis": "Kader Posyandu"
  }
}`,
      responseError: `{
  "success": false,
  "error": "Judul, kategori, dan isi pengumuman wajib diisi"
}`,
    },
  ];

  const selectedDoc = apiEndpoints.find((e) => e.id === selectedEndpointId) || apiEndpoints[0];

  const backendCodeSnippets = {
    serverClient: `// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseServer = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export default supabaseServer;`,

    apiWarga: `// app/api/warga/route.ts
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const blok = searchParams.get('blok') || '';

    let query = supabaseServer.from('warga').select('*').order('blok_rumah', { ascending: true });
    if (blok && blok !== 'all') query = query.ilike('blok_rumah', \`\${blok}%\`);
    if (search) query = query.or(\`nama_lengkap.ilike.%\${search}%,blok_rumah.ilike.%\${search}%\`);

    const { data, error } = await query;
    if (error) return Response.json({ success: false, error: error.message }, { status: 400 });
    return Response.json({ success: true, data });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { blok_rumah, nama_lengkap, no_hp, status_penghuni, jumlah_anggota } = body;
    if (!blok_rumah || !nama_lengkap || !no_hp) {
      return Response.json({ success: false, error: 'Data wajib belum lengkap' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('warga')
      .insert([{ blok_rumah, nama_lengkap, no_hp, status_penghuni: status_penghuni || 'Tetap', jumlah_anggota: jumlah_anggota || 1 }])
      .select().single();

    if (error) return Response.json({ success: false, error: error.message }, { status: 400 });
    return Response.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}`,

    apiIuran: `// app/api/iuran/route.ts
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tahun = parseInt(searchParams.get('tahun') || '2026', 10);

    const { data, error } = await supabaseServer
      .from('iuran')
      .select('*, warga:warga_id(blok_rumah, nama_lengkap)')
      .eq('tahun', tahun)
      .order('bulan', { ascending: true });

    if (error) return Response.json({ success: false, error: error.message }, { status: 400 });

    const totalTerkumpul = data.reduce((sum, item) => item.status_bayar === 'Lunas' ? sum + Number(item.jumlah_bayar) : sum, 0);
    return Response.json({ success: true, tahun, totalTerkumpul, data });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { warga_id, tahun, bulan, jumlah_bayar, metode_bayar } = body;
    const padBulan = String(bulan).padStart(2, '0');
    const nomorKuitansi = \`KWT-\${tahun}-\${padBulan}-\${Math.floor(1000 + Math.random() * 9000)}\`;

    const { data, error } = await supabaseServer
      .from('iuran')
      .upsert({
        warga_id, tahun, bulan,
        jumlah_bayar: jumlah_bayar || 100000,
        status_bayar: 'Lunas',
        tanggal_bayar: new Date().toISOString().split('T')[0],
        metode_bayar: metode_bayar || 'Transfer',
        nomor_kuitansi: nomorKuitansi,
        dicatat_oleh: 'Bendahara RT (via Vercel Backend)',
      }, { onConflict: 'warga_id,tahun,bulan' })
      .select().single();

    if (error) return Response.json({ success: false, error: error.message }, { status: 400 });
    return Response.json({ success: true, data });
  } catch (err: any) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}`,

    apiBerita: `// app/api/berita/route.ts
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET() {
  const { data, error } = await supabaseServer
    .from('berita')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('tanggal', { ascending: false });

  if (error) return Response.json({ success: false, error: error.message }, { status: 400 });
  return Response.json({ success: true, data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { judul, kategori, isi, penulis, is_pinned } = body;

  const { data, error } = await supabaseServer
    .from('berita')
    .insert([{
      judul, kategori, isi,
      ringkasan: isi.slice(0, 160),
      tanggal: new Date().toISOString().split('T')[0],
      penulis: penulis || 'Pengurus RT 04',
      is_pinned: Boolean(is_pinned),
    }])
    .select().single();

  if (error) return Response.json({ success: false, error: error.message }, { status: 400 });
  return Response.json({ success: true, data }, { status: 201 });
}`,
  };

  const sqlSchemaText = `-- SKEMA DATABASE SUPABASE UNTUK RT/RW (Tabel warga, iuran, berita, RLS)
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

CREATE TABLE IF NOT EXISTS public.iuran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warga_id UUID NOT NULL REFERENCES public.warga(id) ON DELETE CASCADE,
    tahun INT NOT NULL,
    bulan INT NOT NULL CHECK (bulan BETWEEN 1 AND 12),
    jumlah_bayar NUMERIC(12, 2) NOT NULL DEFAULT 100000,
    status_bayar VARCHAR(20) NOT NULL DEFAULT 'Lunas' CHECK (status_bayar IN ('Lunas', 'Belum Bayar', 'Menunggu')),
    tanggal_bayar DATE,
    metode_bayar VARCHAR(30) DEFAULT 'Transfer',
    nomor_kuitansi VARCHAR(50),
    dicatat_oleh VARCHAR(100),
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_warga_tahun_bulan UNIQUE (warga_id, tahun, bulan)
);

CREATE TABLE IF NOT EXISTS public.berita (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul VARCHAR(255) NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    isi TEXT NOT NULL,
    ringkasan VARCHAR(300),
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    penulis VARCHAR(100) DEFAULT 'Pengurus RT 04',
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AKTIFKAN RLS
ALTER TABLE public.warga ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iuran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berita ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Publik baca data warga" ON public.warga FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Publik baca rekap iuran" ON public.iuran FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Publik baca berita" ON public.berita FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Pengurus kelola warga" ON public.warga FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Pengurus kelola iuran" ON public.iuran FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Pengurus kelola berita" ON public.berita FOR ALL TO authenticated USING (true) WITH CHECK (true);`;

  const envSampleText = `# Environment Variables di Vercel Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# Rahasia Khusus Backend Serverless Vercel (Jangan pakai NEXT_PUBLIC_):
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

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
          Katalog API & Panduan Setup Vercel + Supabase
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Daftar lengkap endpoint API RESTful, cara setup kredensial di Vercel, serta contoh request & response.
        </p>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl max-w-4xl text-xs sm:text-sm font-semibold overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveSubTab('katalog_api')}
          className={`py-2 px-3.5 rounded-lg transition-colors whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
            activeSubTab === 'katalog_api'
              ? 'bg-emerald-600 text-white shadow-xs font-bold'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          1. Daftar Lengkap API
        </button>
        <button
          onClick={() => setActiveSubTab('setup_api')}
          className={`py-2 px-3.5 rounded-lg transition-colors whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
            activeSubTab === 'setup_api'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          2. Keterangan Setup API
        </button>
        <button
          onClick={() => setActiveSubTab('backend')}
          className={`py-2 px-3.5 rounded-lg transition-colors whitespace-nowrap text-center flex items-center justify-center gap-1.5 ${
            activeSubTab === 'backend'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Server className="w-4 h-4" />
          3. Kode Route Handlers
        </button>
        <button
          onClick={() => setActiveSubTab('sql')}
          className={`py-2 px-3.5 rounded-lg transition-colors whitespace-nowrap text-center ${
            activeSubTab === 'sql'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Skema SQL
        </button>
        <button
          onClick={() => setActiveSubTab('koneksi')}
          className={`py-2 px-3.5 rounded-lg transition-colors whitespace-nowrap text-center ${
            activeSubTab === 'koneksi'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Uji Koneksi
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: DAFTAR LENGKAP API (KATALOG ENDPOINTS) */}
      {/* ======================================================== */}
      {activeSubTab === 'katalog_api' && (
        <div className="space-y-6">
          {/* Quick Summary Cards of all APIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">MODUL WARGA</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">2 Endpoints</div>
              <div className="text-xs text-slate-500 mt-1">
                <code>GET /api/warga</code> & <code>POST /api/warga</code>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">MODUL IURAN BULANAN</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">2 Endpoints</div>
              <div className="text-xs text-slate-500 mt-1">
                <code>GET /api/iuran</code> & <code>POST /api/iuran</code>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">MODUL PENGUMUMAN</span>
              <div className="text-base font-bold text-slate-900 mt-0.5">2 Endpoints</div>
              <div className="text-xs text-slate-500 mt-1">
                <code>GET /api/berita</code> & <code>POST /api/berita</code>
              </div>
            </div>
          </div>

          {/* Interactive Endpoint Explorer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Endpoint List Selector */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase tracking-wider">
                Pilih Endpoint API
              </div>
              <div className="divide-y divide-slate-100">
                {apiEndpoints.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => setSelectedEndpointId(ep.id)}
                    className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1 ${
                      selectedEndpointId === ep.id
                        ? 'bg-emerald-50/70 border-l-4 border-emerald-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold font-mono ${
                            ep.method === 'GET'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {ep.method}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {ep.path}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 font-medium line-clamp-1">
                      {ep.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Detailed Endpoint Inspector */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
              {/* Endpoint Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-black font-mono tracking-wider ${
                        selectedDoc.method === 'GET'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {selectedDoc.method}
                    </span>
                    <span className="font-mono text-base font-bold text-slate-900">
                      {selectedDoc.path}
                    </span>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      selectedDoc.access.includes('Admin')
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {selectedDoc.access}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {selectedDoc.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {selectedDoc.description}
                </p>
              </div>

              {/* Query Parameters (if GET) */}
              {selectedDoc.params && selectedDoc.params.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Query Parameters (URL)
                  </h4>
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Parameter</th>
                          <th className="py-2 px-3">Tipe</th>
                          <th className="py-2 px-3">Wajib</th>
                          <th className="py-2 px-3">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedDoc.params.map((p) => (
                          <tr key={p.name}>
                            <td className="py-2 px-3 font-mono font-bold text-emerald-700">{p.name}</td>
                            <td className="py-2 px-3 font-mono text-slate-500">{p.type}</td>
                            <td className="py-2 px-3">
                              {p.required ? (
                                <span className="text-rose-600 font-semibold">Ya</span>
                              ) : (
                                <span className="text-slate-400">Opsional</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-600">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Request Body Example (if POST) */}
              {selectedDoc.bodyExample && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Request Body (application/json)
                    </h4>
                    <button
                      onClick={() => copyToClipboard('body', selectedDoc.bodyExample || '')}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                    >
                      {copiedKey === 'body' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey === 'body' ? 'Tersalin' : 'Salin JSON'}
                    </button>
                  </div>
                  <pre className="p-3.5 bg-slate-950 rounded-lg font-mono text-xs text-slate-200 overflow-x-auto custom-scrollbar">
                    {selectedDoc.bodyExample}
                  </pre>
                </div>
              )}

              {/* cURL Example */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Contoh Eksekusi cURL / Terminal
                  </h4>
                  <button
                    onClick={() => copyToClipboard('curl', selectedDoc.curlExample)}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                  >
                    {copiedKey === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'curl' ? 'Tersalin' : 'Salin cURL'}
                  </button>
                </div>
                <pre className="p-3.5 bg-slate-900 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto custom-scrollbar">
                  {selectedDoc.curlExample}
                </pre>
              </div>

              {/* Success Response Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Respons Sukses (HTTP 200 / 201)
                  </span>
                  <button
                    onClick={() => copyToClipboard('resp_ok', selectedDoc.responseSuccess)}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    {copiedKey === 'resp_ok' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    Salin
                  </button>
                </div>
                <pre className="p-3.5 bg-slate-950 rounded-lg font-mono text-xs text-emerald-300 overflow-x-auto max-h-56 custom-scrollbar">
                  {selectedDoc.responseSuccess}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: KETERANGAN SETUP API LENGKAP */}
      {/* ======================================================== */}
      {activeSubTab === 'setup_api' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Keterangan Lengkap Penyiapan (Setup) API
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Berikut adalah 4 tahapan teknis menghubungkan API backend di Vercel dengan database Supabase:
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Step A */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">A</span>
                  1. Penyediaan Tabel Database & Row Level Security (Supabase)
                </div>
                <p className="text-slate-600 leading-relaxed text-xs">
                  Sebelum API dapat diakses, tabel <code>warga</code>, <code>iuran</code>, <code>berita</code>, dan <code>pengaturan_rt</code> harus sudah dibuat di Supabase melalui tab <strong>SQL Editor</strong>. Kebijakan RLS (Row Level Security) otomatis memberikan hak akses baca publik untuk transparansi warga, dan membatasi manipulasi data hanya untuk admin.
                </p>
              </div>

              {/* Step B */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">B</span>
                  2. Memahami Dua Macam Kunci API (Anon vs Service Role)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="font-mono font-bold text-blue-700 block mb-1">
                      NEXT_PUBLIC_SUPABASE_ANON_KEY
                    </span>
                    <p className="text-slate-600">
                      Kunci publik yang boleh dibaca browser. Dibatasi oleh aturan RLS agar warga umum tidak bisa menghapus data orang lain.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="font-mono font-bold text-amber-700 block mb-1">
                      SUPABASE_SERVICE_ROLE_KEY
                    </span>
                    <p className="text-slate-600">
                      Kunci rahasia khusus serverless backend Vercel. Memiliki hak akses bypass RLS untuk transaksi admin, kalkulasi kas, dan generate kuitansi otomatis. <strong>Jangan gunakan prefiks NEXT_PUBLIC_!</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Step C */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">C</span>
                  3. Pemasangan Environment Variables di Vercel Dashboard
                </div>
                <p className="text-slate-600 leading-relaxed text-xs">
                  Buka <strong>Project Settings → Environment Variables</strong> di Vercel, lalu pasang:
                </p>
                <div className="relative">
                  <pre className="p-3 bg-slate-950 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto">
                    {envSampleText}
                  </pre>
                  <button
                    onClick={() => copyToClipboard('env', envSampleText)}
                    className="absolute right-3 top-3 px-2.5 py-1 bg-slate-800 text-white text-[11px] font-semibold rounded hover:bg-slate-700 flex items-center gap-1"
                  >
                    {copiedKey === 'env' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === 'env' ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
              </div>

              {/* Step D */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">D</span>
                  4. Pemanggilan API di Frontend React / Next.js
                </div>
                <p className="text-slate-600 leading-relaxed text-xs">
                  Di sisi antarmuka, Anda cukup menggunakan fungsi <code>fetch('/api/warga')</code> atau <code>fetch('/api/iuran')</code>. Next.js dan Vercel secara otomatis mengarahkan panggilan tersebut ke Serverless Function terkait tanpa konfigurasi CORS tambahan.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: KODE ROUTE HANDLERS BACKEND */}
      {/* ======================================================== */}
      {activeSubTab === 'backend' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Pilih File Kode Backend untuk Disalin:
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  File ini sudah dibuat di repositori dan siap di-deploy langsung ke Vercel.
                </p>
              </div>

              <button
                onClick={() =>
                  copyToClipboard(selectedBackendFile, backendCodeSnippets[selectedBackendFile])
                }
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {copiedKey === selectedBackendFile ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedKey === selectedBackendFile ? 'Tersalin!' : 'Salin File Ini'}
              </button>
            </div>

            <div className="flex border-b border-slate-200 bg-slate-100/60 px-4 pt-2 gap-2 overflow-x-auto text-xs font-mono">
              <button
                onClick={() => setSelectedBackendFile('serverClient')}
                className={`py-2 px-3 border-b-2 font-bold transition-colors whitespace-nowrap ${
                  selectedBackendFile === 'serverClient'
                    ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                lib/supabaseServer.ts
              </button>
              <button
                onClick={() => setSelectedBackendFile('apiWarga')}
                className={`py-2 px-3 border-b-2 font-bold transition-colors whitespace-nowrap ${
                  selectedBackendFile === 'apiWarga'
                    ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                app/api/warga/route.ts
              </button>
              <button
                onClick={() => setSelectedBackendFile('apiIuran')}
                className={`py-2 px-3 border-b-2 font-bold transition-colors whitespace-nowrap ${
                  selectedBackendFile === 'apiIuran'
                    ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                app/api/iuran/route.ts
              </button>
              <button
                onClick={() => setSelectedBackendFile('apiBerita')}
                className={`py-2 px-3 border-b-2 font-bold transition-colors whitespace-nowrap ${
                  selectedBackendFile === 'apiBerita'
                    ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                app/api/berita/route.ts
              </button>
            </div>

            <div className="p-4 bg-slate-950 overflow-x-auto">
              <pre className="text-xs text-emerald-400 font-mono leading-relaxed max-h-[420px] overflow-y-auto custom-scrollbar">
                {backendCodeSnippets[selectedBackendFile]}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 4: SKEMA SQL */}
      {/* ======================================================== */}
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
              onClick={() => copyToClipboard('sql', sqlSchemaText)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
            >
              {copiedKey === 'sql' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedKey === 'sql' ? 'Berhasil Disalin!' : 'Salin Skema SQL'}
            </button>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 overflow-hidden relative">
            <pre className="text-xs text-slate-200 font-mono overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar p-2 leading-relaxed">
              {sqlSchemaText}
            </pre>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 5: UJI KONEKSI */}
      {/* ======================================================== */}
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
