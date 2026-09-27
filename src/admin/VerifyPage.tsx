import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Building2, Sparkles } from 'lucide-react';
import { api } from '../lib/api.ts';

interface VerifyPageProps {
  token: string;
}

const VerifyPage: React.FC<VerifyPageProps> = ({ token }) => {
  const [state, setState] = useState<'loading' | 'done'>('loading');
  const [status, setStatus] = useState<string | null>(null);

  const check = () => {
    setState('loading');
    api
      .publicVerify(token)
      .then((res) => {
        setStatus(res.valid ? (res.status || 'ACTIVE') : 'INVALID');
        setState('done');
      })
      .catch(() => {
        setStatus('ERROR');
        setState('done');
      });
  };

  useEffect(check, [token]);

  const content =
    state === 'loading'
      ? {
          color: 'text-amber-300',
          border: 'border-amber-500/40',
          icon: undefined,
          title: 'Checking pass…',
          sub: 'Verifying against the secure database',
        }
      : status === 'ACTIVE'
        ? {
            color: 'text-emerald-400',
            border: 'border-emerald-500/50',
            icon: CheckCircle2,
            title: 'E-Pass found',
            sub: 'Present this screen to the gate staff — they will validate it with their scanner.',
          }
        : status === 'USED'
          ? {
              color: 'text-amber-400',
              border: 'border-amber-500/50',
              icon: AlertTriangle,
              title: 'This pass has already been used',
              sub: 'One E-Pass allows a single entry only.',
            }
          : status === 'EXPIRED'
            ? {
                color: 'text-orange-400',
                border: 'border-orange-500/50',
                icon: AlertTriangle,
                title: 'This pass has expired',
                sub: 'The validity window for this event has ended.',
              }
            : status === 'CANCELLED'
              ? {
                  color: 'text-red-400',
                  border: 'border-red-500/50',
                  icon: XCircle,
                  title: 'This pass has been cancelled',
                  sub: 'Please contact the Student Council for assistance.',
                }
              : {
                  color: 'text-red-400',
                  border: 'border-red-500/50',
                  icon: XCircle,
                  title: 'Invalid E-Pass',
                  sub: 'This QR code does not match any issued pass.',
                };

  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className={`w-full max-w-md rounded-3xl border-2 ${content.border} bg-[#0e1424]/95 p-8 text-center shadow-2xl relative z-10`}>
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white flex items-center justify-center shadow-lg p-3">
            <Building2 className="w-8 h-8 text-slate-800" />
          </div>
          <h2 className="text-lg font-bold text-white font-serif">WESTERN COLLEGE</h2>
          <p className="text-[11px] text-amber-400 flex items-center justify-center gap-1 mt-0.5">
            <Sparkles className="w-3 h-3" /> Authentic Garba E-Pass Check
          </p>
        </div>

        {Icon && (
          <div className="flex justify-center mb-3">
            <Icon className={`w-12 h-12 ${content.color}`} />
          </div>
        )}
        {!Icon && (
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
          </div>
        )}

        <h3 className={`text-xl font-extrabold ${content.color}`}>{content.title}</h3>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">{content.sub}</p>

        <button
          onClick={check}
          className="mt-6 flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm border border-slate-700"
        >
          <RefreshCw className="w-4 h-4" /> Re-check
        </button>

        <p className="text-[11px] text-slate-500 mt-6">
          <ShieldCheck className="inline w-3.5 h-3.5 text-emerald-400 mr-1" />
          Verification performed securely on the server.
        </p>
      </div>
    </div>
  );
};

export default VerifyPage;