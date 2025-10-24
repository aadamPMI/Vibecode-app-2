// Hook for AI-powered exercise suggestions
import { useMemo } from 'react';
import { EXERCISE_LIBRARY } from '../constants/exerciseData';
import { Exercise, MuscleGroup } from '../types/workout';

export interface AISuggestionsConfig {
  muscleGroups: MuscleGroup[];
  splitType: string;
  trainingStyle?: 'strength' | 'hypertrophy' | 'endurance';
  userHistory?: string[]; // Exercise IDs the user frequently uses
}

export function useAISuggestions(config: AISuggestionsConfig) {
  const suggestions = useMemo(() => {
    if (config.muscleGroups.length === 0) {
      return [];
    }

    // Score exercises based on relevance
    const scoredExercises = EXERCISE_LIBRARY.map((exercise) => {
      let score = 0;

      // Primary muscle match (highest weight)
      const primaryMatches = exercise.primaryMuscles.filter((muscle) =>
        config.muscleGroups.includes(muscle as MuscleGroup)
      );
      score += primaryMatches.length * 10;

      // Secondary muscle match
      const secondaryMatches = exercise.secondaryMuscles?.filter((muscle) =>
        config.muscleGroups.includes(muscle as MuscleGroup)
      ) || [];
      score += secondaryMatches.length * 5;

      // Prioritize compound movements (exercises with E1RM tracking)
      if (exercise.trackE1RM) {
        score += 8;
      }

      // Prioritize exercises in user history
      if (config.userHistory?.includes(exercise.id)) {
        score += 15;
      }

      // Boost barbell exercises for strength training
      if (config.trainingStyle === 'strength' && exercise.equipment.includes('barbell')) {
        score += 5;
      }

      // Boost dumbbell/cable for hypertrophy
      if (
        config.trainingStyle === 'hypertrophy' &&
        (exercise.equipment.includes('dumbbell') || exercise.equipment.includes('cable'))
      ) {
        score += 3;
      }

      return { exercise, score };
    });

    // Filter to only relevant exercises (score > 0) and sort by score
    const filtered = scoredExercises
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    // Ensure we have at least 1-2 compound lifts at the top
    const compounds: Exercise[] = [];
    const others: Exercise[] = [];

    filtered.forEach((item) => {
      if (item.exercise.trackE1RM && compounds.length < 2) {
        compounds.push(item.exercise);
      } else {
        others.push(item.exercise);
      }
    });

    // Return top 5-12 exercises (compounds first)
    const result = [...compounds, ...others].slice(0, 12);

    // Ensure minimum 5 suggestions if available
    return result.length >= 5 ? result : result;
  }, [config.muscleGroups, config.splitType, config.trainingStyle, config.userHistory]);

  return {
    suggestions,
    count: suggestions.length,
    hasCompoundLifts: suggestions.some((ex) => ex.trackE1RM),
  };
}
