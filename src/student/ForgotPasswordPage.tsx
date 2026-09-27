import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  CreditCard,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { StudentPageShell } from './StudentPageShell.tsx';
import { api } from '../lib/api.ts';

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

type Step = 'send' | 'verify' | 'reset' | 'done';

const inputCls =
  'w-full py-3.5 pr-4 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none';
const fieldCls = (error?: boolean) =>
  `relative flex items-center rounded-xl bg-[#090d18] border transition-colors ${
    error ? 'border-red-500/80' : 'border-slate-800 focus-within:border-amber-400'
  }`;

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<Step>('send');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendAfter, setResendAfter] = useState(0);
  const [expiresIn, setExpiresIn] = useState(600);

  useEffect(() => {
    const t = setInterval(() => {
      setResendAfter((s) => Math.max(0, s - 1));
      setExpiresIn((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setDevOtp(null);
    if (!studentId.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter your Student ID and a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.forgotSend(studentId.trim().toUpperCase(), email.trim().toLowerCase());
      setNotice(res.message || 'A verification code has been sent to your registered email.');
      setDevOtp(res.dev_otp || null);
      setResendAfter(res.resend_after || 60);
      setExpiresIn(res.otp_ttl || 600);
      setStep('verify');
    } catch (err: any) {
      setError(err?.message || 'Could not send the verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.forgotSend(studentId.trim().toUpperCase(), email.trim().toLowerCase());
      setOtp('');
      setNotice(res.message || 'A new code has been sent.');
      setDevOtp(res.dev_otp || null);
      setResendAfter(res.resend_after || 60);
      setExpiresIn(res.otp_ttl || 600);
    } catch (err: any) {
      setError(err?.message || 'Could not resend the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit code you received.');
      return;
    }
    setLoading(true);
    try {
      await api.forgotVerify(studentId.trim().toUpperCase(), email.trim().toLowerCase(), otp);
      setNotice('Code verified. Now set your new password.');
      setStep('reset');
    } catch (err: any) {
      setError(err?.message || 'Could not verify the code.');
      if ((err as any)?.status === 410 || (err as any)?.status === 429) setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!PASSWORD_RE.test(newPassword)) {
      setError('Password must be at least 8 characters, with one uppercase letter, one lowercase letter and one number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.forgotReset(studentId.trim().toUpperCase(), email.trim().toLowerCase(), otp, newPassword);
      setStep('done');
    } catch (err: any) {
      setError(err?.message || 'Could not reset your password.');
    } finally {
      setLoading(false);
    }
  };

  const mm = `${Math.floor(expiresIn / 60)}:${String(expiresIn % 60).padStart(2, '0')}`;

  return (
    <StudentPageShell title="Forgot Password" subtitle="Recover your account with a secure email code">
      {step === 'done' ? (
        <div className="space-y-4 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <p className="text-sm text-slate-300">
            Your password has been updated. Your student profile, E-Pass, Pass ID and barcode token are unchanged.
          </p>
          <a
            href="/login"
            className="block w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-center shadow-lg shadow-amber-500/20"
          >
            Log in with your new password
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stepper */}
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider">
            {(['send', 'verify', 'reset'] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                {i > 0 && <div className="w-6 h-px bg-slate-700" />}
                <span className={step === s ? 'text-amber-400' : 'text-slate-500'}>{['ID + Email', 'Verify Code', 'New Password'][i]}</span>
              </React.Fragment>
            ))}
          </div>

          {step === 'send' && (
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <div className={fieldCls(!!error)}>
                  <div className="pl-4 pr-2 text-slate-400"><CreditCard className="w-5 h-5" /></div>
                  <input
                    type="text"
                    placeholder="Student ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className={`${inputCls} uppercase`}
                  />
                </div>
              </div>
              <div>
                <div className={fieldCls(!!error)}>
                  <div className="pl-4 pr-2 text-slate-400"><Mail className="w-5 h-5" /></div>
                  <input
                    type="email"
                    placeholder="Registered College Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#ff5e3a] via-[#f84f47] to-[#e91e63] flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-orange-500/20"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Send Verification Code
                  </>
                )}
              </motion.button>
              <a href="/login" className="block text-center text-xs text-slate-300 hover:text-amber-300">
                <ArrowLeft className="inline w-3.5 h-3.5 mr-1" /> Back to Login
              </a>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-300">
                  Code sent to <strong className="text-amber-300">{email.trim()}</strong>
                </span>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Enter verification code</label>
                <input
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full px-4 py-3.5 rounded-xl bg-[#090d18] border border-slate-800 focus:border-amber-400 text-center text-2xl tracking-[0.5em] text-slate-100 placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              {devOtp && (
                <div className="text-[11px] text-slate-500 text-center border border-dashed border-slate-700 rounded-lg px-3 py-2">
                  Dev mode code (not shown in production): <span className="font-mono text-amber-300">{devOtp}</span>
                </div>
              )}
              {notice && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2.5">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {notice}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-emerald-500/20"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying…
                  </>
                ) : (
                  'Verify Code'
                )}
              </motion.button>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Valid for <strong className="text-amber-400">{mm}</strong>
                </span>
                {resendAfter > 0 ? (
                  <span>Resend in {resendAfter}s</span>
                ) : (
                  <button type="button" onClick={handleResend} disabled={loading} className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold">
                    <RefreshCw className="w-3.5 h-3.5" /> Resend Code
                  </button>
                )}
              </div>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <div className={fieldCls(!!error)}>
                  <div className="pl-4 pr-2 text-slate-400"><Lock className="w-5 h-5" /></div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputCls}
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="pr-4 text-slate-400 hover:text-amber-400" tabIndex={-1}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <div className={fieldCls(!!error)}>
                  <div className="pl-4 pr-2 text-slate-400"><Lock className="w-5 h-5" /></div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {notice && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2.5">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {notice}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#ff5e3a] via-[#f84f47] to-[#e91e63] flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-orange-500/20"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Resetting…
                  </>
                ) : (
                  'Reset Password'
                )}
              </motion.button>
              <p className="text-center text-[10px] text-slate-500">
                Password reset never changes your Student ID, Pass ID, barcode token or pass status.
              </p>
            </form>
          )}
        </div>
      )}
    </StudentPageShell>
  );
};