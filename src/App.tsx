import React, { useState, useEffect } from 'react';
import { 
  Warga, Iuran, Berita, PengaturanRT 
} from './types';
import { 
  INITIAL_WARGA, INITIAL_IURAN, INITIAL_BERITA, 
  INITIAL_PENGATURAN 
} from './lib/dataStore';
import { getSupabaseClient } from './lib/supabaseClient';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { WargaModule } from './components/WargaModule';
import { IuranModule } from './components/IuranModule';
import { BeritaModule } from './components/BeritaModule';
import { PanduanModule } from './components/PanduanModule';
import { AuthModal } from './components/AuthModal';
import { KuitansiModal } from './components/KuitansiModal';
import { 
  Building2, Phone, Mail, Shield, Heart, MapPin, 
  CheckCircle2, AlertCircle 
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'beranda' | 'warga' | 'iuran' | 'berita' | 'panduan'>('beranda');

  // Admin Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('sim_rt_admin_auth') === 'true';
  });
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return localStorage.getItem('sim_rt_admin_email') || '';
  });

  // Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeKuitansi, setActiveKuitansi] = useState<{ iuran: Iuran; warga: Warga } | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Supabase connection state
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Core Data States
  const [pengaturan, setPengaturan] = useState<PengaturanRT>(() => {
    const saved = localStorage.getItem('sim_rt_pengaturan');
    return saved ? JSON.parse(saved) : INITIAL_PENGATURAN;
  });

  const [wargaList, setWargaList] = useState<Warga[]>(() => {
    const saved = localStorage.getItem('sim_rt_warga');
    return saved ? JSON.parse(saved) : INITIAL_WARGA;
  });

  const [iuranList, setIuranList] = useState<Iuran[]>(() => {
    const saved = localStorage.getItem('sim_rt_iuran');
    return saved ? JSON.parse(saved) : INITIAL_IURAN;
  });

  const [beritaList, setBeritaList] = useState<Berita[]>(() => {
    const saved = localStorage.getItem('sim_rt_berita');
    return saved ? JSON.parse(saved) : INITIAL_BERITA;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('sim_rt_warga', JSON.stringify(wargaList));
  }, [wargaList]);

  useEffect(() => {
    localStorage.setItem('sim_rt_iuran', JSON.stringify(iuranList));
  }, [iuranList]);

  useEffect(() => {
    localStorage.setItem('sim_rt_berita', JSON.stringify(beritaList));
  }, [beritaList]);

  // Check Supabase connection on load
  useEffect(() => {
    const checkConn = async () => {
      const client = getSupabaseClient();
      if (!client) {
        setIsSupabaseConnected(false);
        return;
      }
      try {
        const { error } = await client.from('warga').select('id').limit(1);
        setIsSupabaseConnected(!error);
      } catch {
        setIsSupabaseConnected(false);
      }
    };
    checkConn();
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (email: string) => {
    setIsAdmin(true);
    setAdminEmail(email);
    localStorage.setItem('sim_rt_admin_auth', 'true');
    localStorage.setItem('sim_rt_admin_email', email);
    showToast(`Berhasil masuk sebagai Pengurus RT (${email})`);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setAdminEmail('');
    localStorage.removeItem('sim_rt_admin_auth');
    localStorage.removeItem('sim_rt_admin_email');
    showToast('Anda telah keluar dari mode Pengurus RT', 'info');
  };

  // CRUD Warga
  const handleAddWarga = (newWarga: Omit<Warga, 'id' | 'created_at'>) => {
    const item: Warga = {
      ...newWarga,
      id: `w-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setWargaList((prev) => [item, ...prev]);
    showToast(`Data warga ${item.nama_lengkap} (${item.blok_rumah}) berhasil ditambahkan.`);
  };

  const handleUpdateWarga = (updated: Warga) => {
    setWargaList((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    showToast(`Data warga ${updated.nama_lengkap} berhasil diperbarui.`);
  };

  const handleDeleteWarga = (id: string) => {
    const target = wargaList.find((w) => w.id === id);
    setWargaList((prev) => prev.filter((w) => w.id !== id));
    setIuranList((prev) => prev.filter((i) => i.warga_id !== id));
    showToast(`Data warga ${target?.nama_lengkap || ''} telah dihapus.`, 'info');
  };

  // CRUD Iuran
  const handleSaveIuran = (data: Omit<Iuran, 'id'>) => {
    const existingIndex = iuranList.findIndex(
      (i) => i.warga_id === data.warga_id && i.tahun === data.tahun && i.bulan === data.bulan
    );

    if (existingIndex >= 0) {
      const updatedList = [...iuranList];
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        ...data,
      };
      setIuranList(updatedList);
    } else {
      const newIuran: Iuran = {
        ...data,
        id: `i-${Date.now()}`,
      };
      setIuranList((prev) => [...prev, newIuran]);
    }

    const warga = wargaList.find((w) => w.id === data.warga_id);
    showToast(`Iuran Bulan ${data.bulan} ${data.tahun} untuk ${warga?.nama_lengkap || 'warga'} berhasil dicatat.`);
  };

  const handleDeleteIuran = (wargaId: string, tahun: number, bulan: number) => {
    setIuranList((prev) =>
      prev.filter((i) => !(i.warga_id === wargaId && i.tahun === tahun && i.bulan === bulan))
    );
    showToast(`Catatan pembayaran iuran berhasil dibatalkan.`, 'info');
  };

  // CRUD Berita
  const handleAddBerita = (newBerita: Omit<Berita, 'id' | 'created_at'>) => {
    const item: Berita = {
      ...newBerita,
      id: `b-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setBeritaList((prev) => [item, ...prev]);
    showToast(`Pengumuman "${item.judul}" berhasil diterbitkan.`);
  };

  const handleUpdateBerita = (updated: Berita) => {
    setBeritaList((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    showToast(`Pengumuman berhasil diperbarui.`);
  };

  const handleDeleteBerita = (id: string) => {
    setBeritaList((prev) => prev.filter((b) => b.id !== id));
    showToast('Pengumuman telah dihapus.', 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs sm:text-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Navbar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        isSupabaseConnected={isSupabaseConnected}
        onOpenSupabaseConfig={() => setActiveTab('panduan')}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'beranda' && (
          <div className="space-y-10">
            <HeroSection
              wargaList={wargaList}
              iuranList={iuranList}
              pengaturan={pengaturan}
              onNavigate={(tab) => setActiveTab(tab)}
              isAdmin={isAdmin}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />

            {/* Quick Preview of Announcements on Home */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Pengumuman & Agenda Terkini</h3>
                  <p className="text-xs text-slate-500">Kabar lingkungan terbaru untuk warga komplek</p>
                </div>
                <button
                  onClick={() => setActiveTab('berita')}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Lihat Semua Pengumuman →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {beritaList.slice(0, 2).map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setActiveTab('berita')}
                    className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-semibold text-emerald-700">{b.kategori}</span>
                      <span className="font-mono-numbers">{b.tanggal}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1.5">{b.judul}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{b.ringkasan || b.isi}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'warga' && (
          <WargaModule
            wargaList={wargaList}
            isAdmin={isAdmin}
            onAddWarga={handleAddWarga}
            onUpdateWarga={handleUpdateWarga}
            onDeleteWarga={handleDeleteWarga}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'iuran' && (
          <IuranModule
            wargaList={wargaList}
            iuranList={iuranList}
            pengaturan={pengaturan}
            isAdmin={isAdmin}
            onSaveIuran={handleSaveIuran}
            onDeleteIuran={handleDeleteIuran}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenKuitansi={(iuran, warga) => setActiveKuitansi({ iuran, warga })}
          />
        )}

        {activeTab === 'berita' && (
          <BeritaModule
            beritaList={beritaList}
            isAdmin={isAdmin}
            onAddBerita={handleAddBerita}
            onUpdateBerita={handleUpdateBerita}
            onDeleteBerita={handleDeleteBerita}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'panduan' && (
          <PanduanModule
            onOpenSupabaseConfig={() => {}}
            isSupabaseConnected={isSupabaseConnected}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                RT
              </div>
              <span className="font-bold text-slate-900 text-sm">
                SIM {pengaturan.rt_rw} {pengaturan.nama_perumahan}
              </span>
            </div>
            <p className="text-slate-600 max-w-sm leading-relaxed">
              Sistem Informasi Manajemen Warga, Rekapitulasi Iuran Bulanan Terpadu, dan Transparansi Keuangan Lingkungan berbasis Next.js App Router & Supabase.
            </p>
            <div className="text-slate-400 pt-1">
              {pengaturan.kelurahan}, {pengaturan.kecamatan}, {pengaturan.kota}
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
              Menu Cepat
            </span>
            <ul className="space-y-1.5">
              <li>
                <button onClick={() => setActiveTab('beranda')} className="hover:text-slate-900">
                  Beranda Portal
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('warga')} className="hover:text-slate-900">
                  Direktori Data Warga
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('iuran')} className="hover:text-slate-900">
                  Rekapitulasi Iuran 12 Bulan
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('berita')} className="hover:text-slate-900">
                  Pengumuman & Agenda
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('panduan')} className="hover:text-slate-900">
                  Panduan Deploy Vercel
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
              Sekretariat & Hotline
            </span>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Balai Warga Blok B (Fasum)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Pos Sekuriti: {pengaturan.nomor_hotline_keamanan}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Rekening: {pengaturan.nama_bank} {pengaturan.no_rekening}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400">
          <div>
            © 2026 {pengaturan.nama_perumahan} ({pengaturan.rt_rw}). Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center gap-1">
            <span>Dirancang untuk kemudahan warga & transparansi pengurus</span>
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        isSupabaseLive={isSupabaseConnected}
      />

      {/* DIGITAL RECEIPT (KUITANSI) MODAL */}
      {activeKuitansi && (
        <KuitansiModal
          iuran={activeKuitansi.iuran}
          warga={activeKuitansi.warga}
          pengaturan={pengaturan}
          onClose={() => setActiveKuitansi(null)}
        />
      )}
    </div>
  );
}
