// Progression Engine - Deterministic rules + AI assistance
import {
  Session,
  SessionExercise,
  SetLog,
  ProgressionResult,
  ProgressionRule,
  SetSchemeType,
} from "../types/workout";
import { calculateE1RM, calculateWorkingWeight } from "../utils/e1rmCalculations";
import { clampWeightIncrease, suggestIncrement, roundToPlate } from "../utils/plateRounding";
import { aiProgressionAdvisor } from "./workoutAI";

/**
 * Default progression rules
 */
export const DEFAULT_PROGRESSION_RULES: Record<SetSchemeType, ProgressionRule> = {
  'fixed-reps': {
    id: 'fixed-reps-default',
    name: 'Fixed Reps Progression',
    description: 'If all reps completed comfortably (RPE <8), increase load',
    type: 'fixed-reps',
    repsCompletedEasy: { action: 'increase-load', increment: 2.5 },
    repsCompletedHard: { action: 'hold-load' },
    repsMissed: { action: 'decrease-load', amount: 5 },
    maxWeeklyIncrease: 0.1, // 10%
    aiAssisted: false,
  },
  'rep-range': {
    id: 'rep-range-default',
    name: 'Rep Range Progression',
    description: 'Hit top of range comfortably? Increase load and reset to bottom',
    type: 'rep-range',
    topOfRangeComfortable: { action: 'increase-load', increment: 2.5 },
    maxWeeklyIncrease: 0.1,
    aiAssisted: false,
  },
  'top-set-backoffs': {
    id: 'top-set-default',
    name: 'Top Set Progression',
    description: 'Top set progression with back-off sets',
    type: 'top-set-backoffs',
    repsCompletedEasy: { action: 'increase-load', increment: 2.5 },
    maxWeeklyIncrease: 0.1,
    aiAssisted: false,
  },
  'amrap': {
    id: 'amrap-default',
    name: 'AMRAP Progression',
    description: 'Track rep PRs and adjust load based on reps achieved',
    type: 'amrap',
    maxWeeklyIncrease: 0.1,
    aiAssisted: false,
  },
  'time-based': {
    id: 'time-based-default',
    name: 'Time-Based Progression',
    description: 'Increase duration or load for weighted holds',
    type: 'time-based',
    maxWeeklyIncrease: 0.1,
    aiAssisted: false,
  },
};

/**
 * Calculate progression for a single exercise based on recent sessions
 */
