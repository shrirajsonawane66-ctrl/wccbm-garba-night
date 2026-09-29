import React from 'react';
import { motion } from 'motion/react';

type LabelItem = { label: string; text: string };

export const EventQuickBar: React.FC = () => {
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
          {(['date', 'time', 'venue', 'entry'] as const).map((id) => {
            const labels: Record<string, LabelItem> = {
              date: { label: 'DATE', text: 'Garba Night 2026' },
              time: { label: 'TIME', text: '6:00 PM Onwards' },
              venue: { label: 'VENUE', text: 'Western College Campus' },
              entry: { label: 'ENTRY', text: 'Students Only' },
            };
            const item = labels[id];
            return (
              <div 
                key={id} 
                className={"flex items-center " + (id !== 'date' ? 'pt-4 sm:pt-0 lg:pl-6' : '')}
              >
                {/* Text Information */}
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-400 light:text-slate-600 uppercase">
                    {item.label}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 font-sans leading-snug">
                    {item.text}
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