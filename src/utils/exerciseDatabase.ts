// Comprehensive Exercise Database with Muscle Group Mappings
import { Exercise, MuscleGroup, Equipment, MovementCategory, SubRegion } from '../types/workout';

// Exercise data with full metadata
export const EXERCISE_DATABASE: Exercise[] = [
  // CHEST EXERCISES
  {
    id: 'bench-press',
    name: 'Bench Press',
    movementCategory: 'horizontal-push',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    equipment: ['barbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'chest-mid', weight: 0.7 },
      { region: 'chest-lower', weight: 0.3 },
    ],
    substitutions: ['dumbbell-press', 'incline-bench-press'],
    formNotes: 'Keep shoulder blades retracted, feet flat on ground',
  },
  {
    id: 'incline-bench-press',
    name: 'Incline Bench Press',
    movementCategory: 'horizontal-push',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    equipment: ['barbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'chest-upper', weight: 0.8 },
      { region: 'chest-mid', weight: 0.2 },
    ],
    substitutions: ['incline-dumbbell-press', 'bench-press'],
    formNotes: 'Set bench to 30-45 degrees for optimal upper chest activation',
  },
  {
    id: 'decline-bench-press',
    name: 'Decline Bench Press',
    movementCategory: 'horizontal-push',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps'],
    equipment: ['barbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'chest-lower', weight: 0.9 },
      { region: 'chest-mid', weight: 0.1 },
    ],
    substitutions: ['dips', 'bench-press'],
  },
  {
    id: 'dumbbell-press',
    name: 'Dumbbell Press',
    movementCategory: 'horizontal-push',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders'],
    equipment: ['dumbbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'chest-mid', weight: 0.7 },
      { region: 'chest-upper', weight: 0.3 },
    ],
    substitutions: ['bench-press', 'push-ups'],
  },
  {
    id: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    movementCategory: 'horizontal-push',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    equipment: ['dumbbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'chest-upper', weight: 0.8 },
      { region: 'chest-mid', weight: 0.2 },
    ],
    substitutions: ['incline-bench-press', 'dumbbell-press'],
  },
  {
    id: 'chest-fly',
    name: 'Chest Fly',
    movementCategory: 'isolation',
    primaryMuscles: ['chest'],
    secondaryMuscles: [],
    equipment: ['dumbbell'],
    isUnilateral: false,
    trackE1RM: false,
    subRegionWeights: [
      { region: 'chest-mid', weight: 1.0 },
    ],
    substitutions: ['cable-fly', 'pec-deck'],
  },
  {
    id: 'cable-fly',
    name: 'Cable Fly',
    movementCategory: 'isolation',
    primaryMuscles: ['chest'],
    secondaryMuscles: [],
    equipment: ['cable'],
    isUnilateral: false,
    trackE1RM: false,
    subRegionWeights: [
      { region: 'chest-mid', weight: 1.0 },
    ],
    substitutions: ['chest-fly', 'pec-deck'],
  },
  {
    id: 'push-ups',
    name: 'Push-ups',
    movementCategory: 'horizontal-push',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders', 'core'],
    equipment: ['bodyweight'],
    isUnilateral: false,
    trackE1RM: false,
    subRegionWeights: [
      { region: 'chest-mid', weight: 0.6 },
      { region: 'chest-lower', weight: 0.4 },
    ],
    substitutions: ['dumbbell-press', 'bench-press'],
  },
  {
    id: 'dips',
    name: 'Dips',
    movementCategory: 'vertical-push',
    primaryMuscles: ['chest', 'triceps'],
    secondaryMuscles: ['shoulders'],
    equipment: ['bodyweight'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'chest-lower', weight: 0.7 },
      { region: 'triceps', weight: 0.3 },
    ],
    substitutions: ['decline-bench-press', 'close-grip-bench'],
    formNotes: 'Lean forward for more chest activation, upright for triceps',
  },

  // BACK EXERCISES
  {
    id: 'deadlift',
    name: 'Deadlift',
    movementCategory: 'hinge',
    primaryMuscles: ['back', 'glutes', 'hamstrings'],
    secondaryMuscles: ['quads', 'core'],
    equipment: ['barbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'back-erectors', weight: 0.6 },
      { region: 'back-upper', weight: 0.4 },
    ],
    substitutions: ['romanian-deadlift', 't-bar-row'],
    formNotes: 'Keep spine neutral, drive through heels',
  },
  {
    id: 'barbell-row',
    name: 'Barbell Row',
    movementCategory: 'horizontal-pull',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps', 'shoulders'],
    equipment: ['barbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'back-lats', weight: 0.6 },
      { region: 'back-upper', weight: 0.4 },
    ],
    substitutions: ['dumbbell-row', 't-bar-row'],
  },
  {
    id: 'dumbbell-row',
    name: 'Dumbbell Row',
    movementCategory: 'horizontal-pull',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps'],
    equipment: ['dumbbell'],
    isUnilateral: true,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'back-lats', weight: 0.7 },
      { region: 'back-upper', weight: 0.3 },
    ],
    substitutions: ['barbell-row', 'cable-row'],
  },
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    movementCategory: 'vertical-pull',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps'],
    equipment: ['bodyweight'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'back-lats', weight: 1.0 },
    ],
    substitutions: ['lat-pulldown', 'chin-ups'],
  },
  {
    id: 'chin-ups',
    name: 'Chin-ups',
    movementCategory: 'vertical-pull',
    primaryMuscles: ['back', 'biceps'],
    secondaryMuscles: [],
    equipment: ['bodyweight'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'back-lats', weight: 0.7 },
      { region: 'biceps', weight: 0.3 },
    ],
    substitutions: ['pull-ups', 'lat-pulldown'],
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    movementCategory: 'vertical-pull',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps'],
    equipment: ['machine', 'cable'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'back-lats', weight: 1.0 },
    ],
    substitutions: ['pull-ups', 'chin-ups'],
  },
  {
    id: 'seated-cable-row',
    name: 'Seated Cable Row',
    movementCategory: 'horizontal-pull',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps'],
    equipment: ['cable', 'machine'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'back-upper', weight: 0.6 },
      { region: 'back-lats', weight: 0.4 },
    ],
    substitutions: ['barbell-row', 't-bar-row'],
  },
  {
    id: 't-bar-row',
    name: 'T-Bar Row',
    movementCategory: 'horizontal-pull',
    primaryMuscles: ['back'],
    secondaryMuscles: ['biceps'],
    equipment: ['barbell', 'landmine'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'back-upper', weight: 0.7 },
      { region: 'back-lats', weight: 0.3 },
    ],
    substitutions: ['barbell-row', 'dumbbell-row'],
  },
  {
    id: 'face-pulls',
    name: 'Face Pulls',
    movementCategory: 'horizontal-pull',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['back'],
    equipment: ['cable'],
    isUnilateral: false,
    trackE1RM: false,
    subRegionWeights: [
      { region: 'shoulders-posterior', weight: 0.7 },
      { region: 'back-upper', weight: 0.3 },
    ],
    substitutions: ['rear-delt-fly', 'reverse-fly'],
  },
  {
    id: 'shrugs',
    name: 'Shrugs',
    movementCategory: 'isolation',
    primaryMuscles: ['back'],
    secondaryMuscles: [],
    equipment: ['dumbbell', 'barbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'back-upper', weight: 1.0 },
    ],
    substitutions: [],
  },

  // SHOULDER EXERCISES
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    movementCategory: 'vertical-push',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'core'],
    equipment: ['barbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'shoulders-anterior', weight: 0.6 },
      { region: 'shoulders-lateral', weight: 0.4 },
    ],
    substitutions: ['dumbbell-shoulder-press', 'military-press'],
  },
  {
    id: 'military-press',
    name: 'Military Press',
    movementCategory: 'vertical-push',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'core'],
    equipment: ['barbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'shoulders-anterior', weight: 0.7 },
      { region: 'shoulders-lateral', weight: 0.3 },
    ],
    substitutions: ['overhead-press', 'dumbbell-shoulder-press'],
  },
  {
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    movementCategory: 'vertical-push',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
    equipment: ['dumbbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'shoulders-anterior', weight: 0.6 },
      { region: 'shoulders-lateral', weight: 0.4 },
    ],
    substitutions: ['overhead-press', 'arnold-press'],
  },
  {
    id: 'lateral-raises',
    name: 'Lateral Raises',
    movementCategory: 'isolation',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: [],
    equipment: ['dumbbell', 'cable'],
    isUnilateral: false,
    trackE1RM: false,
    subRegionWeights: [
      { region: 'shoulders-lateral', weight: 1.0 },
    ],
    substitutions: [],
  },
  {
    id: 'front-raises',
    name: 'Front Raises',
    movementCategory: 'isolation',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: [],
    equipment: ['dumbbell', 'cable', 'barbell'],
    isUnilateral: false,
    trackE1RM: false,
    subRegionWeights: [
      { region: 'shoulders-anterior', weight: 1.0 },
    ],
    substitutions: [],
  },
  {
    id: 'rear-delt-fly',
    name: 'Rear Delt Fly',
    movementCategory: 'isolation',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['back'],
    equipment: ['dumbbell', 'cable'],
    isUnilateral: false,
    trackE1RM: false,
    subRegionWeights: [
      { region: 'shoulders-posterior', weight: 1.0 },
    ],
    substitutions: ['face-pulls', 'reverse-fly'],
  },
  {
    id: 'arnold-press',
    name: 'Arnold Press',
    movementCategory: 'vertical-push',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps'],
    equipment: ['dumbbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'shoulders-anterior', weight: 0.5 },
      { region: 'shoulders-lateral', weight: 0.5 },
    ],
    substitutions: ['dumbbell-shoulder-press', 'overhead-press'],
  },
  {
    id: 'upright-row',
    name: 'Upright Row',
    movementCategory: 'vertical-pull',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['back'],
    equipment: ['barbell', 'dumbbell', 'cable'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'shoulders-lateral', weight: 0.7 },
      { region: 'back-upper', weight: 0.3 },
    ],
    substitutions: ['lateral-raises'],
    limitations: ['shoulder-friendly'],
  },

  // BICEPS EXERCISES
  {
    id: 'barbell-curl',
    name: 'Barbell Curl',
    movementCategory: 'isolation',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: ['barbell', 'ez-bar'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'biceps', weight: 1.0 },
    ],
    substitutions: ['dumbbell-curl', 'cable-curl'],
  },
  {
    id: 'dumbbell-curl',
    name: 'Dumbbell Curl',
    movementCategory: 'isolation',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    equipment: ['dumbbell'],
    isUnilateral: true,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'biceps', weight: 1.0 },
    ],
    substitutions: ['barbell-curl', 'hammer-curl'],
  },
  {
    id: 'hammer-curl',
    name: 'Hammer Curl',
    movementCategory: 'isolation',
    primaryMuscles: ['biceps', 'forearms'],
    secondaryMuscles: [],
    equipment: ['dumbbell'],
    isUnilateral: true,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'biceps', weight: 0.7 },
      { region: 'forearms', weight: 0.3 },
    ],
    substitutions: ['dumbbell-curl', 'cable-curl'],
  },
  {
    id: 'preacher-curl',
    name: 'Preacher Curl',
    movementCategory: 'isolation',
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
    equipment: ['barbell', 'dumbbell', 'ez-bar', 'machine'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'biceps', weight: 1.0 },
    ],
    substitutions: ['barbell-curl', 'concentration-curl'],
  },
  {
    id: 'concentration-curl',
    name: 'Concentration Curl',
    movementCategory: 'isolation',
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
    equipment: ['dumbbell'],
    isUnilateral: true,
    trackE1RM: false,
    subRegionWeights: [
      { region: 'biceps', weight: 1.0 },
    ],
    substitutions: ['preacher-curl', 'dumbbell-curl'],
  },
  {
    id: 'cable-curl',
    name: 'Cable Curl',
    movementCategory: 'isolation',
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
    equipment: ['cable'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'biceps', weight: 1.0 },
    ],
    substitutions: ['barbell-curl', 'dumbbell-curl'],
  },

  // TRICEPS EXERCISES
  {
    id: 'close-grip-bench',
    name: 'Close Grip Bench Press',
    movementCategory: 'horizontal-push',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['chest', 'shoulders'],
    equipment: ['barbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'triceps', weight: 0.8 },
      { region: 'chest-mid', weight: 0.2 },
    ],
    substitutions: ['tricep-dips', 'skull-crushers'],
  },
  {
    id: 'tricep-dips',
    name: 'Tricep Dips',
    movementCategory: 'vertical-push',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['chest', 'shoulders'],
    equipment: ['bodyweight'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'triceps', weight: 1.0 },
    ],
    substitutions: ['close-grip-bench', 'dips'],
  },
  {
    id: 'overhead-tricep-extension',
    name: 'Overhead Tricep Extension',
    movementCategory: 'isolation',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    equipment: ['dumbbell', 'cable'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'triceps', weight: 1.0 },
    ],
    substitutions: ['skull-crushers', 'tricep-pushdown'],
  },
  {
    id: 'skull-crushers',
    name: 'Skull Crushers',
    movementCategory: 'isolation',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    equipment: ['barbell', 'dumbbell', 'ez-bar'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'triceps', weight: 1.0 },
    ],
    substitutions: ['overhead-tricep-extension', 'close-grip-bench'],
  },
  {
    id: 'tricep-pushdown',
    name: 'Tricep Pushdown',
    movementCategory: 'isolation',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    equipment: ['cable'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'triceps', weight: 1.0 },
    ],
    substitutions: ['overhead-tricep-extension', 'skull-crushers'],
  },
  {
    id: 'diamond-push-ups',
    name: 'Diamond Push-ups',
    movementCategory: 'horizontal-push',
    primaryMuscles: ['triceps'],
    secondaryMuscles: ['chest'],
    equipment: ['bodyweight'],
    isUnilateral: false,
    trackE1RM: false,
    subRegionWeights: [
      { region: 'triceps', weight: 0.8 },
      { region: 'chest-mid', weight: 0.2 },
    ],
    substitutions: ['close-grip-bench', 'tricep-pushdown'],
  },

  // LEG EXERCISES - QUADS
  {
    id: 'squat',
    name: 'Squat',
    movementCategory: 'squat',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'core'],
    equipment: ['barbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'quads', weight: 0.6 },
      { region: 'glutes', weight: 0.4 },
    ],
    substitutions: ['leg-press', 'front-squat'],
    formNotes: 'Keep chest up, knees tracking over toes',
  },
  {
    id: 'front-squat',
    name: 'Front Squat',
    movementCategory: 'squat',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['core', 'glutes'],
    equipment: ['barbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'quads', weight: 0.8 },
      { region: 'glutes', weight: 0.2 },
    ],
    substitutions: ['squat', 'hack-squat'],
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    movementCategory: 'squat',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes', 'hamstrings'],
    equipment: ['machine'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'quads', weight: 0.7 },
      { region: 'glutes', weight: 0.3 },
    ],
    substitutions: ['squat', 'hack-squat'],
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    movementCategory: 'isolation',
    primaryMuscles: ['quads'],
    secondaryMuscles: [],
    equipment: ['machine'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'quads', weight: 1.0 },
    ],
    substitutions: [],
    limitations: ['knee-friendly'],
  },
  {
    id: 'lunges',
    name: 'Lunges',
    movementCategory: 'squat',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    equipment: ['dumbbell', 'barbell', 'bodyweight'],
    isUnilateral: true,
    trackE1RM: false,
    subRegionWeights: [
      { region: 'quads', weight: 0.6 },
      { region: 'glutes', weight: 0.4 },
    ],
    substitutions: ['bulgarian-split-squat', 'leg-press'],
  },
  {
    id: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    movementCategory: 'squat',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings'],
    equipment: ['dumbbell', 'barbell', 'bodyweight'],
    isUnilateral: true,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'quads', weight: 0.6 },
      { region: 'glutes', weight: 0.4 },
    ],
    substitutions: ['lunges', 'leg-press'],
  },
  {
    id: 'hack-squat',
    name: 'Hack Squat',
    movementCategory: 'squat',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes'],
    equipment: ['machine'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'quads', weight: 0.9 },
      { region: 'glutes', weight: 0.1 },
    ],
    substitutions: ['leg-press', 'front-squat'],
  },

  // LEG EXERCISES - HAMSTRINGS
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    movementCategory: 'hinge',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['back'],
    equipment: ['barbell', 'dumbbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'hamstrings', weight: 0.7 },
      { region: 'glutes', weight: 0.3 },
    ],
    substitutions: ['deadlift', 'leg-curl'],
  },
  {
    id: 'leg-curl',
    name: 'Leg Curl',
    movementCategory: 'isolation',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: [],
    equipment: ['machine'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'hamstrings', weight: 1.0 },
    ],
    substitutions: ['romanian-deadlift', 'nordic-curls'],
  },
  {
    id: 'good-mornings',
    name: 'Good Mornings',
    movementCategory: 'hinge',
    primaryMuscles: ['hamstrings', 'glutes'],
    secondaryMuscles: ['back'],
    equipment: ['barbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'hamstrings', weight: 0.6 },
      { region: 'glutes', weight: 0.4 },
    ],
    substitutions: ['romanian-deadlift', 'deadlift'],
  },
  {
    id: 'nordic-curls',
    name: 'Nordic Curls',
    movementCategory: 'isolation',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: [],
    equipment: ['bodyweight'],
    isUnilateral: false,
    trackE1RM: false,
    subRegionWeights: [
      { region: 'hamstrings', weight: 1.0 },
    ],
    substitutions: ['leg-curl'],
  },

  // LEG EXERCISES - GLUTES
  {
    id: 'hip-thrust',
    name: 'Hip Thrust',
    movementCategory: 'hinge',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings'],
    equipment: ['barbell', 'dumbbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'glutes', weight: 1.0 },
    ],
    substitutions: ['glute-bridge', 'deadlift'],
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    movementCategory: 'hinge',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings'],
    equipment: ['barbell', 'dumbbell', 'bodyweight'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'glutes', weight: 1.0 },
    ],
    substitutions: ['hip-thrust'],
  },
  {
    id: 'cable-kickbacks',
    name: 'Cable Kickbacks',
    movementCategory: 'isolation',
    primaryMuscles: ['glutes'],
    secondaryMuscles: [],
    equipment: ['cable'],
    isUnilateral: true,
    trackE1RM: false,
    subRegionWeights: [
      { region: 'glutes', weight: 1.0 },
    ],
    substitutions: ['hip-thrust', 'glute-bridge'],
  },

  // LEG EXERCISES - CALVES
  {
    id: 'calf-raises',
    name: 'Calf Raises',
    movementCategory: 'isolation',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    equipment: ['machine', 'dumbbell', 'barbell'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'calves', weight: 1.0 },
    ],
    substitutions: ['seated-calf-raises'],
  },
  {
    id: 'seated-calf-raises',
    name: 'Seated Calf Raises',
    movementCategory: 'isolation',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    equipment: ['machine'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'calves', weight: 1.0 },
    ],
    substitutions: ['calf-raises'],
  },

  // CORE EXERCISES
  {
    id: 'plank',
    name: 'Plank',
    movementCategory: 'core',
    primaryMuscles: ['core'],
    secondaryMuscles: [],
    equipment: ['bodyweight'],
    isUnilateral: false,
    trackE1RM: false,
    subRegionWeights: [
      { region: 'core-upper', weight: 0.6 },
      { region: 'core-lower', weight: 0.4 },
    ],
    substitutions: ['ab-wheel'],
  },
  {
    id: 'side-plank',
    name: 'Side Plank',
    movementCategory: 'core',
    primaryMuscles: ['obliques'],
    secondaryMuscles: ['core'],
    equipment: ['bodyweight'],
    isUnilateral: true,
    trackE1RM: false,
    subRegionWeights: [
      { region: 'obliques', weight: 1.0 },
    ],
    substitutions: ['russian-twists'],
  },
  {
    id: 'crunches',
    name: 'Crunches',
    movementCategory: 'core',
    primaryMuscles: ['core'],
    secondaryMuscles: [],
    equipment: ['bodyweight'],
    isUnilateral: false,
    trackE1RM: false,
    subRegionWeights: [
      { region: 'core-upper', weight: 1.0 },
    ],
    substitutions: ['cable-crunches', 'leg-raises'],
  },
  {
    id: 'russian-twists',
    name: 'Russian Twists',
    movementCategory: 'core',
    primaryMuscles: ['obliques'],
    secondaryMuscles: ['core'],
    equipment: ['dumbbell', 'bodyweight'],
    isUnilateral: false,
    trackE1RM: false,
    subRegionWeights: [
      { region: 'obliques', weight: 1.0 },
    ],
    substitutions: ['side-plank'],
  },
  {
    id: 'leg-raises',
    name: 'Leg Raises',
    movementCategory: 'core',
    primaryMuscles: ['core'],
    secondaryMuscles: [],
    equipment: ['bodyweight'],
    isUnilateral: false,
    trackE1RM: false,
    subRegionWeights: [
      { region: 'core-lower', weight: 1.0 },
    ],
    substitutions: ['crunches', 'cable-crunches'],
  },
  {
    id: 'cable-crunches',
    name: 'Cable Crunches',
    movementCategory: 'core',
    primaryMuscles: ['core'],
    secondaryMuscles: [],
    equipment: ['cable'],
    isUnilateral: false,
    trackE1RM: true,
    subRegionWeights: [
      { region: 'core-upper', weight: 1.0 },
    ],
    substitutions: ['crunches'],
  },
  {
    id: 'ab-wheel',
    name: 'Ab Wheel Rollout',
    movementCategory: 'core',
    primaryMuscles: ['core'],
    secondaryMuscles: [],
    equipment: ['bodyweight'],
    isUnilateral: false,
    trackE1RM: false,
    subRegionWeights: [
      { region: 'core-upper', weight: 0.6 },
      { region: 'core-lower', weight: 0.4 },
    ],
    substitutions: ['plank'],
  },
];

