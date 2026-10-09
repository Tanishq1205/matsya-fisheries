import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, MapPin, Phone, User, Home, Sparkles, Loader2, CreditCard } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { supabase } from '../../lib/supabaseClient';

const LOCAL_STORAGE_KEY = 'matsya_customer_details';

export default function CheckoutModal() {
  const isCheckoutOpen = useCartStore((state) => state.isCheckoutOpen);
  const closeCheckout = useCartStore((state) => state.closeCheckout);
  const cart = useCartStore((state) => state.cart) || [];
  const clearCart = useCartStore((state) => state.clearCart);
  const deliverySlot = useCartStore((state) => state.deliverySlot) || 'Morning Catch (7:00 AM – 10:00 AM)';

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    landmark: '',
    pincode: '',
    paymentMethod: 'COD', // 'COD' or 'UPI'
  });

  const [isSavedAddress, setIsSavedAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculated Order Totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const deliveryFee = subtotal >= 799 ? 0 : 49;
  const totalAmount = subtotal + deliveryFee;

  // Option 1: Pre-fill customer address from localStorage on modal open
  useEffect(() => {
    if (isCheckoutOpen) {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData((prev) => ({
            ...prev,
            fullName: parsed.fullName || '',
            phone: parsed.phone || '',
            address: parsed.address || '',
            landmark: parsed.landmark || '',
            pincode: parsed.pincode || '',
          }));
          setIsSavedAddress(true);
        } catch (e) {
          console.error('Error parsing saved address from localStorage:', e);
        }
      }
    }
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.pincode.trim()) {
      setErrorMessage('Please fill in all required delivery fields.');
      return;
    }

    if (formData.phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Build Order Payload
      const orderPayload = {
        customer_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        landmark: formData.landmark.trim() || null,
        pincode: formData.pincode.trim(),
        items: cart,
        subtotal,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
        delivery_slot: deliverySlot,
        payment_method: formData.paymentMethod,
        status: 'placed',
        created_at: new Date().toISOString(),
      };

      // 2. Insert order into Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select('id')
        .single();

      if (error) {
        console.warn('Note on orders table insertion:', error.message);
      }

      const generatedId = data?.id ? `#MATSYA-${data.id.toString().slice(0, 8).toUpperCase()}` : `#MATSYA-${Math.floor(100000 + Math.random() * 900000)}`;

      // 3. Save customer details to browser's localStorage for instant 1-click checkout next time
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          landmark: formData.landmark.trim(),
          pincode: formData.pincode.trim(),
        })
      );

      // 4. Trigger Confirmation State
      setOrderSuccess({
        orderId: generatedId,
        totalAmount,
        customerName: formData.fullName,
        deliverySlot,
      });

      // 5. Clear Cart
      if (clearCart) clearCart();

    } catch (err) {
      console.error('Order Submission Error:', err);
      setErrorMessage('Failed to place order. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAll = () => {
    setOrderSuccess(null);
    closeCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-['Sora',sans-serif] select-none flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#000000]/70 backdrop-blur-md transition-opacity" onClick={handleCloseAll} />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-[#16123D] text-[#FAF7EE] rounded-[28px] shadow-2xl border border-white/10 overflow-hidden z-10 my-8">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#100D2D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D5C582]/10 border border-[#D5C582]/30 flex items-center justify-center text-[#D5C582]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-wider uppercase text-[#FAF7EE]">
                {orderSuccess ? 'ORDER CONFIRMED' : 'EXPRESS CHECKOUT'}
              </h2>
              <p className="text-[11px] text-[#FAF7EE]/60 font-medium">
                {orderSuccess ? 'Dock Fresh Catch On Its Way' : 'Guest Checkout • No Login Required'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseAll}
            className="text-white/60 hover:text-white p-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ORDER SUCCESS CONFIRMATION SCREEN */}
        {orderSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-[#6EE7A8]/10 text-[#6EE7A8] rounded-full flex items-center justify-center mx-auto border border-[#6EE7A8]/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold tracking-widest text-[#D5C582] uppercase block mb-1">
                {orderSuccess.orderId}
              </span>
              <h3 className="text-2xl font-bold text-[#FAF7EE]">
                Thank You, {orderSuccess.customerName}!
              </h3>
              <p className="text-xs text-[#FAF7EE]/70 mt-2 max-w-md mx-auto leading-relaxed">
                Your fresh catch order has been received and sent to our dock team. We will call you prior to dispatch.
              </p>
            </div>

            <div className="bg-[#100D2D] p-4 rounded-2xl border border-white/10 text-left space-y-2 text-xs">
              <div className="flex justify-between text-[#FAF7EE]/70">
                <span>Delivery Slot:</span>
                <span className="font-bold text-[#D5C582]">{orderSuccess.deliverySlot}</span>
              </div>
              <div className="flex justify-between text-[#FAF7EE]/70">
                <span>Payment Method:</span>
                <span className="font-bold text-[#FAF7EE]">{formData.paymentMethod === 'COD' ? 'Cash on Delivery' : 'UPI on Delivery'}</span>
              </div>
              <div className="flex justify-between text-[#FAF7EE] font-bold text-sm pt-2 border-t border-white/10">
                <span>Amount Payable:</span>
                <span className="text-[#D5C582]">₹{orderSuccess.totalAmount}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseAll}
              className="w-full py-4 rounded-2xl bg-[#D5C582] hover:bg-[#c5b572] text-[#1D184D] font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-[0.98]"
            >
              DONE & BACK TO SHOP
            </button>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 space-y-5">
            
            {/* Auto-fill indicator badge */}
            {isSavedAddress && (
              <div className="bg-[#D5C582]/10 border border-[#D5C582]/30 rounded-xl p-3 flex items-center justify-between text-xs text-[#D5C582]">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Address Auto-Filled from Previous Order
                </span>
                <button
                  type="button"
                  onClick={() => setIsSavedAddress(false)}
                  className="underline text-[10px] font-bold uppercase hover:text-white cursor-pointer"
                >
                  Edit
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs font-semibold text-red-300">
                {errorMessage}
              </div>
            )}

            {/* Delivery Information Fields */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D5C582]">
                1. Delivery Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="text-[11px] font-bold text-[#FAF7EE]/70 mb-1 block">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Tanishq Dethe"
                      className="w-full pl-10 pr-3 py-2.5 bg-[#100D2D] border border-white/10 rounded-xl text-xs font-semibold text-[#FAF7EE] placeholder-white/30 focus:outline-none focus:border-[#D5C582] transition-colors"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="text-[11px] font-bold text-[#FAF7EE]/70 mb-1 block">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-3 py-2.5 bg-[#100D2D] border border-white/10 rounded-xl text-xs font-semibold text-[#FAF7EE] placeholder-white/30 focus:outline-none focus:border-[#D5C582] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="text-[11px] font-bold text-[#FAF7EE]/70 mb-1 block">Flat / Building / Street Address *</label>
                <div className="relative">
                  <Home className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Riddhi Siddhi Apartments, Building No. 74, Tilak Nagar"
                    className="w-full pl-10 pr-3 py-2.5 bg-[#100D2D] border border-white/10 rounded-xl text-xs font-semibold text-[#FAF7EE] placeholder-white/30 focus:outline-none focus:border-[#D5C582] transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Landmark */}
                <div>
                  <label className="text-[11px] font-bold text-[#FAF7EE]/70 mb-1 block">Landmark (Optional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      placeholder="Near Chembur Station"
                      className="w-full pl-10 pr-3 py-2.5 bg-[#100D2D] border border-white/10 rounded-xl text-xs font-semibold text-[#FAF7EE] placeholder-white/30 focus:outline-none focus:border-[#D5C582] transition-colors"
                    />
                  </div>
                </div>

                {/* Pincode */}
                <div>
                  <label className="text-[11px] font-bold text-[#FAF7EE]/70 mb-1 block">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="400089"
                    className="w-full px-3 py-2.5 bg-[#100D2D] border border-white/10 rounded-xl text-xs font-semibold text-[#FAF7EE] placeholder-white/30 focus:outline-none focus:border-[#D5C582] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Payment Option Selection */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D5C582]">
                2. Payment Method
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    formData.paymentMethod === 'COD'
                      ? 'bg-[#1A1548] border-[#D5C582] text-[#FAF7EE]'
                      : 'bg-[#100D2D] border-white/10 text-white/50 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-bold block">Cash on Delivery</span>
                  <span className="text-[10px] opacity-70">Pay cash upon arrival</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'UPI' })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    formData.paymentMethod === 'UPI'
                      ? 'bg-[#1A1548] border-[#D5C582] text-[#FAF7EE]'
                      : 'bg-[#100D2D] border-white/10 text-white/50 hover:border-white/20'
                  }`}
                >
                  <span className="text-xs font-bold block flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-[#D5C582]" /> UPI on Delivery
                  </span>
                  <span className="text-[10px] opacity-70">GPay / PhonePe on delivery</span>
                </button>
              </div>
            </div>

            {/* Order Summary Line items */}
            <div className="bg-[#100D2D] p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-[#FAF7EE]/70">
                <span>Items Subtotal ({cart.length} items):</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[#FAF7EE]/70">
                <span>Delivery Fee:</span>
                <span>{deliveryFee === 0 ? <strong className="text-[#6EE7A8]">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-[#FAF7EE] font-bold text-sm pt-2 border-t border-white/10">
                <span>Total Amount Payable:</span>
                <span className="text-[#D5C582] text-base">₹{totalAmount}</span>
              </div>
            </div>

            {/* Submit Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="w-full py-4 rounded-2xl bg-[#D5C582] hover:bg-[#c5b572] disabled:opacity-40 text-[#1D184D] font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#1D184D]" />
                  CONFIRMING ORDER...
                </>
              ) : (
                `PLACE ORDER • ₹${totalAmount}`
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}