const fs = require('fs');
const path = require('path');
const filePath = path.join(process.cwd(), 'src', 'components', 'HeroSection.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// Replace the Sparkle Eyebrow section
const oldSection = `            {/* Sparkle Eyebrow */}
            <div className="flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 dark:text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-script text-xl sm:text-2xl text-amber-300">
                Let's Groove to the
              </span>
            </div>`;

const newSection = `            {/* Event Title */}
            <div className="flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 dark:text-amber-300">
              <span className="text-amber-300 font-medium">
                Garba Night 2026
              </span>
            </div>`;

if (content.includes(oldSection)) {
  content = content.replace(oldSection, newSection);
  console.log('Replaced Sparkle Eyebrow section');
} else {
  console.log('Could not find old section');
}

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('File written after Sparkle replacement');

// Now replace the trust metrics with countdown timer
const oldMetrics = `            {/* Quick trust metrics */}
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
            </div>`;

const newMetrics = `            {/* Countdown Timer */}
            <div className="mt-8 text-center sm:text-left">
              <div id="countdown-timer" className="flex items-center justify-center gap-2 sm:gap-4">
                <div className="text-amber-400 font-bold text-lg sm:text-xl" id="countdown-days">
                  <span data-value="days">0</span> Days
                </div>
                <div className="text-amber-400 font-bold text-lg sm:text-xl" id="countdown-hours">
                  <span data-value="hours">0</span> Hrs
                </div>
                <div className="text-amber-400 font-bold text-lg sm:text-xl" id="countdown-minutes">
                  <span data-value="minutes">0</span> Min
                </div>
              </div>
              <p className="text-sm sm:text-base text-slate-400 dark:text-slate-400 light:text-slate-600 mt-2">
                Garba Night 2026
              </p>
            </div>`;

if (content.includes(oldMetrics)) {
  content = content.replace(oldMetrics, newMetrics);
  console.log('Replaced trust metrics with countdown timer');
} else {
  console.log('Could not find old metrics section');
}

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('File written after metrics replacement');

console.log('Done modifying HeroSection.tsx');