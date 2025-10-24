import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Represents a versioned calorie target entry
 * Each entry applies from effective_from date forward until the next version
 */
export interface CalorieTargetVersion {
  id: string;
  effective_from: string; // ISO date string (YYYY-MM-DD) in user's local timezone
  target_kcal: number;
  target_protein?: number;
  target_carbs?: number;
  target_fats?: number;
  created_at: string; // ISO timestamp
}

interface CalorieTargetStore {
  versions: CalorieTargetVersion[];
  timezone: string;

  /**
   * Save a new calorie target version effective from today
   * This does NOT modify past entries - it creates a new version
   */
  saveCalorieTarget: (
    targetKcal: number,
    targetProtein?: number,
    targetCarbs?: number,
    targetFats?: number,
    effectiveDate?: Date
  ) => void;

  /**
   * Get the calorie target for a specific date
   * Returns the most recent version where effective_from <= date
   */
  getTargetForDate: (date: Date | string) => CalorieTargetVersion | null;

  /**
   * Get all versions (for debugging/history)
   */
  getAllVersions: () => CalorieTargetVersion[];

  /**
   * Update timezone (call when user changes timezone)
   */
  setTimezone: (tz: string) => void;

  /**
   * Initialize with a default target if no versions exist
   */
  initializeDefaultTarget: (
    targetKcal: number,
    targetProtein?: number,
    targetCarbs?: number,
    targetFats?: number
  ) => void;
}

/**
 * Get local date string (YYYY-MM-DD) in user's timezone
 */
export const getLocalDateString = (date: Date, timezone?: string): string => {
  // Format date in user's local timezone as YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Parse a date string or Date object to a normalized date string
 */
export const normalizeDateString = (date: Date | string): string => {
  if (typeof date === "string") {
    // If already in YYYY-MM-DD format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Otherwise parse and normalize
    return getLocalDateString(new Date(date));
  }
  return getLocalDateString(date);
};

export const useCalorieTargetStore = create<CalorieTargetStore>()(
  persist(
    (set, get) => ({
      versions: [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",

      saveCalorieTarget: (targetKcal, targetProtein, targetCarbs, targetFats, effectiveDate) => {
        const today = effectiveDate || new Date();
        const effectiveFromDate = getLocalDateString(today, get().timezone);

        // Check if there's already a version for this exact date
        const existingVersionIndex = get().versions.findIndex(
          (v) => v.effective_from === effectiveFromDate
        );

        const newVersion: CalorieTargetVersion = {
          id: `${effectiveFromDate}-${Date.now()}`,
          effective_from: effectiveFromDate,
          target_kcal: targetKcal,
          target_protein: targetProtein,
          target_carbs: targetCarbs,
          target_fats: targetFats,
          created_at: new Date().toISOString(),
        };

        set((state) => {
          let newVersions: CalorieTargetVersion[];

          if (existingVersionIndex >= 0) {
            // Replace existing version for this date (keep only the latest)
            newVersions = [...state.versions];
            newVersions[existingVersionIndex] = newVersion;
          } else {
            // Add new version
            newVersions = [...state.versions, newVersion];
          }

          // Sort by effective_from date (oldest first)
          newVersions.sort((a, b) =>
            a.effective_from.localeCompare(b.effective_from)
          );

          return { versions: newVersions };
        });
      },

      getTargetForDate: (date) => {
        const dateStr = normalizeDateString(date);
        const versions = get().versions;

        if (versions.length === 0) {
          return null;
        }

        // Find all versions where effective_from <= dateStr
        const applicableVersions = versions.filter(
          (v) => v.effective_from <= dateStr
        );

        if (applicableVersions.length === 0) {
          return null;
        }

        // Return the most recent applicable version
        // (already sorted, so take the last one)
        return applicableVersions[applicableVersions.length - 1];
      },

      getAllVersions: () => {
        return get().versions;
      },

      setTimezone: (tz) => {
        set({ timezone: tz });
      },

      initializeDefaultTarget: (targetKcal, targetProtein, targetCarbs, targetFats) => {
        const versions = get().versions;

        // Only initialize if no versions exist
        if (versions.length === 0) {
          const today = new Date();
          const effectiveFromDate = getLocalDateString(today, get().timezone);

          const defaultVersion: CalorieTargetVersion = {
            id: `default-${Date.now()}`,
            effective_from: effectiveFromDate,
            target_kcal: targetKcal,
            target_protein: targetProtein,
            target_carbs: targetCarbs,
            target_fats: targetFats,
            created_at: new Date().toISOString(),
          };

          set({ versions: [defaultVersion] });
        }
      },
    }),
    {
      name: "calorie-target-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
