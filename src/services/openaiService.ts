// OpenAI Service for Workout AI Features
import { getOpenAIClient } from '../api/openai';
import { MuscleGroup } from '../types/workout';
import { getExerciseByName, getExerciseById, EXERCISE_DATABASE } from '../utils/exerciseDatabase';
import type { Session, SetLog } from '../types/workout';

// Cache for AI responses to reduce API calls
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const getCacheKey = (fn: string, ...args: any[]) => {
  return `${fn}-${JSON.stringify(args)}`;
};

const getCached = <T>(key: string): T | null => {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
};

const setCache = (key: string, data: any) => {
  responseCache.set(key, { data, timestamp: Date.now() });
};

/**
 * Suggest muscle groups based on workout day name and split type
 */
export const suggestMuscleGroups = async (
  dayName: string,
  splitType: string
): Promise<MuscleGroup[]> => {
  const cacheKey = getCacheKey('suggestMuscleGroups', dayName, splitType);
  const cached = getCached<MuscleGroup[]>(cacheKey);
  if (cached) return cached;

  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-2024-11-20',
      messages: [
        {
          role: 'system',
          content: `You are a professional strength training coach. Given a workout day name and split type, suggest the appropriate muscle groups to target.

Available muscle groups: chest, back, shoulders, biceps, triceps, forearms, quads, hamstrings, glutes, calves, adductors, core, abs, obliques

Respond with ONLY a JSON array of muscle group names, no explanation.

Example: ["chest", "shoulders", "triceps"]`,
        },
        {
          role: 'user',
          content: `Day: ${dayName}\nSplit: ${splitType}\n\nWhat muscle groups should be trained?`,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) throw new Error('Empty response from AI');

    const muscleGroups = JSON.parse(response) as MuscleGroup[];
    setCache(cacheKey, muscleGroups);
    return muscleGroups;
  } catch (error) {
    console.error('AI muscle group suggestion failed:', error);
    // Fallback based on common patterns
    return getFallbackMuscleGroups(dayName, splitType);
  }
};

/**
 * Fallback muscle group suggestions if AI fails
 */
const getFallbackMuscleGroups = (dayName: string, splitType: string): MuscleGroup[] => {
  const lowerDay = dayName.toLowerCase();
  
  if (lowerDay.includes('push')) {
    return ['chest', 'shoulders', 'triceps'];
  } else if (lowerDay.includes('pull')) {
    return ['back', 'biceps'];
  } else if (lowerDay.includes('leg')) {
    return ['quads', 'hamstrings', 'glutes', 'calves'];
  } else if (lowerDay.includes('upper')) {
    return ['chest', 'back', 'shoulders', 'biceps', 'triceps'];
  } else if (lowerDay.includes('lower')) {
    return ['quads', 'hamstrings', 'glutes', 'calves'];
  } else if (lowerDay.includes('chest')) {
    return ['chest', 'triceps'];
  } else if (lowerDay.includes('back')) {
    return ['back', 'biceps'];
  } else if (lowerDay.includes('shoulder')) {
    return ['shoulders'];
  } else if (lowerDay.includes('arm')) {
    return ['biceps', 'triceps'];
  } else {
    return ['chest', 'back', 'quads'];
  }
};

/**
 * Look up an exercise name and return detailed information with muscle groups
 */
