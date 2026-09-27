import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { StudentPageShell } from './StudentPageShell.tsx';
import { useStudentAuth } from './StudentAuthContext.tsx';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useStudentAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Already logged in? No need to log in again — land on the dashboard.
  useEffect(() => {
    if (isAuthenticated) window.location.replace('/dashboard');
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.trim() || !password) {
      setError('Enter your college email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (error?: boolean) =>
    `relative flex items-center rounded-xl bg-[#090d18] border transition-colors ${
      error ? 'border-red-500/80' : 'border-slate-800 focus-within:border-amber-400'
    }`;

  return (
    <StudentPageShell title="Student Login" subtitle="Log in to access your E-Pass dashboard. You must have an account before you can get your E-Pass — no account, no pass.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className={field(!!error)}>
            <div className="pl-4 pr-2 text-slate-400"><Mail className="w-5 h-5" /></div>
            <input
              type="email"
              required
              placeholder="College Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-3.5 pr-4 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className={field(!!error)}>
            <div className="pl-4 pr-2 text-slate-400"><Lock className="w-5 h-5" /></div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3.5 pr-4 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="pr-4 text-slate-400 hover:text-amber-400" tabIndex={-1}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {notice && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {notice}
          </div>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-amber-500/20"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              Logging in…
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Login
            </>
          )}
        </motion.button>

        <div className="flex items-center justify-between text-xs pt-1">
          <a href="/forgot-password" className="text-amber-400 hover:text-amber-300 font-semibold">
            Forgot Password?
          </a>
          <a href="/signup" className="text-slate-300 hover:text-amber-300">
            Don&apos;t have an account? <span className="text-amber-400 font-semibold">Sign Up</span>
          </a>
        </div>
      </form>
    </StudentPageShell>
  );
};