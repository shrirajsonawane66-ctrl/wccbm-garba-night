import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Ticket,
  CheckCircle2,
  QrCode,
  Users,
  ArrowRight,
  ShieldCheck,
  Eye,
  Download,
  UserRound,
  LogIn,
} from 'lucide-react';
import { api } from '../lib/api.ts';
import { useStudentAuth } from '../student/StudentAuthContext.tsx';
import { EPassTicketModal } from './EPassTicketModal.tsx';
import { toEPassTicket } from '../lib/ticket.ts';
import { downloadPassImage } from '../lib/passImage.ts';

export const BookingSection: React.FC = () => {
  const { session, loading: authLoading, isAuthenticated } = useStudentAuth();
  const [passesClaimed, setPassesClaimed] = useState(0);
  const [totalCapacity, setTotalCapacity] = useState(1000);
  const [capacityLoading, setCapacityLoading] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState('');

  useEffect(() => {
    api
      .publicStats()
      .then((s) => {
        setPassesClaimed(s.claimed);
        setTotalCapacity(s.max || 1000);
      })
      .catch(() => {})
      .finally(() => setCapacityLoading(false));
  }, []);

  const benefits = [
    {
      id: 'quick-booking',
      title: 'Quick & Easy E-Pass',
      desc: 'Get your pass in just a few clicks',
      icon: Ticket,
    },
    {
      id: 'save-spot',
      title: 'Save Your Spot',
      desc: 'Avoid the crowd and be assured',
      icon: CheckCircle2,
    },
    {
      id: 'instant-confirmation',
      title: 'Instant Confirmation',
      desc: 'Get your e-pass instantly on your dashboard',
      icon: QrCode,
    },
    {
      id: 'limited-passes',
      title: 'Limited Passes',
      desc: "Book early, Don't miss out!",
      icon: Users,
    },
  ];

  const profile = session?.profile;
  const pass = session?.pass;
  const ticket = profile && pass ? toEPassTicket(profile, pass) : null;

  const handleDownload = async () => {
    if (!ticket) return;
    setDownloading(true);
    setDownloadMsg('');
    try {
      await downloadPassImage(ticket);
      setDownloadMsg('Your E-Pass image was downloaded.');
    } catch {
      setDownloadMsg('Could not generate the image. Try again.');
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

  const renderRightColumn = () => {
    // Still confirming whether this visitor is logged in.
    if (authLoading) {
      return (
        <div className="rounded-3xl bg-[#0e1424]/90 border border-amber-500/25 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-center gap-3 text-amber-300 py-10">
            <div className="w-6 h-6 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
            Checking your session…
          </div>
        </div>
      );
    }

    // Not logged in: show a subtle static info card (no popup, no scroll trigger).
    if (!isAuthenticated || !profile) {
      return (
        <div className="rounded-3xl bg-[#0e1424]/50 dark:bg-[#0e1424]/50 light:bg-white/50 border border-slate-800/50 dark:border-slate-800/50 light:border-slate-200/50 p-6 sm:p-8 shadow-xl backdrop-blur-xl text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 font-serif mb-2">
            E-Pass for Registered Students
          </h3>
          <p className="text-slate-500 dark:text-slate-500 light:text-slate-600 mb-4 max-w-xs mx-auto text-sm">
            Sign in to view and download your personal QR E-Pass.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/login"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 border border-amber-500 transition-colors"
            >
              <LogIn className="w-4 h-4" /> Log In
            </a>
            <a
              href="/signup"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <UserRound className="w-4 h-4" /> Create Account
            </a>
          </div>
        </div>
      );
    }

    // Logged in: buyer = logged-in student (no mismatch possible).
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="rounded-3xl bg-[#0e1424]/90 dark:bg-[#0e1424]/90 light:bg-white border border-emerald-500/30 light:border-emerald-800/20 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-emerald-500/15 via-teal-500/10 to-transparent pointer-events-none" />

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <span className="text-amber-400 text-3xl">✓</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 font-serif">
              Your E-Pass
            </h3>
            <p className="text-xs text-emerald-400 font-semibold">Logged in as {profile.full_name}</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 mb-5 ml-1">
          This E-Pass belongs to your account — the buyer and the logged-in student are the same person.
        </p>

        <div className="space-y-3 mb-6 rounded-2xl bg-[#090d18] dark:bg-[#090d18] light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-200 p-4">
          <ProfileRow label="Student Name" value={profile.full_name} />
          <ProfileRow label="Student ID" value={profile.student_id} mono />
          <ProfileRow label="Course / Year" value={profile.division ? `${profile.course} • ${profile.year} / ${profile.division}` : `${profile.course} • ${profile.year}`} />

          <div className="border-t border-slate-800 pt-3 mt-1">
            {pass ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-500">Pass ID</span>
                    <span className="text-sm font-mono font-bold text-amber-300">{pass.pass_id}</span>
                  </div>
                  <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold border uppercase ${statusStyle}`}>
                    {pass.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  {pass.event_name} • {pass.venue}
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-400">
                Your E-Pass is created automatically on registration. If it is not showing, try the dashboard or contact the helpdesk.
              </p>
            )}
          </div>
        </div>

        {downloadMsg && (
          <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 mb-3">{downloadMsg}</p>
        )}

        {pass && (
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              onClick={() => setShowPass(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Eye className="w-4 h-4" /> View E-Pass
            </motion.button>
            <motion.button
              onClick={handleDownload}
              disabled={downloading}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 transition-colors"
            >
              <span className="text-amber-400 text-2xl">↓</span>
              {downloading ? 'Preparing…' : 'Download E-Pass'}
            </motion.button>
          </div>
        )}

        <a
          href="/dashboard"
          className="mt-3 w-full py-3 rounded-xl font-bold text-sm text-amber-400 border border-amber-500/40 hover:bg-amber-500/10 transition-colors flex items-center justify-center gap-2"
        >
          Open My Dashboard
          <span className="text-amber-400 text-2xl">→</span>
        </a>

        <div className="mt-4 flex items-center gap-2 text-center text-[11px] text-slate-500 justify-center">
          <span className="text-amber-400 text-2xl">✓</span>
          Your pass is tied to this account ({profile.student_id}). No one else can claim or use it.
        </div>
      </motion.div>
    );
  };

  return (
    <section id="book-pass" className="relative py-16 lg:py-24 overflow-hidden">
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-amber-500/10 dark:bg-amber-500/10 light:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/10 light:bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">

          {/* Left Column: Why Book an E-Pass? + Live capacity */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold font-serif-royal text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight">
                Why Book an E-Pass?
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mt-3" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
              {benefits.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex flex-col items-start group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-900/90 dark:bg-slate-900/90 light:bg-amber-100 border border-amber-500/25 text-amber-400 dark:text-amber-400 light:text-amber-800 mb-3 group-hover:scale-105 group-hover:border-amber-400 transition-all duration-200 shadow-md shadow-black/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="p-5 rounded-2xl bg-[#0e1526]/80 dark:bg-[#0e1526]/80 light:bg-amber-50 border border-amber-500/20 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 dark:text-amber-400 light:text-amber-800">
                    Live Campus Ticket Status
                  </span>
                </div>
                <span className="text-xs font-extrabold text-slate-300 dark:text-slate-300 light:text-slate-800">
                  {totalCapacity - passesClaimed} Passes Remaining
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-800 dark:bg-slate-800 light:bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((passesClaimed / totalCapacity) * 100, 100)}%` }}
                />
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-2.5">
                {capacityLoading ? (
                  'Fetching live pass counts…'
                ) : (
                  <>
                    Over <strong className="text-amber-300 dark:text-amber-300 light:text-amber-700">{passesClaimed} students</strong> have secured their entry passes. Registration closes once {totalCapacity} capacity is reached.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right Column: Auth-gated E-Pass (login/sign-up first, then buyer's own pass) */}
          <div className="lg:col-span-6">{renderRightColumn()}</div>

        </div>
      </div>

      {ticket && showPass && <EPassTicketModal ticket={ticket} onClose={() => setShowPass(false)} />}
    </section>
  );
};

const ProfileRow: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 text-[13px] text-slate-400">
      <span className="text-amber-400 text-2xl">👤</span>
      <span>{label}</span>
    </div>
    <span className={`text-sm font-semibold text-slate-100 text-right break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
  </div>
);