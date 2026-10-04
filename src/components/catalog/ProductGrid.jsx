import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore'; // 1. Store imported

const PRODUCTS = [
  { id: 1, name: 'Squids', marathiName: 'माकुळ', category: 'Prawns & Shellfish', subtitle: 'Tender Calamari', standard_cut: 'Cleaned & RO Washed', price_500g: 399, price_1kg: 749, tag: 'Fresh Catch' },
  { id: 2, name: 'Mushi', marathiName: 'मुशी', category: 'Daily Catch', subtitle: 'Baby Shark / Flake', standard_cut: 'Skinless & Cleaned', price_500g: 441, price_1kg: 699, tag: 'Daily Catch' },
  { id: 3, name: 'Shrimole', marathiName: 'श्रीमॉली', category: 'Prawns & Shellfish', subtitle: 'Small Coastal Prawns', standard_cut: 'Cleaned & RO Washed', price_500g: 301, price_1kg: 599, tag: 'Top Seller' },
  { id: 4, name: 'Tiger Prawns', marathiName: 'वाघा कोळंबी', category: 'Prawns & Shellfish', subtitle: 'Large Coastal Tiger Prawns', standard_cut: 'Cleaned & Deveined', price_500g: 599, price_1kg: 999, tag: 'Premium' },
  { id: 5, name: 'Red Prawns', marathiName: 'तांबडी कोळंबी', category: 'Prawns & Shellfish', subtitle: 'Sweet Medium Sea Prawns', standard_cut: 'Cleaned & Deveined', price_500g: 399, price_1kg: 649, tag: 'Popular' },
  { id: 6, name: 'Scampi', marathiName: 'मोठी कोळंबी / स्कॅम्पी', category: 'Prawns & Shellfish', subtitle: 'Giant Freshwater Prawns', standard_cut: 'Cleaned & RO Washed', price_500g: 699, price_1kg: 1099, tag: 'Delicacy' },
  { id: 7, name: 'Surmai', marathiName: 'सुरमई', category: 'Premium Sea Fish', subtitle: 'King Fish / Seer Fish', standard_cut: 'Cleaned & RO Washed', price_500g: 799, price_1kg: 1249, tag: 'Best Seller' },
  { id: 8, name: 'Basa Fillets', marathiName: 'बासा', category: 'Premium Sea Fish', subtitle: 'Mild White Fish Fillets', standard_cut: 'Skinless & Cleaned', price_500g: null, price_1kg: 599, tag: 'Boneless' },
  { id: 9, name: 'Bangda', marathiName: 'बांगडा', category: 'Daily Catch', subtitle: 'Indian Mackerel', standard_cut: 'Cleaned & RO Washed', price_500g: 345, price_1kg: 549, tag: 'Daily Catch' },
  { id: 10, name: 'White Pomfret (5-6 pcs)', marathiName: 'पांढरा पापलेट', category: 'Premium Sea Fish', subtitle: 'Silver Pomfret', standard_cut: 'Cleaned & RO Washed', price_500g: 899, price_1kg: 1599, tag: 'Royal Catch' },
  { id: 11, name: 'White Prawns', marathiName: 'पांढरी कोळंबी', category: 'Prawns & Shellfish', subtitle: 'Tender White Curry Prawns', standard_cut: 'Cleaned & Deveined', price_500g: 399, price_1kg: 649, tag: 'Curry Cut' },
  { id: 12, name: 'Rawas', marathiName: 'रावस', category: 'Premium Sea Fish', subtitle: 'Indian Salmon', standard_cut: 'Cleaned & RO Washed', price_500g: 799, price_1kg: 1249, tag: 'Chef Choice' },
  { id: 13, name: 'Tilapia Fillets', marathiName: 'तिलापिया', category: 'Premium Sea Fish', subtitle: 'Boneless White Fish Fillets', standard_cut: 'Skinless & Cleaned', price_500g: null, price_1kg: 599, tag: 'Boneless' },
  { id: 14, name: 'Chinese Pomfret', marathiName: 'कापूस पापलेट', category: 'Premium Sea Fish', subtitle: 'Large Premium Pomfret', standard_cut: 'Cleaned & RO Washed', price_500g: 699, price_1kg: 1199, tag: 'Premium' },
  { id: 15, name: 'Sardines', marathiName: 'तारली', category: 'Daily Catch', subtitle: 'Tarli', standard_cut: 'Cleaned & RO Washed', price_500g: 315, price_1kg: 549, tag: 'Daily Catch' },
  { id: 16, name: 'Halwa', marathiName: 'हलवा', category: 'Premium Sea Fish', subtitle: 'Black Pomfret', standard_cut: 'Cleaned & RO Washed', price_500g: 599, price_1kg: 949, tag: 'Popular' },
  { id: 17, name: 'Mud Crabs (5-6 pcs)', marathiName: 'खेकडा', category: 'Prawns & Shellfish', subtitle: 'Fresh Coastal Crabs', standard_cut: 'Cleaned & RO Washed', price_500g: null, price_1kg: 949, tag: 'Live Landing' },
  { id: 18, name: 'Bombil (Bombay Duck)', marathiName: 'बोंबील', category: 'Daily Catch', subtitle: 'Mumbai Classic', standard_cut: 'Cleaned & RO Washed', price_500g: 345, price_1kg: 549, tag: 'Mumbai Special' },
];

