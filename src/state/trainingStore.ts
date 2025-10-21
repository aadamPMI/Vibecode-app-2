// Training Store - Complete state management for workout system
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Program,
  Session,
  E1RMHistory,
  WorkoutTemplate,
  UserWorkoutPreferences,
  SessionStatus,
  SetLog,
  SessionExercise,
  ProgressionResult,
  SubRegionStimulus,
  WorkoutStats,
} from "../types/workout";
import { calculateE1RM, calculateAverageE1RM, hasE1RMChangedSignificantly } from "../utils/e1rmCalculations";
import { DEFAULT_PLATE_INCREMENTS } from "../utils/plateRounding";

interface TrainingState {
  // Programs
  programs: Program[];
  activeProgram: Program | null;
  
  // Sessions
  sessions: Session[];
  activeSession: Session | null;
  
  // E1RM Tracking
  e1rmHistory: E1RMHistory[];
  
  // Progression History
  progressionHistory: ProgressionResult[];
  
  // User Preferences
  preferences: UserWorkoutPreferences;
  
  // Sub-region tracking
  weeklySubRegionStimulus: SubRegionStimulus[];
  
  // ========== PROGRAM ACTIONS ==========
  createProgram: (program: Program) => void;
  updateProgram: (id: string, updates: Partial<Program>) => void;
  deleteProgram: (id: string) => void;
  setActiveProgram: (id: string) => void;
  archiveProgram: (id: string) => void;
  
  // ========== WORKOUT TEMPLATE ACTIONS ==========
  addTemplateToProgram: (programId: string, template: WorkoutTemplate) => void;
  updateTemplate: (programId: string, templateId: string, updates: Partial<WorkoutTemplate>) => void;
  deleteTemplate: (programId: string, templateId: string) => void;
  
  // ========== SESSION ACTIONS ==========
  createSession: (session: Session) => void;
  startSession: (sessionId: string) => void;
  pauseSession: (sessionId: string) => void;
  resumeSession: (sessionId: string) => void;
  completeSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  
  // ========== SET LOGGING ACTIONS ==========
  logSet: (sessionId: string, exerciseId: string, setLog: SetLog) => void;
  updateSet: (sessionId: string, exerciseId: string, setId: string, updates: Partial<SetLog>) => void;
  deleteSet: (sessionId: string, exerciseId: string, setId: string) => void;
  substituteExercise: (sessionId: string, oldExerciseId: string, newExerciseId: string, newExerciseName: string) => void;
  
  // ========== E1RM ACTIONS ==========
  updateE1RM: (exerciseId: string, exerciseName: string, e1rm: number, unit: 'kg' | 'lbs', source: 'calculated' | 'tested') => void;
  getE1RM: (exerciseId: string) => number;
  
  // ========== PROGRESSION ACTIONS ==========
  saveProgressionResult: (result: ProgressionResult) => void;
  getLastProgression: (exerciseId: string) => ProgressionResult | undefined;
  
  // ========== PREFERENCES ACTIONS ==========
  updatePreferences: (updates: Partial<UserWorkoutPreferences>) => void;
  
  // ========== ANALYTICS ACTIONS ==========
  getWorkoutStats: () => WorkoutStats;
  getRecentSessions: (count: number) => Session[];
  
  // ========== SUB-REGION TRACKING ==========
  updateWeeklyStimulus: (stimulus: SubRegionStimulus) => void;
  getWeeklyStimulus: (weekStart: string) => SubRegionStimulus[];
  
  // ========== UTILITIES ==========
  clearAllData: () => void;
  
  // ========== NEW HELPER FUNCTIONS ==========
  getPreviousPerformance: (exerciseId: string) => { sets: SetLog[]; date: string } | null;
  getExerciseHistory: (exerciseId: string, limit?: number) => Array<{ session: Session; exerciseData: SessionExercise }>;
  getExerciseStats: (exerciseId: string) => {
    totalSessions: number;
    totalSets: number;
    totalVolume: number;
    bestSet: SetLog | null;
    recentSessions: Array<{ date: string; volume: number; e1rm?: number }>;
  };
  profileVisibility: boolean;
  setProfileVisibility: (visible: boolean) => void;
}

