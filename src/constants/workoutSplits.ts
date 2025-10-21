// Preset Workout Split Templates
import { MuscleGroup, SplitType, ExperienceLevel } from '../types/workout';

export interface PresetSplitDay {
  dayName: string;
  suggestedMuscleGroups: MuscleGroup[];
  description: string;
}

export interface PresetSplit {
  id: string;
  name: string;
  type: SplitType;
  description: string;
  daysPerWeek: number;
  restDays: number;
  experienceLevel: ExperienceLevel[];
  days: PresetSplitDay[];
  pros: string[];
  cons: string[];
}

export const PRESET_SPLITS: PresetSplit[] = [
  // PUSH PULL LEGS (PPL)
  {
    id: 'ppl-6day',
    name: 'Push Pull Legs (6 Day)',
    type: 'push-pull-legs',
    description: 'Train each muscle group twice per week with dedicated push, pull, and leg days',
    daysPerWeek: 6,
    restDays: 1,
    experienceLevel: ['intermediate', 'advanced'],
    days: [
      {
        dayName: 'Push A',
        suggestedMuscleGroups: ['chest', 'shoulders', 'triceps'],
        description: 'Chest, shoulders, and triceps focus',
      },
      {
        dayName: 'Pull A',
        suggestedMuscleGroups: ['back', 'biceps'],
        description: 'Back and biceps focus',
      },
      {
        dayName: 'Legs A',
        suggestedMuscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'],
        description: 'Complete lower body',
      },
      {
        dayName: 'Push B',
        suggestedMuscleGroups: ['chest', 'shoulders', 'triceps'],
        description: 'Chest, shoulders, and triceps with different exercises',
      },
      {
        dayName: 'Pull B',
        suggestedMuscleGroups: ['back', 'biceps'],
        description: 'Back and biceps with different exercises',
      },
      {
        dayName: 'Legs B',
        suggestedMuscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'],
        description: 'Complete lower body with different exercises',
      },
    ],
    pros: [
      'High frequency (2x per week per muscle)',
      'Balanced muscle development',
      'Good for hypertrophy',
      'Flexible scheduling',
    ],
    cons: [
      'Requires 6 days commitment',
      'May be too much for beginners',
      'Limited rest days',
    ],
  },

  // UPPER LOWER
  {
    id: 'upper-lower-4day',
    name: 'Upper Lower (4 Day)',
    type: 'upper-lower',
    description: 'Split training into upper and lower body days, training each twice per week',
    daysPerWeek: 4,
    restDays: 3,
    experienceLevel: ['beginner', 'intermediate', 'advanced'],
    days: [
      {
        dayName: 'Upper A',
        suggestedMuscleGroups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
        description: 'Complete upper body - horizontal focus',
      },
      {
        dayName: 'Lower A',
        suggestedMuscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'],
        description: 'Complete lower body - quad dominant',
      },
      {
        dayName: 'Upper B',
        suggestedMuscleGroups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
        description: 'Complete upper body - vertical focus',
      },
      {
        dayName: 'Lower B',
        suggestedMuscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'],
        description: 'Complete lower body - posterior chain focus',
      },
    ],
    pros: [
      'Good frequency (2x per week)',
      'Only 4 days required',
      'More recovery time',
      'Great for strength and size',
      'Beginner friendly',
    ],
    cons: [
      'Long workout sessions',
      'May feel fatiguing',
    ],
  },

  // FULL BODY
  {
    id: 'full-body-3day',
    name: 'Full Body (3 Day)',
    type: 'full-body',
    description: 'Train all major muscle groups in each session',
    daysPerWeek: 3,
    restDays: 4,
    experienceLevel: ['beginner', 'intermediate'],
    days: [
      {
        dayName: 'Full Body A',
        suggestedMuscleGroups: ['chest', 'back', 'quads', 'hamstrings', 'shoulders'],
        description: 'Compound movements focus',
      },
      {
        dayName: 'Full Body B',
        suggestedMuscleGroups: ['chest', 'back', 'quads', 'glutes', 'biceps', 'triceps'],
        description: 'Mix of compounds and accessories',
      },
      {
        dayName: 'Full Body C',
        suggestedMuscleGroups: ['back', 'chest', 'hamstrings', 'quads', 'shoulders'],
        description: 'Compound movements with different exercises',
      },
    ],
    pros: [
      'High frequency (3x per week per muscle)',
      'Only 3 days needed',
      'Flexible schedule',
      'Great for beginners',
      'Good for strength',
    ],
    cons: [
      'Long sessions',
      'May limit volume per muscle',
      'Can be tiring',
    ],
  },

  // BRO SPLIT
  {
    id: 'bro-split-5day',
    name: 'Bro Split (5 Day)',
    type: 'bro-split',
    description: 'One muscle group per day with high volume',
    daysPerWeek: 5,
    restDays: 2,
    experienceLevel: ['intermediate', 'advanced'],
    days: [
      {
        dayName: 'Chest Day',
        suggestedMuscleGroups: ['chest'],
        description: 'Complete chest annihilation',
      },
      {
        dayName: 'Back Day',
        suggestedMuscleGroups: ['back'],
        description: 'Complete back development',
      },
      {
        dayName: 'Shoulder Day',
        suggestedMuscleGroups: ['shoulders'],
        description: 'All three deltoid heads',
      },
      {
        dayName: 'Arm Day',
        suggestedMuscleGroups: ['biceps', 'triceps', 'forearms'],
        description: 'Biceps and triceps focus',
      },
      {
        dayName: 'Leg Day',
        suggestedMuscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'],
        description: 'Complete lower body',
      },
    ],
    pros: [
      'High volume per muscle',
      'Simple to understand',
      'Good muscle pump',
      'Short sessions',
    ],
    cons: [
      'Low frequency (1x per week)',
      'Not optimal for strength',
      'Slower progress for naturals',
      'Requires 5 days',
    ],
  },

  // ARNOLD SPLIT
  {
    id: 'arnold-split-6day',
    name: 'Arnold Split (6 Day)',
    type: 'custom',
    description: 'Classic bodybuilding split made famous by Arnold Schwarzenegger',
    daysPerWeek: 6,
    restDays: 1,
    experienceLevel: ['advanced'],
    days: [
      {
        dayName: 'Chest & Back A',
        suggestedMuscleGroups: ['chest', 'back'],
        description: 'Superset antagonistic muscles',
      },
      {
        dayName: 'Shoulders & Arms A',
        suggestedMuscleGroups: ['shoulders', 'biceps', 'triceps'],
        description: 'Complete shoulder and arm development',
      },
      {
        dayName: 'Legs A',
        suggestedMuscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'],
        description: 'Complete leg day',
      },
      {
        dayName: 'Chest & Back B',
        suggestedMuscleGroups: ['chest', 'back'],
        description: 'Different exercises, superset style',
      },
      {
        dayName: 'Shoulders & Arms B',
        suggestedMuscleGroups: ['shoulders', 'biceps', 'triceps'],
        description: 'Variation on shoulder and arm exercises',
      },
      {
        dayName: 'Legs B',
        suggestedMuscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'],
        description: 'Different leg exercises',
      },
    ],
    pros: [
      'High frequency (2x per week)',
      'Antagonist supersets save time',
      'Proven by legends',
      'Great pump',
    ],
    cons: [
      'Very demanding',
      'Long sessions',
      'Advanced only',
      'Requires excellent recovery',
    ],
  },

  // PHUL (Power Hypertrophy Upper Lower)
  {
    id: 'phul-4day',
    name: 'PHUL (4 Day)',
    type: 'upper-lower',
    description: 'Power Hypertrophy Upper Lower - strength and size focus',
    daysPerWeek: 4,
    restDays: 3,
    experienceLevel: ['intermediate', 'advanced'],
    days: [
      {
        dayName: 'Upper Power',
        suggestedMuscleGroups: ['chest', 'back', 'shoulders'],
        description: 'Heavy compound movements, low reps',
      },
      {
        dayName: 'Lower Power',
        suggestedMuscleGroups: ['quads', 'hamstrings', 'glutes'],
        description: 'Heavy squats and deadlifts, low reps',
      },
      {
        dayName: 'Upper Hypertrophy',
        suggestedMuscleGroups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
        description: 'Higher volume, moderate reps',
      },
      {
        dayName: 'Lower Hypertrophy',
        suggestedMuscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'],
        description: 'Higher volume leg work, moderate reps',
      },
    ],
    pros: [
      'Combines strength and size',
      'Periodization built in',
      'Only 4 days needed',
      'Well-rounded development',
    ],
    cons: [
      'Requires understanding of power vs hypertrophy',
      'Can be intense',
      'Not for pure beginners',
    ],
  },

  // PHAT (Power Hypertrophy Adaptive Training)
  {
    id: 'phat-5day',
    name: 'PHAT (5 Day)',
    type: 'custom',
    description: 'Power Hypertrophy Adaptive Training - advanced periodization',
    daysPerWeek: 5,
    restDays: 2,
    experienceLevel: ['advanced'],
    days: [
      {
        dayName: 'Upper Power',
        suggestedMuscleGroups: ['chest', 'back', 'shoulders'],
        description: 'Heavy pressing and pulling, 3-5 reps',
      },
      {
        dayName: 'Lower Power',
        suggestedMuscleGroups: ['quads', 'hamstrings', 'glutes'],
        description: 'Heavy squats and deadlifts, 3-5 reps',
      },
      {
        dayName: 'Back & Shoulders Hypertrophy',
        suggestedMuscleGroups: ['back', 'shoulders'],
        description: 'High volume back and delts, 8-12 reps',
      },
      {
        dayName: 'Chest & Arms Hypertrophy',
        suggestedMuscleGroups: ['chest', 'biceps', 'triceps'],
        description: 'High volume chest and arms, 8-12 reps',
      },
      {
        dayName: 'Legs Hypertrophy',
        suggestedMuscleGroups: ['quads', 'hamstrings', 'glutes', 'calves'],
        description: 'High volume legs, 8-15 reps',
      },
    ],
    pros: [
      'Optimal for strength and size',
      'High frequency for hypertrophy',
      'Advanced periodization',
      'Proven results',
    ],
    cons: [
      'Very demanding',
      'Requires 5 days',
      'Advanced lifters only',
      'High recovery needs',
    ],
  },

  // PUSH PULL (4 Day)
  {
    id: 'push-pull-4day',
    name: 'Push Pull (4 Day)',
    type: 'push-pull',
    description: 'Simple push and pull split without dedicated leg days',
    daysPerWeek: 4,
    restDays: 3,
    experienceLevel: ['beginner', 'intermediate'],
    days: [
      {
        dayName: 'Push A',
        suggestedMuscleGroups: ['chest', 'shoulders', 'triceps', 'quads'],
        description: 'Push muscles plus squats',
      },
      {
        dayName: 'Pull A',
        suggestedMuscleGroups: ['back', 'biceps', 'hamstrings'],
        description: 'Pull muscles plus deadlifts/RDLs',
      },
      {
        dayName: 'Push B',
        suggestedMuscleGroups: ['chest', 'shoulders', 'triceps', 'quads'],
        description: 'Push muscles with variation',
      },
      {
        dayName: 'Pull B',
        suggestedMuscleGroups: ['back', 'biceps', 'hamstrings', 'glutes'],
        description: 'Pull muscles with variation',
      },
    ],
    pros: [
      'Simple to follow',
      'Good frequency',
      'Integrates legs naturally',
      'Only 4 days needed',
    ],
    cons: [
      'Less leg volume than PPL',
      'Long sessions',
    ],
  },
];

// Helper functions
export const getSplitById = (id: string): PresetSplit | undefined => {
  return PRESET_SPLITS.find((split) => split.id === id);
};

export const getSplitsByExperience = (level: ExperienceLevel): PresetSplit[] => {
  return PRESET_SPLITS.filter((split) => split.experienceLevel.includes(level));
};

export const getSplitsByDays = (days: number): PresetSplit[] => {
  return PRESET_SPLITS.filter((split) => split.daysPerWeek === days);
};

export const getSplitsByType = (type: SplitType): PresetSplit[] => {
  return PRESET_SPLITS.filter((split) => split.type === type);
};

