import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useToastStore } from './useToastStore';

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

      addItem: (product, weight = '1kg', cut = 'Cleaned & RO Washed') => {
        if (!product) return;

        const normWeight = (weight || '1kg').toString().toLowerCase();
        const is500g = normWeight.includes('500');

        let price = 0;
        if (is500g) {
          price = Number(
            product.price_500g ??
            product.price500g ??
            product.price_500 ??
            (product.price_1kg ? Math.round(Number(product.price_1kg) / 2) : null) ??
            (product.price1kg ? Math.round(Number(product.price1kg) / 2) : null) ??
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

        const cartItemId = `${product.id}-${is500g ? '500g' : '1000g'}`;

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
              quantity: updatedCart[existingIndex].quantity + 1,
            };
            return { cart: updatedCart, isOpen: false };
          }

          const newItem = {
            cartItemId,
            id: product.id,
            name: product.name,
            marathiName: product.marathiName || '',
            image: product.image || '/images/placeholder-fish.jpg',
            weight: is500g ? '500g' : '1000g',
            cut: product.standard_cut || cut,
            price: price || 0,
            quantity: 1,
          };

          return { cart: [...currentCart, newItem], isOpen: false };
        });

        const marathiText = product.marathiName ? ` (${product.marathiName})` : '';
        const weightLabel = is500g ? '500g Pack' : '1kg Pack';

        if (useToastStore.getState()?.showToast) {
          useToastStore.getState().showToast(
            `${product.name}${marathiText}`,
            `${weightLabel} • ₹${price}`
          );
        }
      },

      updateQuantity: (cartItemId, delta) => {
        set((state) => {
          const currentCart = Array.isArray(state.cart) ? state.cart : [];
          const updatedCart = currentCart
            .map((item) => {
              if (item.cartItemId === cartItemId) {
                const newQty = item.quantity + delta;
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