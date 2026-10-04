import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore'; // 1. Added Zustand Import

export default function Navbar({
  cartCount: propCartCount,
  onOpenCart,
  logoSrc = '/images/matsya-logo-navbar.png',
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 2. Connect to Zustand Store
  const { toggleCart, getItemCount } = useCartStore();
  const cartCount = propCartCount && propCartCount > 0 ? propCartCount : getItemCount();
  const handleCartClick = onOpenCart && !onOpenCart.toString().includes('console.log') 
    ? onOpenCart 
    : toggleCart;

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const pastThreshold = window.scrollY > 40;
          setIsScrolled((prev) => (prev !== pastThreshold ? pastThreshold : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Collaborations', href: '#collaborations' },
    { label: 'Our Story', href: '#story' },
    { label: 'Contact for Bulk', href: '#bulk' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none pt-3 sm:pt-4 px-4 sm:px-6">
        <nav className="relative pointer-events-auto w-full max-w-5xl flex items-center justify-between py-2.5 px-6 sm:px-8">
          {/* Floating Pill Background */}
          <div
            className={`absolute inset-0 rounded-full border transition-all duration-300 ease-out pointer-events-none ${
              isScrolled
                ? 'opacity-100 scale-100 bg-[#1D184D] border-[#D5C582]/25 shadow-[0_12px_32px_rgba(23,22,79,0.35)]'
                : 'opacity-0 scale-95 bg-transparent border-transparent'
            }`}
          />

          {/* 1. Brand Mark */}
          <a
            href="#top"
            className="relative z-10 flex items-center gap-3 transition-transform duration-200 active:scale-95"
          >
            <img
              src={logoSrc}
              alt="Matsya Fish Mark"
              className="h-6 sm:h-7 w-auto object-contain select-none"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/matsya-logo.png';
              }}
            />
            <span
              style={{ fontFamily: "'Sora', sans-serif" }}
              className={`font-medium text-[17px] sm:text-[19px] tracking-[0.22em] uppercase transition-colors duration-200 select-none ${
                isScrolled ? 'text-[#FAF7EE]' : 'text-[#1D184D]'
              }`}
            >
              MATSYA
            </span>
          </a>

          {/* 2. Navigation Links */}
          <div className="relative z-10 hidden md:flex items-center gap-8 lg:gap-11 text-[12px] font-semibold tracking-[0.16em] uppercase">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`relative py-1 transition-colors duration-200 ${
                  isScrolled
                    ? 'text-[#FAF7EE]/70 hover:text-[#D5C582]'
                    : 'text-[#1D184D]/70 hover:text-[#1D184D]'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* 3. Cart Trigger & Mobile Menu */}
          <div className="relative z-10 flex items-center gap-3">
            <button
              onClick={handleCartClick} // 3. Updated click handler
              aria-label="View Shopping Cart"
              className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border transition-all duration-200 active:scale-95 cursor-pointer ${
                isScrolled
                  ? 'border-[#D5C582]/30 bg-white/10 text-[#FAF7EE] hover:bg-white/15'
                  : 'border-[#1D184D]/15 bg-[#1D184D]/5 text-[#1D184D] hover:bg-[#1D184D]/10'
              }`}
            >
              <ShoppingBag className="w-4 h-4 stroke-[2]" />
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.14em] uppercase">
                Cart
              </span>
              {cartCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#D5C582] text-[#1D184D] font-bold text-[10px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
              className={`md:hidden p-2 rounded-full transition-colors ${
                isScrolled ? 'text-[#FAF7EE]' : 'text-[#1D184D]'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#1D184D]/95 backdrop-blur-md flex flex-col justify-center items-center gap-8 text-[#FAF7EE] select-none">
          <nav className="flex flex-col items-center gap-7 text-lg tracking-[0.18em] uppercase font-semibold">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#D5C582] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}