export async function calculateProgression(
  exerciseId: string,
  exerciseName: string,
  currentSession: SessionExercise,
  recentSessions: SessionExercise[], // Last 3-5 sessions of same exercise
  rule: ProgressionRule,
  userUnit: 'kg' | 'lbs',
  userPlateIncrements?: number[],
  useAI: boolean = false
): Promise<ProgressionResult> {
  
  // Analyze current session performance
  const performance = analyzeSessionPerformance(currentSession);
  
  // Get current load (average of top sets)
  const currentLoad = getCurrentLoad(currentSession);
  
  // Apply deterministic rule
  let nextLoad = currentLoad;
  let nextReps = currentSession.targetScheme.reps;
  let reason = '';
  
  switch (rule.type) {
    case 'fixed-reps':
      const fixedResult = applyFixedRepsProgression(
        currentSession,
        performance,
        rule,
        currentLoad,
        userUnit,
        exerciseName
      );
      nextLoad = fixedResult.nextLoad;
      reason = fixedResult.reason;
      break;
      
    case 'rep-range':
      const rangeResult = applyRepRangeProgression(
        currentSession,
        performance,
        rule,
        currentLoad,
        userUnit,
        exerciseName
      );
      nextLoad = rangeResult.nextLoad;
      nextReps = rangeResult.nextReps;
      reason = rangeResult.reason;
      break;
      
    case 'top-set-backoffs':
      const topSetResult = applyTopSetProgression(
        currentSession,
        performance,
        rule,
        currentLoad,
        userUnit,
        exerciseName
      );
      nextLoad = topSetResult.nextLoad;
      reason = topSetResult.reason;
      break;
      
    case 'amrap':
      const amrapResult = applyAMRAPProgression(
        currentSession,
        performance,
        rule,
        currentLoad
      );
      nextLoad = amrapResult.nextLoad;
      reason = amrapResult.reason;
      break;
  }
  
  // Apply safety constraints
  nextLoad = clampWeightIncrease(currentLoad, nextLoad, rule.maxWeeklyIncrease);
  if (rule.maxAbsoluteIncrease) {
    nextLoad = Math.min(nextLoad, currentLoad + rule.maxAbsoluteIncrease);
  }
  
  // Round to available plates
  nextLoad = roundToPlate(nextLoad, userUnit, userPlateIncrements);
  
  // AI Override (if enabled)
  let aiSuggestion;
  if (useAI && rule.aiAssisted) {
    try {
      const recentSessionData = recentSessions.map(s => ({
        date: s.completedAt || new Date().toISOString(),
        sets: s.sets.map(set => ({
          reps: set.actualReps,
          load: set.actualLoad,
          rpe: set.rpe,
          targetReps: set.targetReps,
        })),
      }));
      
      aiSuggestion = await aiProgressionAdvisor(exerciseId, exerciseName, recentSessionData);
      
      // If AI has high confidence and differs significantly, note it
      if (aiSuggestion.confidence > 0.8 && aiSuggestion.suggestedLoad) {
        const diff = Math.abs(aiSuggestion.suggestedLoad - nextLoad);
        if (diff > nextLoad * 0.05) { // >5% difference
          // AI suggests different load - include in result but don't override
          reason += ` | AI suggests: ${aiSuggestion.suggestedLoad}${userUnit} (${aiSuggestion.reason})`;
        }
      }
    } catch (error) {
      console.error('AI progression error:', error);
    }
  }
  
  return {
    exerciseId,
    nextTarget: {
      load: nextLoad,
      reps: nextReps,
    },
    reason,
    appliedRule: rule.name,
    aiSuggestion,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Analyze session performance metrics
 */
function analyzeSessionPerformance(exercise: SessionExercise): {
  allTargetsMet: boolean;
  avgRPE: number;
  totalSets: number;
  completedSets: number;
  failedSets: number;
  avgRepsPerSet: number;
} {
  const completedSets = exercise.sets.filter(s => s.status === 'completed');
  const failedSets = exercise.sets.filter(s => s.status === 'failed');
  
  const allTargetsMet = completedSets.every(set => 
    set.targetReps ? set.actualReps >= set.targetReps : true
  );
  
  const avgRPE = completedSets.length > 0
    ? completedSets.reduce((sum, s) => sum + (s.rpe || 7), 0) / completedSets.length
    : 7;
  
  const avgRepsPerSet = completedSets.length > 0
    ? completedSets.reduce((sum, s) => sum + s.actualReps, 0) / completedSets.length
    : 0;
  
  return {
    allTargetsMet,
    avgRPE,
    totalSets: exercise.sets.length,
    completedSets: completedSets.length,
    failedSets: failedSets.length,
    avgRepsPerSet,
  };
}

/**
 * Get current working load (average of top sets)
 */
function getCurrentLoad(exercise: SessionExercise): number {
  const completedSets = exercise.sets.filter(s => s.status === 'completed');
  if (completedSets.length === 0) return 0;
  
  // Take average of first 2 sets (top sets)
  const topSets = completedSets.slice(0, 2);
  return topSets.reduce((sum, s) => sum + s.actualLoad, 0) / topSets.length;
}

/**
 * Apply fixed reps progression logic
 */
function applyFixedRepsProgression(
  exercise: SessionExercise,
  performance: ReturnType<typeof analyzeSessionPerformance>,
  rule: ProgressionRule,
  currentLoad: number,
  unit: 'kg' | 'lbs',
  exerciseName: string
): { nextLoad: number; reason: string } {
  
  // All reps hit AND RPE <8 = increase
  if (performance.allTargetsMet && performance.avgRPE < 8) {
    const increment = suggestIncrement(exerciseName, currentLoad, unit);
    return {
      nextLoad: currentLoad + increment,
      reason: `All reps completed comfortably (RPE ${performance.avgRPE.toFixed(1)}) → +${increment}${unit}`,
    };
  }
  
  // All reps hit but RPE 8-9 = hold
  if (performance.allTargetsMet && performance.avgRPE >= 8 && performance.avgRPE < 9.5) {
    return {
      nextLoad: currentLoad,
      reason: `All reps hit but high RPE (${performance.avgRPE.toFixed(1)}) → hold load`,
    };
  }
  
  // Reps missed = decrease
  if (!performance.allTargetsMet || performance.failedSets > 0) {
    const decrease = rule.repsMissed?.amount || 5;
    return {
      nextLoad: Math.max(currentLoad * 0.9, currentLoad - decrease),
      reason: `Missed reps or failed sets → -${decrease}%`,
    };
  }
  
  // Default: hold
  return {
    nextLoad: currentLoad,
    reason: 'Hold current load',
  };
}

/**
 * Apply rep range progression logic
 */
function applyRepRangeProgression(
  exercise: SessionExercise,
  performance: ReturnType<typeof analyzeSessionPerformance>,
  rule: ProgressionRule,
  currentLoad: number,
  unit: 'kg' | 'lbs',
  exerciseName: string
): { nextLoad: number; nextReps: number | undefined; reason: string } {
  
  const targetMax = exercise.targetScheme.repRangeMax || 12;
  const targetMin = exercise.targetScheme.repRangeMin || 8;
  
  // Hit top of range comfortably = increase load, reset to bottom
  if (performance.avgRepsPerSet >= targetMax && performance.avgRPE < 8.5) {
    const increment = suggestIncrement(exerciseName, currentLoad, unit);
    return {
      nextLoad: currentLoad + increment,
      nextReps: targetMin,
      reason: `Hit ${targetMax} reps comfortably → +${increment}${unit}, reset to ${targetMin}-${targetMax}`,
    };
  }
  
  // In range, keep building
  if (performance.avgRepsPerSet >= targetMin && performance.avgRepsPerSet < targetMax) {
    return {
      nextLoad: currentLoad,
      nextReps: undefined,
      reason: `Building reps in range (avg ${performance.avgRepsPerSet.toFixed(1)}) → hold load`,
    };
  }
  
  // Below range = decrease load
  if (performance.avgRepsPerSet < targetMin) {
    return {
      nextLoad: currentLoad * 0.95,
      nextReps: undefined,
      reason: `Below target range → -5% load`,
    };
  }
  
  return {
    nextLoad: currentLoad,
    nextReps: undefined,
    reason: 'Hold current load',
  };
}

/**
 * Apply top set + back-offs progression
 */
function applyTopSetProgression(
  exercise: SessionExercise,
  performance: ReturnType<typeof analyzeSessionPerformance>,
  rule: ProgressionRule,
  currentLoad: number,
  unit: 'kg' | 'lbs',
  exerciseName: string
): { nextLoad: number; reason: string } {
  
  // Focus on top set (first set)
  const topSet = exercise.sets.find(s => s.status === 'completed');
  if (!topSet) {
    return { nextLoad: currentLoad, reason: 'No completed sets' };
  }
  
  const topSetHitTarget = topSet.targetReps ? topSet.actualReps >= topSet.targetReps : true;
  const topSetRPE = topSet.rpe || 7;
  
  // Top set hit AND RPE <8 = increase
  if (topSetHitTarget && topSetRPE < 8) {
    const increment = suggestIncrement(exerciseName, currentLoad, unit);
    return {
      nextLoad: currentLoad + increment,
      reason: `Top set hit comfortably (RPE ${topSetRPE}) → +${increment}${unit}`,
    };
  }
  
  // Top set hit but hard = hold
  if (topSetHitTarget && topSetRPE >= 8) {
    return {
      nextLoad: currentLoad,
      reason: `Top set hit but challenging → hold`,
    };
  }
  
  // Top set missed = decrease
  return {
    nextLoad: currentLoad * 0.95,
    reason: `Top set target missed → -5%`,
  };
}

/**
 * Apply AMRAP progression
 */
function applyAMRAPProgression(
  exercise: SessionExercise,
  performance: ReturnType<typeof analyzeSessionPerformance>,
  rule: ProgressionRule,
  currentLoad: number
): { nextLoad: number; reason: string } {
  
  // For AMRAP, track rep PRs
  // If reps increased from last time = hold or small increase
  // If reps decreased = might be too heavy
  
  // Simple heuristic: if avg reps >10 and RPE <8, increase load
  if (performance.avgRepsPerSet > 10 && performance.avgRPE < 8) {
    return {
      nextLoad: currentLoad * 1.05,
      reason: `High reps (${performance.avgRepsPerSet.toFixed(0)}) at low RPE → +5%`,
    };
  }
  
  // If reps <6, might be too heavy
  if (performance.avgRepsPerSet < 6) {
    return {
      nextLoad: currentLoad * 0.95,
      reason: `Low reps (${performance.avgRepsPerSet.toFixed(0)}) → -5%`,
    };
  }
  
  return {
    nextLoad: currentLoad,
    reason: `AMRAP set tracking, hold load`,
  };
}

/**
 * Batch calculate progression for all exercises in a program
 */
export async function calculateSessionProgressions(
  completedSession: Session,
  allSessions: Session[],
  userUnit: 'kg' | 'lbs',
  useAI: boolean = false
): Promise<ProgressionResult[]> {
  
  const results: ProgressionResult[] = [];
  
  for (const exercise of completedSession.exercises) {
    // Find recent sessions with same exercise
    const recentSessions = allSessions
      .filter(s => s.status === 'completed' && s.id !== completedSession.id)
      .flatMap(s => s.exercises.filter(e => e.exerciseId === exercise.exerciseId))
      .slice(0, 5);
    
    // Get appropriate rule
    const rule = DEFAULT_PROGRESSION_RULES[exercise.targetScheme.type];
    
    if (!rule) continue;
    
    try {
      const progression = await calculateProgression(
        exercise.exerciseId,
        exercise.exerciseName,
        exercise,
        recentSessions,
        rule,
        userUnit,
        undefined,
        useAI
      );
      
      results.push(progression);
    } catch (error) {
      console.error(`Error calculating progression for ${exercise.exerciseName}:`, error);
    }
  }
  
  return results;
}