export const lookupExercise = async (
  exerciseName: string
): Promise<{
  name: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  found: boolean;
  confidence: number;
}> => {
  // First check our local database
  const localExercise = getExerciseByName(exerciseName);
  if (localExercise) {
    return {
      name: localExercise.name,
      primaryMuscles: localExercise.primaryMuscles,
      secondaryMuscles: localExercise.secondaryMuscles,
      found: true,
      confidence: 1.0,
    };
  }

  const cacheKey = getCacheKey('lookupExercise', exerciseName);
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-2024-11-20',
      messages: [
        {
          role: 'system',
          content: `You are a professional strength training coach. Given an exercise name, identify the primary and secondary muscle groups it targets.

Available muscle groups: chest, back, shoulders, biceps, triceps, forearms, quads, hamstrings, glutes, calves, adductors, core, abs, obliques

Respond with ONLY a JSON object in this exact format:
{
  "name": "Exercise Name",
  "primaryMuscles": ["muscle1", "muscle2"],
  "secondaryMuscles": ["muscle3"],
  "confidence": 0.95
}

If the exercise is not recognized or seems invalid, set confidence to 0.`,
        },
        {
          role: 'user',
          content: `Exercise: ${exerciseName}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 200,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) throw new Error('Empty response from AI');

    const result = JSON.parse(response);
    const output = {
      name: result.name || exerciseName,
      primaryMuscles: result.primaryMuscles || [],
      secondaryMuscles: result.secondaryMuscles || [],
      found: result.confidence > 0.5,
      confidence: result.confidence || 0,
    };

    setCache(cacheKey, output);
    return output;
  } catch (error) {
    console.error('AI exercise lookup failed:', error);
    return {
      name: exerciseName,
      primaryMuscles: [],
      secondaryMuscles: [],
      found: false,
      confidence: 0,
    };
  }
};

/**
 * Suggest progressive overload based on exercise history
 */
export const suggestProgressiveOverload = async (
  exerciseName: string,
  recentSessions: Array<{
    date: string;
    sets: Array<{ reps: number; weight: number; rpe?: number }>;
  }>
): Promise<{
  suggestedWeight: number;
  suggestedReps: number;
  reason: string;
  confidence: number;
}> => {
  if (recentSessions.length === 0) {
    return {
      suggestedWeight: 0,
      suggestedReps: 8,
      reason: 'No previous data - start with a comfortable weight',
      confidence: 0,
    };
  }

  const cacheKey = getCacheKey('suggestProgressiveOverload', exerciseName, recentSessions);
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  try {
    const client = getOpenAIClient();
    
    // Prepare session data for AI
    const sessionSummary = recentSessions.slice(0, 5).map((session, i) => {
      const avgWeight = session.sets.reduce((sum, s) => sum + s.weight, 0) / session.sets.length;
      const avgReps = session.sets.reduce((sum, s) => sum + s.reps, 0) / session.sets.length;
      const avgRPE = session.sets.filter(s => s.rpe).reduce((sum, s) => sum + (s.rpe || 0), 0) / session.sets.filter(s => s.rpe).length || null;
      
      return {
        sessionNumber: recentSessions.length - i,
        date: session.date,
        avgWeight: avgWeight.toFixed(1),
        avgReps: avgReps.toFixed(1),
        avgRPE: avgRPE ? avgRPE.toFixed(1) : 'N/A',
        totalSets: session.sets.length,
      };
    });

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-2024-11-20',
      messages: [
        {
          role: 'system',
          content: `You are a professional strength training coach specializing in progressive overload. Analyze recent workout data and suggest the next target for optimal progression.

Progressive overload principles:
- Increase weight by 2.5-5kg if all reps completed easily (RPE <8)
- Increase reps by 1-2 if weight was challenging (RPE 8-9)
- Maintain if struggling (RPE 9-10)
- Slightly decrease if failed reps or RPE 10
- Consider trend over multiple sessions
- Natural lifters should progress conservatively

Respond with ONLY a JSON object:
{
  "suggestedWeight": number,
  "suggestedReps": number,
  "reason": "Brief explanation",
  "confidence": 0.85
}`,
        },
        {
          role: 'user',
          content: `Exercise: ${exerciseName}\n\nRecent sessions (most recent last):\n${JSON.stringify(sessionSummary, null, 2)}\n\nSuggest next target.`,
        },
      ],
      temperature: 0.4,
      max_tokens: 250,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) throw new Error('Empty response from AI');

    const result = JSON.parse(response);
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('AI progressive overload suggestion failed:', error);
    // Fallback to simple algorithm
    return getFallbackProgression(recentSessions);
  }
};

/**
 * Fallback progression if AI fails
 */
const getFallbackProgression = (
  recentSessions: Array<{
    date: string;
    sets: Array<{ reps: number; weight: number; rpe?: number }>;
  }>
): {
  suggestedWeight: number;
  suggestedReps: number;
  reason: string;
  confidence: number;
} => {
  const lastSession = recentSessions[recentSessions.length - 1];
  if (!lastSession) {
    return {
      suggestedWeight: 0,
      suggestedReps: 8,
      reason: 'No data available',
      confidence: 0,
    };
  }

  const lastSet = lastSession.sets[lastSession.sets.length - 1];
  const avgRPE = lastSession.sets.filter(s => s.rpe).reduce((sum, s) => sum + (s.rpe || 0), 0) / lastSession.sets.filter(s => s.rpe).length;
  
  // If RPE is low or unknown, increase weight
  if (!avgRPE || avgRPE < 8) {
    return {
      suggestedWeight: lastSet.weight + 2.5,
      suggestedReps: lastSet.reps,
      reason: 'Increase weight - last session felt manageable',
      confidence: 0.7,
    };
  }
  
  // If RPE is high, try more reps
  if (avgRPE >= 9) {
    return {
      suggestedWeight: lastSet.weight,
      suggestedReps: lastSet.reps + 1,
      reason: 'Increase reps - build capacity before adding weight',
      confidence: 0.7,
    };
  }
  
  // Default: maintain
  return {
    suggestedWeight: lastSet.weight,
    suggestedReps: lastSet.reps,
    reason: 'Maintain current load',
    confidence: 0.6,
  };
};

/**
 * Validate a program for balance and recovery
 */
export const validateProgram = async (
  programDays: Array<{
    dayName: string;
    muscleGroups: MuscleGroup[];
    exercises: string[];
  }>
): Promise<{
  isBalanced: boolean;
  issues: string[];
  suggestions: string[];
}> => {
  try {
    const client = getOpenAIClient();
    
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-2024-11-20',
      messages: [
        {
          role: 'system',
          content: `You are a professional strength training coach. Analyze a workout program for muscle balance, recovery, and effectiveness.

Check for:
- Push/pull balance
- Upper/lower balance  
- Adequate recovery between muscle groups
- Appropriate volume distribution
- Missing major muscle groups

Respond with ONLY a JSON object:
{
  "isBalanced": boolean,
  "issues": ["issue 1", "issue 2"],
  "suggestions": ["suggestion 1", "suggestion 2"]
}`,
        },
        {
          role: 'user',
          content: `Program:\n${JSON.stringify(programDays, null, 2)}\n\nAnalyze this program.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 400,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) throw new Error('Empty response from AI');

    return JSON.parse(response);
  } catch (error) {
    console.error('AI program validation failed:', error);
    return {
      isBalanced: true,
      issues: [],
      suggestions: ['Unable to validate - continue with your program'],
    };
  }
};

