export type StatusPenghuni = 'Tetap' | 'Kontrak';

export interface Warga {
  id: string;
  blok_rumah: string;
  nama_lengkap: string;
  no_hp: string;
  status_penghuni: StatusPenghuni;
  jumlah_anggota: number;
  pekerjaan?: string;
  plat_nomor?: string;
  catatan?: string;
  created_at?: string;
  updated_at?: string;
}

export type StatusBayar = 'Lunas' | 'Belum Bayar' | 'Menunggu';
export type MetodeBayar = 'Transfer' | 'Tunai' | 'QRIS';

export interface Iuran {
  id: string;
  warga_id: string;
  tahun: number;
  bulan: number; // 1 - 12
  jumlah_bayar: number;
  status_bayar: StatusBayar;
  tanggal_bayar?: string;
  metode_bayar?: MetodeBayar;
  nomor_kuitansi?: string;
  dicatat_oleh?: string;
  keterangan?: string;
}

export type KategoriBerita = 'Kerja Bakti' | 'Keamanan' | 'Kegiatan' | 'Keuangan' | 'Info Penting';

export interface Berita {
  id: string;
  judul: string;
  slug?: string;
  kategori: KategoriBerita;
  isi: string;
  ringkasan?: string;
  tanggal: string;
  penulis: string;
  is_pinned?: boolean;
  created_at?: string;
}

export interface PengaturanRT {
  id: string;
  nama_perumahan: string;
  rt_rw: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  nominal_iuran: number;
  nama_bank: string;
  no_rekening: string;
  atas_nama_rekening: string;
  nomor_hotline_keamanan: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
  isConnected: boolean;
}
