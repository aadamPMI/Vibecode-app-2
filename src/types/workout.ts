// Comprehensive workout system type definitions

// ============= ENUMS & CONSTANTS =============

export type MuscleGroup = 
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'forearms'
  | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'adductors'
  | 'core' | 'abs' | 'obliques';

export type SubRegion = 
  // Chest
  | 'chest-upper' | 'chest-mid' | 'chest-lower'
  // Back
  | 'back-lats' | 'back-upper' | 'back-erectors'
  // Shoulders
  | 'shoulders-anterior' | 'shoulders-lateral' | 'shoulders-posterior'
  // Arms
  | 'biceps' | 'triceps' | 'forearms'
  // Legs
  | 'quads' | 'hamstrings' | 'glutes' | 'adductors' | 'calves'
  // Core
  | 'core-upper' | 'core-lower' | 'obliques';

export type MovementCategory = 
  | 'hinge' | 'squat' | 'horizontal-push' | 'horizontal-pull'
  | 'vertical-push' | 'vertical-pull' | 'carry' | 'core'
  | 'isolation';

export type Equipment = 
  | 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight'
  | 'kettlebell' | 'band' | 'smith-machine' | 'ez-bar'
  | 'trap-bar' | 'landmine' | 'suspension';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type ProgramGoal = 'strength' | 'hypertrophy' | 'fat-loss' | 'mixed' | 'athlete';

export type SplitType = 
  | 'push-pull-legs' | 'upper-lower' | 'full-body' 
  | 'bro-split' | 'push-pull' | 'custom';

export type SetSchemeType = 
  | 'fixed-reps'        // e.g., 3x8
  | 'rep-range'         // e.g., 3x8-12
  | 'top-set-backoffs'  // e.g., 1x5 + 2x8 @ 80%
  | 'amrap'             // As many reps as possible
  | 'time-based';       // e.g., 3x30s plank

export type TargetSource = 
  | 'fixed'             // User sets specific weight
  | 'percent-e1rm'      // % of estimated 1RM
  | 'last-plus'         // Last session + increment
  | 'rir-target'        // Reps in reserve target
  | 'ai-suggested';     // AI determines from recent performance

export type SessionStatus = 'scheduled' | 'active' | 'paused' | 'completed' | 'skipped';

export type SetStatus = 'pending' | 'completed' | 'failed' | 'skipped';

// ============= CORE DATA STRUCTURES =============

export interface SubRegionWeight {
  region: SubRegion;
  weight: number; // 0-1, represents stimulus contribution
}

export interface Exercise {
  id: string;
  name: string;
  movementCategory: MovementCategory;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment[];
  isUnilateral: boolean;
  trackE1RM: boolean;
  subRegionWeights: SubRegionWeight[];
  substitutions: string[]; // exercise IDs
  formNotes?: string;
  limitations?: string[]; // e.g., 'shoulder-friendly', 'knee-friendly'
}

export interface SetScheme {
  type: SetSchemeType;
  sets: number;
  reps?: number;          // for fixed-reps
  repRangeMin?: number;   // for rep-range
  repRangeMax?: number;   // for rep-range
  topSetReps?: number;    // for top-set-backoffs
  backoffSets?: number;   // for top-set-backoffs
  backoffPercent?: number; // for top-set-backoffs (e.g., 0.8 = 80%)
  duration?: number;      // for time-based (seconds)
  restSeconds?: number;   // default rest between sets
}

export interface ExerciseTarget {
  exerciseId: string;
  setScheme: SetScheme;
  targetSource: TargetSource;
  fixedLoad?: number;     // if targetSource = 'fixed'
  e1rmPercent?: number;   // if targetSource = 'percent-e1rm'
  lastPlusIncrement?: number; // if targetSource = 'last-plus'
  rirTarget?: number;     // if targetSource = 'rir-target'
  tempo?: string;         // e.g., '3010' (eccentric-pause-concentric-pause)
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: ExerciseTarget[];
  estimatedDuration: number; // minutes
  createdAt: string;
  updatedAt: string;
}

