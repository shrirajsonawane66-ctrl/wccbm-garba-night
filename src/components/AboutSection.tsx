import React from 'react';
import { motion } from 'motion/react';
import { Music, Sparkles, Award, Shield, HeartHandshake, Compass } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const highlights = [
    {
      title: 'Authentic Raas-Garba Beats',
      description: 'Experience live Dhol-Tasha artists and energetic traditional Gujarati folk vocalists synchronized with modern festive bass.',
      icon: Music,
    },
    {
      title: 'Grand Dance Circles',
      description: 'Massive concentric circles under illuminated festive canopy strings where junior and senior batches groove together.',
      icon: Compass,
    },
    {
      title: 'Prestigious Competitions',
      description: 'Win coveted rolling trophies for Best Traditional Attire (Male & Female), Best Garba Steps, and Best Department Circle.',
      icon: Award,
    },
    {
      title: 'Zero Ragging & Safe Campus',
      description: '100% disciplined, student-council marshalled, secure campus environment equipped with medical aid and security.',
      icon: Shield,
    },
  ];

  return (
    <section id="about" className="py-16 lg:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs uppercase font-bold tracking-widest">Heritage & Celebration</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 font-serif tracking-tight mb-4">
            Celebrating Western Spirit
          </h2>
          
          <p className="text-base sm:text-lg text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
            The annual Western College Garba & Dandiya Night is the pinnacle cultural festival of our autonomous institution, uniting over 1,000 students across Commerce, Management, and Information Technology.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="rounded-2xl bg-[#0c1220]/80 dark:bg-[#0c1220]/80 light:bg-white p-6 border border-amber-500/15 dark:border-amber-500/15 light:border-amber-900/10 hover:border-amber-500/40 transition-all group shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Quote / College Principal Note */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-l-4 border-amber-500 text-slate-300 dark:text-slate-300 light:text-slate-700">
          <div className="flex items-start gap-4">
            <HeartHandshake className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <p className="italic text-base sm:text-lg mb-2">
                "Garba is not merely dance; it is an expression of shared harmony, festive vitality, and cultural pride that reflects the enduring ethos of Western College."
              </p>
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400 block">
                — Cultural Committee & Student Council, Western College (Autonomous)
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
