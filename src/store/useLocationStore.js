import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLocationStore = create(
  persist(
    (set) => ({
      location: {
        area: '',
        pincode: '',
        isVerified: false,
      },

      setLocation: (newLocation) =>
        set({
          location: {
            ...newLocation,
            isVerified: true,
          },
        }),
    }),
    {
      name: 'matsya-location-storage',
    }
  )
);