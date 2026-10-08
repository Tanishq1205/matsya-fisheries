import React from 'react';
import { useCartStore } from '../../store/useCartStore';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const cart = useCartStore((state) => state.cart) || [];
  const closeCart = useCartStore((state) => state.closeCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const deliverySlot = useCartStore((state) => state.deliverySlot) || 'Morning Catch (7:00 AM – 10:00 AM)';
  const setDeliverySlot = useCartStore((state) => state.setDeliverySlot);

  if (!isOpen) return null;

  // Safe internal calculations
  const totalItemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  // Dynamic Free Delivery threshold logic
  const FREE_DELIVERY_THRESHOLD = 799;
  const isFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  const amountNeeded = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progressPercentage = subtotal === 0 ? 0 : Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-['Sora',sans-serif] select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-[#16123D] text-[#FAF7EE] shadow-2xl flex flex-col border-l border-white/10">
          
          {/* HEADER */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D5C582]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-wider uppercase text-[#FAF7EE]">
                  YOUR BASKET
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#C2542D] text-white text-xs font-bold">
                {totalItemCount} Pcs
              </span>
              <button
                type="button"
                onClick={closeCart}
                className="text-white/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* DYNAMIC FREE EXPRESS DELIVERY BANNER */}
          <div className="px-5 pt-4 pb-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2 text-[#D5C582]">
                <Sparkles className="w-4 h-4 text-[#D5C582]" />
                {subtotal === 0 ? (
                  <span className="text-white/70">Add items worth ₹{FREE_DELIVERY_THRESHOLD} for Free Express Delivery</span>
                ) : isFreeDelivery ? (
                  <span className="text-[#6EE7A8]">🎉 Free Express Delivery Unlocked!</span>
                ) : (
                  <span className="text-[#FAF7EE]">
                    Add <strong className="text-[#D5C582]">₹{amountNeeded}</strong> more for Free Delivery
                  </span>
                )}
              </div>
            </div>

            {/* DYNAMIC PROGRESS BAR */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#C2542D] to-[#D5C582] transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
            
            {/* PREFERRED CATCH WINDOW SELECTOR CARD */}
            <div className="bg-[#100D2D] border border-white/10 rounded-2xl p-4 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FAF7EE]/60 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#D5C582]" />
                PREFERRED CATCH WINDOW
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeliverySlot && setDeliverySlot('Morning Catch (7:00 AM – 10:00 AM)')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    (deliverySlot || '').includes('Morning')
                      ? 'bg-[#1A1548] border-[#D5C582] text-[#FAF7EE]'
                      : 'bg-[#1A1548]/40 border-white/10 text-[#FAF7EE]/50 hover:border-white/20'
                  }`}
                >
                  <p className="text-xs font-bold">Morning Catch</p>
                  <p className="text-[10px] opacity-70 mt-0.5">7:00 AM — 10:00 AM</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliverySlot && setDeliverySlot('Evening Landing (4:00 PM – 7:00 PM)')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    (deliverySlot || '').includes('Evening')
                      ? 'bg-[#1A1548] border-[#D5C582] text-[#FAF7EE]'
                      : 'bg-[#1A1548]/40 border-white/10 text-[#FAF7EE]/50 hover:border-white/20'
                  }`}
                >
                  <p className="text-xs font-bold">Evening Landing</p>
                  <p className="text-[10px] opacity-70 mt-0.5">4:00 PM — 7:00 PM</p>
                </button>
              </div>
            </div>

            {/* CART ITEM CARDS */}
            {cart.length === 0 ? (
              <div className="py-12 text-center text-white/40 text-sm font-semibold">
                Your basket is empty.
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.cartItemId || `${item.id}-${item.weight}`}
                  className="bg-[#100D2D] border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3"
                >
                  <img
                    src={item.image || '/images/placeholder-fish.jpg'}
                    alt={item.name || 'Fish product'}
                    className="w-14 h-14 object-cover rounded-xl border border-white/10 shrink-0 bg-[#1A1548]"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=200&q=80';
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#FAF7EE] truncate">
                      {item.name || 'Fresh Catch'} {item.marathiName && <span className="font-normal text-white/70">({item.marathiName})</span>}
                    </h4>
                    <p className="text-[11px] text-white/60 mt-0.5">
                      {item.weight} • {item.cut || 'Cleaned'}
                    </p>
                    <p className="text-sm font-bold text-[#FAF7EE] mt-1">
                      ₹{(item.price || 0) * (item.quantity || 1)}
                    </p>
                  </div>

                  {/* Quantity Counter & Trash */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-white/15 bg-[#1A1548] rounded-xl overflow-hidden px-2 py-1 gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity && updateQuantity(item.cartItemId, -1)}
                        className="text-white/70 hover:text-white cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold min-w-[12px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity && updateQuantity(item.cartItemId, 1)}
                        className="text-white/70 hover:text-white cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem && removeItem(item.cartItemId)}
                      className="text-white/40 hover:text-red-400 p-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}

          </div>

          {/* FOOTER CHECKOUT BUTTON */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-[#100D2D] space-y-3">
              <div className="flex items-center justify-between text-sm font-bold text-[#FAF7EE]">
                <span>Total Amount</span>
                <span className="text-[#D5C582] text-lg">₹{subtotal}</span>
              </div>
              <button
                type="button"
                disabled={subtotal === 0}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#D5C582] hover:bg-[#c5b572] disabled:opacity-40 text-[#1D184D] font-extrabold text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-[0.98]"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}