// E1RM (Estimated 1 Rep Max) calculation utilities
// Using the Epley formula: 1RM = weight × (1 + reps / 30)

export interface E1RMResult {
  e1rm: number;
  confidence: number; // 0-1, higher for rep ranges 3-8
}

/**
 * Calculate estimated 1RM from weight and reps
 */
export function calculateE1RM(
  weight: number,
  reps: number,
  rpe?: number
): E1RMResult {
  let e1rm = weight * (1 + reps / 30);

  // Adjust for RPE if provided
  if (rpe && rpe < 10) {
    const rpeAdjustment = (10 - rpe) * 0.025;
    e1rm = e1rm * (1 + rpeAdjustment);
  }

  // Confidence scoring
  let confidence = 0.9;
  if (reps === 1) confidence = 0.95;
  else if (reps >= 2 && reps <= 3) confidence = 0.9;
  else if (reps >= 4 && reps <= 8) confidence = 1.0;
  else if (reps >= 9 && reps <= 12) confidence = 0.85;
  else if (reps > 12) confidence = 0.6;

  if (!rpe && reps > 8) confidence *= 0.9;

  return {
    e1rm: Math.round(e1rm * 10) / 10,
    confidence,
  };
}

/**
 * Calculate working weight from e1RM and percentage
 */
export function calculateWorkingWeight(e1rm: number, percent: number): number {
  return Math.round(e1rm * percent * 10) / 10;
}

/**
 * Calculate target reps for a given weight
 */
export function calculateTargetReps(weight: number, e1rm: number): number {
  if (weight >= e1rm) return 1;
  const reps = 30 * ((e1rm / weight) - 1);
  return Math.max(1, Math.round(reps));
}

/**
 * Get percentage of 1RM
 */
export function getPercentageOfE1RM(weight: number, e1rm: number): number {
  if (e1rm === 0) return 0;
  return Math.min(1, weight / e1rm);
}

/**
 * Calculate average e1RM from multiple sets
 */
export function calculateAverageE1RM(
  sets: Array<{ weight: number; reps: number; rpe?: number }>
): number {
  if (sets.length === 0) return 0;

  let totalWeightedE1RM = 0;
  let totalWeight = 0;

  sets.forEach((set, index) => {
    const { e1rm, confidence } = calculateE1RM(set.weight, set.reps, set.rpe);
    const recencyWeight = Math.exp(-index * 0.1);
    const weight = confidence * recencyWeight;
    
    totalWeightedE1RM += e1rm * weight;
    totalWeight += weight;
  });

  return Math.round((totalWeightedE1RM / totalWeight) * 10) / 10;
}

/**
 * Detect significant e1RM change
 */
export function hasE1RMChangedSignificantly(
  oldE1RM: number,
  newE1RM: number,
  threshold: number = 0.025
): boolean {
  if (oldE1RM === 0) return true;
  const percentChange = Math.abs((newE1RM - oldE1RM) / oldE1RM);
  return percentChange >= threshold;
}

