import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toast: null, // { message: string, subtext?: string, type?: 'success' | 'info' }
  showToast: (message, subtext = '') => {
    set({ toast: { message, subtext } });
  },
  hideToast: () => set({ toast: null }),
}));