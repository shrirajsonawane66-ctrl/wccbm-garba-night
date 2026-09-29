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
  console.log('Could not find old section - trying alternative');
  // Try with different whitespace
  const oldSection2 = `            {/* Sparkle Eyebrow */}
<div className="flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 dark:text-amber-300">
  <Sparkles className="w-4 h-4 text-amber-400" />
  <span className="font-script text-xl sm:text-2xl text-amber-300">
    Let's Groove to the
  </span>
</div>`;
  if (content.includes(oldSection2)) {
    content = content.replace(oldSection2, newSection);
    console.log('Replaced Sparkle Eyebrow section (alternative match)');
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('File written after Sparkle replacement');