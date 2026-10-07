import React from 'react';
import { X, Printer, Share2, CheckCircle2, Building, ShieldCheck } from 'lucide-react';
import { Iuran, Warga, PengaturanRT } from '../types';
import { BULAN_NAMES, formatRupiah } from '../lib/dataStore';

interface KuitansiModalProps {
  iuran: Iuran;
  warga: Warga;
  pengaturan: PengaturanRT;
  onClose: () => void;
}

export const KuitansiModal: React.FC<KuitansiModalProps> = ({
  iuran,
  warga,
  pengaturan,
  onClose,
}) => {
  const bulanName = BULAN_NAMES[iuran.bulan - 1] || 'Bulan';

  const handlePrint = () => {
    window.print();
  };

  const shareText = `Halo Bapak/Ibu ${warga.nama_lengkap} (${warga.blok_rumah}), terima kasih telah melunasi Iuran RT Bulan ${bulanName} ${iuran.tahun}. No Kuitansi: ${iuran.nomor_kuitansi || '-'}. Nominal: ${formatRupiah(iuran.jumlah_bayar)}. Kas RT 04 Griya Harmoni.`;

  const waShareUrl = `https://wa.me/${warga.no_hp.replace(/\D/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden print:m-0 print:border-none print:shadow-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold">Bukti Pembayaran Kuitansi Digital</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs flex items-center gap-1 transition-colors"
              title="Kirim ke WhatsApp Warga"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kirim WA</span>
            </a>
            <button
              onClick={handlePrint}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs flex items-center gap-1 transition-colors"
              title="Cetak Kuitansi"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Kuitansi Container */}
        <div className="p-6 sm:p-8 bg-amber-50/20 border-b-4 border-emerald-600 space-y-6 text-slate-800">
          {/* Header Surat Kuitansi */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold tracking-wider uppercase text-slate-900">
                PENGURUS {pengaturan.rt_rw}
              </h2>
              <div className="text-xs text-slate-600 font-medium">
                {pengaturan.nama_perumahan}
              </div>
              <div className="text-[11px] text-slate-500">
                Kel. {pengaturan.kelurahan}, Kec. {pengaturan.kecamatan}, {pengaturan.kota}
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded uppercase tracking-wider block">
                KUITANSI RESMI
              </span>
              <span className="text-xs font-mono font-semibold text-slate-600 block mt-1">
                {iuran.nomor_kuitansi || 'KWT-REKAP-001'}
              </span>
            </div>
          </div>

          {/* Isi Kuitansi */}
          <div className="space-y-3.5 text-xs sm:text-sm">
            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4 text-slate-500 font-medium">Telah Diterima Dari</span>
              <span className="col-span-8 font-bold text-slate-900">
                : {warga.nama_lengkap} ({warga.blok_rumah})
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4 text-slate-500 font-medium">Uang Sejumlah</span>
              <span className="col-span-8 font-semibold italic text-slate-800 bg-white/70 p-2 rounded border border-dashed border-slate-300">
                : Seratus Ribu Rupiah
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4 text-slate-500 font-medium">Untuk Pembayaran</span>
              <span className="col-span-8 text-slate-800">
                : Iuran Keamanan, Kebersihan, dan Pengelolaan Lingkungan Bulan{' '}
                <strong className="text-slate-900 font-bold">{bulanName} {iuran.tahun}</strong>
              </span>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <span className="col-span-4 text-slate-500 font-medium">Metode Pembayaran</span>
              <span className="col-span-8 text-slate-800">
                : {iuran.metode_bayar || 'Transfer'} (Tanggal: {iuran.tanggal_bayar || '-'})
              </span>
            </div>
          </div>

          {/* Nominal Box & Stamp Section */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="bg-emerald-50 border-2 border-emerald-600 rounded-xl px-5 py-3 text-center sm:text-left">
              <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider block">
                JUMLAH DITERIMA
              </span>
              <span className="text-2xl font-black text-emerald-800 font-mono-numbers">
                {formatRupiah(iuran.jumlah_bayar)}
              </span>
            </div>

            <div className="text-center sm:text-right relative">
              <div className="text-xs text-slate-600">
                {pengaturan.kota.split(',')[0]}, {iuran.tanggal_bayar || '2026-03-01'}
              </div>
              <div className="text-xs font-semibold text-slate-800 mt-0.5">
                Bendahara RT 04 / RW 08
              </div>

              {/* Stempel Digital Cap RT */}
              <div className="my-2 inline-flex items-center justify-center p-2 border-2 border-emerald-600/80 rounded-full text-emerald-700/80 transform -rotate-6 font-bold text-[10px] tracking-wider uppercase">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                LUNAS · KAS RT 04
              </div>

              <div className="text-xs font-bold text-slate-900 underline">
                {pengaturan.atas_nama_rekening}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info (print:hidden) */}
        <div className="p-4 bg-slate-50 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <span>Kuitansi digital sah terverifikasi dalam sistem RT/RW</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
