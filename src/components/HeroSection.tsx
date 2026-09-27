import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Ticket, ArrowRight, Music2, Flame, Heart } from 'lucide-react';
import garbaHeroImage from '../assets/images/garba_hero.jpg';

export const HeroSection: React.FC = () => {
  return (
    <section id="home" className="relative pt-6 pb-16 lg:py-20 overflow-hidden">
      {/* Background Video - plays muted and looped */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-[-1] opacity-[0.5]"
        src="/video/20260927_174848_0_UTC_0.mp4"
        poster={garbaHeroImage}
      />

      {/* Decorative Festive Canopy Fairy Lights across the top */}
      <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none flex justify-around items-start opacity-70 z-10">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div 
              className="w-px bg-amber-500/40" 
              style={{ height: `${12 + (i % 4) * 8}px` }} 
            />
            <div 
              className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_10px_#f59e0b] animate-pulse" 
              style={{ animationDelay: `${i * 180}ms` }} 
            />
          </div>
        ))}
      </div>

      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-pink-500/10 dark:bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Hero Text & Call to Action */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col items-start"
          >
            {/* Sparkle Eyebrow */}
            <div className="flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 dark:text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-script text-xl sm:text-2xl text-amber-300">
                Let's Groove to the
              </span>
            </div>

            {/* Main Garba Title with Stylized Typography */}
            <div className="relative mb-2">
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-amber-400 to-orange-500 font-garba-title drop-shadow-[0_4px_24px_rgba(245,158,11,0.25)]">
                Garba
              </h1>
              <span className="block font-script text-4xl sm:text-5xl md:text-6xl text-amber-300 dark:text-amber-200 -mt-3 sm:-mt-5 ml-2 sm:ml-8 transform -rotate-2 drop-shadow-md">
                Dandiya Night
              </span>
            </div>

            {/* Tagline: TRADITION • MUSIC • TOGETHERNESS */}
            <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 my-4 text-xs sm:text-sm uppercase font-bold tracking-[0.25em] text-amber-400/90 dark:text-amber-300/90">
              <span>TRADITION</span>
              <span className="text-amber-500 text-base">•</span>
              <span>MUSIC</span>
              <span className="text-amber-500 text-base">•</span>
              <span>TOGETHERNESS</span>
            </div>

            {/* Event Description */}
            <p className="text-base sm:text-lg text-slate-300 dark:text-slate-300 light:text-slate-700 leading-relaxed max-w-xl mb-8">
              Western College brings to you a vibrant Garba Night filled with music, dance, and endless energy! Celebrate culture, colors, and rhythms together under the starlit sky.
            </p>

            {/* Primary Action Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <motion.a
                id="hero-book-now-btn"
                href="/signup"
                whileHover={{ scale: 1.03, boxShadow: '0 10px 30px -5px rgba(255, 94, 58, 0.5)' }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-full font-bold text-base text-white shadow-xl shadow-orange-500/20 bg-gradient-to-r from-[#ff5e3a] via-[#f84f47] to-[#e91e63] hover:from-[#ff6b48] hover:to-[#f02b70] transition-all duration-300 w-full sm:w-auto"
              >
                <Ticket className="w-5 h-5 fill-white/20 flex-shrink-0" />
                <span>Book Your E-Pass Now</span>
                <ArrowRight className="w-4 h-4 ml-1 flex-shrink-0" />
              </motion.a>
            </div>

            {/* Quick trust metrics */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-slate-800/80 dark:border-slate-800/80 light:border-amber-900/10 text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600">
              <div className="flex items-center gap-1.5">
                <Music2 className="w-4 h-4 text-amber-400" />
                <span>Live Dhol & DJ Fusion</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>500+ Dancers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-pink-400" />
                <span>Free Dandiya Sticks</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Glowing Festive Card with Dancer Photograph */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-5 flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-md">
              {/* Outer Golden/Copper Glow Frame */}
              <div className="absolute -inset-1.5 rounded-[28px] bg-gradient-to-b from-amber-400/50 via-orange-500/30 to-amber-600/60 blur-md opacity-80" />

              {/* Main Card Container */}
              <div className="relative rounded-[24px] overflow-hidden bg-[#0e1422] border-2 border-amber-400/40 shadow-2xl">
                
                {/* Image Aspect ratio container with ambient dark overlay */}
                <div className="relative aspect-[3/4] w-full overflow-hidden group">
                  <img
                    src={garbaHeroImage}
                    alt="Western College Students dancing Raas Garba under festive canopy lights"
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                    loading="eager"
                    referrerPolicy="no-referrer"
                  />

                  {/* Gradient vignette for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-black/20" />

                  {/* Top-Right Festive Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/40 text-[11px] font-semibold text-amber-300 flex items-center gap-1.5 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Annual Navratri Raas</span>
                  </div>

                  {/* Bottom Bar matching screenshot exactly */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 flex items-center justify-between bg-gradient-to-t from-[#080c14] via-[#080c14]/90 to-transparent">
                    <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs sm:text-sm">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Live Raas-Garba</span>
                    </div>

                    <div className="font-script text-lg sm:text-xl text-amber-200">
                      Western College Campus
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating golden sparkle element */}
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-400/20 backdrop-blur-md border border-amber-300/40 flex items-center justify-center text-amber-300">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
