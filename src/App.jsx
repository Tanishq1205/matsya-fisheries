import React, { useEffect, useState, useRef } from 'react';
import Lenis from 'lenis';

import LogoPreloader from './components/common/LogoPreloader';
import Navbar from './components/common/Navbar';
import Hero from './components/home/HeroBanner';
import FeaturedSpotlights from './components/home/FeaturedSpotlights';
import ProductGrid from './components/catalog/ProductGrid';
import WhyMatsya from './components/home/WhyMatsya';
import TeamStorySection from './components/home/TeamStorySection';
import CartDrawer from './components/checkout/CartDrawer';
import ProductDetailsPage from './components/product/ProductDetailsPage';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  // Restore the open product if the page is reloaded while on a product entry
  const [selectedProduct, setSelectedProduct] = useState(
    () => window.history.state?.product ?? null
  );
  const lenisRef = useRef(null);

  // Where the user was on the home page before opening a product
  const savedScrollRef = useRef(0);
  // When true, the next return to the home page goes to the very top (logo click)
  const returnToTopRef = useRef(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      anchors: true, // lets #story, #bulk, #collaborations links work with Lenis
    });

    lenisRef.current = lenis;
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

  // Browser back / forward buttons
  useEffect(() => {
    const onPopState = (e) => {
      const product = e.state?.product ?? null;
      if (product) savedScrollRef.current = window.scrollY; // going forward into a product
      setSelectedProduct(product);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Scroll handling when switching between the home page and a product page
  useEffect(() => {
    const lenis = lenisRef.current;

    if (selectedProduct) {
      // Opening a product: start at the top of the product page
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      if (lenis) lenis.scrollTo(0, { immediate: true });
      const t = setTimeout(() => lenis?.resize(), 50);
      return () => clearTimeout(t);
    }

    // Back on the home page: restore the spot the user left (the product grid),
    // or go to the top if they clicked the logo.
    const target = returnToTopRef.current ? 0 : savedScrollRef.current;
    returnToTopRef.current = false;

    const t = setTimeout(() => {
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(target, { immediate: true });
      } else {
        window.scrollTo(0, target);
      }
    }, 50);

    return () => clearTimeout(t);
  }, [selectedProduct]);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
    if (lenisRef.current) {
      lenisRef.current.start();
    }
  };

  const handleSelectProduct = (productData) => {
    savedScrollRef.current = window.scrollY;
    // Add a history entry so the browser back button returns to the catalog
    window.history.pushState({ view: 'product', product: productData }, '');
    setSelectedProduct(productData);
  };

  // Close the product page, keeping browser history in sync
  const closeProduct = () => {
    if (window.history.state?.view === 'product') {
      window.history.back(); // popstate handler clears selectedProduct
    } else {
      setSelectedProduct(null);
    }
  };

  const handleBackToCatalog = () => {
    closeProduct();
  };

  // Logo / brand name click: close product page if open, otherwise scroll to top via Lenis
  const handleLogoClick = () => {
    if (selectedProduct) {
      returnToTopRef.current = true;
      closeProduct();
      return;
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF7EE] text-[#1D184D]">
      {isLoading && <LogoPreloader onComplete={handlePreloaderComplete} />}

      <Navbar onLogoClick={handleLogoClick} />

      <main className="relative w-full min-h-screen">
        {selectedProduct ? (
          <ProductDetailsPage
            key={selectedProduct.id || selectedProduct.name}
            product={selectedProduct}
            onBack={handleBackToCatalog}
          />
        ) : (
          <div className="w-full flex flex-col">
            <Hero isPreloaderFinished={!isLoading} />
            <FeaturedSpotlights onSelectProduct={handleSelectProduct} />
            <ProductGrid onSelectProduct={handleSelectProduct} />
            <WhyMatsya />
            <TeamStorySection />
          </div>
        )}
      </main>

      <CartDrawer />
    </div>
  );
}