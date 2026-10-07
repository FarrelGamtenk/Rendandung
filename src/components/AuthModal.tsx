import React, { useState } from 'react';
import { Shield, KeyRound, Mail, X, CheckCircle, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
  isSupabaseLive: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isSupabaseLive,
}) => {
  const [email, setEmail] = useState('admin@griyaharmoni.id');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (isSupabaseLive && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If Supabase auth fails (e.g. user not created yet in Supabase Auth tab), allow demo bypass option or show message
          console.warn('Supabase auth error:', error.message);
          setErrorMessage(
            `Supabase Auth: ${error.message}. Anda juga dapat menggunakan Mode Demo Pengurus RT di bawah.`
          );
          setIsLoading(false);
          return;
        }

        if (data.user) {
          onLoginSuccess(data.user.email || email);
          onClose();
          setIsLoading(false);
          return;
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Gagal terhubung ke Supabase Auth.');
        setIsLoading(false);
        return;
      }
    }

    // Default Demo Admin Verification
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(email);
      onClose();
    }, 400);
  };

  const handleInstantDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess('admin@griyaharmoni.id');
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-3">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold">Portal Login Pengurus RT</h3>
          <p className="text-xs text-slate-400 mt-1">
            Masuk untuk mengakses hak akses pencatatan iuran, mutasi data warga, dan penerbitan pengumuman.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5 text-xs sm:text-sm">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Email Pengurus RT</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@griyaharmoni.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Kata Sandi (Password)</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors shadow-sm mt-2 flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              {isLoading ? 'Memverifikasi...' : 'Masuk sebagai Pengurus'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-center mb-2.5">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Uji Coba Langsung (Instan)
              </span>
            </div>
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              disabled={isLoading}
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <UserCheck className="w-4 h-4" />
              1-Klik Masuk Mode Demo Admin
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              Akun demo: <code className="text-slate-700 font-semibold">admin@griyaharmoni.id</code> (pass: <code className="text-slate-700">admin123</code>)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
