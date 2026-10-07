import { Warga, Iuran, Berita, PengaturanRT } from '../types';

export const INITIAL_PENGATURAN: PengaturanRT = {
  id: 'primary',
  nama_perumahan: 'Komplek Depkes',
  rt_rw: 'RT 04 / RW 08',
  kelurahan: 'Sukamaju',
  kecamatan: 'Cilodong',
  kota: 'Kota Depok, Jawa Barat',
  nominal_iuran: 100000,
  nama_bank: 'Bank Central Asia (BCA)',
  no_rekening: '8820-1928-44',
  atas_nama_rekening: 'Kas RT 04 Komplek Depkes',
  nomor_hotline_keamanan: '0812-9988-7766',
};

export const INITIAL_WARGA: Warga[] = [];

export const INITIAL_IURAN: Iuran[] = [];

export const INITIAL_BERITA: Berita[] = [
  {
    id: 'b-1',
    judul: 'Giat Kerja Bakti & Fogging Nyamuk DBD Menjelang Musim Penghujan',
    kategori: 'Kerja Bakti',
    ringkasan: 'Diharapkan seluruh warga hadir dalam giat bersih saluran got dan pemangkasan dahan pohon pada hari Minggu pagi.',
    isi: 'Sehubungan dengan antisipasi musim hujan dan pencegahan penyakit demam berdarah (DBD), Pengurus RT mengundang seluruh bapak/ibu warga Komplek Depkes untuk berpartisipasi dalam Kerja Bakti Serentak dan pelaksanaan Fogging.\n\nPelaksanaan:\n• Hari/Tanggal: Minggu, 12 Oktober 2026\n• Pukul: 07.00 WIB s.d. Selesai\n• Titik Kumpul: Lapangan Fasum Blok B\n• Perlengkapan: Cangkul, sapu lidi, sarung tangan, karung sampah\n\nSnack dan konsumsi hangat disediakan oleh panitia RT. Partisipasi dan kekompakan warga sangat kami harapkan demi kebersihan dan kesehatan lingkungan bersama.',
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
    isi: 'Pemberitahuan kepada ibu-ibu warga Komplek Depkes yang memiliki balita atau keluarga lansia, Posyandu Dahlia RT 04 akan dilaksanakan pada:\n\n• Hari/Tanggal: Sabtu, 18 Oktober 2026\n• Pukul: 08.30 - 11.30 WIB\n• Lokasi: Balai Pertemuan RT 04 (Depan Lapangan Tenis)\n• Layanan: Penimbangan, pengukuran tinggi badan, PMT (Pemberian Makanan Tambahan), dan skrining lansia gratis.\n\nMohon membawa buku KIA/KMS masing-masing.',
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
