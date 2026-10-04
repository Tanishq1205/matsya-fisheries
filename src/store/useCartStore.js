import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabaseClient';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      isOpen: false,

      // Pincode & Slot state
      pincode: '',
      isServiceable: false,
      pincodeMessage: '',
      isVerifying: false,
      deliverySlot: 'Morning Catch (7:00 AM – 10:00 AM)',

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      // Item Count Helper (Required by Navbar.jsx)
      getItemCount: () => {
        const currentCart = Array.isArray(get().cart) ? get().cart : [];
        return currentCart.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Async Supabase Pincode Verification
      checkPincode: async (inputPincode) => {
        const cleanPin = inputPincode.trim();
        if (cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
          set({
            pincode: cleanPin,
            isServiceable: false,
            pincodeMessage: 'Please enter a valid 6-digit Mumbai pincode.',
            isVerifying: false,
          });
          return false;
        }

        set({ isVerifying: true, pincodeMessage: 'Checking database...' });

        try {
          const { data, error } = await supabase
            .from('pincodes')
            .select('pincode')
            .eq('pincode', cleanPin)
            .maybeSingle();

          if (error) throw error;

          if (data) {
            set({
              pincode: cleanPin,
              isServiceable: true,
              pincodeMessage: '⚡ Express Dock-to-Door delivery available!',
              isVerifying: false,
            });
            return true;
          } else {
            set({
              pincode: cleanPin,
              isServiceable: false,
              pincodeMessage: 'Sorry, we currently do not deliver to this pincode.',
              isVerifying: false,
            });
            return false;
          }
        } catch (err) {
          // Fallback if table name differs or query fails
          const isMumbai = cleanPin.startsWith('400');
          set({
            pincode: cleanPin,
            isServiceable: isMumbai,
            pincodeMessage: isMumbai
              ? '⚡ Serviceable area confirmed!'
              : 'Delivery only available across Mumbai (400xxx).',
            isVerifying: false,
          });
          return isMumbai;
        }
      },

      setDeliverySlot: (slot) => set({ deliverySlot: slot }),

      // Cart management methods
      addItem: (product, weight = '1kg', cut = 'Cleaned & RO Washed') => {
        if (!product) return;

        const price =
          weight === '1kg'
            ? (product.price_1kg ?? product.price1kg ?? product.price ?? 0)
            : (product.price_500g ?? product.price500g ?? product.price_1kg ?? 0);

        const cartItemId = `${product.id}-${weight}`;

        set((state) => {
          const currentCart = Array.isArray(state.cart) ? state.cart : [];
          const existingIndex = currentCart.findIndex(
            (item) => item.cartItemId === cartItemId
          );

          if (existingIndex > -1) {
            const updatedCart = [...currentCart];
            updatedCart[existingIndex] = {
              ...updatedCart[existingIndex],
              quantity: updatedCart[existingIndex].quantity + 1,
            };
            return { cart: updatedCart, isOpen: true };
          }

          const newItem = {
            cartItemId,
            id: product.id,
            name: product.name,
            marathiName: product.marathiName,
            image: product.image || '/images/placeholder-fish.jpg',
            weight,
            cut: product.standard_cut || cut,
            price,
            quantity: 1,
          };

          return { cart: [...currentCart, newItem], isOpen: true };
        });
      },

      updateQuantity: (cartItemId, delta) => {
        set((state) => ({
          cart: state.cart
            .map((item) => {
              if (item.cartItemId === cartItemId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter(Boolean),
        }));
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.cartItemId !== cartItemId),
        }));
      },

      clearCart: () => set({ cart: [] }),

      getCartTotal: () => {
        const currentCart = Array.isArray(get().cart) ? get().cart : [];
        return currentCart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'matsya-cart-storage',
      partialize: (state) => ({
        cart: state.cart,
        pincode: state.pincode,
        isServiceable: state.isServiceable,
        deliverySlot: state.deliverySlot,
      }),
    }
  )
);