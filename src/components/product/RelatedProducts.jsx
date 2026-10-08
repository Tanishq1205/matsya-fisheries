import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Truck } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import {
  PRODUCTS,
  PRODUCT_SPECIFIC_DATA,
  formatForDetailsPage,
} from '../catalog/ProductGrid';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=500&auto=format&fit=crop&q=60';

const CARD_W = 214;
const GAP = 20;

export default function RelatedProducts({ currentProduct, onSelectProduct }) {
  const rowRef = useRef(null);
  const addItem = useCartStore((s) => s.addItem);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  // Extract raw ID (removes 'matsya-' prefix if present)
  const rawCurrentId = currentProduct?.id
    ? String(currentProduct.id).replace('matsya-', '')
    : '';

  // Exclude currently viewed product from related items rail
  const others = PRODUCTS.filter((p) => String(p.id) !== rawCurrentId);
  const same = others.filter((p) => p.category === currentProduct?.category);
  const rest = others.filter((p) => p.category !== currentProduct?.category);
  const related = [...same, ...rest].slice(0, 10);

  const updateArrows = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [updateArrows, currentProduct?.id]);

  const scroll = (dir) => {
    rowRef.current?.scrollBy({ left: dir * (CARD_W + GAP) * 2, behavior: 'smooth' });
  };

  const handleProductSelect = (product) => {
    if (!onSelectProduct) return;

    // Convert raw item to rich product details format
    const formatted = typeof formatForDetailsPage === 'function'
      ? formatForDetailsPage(product)
      : product;

    onSelectProduct(formatted);

    // Scroll window to top
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  const arrowClass =
    'w-10 h-10 rounded-full bg-white border border-[#1D184D]/10 shadow-md flex items-center justify-center text-[#1D184D] hover:bg-[#1D184D] hover:text-[#D5C582] transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer';

  return (
    <section className="font-['Sora',sans-serif]" style={{ marginTop: 72 }}>
      <style>{`
        .matsya-rail { scrollbar-width: none; -ms-overflow-style: none; }
        .matsya-rail::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Page divider */}
      <div
        aria-hidden="true"
        style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}
      >
        <span
          style={{
            flex: 1,
            height: 1,
            background: 'linear-gradient(to right, transparent, rgba(29,24,77,0.25))',
          }}
        />
        <span style={{ color: '#D5C582', fontSize: 10, letterSpacing: 6 }}>◆ ◆ ◆</span>
        <span
          style={{
            flex: 1,
            height: 1,
            background: 'linear-gradient(to left, transparent, rgba(29,24,77,0.25))',
          }}
        />
      </div>

      {/* Heading + arrows */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D184D] leading-tight">
          You may also like.{' '}
          <span className="text-[#1D184D]/50 font-normal block sm:inline">
            Fresh picks for your table.
          </span>
        </h2>

        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={!canLeft}
            aria-label="Scroll left"
            className={arrowClass}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={!canRight}
            aria-label="Scroll right"
            className={arrowClass}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Product rail */}
      <div
        ref={rowRef}
        onScroll={updateArrows}
        data-lenis-prevent-wheel
        className="matsya-rail"
        style={{
          display: 'flex',
          gap: GAP,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          padding: '10px 4px 22px',
        }}
      >
        {related.map((p) => {
          const has500 = !!p.price_500g;
          const price = has500 ? p.price_500g : p.price_1kg;
          const mrp = Math.round(price * 1.25);
          const weight = has500 ? '500g' : '1kg';
          const img = PRODUCT_SPECIFIC_DATA[p.id]?.image || FALLBACK_IMG;

          return (
            <article
              key={p.id}
              onClick={() => handleProductSelect(p)}
              className="group bg-[#16123D] border-2 border-[#D5C582]/20 hover:border-[#D5C582] rounded-2xl shadow-md hover:-translate-y-1 hover:shadow-[0_10px_26px_rgba(213,197,130,0.3)] transition-all duration-300 cursor-pointer"
              style={{
                flex: `0 0 ${CARD_W}px`,
                width: CARD_W,
                padding: 10,
                scrollSnapAlign: 'start',
              }}
            >
              {/* Image + quick add */}
              <div
                className="relative overflow-hidden rounded-xl bg-[#100D2D]"
                style={{ width: '100%', height: 130 }}
              >
                <img
                  src={img}
                  alt={p.name}
                  loading="lazy"
                  className="group-hover:scale-105 transition-transform duration-300"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />
                <button
                  type="button"
                  aria-label={`Add ${p.name} to cart`}
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem?.(p, weight);
                  }}
                  className="absolute flex items-center justify-center rounded-lg bg-[#FAF7EE] text-[#C2542D] shadow-md hover:bg-[#D5C582] active:scale-95 transition cursor-pointer"
                  style={{ right: 8, bottom: 8, width: 32, height: 32 }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Details */}
              <div style={{ padding: '10px 4px 4px' }}>
                <h3
                  className="font-bold tracking-tight group-hover:text-[#D5C582] transition-colors"
                  style={{
                    color: '#FAF7EE',
                    fontSize: 15,
                    lineHeight: 1.25,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {p.name}
                </h3>
                <div style={{ color: '#D5C582', fontSize: 12, fontWeight: 600, marginTop: 2 }}>
                  ({p.marathiName})
                </div>

                <div
                  style={{
                    color: 'rgba(250,247,238,0.65)',
                    fontSize: 11,
                    marginTop: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>{has500 ? '500 g' : '1 kg'}</span>
                  <span style={{ borderLeft: '1px solid rgba(194,84,45,0.6)', paddingLeft: 8 }}>
                    Serves {has500 ? '2–3' : '4–6'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 6,
                    marginTop: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ color: '#FAF7EE', fontSize: 16, fontWeight: 700 }}>₹{price}</span>
                  <span
                    style={{
                      color: 'rgba(250,247,238,0.4)',
                      fontSize: 11,
                      textDecoration: 'line-through',
                    }}
                  >
                    ₹{mrp}
                  </span>
                  <span style={{ color: '#6EE7A8', fontSize: 11, fontWeight: 600 }}>20% off</span>
                </div>

                <div
                  style={{
                    color: 'rgba(250,247,238,0.6)',
                    fontSize: 10.5,
                    marginTop: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Truck className="w-3.5 h-3.5" style={{ color: '#E06B43' }} />
                  <span>Same-day dock delivery</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}