import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

const FEATURED_ITEMS = [
  {
    id: 'pomfret',
    name: 'Silver Pomfret (Paplet)',
    image: '/images/products/silver-pomfrets-card.jpg',
  },
  {
    id: 'surmai',
    name: 'King Fish (Surmai)',
    image: '/images/products/surmai-card.jpg',
  },
  {
    id: 'prawns',
    name: 'Tiger Prawns (Kolambi)',
    image: '/images/products/tiger-prawns-card.jpg',
  },
  {
    id: 'bombil',
    name: 'Bombay Duck (Bombil)',
    image: '/images/products/bombil-card.jpg',
  },
  {
    id: 'squid',
    name: 'Squid (Makul)',
    image: '/images/products/squid-card.jpg',
  },
];

const GUTTER_STYLE = {
  paddingLeft: 'clamp(24px, 4vw, 52px)',
  paddingRight: 'clamp(24px, 4vw, 52px)',
};

export default function FeaturedSpotlights({ onSelectProduct }) {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const cardsRef = useRef([]);
  const sliderRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Viewport Reveal Animation (IntersectionObserver + GSAP)
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const validCards = cardsRef.current.filter(Boolean);

    // Initial hidden state
    gsap.set(headlineRef.current, { opacity: 0, y: 30 });
    if (validCards.length > 0) {
      gsap.set(validCards, { opacity: 0, y: 45 });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const tl = gsap.timeline();

            // 1. Animate Headline
            tl.to(headlineRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out',
            });

            // 2. Animate Staggered Cards
            if (validCards.length > 0) {
              tl.to(
                validCards,
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.85,
                  stagger: 0.1,
                  ease: 'power3.out',
                },
                '-=0.5' // overlap smoothly with headline
              );
            }

            // Disconnect once triggered
            observer.unobserve(entry.target);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 25);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 25);
    }
  };

  const handleScroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.75;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      id="featured-products"
      ref={sectionRef}
      className="relative w-full bg-[#FAF7EE] overflow-hidden select-none pb-24"
    >
      {/* 1. Divider Bar */}
      <div className="w-full bg-[#1D184D] border-y border-[#2B2568] py-3.5 px-4 sm:px-8">
        <div className="max-w-[1560px] mx-auto flex items-center justify-between text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#D5C582] font-['Sora',sans-serif]">
          <span>Dock-to-Door Mumbai</span>
          <span className="hidden md:inline text-white/40">•</span>
          <span className="hidden md:inline">100% Edible Net Weight</span>
          <span className="hidden sm:inline text-white/40">•</span>
          <span>Daily Coastal Landing</span>
        </div>
      </div>

      {/* 2. Headline */}
      <div
        ref={headlineRef}
        style={GUTTER_STYLE}
        className="pt-14 sm:pt-18 mb-8 w-full"
      >
        <span className="text-[11px] font-bold tracking-[0.28em] uppercase text-[#C2542D] block mb-2 font-['Sora',sans-serif]">
          Daily Selection
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-[44px] font-bold tracking-tight text-[#1D184D] leading-tight font-['Sora',sans-serif]">
          Signature Catches.{' '}
          <span className="text-[#1D184D]/50 font-normal block sm:inline sm:ml-2">
            Take a look at today's catch.
          </span>
        </h2>
      </div>

      {/* 3. Smooth Track Container */}
      <div className="relative w-full">
        {canScrollLeft && (
          <button
            onClick={() => handleScroll('left')}
            aria-label="Previous catches"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/95 text-[#1D184D] border border-[#1D184D]/10 shadow-lg flex items-center justify-center transition-transform duration-150 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Horizontal Track */}
        <div
          ref={sliderRef}
          onScroll={checkScroll}
          style={GUTTER_STYLE}
          className="flex gap-7 overflow-x-auto overflow-y-hidden py-4 no-scrollbar touch-pan-x"
        >
          {FEATURED_ITEMS.map((item, index) => (
            <div
              key={item.id}
              ref={(el) => (cardsRef.current[index] = el)}
              className="w-[330px] sm:w-[420px] md:w-[480px] lg:w-[520px] shrink-0"
            >
              <div
                onClick={() => onSelectProduct && onSelectProduct(item.name)}
                className="rounded-[32px] overflow-hidden bg-[#16123D] border border-[#1D184D]/10 transition-transform duration-200 hover:-translate-y-1 cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  decoding="async"
                  className="w-full h-auto block select-none pointer-events-none"
                />
              </div>
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => handleScroll('right')}
            aria-label="Next catches"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/95 text-[#1D184D] border border-[#1D184D]/10 shadow-lg flex items-center justify-center transition-transform duration-150 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}
      </div>
    </section>
  );
}