const DEFAULT_PREFERENCES: UserWorkoutPreferences = {
  unit: 'kg',
  plateIncrements: DEFAULT_PLATE_INCREMENTS,
  defaultRestSeconds: 90,
  trackRPE: true,
  aiAssistLevel: 'balanced',
  enableSubRegionTracking: true,
  injuryFlags: [],
  availableEquipment: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'],
};

export const useTrainingStore = create<TrainingState>()(
  persist(
    (set, get) => ({
      // Initial State
      programs: [],
      activeProgram: null,
      sessions: [],
      activeSession: null,
      e1rmHistory: [],
      progressionHistory: [],
      preferences: DEFAULT_PREFERENCES,
      weeklySubRegionStimulus: [],
      profileVisibility: false,

      // ========== PROGRAM ACTIONS ==========
      createProgram: (program) =>
        set((state) => ({
          programs: [...state.programs, program],
        })),

      updateProgram: (id, updates) =>
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
          activeProgram:
            state.activeProgram?.id === id
              ? { ...state.activeProgram, ...updates, updatedAt: new Date().toISOString() }
              : state.activeProgram,
        })),

      deleteProgram: (id) =>
        set((state) => ({
          programs: state.programs.filter((p) => p.id !== id),
          activeProgram: state.activeProgram?.id === id ? null : state.activeProgram,
        })),

      setActiveProgram: (id) =>
        set((state) => {
          const program = state.programs.find((p) => p.id === id);
          if (!program) return state;

          // Deactivate other programs
          const updatedPrograms = state.programs.map((p) => ({
            ...p,
            isActive: p.id === id,
          }));

          return {
            programs: updatedPrograms,
            activeProgram: { ...program, isActive: true },
          };
        }),

      archiveProgram: (id) =>
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === id ? { ...p, isArchived: true, isActive: false } : p
          ),
          activeProgram: state.activeProgram?.id === id ? null : state.activeProgram,
        })),

      // ========== WORKOUT TEMPLATE ACTIONS ==========
      addTemplateToProgram: (programId, template) =>
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === programId
              ? { ...p, workoutTemplates: [...p.workoutTemplates, template] }
              : p
          ),
        })),

      updateTemplate: (programId, templateId, updates) =>
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === programId
              ? {
                  ...p,
                  workoutTemplates: p.workoutTemplates.map((t) =>
                    t.id === templateId
                      ? { ...t, ...updates, updatedAt: new Date().toISOString() }
                      : t
                  ),
                }
              : p
          ),
        })),

      deleteTemplate: (programId, templateId) =>
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === programId
              ? {
                  ...p,
                  workoutTemplates: p.workoutTemplates.filter((t) => t.id !== templateId),
                }
              : p
          ),
        })),

      // ========== SESSION ACTIONS ==========
      createSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions],
        })),

      startSession: (sessionId) =>
        set((state) => {
          const session = state.sessions.find((s) => s.id === sessionId);
          if (!session) return state;

          const updatedSession = {
            ...session,
            status: 'active' as SessionStatus,
            startedAt: new Date().toISOString(),
          };

          return {
            sessions: state.sessions.map((s) =>
              s.id === sessionId ? updatedSession : s
            ),
            activeSession: updatedSession,
          };
        }),

      pauseSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, status: 'paused' as SessionStatus, pausedAt: new Date().toISOString() }
              : s
          ),
          activeSession:
            state.activeSession?.id === sessionId
              ? { ...state.activeSession, status: 'paused' as SessionStatus, pausedAt: new Date().toISOString() }
              : state.activeSession,
        })),

      resumeSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, status: 'active' as SessionStatus } : s
          ),
          activeSession:
            state.activeSession?.id === sessionId
              ? { ...state.activeSession, status: 'active' as SessionStatus }
              : state.activeSession,
        })),

      completeSession: (sessionId) =>
        set((state) => {
          const session = state.sessions.find((s) => s.id === sessionId);
          if (!session) return state;

          // Calculate totals
          const totalSets = session.exercises.reduce(
            (total, ex) => total + ex.sets.filter((s) => s.status === 'completed').length,
            0
          );

          const totalVolume = session.exercises.reduce((total, ex) => {
            return (
              total +
              ex.sets
                .filter((s) => s.status === 'completed')
                .reduce((sum, s) => sum + s.actualLoad * s.actualReps, 0)
            );
          }, 0);

          const completedAt = new Date().toISOString();
          const duration = session.startedAt
            ? Math.round((new Date(completedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
            : 0;

          const updatedSession = {
            ...session,
            status: 'completed' as SessionStatus,
            completedAt,
            duration,
            totalSets,
            totalVolume,
          };

          return {
            sessions: state.sessions.map((s) =>
              s.id === sessionId ? updatedSession : s
            ),
            activeSession: null, // Clear active session
          };
        }),

      deleteSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          activeSession: state.activeSession?.id === sessionId ? null : state.activeSession,
        })),

      // ========== SET LOGGING ACTIONS ==========
      logSet: (sessionId, exerciseId, setLog) =>
        set((state) => {
          const updateSession = (session: Session): Session => {
            if (session.id !== sessionId) return session;

            return {
              ...session,
              exercises: session.exercises.map((ex) =>
                ex.id === exerciseId
                  ? { ...ex, sets: [...ex.sets, setLog] }
                  : ex
              ),
            };
          };

          return {
            sessions: state.sessions.map(updateSession),
            activeSession: state.activeSession ? updateSession(state.activeSession) : null,
          };
        }),

      updateSet: (sessionId, exerciseId, setId, updates) =>
        set((state) => {
          const updateSession = (session: Session): Session => {
            if (session.id !== sessionId) return session;

            return {
              ...session,
              exercises: session.exercises.map((ex) =>
                ex.id === exerciseId
                  ? {
                      ...ex,
                      sets: ex.sets.map((s) =>
                        s.id === setId ? { ...s, ...updates } : s
                      ),
                    }
                  : ex
              ),
            };
          };

          return {
            sessions: state.sessions.map(updateSession),
            activeSession: state.activeSession ? updateSession(state.activeSession) : null,
          };
        }),

      deleteSet: (sessionId, exerciseId, setId) =>
        set((state) => {
          const updateSession = (session: Session): Session => {
            if (session.id !== sessionId) return session;

            return {
              ...session,
              exercises: session.exercises.map((ex) =>
                ex.id === exerciseId
                  ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
                  : ex
              ),
            };
          };

          return {
            sessions: state.sessions.map(updateSession),
            activeSession: state.activeSession ? updateSession(state.activeSession) : null,
          };
        }),

      substituteExercise: (sessionId, oldExerciseId, newExerciseId, newExerciseName) =>
        set((state) => {
          const updateSession = (session: Session): Session => {
            if (session.id !== sessionId) return session;

            return {
              ...session,
              exercises: session.exercises.map((ex) =>
                ex.id === oldExerciseId
                  ? {
                      ...ex,
                      exerciseId: newExerciseId,
                      exerciseName: newExerciseName,
                      substitutedFrom: oldExerciseId,
                    }
                  : ex
              ),
            };
          };

          return {
            sessions: state.sessions.map(updateSession),
            activeSession: state.activeSession ? updateSession(state.activeSession) : null,
          };
        }),

      // ========== E1RM ACTIONS ==========
      updateE1RM: (exerciseId, exerciseName, e1rm, unit, source) =>
        set((state) => {
          const existingHistory = state.e1rmHistory.find((h) => h.exerciseId === exerciseId);

          const newEntry = {
            exerciseId,
            e1rm,
            unit,
            date: new Date().toISOString(),
            source,
          };

          if (existingHistory) {
            // Check if significant change
            if (!hasE1RMChangedSignificantly(existingHistory.currentE1RM, e1rm)) {
              return state; // No significant change, don't update
            }

            return {
              e1rmHistory: state.e1rmHistory.map((h) =>
                h.exerciseId === exerciseId
                  ? {
                      ...h,
                      entries: [...h.entries, newEntry],
                      currentE1RM: e1rm,
                      unit,
                    }
                  : h
              ),
            };
          } else {
            // New exercise
            return {
              e1rmHistory: [
                ...state.e1rmHistory,
                {
                  exerciseId,
                  exerciseName,
                  entries: [newEntry],
                  currentE1RM: e1rm,
                  unit,
                },
              ],
            };
          }
        }),

      getE1RM: (exerciseId) => {
        const history = get().e1rmHistory.find((h) => h.exerciseId === exerciseId);
        return history?.currentE1RM || 0;
      },

      // ========== PROGRESSION ACTIONS ==========
      saveProgressionResult: (result) =>
        set((state) => ({
          progressionHistory: [result, ...state.progressionHistory].slice(0, 1000), // Keep last 1000
        })),

      getLastProgression: (exerciseId) => {
        return get().progressionHistory.find((p) => p.exerciseId === exerciseId);
      },

      // ========== PREFERENCES ACTIONS ==========
      updatePreferences: (updates) =>
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        })),

      // ========== ANALYTICS ACTIONS ==========
      getWorkoutStats: () => {
        const state = get();
        const completedSessions = state.sessions.filter((s) => s.status === 'completed');

        const totalSessions = completedSessions.length;
        const totalVolume = completedSessions.reduce((sum, s) => sum + s.totalVolume, 0);
        const totalSets = completedSessions.reduce((sum, s) => sum + s.totalSets, 0);
        const totalHours = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
        const averageSessionDuration = totalSessions > 0 ? Math.round(
          completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions
        ) : 0;

        // Calculate streak
        const sortedSessions = [...completedSessions].sort(
          (a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
        );

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        const today = new Date();
        
        sortedSessions.forEach((session, index) => {
          const sessionDate = new Date(session.completedAt!);
          if (index === 0) {
            const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff <= 1) {
              currentStreak = 1;
              tempStreak = 1;
            }
          } else {
            const prevDate = new Date(sortedSessions[index - 1].completedAt!);
            const daysDiff = Math.floor((prevDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff <= 1) {
              tempStreak++;
              if (index === 0) currentStreak = tempStreak;
            } else {
              longestStreak = Math.max(longestStreak, tempStreak);
              tempStreak = 1;
            }
          }
        });
        longestStreak = Math.max(longestStreak, tempStreak);

        return {
          totalSessions,
          totalVolume,
          totalSets,
          totalHours,
          averageSessionDuration,
          prCount: completedSessions.reduce((sum, s) => sum + s.prEvents.length, 0),
          streak: {
            currentStreak,
            longestStreak,
            lastWorkoutDate: sortedSessions[0]?.completedAt || '',
          },
          volumeByMuscle: [],
          e1rmProgress: state.e1rmHistory.map((h) => ({
            exerciseId: h.exerciseId,
            exerciseName: h.exerciseName,
            startE1RM: h.entries[0]?.e1rm || 0,
            currentE1RM: h.currentE1RM,
            percentChange: h.entries[0]?.e1rm
              ? ((h.currentE1RM - h.entries[0].e1rm) / h.entries[0].e1rm) * 100
              : 0,
          })),
        };
      },

      getRecentSessions: (count) => {
        const completedSessions = get().sessions.filter((s) => s.status === 'completed');
        return completedSessions
          .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
          .slice(0, count);
      },

      // ========== SUB-REGION TRACKING ==========
      updateWeeklyStimulus: (stimulus) =>
        set((state) => {
          const existing = state.weeklySubRegionStimulus.find(
            (s) => s.region === stimulus.region && s.weekStart === stimulus.weekStart
          );

          if (existing) {
            return {
              weeklySubRegionStimulus: state.weeklySubRegionStimulus.map((s) =>
                s.region === stimulus.region && s.weekStart === stimulus.weekStart
                  ? stimulus
                  : s
              ),
            };
          } else {
            return {
              weeklySubRegionStimulus: [...state.weeklySubRegionStimulus, stimulus],
            };
          }
        }),

      getWeeklyStimulus: (weekStart) => {
        return get().weeklySubRegionStimulus.filter((s) => s.weekStart === weekStart);
      },

      // ========== UTILITIES ==========
      clearAllData: () =>
        set({
          programs: [],
          activeProgram: null,
          sessions: [],
          activeSession: null,
          e1rmHistory: [],
          progressionHistory: [],
          weeklySubRegionStimulus: [],
        }),
      
      // ========== NEW HELPER FUNCTIONS ==========
      getPreviousPerformance: (exerciseId) => {
        const state = get();
        const completedSessions = state.sessions
          .filter((s) => s.status === 'completed')
          .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

        for (const session of completedSessions) {
          const exercise = session.exercises.find((ex) => ex.exerciseId === exerciseId);
          if (exercise && exercise.sets.length > 0) {
            return {
              sets: exercise.sets.filter((s) => s.status === 'completed'),
              date: session.completedAt!,
            };
          }
        }
        return null;
      },

      getExerciseHistory: (exerciseId, limit = 10) => {
        const state = get();
        const history: Array<{ session: Session; exerciseData: SessionExercise }> = [];

        const completedSessions = state.sessions
          .filter((s) => s.status === 'completed')
          .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

        for (const session of completedSessions) {
          const exercise = session.exercises.find((ex) => ex.exerciseId === exerciseId);
          if (exercise && exercise.sets.length > 0) {
            history.push({ session, exerciseData: exercise });
            if (history.length >= limit) break;
          }
        }

        return history;
      },

      getExerciseStats: (exerciseId) => {
        const state = get();
        const history = get().getExerciseHistory(exerciseId, 100);

        let totalSets = 0;
        let totalVolume = 0;
        let bestSet: SetLog | null = null;
        const recentSessions: Array<{ date: string; volume: number; e1rm?: number }> = [];

        history.forEach(({ session, exerciseData }) => {
          const completedSets = exerciseData.sets.filter((s) => s.status === 'completed');
          totalSets += completedSets.length;

          const sessionVolume = completedSets.reduce(
            (sum, set) => sum + set.actualLoad * set.actualReps,
            0
          );
          totalVolume += sessionVolume;

          // Track best set
          completedSets.forEach((set) => {
            if (!bestSet || set.actualLoad * set.actualReps > bestSet.actualLoad * bestSet.actualReps) {
              bestSet = set;
            }
          });

          // Add to recent sessions for AI analysis
          if (recentSessions.length < 10) {
            const bestSetThisSession = completedSets.reduce((best, set) => {
              return set.actualLoad > best.actualLoad ? set : best;
            }, completedSets[0]);

            const e1rm = bestSetThisSession
              ? calculateE1RM(bestSetThisSession.actualLoad, bestSetThisSession.actualReps)
              : undefined;

            recentSessions.push({
              date: session.completedAt!,
              volume: sessionVolume,
              e1rm,
            });
          }
        });

        return {
          totalSessions: history.length,
          totalSets,
          totalVolume,
          bestSet,
          recentSessions,
        };
      },

      setProfileVisibility: (visible) =>
        set({ profileVisibility: visible }),
    }),
    {
      name: "training-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

