import { create } from "zustand";

export interface OnboardingData {
  // Personal Info
  dateOfBirth?: Date;
  age?: number;
  gender?: "male" | "female" | "other";
  heightCm?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;

  // Workout Info
  workoutFrequency?: "0-2" | "3-5" | "6+";
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  equipment?: string[]; // multi-select: bodyweight, dumbbells, barbell, machines, bands, kettlebells, pullup_bar

  // Goals
  primaryGoal?: "build_muscle" | "get_stronger" | "lose_fat" | "improve_endurance";
  bodyFocus?: "strength" | "hypertrophy" | "balanced"; // slider value

  // Existing Plans
  hasExistingPlan?: boolean;
  existingPlanType?: "diet" | "training" | "community" | "none";

  // Legacy fields (keeping for backwards compatibility)
  timeframe?: "1_month" | "3_months" | "6_months" | "1_year" | "custom";
  customTimeframeDays?: number;
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
