import React from 'react';

export default function HeroBanner({ onExploreCatalog }) {
  return (
    <section className="relative w-full bg-[#FAF7EE] overflow-hidden">
      {/* Edge-to-edge banner graphic */}
      <div className="relative w-full max-w-[1920px] mx-auto -mt-12 sm:-mt-20 md:-mt-28 lg:-mt-36">
        <img
          src="/images/hero/hero-banner.jpg"
          alt="Where Every Catch Begins - Matsya Fisheries"
          className="w-full h-auto block select-none pointer-events-none"
        />

        {/* CTA Button */}
        <div className="absolute bottom-16 sm:bottom-24 md:bottom-32 lg:bottom-40 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => {
              document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-7 py-3 sm:px-9 sm:py-3.5 bg-[#1D184D] text-[#D5C582] text-xs sm:text-sm font-bold tracking-wider uppercase rounded-full shadow-2xl hover:bg-[#15113A] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap border border-[#D5C582]/30 hover:border-[#D5C582]"
          >
            Order Fresh Catch
          </button>
        </div>
      </div>

      {/* Smooth transition wave into the navy product section */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none z-10">
        <svg
          className="relative block w-full h-10 sm:h-16 md:h-20 text-[#1D184D]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C150,90 350,-40 500,50 C650,140 900,10 1200,40 L1200,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}