import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  Clock,
  MapPin,
  Phone,
  Truck,
  CheckCircle2,
  Fish,
  ShoppingBag,
  RefreshCw,
  Lock,
  Unlock,
  MessageCircle,
  AlertCircle,
  ChevronDown,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { getWhatsAppReceiptLink } from '../../lib/whatsapp';




const STATUS_OPTIONS = [
  { key: 'all', label: 'All Orders' },
  { key: 'placed', label: 'Placed' },
  { key: 'dock_processing', label: 'Processing' },
  { key: 'out_for_delivery', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
];

export default function AdminDashboard({ onBackToCatalog }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Never keep the passkey unlocked between visits: wipe any old saved flag,
  // and lock again whenever the dashboard is left (component unmounts).
  useEffect(() => {
    sessionStorage.removeItem('matsya_admin_auth');
    return () => sessionStorage.removeItem('matsya_admin_auth');
  }, []);


const handlePinSubmit = async (e) => {
  e.preventDefault();
  setPinError('');

  if (!pinInput.trim()) {
    setPinError('Please enter a passkey.');
    return;
  }

  try {
    // Calls the secure Supabase function on the server
    const { data: isValid, error } = await supabase.rpc('verify_admin_pin', {
      input_pin: pinInput.trim(),
    });

    if (error) throw error;

    if (isValid) {
      setIsAuthenticated(true);
      setPinError('');
      fetchOrders();
    } else {
      setPinError('Invalid Dock Passkey. Access Denied.');
      setPinInput('');
    }
  } catch (err) {
    console.error('Error verifying passkey:', err.message);
    setPinError('Error connecting to database. Try again.');
  }
};

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching admin orders:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Optimistic state update
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, order_status: newStatus } : ord))
      );
    } catch (err) {
      console.error('Failed to update status:', err.message);
      alert('Could not update status. Please check your Supabase connection.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filtered orders calculation
  const filteredOrders = orders.filter((order) => {
    const currentStatus = (order.order_status || 'placed').toLowerCase();
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (order.customer_name && order.customer_name.toLowerCase().includes(query)) ||
      (order.customer_phone && order.customer_phone.includes(query)) ||
      (order.order_number && String(order.order_number).includes(query)) ||
      (order.id && String(order.id).toLowerCase().includes(query)) ||
      (order.pincode && String(order.pincode).includes(query));

    return matchesStatus && matchesSearch;
  });

  // Calculate live summary stats
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const pendingCount = orders.filter((o) => (o.order_status || 'placed') === 'placed').length;
  const processingCount = orders.filter((o) => o.order_status === 'dock_processing').length;
  const transitCount = orders.filter((o) => o.order_status === 'out_for_delivery').length;

  // 🔒 PIN AUTHENTICATION GATE
  if (!isAuthenticated) {
    return (
      <div className="w-full bg-[#FAF7EE] text-[#1D184D] min-h-screen pt-28 pb-20 font-['Sora',sans-serif] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#1D184D]/10 shadow-xl text-center space-y-6">
          <div className="w-14 h-14 bg-[#1D184D]/5 text-[#1D184D] rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7 text-[#C2542D]" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-[#1D184D]">Dock Admin Access</h1>
            <p className="text-xs text-[#1D184D]/60 mt-1">
              Enter the Matsya Fisheries dock passkey to manage orders
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
  <input
    type="password"
    maxLength={6}
    value={pinInput}
    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
    placeholder=""
    className="w-full text-center text-sm font-bold py-3.5 bg-[#FAF7EE] border border-[#1D184D]/20 rounded-full text-[#1D184D] focus:outline-none focus:border-[#1D184D] tracking-[0.4em] placeholder:tracking-normal placeholder:text-xs placeholder:font-semibold placeholder:text-[#1D184D]/40"
  />

  {pinError && <p className="text-xs font-bold text-red-600">{pinError}</p>}

  <button
    type="submit"
    className="w-full py-4 rounded-full bg-[#1D184D] hover:bg-[#15113A] text-[#D5C582] font-bold text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md"
  >
    UNLOCK DASHBOARD
  </button>
</form>

          <button
            type="button"
            onClick={onBackToCatalog}
            className="text-xs text-[#1D184D]/60 hover:text-[#1D184D] font-bold underline"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FAF7EE] text-[#1D184D] min-h-screen pt-24 pb-20 font-['Sora',sans-serif]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1D184D]/10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToCatalog}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1D184D]/70 hover:text-[#1D184D]"
            >
              <ArrowLeft className="w-4 h-4" /> EXIT ADMIN
            </button>
            <span className="text-[#1D184D]/20">|</span>
            <span className="text-xs font-bold tracking-widest text-[#C2542D] uppercase">
              DOCK FULFILLMENT DASHBOARD
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchOrders}
              className="px-4 py-2 rounded-full bg-white border border-[#1D184D]/15 text-xs font-bold text-[#1D184D] flex items-center gap-1.5 hover:bg-[#FAF7EE] transition-colors cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('matsya_admin_auth');
                setIsAuthenticated(false);
              }}
              className="px-4 py-2 rounded-full bg-[#1D184D]/5 text-xs font-bold text-[#1D184D]/70 hover:text-[#1D184D]"
            >
              Lock
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#1D184D]/10 shadow-sm">
            <span className="text-[11px] font-bold text-[#1D184D]/60 uppercase tracking-wider block">Total Revenue</span>
            <span className="text-2xl font-black text-[#1D184D] mt-1 block">₹{totalRevenue.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-[#2B7A4B] font-bold mt-1 block">{orders.length} total orders</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#1D184D]/10 shadow-sm">
            <span className="text-[11px] font-bold text-[#C2542D] uppercase tracking-wider block">New Placed Orders</span>
            <span className="text-2xl font-black text-[#C2542D] mt-1 block">{pendingCount}</span>
            <span className="text-[10px] text-[#1D184D]/50 font-semibold mt-1 block">Requires dock prep</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#1D184D]/10 shadow-sm">
            <span className="text-[11px] font-bold text-[#1D184D] uppercase tracking-wider block">Dock Processing</span>
            <span className="text-2xl font-black text-[#1D184D] mt-1 block">{processingCount}</span>
            <span className="text-[10px] text-[#1D184D]/50 font-semibold mt-1 block">Gutted & RO washed</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#1D184D]/10 shadow-sm">
            <span className="text-[11px] font-bold text-[#2B7A4B] uppercase tracking-wider block">Out for Delivery</span>
            <span className="text-2xl font-black text-[#2B7A4B] mt-1 block">{transitCount}</span>
            <span className="text-[10px] text-[#2B7A4B] font-semibold mt-1 block">Riders in transit</span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-[#1D184D]/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setStatusFilter(opt.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === opt.key
                    ? 'bg-[#1D184D] text-[#D5C582] shadow-sm'
                    : 'text-[#1D184D]/70 hover:bg-[#FAF7EE]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Name, Phone, Order #..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF7EE] border border-[#1D184D]/15 rounded-xl text-xs font-semibold text-[#1D184D] focus:outline-none focus:border-[#1D184D]"
            />
            <Search className="w-3.5 h-3.5 text-[#1D184D]/40 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#1D184D]/10 space-y-2">
            <ShoppingBag className="w-10 h-10 text-[#1D184D]/20 mx-auto" />
            <h3 className="text-base font-bold text-[#1D184D]">No orders match your filter</h3>
            <p className="text-xs text-[#1D184D]/50">Try switching tabs or clearing your search term.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const orderIdTag = order.order_number
                ? `#MATSYA-${order.order_number}`
                : `#MATSYA-${order.id ? String(order.id).slice(0, 6).toUpperCase() : 'XXXX'}`;

              const currentStatus = order.order_status || 'placed';
              const items = Array.isArray(order.items) ? order.items : [];
              const orderDate = order.created_at
                ? new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recent';

              const waMessage = encodeURIComponent(
                `Hello ${order.customer_name}, update on your Matsya order ${orderIdTag}: Current status is "${currentStatus.toUpperCase()}". Thank you!`
              );

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 border border-[#1D184D]/10 shadow-sm space-y-6"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1D184D]/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-[#1D184D]">{orderIdTag}</span>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#1D184D]/10 text-[#1D184D] uppercase">
                          {currentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-[#1D184D]/60 mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Placed on {orderDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={getWhatsAppReceiptLink(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                        >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" /> Send Dispatch Receipt
                        </a>

                      <span className="text-lg font-black text-[#1D184D]">₹{order.total_amount}</span>
                    </div>
                  </div>

                  {/* Customer Info & Slot */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FAF7EE] p-4 rounded-2xl text-xs">
                    <div>
                      <span className="font-bold text-[#1D184D] block mb-1">Customer & Shipping</span>
                      <p className="font-bold text-[#1D184D]">{order.customer_name} ({order.customer_phone})</p>
                      <p className="text-[#1D184D]/80 mt-0.5 leading-snug">
                        {order.delivery_address} - <span className="font-bold">{order.pincode}</span>
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-[#1D184D] block mb-1">Fulfillment Details</span>
                      <p className="text-[#1D184D]/80 font-semibold">Slot: {order.delivery_slot || 'Morning Catch'}</p>
                      <p className="text-[#1D184D]/80 font-semibold mt-0.5">Payment: {order.payment_method === 'UPI' ? 'Pay via UPI' : 'Cash on Delivery'} ({order.payment_status || 'pending'})</p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1D184D]/60 block mb-2">
                      Catch Items ({items.length})
                    </span>
                    <div className="divide-y divide-[#1D184D]/10">
                      {items.map((item, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between text-xs">
                          <span className="font-bold text-[#1D184D]">
                            {item.name} <span className="text-[#1D184D]/50 font-normal">({item.weight} • {item.cut || 'Cleaned'}) x{item.quantity}</span>
                          </span>
                          <span className="font-bold text-[#1D184D]">₹{(item.price || 0) * (item.quantity || 1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Action Status Toggles */}
                  <div className="pt-2 border-t border-[#1D184D]/10 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-[#1D184D]/70">Change Status:</span>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                      {[
                        { key: 'placed', label: 'Placed' },
                        { key: 'dock_processing', label: 'Processing' },
                        { key: 'out_for_delivery', label: 'In Transit' },
                        { key: 'delivered', label: 'Delivered' },
                      ].map((st) => (
                        <button
                          key={st.key}
                          type="button"
                          disabled={updatingOrderId === order.id}
                          onClick={() => handleUpdateStatus(order.id, st.key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === st.key
                              ? 'bg-[#1D184D] text-[#D5C582] ring-2 ring-[#1D184D]'
                              : 'bg-[#FAF7EE] text-[#1D184D]/70 hover:bg-[#1D184D]/10'
                          }`}
                        >
                          {st.label}
                        </button>
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