import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthStore {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  userId: string | null;
  email: string | null;
  setAuthenticated: (status: boolean) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setUserId: (id: string) => void;
  setEmail: (email: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      userId: null,
      email: null,
      setAuthenticated: (status) => set({ isAuthenticated: status }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetOnboarding: () => set({ hasCompletedOnboarding: false }),
      setUserId: (id) => set({ userId: id }),
      setEmail: (email) => set({ email }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
