import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, User, LogIn, AlertCircle, Sparkles, ArrowLeft, MapPin, CalendarDays } from 'lucide-react';
import { api } from '../lib/api.ts';

interface AdminLoginProps {
  onLogin: (token: string, role: string, name?: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.adminLogin(email.trim(), password);
      localStorage.setItem('garba_admin_token', res.access_token);
      onLogin(res.access_token, res.user.role, res.user.displayName || email.trim());
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Festive gradient glows */}
      <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-[30rem] h-[30rem] bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle dandiya dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #fbbf24 1px, transparent 0)',
          backgroundSize: '34px 34px',
        }}
      />

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="font-serif font-black text-[13vw] sm:text-[8rem] tracking-widest text-white/[0.04] whitespace-nowrap">
          WESTERN COLLEGE
        </span>
      </div>

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 sm:px-6 py-4 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-slate-950" />
          </div>
          <div className="text-left">
            <div className="text-sm font-extrabold font-serif text-slate-100 tracking-wide">WESTERN COLLEGE</div>
            <div className="text-[10px] text-slate-400 -mt-0.5">E-Pass Admin Suite</div>
          </div>
        </div>
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Site
        </a>
      </div>

      {/* Bottom strip */}
      <div className="absolute bottom-4 inset-x-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-[11px] text-slate-500 z-20">
        <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Garba &amp; Dandiya Night</span>
        <span className="hidden sm:inline text-slate-700">•</span>
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Authorized staff only · All scans logged</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-[#0e1424]/95 border border-amber-500/25 p-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white font-serif">Admin Console</h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Western College Garba E-Pass Verification
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex items-center rounded-xl bg-[#090d18] border border-slate-800 focus-within:border-amber-400 transition-colors">
            <div className="pl-4 pr-2 text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <input
              type="email"
              required
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-3.5 pr-4 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div className="relative flex items-center rounded-xl bg-[#090d18] border border-slate-800 focus-within:border-amber-400 transition-colors">
            <div className="pl-4 pr-2 text-slate-400">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3.5 pr-4 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-amber-500/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </motion.button>
        </form>

        <p className="text-center text-[11px] text-slate-500 mt-6">
          Authorized personnel only. All scan activity is logged.
        </p>
      </motion.div>
    </div>
  );
};