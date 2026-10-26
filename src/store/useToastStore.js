import { create } from 'zustand';

let nextToastId = 0;

export const useToastStore = create((set) => ({
  toast: null, // { message: string, subtext?: string, type?: 'success' | 'info' }
  showToast: (message, subtext = '') => {
    set({ toast: { id: ++nextToastId, message, subtext } });
  },
  hideToast: () => set({ toast: null }),
}));