import React from 'react';
import { Users, CreditCard, Bell, ShieldCheck, ArrowRight, Wallet, CheckCircle2 } from 'lucide-react';
import { Warga, Iuran, PengaturanRT } from '../types';
import { formatRupiah } from '../lib/dataStore';

interface HeroSectionProps {
  wargaList: Warga[];
  iuranList: Iuran[];
  pengaturan: PengaturanRT;
  onNavigate: (tab: 'warga' | 'iuran' | 'berita' | 'panduan') => void;
  isAdmin: boolean;
  onOpenAuth: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  wargaList,
  iuranList,
  pengaturan,
  onNavigate,
  isAdmin,
  onOpenAuth,
}) => {
  const currentYear = 2026;
  const currentMonth = 3; // Maret 2026

  // Hitung metrik
  const totalKK = wargaList.length;
  const wargaTetap = wargaList.filter((w) => w.status_penghuni === 'Tetap').length;
  const wargaKontrak = wargaList.filter((w) => w.status_penghuni === 'Kontrak').length;

  // Iuran tahun berjalan yang lunas
  const iuranTahunIni = iuranList.filter((i) => i.tahun === currentYear && i.status_bayar === 'Lunas');
  const totalUangMasuk = iuranTahunIni.reduce((acc, curr) => acc + Number(curr.jumlah_bayar), 0);

  // Target s.d. bulan berjalan (Jan-Mar = 3 bulan * totalKK * nominal)
  const targetKuartal = totalKK * currentMonth * pengaturan.nominal_iuran;
  const persentaseLunas = targetKuartal > 0 ? Math.min(100, Math.round((totalUangMasuk / targetKuartal) * 100)) : 0;

  return (
    <div className="space-y-8">
      {/* Hero Banner with Housing Photography */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm bg-slate-900 text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/housing_cluster_hero_1791375028125.jpg"
            alt="Perumahan Griya Harmoni Asri"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-35 object-center"
            onError={(e) => {
              // Fallback styled background
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-950/60" />
        </div>

        <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14 max-w-4xl">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PORTAL RESMI WARGA RT 04 / RW 08</span>
            <span aria-hidden="true">·</span>
            <span>KELURAHAN SUKAMAJU</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-4 text-balance">
            Sistem Informasi Warga & Rekapitulasi Iuran Lingkungan
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
            Selamat datang di portal transparansi Perumahan Griya Harmoni Asri. Pantau pencatatan data keluarga, 
            status pembayaran iuran bulanan secara real-time, dan agenda kegiatan warga secara terbuka serta terpercaya.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('iuran')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm rounded-lg transition-colors shadow-sm flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Cek Iuran Rumah Anda
            </button>
            <button
              onClick={() => onNavigate('warga')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm rounded-lg border border-white/20 transition-colors flex items-center gap-2 backdrop-blur-sm"
            >
              <Users className="w-4 h-4" />
              Direktori Warga & Rumah
            </button>
            <button
              onClick={() => onNavigate('panduan')}
              className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-medium text-xs sm:text-sm rounded-lg border border-slate-700 transition-colors flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Skema SQL & Panduan Vercel
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total KK */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">TOTAL KEPALA KELUARGA</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono-numbers">{totalKK}</span>
            <span className="text-xs text-slate-500">Rumah / KK</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{wargaTetap} Tetap</span>
            <span aria-hidden="true">·</span>
            <span>{wargaKontrak} Kontrak</span>
          </div>
        </div>

        {/* Metric 2: Kas Iuran Terkumpul */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">IURAN TERKUMPUL (2026)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono-numbers">
              {formatRupiah(totalUangMasuk)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{iuranTahunIni.length} Transaksi Tercatat</span>
            <span className="text-emerald-600 font-semibold">{persentaseLunas}% Q1</span>
          </div>
        </div>

        {/* Metric 3: Rekening Kas RT */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">REKENING RESMI IURAN</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900">{pengaturan.nama_bank}</div>
          <div className="text-xs font-mono font-semibold text-slate-700 tracking-wider mt-0.5">
            {pengaturan.no_rekening}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 truncate">
            a.n. {pengaturan.atas_nama_rekening}
          </div>
        </div>

        {/* Metric 4: Keamanan & Hotline */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">POS SATPAM & DARURAT</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900">24 Jam Standby</div>
          <div className="text-xs font-mono font-semibold text-slate-700 tracking-wider mt-0.5">
            {pengaturan.nomor_hotline_keamanan}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>8 CCTV Aktif Normal</span>
          </div>
        </div>
      </div>

      {/* Quick Action Banner for Pengurus or Warga */}
      <div className="bg-slate-100/70 border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            {isAdmin ? 'Mode Administrator Pengurus RT Aktif' : 'Portal Informasi Terbuka untuk Seluruh Warga'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {isAdmin
              ? 'Anda memiliki hak akses penuh untuk menambah/mengedit warga, mencatat iuran bulanan, dan menerbitkan berita pengumuman.'
              : 'Warga dapat melihat direktori rumah, transparansi setoran iuran, dan agenda gotong royong secara bebas.'}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2.5">
          {!isAdmin && (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              Masuk sebagai Pengurus
            </button>
          )}
          <button
            onClick={() => onNavigate('berita')}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5" />
            Agenda & Pengumuman
          </button>
        </div>
      </div>
    </div>
  );
};