/**
 * Get AI insight on exercise performance trend
 */
export const getPerformanceInsight = async (
  exerciseName: string,
  sessions: Array<{ date: string; volume: number; e1rm?: number }>
): Promise<{
  trend: 'improving' | 'stable' | 'declining';
  insight: string;
}> => {
  if (sessions.length < 2) {
    return {
      trend: 'stable',
      insight: 'Not enough data to determine trend',
    };
  }

  try {
    const client = getOpenAIClient();
    
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-2024-11-20',
      messages: [
        {
          role: 'system',
          content: `You are a data analyst for strength training. Analyze performance data and provide insight.

Respond with ONLY a JSON object:
{
  "trend": "improving" | "stable" | "declining",
  "insight": "Brief insight (1 sentence)"
}`,
        },
        {
          role: 'user',
          content: `Exercise: ${exerciseName}\n\nPerformance data:\n${JSON.stringify(sessions, null, 2)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) throw new Error('Empty response from AI');

    return JSON.parse(response);
  } catch (error) {
    console.error('AI performance insight failed:', error);
    
    // Simple fallback
    const recentVolume = sessions.slice(-3).reduce((sum, s) => sum + s.volume, 0) / 3;
    const olderVolume = sessions.slice(0, 3).reduce((sum, s) => sum + s.volume, 0) / 3;
    
    if (recentVolume > olderVolume * 1.1) {
      return { trend: 'improving', insight: 'Your volume is increasing steadily' };
    } else if (recentVolume < olderVolume * 0.9) {
      return { trend: 'declining', insight: 'Consider a deload week' };
    } else {
      return { trend: 'stable', insight: 'Maintaining consistent performance' };
    }
  }
};

/**
 * Clear response cache (useful for testing or forcing fresh responses)
 */
export const clearAICache = () => {
  responseCache.clear();
};

