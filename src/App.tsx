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
import { AuthModal } from './components/AuthModal';
import { KuitansiModal } from './components/KuitansiModal';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'beranda' | 'warga' | 'iuran' | 'berita'>('beranda');

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

  // Core Data States (Bersih tanpa placeholder)
  const [pengaturan, setPengaturan] = useState<PengaturanRT>(() => {
    return INITIAL_PENGATURAN;
  });

  const [wargaList, setWargaList] = useState<Warga[]>(() => {
    // Purge legacy dummy data
    localStorage.removeItem('sim_rt_warga');
    localStorage.removeItem('sim_rt_iuran');
    const saved = localStorage.getItem('sim_rt_warga_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [iuranList, setIuranList] = useState<Iuran[]>(() => {
    const saved = localStorage.getItem('sim_rt_iuran_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [beritaList, setBeritaList] = useState<Berita[]>(() => {
    const saved = localStorage.getItem('sim_rt_berita');
    return saved ? JSON.parse(saved) : INITIAL_BERITA;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('sim_rt_warga_v2', JSON.stringify(wargaList));
    localStorage.removeItem('sim_rt_warga');
  }, [wargaList]);

  useEffect(() => {
    localStorage.setItem('sim_rt_iuran_v2', JSON.stringify(iuranList));
    localStorage.removeItem('sim_rt_iuran');
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
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
        {activeTab === 'beranda' && (
          <HeroSection
            wargaList={wargaList}
            iuranList={iuranList}
            pengaturan={pengaturan}
            onNavigate={(tab) => setActiveTab(tab)}
            isAdmin={isAdmin}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
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
      </main>

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
