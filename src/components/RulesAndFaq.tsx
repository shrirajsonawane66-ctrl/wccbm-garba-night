import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, CheckCircle, AlertTriangle, Shirt, IdCard, Sparkles } from 'lucide-react';
import { faqs } from '../lib/seo.ts';

export const RulesAndFaq: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const rules = [
    {
      icon: IdCard,
      title: 'Mandatory Student ID Card',
      desc: 'Physical Western College student ID card along with the digital E-Pass QR code is required for campus admission.',
    },
    {
      icon: Shirt,
      title: 'Traditional Attire Mandatory',
      desc: 'Boys: Kurta Pyjama / Kedia / Dhoti. Girls: Chaniya Choli / Ghagra / Traditional Kurti. Western casuals not permitted.',
    },
    {
      icon: AlertTriangle,
      title: 'Strict Campus Safety Guidelines',
      desc: 'No outside food, beverages, sharp objects, or unauthorized guests. Discipline monitored by college faculty and student marshals.',
    },
    {
      icon: Sparkles,
      title: 'Dandiya Sticks Guidelines',
      desc: 'Wooden dandiya sticks will be distributed at entry for students who opt for it. Metal or sharp acrylic sticks are prohibited.',
    },
  ];

  return (
    <section className="py-16 lg:py-24 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Guidelines Grid */}
      <div className="mb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-xs uppercase font-bold tracking-widest">General Guidelines</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 font-serif">
            Rules & Campus Etiquette
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rules.map((rule) => {
            const Icon = rule.icon;
            return (
              <div
                key={rule.title}
                className="p-5 rounded-2xl bg-[#0c1220]/70 dark:bg-[#0c1220]/70 light:bg-white border border-amber-500/20 shadow-md flex flex-col items-start"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-slate-100 dark:text-slate-100 light:text-slate-900 mb-1.5">
                  {rule.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 font-serif">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-[#0e1424] dark:bg-[#0e1424] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-slate-200 dark:text-slate-200 light:text-slate-800 focus:outline-none"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-amber-400 transition-transform duration-200 flex-shrink-0 ${
                    openFaq === idx ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 pb-4 text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-100 pt-3"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
