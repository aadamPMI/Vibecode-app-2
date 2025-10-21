// Plate rounding utilities for realistic weight selection

export const DEFAULT_PLATE_INCREMENTS = {
  kg: [1.25, 2.5, 5, 10, 15, 20, 25],
  lbs: [2.5, 5, 10, 25, 35, 45],
};

/**
 * Round weight to nearest available plate increment
 */
export function roundToPlate(
  weight: number,
  unit: 'kg' | 'lbs',
  increments?: number[],
  roundUp: boolean = false
): number {
  const availableIncrements = increments || DEFAULT_PLATE_INCREMENTS[unit];
  const smallestIncrement = Math.min(...availableIncrements);
  
  if (roundUp) {
    return Math.ceil(weight / smallestIncrement) * smallestIncrement;
  } else {
    return Math.round(weight / smallestIncrement) * smallestIncrement;
  }
}

/**
 * Get the closest achievable weight with available plates
 */
export function getAchievableWeight(
  targetWeight: number,
  unit: 'kg' | 'lbs',
  barWeight?: number,
  increments?: number[],
  preferRoundUp: boolean = true
): number {
  const bar = barWeight || (unit === 'kg' ? 20 : 45);
  const availableIncrements = increments || DEFAULT_PLATE_INCREMENTS[unit];
  const smallestIncrement = Math.min(...availableIncrements);
  
  const totalIncrement = 2 * smallestIncrement;
  const loadWeight = targetWeight - bar;
  
  if (loadWeight <= 0) return bar;
  
  let roundedLoad: number;
  if (preferRoundUp) {
    roundedLoad = Math.ceil(loadWeight / totalIncrement) * totalIncrement;
  } else {
    roundedLoad = Math.round(loadWeight / totalIncrement) * totalIncrement;
  }
  
  return bar + roundedLoad;
}

/**
 * Format weight with unit
 */
export function formatWeight(
  weight: number,
  unit: 'kg' | 'lbs',
  showUnit: boolean = true
): string {
  const formatted = weight.toFixed(1);
  return showUnit ? `${formatted} ${unit}` : formatted;
}

/**
 * Convert weight between units
 */
export function convertWeight(
  weight: number,
  from: 'kg' | 'lbs',
  to: 'kg' | 'lbs'
): number {
  if (from === to) return weight;
  
  if (from === 'kg' && to === 'lbs') {
    return Math.round(weight * 2.20462 * 10) / 10;
  } else {
    return Math.round(weight * 0.453592 * 10) / 10;
  }
}

/**
 * Suggest appropriate weight increment for progression
 */
export function suggestIncrement(
  exerciseName: string,
  currentWeight: number,
  unit: 'kg' | 'lbs'
): number {
  const lowerName = exerciseName.toLowerCase();
  
  const isCompound = lowerName.includes('squat') || 
                     lowerName.includes('deadlift') || 
                     lowerName.includes('bench') ||
                     lowerName.includes('press');
  
  const isSmallMuscle = lowerName.includes('curl') ||
                        lowerName.includes('lateral') ||
                        lowerName.includes('fly') ||
                        lowerName.includes('extension');
  
  let increment: number;
  
  if (unit === 'kg') {
    if (isCompound) {
      increment = currentWeight < 60 ? 2.5 : 5;
    } else if (isSmallMuscle) {
      increment = 1.25;
    } else {
      increment = 2.5;
    }
  } else {
    if (isCompound) {
      increment = currentWeight < 135 ? 5 : 10;
    } else if (isSmallMuscle) {
      increment = 2.5;
    } else {
      increment = 5;
    }
  }
  
  return increment;
}

/**
 * Check if weight increase is safe
 */
export function isWeightIncreaseSafe(
  oldWeight: number,
  newWeight: number,
  maxPercentIncrease: number = 0.1
): boolean {
  if (oldWeight === 0) return true;
  if (newWeight <= oldWeight) return true;
  
  const percentIncrease = (newWeight - oldWeight) / oldWeight;
  return percentIncrease <= maxPercentIncrease;
}

/**
 * Clamp weight increase to safe maximum
 */
export function clampWeightIncrease(
  oldWeight: number,
  proposedWeight: number,
  maxPercentIncrease: number = 0.1
): number {
  if (proposedWeight <= oldWeight) return proposedWeight;
  
  const maxAllowedWeight = oldWeight * (1 + maxPercentIncrease);
  return Math.min(proposedWeight, maxAllowedWeight);
}

