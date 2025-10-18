import { create } from "zustand";

export interface OnboardingData {
  dateOfBirth?: Date;
  age?: number;
  gender?: "male" | "female" | "other";
  heightCm?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  timeframe?: "1_month" | "3_months" | "6_months" | "1_year" | "custom";
  customTimeframeDays?: number;
  primaryGoal?: "lose_weight" | "build_muscle" | "improve_endurance" | "general_fitness" | "strength_training";
  trainingFrequency?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  trainingIntensity?: "light" | "moderate" | "intense";
  injuries?: string;
}

interface OnboardingStore {
  data: OnboardingData;
  updateOnboardingData: (newData: Partial<OnboardingData>) => void;
  clearOnboardingData: () => void;
  getOnboardingData: () => OnboardingData;
}

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  data: {},
  updateOnboardingData: (newData) =>
    set((state) => ({
      data: { ...state.data, ...newData },
    })),
  clearOnboardingData: () => set({ data: {} }),
  getOnboardingData: () => get().data,
}));
