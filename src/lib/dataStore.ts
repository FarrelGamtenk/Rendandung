import { Warga, Iuran, Berita, PengaturanRT } from '../types';

export const INITIAL_PENGATURAN: PengaturanRT = {
  id: 'primary',
  nama_perumahan: 'Komplek Griya Harmoni Asri',
  rt_rw: 'RT 04 / RW 08',
  kelurahan: 'Sukamaju',
  kecamatan: 'Cilodong',
  kota: 'Kota Depok, Jawa Barat',
  nominal_iuran: 100000,
  nama_bank: 'Bank Central Asia (BCA)',
  no_rekening: '8820-1928-44',
  atas_nama_rekening: 'Kas RT 04 Griya Harmoni',
  nomor_hotline_keamanan: '0812-9988-7766',
};

export const INITIAL_WARGA: Warga[] = [
  {
    id: 'w-1',
    blok_rumah: 'Blok A1 No. 01',
    nama_lengkap: 'Bambang Triyono, S.T.',
    no_hp: '081288223344',
    status_penghuni: 'Tetap',
    jumlah_anggota: 4,
    pekerjaan: 'Wiraswasta / Ketua RT',
    plat_nomor: 'B 1234 KAA',
    catatan: 'Ketua RT periode 2024-2027',
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    id: 'w-2',
    blok_rumah: 'Blok A1 No. 02',
    nama_lengkap: 'H. Rahmat Hidayat',
    no_hp: '081399887711',
    status_penghuni: 'Tetap',
    jumlah_anggota: 3,
    pekerjaan: 'PNS Kemenkeu',
    plat_nomor: 'B 3456 TRH',
    catatan: 'Penasihat Lingkungan Warga',
    created_at: '2024-01-15T08:30:00Z',
  },
  {
    id: 'w-3',
    blok_rumah: 'Blok A1 No. 03',
    nama_lengkap: 'Dimas Satria Wibowo',
    no_hp: '085711223399',
    status_penghuni: 'Kontrak',
    jumlah_anggota: 2,
    pekerjaan: 'Software Engineer',
    plat_nomor: 'B 6789 DSW',
    catatan: 'Kontrak 2 tahun s.d. Desember 2027',
    created_at: '2024-02-01T10:00:00Z',
  },
  {
    id: 'w-4',
    blok_rumah: 'Blok A2 No. 05',
    nama_lengkap: 'dr. Siti Nurhaliza',
    no_hp: '081822334455',
    status_penghuni: 'Tetap',
    jumlah_anggota: 4,
    pekerjaan: 'Dokter Umum RSUD',
    plat_nomor: 'B 4321 SNH',
    catatan: 'Koordinator Posyandu Balita & Lansia',
    created_at: '2024-02-10T09:00:00Z',
  },
  {
    id: 'w-5',
    blok_rumah: 'Blok B1 No. 08',
    nama_lengkap: 'Ir. Hendra Gunawan',
    no_hp: '081277665544',
    status_penghuni: 'Tetap',
    jumlah_anggota: 5,
    pekerjaan: 'Kontraktor Sipil',
    plat_nomor: 'B 8765 HG',
    catatan: 'Sie Pembangunan & Fasum',
    created_at: '2024-02-15T11:00:00Z',
  },
  {
    id: 'w-6',
    blok_rumah: 'Blok B1 No. 09',
    nama_lengkap: 'Ahmad Zulkarnain',
    no_hp: '081900112233',
    status_penghuni: 'Kontrak',
    jumlah_anggota: 3,
    pekerjaan: 'Karyawan Swasta',
    plat_nomor: 'B 9988 AZ',
    catatan: 'Penyewa baru per Januari 2026',
    created_at: '2024-03-01T08:00:00Z',
  },
  {
    id: 'w-7',
    blok_rumah: 'Blok B2 No. 12',
    nama_lengkap: 'Agus Prasetyo, M.M.',
    no_hp: '081234567800',
    status_penghuni: 'Tetap',
    jumlah_anggota: 4,
    pekerjaan: 'Manajer Perbankan',
    plat_nomor: 'B 2345 AP',
    catatan: 'Bendahara Kas RT',
    created_at: '2024-03-05T14:00:00Z',
  },
  {
    id: 'w-8',
    blok_rumah: 'Blok C1 No. 04',
    nama_lengkap: 'Eko Yulianto',
    no_hp: '087811992288',
    status_penghuni: 'Tetap',
    jumlah_anggota: 3,
    pekerjaan: 'Arsitek Desain',
    plat_nomor: 'B 5678 EY',
    catatan: 'Sie Olahraga & Kepemudaan',
    created_at: '2024-03-12T10:00:00Z',
  },
  {
    id: 'w-9',
    blok_rumah: 'Blok C2 No. 07',
    nama_lengkap: 'Fajar Maulana Malik',
    no_hp: '085299443322',
    status_penghuni: 'Kontrak',
    jumlah_anggota: 2,
    pekerjaan: 'Digital Marketer',
    plat_nomor: 'B 7890 FMM',
    catatan: 'Sering dinas luar kota',
    created_at: '2024-04-02T13:00:00Z',
  },
  {
    id: 'w-10',
    blok_rumah: 'Blok D1 No. 02',
    nama_lengkap: 'Drs. H. Sugeng Riyadi',
    no_hp: '081122338877',
    status_penghuni: 'Tetap',
    jumlah_anggota: 5,
    pekerjaan: 'Pensiunan BUMN',
    plat_nomor: 'B 3322 SR',
    catatan: 'Sesepuh Blok D',
    created_at: '2024-04-10T16:00:00Z',
  },
];

