const fs = require('fs');
const path = require('path');
const filePath = path.join(process.cwd(), 'src', 'components', 'EventQuickBar.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// Replace the highlights with countdown and professional info
const oldHighlights = `export const EventQuickBar: React.FC = () => {
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
  ];`;

const newHighlights = `export const EventQuickBar: React.FC = () => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    const targetDate = new Date('2026-10-01T18:00:00').getTime();
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff > 0) {
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      setCountdown({ days: d, hours: h, minutes: m });
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate - now;
      if (diff > 0) {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        setCountdown({ days: d, hours: h, minutes: m });
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (`
    <section className="relative -mt-4 mb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-30">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl bg-[#0c1220]/95 dark:bg-[#0c1220]/95 light:bg-white/95 border border-amber-500/20 dark:border-amber-500/20 light:border-amber-900/15 p-4 sm:p-6 shadow-xl shadow-black/40 backdrop-blur-xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 lg:divide-x divide-slate-800/80 dark:divide-slate-800/80 light:divide-amber-900/10">
          {['date', 'time', 'venue', 'entry'].map((id) => {
            const labels = {
              date: { label: 'DATE', subtext: 'Garba Night 2026' },
              time: { label: 'TIME', subtext: '6:00 PM Onwards' },
              venue: { label: 'VENUE', subtext: 'Western College Campus' },
              entry: { label: 'ENTRY', subtext: 'Students Only' },
            };
            const item = labels[id];
            return (
              <div 
                key={id} 
                className={`flex items-center gap-4 ${id !== 'date' ? 'pt-4 sm:pt-0 lg:pl-6' : ''}`}
              >
                {/* Rounded squircle box matching the screenshot */}
                <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-amber-500/10 border border-amber-400/30 text-amber-400 dark:text-amber-300 shadow-inner shadow-amber-500/10">
                  <span className="text-amber-400 text-5xl font-bold">{id === 'date' ? `${countdown.days}d ${countdown.hours}h` : id === 'time' ? '6:00 PM' : id === 'venue' ? 'Western College' : 'Students Only'}</span>
                </div>
                
                {/* Text Information */}
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-400 light:text-slate-600 uppercase">
                    {item.label}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 font-sans leading-snug">
                    {item.subtext}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  `);
});`

if (content.includes(oldHighlights)) {
  content = content.replace(oldHighlights, newHighlights);
  console.log('Replaced EventQuickBar highlights');
} else {
  console.log('Could not find old highlights section');
}

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('File written after EventQuickBar replacement');