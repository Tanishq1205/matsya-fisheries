import React from 'react';
import { Trash2, X, CreditCard, Sparkles, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import PincodeChecker from './PincodeChecker';

const FREE_DELIVERY_THRESHOLD = 999;

// Dynamically loads Razorpay SDK
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    getCartTotal,
    pincode,
    isServiceable,
    deliverySlot,
  } = useCartStore();

  const subtotal = getCartTotal();
  const amountForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progressPercent = Math.min(
    100,
    (subtotal / FREE_DELIVERY_THRESHOLD) * 100
  );

  // Razorpay Payment Handler
  const handleRazorpayCheckout = async () => {
    if (!isServiceable) {
      alert('Please enter and verify a valid Mumbai pincode before proceeding.');
      return;
    }

    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      return;
    }

    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : 50;
    const grandTotal = subtotal + deliveryFee;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE',
      amount: grandTotal * 100,
      currency: 'INR',
      name: 'Matsya Fisheries',
      description: `Fresh Catch Order (${cart.length} item${cart.length > 1 ? 's' : ''})`,
      image: '/images/logo.png',
      handler: function (response) {
        alert(`Payment Successful!\nPayment ID: ${response.razorpay_payment_id}`);
        clearCart();
        closeCart();
      },
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      notes: {
        pincode: pincode,
        delivery_slot: deliverySlot,
      },
      theme: {
        color: '#C2542D',
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ease-in-out select-none ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-[#100D2D]/80 backdrop-blur-md transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6">
        <div
          className={`w-screen max-w-md bg-gradient-to-b from-[#1D184D] via-[#16123D] to-[#100D2D] text-[#FAF7EE] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.6)] border-l border-[#D5C582]/30 transform transition-transform duration-300 ease-in-out relative overflow-hidden ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Subtle Ambient Warm Glow behind the drawer */}
          <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-[#D5C582]/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/3 -left-20 w-80 h-80 rounded-full bg-[#C2542D]/10 blur-3xl pointer-events-none" />

          {/* Top Warm Gold Accent Strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#D5C582] via-[#C2542D] to-[#D5C582]" />

          {/* Header */}
          <div className="p-5 border-b border-[#D5C582]/20 flex items-center justify-between bg-[#1D184D]/90 backdrop-blur-xl relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#D5C582]/10 border border-[#D5C582]/30 flex items-center justify-center text-[#D5C582]">
                <ShoppingBag className="w-5 h-5 text-[#D5C582]" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-[0.2em] text-[#FAF7EE] uppercase font-['Sora',sans-serif]">
                  Your Basket
                </h2>
                <span className="text-[10px] font-semibold text-[#D5C582] uppercase tracking-wider block">
                  100% Edible Net Weight Guarantee
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="bg-[#C2542D] text-white text-xs px-3 py-1 rounded-full font-bold shadow-md">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} Pcs
              </span>
              <button
                onClick={closeCart}
                className="p-2 text-[#FAF7EE]/70 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Express Delivery Progress Bar */}
          <div className="bg-[#16123D] p-4 border-b border-[#D5C582]/15 relative z-10">
            <p className="text-xs text-[#FAF7EE] font-medium mb-2.5 flex items-center justify-between">
              {amountForFreeDelivery > 0 ? (
                <>
                  <span className="text-white/80">Express Mumbai Delivery</span>
                  <span className="text-xs font-bold text-[#D5C582] bg-[#D5C582]/10 px-2.5 py-0.5 rounded-md border border-[#D5C582]/25">
                    Add ₹{amountForFreeDelivery} for FREE
                  </span>
                </>
              ) : (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-[#D5C582]" /> 🎉 Free Express Delivery Unlocked!
                </span>
              )}
            </p>

            <div className="w-full bg-[#100D2D] h-2 rounded-full overflow-hidden border border-[#D5C582]/20 p-0.5">
              <div
                className="bg-gradient-to-r from-[#D5C582] via-[#E06B43] to-[#C2542D] h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(213,197,130,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Middle Content Area (Pincode + Cart Items) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 relative z-10 scrollbar-thin scrollbar-thumb-[#D5C582]/20">
            {cart.length === 0 ? (
              <div className="text-center py-20 text-[#FAF7EE]/40 flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-[#1D184D] border-2 border-[#D5C582]/30 flex items-center justify-center text-3xl mb-4 shadow-xl">
                  🦐
                </div>
                <p className="text-lg font-bold text-[#FAF7EE] font-['Sora',sans-serif]">Your Basket is Empty</p>
                <p className="text-xs text-[#FAF7EE]/60 mt-1 max-w-[220px]">
                  Select fresh coastal catches from the catalog to get started.
                </p>
              </div>
            ) : (
              <>
                {cart.length > 0 && <PincodeChecker />}

                {cart.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="group bg-[#100D2D]/90 p-4 rounded-2xl border border-[#D5C582]/20 
                    flex items-center justify-between gap-3.5 shadow-md transition-all duration-300"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-[#1D184D] border border-[#D5C582]/20 overflow-hidden shrink-0 flex items-center justify-center  transition-transform duration-300">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=150&auto=format&fit=crop&q=60';
                        }}
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline space-x-1.5 truncate">
                        <h4 className="font-bold text-[#FAF7EE] text-sm truncate font-['Sora',sans-serif]">
                          {item.name}
                        </h4>
                        {item.marathiName && (
                          <span className="text-xs text-[#D5C582] font-semibold shrink-0">
                            ({item.marathiName})
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] font-medium text-[#FAF7EE]/65 mt-0.5">
                        {item.weight} • <span className="text-[#D5C582]">{item.cut}</span>
                      </p>

                      <p className="text-base font-black text-[#D5C582] mt-1 tracking-tight">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>

                    {/* Quantity Selector & Trash */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2 bg-[#16123D] px-2.5 py-1.5 rounded-xl border border-[#D5C582]/25">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="text-[#FAF7EE]/70 hover:text-[#D5C582] font-black text-sm px-1 cursor-pointer transition-colors"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-[#FAF7EE] w-4 text-center font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="text-[#FAF7EE]/70 hover:text-[#D5C582] font-black text-sm px-1 cursor-pointer transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.cartItemId)}
                        className="p-2 text-[#FAF7EE]/40 hover:text-[#C2542D] hover:bg-[#C2542D]/15 rounded-xl transition-all cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Subtotal & Checkout Footer */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#D5C582]/20 bg-[#1D184D]/95 backdrop-blur-xl space-y-4 shadow-2xl relative z-10">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[11px] font-bold tracking-widest text-[#FAF7EE]/60 uppercase block">
                    Estimated Subtotal
                  </span>
                  <span className="text-[10px] text-[#D5C582] font-semibold">
                    Includes RO Cleaning & Custom Cutting
                  </span>
                </div>
                <span className="text-2xl font-black text-[#D5C582] font-['Sora',sans-serif] tracking-tight">
                  ₹{subtotal}
                </span>
              </div>

              <button
                type="button"
                onClick={handleRazorpayCheckout}
                disabled={!isServiceable}
                className={`w-full font-black py-4 rounded-2xl transition-all shadow-xl text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 cursor-pointer active:scale-[0.98] ${
                  isServiceable
                    ? 'bg-[#C2542D] hover:bg-[#A84320] text-white border border-[#D5C582]/40 shadow-[0_4px_20px_rgba(194,84,45,0.4)]'
                    : 'bg-white/10 text-white/30 border border-white/5 cursor-not-allowed'
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#D5C582]" />
                {isServiceable ? 'Proceed to Checkout' : 'Verify Pincode to Checkout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}