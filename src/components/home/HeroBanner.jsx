import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function HeroBanner({ onExploreCatalog, isPreloaderFinished = false }) {
  const containerRef = useRef(null);
  const topTextRef = useRef(null);
  const fishRef = useRef(null);
  const bottomContentRef = useRef(null);

  useEffect(() => {
    if (!isPreloaderFinished) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        topTextRef.current,
        { opacity: 0, y: -40 },
        { opacity: 1, y: 0, duration: 0.85 }
      )
        .fromTo(
          fishRef.current,
          { opacity: 0, x: -300 },
          { opacity: 1, x: 0, duration: 1.05, ease: 'power2.out' },
          '-=0.45'
        )
        .fromTo(
          bottomContentRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.55'
        );
    }, containerRef);

    return () => ctx.revert();
  }, [isPreloaderFinished]);

  const handleScroll = () => {
    if (onExploreCatalog) {
      onExploreCatalog();
    } else {
      document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={containerRef}
      className="relative w-full h-screen min-h-[680px] bg-[#FAF7EE] flex flex-col justify-between items-center overflow-hidden pt-20 pb-16 select-none"
    >
      {/* Top Left Line Art Doodle */}
      <div className="absolute top-10 left-8 pointer-events-none opacity-30 w-24 sm:w-36 z-0">
        <svg viewBox="0 0 100 80" fill="none" stroke="#D5C582" strokeWidth="2.5" strokeLinecap="round">
          <path d="M10 40 C 35 10, 65 70, 85 40 C 65 10, 35 70, 10 40 Z" />
          <path d="M85 40 L 95 30 M 85 40 L 95 50" />
          <path d="M5 25 C 0 20, 0 15, 5 10" />
          <path d="M12 20 C 8 16, 8 12, 12 8" />
        </svg>
      </div>

      {/* Bottom Right Line Art Doodle */}
      <div className="absolute bottom-24 right-8 pointer-events-none opacity-30 w-28 sm:w-40 z-0">
        <svg viewBox="0 0 100 80" fill="none" stroke="#D5C582" strokeWidth="2.5" strokeLinecap="round">
          <path d="M10 40 C 35 10, 65 70, 85 40 C 65 10, 35 70, 10 40 Z" />
          <path d="M85 40 L 95 30 M 85 40 L 95 50" />
          <path d="M5 25 C 0 20, 0 15, 5 10" />
          <path d="M12 20 C 8 16, 8 12, 12 8" />
        </svg>
      </div>

      {/* Vertically Centered Content Container */}
      <div className="relative z-10 max-w-[1600px] w-full px-4 flex flex-col items-center text-center my-auto">
        
        {/* 1. TOP HEADLINE */}
        <div ref={topTextRef} className="z-10 opacity-0">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[88px] font-black tracking-tight text-[#1D184D] uppercase font-['Sora',sans-serif] leading-[0.9] max-w-5xl mx-auto">
            WHERE EVERY <br /> CATCH BEGINS
          </h1>
        </div>

        {/* 2. OVERLAPPING FISH IMAGE (SCALED UP) */}
        <div
          ref={fishRef}
          className="w-full max-w-[880px] sm:max-w-[1100px] md:max-w-[1280px] lg:max-w-[1400px] -mt-12 sm:-mt-22 md:-mt-28 lg:-mt-32 z-20 pointer-events-none opacity-0"
        >
          <img
            src="/images/hero/hero-fish.png"
            alt="Matsya Fish"
            className="w-full h-auto object-contain drop-shadow-[0_20px_25px_rgba(29,24,77,0.2)] scale-105 sm:scale-110"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=1000&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        {/* 3. MARATHI SUBTEXT & BUTTON */}
        <div
          ref={bottomContentRef}
          className="flex flex-col items-center gap-4 sm:gap-5 -mt-8 sm:-mt-12 md:-mt-16 z-30 opacity-0"
        >
          <p className="text-xl sm:text-2xl md:text-[28px] font-medium text-[#1D184D] leading-tight tracking-wide font-['Sora',sans-serif]">
            प्रत्येक <span className="font-bold text-[#1D184D]">MATSYA</span> मागे,<br />
            समुद्राची एक गोष्ट.
          </p>

          <button
            type="button"
            onClick={handleScroll}
            className="mt-1 sm:mt-2 px-8 py-3.5 bg-[#1D184D] hover:bg-[#15113A] text-[#D5C582] text-xs sm:text-sm font-bold tracking-[0.2em] uppercase rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform active:scale-95 cursor-pointer border border-[#D5C582]/30 hover:border-[#D5C582]"
          >
            ORDER FRESH CATCH
          </button>
        </div>

      </div>

      {/* Bottom Wave Divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none z-10 translate-y-[1px]">
        <svg
          className="relative block w-full h-12 sm:h-18 md:h-22 text-[#1D184D]"
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