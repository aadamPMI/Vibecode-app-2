// Volume and stimulus calculation utilities for workout tracking

import { SubRegion, SubRegionWeight, SetLog, SessionExercise } from '../types/workout';

/**
 * Calculate volume for a single set (weight × reps)
 */
export function calculateSetVolume(weight: number, reps: number): number {
  return weight * reps;
}

/**
 * Calculate total volume for an exercise (sum of all sets)
 */
export function calculateExerciseVolume(sets: SetLog[]): number {
  return sets.reduce((total, set) => {
    if (set.status === 'completed') {
      return total + calculateSetVolume(set.actualLoad, set.actualReps);
    }
    return total;
  }, 0);
}

/**
 * Calculate total volume for a session
 */
export function calculateSessionVolume(exercises: SessionExercise[]): number {
  return exercises.reduce((total, exercise) => {
    return total + calculateExerciseVolume(exercise.sets);
  }, 0);
}

/**
 * Calculate stimulus score for a set
 * Base = 1.0 for a hard set, with modifiers for RPE and set type
 */
export function calculateSetStimulus(
  setLog: SetLog,
  isTopSet: boolean = false
): number {
  if (setLog.status !== 'completed') return 0;
  
  let stimulus = 1.0; // Base stimulus
  
  // Top set bonus
  if (isTopSet) {
    stimulus += 0.1;
  }
  
  // RPE modifier
  if (setLog.rpe) {
    if (setLog.rpe >= 8) {
      stimulus += 0.1; // High effort bonus
    } else if (setLog.rpe <= 6) {
      stimulus -= 0.1; // Low effort penalty
    }
  }
  
  // Clamp between 0.8 and 1.2
  return Math.max(0.8, Math.min(1.2, stimulus));
}

/**
 * Calculate sub-region stimulus for an exercise
 */
export function calculateExerciseSubRegionStimulus(
  exercise: SessionExercise,
  subRegionWeights: SubRegionWeight[]
): Map<SubRegion, number> {
  const stimulusMap = new Map<SubRegion, number>();
  
  // Calculate total stimulus from all completed sets
  exercise.sets.forEach((set, index) => {
    if (set.status === 'completed') {
      const isTopSet = index === 0; // First set is top set
      const setStimulus = calculateSetStimulus(set, isTopSet);
      
      // Distribute stimulus across sub-regions based on weights
      subRegionWeights.forEach(({ region, weight }) => {
        const regionStimulus = setStimulus * weight;
        const current = stimulusMap.get(region) || 0;
        stimulusMap.set(region, current + regionStimulus);
      });
    }
  });
  
  return stimulusMap;
}

/**
 * Calculate weekly sub-region stimulus totals
 */
export function calculateWeeklySubRegionTotals(
  sessions: { exercises: SessionExercise[]; completedAt?: string }[],
  exerciseSubRegionMap: Map<string, SubRegionWeight[]>,
  weekStart: Date,
  weekEnd: Date
): Map<SubRegion, number> {
  const weeklyTotals = new Map<SubRegion, number>();
  
  // Filter sessions within the week
  const weekSessions = sessions.filter(session => {
    if (!session.completedAt) return false;
    const completedDate = new Date(session.completedAt);
    return completedDate >= weekStart && completedDate <= weekEnd;
  });
  
  // Accumulate stimulus from all exercises
  weekSessions.forEach(session => {
    session.exercises.forEach(exercise => {
      const subRegionWeights = exerciseSubRegionMap.get(exercise.exerciseId);
      if (subRegionWeights) {
        const exerciseStimulus = calculateExerciseSubRegionStimulus(
          exercise,
          subRegionWeights
        );
        
        exerciseStimulus.forEach((stimulus, region) => {
          const current = weeklyTotals.get(region) || 0;
          weeklyTotals.set(region, current + stimulus);
        });
      }
    });
  });
  
  return weeklyTotals;
}

/**
 * Calculate total sets for an exercise
 */
export function calculateTotalSets(exercises: SessionExercise[]): number {
  return exercises.reduce((total, exercise) => {
    return total + exercise.sets.filter(s => s.status === 'completed').length;
  }, 0);
}

/**
 * Calculate session duration in minutes
 */
export function calculateSessionDuration(startedAt: string, completedAt: string): number {
  const start = new Date(startedAt);
  const end = new Date(completedAt);
  const durationMs = end.getTime() - start.getTime();
  return Math.round(durationMs / 60000); // Convert to minutes
}

/**
 * Calculate average volume per set for an exercise
 */
export function calculateAverageVolumePerSet(sets: SetLog[]): number {
  const completedSets = sets.filter(s => s.status === 'completed');
  if (completedSets.length === 0) return 0;
  
  const totalVolume = completedSets.reduce((sum, set) => 
    sum + calculateSetVolume(set.actualLoad, set.actualReps), 0
  );
  
  return Math.round(totalVolume / completedSets.length);
}

/**
 * Calculate intensity (average % of target load)
 */
export function calculateAverageIntensity(sets: SetLog[]): number {
  const setsWithTargets = sets.filter(s => 
    s.status === 'completed' && s.targetLoad && s.targetLoad > 0
  );
  
  if (setsWithTargets.length === 0) return 0;
  
  const totalIntensity = setsWithTargets.reduce((sum, set) => {
    const intensity = (set.actualLoad / set.targetLoad!) * 100;
    return sum + intensity;
  }, 0);
  
  return Math.round(totalIntensity / setsWithTargets.length);
}

/**
 * Get week start and end dates for a given date
 */
export function getWeekBoundaries(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay()); // Go to Sunday
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Go to Saturday
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

/**
 * Check if target was met for a set
 */
export function wasTargetMet(set: SetLog): boolean {
  if (!set.targetReps || !set.targetLoad) return true; // No target = always met
  
  return set.actualReps >= set.targetReps && set.actualLoad >= set.targetLoad;
}

/**
 * Calculate completion rate for exercise
 */
export function calculateCompletionRate(sets: SetLog[]): number {
  if (sets.length === 0) return 0;
  
  const metTarget = sets.filter(wasTargetMet).length;
  return Math.round((metTarget / sets.length) * 100);
}