function ProductCard({ product }) {
  // Default to 1kg if 500g is null
  const [weight, setWeight] = useState(product.price_500g ? '500g' : '1kg');

  // 2. Connect Zustand store directly inside card
  const addItem = useCartStore((state) => state.addItem);

  const price = weight === '500g' ? product.price_500g : product.price_1kg;
  const originalPrice = Math.round(price * 1.25);
  const serves = weight === '500g' ? 'Serves 2–3' : 'Serves 4–6';

  return (
    <div className="rounded-2xl bg-[#16123D] border border-[#D5C582]/20 p-5 flex flex-col justify-between hover:border-[#D5C582]/40 transition-all duration-200 shadow-md">
      {/* Top Tag & Serving Size */}
      <div>
        <div className="flex items-center justify-between text-[11px] mb-3">
          <span className="font-bold tracking-wider uppercase text-[#D5C582] bg-[#D5C582]/10 px-2.5 py-0.5 rounded-full">
            {product.tag || 'Fresh Landing'}
          </span>
          <span className="text-[#FAF7EE]/70 text-xs font-medium">
            {serves}
          </span>
        </div>

        <div className="w-full h-44 my-3 rounded-xl overflow-hidden bg-[#100D2D] border border-white/5">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.onerror = null;
              // Shows a placeholder until you add real photo files to public/images/products/
              e.currentTarget.src = 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=500&auto=format&fit=crop&q=60';
            }}
          />
        </div>

        {/* Catch Names */}
        <div className="flex items-baseline gap-2">
          <h3 className="text-xl font-bold text-[#FAF7EE] tracking-tight font-['Sora',sans-serif]">
            {product.name}
          </h3>
          <span className="text-sm font-semibold text-[#D5C582]">
            ({product.marathiName})
          </span>
        </div>
        <p className="text-xs text-[#FAF7EE]/65 font-medium mt-1">
          {product.subtitle}
        </p>
      </div>

      {/* Weight Selector Toggle */}
      {product.price_500g ? (
        <div className="my-5 bg-[#100D2D] p-1 rounded-xl flex items-center border border-white/5">
          <button
            type="button"
            onClick={() => setWeight('500g')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              weight === '500g'
                ? 'bg-[#D5C582] text-[#1D184D] shadow-sm'
                : 'text-[#FAF7EE]/60 hover:text-white'
            }`}
          >
            500g
          </button>
          <button
            type="button"
            onClick={() => setWeight('1kg')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              weight === '1kg'
                ? 'bg-[#D5C582] text-[#1D184D] shadow-sm'
                : 'text-[#FAF7EE]/60 hover:text-white'
            }`}
          >
            1 kg
          </button>
        </div>
      ) : (
        <div className="my-5 py-2 px-3 rounded-xl bg-[#100D2D]/60 border border-white/5 flex items-center justify-between text-xs">
          <span className="text-[#FAF7EE]/50 font-medium">Standard Pack</span>
          <span className="text-[#D5C582] font-bold">1 kg</span>
        </div>
      )}

      {/* Pricing & Add to Cart */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#FAF7EE] font-['Sora',sans-serif]">
              ₹{price}
            </span>
            <span className="text-xs text-[#FAF7EE]/40 line-through">
              ₹{originalPrice}
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#C2542D] tracking-wider uppercase block">
            Save 20% Today
          </span>
        </div>

        {/* 3. Direct Zustand Trigger */}
        <button
          type="button"
          onClick={() => addItem(product, weight)}
          className="py-2.5 px-4 rounded-xl bg-[#D5C582] hover:bg-[#E5D79E] text-[#1D184D] text-xs font-bold tracking-wider uppercase transition-all duration-150 active:scale-95 cursor-pointer"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default function ProductGrid() {
  return (
    <section id="all-products" className="relative w-full bg-[#FAF7EE] select-none pb-28">
      {/* 1. Navy Guarantee Bar */}
      <div className="relative w-full overflow-hidden leading-none">
        <div className="w-full bg-[#1D184D] border-y border-[#D5C582]/25 py-4 px-6 sm:px-12 shadow-sm">
          <div className="max-w-[1560px] mx-auto flex flex-wrap items-center justify-between gap-y-2 text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-[#D5C582] font-['Sora',sans-serif]">
            <span>Dock-to-Door Mumbai</span>
            <span className="text-[#D5C582]/40">◆</span>
            <span>100% Edible Net Weight</span>
            <span className="text-[#D5C582]/40">◆</span>
            <span>Daily Coastal Landing</span>
          </div>
        </div>
      </div>

      {/* 2. Header */}
      <div className="max-w-[1560px] mx-auto px-6 sm:px-12 pt-16 mb-12">
        <span className="text-[11px] font-bold tracking-[0.28em] uppercase text-[#C2542D] block mb-2 font-['Sora',sans-serif]">
          Daily Harbor Catch
        </span>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl md:text-[44px] font-bold tracking-tight text-[#1D184D] leading-tight font-['Sora',sans-serif]">
            All Fresh Catches.{' '}
            <span className="text-[#1D184D]/50 font-normal block sm:inline sm:ml-2">
              Cleaned, cut, and packed to order.
            </span>
          </h2>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#1D184D]/60 font-['Sora',sans-serif]">
            18 Items Available
          </span>
        </div>
      </div>

      {/* 3. 18-Product Grid */}
      <div className="max-w-[1560px] mx-auto px-6 sm:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}