import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, UserPlus, Ticket, Sparkles } from 'lucide-react';

interface LoginPopupProps {
  onClose: () => void;
}

export const LoginPopup: React.FC<LoginPopupProps> = ({ onClose }) => {
  const handleLoginClick = () => {
    onClose();
    window.location.href = '/login';
  };

  const handleSignupClick = () => {
    onClose();
    window.location.href = '/signup';
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/70 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-popup-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#0b101c] border border-amber-500/40 shadow-2xl text-slate-100"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close login popup"
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8 text-center">
            {/* Festive Header */}
            <div className="mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 mx-auto mb-4 shadow-lg shadow-amber-500/25">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 id="login-popup-title" className="text-2xl sm:text-3xl font-bold text-white font-serif">
                Welcome to Western College Garba Night!
              </h2>
              <p className="text-slate-400 mt-2 text-sm sm:text-base">
                Get your free E-Pass for the biggest Navratri celebration on campus.
              </p>
            </div>

            {/* Benefit highlights */}
            <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-[#0e1424] rounded-2xl border border-slate-800">
              <div className="flex flex-col items-center gap-1.5">
                <Ticket className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-semibold text-slate-100">Free E-Pass</span>
                <span className="text-[10px] text-slate-500">One per student</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-semibold text-slate-100">Live Raas-Garba</span>
                <span className="text-[10px] text-slate-500">Dhol & DJ Fusion</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-semibold text-slate-100">Easy Signup</span>
                <span className="text-[10px] text-slate-500">Student ID only</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <LogIn className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-semibold text-slate-100">Secure Access</span>
                <span className="text-[10px] text-slate-500">Supabase Auth</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSignupClick}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#ff5e3a] via-[#f84f47] to-[#e91e63] hover:from-[#ff6b48] hover:to-[#f02b70] flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
              >
                <UserPlus className="w-5 h-5" />
                <span>Create Account & Get E-Pass</span>
              </button>

              <button
                onClick={handleLoginClick}
                className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 flex items-center justify-center gap-2 border border-amber-500 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span>I Have an Account – Log In</span>
              </button>
            </div>

            <p className="text-center text-[11px] text-slate-500 mt-4">
              This welcome message appears only once.{' '}
              <span className="font-medium text-amber-400">Welcome to the celebration!</span>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};