import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FitnessGoals {
  targetWeight?: number;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFats?: number;
  weeklyWorkouts?: number;
  fitnessLevel?: "beginner" | "intermediate" | "advanced";
  goal?: "lose_weight" | "gain_muscle" | "maintain" | "general_fitness";
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

interface SettingsStore {
  theme: "light" | "dark";
  profileSettings: ProfileSettings;
  privacySettings: PrivacySettings;
  fitnessGoals: FitnessGoals;
  setTheme: (theme: "light" | "dark") => void;
  updateProfileSettings: (settings: Partial<ProfileSettings>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  updateFitnessGoals: (goals: Partial<FitnessGoals>) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: "light",
      profileSettings: {
        name: "User",
      },
      privacySettings: {
        shareProgress: true,
        publicProfile: true,
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
