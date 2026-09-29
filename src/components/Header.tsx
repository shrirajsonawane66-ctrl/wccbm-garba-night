import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Ticket,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  UserRound
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'About', href: '#about', id: 'about' },
    { name: 'Event Details', href: '#details', id: 'details' },
    { name: 'Book E-Pass', href: '/signup', id: 'book-pass' },
    { name: 'Contact', href: '#contact', id: 'contact' },
  ];

  const handleNavClick = (id: string, href: string) => {
    setActiveNav(id);
    setMobileMenuOpen(false);
    // Buy/account actions leave the landing page; everything else scrolls.
    if (href.startsWith('/')) {
      window.location.href = href;
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#080c14]/90 dark:bg-[#080c14]/90 light:bg-amber-50/90 border-b border-amber-500/15 dark:border-amber-500/15 light:border-amber-900/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: College Emblem & Title */}
        <a 
          href="#home" 
          id="college-logo-link"
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base sm:text-lg text-slate-100 dark:text-slate-100 light:text-slate-900 font-serif">
                WESTERN COLLEGE
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                AUTONOMOUS
              </span>
            </div>
            <span className="hidden sm:block text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 font-medium">
              of Commerce & Business Management
            </span>
          </div>
        </a>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              id={`nav-link-${link.id}`}
              onClick={() => handleNavClick(link.id, link.href)}
              className={`relative px-3.5 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
                activeNav === link.id
                  ? 'text-amber-400 font-semibold'
                  : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-amber-300'
              }`}
            >
              {link.name}
              {activeNav === link.id && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Right: Actions (Theme toggle, Get E-Pass CTA) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Dark / Light Mode Toggle */}
          <button
            id="theme-toggle-button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-900/80 hover:bg-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-800 light:bg-amber-200/60 light:hover:bg-amber-200 text-amber-400 dark:text-amber-400 light:text-amber-800 border border-amber-500/20 transition-all duration-200 focus:outline-none"
          >
            {theme === 'dark' ? (
              <span className="text-amber-400 text-3xl">☀️</span>
            ) : (
              <span className="text-slate-400 text-3xl">🌙</span>
            )}
          </button>

          {/* Student Login link */}
          <a
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-sm font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 border border-slate-700/70 dark:border-slate-700/70 light:border-slate-300 hover:border-amber-500/60 hover:text-amber-300 transition-colors duration-200"
          >
            <span className="text-slate-300 text-2xl">👤</span>
            <span>Student Login</span>
          </a>

          {/* Get E-Pass Gradient Pill Button */}
          <motion.a
            id="header-get-epass-btn"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            href="/signup"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-bold text-sm text-white shadow-lg shadow-orange-500/25 bg-gradient-to-r from-[#ff5e3a] via-[#f84f47] to-[#e91e63] hover:from-[#ff6b48] hover:to-[#f02b70] transition-all duration-300 focus:outline-none"
          >
            <span className="text-amber-400 text-2xl">🎫</span>
            <span>Get E-Pass</span>
          </motion.a>

          {/* Mobile hamburger menu button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg text-slate-300 dark:text-slate-300 light:text-slate-800 hover:bg-slate-800/50"
          >
            {mobileMenuOpen ? <span className="text-slate-300 text-3xl">✕</span> : <span className="text-slate-300 text-3xl">☰</span>}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-amber-500/20 bg-[#080c14] dark:bg-[#080c14] light:bg-amber-50 px-4 pt-3 pb-6 space-y-2 shadow-2xl"
          >
            {navLinks.map((link) => (
              <button
                key={link.id}
                id={`mobile-nav-${link.id}`}
                onClick={() => handleNavClick(link.id, link.href)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeNav === link.id
                    ? 'bg-amber-500/15 text-amber-400 font-semibold'
                    : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {link.name}
              </button>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <a
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#ff5e3a] to-[#e91e63]"
              >
                <span className="text-amber-400 text-2xl">🎫</span>
                <span>Create My E-Pass Account</span>
              </a>
              <a
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold text-amber-400 border border-amber-500/40"
              >
                <span className="text-slate-300 text-2xl">👤</span>
                <span>Student Login</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
