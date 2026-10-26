import { formatDeliveryDate } from '../services/preorder.js';
/**
 * Helper utilities for WhatsApp messaging across Matsya Fisheries
 */

/**
 * Generates a pre-filled WhatsApp link with a formatted dispatch receipt.
 * @param {Object} order - Order object from Supabase `orders` table
 * @returns {string} - Direct wa.me link with encoded receipt message
 */
export const getWhatsAppReceiptLink = (order, siteUrl = import.meta.env?.VITE_SITE_URL || 'https://matsya-fisheries.vercel.app') => {
  if (!order) return '#';

  const orderIdTag = order.order_number
    ? `#MATSYA-${order.order_number}`
    : `#MATSYA-${order.id ? String(order.id).slice(0, 6).toUpperCase() : 'XXXX'}`;

  const trackingUrl = new URL('/#track', siteUrl).href;
  const paymentLabel = `${order.payment_method === 'UPI' ? 'UPI on Delivery' : 'Cash on Delivery'} - ${String(order.payment_status || 'pending').toLowerCase() === 'paid' ? 'Paid' : 'Pending'}`;

  const currentStatus = (order.order_status || 'placed').toUpperCase();
  const items = Array.isArray(order.items) ? order.items : [];

  const itemsList =
    items.length > 0
      ? items
          .map(
            (item) =>
              `• *${item.name}* (${item.weight || 'Standard'} | ${item.cut || 'Cleaned'}) x${item.quantity || 1} — ₹${(item.price || 0) * (item.quantity || 1)}`
          )
          .join('\n')
      : '• *Fresh Catch Items*';

  const message = `🌊 *MATSYA FISHERIES — DISPATCH RECEIPT* 🌊

*Order ID:* ${orderIdTag}${order.order_type === 'preorder' ? `\n*Preorder delivery date:* ${formatDeliveryDate(order.delivery_date)}` : ''}
*Customer:* ${order.customer_name || 'Valued Customer'}
*Phone:* ${order.customer_phone || ''}

🛒 *CATCH BASKET:*
${itemsList}

💵 *Total Amount:* ₹${order.total_amount || 0} (${paymentLabel})
📍 *Delivery Address:* ${order.delivery_address || 'N/A'}${order.pincode ? ` - ${order.pincode}` : ''}${order.landmark ? ` (Landmark: ${order.landmark})` : ''}
🚚 *Delivery Slot:* ${order.delivery_slot || 'Morning Catch'}
📊 *Order Status:* *${currentStatus}*

🔗 *Live Order Tracking:* ${trackingUrl}

Thank you for choosing Matsya Fisheries! Fresh dock catches delivered daily. 🐟`;

  const cleanPhone = String(order.customer_phone || '').replace(/\D/g, '');
  const phone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  if (!/^91[6-9][0-9]{9}$/.test(phone)) return '#';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};