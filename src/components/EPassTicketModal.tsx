import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import { 
  X, 
  ArrowLeft,
  Download, 
  Printer, 
  CheckCircle, 
  Building2, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  Share2
} from 'lucide-react';
import { EPassTicket } from '../types.ts';
import { Code128Barcode } from './Code128Barcode.tsx';

interface EPassTicketModalProps {
  ticket: EPassTicket | null;
  onClose: () => void;
}

export const EPassTicketModal: React.FC<EPassTicketModalProps> = ({ ticket, onClose }) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!ticket?.verifyUrl) return;
    let cancelled = false;
    QRCode.toDataURL(ticket.verifyUrl, { width: 512, margin: 1, errorCorrectionLevel: 'M' })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [ticket?.verifyUrl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${ticket!.passNumber}-qr.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleShare = () => {
    const shareUrl = ticket!.verifyUrl || window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Western College Garba E-Pass',
        text: `Hey! I just booked my E-Pass for Western College Garba & Dandiya Night 2026. Pass ID: ${ticket!.passNumber}`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Western College Garba Pass: ${ticket!.passNumber} for ${ticket!.fullName}\nVerify: ${shareUrl}`,
      );
      alert('Pass details copied to clipboard!');
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        
        {/* Modal Backdrop animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#0b101c] border border-amber-500/40 shadow-2xl text-slate-100"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close ticket view"
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Ticket Body for Printing & Display */}
          <div ref={ticketRef} className="p-5 sm:p-8">
            
            {/* Top Success Banner */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400 mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-serif">
                E-Pass Confirmed!
              </h3>
              <p className="text-xs text-amber-400">
                Please present this digital pass with your College ID at the gate.
              </p>
            </div>

            {/* Authentic Pass Card Container */}
            <div className="rounded-2xl bg-gradient-to-b from-[#131b2e] to-[#0c1220] border-2 border-amber-500/40 p-5 sm:p-6 shadow-inner relative overflow-hidden">
              
              {/* Background watermark seal */}
              <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
                <Building2 className="w-64 h-64 text-amber-300" />
              </div>

              {/* Pass Header */}
              <div className="flex items-start justify-between border-b border-amber-500/20 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold tracking-wider text-amber-300 uppercase font-serif">
                      WESTERN COLLEGE
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Commerce & Business Management
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                    Student Pass
                  </span>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    {ticket.passNumber}
                  </p>
                </div>
              </div>

              {/* Event Title on Pass */}
              <div className="mb-4">
                <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                  ANNUAL NAVRATRI MAHOTSAV
                </span>
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 font-garba-title">
                  Garba & Dandiya Night
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1 font-script text-base text-amber-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Western College Main Quadrangle</span>
                </div>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800/90 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                    Student Name
                  </span>
                  <span className="font-bold text-slate-100 text-sm">
                    {ticket.fullName}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                    Roll No / ID
                  </span>
                  <span className="font-bold text-amber-300 font-mono text-sm">
                    {ticket.rollNumber}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                    Department & Year
                  </span>
                  <span className="font-medium text-slate-200">
                    {ticket.department} • {ticket.year}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                    Entry Gate
                  </span>
                  <span className="font-medium text-slate-200">
                    {ticket.entryGate}
                  </span>
                </div>
              </div>

              {/* Logistics Grid */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-1 text-[11px] text-slate-300">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Oct 2026</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>6:00 PM Onwards</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Campus Grounds</span>
                </div>
              </div>

              {/* Dandiya Sticks reserved badge */}
              {ticket.dandiyaPairRequested && (
                <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-[11px]">
                  <span className="text-amber-300 font-medium">
                    Complimentary Dandiya Pair:
                  </span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Reserved
                  </span>
                </div>
              )}

{/* QR Code & Barcode Section */}
                <div className="mt-4 pt-4 border-t border-dashed border-amber-500/30 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block">
                      Verification Code
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400 tracking-wider">
                      {ticket.verificationCode}
                    </span>
                    <div className="mt-1">
                      <Code128Barcode value={ticket.passNumber} height={26} />
                    </div>
                  </div>

                  {/* Real QR code (server-issued token) */}
                  <div className="p-2 bg-white rounded-lg shadow-md flex flex-col items-center justify-center">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="E-Pass QR Code"
                        className="w-24 h-24"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin" />
                      </div>
                    )}
                    <span className="text-[8px] font-mono text-slate-800 font-bold mt-0.5">SCAN ME</span>
                  </div>
                </div>

            </div>

            <p className="text-center text-[11px] text-slate-400 mt-2 break-all px-2">
              {ticket.verifyUrl && (
                <span className="font-mono text-[10px] text-slate-500">{ticket.verifyUrl}</span>
              )}
            </p>

            {/* Modal Actions */}
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Print Pass</span>
              </button>

              <button
                onClick={handleDownloadQr}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
              >
                <span className="text-amber-400 text-2xl">↓</span>
                <span>Download QR</span>
              </button>

              <button
                onClick={handleShare}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-amber-500/20 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Share / Save</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="mt-3 w-full py-3 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-700 flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
            >
              <span className="text-amber-400 text-2xl">←</span>
              <span>Back to Home</span>
            </button>

            <p className="text-center text-[11px] text-slate-400 mt-4">
              Booked on {ticket.bookingTimestamp} • Student Council Helpline: +91 98200 12345
            </p>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
