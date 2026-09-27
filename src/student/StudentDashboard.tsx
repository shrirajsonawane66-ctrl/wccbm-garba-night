import React, { useState } from 'react';
import {
  LogOut,
  Ticket,
  Download,
  Eye,
  User,
  CalendarDays,
  Building2,
  ShieldCheck,
  QrCode,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { useStudentAuth } from './StudentAuthContext.tsx';
import { EPassTicketModal } from '../components/EPassTicketModal.tsx';
import { toEPassTicket } from '../lib/ticket.ts';
import { downloadPassImage } from '../lib/passImage.ts';
import type { EPassTicket } from '../types.ts';

export const StudentDashboard: React.FC = () => {
  const { session, loading, isAuthenticated, logout } = useStudentAuth();
  const [showPass, setShowPass] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [notice, setNotice] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="flex items-center gap-3 text-amber-300">
          <div className="w-6 h-6 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
          Loading your dashboard…
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !session?.profile) {
    return (
      <div className="min-h-screen bg-[#080c14] text-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-3xl bg-[#0e1424]/95 border border-amber-500/25 p-8 text-center shadow-2xl">
          <Ticket className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white font-serif">Please log in first</h2>
          <p className="text-sm text-slate-400 mt-2">You need to log in to view your E-Pass dashboard.</p>
          <a
            href="/login"
            className="mt-6 block w-full py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-center"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const profile = session.profile;
  const pass = session.pass;
  const ticket: EPassTicket | null = pass ? toEPassTicket(profile, pass) : null;

  const handleDownload = async () => {
    if (!ticket) return;
    setDownloading(true);
    setNotice('');
    try {
      await downloadPassImage(ticket);
      setNotice('Your E-Pass image was downloaded.');
    } catch {
      setNotice('Could not generate the image. Try again.');
    } finally {
      setDownloading(false);
    }
  };

  const statusStyle =
    pass?.status === 'USED'
      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
      : pass?.status === 'EXPIRED'
        ? 'bg-orange-500/15 text-orange-300 border-orange-500/40'
        : pass?.status === 'CANCELLED'
          ? 'bg-red-500/15 text-red-300 border-red-500/40'
          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-[26rem] h-[26rem] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <header className="sticky top-0 z-30 bg-[#0e1424]/90 backdrop-blur-md border-b border-amber-500/20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold font-serif tracking-wide text-white">STUDENT DASHBOARD</h1>
              <p className="text-[11px] text-slate-400">Western College Garba E-Pass</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              View Event Page
            </a>
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        {/* Welcome */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0e1424] to-[#0a0f1d] border border-amber-500/25 p-6 sm:p-8 mb-6">
          <p className="text-xs uppercase tracking-widest text-amber-400 font-bold">Welcome back</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-garba-title mt-1">
            {profile.full_name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-sm">
            <Stat icon={<User className="w-4 h-4 text-amber-400" />} label="Student ID" value={profile.student_id} mono />
            <Stat icon={<CalendarDays className="w-4 h-4 text-amber-400" />} label="Course" value={profile.course} />
            <Stat
              icon={<MapPin className="w-4 h-4 text-amber-400" />}
              label="Year / Division"
              value={profile.division ? `${profile.year} / ${profile.division}` : profile.year}
            />
          </div>
        </div>

        {notice && (
          <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-5">{notice}</div>
        )}

        {/* E-Pass card */}
        <div className="rounded-3xl bg-[#0e1424] border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">My E-Pass</h3>
                {pass && <p className="text-[11px] font-mono text-slate-400">{pass.pass_id}</p>}
              </div>
            </div>
            {pass && (
              <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold border uppercase ${statusStyle}`}>
                {pass.status}
              </span>
            )}
          </div>

          {!pass ? (
            <div className="p-8 text-center text-sm text-slate-400">
              <Ticket className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              No E-Pass found for this account. Contact the Student Council helpdesk.
            </div>
          ) : (
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 text-xs text-slate-400">
                  <span className="block uppercase tracking-wider mb-1.5 text-[10px]">Event</span>
                  <span className="text-slate-200 font-semibold text-sm">{pass.event_name}</span>
                  <span className="block text-[11px] mt-0.5">
                    {pass.event_date || ''} • {pass.venue}
                  </span>
                </div>
                <div className="flex-1 text-xs text-slate-400">
                  <span className="block uppercase tracking-wider mb-1.5 text-[10px]">Pass ID</span>
                  <span className="text-amber-300 font-mono font-bold">{pass.pass_id}</span>
                  <span className="block text-[11px] mt-0.5 text-slate-500">
                    Issued {new Date(pass.issued_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowPass(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20 transition-all"
                >
                  <Eye className="w-4 h-4" /> View E-Pass
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 transition-colors"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  {downloading ? 'Preparing…' : 'Download E-Pass'}
                </button>
              </div>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Your E-Pass loads automatically from the secure database.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-500">
          <span>One Student = One Account = One E-Pass</span>
          <ArrowRight className="w-3.5 h-3.5" />
          <span>Only the first scan is accepted</span>
        </div>
      </main>

      {ticket && showPass && <EPassTicketModal ticket={ticket} onClose={() => setShowPass(false)} />}
    </div>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; label: string; value: string; mono?: boolean }> = ({ icon, label, value, mono }) => (
  <div className="flex items-start gap-3 rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-3">
    <div className="w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center shrink-0">{icon}</div>
    <div className="min-w-0">
      <span className="block text-[10px] uppercase tracking-wider text-slate-500">{label}</span>
      <span className={`block font-semibold text-slate-100 truncate ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  </div>
);