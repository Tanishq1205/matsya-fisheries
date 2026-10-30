import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useToastStore } from './useToastStore.js';
import { isPreorderProduct, validatePreorderDate } from '../services/preorder.js';
import { clearCheckoutRequests } from '../services/checkoutRequest.js';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      isOpen: false,
      isCheckoutOpen: false,
      deliverySlot: 'Morning Catch (7:00 AM – 10:00 AM)',

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      openCheckout: () => set({ isOpen: false, isCheckoutOpen: true }),
      closeCheckout: () => set({ isCheckoutOpen: false }),

      setDeliverySlot: (slot) => set({ deliverySlot: slot }),

      addItem: (product, weight = '1kg', cut = null, quantity = 1, schedule = null) => {
        if (!product) return;
        if (product.in_stock === false || product.is_active === false) {
          useToastStore.getState().showToast('Product unavailable', 'Please choose another catch.');
          return;
        }
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) return;
        const orderType = schedule ? 'preorder' : 'standard';
        const deliveryDate = schedule?.deliveryDate || null;
        if (schedule) {
          if (!isPreorderProduct(product)) return false;
          try { validatePreorderDate(deliveryDate, schedule.noticeDays); } catch (error) {
            useToastStore.getState().showToast('Check preorder date', error.message);
            return false;
          }
        }
        const basket = get().cart;
        if (basket.length && ((basket[0].orderType || 'standard') !== orderType || (basket[0].deliveryDate || null) !== deliveryDate)) {
          useToastStore.getState().showToast('Separate delivery dates', 'Complete or clear your current basket before starting a different delivery.');
          return false;
        }
        if (!get().cart.length) {
          // A new basket after a completed/cleared basket is a new purchase.
          // Keep keys through success so queued duplicate submissions still deduplicate.
          clearCheckoutRequests();
        }

        const normWeight = (weight || '1kg').toString().toLowerCase();
        const is500g = normWeight.includes('500');

        let price = 0;
        if (is500g) {
          price = Number(
            product.price_500g ??
            product.price500g ??
            product.price_500 ??
            product.price ??
            0
          );
        } else {
          price = Number(
            product.price_1kg ??
            product.price1kg ??
            product.price_1000g ??
            product.price1000g ??
            product.price_1000 ??
            product.price ??
            0
          );
        }

        if (!Number.isFinite(price) || price <= 0) {
          useToastStore.getState().showToast('Pack unavailable', 'Please choose a pack with a listed price.');
          return false;
        }
        const productId = product.productId || product.id;
        const selectedCut = product.cut || cut || product.standard_cut || 'Cleaned';
        const cartItemId = `${productId}-${is500g ? '500g' : '1000g'}-${selectedCut}`;
        const existingItem = get().cart.find(item => item.cartItemId === cartItemId);
        if ((existingItem?.quantity || 0) + quantity > 999) {
          useToastStore.getState().showToast('Maximum pack quantity reached', 'Please adjust the quantity in your basket.');
          return;
        }

        set((state) => {
          const currentCart = Array.isArray(state.cart) ? state.cart : [];
          const existingIndex = currentCart.findIndex(
            (item) => item.cartItemId === cartItemId
          );

          if (existingIndex > -1) {
            const updatedCart = [...currentCart];
            updatedCart[existingIndex] = {
              ...updatedCart[existingIndex],
              price: price || updatedCart[existingIndex].price || 0,
              quantity: updatedCart[existingIndex].quantity + quantity,
            };
            return { cart: updatedCart, isOpen: false };
          }

          const newItem = {
            cartItemId,
            id: productId,
            productId,
            name: product.name,
            marathiName: product.marathiName || '',
            image: product.image || product.image_url || '/images/matsya-logo.png',
            weight: is500g ? '500g' : '1000g',
            cut: selectedCut,
            price: price || 0,
            quantity,
            orderType,
            deliveryDate,
          };

          return { cart: [...currentCart, newItem], isOpen: false };
        });

        const marathiText = product.marathiName ? ` (${product.marathiName})` : '';
        const weightLabel = is500g ? '500g Pack' : '1kg Pack';

        if (useToastStore.getState()?.showToast) {
          useToastStore.getState().showToast(
            `${product.name}${marathiText}`,
            `${quantity} x ${weightLabel} \u2022 \u20b9${price * quantity}`
          );
        }
        return true;
      },

      updateQuantity: (cartItemId, delta) => {
        if (!Number.isInteger(delta)) return;
        set((state) => {
          const currentCart = Array.isArray(state.cart) ? state.cart : [];
          const updatedCart = currentCart
            .map((item) => {
              if (item.cartItemId === cartItemId) {
                const newQty = Math.min(999, item.quantity + delta);
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter(Boolean);

          return { cart: updatedCart };
        });
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          cart: (Array.isArray(state.cart) ? state.cart : []).filter(
            (item) => item.cartItemId !== cartItemId
          ),
        }));
      },

      clearCart: () => set({ cart: [] }),

      getCartTotal: () => {
        const cart = get().cart || [];
        return cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
      },

      getItemCount: () => {
        const cart = get().cart || [];
        return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      },
    }),
    {
      name: 'matsya-cart-storage',
      // ONLY persist cart items and delivery slot. UI modal states always start as false.
      partialize: (state) => ({
        cart: state.cart,
        deliverySlot: state.deliverySlot,
      }),
    }
  )
);
