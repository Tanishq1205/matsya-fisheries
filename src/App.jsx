import React, { useEffect, useState, useRef } from 'react';
import Lenis from 'lenis';

import LogoPreloader from './components/common/LogoPreloader';
import Navbar from './components/common/Navbar';
import Hero from './components/home/HeroBanner';
import FeaturedSpotlights from './components/home/FeaturedSpotlights';
import ProductGrid from './components/catalog/ProductGrid';


export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    // Start with Lenis paused so user cannot scroll during the preloader
    lenis.stop();

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
    // Enable smooth scroll only after preloader exits
    if (lenisRef.current) {
      lenisRef.current.start();
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF7EE] text-[#1D184D">
      {isLoading && <LogoPreloader onComplete={handlePreloaderComplete} />}

      <Navbar cartCount={0} onOpenCart={() => console.log('Cart')} />

      <main id="top" className="relative w-full">
        <Hero />
        <FeaturedSpotlights />
        <ProductGrid />
      </main>
    </div>
  );
}