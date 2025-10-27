import { supabase } from './supabase';

/**
 * Database helper functions for common Supabase operations
 */

// ============================================
// PROGRAMS
// ============================================

export const getPrograms = async (userId: string) => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getActiveProgram = async (userId: string) => {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();
  
  if (error) throw error;
  return data;
};

export const createProgram = async (program: {
  user_id: string;
  name: string;
  description?: string;
  days_per_week: number;
}) => {
  const { data, error } = await supabase
    .from('programs')
    .insert([program])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateProgram = async (programId: string, updates: any) => {
  const { data, error } = await supabase
    .from('programs')
    .update(updates)
    .eq('id', programId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteProgram = async (programId: string) => {
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', programId);
  
  if (error) throw error;
};

// ============================================
// WORKOUT SESSIONS
// ============================================

export const getSessions = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data;
};

export const getSessionById = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*, set_logs(*)')
    .eq('id', sessionId)
    .single();
  
  if (error) throw error;
  return data;
};

export const createSession = async (session: {
  user_id: string;
  workout_name: string;
  program_id?: string;
  template_id?: string;
  started_at: string;
}) => {
  const { data, error } = await supabase
    .from('sessions')
    .insert([session])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateSession = async (sessionId: string, updates: any) => {
  const { data, error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const completeSession = async (
  sessionId: string,
  completedAt: string,
  duration: number,
  totalSets: number,
  totalVolume: number
) => {
  return updateSession(sessionId, {
    status: 'completed',
    completed_at: completedAt,
    duration,
    total_sets: totalSets,
    total_volume: totalVolume,
  });
};

// ============================================
// SET LOGS
// ============================================

export const addSetLog = async (setLog: {
  session_id: string;
  exercise_id: string;
  exercise_name: string;
  set_number: number;
  weight: number;
  reps: number;
  rpe?: number;
  notes?: string;
}) => {
  const { data, error } = await supabase
    .from('set_logs')
    .insert([setLog])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getSetLogsForSession = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('set_logs')
    .select('*')
    .eq('session_id', sessionId)
    .order('logged_at', { ascending: true });
  
  if (error) throw error;
  return data;
};

// ============================================
// PERSONAL RECORDS
// ============================================

export const getPRsForExercise = async (userId: string, exerciseId: string) => {
  const { data, error } = await supabase
    .from('pr_events')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .order('achieved_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getAllPRs = async (userId: string) => {
  const { data, error } = await supabase
    .from('pr_events')
    .select('*')
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createPREvent = async (prEvent: {
  user_id: string;
  session_id: string;
  exercise_id: string;
  exercise_name: string;
  pr_type: 'weight' | 'reps' | 'volume' | 'e1rm';
  previous_value?: number;
  new_value: number;
  achieved_at: string;
}) => {
  const { data, error } = await supabase
    .from('pr_events')
    .insert([prEvent])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ============================================
// E1RM TRACKING
// ============================================

export const getE1RMHistory = async (userId: string, exerciseId: string) => {
  const { data, error } = await supabase
    .from('e1rm_history')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .order('recorded_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const addE1RMRecord = async (record: {
  user_id: string;
  exercise_id: string;
  e1rm: number;
  weight: number;
  reps: number;
  recorded_at: string;
}) => {
  const { data, error } = await supabase
    .from('e1rm_history')
    .insert([record])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

export const subscribeToProgramChanges = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('programs')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'programs',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToSessionChanges = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('sessions')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

