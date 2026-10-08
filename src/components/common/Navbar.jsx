import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Menu, X, MapPin, ChevronDown, Search, Check, AlertCircle, Loader2, Navigation } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useLocationStore } from '../../store/useLocationStore';
import { supabase } from '../../lib/supabaseClient';

const MATSYA_WHATSAPP_NUMBER = '919372379317';
const BULK_INQUIRY_TEXT = encodeURIComponent(
  'Hello Matsya Fisheries, I would like to inquire about bulk / wholesale seafood supply for my business.'
);
const WHATSAPP_BULK_URL = `https://wa.me/${MATSYA_WHATSAPP_NUMBER}?text=${BULK_INQUIRY_TEXT}`;

export default function Navbar({
  cartCount: propCartCount,
  onOpenCart,
  onLogoClick,
  logoSrc = '/images/matsya-logo-navbar.png',
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dropdown & Location Check State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pincodeInput, setPincodeInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const dropdownRef = useRef(null);

  // Stores
  const { toggleCart, getItemCount } = useCartStore();
  const { location, setLocation } = useLocationStore();

  const cartCount = propCartCount && propCartCount > 0 ? propCartCount : getItemCount();
  const handleCartClick = onOpenCart && !onOpenCart.toString().includes('console.log')
    ? onOpenCart
    : toggleCart;

  const handleLogoClick = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (onLogoClick) {
      onLogoClick();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Check Pincode directly in Supabase `serviceable_pincodes` table
  // Check Pincode directly in Supabase `serviceable_pincodes` table
const verifyPincode = async (inputPin) => {
  // Fallback to pincodeInput state if inputPin is missing or event-based
  const rawPin = typeof inputPin === 'string' && inputPin.length > 0 ? inputPin : pincodeInput;
  const cleanPin = String(rawPin || '').replace(/\D/g, '').trim();

  if (!cleanPin || cleanPin.length !== 6) {
    setStatus({ type: 'error', message: 'Enter a valid 6-digit pincode' });
    return;
  }

  setIsChecking(true);
  setStatus(null);

  try {
    const { data, error } = await supabase
      .from('serviceable_pincodes')
      .select('pincode, area, zone_id, status')
      .eq('pincode', cleanPin)
      .maybeSingle();

    if (error) throw error;

    if (data && data.status && data.status.toLowerCase().includes('available')) {
      const areaName = data.area || 'Mumbai';
      setLocation({
        area: areaName,
        pincode: data.pincode,
        zoneId: data.zone_id,
      });

      setStatus({ type: 'success', message: `⚡ Delivery available for ${areaName} (${data.pincode})` });

      setTimeout(() => {
        setIsDropdownOpen(false);
        setStatus(null);
        setPincodeInput('');
      }, 900);
    } else {
      setStatus({
        type: 'error',
        message: `Delivery currently unavailable for ${cleanPin}`,
      });
    }
  } catch (err) {
    console.error('Pincode check error:', err);
    setStatus({ type: 'error', message: 'Error checking pincode. Try again.' });
  } finally {
    setIsChecking(false);
  }
};

  // Browser GPS detection
  const handleGpsLocation = () => {
    if (!navigator.geolocation) {
      setStatus({ type: 'error', message: 'GPS not supported by browser' });
      return;
    }

    setIsDetectingGps(true);
    setStatus(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetectingGps(false);
        const activePin = location?.pincode || '400089';
        const activeArea = location?.area || 'Tilak Nagar';
        setLocation({ area: activeArea, pincode: activePin });
        setStatus({ type: 'success', message: '⚡ Location updated!' });

        setTimeout(() => {
          setIsDropdownOpen(false);
          setStatus(null);
        }, 800);
      },
      () => {
        setIsDetectingGps(false);
        setStatus({ type: 'error', message: 'GPS access denied. Enter pincode manually.' });
      },
      { timeout: 8000 }
    );
  };

  const navLinks = [
    { label: 'Catches', href: '#all-products', isExternal: false },
    { label: 'Our Story', href: '#story', isExternal: false },
    { label: 'Contact for Bulk', href: WHATSAPP_BULK_URL, isExternal: true },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 flex justify-center pointer-events-none pt-3 sm:pt-4 px-4 sm:px-6 select-none font-['Sora',sans-serif]">
        <nav className="relative pointer-events-auto w-full max-w-6xl flex items-center justify-between py-2.5 px-4 sm:px-8">
          {/* Floating Pill Background */}
          <div
            className={`absolute inset-0 rounded-full border transition-all duration-300 ease-out pointer-events-none ${
              isScrolled
                ? 'opacity-100 scale-100 bg-[#1D184D] border-[#D5C582]/25 shadow-[0_12px_32px_rgba(23,22,79,0.35)]'
                : 'opacity-0 scale-95 bg-transparent border-transparent'
            }`}
          />

          {/* Left Side: Brand Logo + Location Pill */}
          <div className="relative z-10 flex items-center gap-3 sm:gap-5" ref={dropdownRef}>
            <a
              href="/"
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 transition-transform duration-200 active:scale-95"
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
                className={`font-medium text-[16px] sm:text-[19px] tracking-[0.2em] uppercase transition-colors duration-200 select-none ${
                  isScrolled ? 'text-[#FAF7EE]' : 'text-[#1D184D]'
                }`}
              >
                MATSYA
              </span>
            </a>

            {/* 📍 Location Selector Pill & Floating Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-1.5 py-1 px-2.5 sm:px-3 rounded-full border transition-all duration-200 cursor-pointer active:scale-95 max-w-[140px] sm:max-w-[200px] ${
                  isScrolled
                    ? 'border-[#D5C582]/30 bg-white/10 text-[#FAF7EE] hover:border-[#D5C582]'
                    : 'border-[#1D184D]/15 bg-[#1D184D]/5 text-[#1D184D] hover:bg-[#1D184D]/10'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#C2542D] shrink-0" />
                <div className="flex flex-col text-left truncate">
                  <span className="text-[10px] sm:text-[11px] font-bold truncate leading-tight">
                    {location?.pincode
                      ? location.area
                        ? `${location.area} • ${location.pincode}`
                        : location.pincode
                      : 'Add Pincode'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
              </button>

              {/* 🔽 COMPACT LOCATION DROPDOWN BOX */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-[#16123D] border-2 border-[#D5C582] rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.6)] z-50 text-[#FAF7EE] animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#D5C582]">
                      Check Delivery Pincode
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(false)}
                      className="text-white/50 hover:text-white p-0.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Pincode Search Form */}
                  {/* Pincode Search Form */}
<form
  onSubmit={(e) => {
    e.preventDefault();
    verifyPincode(pincodeInput);
  }}
  className="mt-3 space-y-2"
>
  <div className="flex items-center gap-2">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
      <input
        type="text"
        maxLength={6}
        value={pincodeInput}
        onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
        onInput={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
        placeholder="Enter 6-digit Pincode"
        className="w-full pl-8 pr-2 py-2 bg-[#100D2D] border border-white/10 rounded-xl text-xs text-[#FAF7EE] placeholder-white/40 focus:outline-none focus:border-[#D5C582] font-bold tracking-wider"
      />
    </div>
    <button
      type="submit"
      disabled={isChecking || pincodeInput.replace(/\D/g, '').length !== 6}
      className="px-3.5 py-2 rounded-xl bg-[#D5C582] hover:bg-[#c5b572] disabled:opacity-40 text-[#1D184D] font-extrabold text-[11px] uppercase tracking-wider shrink-0 cursor-pointer transition-colors"
    >
      {isChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Check'}
    </button>
  </div>
</form>

                  {/* GPS Location Button */}
                  <button
                    type="button"
                    onClick={handleGpsLocation}
                    disabled={isDetectingGps}
                    className="w-full mt-2.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-[11px] font-bold text-[#D5C582] cursor-pointer transition-colors"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                    <span>{isDetectingGps ? 'Detecting...' : 'Detect My Location'}</span>
                  </button>

                  {/* Dynamic Database Feedback */}
                  {status && (
                    <div
                      className={`mt-2.5 p-2 rounded-xl text-[11px] font-semibold flex items-center gap-2 animate-in fade-in ${
                        status.type === 'success'
                          ? 'bg-[#6EE7A8]/10 text-[#6EE7A8]'
                          : 'bg-red-500/10 text-red-300'
                      }`}
                    >
                      {status.type === 'success' ? (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{status.message}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="relative z-10 hidden md:flex items-center gap-6 lg:gap-8 text-[12px] font-semibold tracking-[0.16em] uppercase">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.isExternal ? '_blank' : undefined}
                rel={link.isExternal ? 'noopener noreferrer' : undefined}
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

          {/* Cart Trigger & Mobile Menu Toggle */}
          <div className="relative z-10 flex items-center gap-3">
            <button
              onClick={handleCartClick}
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
                target={link.isExternal ? '_blank' : undefined}
                rel={link.isExternal ? 'noopener noreferrer' : undefined}
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