// Pre-built split templates for program creation
import { Split, SplitType } from '../types/workout';

export const SPLIT_TEMPLATES: Split[] = [
  {
    id: 'ppl-6day',
    name: 'Push Pull Legs (6 Day)',
    type: 'push-pull-legs',
    daysPerWeek: 6,
    workoutTemplateIds: [], // Will be populated when user creates program
    rotationPattern: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest'],
  },
  {
    id: 'ppl-3day',
    name: 'Push Pull Legs (3 Day)',
    type: 'push-pull-legs',
    daysPerWeek: 3,
    workoutTemplateIds: [],
    rotationPattern: ['Push', 'Pull', 'Legs', 'Rest', 'Rest', 'Rest', 'Rest'],
  },
  {
    id: 'upper-lower-4day',
    name: 'Upper Lower (4 Day)',
    type: 'upper-lower',
    daysPerWeek: 4,
    workoutTemplateIds: [],
    rotationPattern: ['Upper', 'Lower', 'Rest', 'Upper', 'Lower', 'Rest', 'Rest'],
  },
  {
    id: 'upper-lower-5day',
    name: 'Upper Lower (5 Day)',
    type: 'upper-lower',
    daysPerWeek: 5,
    workoutTemplateIds: [],
    rotationPattern: ['Upper', 'Lower', 'Upper', 'Lower', 'Upper', 'Rest', 'Rest'],
  },
  {
    id: 'full-body-3day',
    name: 'Full Body (3 Day)',
    type: 'full-body',
    daysPerWeek: 3,
    workoutTemplateIds: [],
    rotationPattern: ['Full Body', 'Rest', 'Full Body', 'Rest', 'Full Body', 'Rest', 'Rest'],
  },
  {
    id: 'bro-split-5day',
    name: 'Bro Split (5 Day)',
    type: 'bro-split',
    daysPerWeek: 5,
    workoutTemplateIds: [],
    rotationPattern: ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Rest', 'Rest'],
  },
  {
    id: 'push-pull-4day',
    name: 'Push Pull (4 Day)',
    type: 'push-pull',
    daysPerWeek: 4,
    workoutTemplateIds: [],
    rotationPattern: ['Push', 'Pull', 'Rest', 'Push', 'Pull', 'Rest', 'Rest'],
  },
];

/**
 * Get split template by ID
 */
export function getSplitTemplateById(id: string): Split | undefined {
  return SPLIT_TEMPLATES.find(split => split.id === id);
}

/**
 * Get split templates by days per week
 */
export function getSplitsByDaysPerWeek(days: number): Split[] {
  return SPLIT_TEMPLATES.filter(split => split.daysPerWeek === days);
}

/**
 * Get recommended split for experience level
 */
export function getRecommendedSplits(
  experienceLevel: 'beginner' | 'intermediate' | 'advanced',
  availableDays: number
): Split[] {
  let recommended: Split[] = [];

  if (experienceLevel === 'beginner') {
    // Beginners: full-body or upper-lower
    recommended = SPLIT_TEMPLATES.filter(
      split => (split.type === 'full-body' || split.type === 'upper-lower') &&
               split.daysPerWeek <= availableDays
    );
  } else if (experienceLevel === 'intermediate') {
    // Intermediate: PPL or upper-lower
    recommended = SPLIT_TEMPLATES.filter(
      split => (split.type === 'push-pull-legs' || split.type === 'upper-lower') &&
               split.daysPerWeek <= availableDays
    );
  } else {
    // Advanced: any split
    recommended = SPLIT_TEMPLATES.filter(
      split => split.daysPerWeek <= availableDays
    );
  }

  // Sort by days per week (prefer more if available)
  return recommended.sort((a, b) => b.daysPerWeek - a.daysPerWeek);
}

/**
 * Get suggested workout names for a split type
 */
export function getSuggestedWorkoutNames(splitType: SplitType): string[] {
  const suggestions: Record<SplitType, string[]> = {
    'push-pull-legs': ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'],
    'upper-lower': ['Upper A', 'Lower A', 'Upper B', 'Lower B'],
    'full-body': ['Full Body A', 'Full Body B', 'Full Body C'],
    'bro-split': ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms'],
    'push-pull': ['Push A', 'Pull A', 'Push B', 'Pull B'],
    'custom': ['Workout A', 'Workout B', 'Workout C'],
  };

  return suggestions[splitType] || [];
}

/**
 * Get exercise focus for each day in a split
 */
export function getDayFocus(splitType: SplitType, dayIndex: number): {
  name: string;
  primaryMuscles: string[];
  movements: string[];
} {
  const focuses: Record<SplitType, Array<{ name: string; primaryMuscles: string[]; movements: string[] }>> = {
    'push-pull-legs': [
      { name: 'Push', primaryMuscles: ['chest', 'shoulders', 'triceps'], movements: ['horizontal-push', 'vertical-push'] },
      { name: 'Pull', primaryMuscles: ['back', 'biceps'], movements: ['horizontal-pull', 'vertical-pull'] },
      { name: 'Legs', primaryMuscles: ['quads', 'hamstrings', 'glutes', 'calves'], movements: ['squat', 'hinge'] },
    ],
    'upper-lower': [
      { name: 'Upper', primaryMuscles: ['chest', 'back', 'shoulders', 'biceps', 'triceps'], movements: ['horizontal-push', 'horizontal-pull', 'vertical-push', 'vertical-pull'] },
      { name: 'Lower', primaryMuscles: ['quads', 'hamstrings', 'glutes', 'calves'], movements: ['squat', 'hinge'] },
    ],
    'full-body': [
      { name: 'Full Body', primaryMuscles: ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'glutes'], movements: ['horizontal-push', 'horizontal-pull', 'squat', 'hinge'] },
    ],
    'bro-split': [
      { name: 'Chest', primaryMuscles: ['chest'], movements: ['horizontal-push'] },
      { name: 'Back', primaryMuscles: ['back'], movements: ['horizontal-pull', 'vertical-pull', 'hinge'] },
      { name: 'Shoulders', primaryMuscles: ['shoulders'], movements: ['vertical-push'] },
      { name: 'Legs', primaryMuscles: ['quads', 'hamstrings', 'glutes', 'calves'], movements: ['squat', 'hinge'] },
      { name: 'Arms', primaryMuscles: ['biceps', 'triceps'], movements: ['isolation'] },
    ],
    'push-pull': [
      { name: 'Push', primaryMuscles: ['chest', 'shoulders', 'triceps'], movements: ['horizontal-push', 'vertical-push'] },
      { name: 'Pull', primaryMuscles: ['back', 'biceps'], movements: ['horizontal-pull', 'vertical-pull'] },
    ],
    'custom': [
      { name: 'Custom', primaryMuscles: [], movements: [] },
    ],
  };

  const focusList = focuses[splitType];
  const index = dayIndex % focusList.length;
  return focusList[index];
}

