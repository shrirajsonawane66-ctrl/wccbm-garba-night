import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, UserCheck } from 'lucide-react';

export const EventQuickBar: React.FC = () => {
  const highlights = [
    {
      id: 'date',
      label: 'DATE',
      value: 'Coming Soon',
      subtext: 'Navratri Mahotsav 2026',
      icon: Calendar,
    },
    {
      id: 'time',
      label: 'TIME',
      value: '6:00 PM Onwards',
      subtext: 'Gates open at 5:30 PM',
      icon: Clock,
    },
    {
      id: 'venue',
      label: 'VENUE',
      value: 'Western College',
      subtext: 'Campus Main Quadrangle',
      icon: MapPin,
    },
    {
      id: 'entry',
      label: 'ENTRY',
      value: 'Students Only',
      subtext: 'Valid College ID Required',
      icon: UserCheck,
    },
  ];

  return (
    <section className="relative -mt-4 mb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-30">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl bg-[#0c1220]/95 dark:bg-[#0c1220]/95 light:bg-white/95 border border-amber-500/20 dark:border-amber-500/20 light:border-amber-900/15 p-4 sm:p-6 shadow-xl shadow-black/40 backdrop-blur-xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 lg:divide-x divide-slate-800/80 dark:divide-slate-800/80 light:divide-amber-900/10">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id} 
                className={`flex items-center gap-4 ${idx !== 0 ? 'pt-4 sm:pt-0 lg:pl-6' : ''}`}
              >
                {/* Rounded squircle box matching the screenshot */}
                <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-slate-900/90 dark:bg-slate-900/90 light:bg-amber-100/80 border border-amber-500/30 text-amber-400 dark:text-amber-400 light:text-amber-800 shadow-inner shadow-amber-500/10">
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Text Information */}
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-400 light:text-slate-600 uppercase">
                    {item.label}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 font-sans leading-snug">
                    {item.value}
                  </span>
                  <span className="text-xs text-amber-400/80 dark:text-amber-400/80 light:text-amber-700">
                    {item.subtext}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};
