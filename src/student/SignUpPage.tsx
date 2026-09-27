import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  CreditCard,
  Mail,
  Phone,
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  LogIn,
} from 'lucide-react';
import { StudentPageShell } from './StudentPageShell.tsx';
import { useStudentAuth } from './StudentAuthContext.tsx';
import type { SignupPayload } from '../types.ts';

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const inputCls =
  'w-full py-3 pr-4 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none';

export const SignUpPage: React.FC = () => {
  const { signup, isAuthenticated } = useStudentAuth();
  const [form, setForm] = useState<SignupPayload>({
    fullName: '',
    studentId: '',
    email: '',
    mobile: '',
    course: 'BMS',
    year: 'FY',
    division: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Already signed up? Send them straight to their E-Pass dashboard.
  useEffect(() => {
    if (isAuthenticated) window.location.replace('/dashboard');
  }, [isAuthenticated]);

  const set = (k: keyof SignupPayload, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (form.fullName.trim().length < 3) errs.fullName = 'Enter your full name as on ID card (min 3 letters).';
    if (!/^[A-Za-z0-9\-/._]+$/.test(form.studentId.trim())) errs.studentId = 'Student ID can contain only letters, numbers, dashes, slashes.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = 'Enter a valid college email address.';
    if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\D/g, ''))) errs.mobile = 'Enter a valid 10-digit mobile number.';
    if (!form.course) errs.course = 'Select your course.';
    if (!form.year) errs.year = 'Select your year.';
    if (!PASSWORD_RE.test(form.password)) errs.password = 'Min 8 characters with an UPPERCASE, lowercase and a number.';
    if (form.password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setNotice(null);
    try {
      const res = await signup({
        ...form,
        studentId: form.studentId.trim().toUpperCase(),
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile.replace(/\D/g, ''),
        division: form.division?.trim() || undefined,
      });
      if (res.email_verification_required) {
        setNotice({
          kind: 'ok',
          text: 'Please verify your college email before continuing. Check your inbox, then log in.',
        });
        window.location.href = '/login';
        return;
      }
      window.location.href = '/dashboard';
    } catch (err: any) {
      setNotice({ kind: 'err', text: err?.message || 'Could not create your account. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const field = (error?: string) => `relative flex items-center rounded-xl bg-[#090d18] border transition-colors ${
    error ? 'border-red-500/80' : 'border-slate-800 focus-within:border-amber-400'
  }`;

  return (
    <StudentPageShell
      title="Create Student Account"
      subtitle="Self-registration for Western College students"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <div className={field(errors.fullName)}>
            <div className="pl-4 pr-2 text-slate-400"><User className="w-5 h-5" /></div>
            <input type="text" placeholder="Full Name" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className={inputCls} />
          </div>
          {errors.fullName && <ErrorMsg text={errors.fullName} />}
        </div>

        <div>
          <div className={field(errors.studentId)}>
            <div className="pl-4 pr-2 text-slate-400"><CreditCard className="w-5 h-5" /></div>
            <input type="text" placeholder="Student ID / Roll Number (e.g. 2024-BMS-042)" value={form.studentId} onChange={(e) => set('studentId', e.target.value)} className={`${inputCls} uppercase`} />
          </div>
          {errors.studentId && <ErrorMsg text={errors.studentId} />}
        </div>

        <div>
          <div className={field(errors.email)}>
            <div className="pl-4 pr-2 text-slate-400"><Mail className="w-5 h-5" /></div>
            <input type="email" placeholder="College Email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} />
          </div>
          {errors.email && <ErrorMsg text={errors.email} />}
        </div>

        <div>
          <div className={field(errors.mobile)}>
            <div className="pl-4 pr-2 text-slate-400"><Phone className="w-5 h-5" /></div>
            <input type="tel" maxLength={10} placeholder="Mobile Number" value={form.mobile} onChange={(e) => set('mobile', e.target.value.replace(/\D/g, ''))} className={inputCls} />
          </div>
          {errors.mobile && <ErrorMsg text={errors.mobile} />}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="relative flex items-center rounded-xl bg-[#090d18] border border-slate-800 px-3 py-2.5">
              <GraduationCap className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <select value={form.course} onChange={(e) => set('course', e.target.value)} className="w-full bg-transparent text-xs sm:text-sm text-slate-200 focus:outline-none">
                <option value="BMS" className="bg-slate-900 text-slate-100">BMS</option>
                <option value="B.Com" className="bg-slate-900 text-slate-100">B.Com</option>
                <option value="B.Sc IT/CS" className="bg-slate-900 text-slate-100">B.Sc IT / CS</option>
                <option value="BAF" className="bg-slate-900 text-slate-100">BAF (Accounting)</option>
                <option value="BBI" className="bg-slate-900 text-slate-100">BBI (Banking)</option>
                <option value="M.Com" className="bg-slate-900 text-slate-100">M.Com</option>
                <option value="M.Sc" className="bg-slate-900 text-slate-100">M.Sc</option>
              </select>
            </div>
          </div>
          <div>
            <div className="relative flex items-center rounded-xl bg-[#090d18] border border-slate-800 px-3 py-2.5">
              <select value={form.year} onChange={(e) => set('year', e.target.value)} className="w-full bg-transparent text-xs sm:text-sm text-slate-200 focus:outline-none">
                <option value="FY" className="bg-slate-900 text-slate-100">First Year (FY)</option>
                <option value="SY" className="bg-slate-900 text-slate-100">Second Year (SY)</option>
                <option value="TY" className="bg-slate-900 text-slate-100">Third Year (TY)</option>
                <option value="PG" className="bg-slate-900 text-slate-100">Master&apos;s (PG)</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <div className={field(undefined)}>
            <div className="pl-4 pr-2 text-slate-400"><User className="w-5 h-5" /></div>
            <input type="text" placeholder="Division (optional, e.g. A / B / C)" value={form.division} onChange={(e) => set('division', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <div className={field(errors.password)}>
            <div className="pl-4 pr-2 text-slate-400"><Lock className="w-5 h-5" /></div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (min 8 chars: A, a, 1)"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              className={inputCls}
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="pr-4 text-slate-400 hover:text-amber-400" tabIndex={-1}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <ErrorMsg text={errors.password} />}
        </div>

        <div>
          <div className={field(errors.confirmPassword)}>
            <div className="pl-4 pr-2 text-slate-400"><Lock className="w-5 h-5" /></div>
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputCls}
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="pr-4 text-slate-400 hover:text-amber-400" tabIndex={-1}>
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && <ErrorMsg text={errors.confirmPassword} />}
        </div>

        {notice && (
          <div className={`flex items-start gap-2 text-xs rounded-xl px-3 py-2.5 ${
            notice.kind === 'ok'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {notice.kind === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{notice.text}</span>
          </div>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#ff5e3a] via-[#f84f47] to-[#e91e63] hover:from-[#ff6b48] hover:to-[#f02b70] flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-orange-500/20"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating Account…
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Create Account
            </>
          )}
        </motion.button>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <a href="/login" className="text-amber-400 hover:text-amber-300 font-semibold">
            Log in
          </a>
        </p>
        <p className="text-center text-[10px] text-slate-500">
          Your account and E-Pass are created automatically. One Student ID = one account = one E-Pass.
        </p>
      </form>
    </StudentPageShell>
  );
};

const ErrorMsg: React.FC<{ text: string }> = ({ text }) => (
  <p className="text-xs text-red-400 mt-1 flex items-center gap-1 pl-1">
    <AlertCircle className="w-3.5 h-3.5" />
    {text}
  </p>
);