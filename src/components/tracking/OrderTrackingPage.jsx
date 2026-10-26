import { formatDeliveryDate } from '../../services/preorder';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Loader2,
  AlertCircle,
  Fish,
  ShoppingBag,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

import { readCustomerDetails } from '../../services/customerDetails';

const TRACKING_STEPS = [
  {
    key: 'placed',
    title: 'Order Placed',
    description: 'Catch order received & logged at dock',
    icon: ShoppingBag,
  },
  {
    key: 'dock_processing',
    title: 'Dock Processing',
    description: 'Gutted, RO washed & temp-chilled in ice gel',
    icon: Fish,
  },
  {
    key: 'out_for_delivery',
    title: 'Out for Delivery',
    description: 'Express rider assigned for dock-to-door transit',
    icon: Truck,
  },
  {
    key: 'delivered',
    title: 'Delivered',
    description: 'Fresh catch delivered to your kitchen',
    icon: CheckCircle2,
  },
];

async function lookupOrders(query) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const session = sessionData.session;
  if (!session) throw new Error('Open tracking in the same browser used to place your order, or contact us on WhatsApp for help.');
  const cleanInput = query.replace(/^#?MATSYA-/i, '').trim();
  let request = supabase.from('orders').select('*').eq('customer_id', session.user.id);
  if (/^\d{10}$/.test(query)) request = request.eq('customer_phone', query);
  else if (/^\d+$/.test(cleanInput)) request = request.eq('order_number', parseInt(cleanInput, 10));
  else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanInput)) request = request.eq('id', cleanInput);
  else throw new Error('Enter your order number or phone number.');
  const { data, error } = await request.order('created_at', { ascending: false });
  if (error) throw new Error('Unable to load orders. Please try again.');
  if (!data?.length) throw new Error(`No orders found matching "${query}".`);
  return data;
}

