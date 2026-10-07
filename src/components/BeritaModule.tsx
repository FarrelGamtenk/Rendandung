import React, { useState, useMemo } from 'react';
import { 
  Bell, Search, Plus, Calendar, Tag, Pin, Edit2, 
  Trash2, X, ChevronRight, User, ShieldAlert 
} from 'lucide-react';
import { Berita, KategoriBerita } from '../types';

interface BeritaModuleProps {
  beritaList: Berita[];
  isAdmin: boolean;
  onAddBerita: (berita: Omit<Berita, 'id' | 'created_at'>) => void;
  onUpdateBerita: (berita: Berita) => void;
  onDeleteBerita: (id: string) => void;
  onOpenAuth: () => void;
}

export const BeritaModule: React.FC<BeritaModuleProps> = ({
  beritaList,
  isAdmin,
  onAddBerita,
  onUpdateBerita,
  onDeleteBerita,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('all');
  const [activeBerita, setActiveBerita] = useState<Berita | null>(null);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBerita, setEditingBerita] = useState<Berita | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    judul: '',
    kategori: 'Kegiatan' as KategoriBerita,
    ringkasan: '',
    isi: '',
    tanggal: new Date().toISOString().split('T')[0],
    penulis: 'Pengurus RT 04',
    is_pinned: false,
  });

  const kategoriOptions: KategoriBerita[] = [
    'Kerja Bakti',
    'Keamanan',
    'Kegiatan',
    'Keuangan',
    'Info Penting',
  ];

  const filteredBerita = useMemo(() => {
    return beritaList
      .filter((b) => {
        const matchQuery =
          b.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.isi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (b.ringkasan && b.ringkasan.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchKategori =
          selectedKategori === 'all' || b.kategori === selectedKategori;

        return matchQuery && matchKategori;
      })
      .sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
      });
  }, [beritaList, searchQuery, selectedKategori]);

  const handleOpenAdd = () => {
    if (!isAdmin) {
      onOpenAuth();
      return;
    }
    setEditingBerita(null);
    setFormData({
      judul: '',
      kategori: 'Kegiatan',
      ringkasan: '',
      isi: '',
      tanggal: new Date().toISOString().split('T')[0],
      penulis: 'Pengurus RT 04',
      is_pinned: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (berita: Berita) => {
    if (!isAdmin) {
      onOpenAuth();
      return;
    }
    setEditingBerita(berita);
    setFormData({
      judul: berita.judul,
      kategori: berita.kategori,
      ringkasan: berita.ringkasan || '',
      isi: berita.isi,
      tanggal: berita.tanggal,
      penulis: berita.penulis,
      is_pinned: !!berita.is_pinned,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.isi) return;

    if (editingBerita) {
      onUpdateBerita({
        ...editingBerita,
        ...formData,
      });
    } else {
      onAddBerita(formData);
    }
    setIsModalOpen(false);
  };

  const getKategoriBadgeColor = (kategori: KategoriBerita) => {
    switch (kategori) {
      case 'Kerja Bakti':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Keamanan':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Keuangan':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Info Penting':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      default:
        return 'text-purple-700 bg-purple-50 border-purple-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-600" />
            Berita & Pengumuman RT/RW
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Informasi terkini jadwal kegiatan, ronda malam, posyandu, dan agenda musyawarah warga.
          </p>
        </div>

        <div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors shadow-xs flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            {isAdmin ? 'Buat Pengumuman Baru' : 'Login untuk Buat'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul berita, topik kegiatan, atau isi pengumuman..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="md:col-span-5 flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap hidden sm:inline">
              Kategori:
            </span>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Kategori</option>
              {kategoriOptions.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 pt-1">
          Menampilkan <span className="font-semibold text-slate-800">{filteredBerita.length}</span> pengumuman aktif
        </div>
      </div>

      {/* Grid Kartu Berita */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBerita.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden ${
              item.is_pinned ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'
            }`}
          >
            <div className="p-5 space-y-3">
              {/* Category & Date Metadata Header (Anti-pill unboxed clean layout) */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getKategoriBadgeColor(item.kategori)}`}>
                    {item.kategori}
                  </span>
                  {item.is_pinned && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <Pin className="w-3 h-3 fill-amber-700" />
                      Penting
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 font-mono-numbers text-[11px]">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {item.tanggal}
                </div>
              </div>

              {/* Title */}
              <h3
                onClick={() => setActiveBerita(item)}
                className="text-base font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer leading-snug line-clamp-2"
              >
                {item.judul}
              </h3>

              {/* Summary or excerpt */}
              <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                {item.ringkasan || item.isi}
              </p>
            </div>

            {/* Footer with Author and Actions */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 truncate max-w-[180px]">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{item.penulis}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveBerita(item)}
                  className="font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
                >
                  Baca Selengkapnya
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {isAdmin && (
                  <div className="flex items-center gap-1 ml-2 border-l border-slate-200 pl-2">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 text-slate-500 hover:text-emerald-700 rounded transition-colors"
                      title="Edit Pengumuman"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-700 rounded transition-colors"
                      title="Hapus Pengumuman"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Baca Detail Pengumuman */}
      {activeBerita && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 relative">
              <button
                onClick={() => setActiveBerita(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${getKategoriBadgeColor(activeBerita.kategori)}`}>
                  {activeBerita.kategori}
                </span>
                {activeBerita.is_pinned && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Pengumuman Penting
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {activeBerita.judul}
              </h2>

              <div className="flex items-center gap-3 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                <span>Dipublikasikan: {activeBerita.tanggal}</span>
                <span aria-hidden="true">·</span>
                <span>Oleh: {activeBerita.penulis}</span>
              </div>
            </div>

            <div className="p-6">
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
                {activeBerita.isi}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveBerita(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-lg transition-colors"
              >
                Tutup Pengumuman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah / Edit Berita Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingBerita ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Judul Pengumuman *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jadwal Gotong Royong Saluran Air"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Kategori</label>
                  <select
                    value={formData.kategori}
                    onChange={(e) =>
                      setFormData({ ...formData, kategori: e.target.value as KategoriBerita })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {kategoriOptions.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tanggal Tayang</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Penulis / Seksi Penyelenggara</label>
                <input
                  type="text"
                  placeholder="Contoh: Sie Keamanan & Ketertiban"
                  value={formData.penulis}
                  onChange={(e) => setFormData({ ...formData, penulis: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Ringkasan Singkat (1-2 Kalimat)</label>
                <input
                  type="text"
                  placeholder="Ringkasan inti yang tampil di kartu pengumuman"
                  value={formData.ringkasan}
                  onChange={(e) => setFormData({ ...formData, ringkasan: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Isi Lengkap Pengumuman *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Tuliskan detail jadwal, waktu, lokasi, perlengkapan, dan narasi lengkap..."
                  value={formData.isi}
                  onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_pinned"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="is_pinned" className="font-medium text-slate-700 cursor-pointer">
                  Pin pengumuman ini (tampilkan di urutan paling atas dengan tanda khusus)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-xs"
                >
                  {editingBerita ? 'Simpan Pengumuman' : 'Terbitkan Pengumuman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-5 text-center">
            <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-900">Hapus Pengumuman?</h4>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Pengumuman ini tidak akan ditampilkan lagi kepada warga komplek.
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteBerita(deletingId);
                  setDeletingId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
