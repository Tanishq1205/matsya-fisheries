import { useCartStore } from '../../store/useCartStore';
import CheckoutPage from './CheckoutPage';

// Compatibility entry point: use the same validated checkout as the main page.
export default function CheckoutModal() {
  const isOpen = useCartStore(state => state.isCheckoutOpen);
  const close = useCartStore(state => state.closeCheckout);
  return isOpen ? <CheckoutPage onBackToCatalog={close} /> : null;
}
