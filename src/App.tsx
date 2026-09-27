/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, ArrowUp } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Header } from './components/Header.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { EventQuickBar } from './components/EventQuickBar.tsx';
import { BookingSection } from './components/BookingSection.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { EventSchedule } from './components/EventSchedule.tsx';
import { RulesAndFaq } from './components/RulesAndFaq.tsx';
import { ContactFooter } from './components/ContactFooter.tsx';
import { IntroVideo } from './components/IntroVideo.tsx';
import AdminApp from './admin/AdminApp.tsx';
import VerifyPage from './admin/VerifyPage.tsx';
import { StudentAuthProvider, useStudentAuth } from './student/StudentAuthContext.tsx';
import { SignUpPage } from './student/SignUpPage.tsx';
import { LoginPage } from './student/LoginPage.tsx';
import { ForgotPasswordPage } from './student/ForgotPasswordPage.tsx';
import { StudentDashboard } from './student/StudentDashboard.tsx';
import { useSeo } from './lib/seo.ts';

type Route =
  | { type: 'home' | 'admin' | 'signup' | 'login' | 'forgot' | 'dashboard' }
  | { type: 'verify'; token?: string };

function getRoute(): Route {
  const path = window.location.pathname;
  if (path.startsWith('/admin')) return { type: 'admin' };
  const hash = window.location.hash;
  if (hash.startsWith('#/admin')) return { type: 'admin' };
  if (path.startsWith('/verify/')) {
    return { type: 'verify', token: decodeURIComponent(path.split('/')[2] || '') };
  }
  if (hash.startsWith('#/verify/')) {
    return { type: 'verify', token: hash.split('/')[2] || '' };
  }
  if (path === '/signup') return { type: 'signup' };
  if (path === '/login') return { type: 'login' };
  if (path === '/forgot-password') return { type: 'forgot' };
  if (path === '/dashboard') return { type: 'dashboard' };
  return { type: 'home' };
}

function AppContent() {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [route, setRoute] = useState<Route>(() => getRoute());

  useEffect(() => {
    const onRoute = () => setRoute(getRoute());
    window.addEventListener('popstate', onRoute);
    window.addEventListener('hashchange', onRoute);
    return () => {
      window.removeEventListener('popstate', onRoute);
      window.removeEventListener('hashchange', onRoute);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // SEO / AEO / GEO: keeps <head> meta, canonical URLs and JSON-LD in sync.
  useSeo(route.type);

  if (route.type === 'admin') {
    return (
      <div className="min-h-screen">
        <AdminApp />
      </div>
    );
  }

  if (route.type === 'verify' && route.token) {
    return (
      <div className="min-h-screen">
        <VerifyPage token={route.token} />
      </div>
    );
  }

  if (route.type === 'signup') {
    return (
      <div className="min-h-screen">
        <SignUpPage />
      </div>
    );
  }

  if (route.type === 'login') {
    return (
      <div className="min-h-screen">
        <LoginPage />
      </div>
    );
  }

  if (route.type === 'forgot') {
    return (
      <div className="min-h-screen">
        <ForgotPasswordPage />
      </div>
    );
  }

  if (route.type === 'dashboard') {
    return (
      <div className="min-h-screen">
        <StudentDashboard />
      </div>
    );
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Optional gentle rhythmic Dandiya beat synthesizer for festive ambience
  const toggleFestiveBeat = () => {
    if (!audioCtx) {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      setAudioCtx(ctx);
      playDandiyaClack(ctx);
      setIsMusicPlaying(true);
    } else {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
        setIsMusicPlaying(true);
      } else if (audioCtx.state === 'running' && isMusicPlaying) {
        audioCtx.suspend();
        setIsMusicPlaying(false);
      } else {
        audioCtx.resume();
        playDandiyaClack(audioCtx);
        setIsMusicPlaying(true);
      }
    }
  };

  const playDandiyaClack = (ctx: AudioContext) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // Audio context policy safe fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#080c14] text-slate-900 dark:text-slate-100 transition-colors duration-300 relative">

      {/* Primary Sticky Header */}
      <Header />

      {/* Main Content Sections */}
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Event Quick Bar */}
        <EventQuickBar />

        {/* Booking Section (Why Book an E-Pass? & Get Your E-Pass CTA) */}
        <BookingSection />

        {/* About the Night */}
        <AboutSection />

        {/* Schedule & Awards */}
        <EventSchedule />

        {/* Guidelines, Dress Code & FAQs */}
        <RulesAndFaq />
      </main>

      {/* Footer */}
      <ContactFooter />

      {/* Floating Action Buttons (Audio Rhythms, Scroll to Top) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">

        {/* Festive Sound Beat toggle button */}
        <button
          onClick={toggleFestiveBeat}
          title={isMusicPlaying ? 'Mute Dandiya sound effect' : 'Play Dandiya sound effect'}
          aria-label="Toggle Dandiya sound effect"
          className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-900/90 dark:bg-slate-900/90 light:bg-white text-amber-400 dark:text-amber-400 light:text-amber-700 border border-amber-500/30 shadow-xl backdrop-blur-md hover:scale-105 transition-transform"
        >
          {isMusicPlaying ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5" />}
        </button>

        {/* Scroll To Top */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={scrollToTop}
              aria-label="Scroll back to top"
              className="w-11 h-11 rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl font-bold transition-colors"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => getRoute());
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    const onRoute = () => setRoute(getRoute());
    window.addEventListener('popstate', onRoute);
    window.addEventListener('hashchange', onRoute);
    return () => {
      window.removeEventListener('popstate', onRoute);
      window.removeEventListener('hashchange', onRoute);
    };
  }, []);

  // Only show intro on home page and only once per session
  const showIntro = route.type === 'home' && !introComplete;

  return (
    <ThemeProvider>
      <StudentAuthProvider>
        {showIntro ? (
          <IntroVideo onComplete={() => setIntroComplete(true)} />
        ) : (
          <AppContent />
        )}
      </StudentAuthProvider>
    </ThemeProvider>
  );
}