export interface PeriodizationWeek {
  weekNumber: number;
  intensityModifier: number;  // e.g., 1.0 = normal, 0.7 = deload
  volumeModifier: number;     // e.g., 1.0 = normal, 1.2 = overreach
  isDeload: boolean;
}

export interface Split {
  id: string;
  name: string;
  type: SplitType;
  daysPerWeek: number;
  workoutTemplateIds: string[]; // ordered list
  rotationPattern: string[];    // e.g., ['Push', 'Pull', 'Legs', 'Rest']
}

export interface Program {
  id: string;
  name: string;
  description?: string;
  version: string; // e.g., '1.0', '1.1'
  experienceLevel?: ExperienceLevel;
  goals: ProgramGoal[];
  durationWeeks?: number;
  split: Split;
  workoutTemplates: WorkoutTemplate[];
  periodization: PeriodizationWeek[];
  schedule: {
    preferredDays: number[]; // 0=Sunday, 1=Monday, etc.
    autoShiftMissed: boolean;
  };
  subRegionTargets: SubRegionTarget[];
  isActive: boolean;
  isArchived: boolean;
  createdBy: 'user' | 'ai' | 'template';
  createdAt: string;
  updatedAt: string;
}

export interface SubRegionTarget {
  region: SubRegion;
  weeklyMin: number;    // minimum stimulus units per week
  weeklyMax: number;    // maximum stimulus units per week
}

// ============= SESSION & LOGGING =============

export interface SetLog {
  id: string;
  setNumber: number;
  targetReps?: number;
  targetLoad?: number;
  actualReps: number;
  actualLoad: number;
  rpe?: number;           // 1-10 scale
  timeSeconds?: number;   // for time-based sets
  status: SetStatus;
  notes?: string;
  completedAt: string;
}

export interface SessionExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;   // denormalized for convenience
  targetScheme: SetScheme;
  sets: SetLog[];
  substitutedFrom?: string; // if user swapped exercise
  skipped: boolean;
  completedAt?: string;
}

export interface Session {
  id: string;
  programId: string;
  programVersion: string;
  workoutTemplateId: string;
  workoutName: string;    // denormalized
  weekNumber: number;
  dayNumber: number;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  pausedAt?: string;
  status: SessionStatus;
  exercises: SessionExercise[];
  totalVolume: number;    // kg or lbs
  totalSets: number;
  duration?: number;      // minutes
  notes?: string;
  prEvents: PREvent[];
  aiCoachTip?: string;
}

export interface PREvent {
  type: 'volume' | 'e1rm' | 'rep' | 'streak';
  exerciseId?: string;
  exerciseName?: string;
  previousValue?: number;
  newValue: number;
  description: string;
  date: string;
}

// ============= E1RM TRACKING =============

export interface E1RMEntry {
  exerciseId: string;
  e1rm: number;
  unit: 'kg' | 'lbs';
  date: string;
  source: 'calculated' | 'tested' | 'estimated';
  basedOnReps?: number;   // if calculated
  basedOnLoad?: number;   // if calculated
}

export interface E1RMHistory {
  exerciseId: string;
  exerciseName: string;
  entries: E1RMEntry[];
  currentE1RM: number;
  unit: 'kg' | 'lbs';
}

// ============= PROGRESSION =============

export interface ProgressionRule {
  id: string;
  name: string;
  description: string;
  type: SetSchemeType;
  // For fixed-reps
  repsCompletedEasy?: { action: 'increase-load'; increment: number };
  repsCompletedHard?: { action: 'hold-load' | 'decrease-load'; amount?: number };
  repsMissed?: { action: 'decrease-load'; amount: number };
  // For rep-range
  topOfRangeComfortable?: { action: 'increase-load'; increment: number };
  // Safety
  maxWeeklyIncrease: number; // percentage
  maxAbsoluteIncrease?: number; // in kg or lbs
  aiAssisted: boolean;
}

