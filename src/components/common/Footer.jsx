import React from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  Truck,
  Waves,
  ArrowUpRight,
  Clock,
  Sparkles,
} from 'lucide-react';

const MATSYA_WHATSAPP_NUMBER = '919372379317';
const BULK_INQUIRY_TEXT = encodeURIComponent(
  'Hello Matsya Fisheries, I would like to inquire about bulk / wholesale seafood supply for my business.'
);
const WHATSAPP_BULK_URL = `https://wa.me/${MATSYA_WHATSAPP_NUMBER}?text=${BULK_INQUIRY_TEXT}`;

export default function Footer({
  logoSrc = '/images/matsya-logo-navbar.png',
  onLogoClick,
}) {
  const handleLogoClick = (e) => {
    e.preventDefault();
    if (onLogoClick) {
      onLogoClick();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#100D2D] text-[#FAF7EE] border-t border-white/10 font-['Sora',sans-serif] select-none relative overflow-hidden">
      
      {/* 🌊 Trust Badges Bar */}
      <div className="bg-[#16123D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D5C582]/15 border border-[#D5C582]/30 flex items-center justify-center text-[#D5C582] shrink-0">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAF7EE]">
                100% Dock Fresh
              </h4>
              <p className="text-[11px] text-white/60">Sourced daily from Mumbai docks</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6EE7A8]/15 border border-[#6EE7A8]/30 flex items-center justify-center text-[#6EE7A8] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAF7EE]">
                Chemical Free
              </h4>
              <p className="text-[11px] text-white/60">No formalin or artificial preservatives</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C2542D]/15 border border-[#C2542D]/30 flex items-center justify-center text-[#C2542D] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAF7EE]">
                Hygienically Cleaned
              </h4>
              <p className="text-[11px] text-white/60">Custom cuts & chilled handling</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D5C582]/15 border border-[#D5C582]/30 flex items-center justify-center text-[#D5C582] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAF7EE]">
                Express Delivery
              </h4>
              <p className="text-[11px] text-white/60">Morning & Evening catch windows</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION DIVIDER ─── */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* 🏙️ Main Content Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-10">
        
        {/* Col 1: Brand & Tagline */}
        <div className="space-y-4 md:col-span-1">
          <a
            href="/"
            onClick={handleLogoClick}
            className="inline-flex items-center gap-2.5 transition-transform active:scale-95"
          >
            <img
              src={logoSrc}
              alt="Matsya Logo"
              className="h-7 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/matsya-logo.png';
              }}
            />
            <span className="font-medium text-[20px] tracking-[0.2em] uppercase text-[#FAF7EE]">
              MATSYA
            </span>
          </a>

          <p className="text-xs text-white/60 leading-relaxed">
            Delivering dock-to-door fresh, sustainable, and chemical-free coastal seafood straight to Mumbai kitchens.
          </p>

          <a
            href={WHATSAPP_BULK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/25 transition-all text-xs font-bold"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>WhatsApp Order / Inquiry</span>
          </a>
        </div>

        {/* Col 2: Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#D5C582]">
            Explore
          </h4>
          <ul className="space-y-2 text-xs font-medium text-white/70">
            <li>
              <a href="#all-products" className="hover:text-[#D5C582] transition-colors">
                Today's Catches
              </a>
            </li>
            <li>
              <a href="#story" className="hover:text-[#D5C582] transition-colors">
                Our Story & Docks
              </a>
            </li>
            <li>
              <a
                href={WHATSAPP_BULK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#D5C582] transition-colors inline-flex items-center gap-1"
              >
                <span>Bulk & Restaurant Supply</span>
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Serviceable Zones (Concise list from delivery_zones table) */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#D5C582]">
            Serviceable Zones
          </h4>
          <ul className="space-y-2 text-xs font-medium text-white/70">
            <li className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C2542D] shrink-0 mt-0.5" />
              <span>Parel, Wadala & Sion</span>
            </li>
            <li className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C2542D] shrink-0 mt-0.5" />
              <span>South Mumbai (Colaba to Mazgaon)</span>
            </li>
            <li className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C2542D] shrink-0 mt-0.5" />
              <span>Central / West Central (Worli to Mahim)</span>
            </li>
            <li className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C2542D] shrink-0 mt-0.5" />
              <span>Bandra to Andheri East</span>
            </li>
            <li className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C2542D] shrink-0 mt-0.5" />
              <span>Goregaon, Kandivali & Borivali</span>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact & Operations */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#D5C582]">
            Contact & Operations
          </h4>
          <div className="space-y-2 text-xs text-white/70">
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#D5C582]" />
              <span>+91 93723 79317</span>
            </p>
            <p className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-[#D5C582] shrink-0 mt-0.5" />
              <span>Daily Catch Slots: 7 AM – 10 AM & 4 PM – 7 PM</span>
            </p>
            <p className="text-[11px] text-white/50 pt-2 border-t border-white/10">
              Direct sourcing from Bhaucha Dhakka (Ferry Wharf) & Sassoon Docks, Mumbai.
            </p>
          </div>
        </div>

      </div>

      {/* ─── SECTION DIVIDER ─── */}
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* 📜 Bottom Bar */}
      <div className="bg-[#0B0821] py-6 px-4 sm:px-8 text-center sm:flex sm:items-center sm:justify-between text-[11px] text-white/50 max-w-6xl mx-auto">
        <p>© {new Date().getFullYear()} Matsya Fisheries. All rights reserved.</p>
        <p className="mt-2 sm:mt-0 font-medium">
          Fresh Coastal Seafood Delivered Across Mumbai 🌊
        </p>
      </div>

    </footer>
  );
}