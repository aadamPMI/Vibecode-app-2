import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCalorieTargetStore } from "./calorieTargetStore";

export interface FitnessGoals {
  targetWeight?: number;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFats?: number;
  weeklyWorkouts?: number;
  fitnessLevel?: "beginner" | "intermediate" | "advanced";
  goal?: "lose_weight" | "build_muscle" | "improve_endurance" | "general_fitness" | "strength_training";
}

export interface ProfileSettings {
  name: string;
  age?: number;
  height?: number;
  weight?: number;
  gender?: "male" | "female" | "other";
  email?: string;
}

export interface PrivacySettings {
  shareProgress: boolean;
  publicProfile: boolean;
}

export interface PreferencesSettings {
  badgeCelebrations: boolean;
  liveActivity: boolean;
  addBurnedCalories: boolean;
  rolloverCalories: boolean;
  autoAdjustMacros: boolean;
}

interface SettingsStore {
  theme: "light" | "dark" | "system";
  profileSettings: ProfileSettings;
  privacySettings: PrivacySettings;
  preferencesSettings: PreferencesSettings;
  fitnessGoals: FitnessGoals;
  setTheme: (theme: "light" | "dark" | "system") => void;
  updateProfileSettings: (settings: Partial<ProfileSettings>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  updatePreferencesSettings: (settings: Partial<PreferencesSettings>) => void;
  updateFitnessGoals: (goals: Partial<FitnessGoals>) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: "dark",
      profileSettings: {
        name: "User",
      },
      privacySettings: {
        shareProgress: true,
        publicProfile: true,
      },
      preferencesSettings: {
        badgeCelebrations: false,
        liveActivity: false,
        addBurnedCalories: false,
        rolloverCalories: true,
        autoAdjustMacros: true,
      },
      fitnessGoals: {
        targetCalories: 2000,
        targetProtein: 150,
        targetCarbs: 200,
        targetFats: 65,
        weeklyWorkouts: 4,
      },
      setTheme: (theme) => set({ theme }),
      updateProfileSettings: (settings) =>
        set((state) => ({
          profileSettings: { ...state.profileSettings, ...settings },
        })),
      updatePrivacySettings: (settings) =>
        set((state) => ({
          privacySettings: { ...state.privacySettings, ...settings },
        })),
      updatePreferencesSettings: (settings) =>
        set((state) => ({
          preferencesSettings: { ...state.preferencesSettings, ...settings },
        })),
      updateFitnessGoals: (goals) =>
        set((state) => ({
          fitnessGoals: { ...state.fitnessGoals, ...goals },
        })),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
