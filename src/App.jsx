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
import Toast from './components/common/Toast';
import LocationModal from './components/common/LocationModal';
import Footer from './components/common/Footer';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  // Restore open product on page reload
  const [selectedProduct, setSelectedProduct] = useState(
    () => window.history.state?.product ?? null
  );
  const lenisRef = useRef(null);

  // Where the user was on the home page before opening a product
  const savedScrollRef = useRef(0);
  const returnToTopRef = useRef(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      anchors: true,
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

  // Browser back / forward button handling
  useEffect(() => {
    const onPopState = (e) => {
      const product = e.state?.product ?? null;
      if (product) savedScrollRef.current = window.scrollY;
      setSelectedProduct(product);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Reset scroll whenever selectedProduct opens or swaps
  useEffect(() => {
    const lenis = lenisRef.current;

    if (selectedProduct) {
      const forceScrollToTop = () => {
        // Reset browser scroll
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Reset Lenis smooth scroll engine & kill active momentum
        if (lenis) {
          lenis.stop();
          lenis.scrollTo(0, { immediate: true });
          lenis.start();
          lenis.resize();
        }
      };

      // Run immediately
      forceScrollToTop();

      // Run in RAF and brief timeout to handle React DOM re-renders & image shifts
      const rafId = requestAnimationFrame(() => {
        forceScrollToTop();
        setTimeout(forceScrollToTop, 60);
      });

      return () => cancelAnimationFrame(rafId);
    }

    // Back on home page: restore catalog scroll position or scroll to top
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
  }, [selectedProduct?.id, selectedProduct?.name, selectedProduct]);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
    if (lenisRef.current) {
      lenisRef.current.start();
    }
  };

  const handleSelectProduct = (productData) => {
    if (selectedProduct) {
      // Already on a product page: replace state in place
      window.history.replaceState({ view: 'product', product: productData }, '');
    } else {
      savedScrollRef.current = window.scrollY;
      window.history.pushState({ view: 'product', product: productData }, '');
    }
    setSelectedProduct(productData);
  };

  const closeProduct = () => {
    if (window.history.state?.view === 'product') {
      window.history.back();
    } else {
      setSelectedProduct(null);
    }
  };

  const handleBackToCatalog = () => {
    closeProduct();
  };

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
      <LocationModal />

      <main className="relative w-full min-h-screen">
        {selectedProduct ? (
          <ProductDetailsPage
            key={selectedProduct.id || selectedProduct.name}
            product={selectedProduct}
            onBack={handleBackToCatalog}
            onSelectProduct={handleSelectProduct}
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
      <Footer />
      <CartDrawer />
      <Toast />
    </div>
  );
}