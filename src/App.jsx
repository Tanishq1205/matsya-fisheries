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
import CheckoutPage from './components/checkout/CheckoutPage';
import ProductDetailsPage from './components/product/ProductDetailsPage';
import Toast from './components/common/Toast';
import LocationModal from './components/common/LocationModal';
import Footer from './components/common/Footer';
import { useCartStore } from './store/useCartStore';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const isCheckoutOpen = useCartStore((state) => state.isCheckoutOpen);
  const closeCheckout = useCartStore((state) => state.closeCheckout);
  
  // Always start at home catalog on page refresh
  const [selectedProduct, setSelectedProduct] = useState(null);
  const lenisRef = useRef(null);

  // Remembers scroll position on home catalog
  const savedScrollRef = useRef(0);
  const returnToTopRef = useRef(false);
  const prevCheckoutOpenRef = useRef(isCheckoutOpen);

  // Clear lingering history state & ensure checkout is closed on initial page refresh
  useEffect(() => {
    if (window.history.state?.view) {
      window.history.replaceState(null, '');
    }
    closeCheckout();
  }, [closeCheckout]);

  // Sync Checkout view with Browser History API
  useEffect(() => {
    if (isCheckoutOpen && !prevCheckoutOpenRef.current) {
      // Checkout opened -> push history entry so Chrome Back button works
      if (window.history.state?.view !== 'checkout') {
        window.history.pushState(
          { view: 'checkout', product: selectedProduct },
          ''
        );
      }
    }
    prevCheckoutOpenRef.current = isCheckoutOpen;
  }, [isCheckoutOpen, selectedProduct]);

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

  // Handle Chrome Back / Forward buttons (popstate)
  useEffect(() => {
    const onPopState = (e) => {
      const state = e.state;

      // Close or open checkout based on browser history state
      if (state?.view === 'checkout') {
        useCartStore.getState().openCheckout();
      } else {
        useCartStore.getState().closeCheckout();
      }

      const product = state?.product ?? null;
      setSelectedProduct(product);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Scroll Management
  useEffect(() => {
    const lenis = lenisRef.current;

    if (isCheckoutOpen || selectedProduct) {
      // Reset scroll position to top for Product Details or Checkout
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      if (lenis) {
        lenis.stop();
        lenis.scrollTo(0, { immediate: true });
        lenis.start();
        lenis.resize();
      }
    } else {
      // Returning to Home: restore exact saved scroll position
      const targetScroll = returnToTopRef.current ? 0 : savedScrollRef.current;
      returnToTopRef.current = false;

      const timer = setTimeout(() => {
        if (lenis) {
          lenis.resize();
          lenis.scrollTo(targetScroll, { immediate: true });
        } else {
          window.scrollTo(0, targetScroll);
        }
      }, 30);

      return () => clearTimeout(timer);
    }
  }, [selectedProduct, isCheckoutOpen]);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
    if (lenisRef.current) {
      lenisRef.current.start();
    }
  };

  const handleSelectProduct = (productData) => {
    if (!selectedProduct) {
      // Record exact scroll Y position before leaving home
      const currentY = lenisRef.current?.scroll ?? window.scrollY ?? 0;
      savedScrollRef.current = currentY;
      window.history.pushState({ view: 'product', product: productData }, '');
    } else {
      window.history.replaceState({ view: 'product', product: productData }, '');
    }
    setSelectedProduct(productData);
  };

  const closeProduct = () => {
    setSelectedProduct(null);
    if (window.history.state?.view === 'product') {
      window.history.replaceState(null, '');
    }
  };

  const handleBackToCatalog = () => {
    closeProduct();
  };

  const handleLogoClick = () => {
    if (isCheckoutOpen) {
      closeCheckout();
    }
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
        {isCheckoutOpen ? (
          <CheckoutPage onBackToCatalog={() => setSelectedProduct(null)} />
        ) : (
          <>
            {/* Main Home Page Container */}
            <div className={selectedProduct ? 'hidden' : 'w-full flex flex-col'}>
              <Hero isPreloaderFinished={!isLoading} />
              <FeaturedSpotlights onSelectProduct={handleSelectProduct} />
              <ProductGrid onSelectProduct={handleSelectProduct} />
              <WhyMatsya />
              <TeamStorySection />
            </div>

            {/* Product Details View */}
            {selectedProduct && (
              <ProductDetailsPage
                key={selectedProduct.id || selectedProduct.name}
                product={selectedProduct}
                onBack={handleBackToCatalog}
                onSelectProduct={handleSelectProduct}
              />
            )}
          </>
        )}
      </main>

      <Footer />
      <CartDrawer />
      <Toast />
    </div>
  );
}