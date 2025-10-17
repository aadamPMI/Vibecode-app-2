import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  date: string;
  meal?: "breakfast" | "lunch" | "dinner" | "snack";
}

interface NutritionStore {
  foodLog: FoodItem[];
  addFoodItem: (item: FoodItem) => void;
  deleteFoodItem: (id: string) => void;
  updateFoodItem: (id: string, item: Partial<FoodItem>) => void;
  getFoodForDate: (date: string) => FoodItem[];
}

export const useNutritionStore = create<NutritionStore>()(
  persist(
    (set, get) => ({
      foodLog: [],
      addFoodItem: (item) =>
        set((state) => ({ foodLog: [item, ...state.foodLog] })),
      deleteFoodItem: (id) =>
        set((state) => ({
          foodLog: state.foodLog.filter((f) => f.id !== id),
        })),
      updateFoodItem: (id, updatedItem) =>
        set((state) => ({
          foodLog: state.foodLog.map((f) =>
            f.id === id ? { ...f, ...updatedItem } : f
          ),
        })),
      getFoodForDate: (date) => {
        return get().foodLog.filter((f) => f.date === date);
      },
    }),
    {
      name: "nutrition-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