export default function OrderTrackingPage({ onBackToCatalog }) {
  const [initialQuery] = useState(() => readCustomerDetails().phone || '');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const requestRef = useRef(0);
  const [isLoading, setIsLoading] = useState(!!initialQuery);
  const [orders, setOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchOrders = useCallback((query) => {
    const request = ++requestRef.current;
    lookupOrders(query.trim()).then(data => {
      if (request === requestRef.current) setOrders(data);
    }).catch(error => {
      if (request === requestRef.current) setErrorMessage(error.message || 'Unable to load orders. Please try again.');
    }).finally(() => {
      if (request === requestRef.current) setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (initialQuery) fetchOrders(initialQuery);
    return () => { requestRef.current += 1; };
  }, [initialQuery, fetchOrders]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setErrorMessage('Please enter an Order ID or 10-digit Phone Number.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    setOrders([]);
    fetchOrders(searchQuery);
  };

  const getStepStatus = (currentStatus, stepKey, stepIndex) => {
    const statusMap = {
      placed: 0,
      dock_processing: 1,
      out_for_delivery: 2,
      delivered: 3,
    };

    const currentIdx = statusMap[currentStatus?.toLowerCase()] ?? 0;

    if (stepIndex < currentIdx) return 'completed';
    if (stepIndex === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full bg-[#FAF7EE] text-[#1D184D] min-h-screen pt-24 pb-20 font-['Sora',sans-serif]">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#1D184D]/10">
          <button
            type="button"
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#1D184D]/70 hover:text-[#1D184D] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> RETURN TO CATALOG
          </button>
          <span className="text-xs font-bold tracking-widest text-[#C2542D] uppercase">
            LIVE ORDER TRACKING
          </span>
        </div>

        <p className="text-sm text-center mb-4">Track orders placed in this browser. For older orders or another device, contact us on WhatsApp.</p>
        {/* Search Header */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#1D184D]/10 shadow-sm space-y-4 text-center max-w-2xl mx-auto mb-10">
          <div className="w-12 h-12 bg-[#1D184D]/5 rounded-full flex items-center justify-center mx-auto text-[#1D184D]">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1D184D]">Track Your Catch</h1>
            <p className="text-xs sm:text-sm text-[#1D184D]/70 mt-1">
              Enter your Order ID (e.g. #MATSYA-1024) or 10-digit Mobile Number
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Order ID or Phone Number..."
                className="w-full pl-11 pr-4 py-3.5 bg-[#FAF7EE] border border-[#1D184D]/20 rounded-full text-xs sm:text-sm font-semibold text-[#1D184D] focus:outline-none focus:border-[#1D184D] transition-colors"
              />
              <Search className="w-4 h-4 text-[#1D184D]/40 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3.5 rounded-full bg-[#1D184D] hover:bg-[#15113A] text-[#D5C582] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D5C582]" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>TRACK</span>
              )}
            </button>
          </form>

          {errorMessage && (
            <p className="text-xs font-semibold text-red-600 flex items-center justify-center gap-1.5 pt-1">
              <AlertCircle className="w-4 h-4" /> {errorMessage}
            </p>
          )}
        </div>

        {/* ORDER RESULTS */}
        {orders.length > 0 && (
          <div className="space-y-8">
            {orders.map((order) => {
  const orderIdTag = order.order_number
    ? `#MATSYA-${order.order_number}`
    : `#MATSYA-${order.id ? order.id.toString().slice(0, 6).toUpperCase() : 'XXXX'}`;

  const orderItems = Array.isArray(order.items) ? order.items : [];
  const currentStatus = order.order_status || 'placed';
  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent Order';

  return (
    <div
      key={order.id || order.created_at}
      className="bg-white rounded-3xl p-6 sm:p-8 border border-[#1D184D]/10 shadow-sm space-y-8"
    >
      {/* Order Top Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1D184D]/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-[#1D184D]">{orderIdTag}</span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#C2542D]/10 text-[#C2542D] uppercase tracking-wider">
              {currentStatus}
            </span>
          </div>
          <p className="text-xs text-[#1D184D]/60 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Placed on {orderDate}
          </p>
        </div>

        <div className="sm:text-right">
          <span className="text-xs text-[#1D184D]/60 block">Total Amount</span>
          <span className="text-lg font-black text-[#1D184D]">₹{order.total_amount || 0}</span>
          <span className="text-[10px] text-[#2B7A4B] font-bold block uppercase">
            {order.payment_method === 'UPI' ? 'Pay via UPI' : 'Cash on Delivery'} • {order.payment_status || 'Pending'}
          </span>
        </div>
      </div>

      {/* Visual Status Stepper */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#1D184D]/60 mb-6">
          Fulfillment Progress
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
          {TRACKING_STEPS.map((step, idx) => {
            const stepState = getStepStatus(currentStatus, step.key, idx);
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-4 sm:gap-3 relative z-10">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all ${
                    stepState === 'completed'
                      ? 'bg-[#2B7A4B] border-[#2B7A4B] text-white shadow-sm'
                      : stepState === 'active'
                      ? 'bg-[#1D184D] border-[#1D184D] text-[#D5C582] shadow-md ring-4 ring-[#1D184D]/10'
                      : 'bg-[#FAF7EE] border-[#1D184D]/15 text-[#1D184D]/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div>
                  <h4
                    className={`text-xs font-bold ${
                      stepState === 'pending' ? 'text-[#1D184D]/40' : 'text-[#1D184D]'
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-[#1D184D]/60 mt-0.5 leading-snug">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Address & Slot Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FAF7EE] p-5 rounded-2xl border border-[#1D184D]/10 text-xs">
        <div>
          <span className="font-bold text-[#1D184D] flex items-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5 text-[#C2542D]" /> Delivery Address
          </span>
          <p className="text-[#1D184D]/80 leading-relaxed font-semibold">
            {order.customer_name} ({order.customer_phone})<br />
            {order.delivery_address} {order.pincode ? `- ${order.pincode}` : ''}
            {order.landmark ? ` (Landmark: ${order.landmark})` : ''}
          </p>
        </div>

        <div>
          <span className="font-bold text-[#1D184D] flex items-center gap-1.5 mb-1">
            <Truck className="w-3.5 h-3.5 text-[#C2542D]" /> Delivery Slot
          </span>
          <p className="text-[#1D184D]/80 font-semibold">
            {order.order_type === 'preorder' && <span className="block font-bold text-[#C2542D]">Preorder · {formatDeliveryDate(order.delivery_date)}</span>}
            {order.delivery_slot || 'Morning Catch (7:00 AM – 10:00 AM)'}
          </p>
        </div>
      </div>

      {/* Purchased Items List */}
      <div>
        <h4 className="text-xs font-bold text-[#1D184D] uppercase tracking-wider mb-3">
          Order Basket ({orderItems.length} {orderItems.length === 1 ? 'item' : 'items'})
        </h4>

        <div className="divide-y divide-[#1D184D]/10 border-t border-b border-[#1D184D]/10">
          {orderItems.map((item, i) => (
            <div key={item.cartItemId || i} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={item.image || '/images/matsya-logo.png'}
                  alt={item.name}
                  className="w-10 h-10 object-cover rounded-xl border border-[#1D184D]/10 bg-[#FAF7EE]"
                />
                <div>
                  <span className="font-bold text-[#1D184D] block">{item.name}</span>
                  <span className="text-[11px] text-[#1D184D]/60">
                    {item.weight} • {item.cut || 'Cleaned'} x{item.quantity}
                  </span>
                </div>
              </div>
              <span className="font-bold text-[#1D184D]">₹{(item.price || 0) * (item.quantity || 1)}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
})}
          </div>
        )}

      </div>
    </div>
  );
}
