import React from 'react';
import { Building2, Phone, Mail, MapPin, Heart, Instagram, Facebook, Globe, Sparkles, ShieldCheck } from 'lucide-react';

export const ContactFooter: React.FC = () => {
  return (
    <footer id="contact" className="bg-[#05080f] text-slate-400 border-t border-amber-500/20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Col 1: College Emblem & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-100 font-serif">
                  WESTERN COLLEGE
                </h4>
                <p className="text-[11px] text-slate-400">
                  Autonomous Institution
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Western College of Commerce & Business Management brings academia and vibrant cultural celebration together under the starlit sky.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="#contact" 
                aria-label="Instagram page"
                className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="#contact" 
                aria-label="Facebook page"
                className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="#contact" 
                aria-label="Official Website"
                className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Event Quick Info */}
          <div>
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 font-serif">
              Event Highlights
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Raas-Garba & Dhol Beats</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Navratri Aarti & Sanedo</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Best Attire & Dancing Trophies</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Complimentary Dandiya Sticks</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Food Stalls & Refreshment Zone</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Student Council Helpline */}
          <div>
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 font-serif">
              Student Helpdesk
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-200 block font-semibold">General Helpline:</span>
                  <span>+91 98200 12345 / 98201 67890</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-200 block font-semibold">Cultural Desk:</span>
                  <span>garba.cultural@westerncollege.edu.in</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 4: Campus Venue */}
          <div>
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 font-serif">
              Campus Venue
            </h4>
            <div className="flex items-start gap-2.5 text-xs">
              <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Western College Campus,<br />
                Plot No. 2, Sector 9, Main Institutional Zone,<br />
                Opposite Central Garden,<br />
                Autonomous Campus Quadrangle Ground.
              </p>
            </div>
            <div className="mt-4 p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/20 text-[11px] text-amber-300">
              Entry via Gate 1 (BMS & Commerce) and Gate 2 (IT & PG).
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Western College of Commerce & Business Management (AUTONOMOUS). All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Organized with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>by Western College Student Council & Cultural Committee</span>
          </div>
        </div>

        {/* Extreme bottom strip */}
        <div className="pt-6 mt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-600">
            E-Pass registration system · One pass per student · Entry only with valid QR
          </p>
          <a href="/admin" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-amber-300 transition-colors">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin Console
          </a>
        </div>

      </div>
    </footer>
  );
};
