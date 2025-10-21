// Scheduler - Daily plan resolution and session scheduling
import {
  Program,
  WorkoutTemplate,
  Session,
  SessionStatus,
  SessionExercise,
  SetLog,
} from "../types/workout";
import { getExerciseById } from "../constants/exerciseData";

/**
 * Get today's scheduled workout from active program
 */
export function getTodaysWorkout(program: Program, today: Date): {
  template: WorkoutTemplate | null;
  weekNumber: number;
  dayNumber: number;
  reason: string;
} {
  // Calculate program week and day
  const programStartDate = new Date(program.createdAt);
  const daysSinceStart = Math.floor((today.getTime() - programStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(daysSinceStart / 7) + 1;
  const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, etc.
  
  // Check if we're past program duration
  if (weekNumber > program.durationWeeks) {
    return {
      template: null,
      weekNumber,
      dayNumber: dayOfWeek,
      reason: 'Program completed. Time to start a new one!',
    };
  }
  
  // Get the workout template for today based on split rotation
  const rotationIndex = daysSinceStart % program.split.rotationPattern.length;
  const todayPattern = program.split.rotationPattern[rotationIndex];
  
  // If it's a rest day
  if (todayPattern.toLowerCase() === 'rest') {
    return {
      template: null,
      weekNumber,
      dayNumber: dayOfWeek,
      reason: 'Rest day - recovery is part of the process!',
    };
  }
  
  // Find matching workout template
  const template = program.workoutTemplates.find(t => 
    t.name.toLowerCase().includes(todayPattern.toLowerCase())
  );
  
  if (!template) {
    return {
      template: null,
      weekNumber,
      dayNumber: dayOfWeek,
      reason: `Workout "${todayPattern}" not found in program`,
    };
  }
  
  return {
    template,
    weekNumber,
    dayNumber: dayOfWeek,
    reason: `Week ${weekNumber}, Day ${dayOfWeek + 1}: ${template.name}`,
  };
}

/**
 * Get upcoming workouts for the next N days
 */
export function getUpcomingWorkouts(program: Program, fromDate: Date, days: number): Array<{
  date: Date;
  template: WorkoutTemplate | null;
  dayName: string;
  isRestDay: boolean;
}> {
  const upcoming: Array<{
    date: Date;
    template: WorkoutTemplate | null;
    dayName: string;
    isRestDay: boolean;
  }> = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(fromDate);
    date.setDate(fromDate.getDate() + i);
    
    const { template } = getTodaysWorkout(program, date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    upcoming.push({
      date,
      template,
      dayName: dayNames[date.getDay()],
      isRestDay: template === null,
    });
  }
  
  return upcoming;
}

/**
 * Create a new session from a workout template
 */
export function createSessionFromTemplate(
  program: Program,
  template: WorkoutTemplate,
  scheduledDate: Date,
  weekNumber: number,
  dayNumber: number,
  lastSessionExercises?: SessionExercise[]
): Session {
  // Build exercises with targets
  const exercises: SessionExercise[] = template.exercises.map((exTarget, index) => {
    const exercise = getExerciseById(exTarget.exerciseId);
    
    // Pre-populate set logs based on set scheme
    const sets: SetLog[] = [];
    for (let i = 0; i < exTarget.setScheme.sets; i++) {
      // Try to pre-fill from last session
      const lastExercise = lastSessionExercises?.find(e => e.exerciseId === exTarget.exerciseId);
      const lastSet = lastExercise?.sets[i];
      
      sets.push({
        id: `set-${Date.now()}-${i}`,
        setNumber: i + 1,
        targetReps: exTarget.setScheme.reps,
        targetLoad: lastSet?.actualLoad || undefined, // Pre-fill from last time
        actualReps: 0,
        actualLoad: 0,
        status: 'pending',
        completedAt: '',
      });
    }
    
    return {
      id: `exercise-${Date.now()}-${index}`,
      exerciseId: exTarget.exerciseId,
      exerciseName: exercise?.name || exTarget.exerciseId,
      targetScheme: exTarget.setScheme,
      sets,
      skipped: false,
      order: exTarget.order,
    };
  });
  
  return {
    id: `session-${Date.now()}`,
    programId: program.id,
    programVersion: program.version,
    workoutTemplateId: template.id,
    workoutName: template.name,
    weekNumber,
    dayNumber,
    scheduledDate: scheduledDate.toISOString(),
    status: 'scheduled',
    exercises,
    totalVolume: 0,
    totalSets: 0,
    prEvents: [],
    notes: '',
    isOfflineLogged: false,
  };
}

/**
 * Check for missed sessions and suggest make-up plan
 */
export function checkMissedSessions(
  program: Program,
  sessions: Session[],
  today: Date
): {
  missedCount: number;
  missedDates: string[];
  suggestion: string;
} {
  const programStartDate = new Date(program.createdAt);
  const daysSinceStart = Math.floor((today.getTime() - programStartDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let expectedWorkouts = 0;
  let missedDates: string[] = [];
  
  // Count expected workouts
  for (let i = 0; i < daysSinceStart; i++) {
    const date = new Date(programStartDate);
    date.setDate(programStartDate.getDate() + i);
    
    const rotationIndex = i % program.split.rotationPattern.length;
    const pattern = program.split.rotationPattern[rotationIndex];
    
    if (pattern.toLowerCase() !== 'rest') {
      expectedWorkouts++;
      
      // Check if workout was completed
      const dateStr = date.toISOString().split('T')[0];
      const completed = sessions.some(s => 
        s.status === 'completed' && s.scheduledDate.startsWith(dateStr)
      );
      
      if (!completed) {
        missedDates.push(dateStr);
      }
    }
  }
  
  const completedWorkouts = sessions.filter(s => s.status === 'completed').length;
  const missedCount = expectedWorkouts - completedWorkouts;
  
  let suggestion = '';
  if (missedCount === 0) {
    suggestion = '✓ On track!';
  } else if (missedCount <= 2) {
    suggestion = 'Consider doing a make-up session this weekend.';
  } else if (missedCount <= 4) {
    suggestion = 'Try to get back on schedule. Don\'t worry about make-ups, just continue.';
  } else {
    suggestion = 'Significant time off. Consider restarting the program or adjusting expectations.';
  }
  
  return {
    missedCount,
    missedDates,
    suggestion,
  };
}

/**
 * Adjust scheduled workout for deload week
 */
export function applyDeloadModifiers(
  template: WorkoutTemplate,
  intensityModifier: number, // e.g., 0.7 = 70% intensity
  volumeModifier: number // e.g., 0.6 = 60% volume
): WorkoutTemplate {
  return {
    ...template,
    exercises: template.exercises.map(ex => ({
      ...ex,
      setScheme: {
        ...ex.setScheme,
        sets: Math.max(1, Math.round(ex.setScheme.sets * volumeModifier)),
      },
      targetSource: 'fixed',
      fixedLoad: ex.fixedLoad ? ex.fixedLoad * intensityModifier : undefined,
    })),
  };
}

/**
 * Get workout adherence rate
 */
export function getAdherenceRate(
  program: Program,
  sessions: Session[],
  today: Date
): {
  rate: number; // 0-1
  completedCount: number;
  expectedCount: number;
  trend: 'improving' | 'stable' | 'declining';
} {
  const programStartDate = new Date(program.createdAt);
  const daysSinceStart = Math.floor((today.getTime() - programStartDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Count expected workouts
  let expectedCount = 0;
  for (let i = 0; i < daysSinceStart; i++) {
    const rotationIndex = i % program.split.rotationPattern.length;
    const pattern = program.split.rotationPattern[rotationIndex];
    if (pattern.toLowerCase() !== 'rest') {
      expectedCount++;
    }
  }
  
  const completedCount = sessions.filter(s => s.status === 'completed').length;
  const rate = expectedCount > 0 ? completedCount / expectedCount : 0;
  
  // Calculate trend (last 2 weeks vs previous 2 weeks)
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(today.getDate() - 14);
  const fourWeeksAgo = new Date(today);
  fourWeeksAgo.setDate(today.getDate() - 28);
  
  const recentSessions = sessions.filter(s => {
    const sessionDate = new Date(s.scheduledDate);
    return sessionDate >= twoWeeksAgo && sessionDate <= today;
  }).length;
  
  const olderSessions = sessions.filter(s => {
    const sessionDate = new Date(s.scheduledDate);
    return sessionDate >= fourWeeksAgo && sessionDate < twoWeeksAgo;
  }).length;
  
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (recentSessions > olderSessions + 1) trend = 'improving';
  else if (recentSessions < olderSessions - 1) trend = 'declining';
  
  return {
    rate,
    completedCount,
    expectedCount,
    trend,
  };
}

/**
 * Suggest optimal rest day based on schedule
 */
export function suggestRestDay(program: Program): string {
  // Simple heuristic: suggest rest day after highest volume day
  const volumeByDay: Record<string, number> = {};
  
  program.split.rotationPattern.forEach((pattern, index) => {
    const template = program.workoutTemplates.find(t => 
      t.name.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (template) {
      const totalSets = template.exercises.reduce((sum, ex) => sum + ex.setScheme.sets, 0);
      volumeByDay[pattern] = totalSets;
    }
  });
  
  // Find day with highest volume
  let highestVolume = 0;
  let highestDay = '';
  for (const [day, volume] of Object.entries(volumeByDay)) {
    if (volume > highestVolume) {
      highestVolume = volume;
      highestDay = day;
    }
  }
  
  return `Consider placing rest day after ${highestDay} (highest volume: ${highestVolume} sets)`;
}

