import React, { useState, useMemo } from 'react';
import { 
  CreditCard, Search, Calendar, CheckCircle2, XCircle, 
  Clock, Download, Receipt, ArrowUpDown, Filter, ChevronLeft, 
  ChevronRight, Sparkles, Building2, Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Warga, Iuran, StatusBayar, MetodeBayar, PengaturanRT } from '../types';
import { BULAN_NAMES, BULAN_SHORT, formatRupiah } from '../lib/dataStore';

interface IuranModuleProps {
  wargaList: Warga[];
  iuranList: Iuran[];
  pengaturan: PengaturanRT;
  isAdmin: boolean;
  onSaveIuran: (iuran: Omit<Iuran, 'id'>) => void;
  onDeleteIuran: (wargaId: string, tahun: number, bulan: number) => void;
  onOpenAuth: () => void;
  onOpenKuitansi: (iuran: Iuran, warga: Warga) => void;
}

export const IuranModule: React.FC<IuranModuleProps> = ({
  wargaList,
  iuranList,
  pengaturan,
  isAdmin,
  onSaveIuran,
  onDeleteIuran,
  onOpenAuth,
  onOpenKuitansi,
}) => {
  const currentSystemYear = 2026;
  const [selectedYear, setSelectedYear] = useState<number>(currentSystemYear);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lunas_all' | 'ada_tunggakan'>('all');

  // Modal bayar iuran
  const [activeCell, setActiveCell] = useState<{
    warga: Warga;
    bulan: number;
    existingIuran?: Iuran;
  } | null>(null);

  // Form bayar
  const [paymentForm, setPaymentForm] = useState({
    tanggal_bayar: new Date().toISOString().split('T')[0],
    metode_bayar: 'Transfer' as MetodeBayar,
    jumlah_bayar: pengaturan.nominal_iuran,
    nomor_kuitansi: '',
    keterangan: '',
  });

  // Filter warga by search query
  const filteredWarga = useMemo(() => {
    return wargaList.filter((warga) => {
      const matchQuery =
        warga.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warga.blok_rumah.toLowerCase().includes(searchQuery.toLowerCase());
      return matchQuery;
    });
  }, [wargaList, searchQuery]);

  // Map iuran by wargaId + bulan
  const iuranMap = useMemo(() => {
    const map = new Map<string, Iuran>();
    iuranList
      .filter((i) => i.tahun === selectedYear)
      .forEach((item) => {
        map.set(`${item.warga_id}_${item.bulan}`, item);
      });
    return map;
  }, [iuranList, selectedYear]);

  // Hitung total ringkasan tahun ini
  const stats = useMemo(() => {
    const totalKK = wargaList.length;
    const targetSetahun = totalKK * 12 * pengaturan.nominal_iuran;

    const filteredIuran = iuranList.filter(
      (i) => i.tahun === selectedYear && i.status_bayar === 'Lunas'
    );
    const totalTerkumpul = filteredIuran.reduce(
      (sum, item) => sum + Number(item.jumlah_bayar),
      0
    );
    const persentaseTahunan = targetSetahun > 0 ? Math.round((totalTerkumpul / targetSetahun) * 100) : 0;

    // Hitung per bulan (1-12)
    const perBulanTerkumpul: number[] = Array(12).fill(0);
    const perBulanCount: number[] = Array(12).fill(0);

    filteredIuran.forEach((i) => {
      const idx = i.bulan - 1;
      if (idx >= 0 && idx < 12) {
        perBulanTerkumpul[idx] += Number(i.jumlah_bayar);
        perBulanCount[idx] += 1;
      }
    });

    return {
      totalKK,
      targetSetahun,
      totalTerkumpul,
      persentaseTahunan,
      totalTransaksi: filteredIuran.length,
      perBulanTerkumpul,
      perBulanCount,
    };
  }, [wargaList, iuranList, selectedYear, pengaturan.nominal_iuran]);

  const handleCellClick = (warga: Warga, bulan: number) => {
    const existing = iuranMap.get(`${warga.id}_${bulan}`);
    if (existing && existing.status_bayar === 'Lunas') {
      // Jika sudah lunas, langsung tampilkan modal kuitansi atau opsi kelola jika admin
      if (isAdmin) {
        setActiveCell({ warga, bulan, existingIuran: existing });
        setPaymentForm({
          tanggal_bayar: existing.tanggal_bayar || new Date().toISOString().split('T')[0],
          metode_bayar: existing.metode_bayar || 'Transfer',
          jumlah_bayar: existing.jumlah_bayar,
          nomor_kuitansi: existing.nomor_kuitansi || '',
          keterangan: existing.keterangan || '',
        });
      } else {
        onOpenKuitansi(existing, warga);
      }
      return;
    }

    if (!isAdmin) {
      onOpenAuth();
      return;
    }

    // Default kuitansi code
    const padBulan = String(bulan).padStart(2, '0');
    const blokClean = warga.blok_rumah.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase();
    const generatedKwt = `KWT-${selectedYear}-${padBulan}-${blokClean}`;

    setActiveCell({ warga, bulan, existingIuran: undefined });
    setPaymentForm({
      tanggal_bayar: new Date().toISOString().split('T')[0],
      metode_bayar: 'Transfer',
      jumlah_bayar: pengaturan.nominal_iuran,
      nomor_kuitansi: generatedKwt,
      keterangan: `Iuran Bulan ${BULAN_NAMES[bulan - 1]} ${selectedYear}`,
    });
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCell) return;

    onSaveIuran({
      warga_id: activeCell.warga.id,
      tahun: selectedYear,
      bulan: activeCell.bulan,
      jumlah_bayar: paymentForm.jumlah_bayar,
      status_bayar: 'Lunas',
      tanggal_bayar: paymentForm.tanggal_bayar,
      metode_bayar: paymentForm.metode_bayar,
      nomor_kuitansi: paymentForm.nomor_kuitansi,
      dicatat_oleh: 'Bendahara RT',
      keterangan: paymentForm.keterangan,
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    setActiveCell(null);
  };

  const handleCancelPayment = () => {
    if (!activeCell || !activeCell.existingIuran) return;
    onDeleteIuran(activeCell.warga.id, selectedYear, activeCell.bulan);
    setActiveCell(null);
  };

  // Export CSV function
  const handleExportCSV = () => {
    const headers = [
      'Blok Rumah',
      'Nama Kepala Keluarga',
      'No HP',
      'Status Warga',
      ...BULAN_SHORT,
      'Total Terbayar',
    ];

    const rows = wargaList.map((warga) => {
      let total = 0;
      const bulanStatus = BULAN_SHORT.map((_, idx) => {
        const item = iuranMap.get(`${warga.id}_${idx + 1}`);
        if (item && item.status_bayar === 'Lunas') {
          total += Number(item.jumlah_bayar);
          return 'LUNAS';
        }
        return 'BELUM';
      });

      return [
        `"${warga.blok_rumah}"`,
        `"${warga.nama_lengkap}"`,
        `"${warga.no_hp}"`,
        `"${warga.status_penghuni}"`,
        ...bulanStatus,
        total,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Iuran_RT_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            Rekapitulasi Iuran Bulanan
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Matriks pembayaran iuran kebersihan & keamanan warga (Januari – Desember) tahun berjalan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Year Selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
            <button
              onClick={() => setSelectedYear((prev) => prev - 1)}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Tahun Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs sm:text-sm font-bold text-slate-900 font-mono-numbers">
              Tahun {selectedYear}
            </span>
            <button
              onClick={() => setSelectedYear((prev) => prev + 1)}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition-colors"
              title="Tahun Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs sm:text-sm rounded-lg transition-colors shadow-xs flex items-center gap-2"
            title="Download Spreadsheet"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Iuran Terkumpul ({selectedYear})
            </span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-numbers">
            {formatRupiah(stats.totalTerkumpul)}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Target 1 Tahun: {formatRupiah(stats.targetSetahun)}</span>
            <span className="font-semibold text-emerald-600">{stats.persentaseTahunan}% Tercapai</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.persentaseTahunan)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Besaran Iuran Bulanan
            </span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-numbers">
            {formatRupiah(pengaturan.nominal_iuran)}
            <span className="text-xs font-normal text-slate-500"> / KK / Bulan</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Termasuk iuran sampah warga, gaji 3 satpam cluster & pemeliharaan PJU.
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Petunjuk Status Tabel
            </span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                ✓
              </span>
              <span className="font-medium text-slate-700">Hijau = Lunas</span>
              <span className="text-slate-400">· Klik untuk lihat kuitansi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px]">
                ✕
              </span>
              <span className="font-medium text-slate-700">Merah = Belum Bayar</span>
              <span className="text-slate-400">
                · {isAdmin ? 'Klik untuk catat bayar' : 'Silakan lunasi'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari warga atau blok di tabel iuran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="text-xs text-slate-500 w-full sm:w-auto text-right">
          Total Rumah: <span className="font-bold text-slate-800">{filteredWarga.length}</span> KK
        </div>
      </div>

      {/* Grid Rekapitulasi Iuran (12 Bulan) */}
      {filteredWarga.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs space-y-2">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {wargaList.length === 0
              ? 'Database Iuran Bersih (Belum Ada Warga Terdaftar)'
              : 'Tidak Ada Warga yang Cocok dengan Pencarian'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {wargaList.length === 0
              ? 'Tabel rekapitulasi iuran bulanan 12 bulan (Januari - Desember) akan otomatis terbentuk segera setelah data warga ditambahkan ke sistem.'
              : 'Coba sesuaikan kata kunci pencarian warga di atas.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 sticky left-0 bg-slate-50 z-20 shadow-xs">Blok / Rumah</th>
                  <th className="py-3 px-4 min-w-[150px]">Nama Kepala Keluarga</th>
                  {BULAN_SHORT.map((b) => (
                    <th key={b} className="py-3 px-2 text-center min-w-[58px]">
                      {b}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right min-w-[120px]">Total Terbayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWarga.map((warga) => {
                  let totalKKBayar = 0;
                  return (
                    <tr key={warga.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Sticky Alamat */}
                      <td className="py-2.5 px-4 sticky left-0 bg-white font-mono-numbers font-bold text-slate-900 whitespace-nowrap z-10 border-r border-slate-100 shadow-xs">
                        {warga.blok_rumah}
                      </td>

                      {/* Nama KK */}
                      <td className="py-2.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {warga.nama_lengkap}
                      </td>

                      {/* 12 Bulan Grid Cells */}
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((bulan) => {
                        const item = iuranMap.get(`${warga.id}_${bulan}`);
                        const isLunas = item && item.status_bayar === 'Lunas';
                        if (isLunas) {
                          totalKKBayar += Number(item.jumlah_bayar);
                        }

                        return (
                          <td key={bulan} className="py-2 px-1 text-center">
                            <button
                              onClick={() => handleCellClick(warga, bulan)}
                              title={
                                isLunas
                                  ? `Lunas: ${item.nomor_kuitansi || 'Tercatat'} (${item.tanggal_bayar}) - Klik untuk kuitansi`
                                  : `Belum Bayar ${BULAN_NAMES[bulan - 1]} - ${isAdmin ? 'Klik untuk catat bayar' : 'Hubungi bendahara'}`
                              }
                              className={`w-10 h-8 mx-auto rounded font-semibold text-[11px] flex items-center justify-center transition-all ${
                                isLunas
                                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs'
                                  : 'bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-200/60'
                              }`}
                            >
                              {isLunas ? '✓' : '—'}
                            </button>
                          </td>
                        );
                      })}

                      {/* Total Terbayar Setahun */}
                      <td className="py-2.5 px-4 text-right font-mono-numbers font-bold text-slate-900 whitespace-nowrap">
                        {formatRupiah(totalKKBayar)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Tfoot: Rekap Total per Bulan */}
              <tfoot className="bg-slate-100/80 border-t-2 border-slate-200 font-bold text-xs text-slate-800">
                <tr>
                  <td className="py-3 px-4 sticky left-0 bg-slate-100 z-10">TOTAL MASUK</td>
                  <td className="py-3 px-4 font-mono-numbers text-slate-600">
                    {stats.totalTransaksi} transaksi
                  </td>
                  {Array.from({ length: 12 }, (_, i) => (
                    <td key={i} className="py-3 px-1 text-center font-mono-numbers text-[11px]">
                      {stats.perBulanCount[i]} KK
                    </td>
                  ))}
                  <td className="py-3 px-4 text-right font-mono-numbers text-emerald-700">
                    {formatRupiah(stats.totalTerkumpul)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Catat Pembayaran / Edit Status Iuran */}
      {activeCell && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-emerald-600 font-mono-numbers">
                  {activeCell.warga.blok_rumah}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {activeCell.existingIuran ? 'Kelola Iuran Terbayar' : 'Catat Pelunasan Iuran'}
                </h3>
                <p className="text-xs text-slate-500">
                  Bulan {BULAN_NAMES[activeCell.bulan - 1]} {selectedYear} ·{' '}
                  <span className="font-semibold text-slate-700">{activeCell.warga.nama_lengkap}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveCell(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nominal Iuran (Rp)</label>
                <input
                  type="number"
                  required
                  value={paymentForm.jumlah_bayar}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, jumlah_bayar: Number(e.target.value) })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-mono-numbers focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tanggal Bayar</label>
                  <input
                    type="date"
                    required
                    value={paymentForm.tanggal_bayar}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, tanggal_bayar: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Metode Bayar</label>
                  <select
                    value={paymentForm.metode_bayar}
                    onChange={(e) =>
                      setPaymentForm({ ...paymentForm, metode_bayar: e.target.value as MetodeBayar })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Transfer">Transfer Bank</option>
                    <option value="Tunai">Tunai / Cash</option>
                    <option value="QRIS">QRIS Kas RT</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">No. Kuitansi</label>
                <input
                  type="text"
                  required
                  value={paymentForm.nomor_kuitansi}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, nomor_kuitansi: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 font-mono-numbers focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Catatan / Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Lunas via BCA atas nama Bambang"
                  value={paymentForm.keterangan}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, keterangan: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {activeCell.existingIuran ? (
                  <button
                    type="button"
                    onClick={handleCancelPayment}
                    className="px-3.5 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-semibold rounded-lg transition-colors text-xs"
                  >
                    Batal Pelunasan
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCell(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-xs"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-xs text-xs"
                  >
                    Simpan Lunas
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
