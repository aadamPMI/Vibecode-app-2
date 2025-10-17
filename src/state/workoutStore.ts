import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Exercise {
  id: string;
  name: string;
  sets: {
    id: string;
    reps: number;
    weight: number;
  }[];
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
  duration?: number; // in minutes
  notes?: string;
}

export interface PersonalRecord {
  id: string;
  exercise: string;
  weight: number;
  unit: "kg" | "lbs";
  date: string;
  notes?: string;
}

interface WorkoutStore {
  workouts: Workout[];
  personalRecords: PersonalRecord[];
  bodyWeight: number;
  bodyWeightUnit: "kg" | "lbs";
  featuredPRs: string[]; // Array of PR IDs to feature on profile
  addWorkout: (workout: Workout) => void;
  deleteWorkout: (id: string) => void;
  updateWorkout: (id: string, workout: Partial<Workout>) => void;
  addPersonalRecord: (pr: PersonalRecord) => void;
  deletePersonalRecord: (id: string) => void;
  updateBodyWeight: (weight: number, unit: "kg" | "lbs") => void;
  setFeaturedPRs: (prIds: string[]) => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set) => ({
      workouts: [],
      personalRecords: [],
      bodyWeight: 70,
      bodyWeightUnit: "kg",
      featuredPRs: [],
      addWorkout: (workout) =>
        set((state) => ({ workouts: [workout, ...state.workouts] })),
      deleteWorkout: (id) =>
        set((state) => ({
          workouts: state.workouts.filter((w) => w.id !== id),
        })),
      updateWorkout: (id, updatedWorkout) =>
        set((state) => ({
          workouts: state.workouts.map((w) =>
            w.id === id ? { ...w, ...updatedWorkout } : w
          ),
        })),
      addPersonalRecord: (pr) =>
        set((state) => ({ personalRecords: [pr, ...state.personalRecords] })),
      deletePersonalRecord: (id) =>
        set((state) => ({
          personalRecords: state.personalRecords.filter((pr) => pr.id !== id),
        })),
      updateBodyWeight: (weight, unit) =>
        set({ bodyWeight: weight, bodyWeightUnit: unit }),
      setFeaturedPRs: (prIds) =>
        set({ featuredPRs: prIds.slice(0, 5) }), // Max 5
    }),
    {
      name: "workout-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
