import React, { useEffect, useState, useRef } from 'react';
import Lenis from 'lenis';

import LogoPreloader from './components/common/LogoPreloader';
import Navbar from './components/common/Navbar';
import Hero from './components/home/HeroCarousel';
import FeaturedSpotlights from './components/home/FeaturedSpotlights';
import ProductGrid from './components/catalog/ProductGrid';
import WhyMatsya from './components/home/WhyMatsya';
import TeamStorySection from './components/home/TeamStorySection';
import CartDrawer from './components/checkout/CartDrawer';
import CheckoutPage from './components/checkout/CheckoutPage';
import OrderTrackingPage from './components/tracking/OrderTrackingPage';
import ProductDetailsPage from './components/product/ProductDetailsPage';
import Toast from './components/common/Toast';
import LocationModal from './components/common/LocationModal';
import Footer from './components/common/Footer';
import { useCartStore } from './store/useCartStore';
import AdminDashboard from './components/admin/AdminDashboard';
import LegalPolicyPage from './components/legal/LegalPolicyPage';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Default strictly to Home Catalog view on initial load / reload
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [legalPolicy, setLegalPolicy] = useState(null);

  const isCheckoutOpen = useCartStore((state) => state.isCheckoutOpen);
  const closeCheckout = useCartStore((state) => state.closeCheckout);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const lenisRef = useRef(null);

  const savedScrollRef = useRef(0);
  const returnToTopRef = useRef(false);
  const prevCheckoutOpenRef = useRef(isCheckoutOpen);

  const handleOpenAdmin = () => {
    setIsAdminOpen(true);
    setIsTrackOpen(false);
    setLegalPolicy(null);
    closeCheckout();
    if (window.location.hash !== '#admin') {
      window.location.hash = 'admin';
    }
  };

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash === '#admin') {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
  };

  // Reset to Home Catalog & clear URL hashes whenever the page reloads or mounts freshly
  useEffect(() => {
    if (window.location.hash || window.history.state) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
    closeCheckout();
    setIsAdminOpen(false);
    setIsTrackOpen(false);
    setLegalPolicy(null);
    setSelectedProduct(null);
  }, [closeCheckout]);

  // Active Session Hash Listener (#admin, #track, #privacy-policy, etc.) & Shortcut Key (Ctrl+Shift+A)
  useEffect(() => {
    const syncHashState = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setIsAdminOpen(true);
        setIsTrackOpen(false);
        setLegalPolicy(null);
        closeCheckout();
      } else if (hash === '#track') {
        setIsTrackOpen(true);
        setIsAdminOpen(false);
        setLegalPolicy(null);
        closeCheckout();
      } else if (['#privacy-policy', '#terms', '#refund-policy', '#shipping-policy'].includes(hash)) {
        setLegalPolicy(hash.replace('#', ''));
        setIsAdminOpen(false);
        setIsTrackOpen(false);
        closeCheckout();
      } else if (!hash) {
        setIsAdminOpen(false);
        setIsTrackOpen(false);
        setLegalPolicy(null);
      }
    };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (window.location.hash === '#admin' || isAdminOpen) {
          handleCloseAdmin();
        } else {
          handleOpenAdmin();
        }
      }
    };

    window.addEventListener('hashchange', syncHashState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', syncHashState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeCheckout, isAdminOpen]);

  // Sync Checkout view with Browser History API
  useEffect(() => {
    if (isCheckoutOpen && !prevCheckoutOpenRef.current) {
      if (window.history.state?.view !== 'checkout') {
        window.history.pushState(
          { view: 'checkout', product: selectedProduct },
          ''
        );
      }
    }
    prevCheckoutOpenRef.current = isCheckoutOpen;
  }, [isCheckoutOpen, selectedProduct]);

  // Smooth scrolling (Lenis) setup
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

      if (state?.view === 'checkout') {
        useCartStore.getState().openCheckout();
        setIsTrackOpen(false);
        setIsAdminOpen(false);
        setLegalPolicy(null);
      } else if (state?.view === 'track' || window.location.hash === '#track') {
        setIsTrackOpen(true);
        setIsAdminOpen(false);
        setLegalPolicy(null);
        useCartStore.getState().closeCheckout();
      } else if (state?.view === 'admin' || window.location.hash === '#admin') {
        setIsAdminOpen(true);
        setIsTrackOpen(false);
        setLegalPolicy(null);
        useCartStore.getState().closeCheckout();
      } else if (['#privacy-policy', '#terms', '#refund-policy', '#shipping-policy'].includes(window.location.hash)) {
        setLegalPolicy(window.location.hash.replace('#', ''));
        setIsAdminOpen(false);
        setIsTrackOpen(false);
        useCartStore.getState().closeCheckout();
      } else {
        useCartStore.getState().closeCheckout();
        if (window.location.hash) {
          window.history.replaceState(
            null,
            '',
            window.location.pathname + window.location.search
          );
          setIsAdminOpen(false);
          setIsTrackOpen(false);
          setLegalPolicy(null);
        }
      }

      setSelectedProduct(state?.product ?? null);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Scroll Management
  useEffect(() => {
    const lenis = lenisRef.current;

    if (isCheckoutOpen || isTrackOpen || isAdminOpen || legalPolicy || selectedProduct) {
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
  }, [selectedProduct, isCheckoutOpen, isTrackOpen, isAdminOpen, legalPolicy]);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
    if (lenisRef.current) {
      lenisRef.current.start();
    }
  };

  const handleOpenTrackPage = () => {
    if (!isTrackOpen) {
      window.location.hash = 'track';
    }
  };

  const handleCloseTrackPage = () => {
    setIsTrackOpen(false);
    if (window.location.hash === '#track') {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
  };

  const handleSelectProduct = (productData) => {
    if (!selectedProduct) {
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
    if (isTrackOpen) {
      handleCloseTrackPage();
    }
    if (isAdminOpen) {
      handleCloseAdmin();
    }
    if (legalPolicy) {
      setLegalPolicy(null);
      if (['#privacy-policy', '#terms', '#refund-policy', '#shipping-policy'].includes(window.location.hash)) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
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

      <Navbar onLogoClick={handleLogoClick} onOpenTrack={handleOpenTrackPage} />
      <LocationModal />

      <main className="relative w-full min-h-screen">
        {isAdminOpen ? (
          <AdminDashboard key="admin-session" onBackToCatalog={handleCloseAdmin} />
        ) : isTrackOpen ? (
          <OrderTrackingPage onBackToCatalog={handleCloseTrackPage} />
        ) : legalPolicy ? (
          <LegalPolicyPage
            policyType={legalPolicy}
            onBackToCatalog={() => {
              setLegalPolicy(null);
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }}
          />
        ) : isCheckoutOpen ? (
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

      <Footer onLogoClick={handleLogoClick} onOpenTrack={handleOpenTrackPage} />
      <CartDrawer />
      <Toast />
    </div>
  );
}