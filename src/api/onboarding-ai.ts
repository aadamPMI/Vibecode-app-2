import { OnboardingData } from "../state/onboardingStore";
import { AIMessage } from "../types/ai";
import { getAnthropicTextResponse } from "./chat-service";

export interface WorkoutPlanResult {
  dailyCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  workoutSplit: string[];
  estimatedWeeks: number;
  additionalNotes?: string;
}

/**
 * Calculate BMR using Harris-Benedict equation
 */
function calculateBMR(weightKg: number, heightCm: number, age: number, gender: string): number {
  if (gender === "male") {
    return 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
  }
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
function calculateTDEE(bmr: number, frequency: number, intensity: string): number {
  let activityMultiplier = 1.2; // Sedentary base
  
  // Adjust for training frequency
  if (frequency >= 6) activityMultiplier = 1.725;
  else if (frequency >= 4) activityMultiplier = 1.55;
  else if (frequency >= 3) activityMultiplier = 1.375;
  
  // Adjust for intensity
  if (intensity === "intense") activityMultiplier += 0.1;
  else if (intensity === "light") activityMultiplier -= 0.05;
  
  return bmr * activityMultiplier;
}

/**
 * Calculate calorie deficit/surplus based on goal
 */
function calculateCalorieAdjustment(
  tdee: number,
  goal: string,
  weightDifference: number,
  timeframeDays: number
): number {
  // Safe weight loss/gain: 0.5-1 kg per week = 3500-7000 cal/week deficit
  const weeksToGoal = timeframeDays / 7;
  const kgPerWeek = Math.abs(weightDifference) / weeksToGoal;
  
  let dailyAdjustment = 0;
  
  if (goal === "lose_weight") {
    // Cap at 1kg/week for safety
    const safeKgPerWeek = Math.min(kgPerWeek, 1.0);
    dailyAdjustment = -(safeKgPerWeek * 7700) / 7; // 7700 cal per kg
  } else if (goal === "build_muscle") {
    // Surplus for muscle gain
    const safeKgPerWeek = Math.min(kgPerWeek, 0.5);
    dailyAdjustment = (safeKgPerWeek * 7700) / 7;
  } else if (goal === "strength_training") {
    dailyAdjustment = 200; // Slight surplus
  }
  
  return Math.round(tdee + dailyAdjustment);
}

/**
 * Calculate macro split based on goal
 */
function calculateMacros(calories: number, goal: string): { protein: number; carbs: number; fats: number } {
  let proteinRatio = 0.30;
  let carbsRatio = 0.40;
  let fatsRatio = 0.30;
  
  if (goal === "build_muscle" || goal === "strength_training") {
    proteinRatio = 0.35;
    carbsRatio = 0.40;
    fatsRatio = 0.25;
  } else if (goal === "lose_weight") {
    proteinRatio = 0.40;
    carbsRatio = 0.30;
    fatsRatio = 0.30;
  }
  
  return {
    protein: Math.round((calories * proteinRatio) / 4), // 4 cal per gram
    carbs: Math.round((calories * carbsRatio) / 4),
    fats: Math.round((calories * fatsRatio) / 9), // 9 cal per gram
  };
}

/**
 * Fallback calculation if AI fails
 */
function generateFallbackPlan(data: OnboardingData): WorkoutPlanResult {
  const { age = 25, gender = "male", heightCm = 170, currentWeightKg = 70, targetWeightKg = 70, primaryGoal = "general_fitness", trainingFrequency = 3, trainingIntensity = "moderate", timeframe = "3_months", customTimeframeDays } = data;
  
  // Calculate timeframe in days
  let days = customTimeframeDays || 90;
  if (timeframe === "1_month") days = 30;
  else if (timeframe === "3_months") days = 90;
  else if (timeframe === "6_months") days = 180;
  else if (timeframe === "1_year") days = 365;
  
  const bmr = calculateBMR(currentWeightKg, heightCm, age, gender);
  const tdee = calculateTDEE(bmr, trainingFrequency, trainingIntensity);
  const weightDiff = targetWeightKg - currentWeightKg;
  const dailyCalories = calculateCalorieAdjustment(tdee, primaryGoal, weightDiff, days);
  const macros = calculateMacros(dailyCalories, primaryGoal);
  
  // Generate workout split based on frequency
  const workoutSplit: string[] = [];
  if (trainingFrequency >= 5) {
    workoutSplit.push("Push (Chest, Shoulders, Triceps)");
    workoutSplit.push("Pull (Back, Biceps)");
    workoutSplit.push("Legs");
    workoutSplit.push("Upper Body");
    workoutSplit.push("Full Body");
  } else if (trainingFrequency >= 3) {
    workoutSplit.push("Upper Body");
    workoutSplit.push("Lower Body");
    workoutSplit.push("Full Body");
  } else {
    workoutSplit.push("Full Body Workout");
  }
  
  return {
    dailyCalories,
    protein: macros.protein,
    carbs: macros.carbs,
    fats: macros.fats,
    workoutSplit: workoutSplit.slice(0, trainingFrequency),
    estimatedWeeks: Math.round(days / 7),
    additionalNotes: "Plan generated using standard fitness calculations.",
  };
}

/**
 * Generate workout plan using AI
 */
export async function generateWorkoutPlan(data: OnboardingData): Promise<WorkoutPlanResult> {
  try {
    const { age, gender, heightCm, currentWeightKg, targetWeightKg, primaryGoal, trainingFrequency, trainingIntensity, timeframe, customTimeframeDays, injuries } = data;
    
    // Build detailed prompt
    let timeframeText = "";
    if (timeframe === "1_month") timeframeText = "1 month";
    else if (timeframe === "3_months") timeframeText = "3 months";
    else if (timeframe === "6_months") timeframeText = "6 months";
    else if (timeframe === "1_year") timeframeText = "1 year";
    else timeframeText = `${customTimeframeDays} days`;
    
    const goalText = primaryGoal?.replace(/_/g, " ") || "general fitness";
    const injuriesText = injuries ? `\nInjuries/Limitations: ${injuries}` : "";
    
    const prompt = `You are a certified fitness and nutrition expert. Create a personalized fitness plan for a user with the following information:

Age: ${age} years
Gender: ${gender}
Height: ${heightCm} cm
Current Weight: ${currentWeightKg} kg
Target Weight: ${targetWeightKg} kg
Goal: ${goalText}
Timeframe: ${timeframeText}
Training Frequency: ${trainingFrequency}x per week
Training Intensity: ${trainingIntensity}${injuriesText}

Please provide:
1. Recommended daily calories (single number)
2. Macro breakdown in grams: Protein, Carbs, Fats
3. Weekly workout split (${trainingFrequency} workout days)
4. Estimated weeks to reach goal
5. Brief additional notes or tips

Format your response as JSON:
{
  "dailyCalories": number,
  "protein": number,
  "carbs": number,
  "fats": number,
  "workoutSplit": ["Day 1: ...", "Day 2: ...", ...],
  "estimatedWeeks": number,
  "additionalNotes": "string"
}`;

    const messages: AIMessage[] = [
      { role: "user", content: prompt }
    ];
    
    const response = await getAnthropicTextResponse(messages, {
      maxTokens: 2048,
      temperature: 0.7,
    });
    
    // Try to parse JSON from response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        dailyCalories: parsed.dailyCalories || 2000,
        protein: parsed.protein || 150,
        carbs: parsed.carbs || 200,
        fats: parsed.fats || 65,
        workoutSplit: parsed.workoutSplit || [],
        estimatedWeeks: parsed.estimatedWeeks || 12,
        additionalNotes: parsed.additionalNotes || "",
      };
    }
    
    // If JSON parsing fails, use fallback
    console.warn("AI response not in expected format, using fallback");
    return generateFallbackPlan(data);
    
  } catch (error) {
    console.error("Error generating workout plan:", error);
    // Return fallback calculation
    return generateFallbackPlan(data);
  }
}
