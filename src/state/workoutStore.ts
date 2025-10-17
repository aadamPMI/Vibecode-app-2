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
  duration?: number;
  notes?: string;
}

interface WorkoutStore {
  workouts: Workout[];
  addWorkout: (workout: Workout) => void;
  deleteWorkout: (id: string) => void;
  updateWorkout: (id: string, workout: Partial<Workout>) => void;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set) => ({
      workouts: [],
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
    }),
    {
      name: "workout-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
