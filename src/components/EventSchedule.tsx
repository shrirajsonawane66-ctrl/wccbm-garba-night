import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Sparkles, MapPin, Trophy, ShieldAlert, Check } from 'lucide-react';

export const EventSchedule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'awards' | 'venue'>('schedule');

  const timeline = [
    {
      time: '05:30 PM',
      title: 'Gates Open & Security Check',
      desc: 'Entry via Gate 1 & 2. Verification of Student College ID and digital E-Pass.',
    },
    {
      time: '06:00 PM',
      title: 'Dandiya Sticks Distribution & Warmup',
      desc: 'Collection of complimentary traditional wooden dandiya sticks at counter booths.',
    },
    {
      time: '06:30 PM',
      title: 'Inaugural Lamp Lighting & Durga Aarti',
      desc: 'Solemn traditional prayer seeking divine blessings with faculty, principal & council.',
    },
    {
      time: '07:00 PM',
      title: 'Traditional Raas & 3-Taali Garba Rounds',
      desc: 'Classical Gujarati folk rhythms, Dodhiya steps, and synchronized concentric circles.',
    },
    {
      time: '08:30 PM',
      title: 'High-Energy Sanedo & DJ Bollywood Fusion',
      desc: 'Live Dhol-Tasha troop joins the DJ booth for non-stop energetic dance numbers.',
    },
    {
      time: '09:45 PM',
      title: 'Felicitation & Award Ceremony',
      desc: 'Declaration of Best Dancer, Best Dressed, and Department Champions.',
    },
    {
      time: '10:30 PM',
      title: 'Grand Finale Circle & Event Conclusion',
      desc: 'Final celebratory circle and safe orderly dispersal.',
    },
  ];

  const awards = [
    { title: 'Best Traditional Attire (Female)', prize: 'Golden Trophy & Gift Hamper' },
    { title: 'Best Traditional Attire (Male)', prize: 'Golden Trophy & Gift Hamper' },
    { title: 'King of Raas (Best Dancer - Male)', prize: 'Championship Shield' },
    { title: 'Queen of Raas (Best Dancer - Female)', prize: 'Championship Shield' },
    { title: 'Best Synchronized Department Circle', prize: 'Inter-Department Rolling Trophy' },
    { title: 'Best Innovative Garba Steps', prize: 'Special Jury Citation' },
  ];

  return (
    <section id="details" className="py-16 lg:py-24 relative bg-[#090d17]/60 dark:bg-[#090d17]/60 light:bg-amber-50/60 border-y border-amber-500/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs uppercase font-bold tracking-widest">Plan Your Evening</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 dark:text-slate-100 light:text-slate-900 font-serif">
            Event Schedule & Details
          </h2>
          <p className="text-sm sm:text-base text-slate-400 dark:text-slate-400 light:text-slate-600 mt-2">
            Stay prepared and don't miss out on any of the highlights planned for the night.
          </p>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center justify-center gap-2 mt-6 p-1.5 rounded-full bg-slate-900/80 dark:bg-slate-900/80 light:bg-amber-200/50 border border-amber-500/20 max-w-sm mx-auto">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all ${
                activeTab === 'schedule'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('awards')}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all ${
                activeTab === 'awards'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Awards & Prizes
            </button>
          </div>
        </div>

        {/* Tab 1: Timeline */}
        {activeTab === 'schedule' && (
          <div className="max-w-3xl mx-auto">
            <div className="relative border-l-2 border-amber-500/30 ml-4 sm:ml-8 space-y-8 py-2">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.time}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="relative pl-6 sm:pl-10 group"
                >
                  {/* Timeline node */}
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#0c1220] border-2 border-amber-400 group-hover:bg-amber-400 transition-colors shadow-[0_0_8px_#f59e0b]" />

                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1424] dark:bg-[#0e1424] light:bg-white border border-amber-500/15 shadow-md">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {item.time}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-100 dark:text-slate-100 light:text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Awards & Competitions */}
        {activeTab === 'awards' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {awards.map((award, i) => (
              <motion.div
                key={award.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-[#0e1424] dark:bg-[#0e1424] light:bg-white border border-amber-500/20 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-slate-100 dark:text-slate-100 light:text-slate-900 mb-1">
                    {award.title}
                  </h4>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 dark:border-slate-800 light:border-slate-200">
                  <span className="text-xs font-semibold text-amber-400 dark:text-amber-400 light:text-amber-700">
                    Prize: {award.prize}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