export interface ProgressionResult {
  exerciseId: string;
  nextTarget: {
    load?: number;
    reps?: number;
    repRangeMin?: number;
    repRangeMax?: number;
  };
  reason: string;
  appliedRule: string;
  aiSuggestion?: {
    suggestedLoad?: number;
    suggestedReps?: number;
    reason: string;
    confidence: number; // 0-1
  };
  timestamp: string;
}

// ============= SUB-REGION TRACKING =============

export interface SubRegionStimulus {
  region: SubRegion;
  weeklyTotal: number;
  target: SubRegionTarget;
  contributingExercises: {
    exerciseId: string;
    exerciseName: string;
    stimulus: number;
  }[];
  weekStart: string;
  weekEnd: string;
}

// ============= AI RESPONSES =============

export interface AIExerciseMatch {
  exerciseId: string;
  exerciseName: string;
  reason: string;
  confidence: number; // 0-1
}

export interface AIProgramValidation {
  valid: boolean;
  issues: {
    severity: 'error' | 'warning' | 'info';
    type: 'volume' | 'balance' | 'recovery' | 'equipment' | 'progression';
    message: string;
    affectedExercises?: string[];
    suggestedFix?: string;
  }[];
  subRegionBalance: {
    region: SubRegion;
    status: 'under' | 'optimal' | 'over';
    currentStimulus: number;
    targetRange: [number, number];
  }[];
}

export interface AIProgressionSuggestion {
  exerciseId: string;
  suggestedLoad?: number;
  suggestedReps?: number;
  suggestedAction: 'increase' | 'hold' | 'decrease' | 'deload';
  reason: string;
  signals: string[]; // e.g., ['rpe-high', 'sleep-low', 'performance-down']
  confidence: number;
}

export interface AICoachTip {
  category: 'form' | 'balance' | 'recovery' | 'progression' | 'general';
  shortTip: string;
  detailedExplanation?: string;
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface AIRecoveryRecommendation {
  shouldDeload: boolean;
  reason: string;
  recommendedActions: string[];
  affectedExercises?: string[];
  deloadWeekSuggestion?: {
    intensityModifier: number;
    volumeModifier: number;
    duration: number; // weeks
  };
}

// ============= USER PREFERENCES =============

export interface UserWorkoutPreferences {
  unit: 'kg' | 'lbs';
  plateIncrements: {
    kg: number[];    // e.g., [1.25, 2.5, 5, 10, 20]
    lbs: number[];   // e.g., [2.5, 5, 10, 25, 45]
  };
  defaultRestSeconds: number;
  trackRPE: boolean;
  aiAssistLevel: 'off' | 'conservative' | 'balanced' | 'performance';
  enableSubRegionTracking: boolean;
  injuryFlags: string[];
  availableEquipment: Equipment[];
}

// ============= ANALYTICS =============

export interface WorkoutStreak {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string;
}

export interface VolumeByMuscle {
  muscleGroup: MuscleGroup;
  weeklyVolume: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  last4Weeks: number[];
}

export interface WorkoutStats {
  totalSessions: number;
  totalVolume: number;
  totalSets: number;
  totalHours: number;
  averageSessionDuration: number;
  prCount: number;
  streak: WorkoutStreak;
  volumeByMuscle: VolumeByMuscle[];
  e1rmProgress: {
    exerciseId: string;
    exerciseName: string;
    startE1RM: number;
    currentE1RM: number;
    percentChange: number;
  }[];
}

// ============= PROGRAM DAY & WEEKLY LAYOUT =============

export type DayType = 'workout' | 'rest';

export interface ProgramDay {
  id: string;
  programId: string;
  weekday: number; // 1=Mon, 2=Tue, ..., 7=Sun
  type: DayType;
  workoutTemplateId?: string; // null if rest day
  workoutName?: string; // denormalized for quick display
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyPlannerDay {
  weekday: number; // 1=Mon, 2=Tue, ..., 7=Sun
  dayLabel: string; // 'Mon', 'Tue', etc.
  type: DayType;
  workoutName?: string;
  workoutTemplateId?: string;
  programDayId?: string;
}

