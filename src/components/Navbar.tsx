import React from 'react';
import { Home, Users, CreditCard, Bell, Shield, LogIn, LogOut } from 'lucide-react';

interface NavbarProps {
  activeTab: 'beranda' | 'warga' | 'iuran' | 'berita';
  setActiveTab: (tab: 'beranda' | 'warga' | 'iuran' | 'berita') => void;
  isAdmin: boolean;
  onOpenAuth: () => void;
  onLogout: () => void;
  isSupabaseConnected?: boolean;
  onOpenSupabaseConfig?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Zone - Text Unbolded & Nama Komplek Depkes */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('beranda')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-700 transition-colors">
                <Home className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-normal tracking-tight text-slate-800 block leading-tight">
                  SIM RT 04 / RW 08
                </span>
                <span className="text-xs text-slate-500 font-normal block">
                  Komplek Depkes
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Skema SQL & Panduan Vercel telah dihilangkan) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
            <button
              onClick={() => setActiveTab('beranda')}
              className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'beranda'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Home className="w-4 h-4" />
              Beranda
            </button>
            <button
              onClick={() => setActiveTab('warga')}
              className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'warga'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Users className="w-4 h-4" />
              Data Warga
            </button>
            <button
              onClick={() => setActiveTab('iuran')}
              className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'iuran'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Rekap Iuran
            </button>
            <button
              onClick={() => setActiveTab('berita')}
              className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'berita'
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Bell className="w-4 h-4" />
              Pengumuman
            </button>
          </nav>

          {/* Zone 3: Primary Actions & Admin Auth Status (Tombol status Supabase telah dihilangkan) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="hidden lg:flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  <Shield className="w-3.5 h-3.5" />
                  Pengurus RT (Admin)
                </span>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                Login Pengurus
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Strip (Tanpa panduan) */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-slate-50/80 px-2 py-1.5 text-xs font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('beranda')}
          className={`flex flex-col items-center py-1 px-2 rounded ${activeTab === 'beranda' ? 'text-emerald-700 font-semibold' : ''}`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          Beranda
        </button>
        <button
          onClick={() => setActiveTab('warga')}
          className={`flex flex-col items-center py-1 px-2 rounded ${activeTab === 'warga' ? 'text-emerald-700 font-semibold' : ''}`}
        >
          <Users className="w-4 h-4 mb-0.5" />
          Warga
        </button>
        <button
          onClick={() => setActiveTab('iuran')}
          className={`flex flex-col items-center py-1 px-2 rounded ${activeTab === 'iuran' ? 'text-emerald-700 font-semibold' : ''}`}
        >
          <CreditCard className="w-4 h-4 mb-0.5" />
          Iuran
        </button>
        <button
          onClick={() => setActiveTab('berita')}
          className={`flex flex-col items-center py-1 px-2 rounded ${activeTab === 'berita' ? 'text-emerald-700 font-semibold' : ''}`}
        >
          <Bell className="w-4 h-4 mb-0.5" />
          Berita
        </button>
      </div>
    </header>
  );
};
