import React from 'react';
import { ShieldCheck, RefreshCw, Fish, MapPin, Anchor } from 'lucide-react';

const FEATURES = [
  {
    number: '01',
    title: 'HYGIENE',
    description:
      'Our first priority, before freshness. Every catch is handled with care, cleaned in pure RO water, processed with discipline and delivered with confidence.',
    icon: ShieldCheck,
  },
  {
    number: '02',
    title: 'CONSISTENCY',
    description:
      'Reliable supply for recurring customers. Restaurants, caterers and institutional kitchens depend on the same catch and the same standard, every single order.',
    icon: RefreshCw,
  },
  {
    number: '03',
    title: 'VARIETY',
    description:
      '18 fresh catches of Indian seafood, from Surmai, Pomfret and Bombil to prawns and mud crab. Cut, weighed and packed to order on the day it is sold.',
    icon: Fish,
  },
  {
    number: '04',
    title: 'REACH',
    description:
      '16+ Mumbai delivery areas, from Colaba and Worli to Andheri, Chembur and Kandivali. Dock-to-door across the city, wholesale and retail.',
    icon: MapPin,
  },
];

export default function WhyMatsya() {
  return (
    <section id="why-matsya" className="relative w-full bg-[#1D184D] text-[#FAF7EE] select-none">
      
      {/* Fading Horizon Section Divider (Sand #FAF7EE -> Navy #1D184D) */}
      <div className="w-full bg-[#FAF7EE] flex flex-col relative">
        <div className="h-1 w-full bg-[#1D184D]/05" />
        <div className="h-1.5 w-full bg-[#1D184D]/15" />
        <div className="h-1 w-full bg-[#D5C582]/30" /> {/* Gold Horizon Line */}
        <div className="h-2 w-full bg-[#1D184D]/30" />
        <div className="h-1.5 w-full bg-[#C2542D]/40" /> {/* Terracotta Horizon Line */}
        <div className="h-3 w-full bg-[#1D184D]/55" />
        <div className="h-4 w-full bg-[#1D184D]/80" />
        <div className="h-6 w-full bg-[#1D184D]" />

        
      </div>

      {/* Main Section Content */}
      <div className="max-w-[1560px] mx-auto px-6 sm:px-12 pt-8 pb-20 sm:pb-28">
        {/* Header */}
        <div className="max-w-4xl mb-14">
          <span className="text-xs font-black tracking-[0.28em] text-[#D5C582] uppercase block mb-3 font-['Sora',sans-serif]">
            WHY MATSYA?
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#FAF7EE] font-['Sora',sans-serif] leading-tight">
            Built from real customers.{' '}
            <span className="text-white/40 font-normal block sm:inline">
              Real demand. Real daily operations.
            </span>
          </h2>
        </div>

        {/* 4-Card Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.number}
                className="group relative bg-[#16123D] border-2 border-[#D5C582]/20 hover:border-[#D5C582] p-7 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[0_10px_30px_rgba(213,197,130,0.15)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-11 h-11 rounded-xl bg-[#D5C582]/10 border border-[#D5C582]/30 flex items-center justify-center text-[#D5C582] group-hover:bg-[#D5C582] group-hover:text-[#1D184D] transition-colors duration-300">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#D5C582]/40 tracking-widest">
                      {item.number}
                    </span>
                  </div>

                  <span className="block w-8 h-[3px] rounded-full bg-[#C2542D] mb-4" />

                  <h3 className="text-lg font-bold tracking-wider uppercase text-[#FAF7EE] mb-3 font-['Sora',sans-serif]">
                    {item.title}
                  </h3>

                  <p className="text-xs text-white/70 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}