export const INITIAL_IURAN: Iuran[] = [
  // Bambang (w-1) - Lunas Jan, Feb, Mar 2026
  { id: 'i-1-1', warga_id: 'w-1', tahun: 2026, bulan: 1, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-01-05', metode_bayar: 'Transfer', nomor_kuitansi: 'KWT-2026-01-A101', dicatat_oleh: 'Bendahara RT' },
  { id: 'i-1-2', warga_id: 'w-1', tahun: 2026, bulan: 2, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-02-04', metode_bayar: 'Transfer', nomor_kuitansi: 'KWT-2026-02-A101', dicatat_oleh: 'Bendahara RT' },
  { id: 'i-1-3', warga_id: 'w-1', tahun: 2026, bulan: 3, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-03-02', metode_bayar: 'Transfer', nomor_kuitansi: 'KWT-2026-03-A101', dicatat_oleh: 'Bendahara RT' },
  { id: 'i-1-4', warga_id: 'w-1', tahun: 2026, bulan: 4, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-04-03', metode_bayar: 'Transfer', nomor_kuitansi: 'KWT-2026-04-A101', dicatat_oleh: 'Bendahara RT' },

  // H. Rahmat (w-2) - Lunas Jan, Feb 2026
  { id: 'i-2-1', warga_id: 'w-2', tahun: 2026, bulan: 1, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-01-10', metode_bayar: 'Transfer', nomor_kuitansi: 'KWT-2026-01-A102', dicatat_oleh: 'Bendahara RT' },
  { id: 'i-2-2', warga_id: 'w-2', tahun: 2026, bulan: 2, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-02-08', metode_bayar: 'Transfer', nomor_kuitansi: 'KWT-2026-02-A102', dicatat_oleh: 'Bendahara RT' },

  // Dimas Satria (w-3) - Lunas Jan 2026
  { id: 'i-3-1', warga_id: 'w-3', tahun: 2026, bulan: 1, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-01-12', metode_bayar: 'Tunai', nomor_kuitansi: 'KWT-2026-01-A103', dicatat_oleh: 'Bendahara RT' },

  // dr. Siti (w-4) - Lunas Jan, Feb, Mar, Apr, Mei 2026 (Bayar di muka)
  { id: 'i-4-1', warga_id: 'w-4', tahun: 2026, bulan: 1, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-01-03', metode_bayar: 'Transfer', nomor_kuitansi: 'KWT-2026-01-A205', dicatat_oleh: 'Bendahara RT' },
  { id: 'i-4-2', warga_id: 'w-4', tahun: 2026, bulan: 2, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-01-03', metode_bayar: 'Transfer', nomor_kuitansi: 'KWT-2026-02-A205', dicatat_oleh: 'Bendahara RT' },
  { id: 'i-4-3', warga_id: 'w-4', tahun: 2026, bulan: 3, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-01-03', metode_bayar: 'Transfer', nomor_kuitansi: 'KWT-2026-03-A205', dicatat_oleh: 'Bendahara RT' },
  { id: 'i-4-4', warga_id: 'w-4', tahun: 2026, bulan: 4, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-01-03', metode_bayar: 'Transfer', nomor_kuitansi: 'KWT-2026-04-A205', dicatat_oleh: 'Bendahara RT' },
  { id: 'i-4-5', warga_id: 'w-4', tahun: 2026, bulan: 5, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-01-03', metode_bayar: 'Transfer', nomor_kuitansi: 'KWT-2026-05-A205', dicatat_oleh: 'Bendahara RT' },

  // Hendra Gunawan (w-5) - Lunas Jan, Feb 2026
  { id: 'i-5-1', warga_id: 'w-5', tahun: 2026, bulan: 1, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-01-08', metode_bayar: 'Transfer', nomor_kuitansi: 'KWT-2026-01-B108', dicatat_oleh: 'Bendahara RT' },
  { id: 'i-5-2', warga_id: 'w-5', tahun: 2026, bulan: 2, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-02-07', metode_bayar: 'Transfer', nomor_kuitansi: 'KWT-2026-02-B108', dicatat_oleh: 'Bendahara RT' },

  // Agus Prasetyo (w-7) - Lunas Jan, Feb, Mar 2026
  { id: 'i-7-1', warga_id: 'w-7', tahun: 2026, bulan: 1, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-01-09', metode_bayar: 'Transfer', nomor_kuitansi: 'KWT-2026-01-B212', dicatat_oleh: 'Bendahara RT' },
  { id: 'i-7-2', warga_id: 'w-7', tahun: 2026, bulan: 2, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-02-09', metode_bayar: 'Transfer', nomor_kuitansi: 'KWT-2026-02-B212', dicatat_oleh: 'Bendahara RT' },
  { id: 'i-7-3', warga_id: 'w-7', tahun: 2026, bulan: 3, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-03-09', metode_bayar: 'Transfer', nomor_kuitansi: 'KWT-2026-03-B212', dicatat_oleh: 'Bendahara RT' },

  // Eko Yulianto (w-8) - Lunas Jan 2026
  { id: 'i-8-1', warga_id: 'w-8', tahun: 2026, bulan: 1, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-01-14', metode_bayar: 'QRIS', nomor_kuitansi: 'KWT-2026-01-C104', dicatat_oleh: 'Bendahara RT' },

  // Sugeng Riyadi (w-10) - Lunas Jan, Feb 2026
  { id: 'i-10-1', warga_id: 'w-10', tahun: 2026, bulan: 1, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-01-06', metode_bayar: 'Tunai', nomor_kuitansi: 'KWT-2026-01-D102', dicatat_oleh: 'Bendahara RT' },
  { id: 'i-10-2', warga_id: 'w-10', tahun: 2026, bulan: 2, jumlah_bayar: 100000, status_bayar: 'Lunas', tanggal_bayar: '2026-02-06', metode_bayar: 'Tunai', nomor_kuitansi: 'KWT-2026-02-D102', dicatat_oleh: 'Bendahara RT' },
];

export const INITIAL_BERITA: Berita[] = [
  {
    id: 'b-1',
    judul: 'Giat Kerja Bakti & Fogging Nyamuk DBD Menjelang Musim Penghujan',
    kategori: 'Kerja Bakti',
    ringkasan: 'Diharapkan seluruh warga hadir dalam giat bersih saluran got dan pemangkasan dahan pohon pada hari Minggu pagi.',
    isi: 'Sehubungan dengan antisipasi musim hujan dan pencegahan penyakit demam berdarah (DBD), Pengurus RT mengundang seluruh bapak/ibu warga Perumahan Griya Harmoni untuk berpartisipasi dalam Kerja Bakti Serentak dan pelaksanaan Fogging.\n\nPelaksanaan:\n• Hari/Tanggal: Minggu, 12 Oktober 2026\n• Pukul: 07.00 WIB s.d. Selesai\n• Titik Kumpul: Lapangan Fasum Blok B\n• Perlengkapan: Cangkul, sapu lidi, sarung tangan, karung sampah\n\nSnack dan konsumsi hangat disediakan oleh panitia RT. Partisipasi dan kekompakan warga sangat kami harapkan demi kebersihan dan kesehatan lingkungan bersama.',
    tanggal: '2026-10-05',
    penulis: 'Sie Kebersihan & Lingkungan',
    is_pinned: true,
    created_at: '2026-10-05T08:00:00Z',
  },
  {
    id: 'b-2',
    judul: 'Peningkatan Patroli Keamanan & Registrasi Tamu Menginap 1x24 Jam',
    kategori: 'Keamanan',
    ringkasan: 'Pos sekuriti memberlakukan kartu visitor untuk tamu dan kurir demi menjaga ketertiban serta keamanan cluster.',
    isi: 'Mengingat telah dipasangnya 8 titik kamera CCTV beresolusi tinggi di jalur utama gerbang cluster, kami mengingatkan kembali peraturan tata tertib lingkungan:\n\n1. Seluruh tamu yang menginap lebih dari 1x24 jam wajib melapor ke pengurus RT atau Pos Security.\n2. Portal gerbang timur ditutup pukul 22.00 WIB setiap malam, akses keluar masuk dialihkan ke Gerbang Utama.\n3. Batas kecepatan kendaraan di dalam komplek maksimal 20 km/jam.\n4. Tamu atau kurir paket wajib menukar kartu identitas di pos sekuriti.\n\nTerima kasih atas kerja sama seluruh warga demi terciptanya lingkungan yang aman, tertib, dan nyaman.',
    tanggal: '2026-10-01',
    penulis: 'Sie Keamanan & Ketertiban',
    is_pinned: false,
    created_at: '2026-10-01T09:30:00Z',
  },
  {
    id: 'b-3',
    judul: 'Laporan Kas & Transparansi Keuangan Iuran Warga Bulan September 2026',
    kategori: 'Keuangan',
    ringkasan: 'Saldo kas akhir bulan September 2026 tercatat sebesar Rp 18.450.000 dengan pencatatan terbuka dan akuntabel.',
    isi: 'Berikut rangkuman laporan kas RT bulan September 2026:\n\n• Saldo Awal: Rp 14.200.000\n• Pemasukan Iuran: Rp 8.800.000 (88 KK)\n• Pengeluaran Operasional (Gaji 3 Satpam & Petugas Sampah): Rp 4.250.000\n• Perawatan Lampu Penerangan Jalan Umum (PJU): Rp 300.000\n• Saldo Kas Akhir: Rp 18.450.000\n\nLaporan pembukuan lengkap beserta nota dan bukti kuitansi pengeluaran dapat diakses langsung melalui bendahara RT atau buku kas terbuka di sekretariat.',
    tanggal: '2026-09-30',
    penulis: 'Bendahara RT 04',
    is_pinned: false,
    created_at: '2026-09-30T17:00:00Z',
  },
  {
    id: 'b-4',
    judul: 'Jadwal Layanan Posyandu Balita & Skrining Lansia Periode Oktober',
    kategori: 'Kegiatan',
    ringkasan: 'Pemeriksaan rutin tumbuh kembang balita, imunisasi dasar, serta tensi & cek gula darah gratis bagi lansia.',
    isi: 'Pemberitahuan kepada ibu-ibu warga Griya Harmoni yang memiliki balita atau keluarga lansia, Posyandu Dahlia RT 04 akan dilaksanakan pada:\n\n• Hari/Tanggal: Sabtu, 18 Oktober 2026\n• Pukul: 08.30 - 11.30 WIB\n• Lokasi: Balai Pertemuan RT 04 (Depan Lapangan Tenis)\n• Layanan: Penimbangan, pengukuran tinggi badan, PMT (Pemberian Makanan Tambahan), dan skrining lansia gratis.\n\nMohon membawa buku KIA/KMS masing-masing.',
    tanggal: '2026-09-28',
    penulis: 'Kader Posyandu Dahlia',
    is_pinned: false,
    created_at: '2026-09-28T10:00:00Z',
  },
];

export const BULAN_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const BULAN_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
