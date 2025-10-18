import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface WeightEntry {
  id: string;
  weight: number; // in kg
  date: string; // ISO date string
  timestamp: number;
}

interface WeightStore {
  entries: WeightEntry[];
  addEntry: (weight: number, date?: Date) => void;
  deleteEntry: (id: string) => void;
  updateEntry: (id: string, weight: number, date: Date) => void;
  getEntriesSorted: () => WeightEntry[];
}

export const useWeightStore = create<WeightStore>()(
  persist(
    (set, get) => ({
      entries: [],
      
      addEntry: (weight: number, date?: Date) => {
        const entryDate = date || new Date();
        const newEntry: WeightEntry = {
          id: `weight-${Date.now()}-${Math.random()}`,
          weight,
          date: entryDate.toISOString(),
          timestamp: entryDate.getTime(),
        };
        
        set((state) => ({
          entries: [...state.entries, newEntry],
        }));
      },
      
      deleteEntry: (id: string) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }));
      },
      
      updateEntry: (id: string, weight: number, date: Date) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? { ...entry, weight, date: date.toISOString(), timestamp: date.getTime() }
              : entry
          ),
        }));
      },
      
      getEntriesSorted: () => {
        return [...get().entries].sort((a, b) => a.timestamp - b.timestamp);
      },
    }),
    {
      name: "weight-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
