import React, { useState } from 'react';
import { Quote, ShieldCheck, MapPin, Anchor, Award } from 'lucide-react';
import { ScaleEdgeBottomDivider } from '../common/WhyMatsyaDividers';

const FOUNDER = {
  name: 'Omkar Gaikwad',
  role: 'FOUNDER & OWNER, MATSYA FISHERIES',
  photo: '/images/founder.jpg',
};

const STATS = [
  { value: '2023', label: 'ESTABLISHED', sub: 'Mumbai Coastal Supply', icon: Anchor },
  { value: '10+', label: 'COMMERCIAL CLIENTS', sub: 'Restaurants & Kitchens', icon: Award },
  { value: '16+', label: 'MUMBAI ZONES', sub: 'Colaba to Kandivali', icon: MapPin },
  { value: '50+ KG', label: 'DAILY LANDING', sub: '100% Net Weight', icon: ShieldCheck },
];

export default function TeamStorySection() {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <section id="story" className="relative w-full bg-[#FAF7EE] select-none">
      
      {/* Fish-scale edge: navy (Why Matsya) -> sand, with the heritage badge on the seam */}
      <ScaleEdgeBottomDivider>
        
      </ScaleEdgeBottomDivider>

      {/* Main Content Area */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 pt-12 sm:pt-14 pb-20 sm:pb-28">
        
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="h-[3px] w-10 bg-[#C2542D]" />
          <span className="text-xs font-black tracking-[0.28em] uppercase text-[#C2542D] font-['Sora',sans-serif]">
            FOUNDER & STORY
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left: Founder Card */}
          <div className="lg:col-span-5">
            <div className="relative w-full max-w-md mx-auto lg:max-w-none aspect-[4/5] rounded-[32px] overflow-hidden bg-[#1D184D] border-[4px] border-[#1D184D] shadow-2xl group">
              
              <div className="absolute top-4 left-4 z-20 bg-[#1D184D] border border-[#D5C582] text-[#D5C582] text-[10px] font-black tracking-widest uppercase px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C2542D]" />
                MUMBAI COASTAL OPERATIONS
              </div>

              {!photoFailed ? (
                <img
                  src={FOUNDER.photo}
                  alt={FOUNDER.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[#1D184D] p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#FAF7EE]/10 border-2 border-[#D5C582] flex items-center justify-center mb-2">
                    <Anchor className="w-10 h-10 text-[#D5C582]" />
                  </div>
                  <h4 className="text-2xl font-black text-[#FAF7EE] tracking-wide font-['Sora',sans-serif]">
                    MATSYA FISHERIES
                  </h4>
                  <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#D5C582]">
                    HYGIENIC SEAFOOD SUPPLY
                  </span>
                </div>
              )}

              {/* Nameplate Overlay */}
              <div className="absolute left-4 right-4 bottom-4 z-20 bg-[#1D184D] border-2 border-[#D5C582] rounded-2xl p-5 shadow-2xl">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xl font-black text-[#FAF7EE] tracking-tight font-['Sora',sans-serif]">
                      {FOUNDER.name}
                    </p>
                    <p className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-[#D5C582] mt-1">
                      {FOUNDER.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: High-Contrast Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1D184D] leading-[1.15] font-['Sora',sans-serif]">
              Born in Mumbai.{' '}
              <span className="text-[#1D184D]/60 font-bold block sm:inline">
                Built on trust.
              </span>
            </h2>

            <div className="mt-6 space-y-4 text-base sm:text-lg leading-relaxed text-[#1D184D] font-medium">
              <p>
                In 2023, <strong className="font-black text-[#1D184D]">Omkar Gaikwad</strong> founded <strong className="font-black text-[#C2542D]">MATSYA FISHERIES</strong> around one single discipline: <em>hygienic handling</em>. Freshness matters, but how the catch is handled from landing to delivery matters more.
              </p>
              <p>
                From dockside sourcing at dawn to RO-water processing and direct delivery, he built a daily operation supplying household tables, restaurants, caterers, and institutional kitchens across Mumbai with guaranteed 100% net edible weight.
              </p>
            </div>

            {/* Ethos Banner */}
            <div className="my-7 p-6 rounded-2xl bg-[#1D184D] text-[#FAF7EE] border-l-4 border-[#D5C582] shadow-xl relative overflow-hidden">
              <Quote className="absolute -right-2 -bottom-2 w-24 h-24 text-white/10 pointer-events-none" />
              <p className="text-xs font-black tracking-[0.2em] uppercase text-[#D5C582] mb-1 font-['Sora',sans-serif]">
                OUR DAILY PROMISE
              </p>
              <p className="text-base sm:text-lg font-black text-[#FAF7EE] leading-snug">
                Handled with care. Processed with discipline. Delivered with confidence.
              </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {STATS.map((stat, i) => {
                const IconComp = stat.icon;
                return (
                  <div
                    key={i}
                    className="bg-white border-2 border-[#1D184D] rounded-2xl p-4 shadow-md flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl sm:text-3xl font-black text-[#1D184D] font-['Sora',sans-serif]">
                        {stat.value}
                      </span>
                      <IconComp className="w-5 h-5 text-[#C2542D]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black tracking-wider uppercase text-[#1D184D]">
                        {stat.label}
                      </p>
                      <p className="text-[10px] font-bold text-[#1D184D]/70 mt-0.5">
                        {stat.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}