import { create } from 'zustand';

interface ToastStore {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  message: '',
  type: 'info',
  visible: false,
  showToast: (message, type) => {
    set({ message, type, visible: true });
    setTimeout(() => {
      set({ visible: false });
    }, 3000);
  },
  hideToast: () => set({ visible: false }),
}));
