import React from 'react';
import { ShieldCheck, ArrowLeft, CalendarDays, MapPin, Building2, Sparkles } from 'lucide-react';

interface StudentPageShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const StudentPageShell: React.FC<StudentPageShellProps> = ({ title, subtitle, children, maxWidth = 'max-w-md' }) => {
  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Festive gradient glows */}
      <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-[30rem] h-[30rem] bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Dandiya dot pattern */}
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
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-sm font-extrabold font-serif text-slate-100 tracking-wide group-hover:text-amber-300 transition-colors">
              WESTERN COLLEGE
            </div>
            <div className="text-[10px] text-slate-400 -mt-0.5">Garba &amp; Dandiya Night E-Pass</div>
          </div>
        </a>
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Site
        </a>
      </div>

      {/* Bottom strip */}
      <div className="absolute bottom-4 inset-x-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-[11px] text-slate-500 z-20">
        <span className="flex items-center gap-1">
          <CalendarDays className="w-3 h-3" /> Garba &amp; Dandiya Night
        </span>
        <span className="hidden sm:inline text-slate-700">•</span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Protected by Supabase Auth
        </span>
      </div>

      <div className={`w-full ${maxWidth} relative z-10`}>
        <div className="rounded-3xl bg-[#0e1424]/95 border border-amber-500/25 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-white font-serif text-center">{title}</h2>
            <p className="text-xs text-slate-400 mt-1 text-center flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {subtitle}
            </p>
          </div>
          {children}
          <p className="text-center text-[10px] text-slate-600 mt-6 flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3" /> Western College • Autonomous • Mumbai
          </p>
        </div>
      </div>
    </div>
  );
};