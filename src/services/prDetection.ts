// PR (Personal Record) Detection Service
import { Session, PREvent, SetLog } from '../types/workout';
import { calculateE1RM } from '../utils/e1rmCalculations';

/**
 * Detect personal records in a completed session
 */
export function detectPRs(
  session: Session,
  previousSessions: Session[],
  previousE1RMs: Map<string, number>
): PREvent[] {
  const prEvents: PREvent[] = [];

  session.exercises.forEach(exercise => {
    // Get previous sessions for this exercise
    const exerciseHistory = previousSessions
      .flatMap(s => s.exercises.filter(e => e.exerciseId === exercise.exerciseId))
      .filter(e => e.sets.some(s => s.status === 'completed'));

    // Volume PR - highest total volume for this exercise
    const currentVolume = exercise.sets
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + s.actualLoad * s.actualReps, 0);

    const previousMaxVolume = exerciseHistory.reduce((max, ex) => {
      const volume = ex.sets
        .filter(s => s.status === 'completed')
        .reduce((sum, s) => sum + s.actualLoad * s.actualReps, 0);
      return Math.max(max, volume);
    }, 0);

    if (currentVolume > previousMaxVolume && previousMaxVolume > 0) {
      prEvents.push({
        type: 'volume',
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        previousValue: previousMaxVolume,
        newValue: currentVolume,
        description: `Volume PR: ${Math.round(currentVolume)}kg total`,
        date: new Date().toISOString(),
      });
    }

    // E1RM PR - new estimated 1RM
    const completedSets = exercise.sets.filter(s => s.status === 'completed');
    if (completedSets.length > 0) {
      const bestSet = completedSets.reduce((best, current) => {
        const currentE1RM = calculateE1RM(current.actualLoad, current.actualReps, current.rpe).e1rm;
        const bestE1RM = calculateE1RM(best.actualLoad, best.actualReps, best.rpe).e1rm;
        return currentE1RM > bestE1RM ? current : best;
      });

      const currentE1RM = calculateE1RM(bestSet.actualLoad, bestSet.actualReps, bestSet.rpe).e1rm;
      const previousE1RM = previousE1RMs.get(exercise.exerciseId) || 0;

      if (currentE1RM > previousE1RM && previousE1RM > 0) {
        prEvents.push({
          type: 'e1rm',
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          previousValue: previousE1RM,
          newValue: currentE1RM,
          description: `E1RM PR: ${Math.round(currentE1RM)}kg`,
          date: new Date().toISOString(),
        });
      }
    }

    // Rep PR - most reps at a given weight or heavier
    completedSets.forEach(set => {
      const previousBestReps = exerciseHistory.reduce((max, ex) => {
        const matchingSets = ex.sets.filter(
          s => s.status === 'completed' && s.actualLoad >= set.actualLoad
        );
        const bestReps = matchingSets.reduce((m, s) => Math.max(m, s.actualReps), 0);
        return Math.max(max, bestReps);
      }, 0);

      if (set.actualReps > previousBestReps && previousBestReps > 0) {
        prEvents.push({
          type: 'rep',
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          previousValue: previousBestReps,
          newValue: set.actualReps,
          description: `Rep PR: ${set.actualReps} reps @ ${set.actualLoad}kg`,
          date: new Date().toISOString(),
        });
      }
    });
  });

  return prEvents;
}

/**
 * Check for workout streak milestones
 */
export function checkStreakMilestone(currentStreak: number): PREvent | null {
  const milestones = [7, 14, 30, 60, 90, 180, 365];
  
  if (milestones.includes(currentStreak)) {
    return {
      type: 'streak',
      description: `${currentStreak} day workout streak!`,
      newValue: currentStreak,
      date: new Date().toISOString(),
    };
  }
  
  return null;
}

/**
 * Celebrate PRs with appropriate message
 */
export function getPRCelebrationMessage(pr: PREvent): string {
  switch (pr.type) {
    case 'volume':
      return `🎉 Volume PR on ${pr.exerciseName}!`;
    case 'e1rm':
      const improvement = pr.previousValue 
        ? Math.round(((pr.newValue - pr.previousValue) / pr.previousValue) * 100)
        : 0;
      return `💪 New E1RM PR: ${Math.round(pr.newValue)}kg (+${improvement}%)`;
    case 'rep':
      return `🔥 Rep PR: ${pr.newValue} reps on ${pr.exerciseName}!`;
    case 'streak':
      return `⭐ ${pr.newValue} day streak! Keep it up!`;
    default:
      return '🎉 Personal Record!';
  }
}

