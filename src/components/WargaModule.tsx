import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Plus, Filter, Phone, MessageSquare, 
  MapPin, UserCheck, ShieldAlert, Edit2, Trash2, X, 
  Check, Car, Briefcase, FileText
} from 'lucide-react';
import { Warga, StatusPenghuni } from '../types';

interface WargaModuleProps {
  wargaList: Warga[];
  isAdmin: boolean;
  onAddWarga: (warga: Omit<Warga, 'id' | 'created_at'>) => void;
  onUpdateWarga: (warga: Warga) => void;
  onDeleteWarga: (id: string) => void;
  onOpenAuth: () => void;
}

export const WargaModule: React.FC<WargaModuleProps> = ({
  wargaList,
  isAdmin,
  onAddWarga,
  onUpdateWarga,
  onDeleteWarga,
  onOpenAuth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlok, setSelectedBlok] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarga, setEditingWarga] = useState<Warga | null>(null);
  const [viewDetailWarga, setViewDetailWarga] = useState<Warga | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    blok_rumah: '',
    nama_lengkap: '',
    no_hp: '',
    status_penghuni: 'Tetap' as StatusPenghuni,
    jumlah_anggota: 3,
    pekerjaan: '',
    plat_nomor: '',
    catatan: '',
  });

  // Extract unique blocks
  const availableBloks = useMemo(() => {
    const blocks = new Set<string>();
    wargaList.forEach((w) => {
      // Extract prefix like Blok A1, Blok B1, etc.
      const match = w.blok_rumah.match(/^(Blok\s+[A-Z0-9]+)/i);
      if (match) {
        blocks.add(match[1]);
      } else {
        blocks.add(w.blok_rumah.split(' ')[0]);
      }
    });
    return Array.from(blocks).sort();
  }, [wargaList]);

  // Filter and search logic
  const filteredWarga = useMemo(() => {
    return wargaList.filter((warga) => {
      const matchQuery =
        warga.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warga.blok_rumah.toLowerCase().includes(searchQuery.toLowerCase()) ||
        warga.no_hp.includes(searchQuery) ||
        (warga.plat_nomor && warga.plat_nomor.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchBlok =
        selectedBlok === 'all' || warga.blok_rumah.toLowerCase().startsWith(selectedBlok.toLowerCase());

      const matchStatus =
        selectedStatus === 'all' || warga.status_penghuni.toLowerCase() === selectedStatus.toLowerCase();

      return matchQuery && matchBlok && matchStatus;
    });
  }, [wargaList, searchQuery, selectedBlok, selectedStatus]);

  const handleOpenAdd = () => {
    if (!isAdmin) {
      onOpenAuth();
      return;
    }
    setEditingWarga(null);
    setFormData({
      blok_rumah: '',
      nama_lengkap: '',
      no_hp: '',
      status_penghuni: 'Tetap',
      jumlah_anggota: 3,
      pekerjaan: '',
      plat_nomor: '',
      catatan: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (warga: Warga) => {
    if (!isAdmin) {
      onOpenAuth();
      return;
    }
    setEditingWarga(warga);
    setFormData({
      blok_rumah: warga.blok_rumah,
      nama_lengkap: warga.nama_lengkap,
      no_hp: warga.no_hp,
      status_penghuni: warga.status_penghuni,
      jumlah_anggota: warga.jumlah_anggota || 1,
      pekerjaan: warga.pekerjaan || '',
      plat_nomor: warga.plat_nomor || '',
      catatan: warga.catatan || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.blok_rumah || !formData.nama_lengkap || !formData.no_hp) {
      return;
    }

    if (editingWarga) {
      onUpdateWarga({
        ...editingWarga,
        ...formData,
      });
    } else {
      onAddWarga(formData);
    }
    setIsModalOpen(false);
  };

  const formatWaUrl = (noHp: string) => {
    let clean = noHp.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return `https://wa.me/${clean}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Data Warga & Alamat Rumah
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Daftar lengkap penghuni perumahan terdaftar, nomor kontak WhatsApp, dan status tempat tinggal.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors shadow-xs flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            {isAdmin ? 'Tambah Warga Baru' : 'Login untuk Tambah'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama kepala keluarga, blok rumah, atau no HP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Blok */}
          <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap hidden sm:inline">
              Blok:
            </span>
            <select
              value={selectedBlok}
              onChange={(e) => setSelectedBlok(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Blok Rumah</option>
              {availableBloks.map((blok) => (
                <option key={blok} value={blok}>
                  {blok}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status Penghuni */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap hidden sm:inline">
              Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Status</option>
              <option value="tetap">Warga Tetap</option>
              <option value="kontrak">Warga Kontrak</option>
            </select>
          </div>
        </div>

        {/* Active Filter Tags Bar */}
        <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
          <div>
            Menampilkan <span className="font-semibold text-slate-800">{filteredWarga.length}</span> dari {wargaList.length} keluarga terdata
          </div>
          {(searchQuery || selectedBlok !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBlok('all');
                setSelectedStatus('all');
              }}
              className="text-emerald-700 hover:underline font-medium"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table for Desktop & Cards for Mobile */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {wargaList.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Database Warga Masih Bersih (Kosong)</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Seluruh data placeholder telah dibersihkan. Anda dapat mulai memasukkan data kepala keluarga dan alamat rumah warga Komplek Depkes yang sesungguhnya.
            </p>
            <div className="pt-2">
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {isAdmin ? 'Tambah Data Warga Pertama' : 'Login Pengurus untuk Tambah Warga'}
              </button>
            </div>
          </div>
        ) : filteredWarga.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">Tidak ada data warga yang cocok</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Coba sesuaikan kata kunci pencarian atau reset filter blok dan status penghuni.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Alamat / Blok Rumah</th>
                  <th className="py-3 px-4 sm:px-6">Nama Kepala Keluarga</th>
                  <th className="py-3 px-4 sm:px-6">Status</th>
                  <th className="py-3 px-4 sm:px-6">WhatsApp / Kontak</th>
                  <th className="py-3 px-4 sm:px-6 text-center">Anggota</th>
                  <th className="py-3 px-4 sm:px-6">Kendaraan</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWarga.map((warga) => {
                  const isTetap = warga.status_penghuni === 'Tetap';
                  return (
                    <tr key={warga.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Alamat Rumah */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold text-slate-900 font-mono-numbers">
                            {warga.blok_rumah}
                          </span>
                        </div>
                      </td>

                      {/* Nama KK */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-semibold text-slate-900">{warga.nama_lengkap}</div>
                        {warga.pekerjaan && (
                          <div className="text-xs text-slate-500 truncate max-w-[200px]">
                            {warga.pekerjaan}
                          </div>
                        )}
                      </td>

                      {/* Status Penghuni (No pill spam, clean semantic display) */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            isTetap ? 'text-emerald-700' : 'text-blue-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isTetap ? 'bg-emerald-600' : 'bg-blue-600'
                            }`}
                          />
                          {warga.status_penghuni}
                        </span>
                      </td>

                      {/* Kontak WhatsApp */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <a
                          href={formatWaUrl(warga.no_hp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 font-mono-numbers font-medium transition-colors"
                          title="Kirim pesan WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{warga.no_hp}</span>
                        </a>
                      </td>

                      {/* Jumlah Jiwa */}
                      <td className="py-3.5 px-4 sm:px-6 text-center font-mono-numbers text-slate-700">
                        {warga.jumlah_anggota} Jiwa
                      </td>

                      {/* Kendaraan */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-slate-600 font-mono-numbers">
                        {warga.plat_nomor ? (
                          <span className="flex items-center gap-1 text-xs">
                            <Car className="w-3.5 h-3.5 text-slate-400" />
                            {warga.plat_nomor}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewDetailWarga(warga)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                            title="Lihat Detail Rumah"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(warga)}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                                title="Edit Data Warga"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingId(warga.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                                title="Hapus Data Warga"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Tambah / Edit Warga */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingWarga ? 'Edit Data Warga' : 'Tambah Warga Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Blok & Nomor Rumah *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Blok A1 No. 04"
                    value={formData.blok_rumah}
                    onChange={(e) => setFormData({ ...formData, blok_rumah: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Status Penghuni *</label>
                  <select
                    value={formData.status_penghuni}
                    onChange={(e) =>
                      setFormData({ ...formData, status_penghuni: e.target.value as StatusPenghuni })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Tetap">Warga Tetap (Pemilik)</option>
                    <option value="Kontrak">Warga Kontrak (Sewa)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nama Kepala Keluarga / Penghuni *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap beserta gelar jika ada"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">No. WhatsApp / HP *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 08123456789"
                    value={formData.no_hp}
                    onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Jumlah Anggota Keluarga</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={formData.jumlah_anggota}
                    onChange={(e) =>
                      setFormData({ ...formData, jumlah_anggota: parseInt(e.target.value) || 1 })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Pekerjaan / Jabatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Karyawan Swasta"
                    value={formData.pekerjaan}
                    onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Plat Nomor Kendaraan</label>
                  <input
                    type="text"
                    placeholder="Contoh: B 1234 ABC"
                    value={formData.plat_nomor}
                    onChange={(e) => setFormData({ ...formData, plat_nomor: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan pengurus RT atau domisili"
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
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
                  {editingWarga ? 'Simpan Perubahan' : 'Tambah Warga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Detail Warga View */}
      {viewDetailWarga && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-emerald-700 font-mono-numbers">
                  {viewDetailWarga.blok_rumah}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {viewDetailWarga.nama_lengkap}
                </h3>
              </div>
              <button
                onClick={() => setViewDetailWarga(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Status Penghuni</span>
                <span className="font-semibold text-slate-800">{viewDetailWarga.status_penghuni}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Jumlah Anggota Keluarga</span>
                <span className="font-semibold text-slate-800 font-mono-numbers">
                  {viewDetailWarga.jumlah_anggota} Jiwa
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">No. WhatsApp / HP</span>
                <a
                  href={formatWaUrl(viewDetailWarga.no_hp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-700 hover:underline font-mono-numbers"
                >
                  {viewDetailWarga.no_hp}
                </a>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Profesi / Pekerjaan</span>
                <span className="font-semibold text-slate-800">{viewDetailWarga.pekerjaan || '-'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Plat Nomor Utama</span>
                <span className="font-semibold text-slate-800 font-mono-numbers">
                  {viewDetailWarga.plat_nomor || '-'}
                </span>
              </div>
              {viewDetailWarga.catatan && (
                <div className="py-1">
                  <span className="text-slate-500 block mb-1">Catatan Pengurus:</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg text-xs leading-relaxed">
                    {viewDetailWarga.catatan}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <a
                href={formatWaUrl(viewDetailWarga.no_hp)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Hubungi via WhatsApp
              </a>
              <button
                onClick={() => setViewDetailWarga(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-5 text-center">
            <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-900">Konfirmasi Hapus Data</h4>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Apakah Anda yakin ingin menghapus data warga ini? Data catatan iuran terkait juga akan dihapus.
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
                  onDeleteWarga(deletingId);
                  setDeletingId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
