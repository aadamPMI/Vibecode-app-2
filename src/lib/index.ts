// Supabase exports - convenient single import location
export { supabase, isAuthenticated, getCurrentUser, signOut } from './supabase';

export {
  signUpWithEmail,
  signInWithEmail,
  resetPassword,
  updatePassword,
  onAuthStateChange,
} from './supabase-auth';

export {
  // Programs
  getPrograms,
  getActiveProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  
  // Sessions
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  completeSession,
  
  // Set Logs
  addSetLog,
  getSetLogsForSession,
  
  // Personal Records
  getPRsForExercise,
  getAllPRs,
  createPREvent,
  
  // E1RM
  getE1RMHistory,
  addE1RMRecord,
  
  // Real-time
  subscribeToProgramChanges,
  subscribeToSessionChanges,
} from './supabase-database';

export { testSupabaseConnection, exampleUsage } from './supabase-test';

