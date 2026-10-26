import { cleanProductText } from '../../services/productCopy';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useLocationStore } from '../../store/useLocationStore';
import { getDeliveryQuote } from '../../services/deliveryService';
import { formatDeliveryDate } from '../../services/preorder';
import { placeOrder } from '../../services/orderService';

import { readCustomerDetails } from '../../services/customerDetails';

const LOCAL_STORAGE_KEY = 'matsya_customer_details';

export default function CheckoutPage({ onBackToCatalog }) {
  const cart = useCartStore((state) => state.cart) || [];
  const isPreorder = cart[0]?.orderType === 'preorder';
  const preorderDate = isPreorder ? cart[0].deliveryDate : null;
  const clearCart = useCartStore((state) => state.clearCart);
  const closeCheckout = useCartStore((state) => state.closeCheckout);
  const deliverySlot = useCartStore((state) => state.deliverySlot) || 'Morning Catch (7:00 AM – 10:00 AM)';

  const [savedDetails] = useState(readCustomerDetails);
  const [formData, setFormData] = useState(() => ({
    phone: savedDetails.phone || '',
    email: savedDetails.email || '',
    firstName: savedDetails.firstName || savedDetails.fullName?.split(' ')[0] || '',
    lastName: savedDetails.lastName || savedDetails.fullName?.split(' ').slice(1).join(' ') || '',
    pincode: useLocationStore.getState().location?.pincode || savedDetails.pincode || '',
    city: savedDetails.city || 'Mumbai', state: savedDetails.state || 'Maharashtra', country: 'India',
    streetAddress: savedDetails.streetAddress || savedDetails.address || '',
    apartment: savedDetails.apartment || '', landmark: savedDetails.landmark || '', paymentMethod: 'COD',
  }));
  const isSavedAddress = !!savedDetails.phone;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [quoteResult, setQuoteResult] = useState(null);
  const pin = formData.pincode.trim();
  const validPin = /^\d{6}$/.test(pin);
  const isCheckingPincode = validPin && quoteResult?.pincode !== pin;
  const deliveryQuote = quoteResult?.pincode === pin ? quoteResult.quote : null;
  const isServiceable = !!deliveryQuote;
  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const deliveryFee = deliveryQuote?.fee ?? null;
  const totalAmount = Math.round((subtotal + (deliveryFee ?? 0)) * 100) / 100;

  // Navbar location changes prefill the PIN without overwriting other form fields.
  useEffect(() => useLocationStore.subscribe((state, previous) => {
    const nextPin = state.location?.pincode;
    if (nextPin && nextPin !== previous.location?.pincode) {
      setFormData(current => ({ ...current, pincode: nextPin }));
    }
  }), []);

  useEffect(() => {
    if (!validPin) return;
    let cancelled = false;
    getDeliveryQuote(pin).then(quote => {
      if (!cancelled) setQuoteResult({ pincode: pin, quote });
    }).catch(() => {
      if (!cancelled) setQuoteResult({ pincode: pin, quote: null });
    });
    return () => { cancelled = true; };
  }, [pin, validPin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e) => {
  e.preventDefault();
  setErrorMessage('');

  if (!formData.phone.trim() || !formData.firstName.trim() || !formData.streetAddress.trim() || !formData.pincode.trim()) {
    setErrorMessage('Please fill in all required fields marked with *');
    return;
  }

  if (!isServiceable) {
    setErrorMessage(`Sorry, PIN Code ${formData.pincode} is currently unserviceable.`);
    return;
  }

  if (isSubmitting || !cart.length) return;
  if (!/^[6-9]\d{9}$/.test(formData.phone.trim()) || !/^\d{6}$/.test(formData.pincode.trim())) {
    setErrorMessage('Enter a valid 10-digit mobile number and 6-digit PIN code.');
    return;
  }
  if (isCheckingPincode) { setErrorMessage('Please wait for the delivery area check.'); return; }
  if (deliveryFee === null) { setErrorMessage('Check your delivery PIN code before ordering.'); return; }
  setIsSubmitting(true);

  try {
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
    const fullAddress = `${formData.streetAddress.trim()}${formData.apartment ? ', ' + formData.apartment.trim() : ''}, ${formData.city}, ${formData.state}`;

    // Mapped directly to your Supabase orders table schema
    const orderPayload = {
      ...(isPreorder ? { order_type: 'preorder', delivery_date: preorderDate } : {}),
      customer_name: fullName,
      customer_phone: formData.phone.trim(),
      delivery_address: fullAddress,
      landmark: formData.landmark.trim() || null,
      pincode: formData.pincode.trim(),
      items: cart,
      subtotal: Number(subtotal),
      delivery_fee: Number(deliveryFee),
      total_amount: Number(totalAmount),
      delivery_slot: deliverySlot,
      payment_method: formData.paymentMethod,
      payment_status: 'pending',
      order_status: 'placed',
      created_at: new Date().toISOString(),
    };

    // Insert order and select generated order_number and id
    const data = await placeOrder(orderPayload);

    // Format friendly display order number
    const generatedId = data?.order_number
      ? `#MATSYA-${data.order_number}`
      : `#MATSYA-${data?.id?.slice(0, 6).toUpperCase() || Math.floor(100000 + Math.random() * 900000)}`;

    // Save customer details locally for pre-filling next time
    try { localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        streetAddress: formData.streetAddress.trim(),
        apartment: formData.apartment.trim(),
        landmark: formData.landmark.trim(),
        pincode: formData.pincode.trim(),
        city: formData.city,
        state: formData.state,
      })
    );

    } catch { /* The confirmed order is already saved on the server. */ }

    setOrderSuccess({
      orderId: generatedId,
      totalAmount: data.total_amount,
      customerName: fullName,
      orderType: data.order_type,
      deliveryDate: data.delivery_date,
      deliverySlot,
      fullAddress,
    });

    if (clearCart) clearCart();
  } catch (err) {
    console.error('Order submission error:', err);
    setErrorMessage(err.message || 'Failed to place order. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  const handleReturnHome = () => {
  if (window.history.state?.view === 'checkout') {
    window.history.back();
  } else {
    closeCheckout();
    if (onBackToCatalog) onBackToCatalog();
  }
};

  const isPincode6Digits = formData.pincode.replace(/\D/g, '').length === 6;

  return (
    <div className="w-full bg-[#FAF7EE] text-[#1D184D] min-h-screen pt-24 pb-20 font-['Sora',sans-serif]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1D184D]/10">
          <button
            type="button"
            onClick={handleReturnHome}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#1D184D]/70 hover:text-[#1D184D] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> RETURN TO CATALOG
          </button>
          <span className="text-xs font-bold tracking-widest text-[#C2542D] uppercase">
            {isPreorder ? 'PREORDER CHECKOUT' : 'DOCK-TO-DOOR CHECKOUT'}
          </span>
        </div>

        {isPreorder && !orderSuccess && <p className="mb-6 rounded-2xl bg-[#D5C582]/20 p-4 text-sm font-bold">Preorder delivery: {formatDeliveryDate(preorderDate)}. Pay on delivery.</p>}
        {/* ORDER SUCCESS SCREEN */}
        {orderSuccess ? (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-[#1D184D]/10 shadow-lg text-center space-y-6 my-8">
            <div className="w-20 h-20 bg-[#6EE7A8]/20 text-[#2B7A4B] rounded-full flex items-center justify-center mx-auto border border-[#6EE7A8]">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="text-xs font-bold tracking-widest text-[#C2542D] uppercase block mb-1">
                {orderSuccess.orderId}
              </span>
              {orderSuccess.orderType === 'preorder' && <p className="text-sm font-bold mb-3">Preorder confirmed for {formatDeliveryDate(orderSuccess.deliveryDate)} · Payment due on delivery</p>}
              <h1 className="text-3xl font-black text-[#1D184D]">
                Thank You, {orderSuccess.customerName}!
              </h1>
              <p className="text-sm text-[#1D184D]/70 mt-2 max-w-md mx-auto leading-relaxed">
                {orderSuccess.orderType === 'preorder' ? 'Your preorder is confirmed for the selected date. Our dock team will contact you prior to delivery.' : 'Your fresh catch order is confirmed and assigned for dispatch. Our dock team will contact you prior to delivery.'}
              </p>
            </div>

            <div className="bg-[#FAF7EE] p-6 rounded-2xl border border-[#1D184D]/10 text-left space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-[#1D184D]/10 pb-2">
                <span className="text-[#1D184D]/70">Delivery Window:</span>
                <span className="font-bold text-[#1D184D]">{orderSuccess.deliverySlot}</span>
              </div>
              <div className="flex justify-between border-b border-[#1D184D]/10 pb-2">
                <span className="text-[#1D184D]/70">Shipping Address:</span>
                <span className="font-bold text-[#1D184D] text-right max-w-[260px]">{orderSuccess.fullAddress}</span>
              </div>
              <div className="flex justify-between border-b border-[#1D184D]/10 pb-2">
                <span className="text-[#1D184D]/70">Payment Method:</span>
                <span className="font-bold text-[#1D184D]">{formData.paymentMethod === 'COD' ? 'Cash on Delivery' : 'UPI on delivery'}</span>
              </div>
              <div className="flex justify-between text-[#1D184D] font-bold text-base pt-1">
                <span>Total Amount:</span>
                <span className="text-[#C2542D]">₹{orderSuccess.totalAmount}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReturnHome}
              className="w-full py-4 rounded-full bg-[#1D184D] hover:bg-[#15113A] text-[#D5C582] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        ) : (
          /* MAIN CHECKOUT FORM */
          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* LEFT COLUMN: Billing & Shipping */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#1D184D] tracking-heading">
                  Billing & Shipping
                </h1>
                {isSavedAddress && (
                  <p className="text-xs text-[#2B7A4B] font-semibold mt-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Details pre-filled from your previous order
                  </p>
                )}
              </div>

              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-4">
                {/* Phone & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#1D184D] block mb-1.5">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full px-4 py-3 bg-white border border-[#1D184D]/20 rounded-full text-xs font-semibold text-[#1D184D] focus:outline-none focus:border-[#1D184D] shadow-sm transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1D184D] block mb-1.5">Email address (optional)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 bg-white border border-[#1D184D]/20 rounded-full text-xs font-semibold text-[#1D184D] focus:outline-none focus:border-[#1D184D] shadow-sm transition-colors"
                    />
                  </div>
                </div>

                {/* First & Last Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#1D184D] block mb-1.5">First name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Tanishq"
                      className="w-full px-4 py-3 bg-white border border-[#1D184D]/20 rounded-full text-xs font-semibold text-[#1D184D] focus:outline-none focus:border-[#1D184D] shadow-sm transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1D184D] block mb-1.5">Last name (optional)</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Dethe"
                      className="w-full px-4 py-3 bg-white border border-[#1D184D]/20 rounded-full text-xs font-semibold text-[#1D184D] focus:outline-none focus:border-[#1D184D] shadow-sm transition-colors"
                    />
                  </div>
                </div>

                {/* PIN Code Field with Real-time DB Validation */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#1D184D]">PIN Code *</label>
                    {isCheckingPincode && (
                      <span className="text-[10px] text-[#1D184D]/60 flex items-center gap-1 font-semibold">
                        <Loader2 className="w-3 h-3 animate-spin text-[#C2542D]" /> Checking delivery...
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    name="pincode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="400072"
                    className={`w-full px-4 py-3 bg-white border rounded-full text-xs font-semibold text-[#1D184D] focus:outline-none shadow-sm transition-colors ${
                      isPincode6Digits && !isServiceable
                        ? 'border-red-500 focus:border-red-500'
                        : isPincode6Digits && isServiceable
                        ? 'border-[#2B7A4B] focus:border-[#2B7A4B]'
                        : 'border-[#1D184D]/20 focus:border-[#1D184D]'
                    }`}
                  />

                  {isPincode6Digits && !isServiceable && !isCheckingPincode && (
                    <p className="text-[11px] font-bold text-red-600 mt-1.5 pl-2">
                      ⚠️ Delivery is currently unavailable for PIN Code {formData.pincode}.
                    </p>
                  )}

                  {isPincode6Digits && isServiceable && !isCheckingPincode && (
                    <p className="text-[11px] font-bold text-[#2B7A4B] mt-1.5 pl-2">
                      ✓ Serviceable location confirmed
                    </p>
                  )}
                </div>

                {/* Town / City */}
                <div>
                  <label className="text-xs font-bold text-[#1D184D] block mb-1.5">Town / City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mumbai"
                    className="w-full px-4 py-3 bg-white border border-[#1D184D]/20 rounded-full text-xs font-semibold text-[#1D184D] focus:outline-none focus:border-[#1D184D] shadow-sm transition-colors"
                  />
                </div>

                {/* State Dropdown */}
                <div>
                  <label className="text-xs font-bold text-[#1D184D] block mb-1.5">State *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-[#1D184D]/20 rounded-full text-xs font-semibold text-[#1D184D] focus:outline-none focus:border-[#1D184D] shadow-sm transition-colors cursor-pointer appearance-none"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Goa">Goa</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                  </select>
                </div>

                {/* Country / Region */}
                <div>
                  <label className="text-xs font-bold text-[#1D184D] block mb-1">Country / Region *</label>
                  <p className="text-sm font-bold text-[#1D184D] py-1">India</p>
                </div>

                {/* Street Address */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-[#1D184D] block">Street address *</label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    placeholder="House number and street name (e.g. Building No. 74, Tilak Nagar)"
                    className="w-full px-4 py-3 bg-white border border-[#1D184D]/20 rounded-full text-xs font-semibold text-[#1D184D] focus:outline-none focus:border-[#1D184D] shadow-sm transition-colors"
                  />
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleChange}
                    placeholder="Apartment, suite, unit, etc. (optional)"
                    className="w-full px-4 py-3 bg-white border border-[#1D184D]/20 rounded-full text-xs font-semibold text-[#1D184D] focus:outline-none focus:border-[#1D184D] shadow-sm transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Order Summary & Payment */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Order Summary Box */}
              <div className="bg-white/80 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-[#1D184D]/10 shadow-sm space-y-5">
                <h2 className="text-2xl font-bold text-[#1D184D] tracking-heading">
                  Order summary
                </h2>

                {/* Cart Items List */}
                <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1 no-scrollbar border-b border-[#1D184D]/10 pb-4">
                  {cart.length === 0 ? (
                    <p className="text-xs text-[#1D184D]/50 py-4 text-center">Your cart is empty.</p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.cartItemId || item.id} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=200&q=80'}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-xl border border-[#1D184D]/10 shrink-0 bg-[#FAF7EE]"
                          />
                          <div className="truncate">
                            <h4 className="font-bold text-[#1D184D] truncate">{item.name}</h4>
                            <p className="text-[11px] text-[#1D184D]/60">{item.weight} • {cleanProductText(item.cut) || 'Cleaned'} x{item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold text-[#1D184D] shrink-0">₹{(item.price || 0) * (item.quantity || 1)}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Pricing Line Items */}
                <div className="space-y-2.5 text-xs text-[#1D184D]/80">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#1D184D]">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-bold text-[#2B7A4B]">{deliveryFee === null ? 'Enter delivery PIN code' : deliveryFee === 0 ? 'Free shipping' : `₹${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#1D184D] pt-3 border-t border-[#1D184D]/10">
                    <span>Total</span>
                    <div className="text-right">
                      <span className="text-xl text-[#1D184D]">{deliveryFee === null ? '—' : `₹${totalAmount.toFixed(2)}`}</span>
                    </div>
                  </div>
                </div>

                {/* CLEANED AND PREPARED WITH CARE Box */}
                <div className="border border-dashed border-[#C2542D]/50 bg-[#C2542D]/5 p-4 rounded-2xl space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#C2542D] block">
                    CLEANED AND PREPARED WITH CARE
                  </span>
                  <p className="text-[11px] text-[#1D184D]/70 leading-snug">
                     Carefully prepared and delivered with care
                  </p>
                </div>
              </div>

              {/* Payment Information Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#1D184D] tracking-heading">
                  Payment information
                </h3>

                <div className="space-y-3">
                  <label
                    onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      formData.paymentMethod === 'COD'
                        ? 'border-[#1D184D] bg-white shadow-sm'
                        : 'border-[#1D184D]/15 bg-white/50 hover:border-[#1D184D]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={formData.paymentMethod === 'COD'}
                        onChange={() => {}}
                        className="accent-[#1D184D] w-4 h-4"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#1D184D] block">Cash on delivery</span>
                        <span className="text-[10px] text-[#1D184D]/60 block mt-0.5">Pay with cash upon delivery.</span>
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => setFormData({ ...formData, paymentMethod: 'UPI' })}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      formData.paymentMethod === 'UPI'
                        ? 'border-[#1D184D] bg-white shadow-sm'
                        : 'border-[#1D184D]/15 bg-white/50 hover:border-[#1D184D]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="UPI"
                        checked={formData.paymentMethod === 'UPI'}
                        onChange={() => {}}
                        className="accent-[#1D184D] w-4 h-4"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#1D184D] block">UPI on delivery</span>
                        <span className="text-[10px] text-[#1D184D]/60 block mt-0.5">Pay using your UPI app when your order arrives. Payment stays pending until our team verifies receipt.</span>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Place Order CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0 || !isServiceable || isCheckingPincode || deliveryFee === null}
                  className="w-full py-4 px-6 rounded-full bg-[#1D184D] hover:bg-[#15113A] disabled:opacity-40 text-[#D5C582] font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D5C582]" />
                      PROCESSING ORDER...
                    </>
                  ) : !isServiceable ? (
                    'UNSERVICEABLE LOCATION'
                  ) : (
                    deliveryFee === null ? 'ENTER DELIVERY PIN CODE' : `PLACE ORDER • ₹${totalAmount.toFixed(2)}`
                  )}
                </button>
              </div>

            </div>

          </form>
        )}

      </div>
    </div>
  );
}
