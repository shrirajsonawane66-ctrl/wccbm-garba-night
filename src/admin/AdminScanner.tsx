import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  X,
  Keyboard,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Ban,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { api, extractTokenFromQr } from '../lib/api.ts';
import type { VerifyResult } from '../types.ts';

interface AdminScannerProps {
  token: string;
}

const RESULT_META: Record<string, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  VALID_SCAN: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', icon: CheckCircle2 },
  ALREADY_USED: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/40', icon: AlertTriangle },
  EXPIRED: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/40', icon: Clock },
  CANCELLED: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/40', icon: Ban },
  INVALID_TOKEN: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/40', icon: XCircle },
};

export const AdminScanner: React.FC<AdminScannerProps> = ({ token }) => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [manualOpen, setManualOpen] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [scannerId] = useState(() => `qr-scanner-${Math.random().toString(36).slice(2, 8)}`);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const stopCamera = async () => {
    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) await scannerRef.current.stop();
        scannerRef.current.clear();
      }
    } catch {
      // ignore teardown errors
    }
    scannerRef.current = null;
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleDecoded = async (text: string) => {
    setError('');
    const qrToken = extractTokenFromQr(text);
    if (!qrToken) {
      setError('Could not read token from scanned code.');
      return;
    }
    await verify(qrToken);
  };

  const verify = async (qrToken: string) => {
    setIsVerifying(true);
    setResult(null);
    try {
      const device = `${navigator.userAgent.split(/[;()]/)[0]}`;
      const res = await api.adminVerify(tokenRef.current, qrToken, device);
      setResult(res);
      if (res.result === 'VALID_SCAN') {
        // brief success flash then keep the result visible
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const startCamera = async () => {
    setScannerOpen(true);
    setResult(null);
    setError('');
    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (text) => handleDecoded(text),
        () => {},
      );
    } catch (e: any) {
      setError('Camera unavailable. Use manual entry instead. ' + (e.message || ''));
      try {
        await scanner.clear();
      } catch {}
    }
  };

  const closeCamera = async () => {
    await stopCamera();
    setScannerOpen(false);
  };

  const meta = result ? RESULT_META[result.result] || RESULT_META.INVALID_TOKEN : null;
  const ResultIcon = meta?.icon || XCircle;

  return (
    <div className="space-y-6">
      {/* Action controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={scannerOpen ? closeCamera : startCamera}
          className={`flex items-center justify-center gap-3 py-4 rounded-2xl border font-semibold transition-all ${
            scannerOpen
              ? 'bg-red-500/10 border-red-500/40 text-red-300'
              : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
          }`}
        >
          {scannerOpen ? <X className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
          {scannerOpen ? 'Stop Camera' : 'Open Camera Scanner'}
        </button>

        <button
          onClick={() => {
            setManualOpen((v) => !v);
            setResult(null);
            setError('');
          }}
          className="flex items-center justify-center gap-3 py-4 rounded-2xl border bg-slate-800/40 border-slate-700 text-slate-200 hover:bg-slate-800/80 font-semibold transition-all"
        >
          <Keyboard className="w-5 h-5" />
          Manual Entry
        </button>
      </div>

      {/* Camera viewport */}
      {scannerOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-2xl overflow-hidden border border-slate-700 bg-black"
        >
          <div id={scannerId} className="w-full max-w-md mx-auto" />
        </motion.div>
      )}

      {/* Manual input */}
      {manualOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-2xl bg-[#0e1424] border border-slate-700 p-4"
        >
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Paste QR code text or /verify/<token> URL"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1 bg-[#090d18] border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={() => manualInput.trim() && verify(extractTokenFromQr(manualInput))}
              disabled={!manualInput.trim() || isVerifying}
              className="px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-sm disabled:opacity-50 flex items-center gap-2"
            >
              <ScanLine className="w-4 h-4" />
              Verify
            </button>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <XCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {isVerifying && (
        <div className="flex items-center justify-center gap-3 py-6 text-amber-300">
          <div className="w-6 h-6 border-2 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
          Verifying securely against database…
        </div>
      )}

      {/* Result card */}
      <AnimatePresence>
        {result && meta && (
          <motion.div
            key={result.result}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`rounded-2xl border-2 ${meta.border} ${meta.bg} p-6`}
          >
            <div className="flex items-center gap-3 mb-4">
              <ResultIcon className={`w-8 h-8 ${meta.color}`} />
              <h3 className={`text-2xl font-extrabold ${meta.color}`}>{result.message}</h3>
            </div>

            {(result.result === 'VALID_SCAN' || result.result === 'ALREADY_USED') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <Detail label="Student Name" value={result.student.full_name} />
                <Detail label="Student ID" value={result.student.student_id} />
                <Detail label="Course" value={`${result.student.course}${result.student.year ? ` • ${result.student.year}` : ''}`} />
                {result.student.division && <Detail label="Division" value={result.student.division} />}
                <Detail label="Pass ID" value={result.pass_id} />
                {result.result === 'VALID_SCAN' && (
                  <>
                    <Detail label="Event" value={result.student.event_name} />
                    <Detail label="Venue" value={result.student.venue} />
                  </>
                )}
                {result.result === 'ALREADY_USED' && (
                  <>
                    <Detail label="First Scanned At" value={result.first_scanned_at || '—'} />
                    <Detail label="Scanned By" value={result.first_scanned_by || '—'} />
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Detail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">{label}</span>
    <span className="font-semibold text-slate-100">{value}</span>
  </div>
);