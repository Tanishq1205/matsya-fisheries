import React from 'react';
import { Trash2, X, CreditCard } from 'lucide-react';
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
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE', // Set in .env as VITE_RAZORPAY_KEY_ID
      amount: grandTotal * 100, // Amount in paise
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
        color: '#100D2D',
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`fixed inset-0 bg-[#1D184D]/70 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen max-w-md bg-[#16123D] text-[#FAF7EE] flex flex-col shadow-2xl border-l border-[#D5C582]/20 transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-[#D5C582]/15 flex items-center justify-between bg-[#100D2D]">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold tracking-widest text-[#D5C582] uppercase font-['Sora',sans-serif]">
                Your Basket
              </h2>
              <span className="bg-[#D5C582]/20 text-[#D5C582] text-xs px-2.5 py-0.5 rounded-full font-bold">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-[#FAF7EE]/60 hover:text-[#FAF7EE] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          <div className="bg-[#100D2D]/60 p-4 border-b border-[#D5C582]/10">
            <p className="text-xs text-[#FAF7EE]/80 font-medium mb-2">
              {amountForFreeDelivery > 0 ? (
                <>
                  Add <span className="text-[#D5C582] font-bold">₹{amountForFreeDelivery}</span> more for Free Express Delivery
                </>
              ) : (
                <span className="text-emerald-400 font-bold">
                  🎉 You unlocked Free Mumbai Express Delivery!
                </span>
              )}
            </p>
            <div className="w-full bg-[#100D2D] h-1.5 rounded-full overflow-hidden border border-white/5">
              <div
                className="bg-[#D5C582] h-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items & Pincode Checker */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-16 text-[#FAF7EE]/40">
                <div className="text-4xl mb-3">🐟</div>
                <p className="text-base font-semibold text-[#FAF7EE]/70">Your basket is empty</p>
                <p className="text-xs mt-1">Select fresh seafood from the catalog to get started.</p>
              </div>
            ) : (
              <>
                {cart.length > 0 && <PincodeChecker />}

                {cart.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="bg-[#100D2D]/80 p-3.5 rounded-xl border border-[#D5C582]/15 flex items-center justify-between gap-3 hover:border-[#D5C582]/30 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-lg bg-[#16123D] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
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

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline space-x-1.5 truncate">
                        <h4 className="font-semibold text-[#FAF7EE] text-sm truncate">{item.name}</h4>
                        {item.marathiName && (
                          <span className="text-xs text-[#D5C582] font-medium shrink-0">
                            ({item.marathiName})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#FAF7EE]/60 mt-0.5">
                        {item.weight} • {item.cut}
                      </p>
                      <p className="text-sm font-bold text-[#D5C582] mt-1">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-1.5 bg-[#16123D] px-2 py-1 rounded-lg border border-[#D5C582]/20">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartItemId, -1)}
                          className="text-[#FAF7EE]/60 hover:text-[#D5C582] font-bold text-xs px-1 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-[#FAF7EE] w-3 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartItemId, 1)}
                          className="text-[#FAF7EE]/60 hover:text-[#D5C582] font-bold text-xs px-1 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.cartItemId)}
                        className="p-1.5 text-[#FAF7EE]/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
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

          {/* Footer Subtotal & Razorpay Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#D5C582]/15 bg-[#100D2D] space-y-3">
              <div className="flex justify-between items-center text-sm text-[#FAF7EE]/80">
                <span>Estimated Subtotal</span>
                <span className="text-xl font-bold text-[#D5C582]">₹{subtotal}</span>
              </div>

              <button
                type="button"
                onClick={handleRazorpayCheckout}
                disabled={!isServiceable}
                className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-lg text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                  isServiceable
                    ? 'bg-[#D5C582] hover:bg-[#E5D79E] text-[#1D184D]'
                    : 'bg-[#D5C582]/30 text-[#FAF7EE]/40 cursor-not-allowed'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                {isServiceable ? 'Pay via Razorpay' : 'Verify Pincode to Checkout'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}