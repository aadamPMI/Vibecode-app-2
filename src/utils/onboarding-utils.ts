import { OnboardingData } from "../state/onboardingStore";
import { WorkoutPlanResult } from "../api/onboarding-ai";
import { useSettingsStore } from "../state/settingsStore";
import { useAuthStore } from "../state/authStore";

/**
 * Save onboarding results to main app stores
 */
export function saveOnboardingToStores(
  data: OnboardingData,
  aiResults: WorkoutPlanResult
): void {
  const { updateProfileSettings, updateFitnessGoals } = useSettingsStore.getState();
  const { completeOnboarding } = useAuthStore.getState();

  // Update profile settings
  updateProfileSettings({
    age: data.age,
    gender: data.gender,
    height: data.heightCm,
    weight: data.currentWeightKg,
  });

  // Update fitness goals
  updateFitnessGoals({
    targetWeight: data.targetWeightKg,
    targetCalories: aiResults.dailyCalories,
    targetProtein: aiResults.protein,
    targetCarbs: aiResults.carbs,
    targetFats: aiResults.fats,
    weeklyWorkouts: data.trainingFrequency,
    goal: data.primaryGoal,
    fitnessLevel:
      data.trainingIntensity === "light"
        ? "beginner"
        : data.trainingIntensity === "intense"
        ? "advanced"
        : "intermediate",
  });

  // Mark onboarding as complete
  completeOnboarding();
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Convert feet and inches to centimeters
 */
export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}

/**
 * Convert centimeters to feet and inches
 */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

/**
 * Convert kilograms to pounds
 */
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462);
}

/**
 * Convert pounds to kilograms
 */
export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.20462);
}

/**
 * Validate if weight goal is safe
 */
export function isWeightGoalSafe(
  currentKg: number,
  targetKg: number,
  timeframeDays: number
): { safe: boolean; message?: string } {
  const weightDiff = Math.abs(targetKg - currentKg);
  const weeksToGoal = timeframeDays / 7;
  const kgPerWeek = weightDiff / weeksToGoal;

  if (kgPerWeek > 1.0 && targetKg < currentKg) {
    return {
      safe: false,
      message: "Weight loss faster than 1kg/week may not be sustainable or healthy.",
    };
  }

  if (kgPerWeek > 0.5 && targetKg > currentKg) {
    return {
      safe: false,
      message: "Weight gain faster than 0.5kg/week may include excess fat gain.",
    };
  }

  return { safe: true };
}