// Helper functions for exercise database
export const getExerciseById = (id: string): Exercise | undefined => {
  return EXERCISE_DATABASE.find((ex) => ex.id === id);
};

export const getExerciseByName = (name: string): Exercise | undefined => {
  return EXERCISE_DATABASE.find(
    (ex) => ex.name.toLowerCase() === name.toLowerCase()
  );
};

export const getExercisesByMuscleGroup = (muscle: MuscleGroup): Exercise[] => {
  return EXERCISE_DATABASE.filter(
    (ex) =>
      ex.primaryMuscles.includes(muscle) || ex.secondaryMuscles.includes(muscle)
  );
};

export const getExercisesByEquipment = (equipment: Equipment): Exercise[] => {
  return EXERCISE_DATABASE.filter((ex) => ex.equipment.includes(equipment));
};

export const searchExercises = (query: string): Exercise[] => {
  const lowerQuery = query.toLowerCase();
  return EXERCISE_DATABASE.filter((ex) =>
    ex.name.toLowerCase().includes(lowerQuery)
  );
};

export const getSubstitutions = (exerciseId: string): Exercise[] => {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return [];
  
  return exercise.substitutions
    .map((id) => getExerciseById(id))
    .filter((ex): ex is Exercise => ex !== undefined);
};

// Get all unique muscle groups from exercises
export const getAllMuscleGroups = (): MuscleGroup[] => {
  const muscles = new Set<MuscleGroup>();
  EXERCISE_DATABASE.forEach((ex) => {
    ex.primaryMuscles.forEach((m) => muscles.add(m));
    ex.secondaryMuscles.forEach((m) => muscles.add(m));
  });
  return Array.from(muscles);
};

// Get exercise names list (compatible with old GYM_EXERCISES)
export const getExerciseNames = (): string[] => {
  return EXERCISE_DATABASE.map((ex) => ex.name).sort();
};

