import React, { useState } from 'react';
import { useCartStore } from '../../store/useCartStore';

export default function ProductCard({ product }) {
  const [selectedWeight, setSelectedWeight] = useState(
    product.has500g ? '500g' : '1kg'
  );
  const addItem = useCartStore((state) => state.addItem);

  const activePrice =
    selectedWeight === '1kg' ? product.price1kg : product.price500g;

  return (
    <div className="bg-white border border-[#1D184D]/10 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#D5C582]/60 transition-all">
      <div>
        {/* Name Header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-[#1D184D]">{product.name}</h3>
            <p className="text-xs text-[#1D184D]/70 font-medium">
              {product.marathiName}
            </p>
          </div>
          <span className="text-[11px] bg-[#1D184D]/5 text-[#1D184D]/80 px-2.5 py-1 rounded-full font-medium">
            {product.servingEstimate || '2-3 Servings'}
          </span>
        </div>

        {/* Weight Selector Toggles */}
        <div className="flex gap-2 my-4">
          {product.has500g && (
            <button
              type="button"
              onClick={() => setSelectedWeight('500g')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                selectedWeight === '500g'
                  ? 'border-[#1D184D] bg-[#1D184D] text-[#FAF7EE]'
                  : 'border-[#1D184D]/15 text-[#1D184D]/70 hover:border-[#1D184D]/40 bg-transparent'
              }`}
            >
              500g • ₹{product.price500g}
            </button>
          )}
          <button
            type="button"
            onClick={() => setSelectedWeight('1kg')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              selectedWeight === '1kg'
                ? 'border-[#1D184D] bg-[#1D184D] text-[#FAF7EE]'
                : 'border-[#1D184D]/15 text-[#1D184D]/70 hover:border-[#1D184D]/40 bg-transparent'
            }`}
          >
            1kg • ₹{product.price1kg}
          </button>
        </div>
      </div>

      {/* Add To Cart CTA */}
      <button
        type="button"
        onClick={() => addItem(product, selectedWeight)}
        className="w-full bg-[#D5C582] hover:bg-[#c4b371] text-[#1D184D] font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors mt-2 cursor-pointer active:scale-[0.98]"
      >
        Add to Cart • ₹{activePrice}
      </button>
    </div>
  );
}