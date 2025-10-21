// AI Service Layer for workout intelligence
import { getOpenAIChatResponse } from "../api/chat-service";
import {
  AIExerciseMatch,
  AIProgramValidation,
  AIProgressionSuggestion,
  AICoachTip,
  AIRecoveryRecommendation,
  Program,
  Session,
  Exercise,
  SubRegion,
} from "../types/workout";
import { EXERCISE_LIBRARY } from "../constants/exerciseData";

/**
 * AI Exercise Search Helper
 * Parses natural language and returns 3-5 matching exercises with reasons
 */
export async function aiExerciseSearch(
  query: string,
  userEquipment: string[],
  userLimitations: string[] = []
): Promise<AIExerciseMatch[]> {
  try {
    const prompt = `You are a fitness exercise expert. A user is searching for exercises with this query: "${query}"

User's available equipment: ${userEquipment.join(', ')}
User's limitations/preferences: ${userLimitations.length > 0 ? userLimitations.join(', ') : 'None'}

From the following exercise library, suggest 3-5 exercises that best match the query.
Consider:
1. Direct name matches
2. Muscle group matches
3. Movement pattern matches
4. Available equipment
5. User limitations

Exercise Library:
${EXERCISE_LIBRARY.slice(0, 50).map(ex => `- ${ex.name} (${ex.primaryMuscles.join(', ')}) [${ex.equipment.join(', ')}]`).join('\n')}

Return response in this EXACT JSON format (no markdown, no extra text):
{
  "matches": [
    {
      "exerciseName": "Exercise Name",
      "reason": "Brief reason why this matches",
      "confidence": 0.95
    }
  ]
}`;

    const response = await getOpenAIChatResponse(prompt);
    const parsed = JSON.parse(response.content);

    // Match against actual exercise library
    const matches: AIExerciseMatch[] = [];
    for (const match of parsed.matches) {
      const exercise = EXERCISE_LIBRARY.find(
        ex => ex.name.toLowerCase() === match.exerciseName.toLowerCase()
      );
      if (exercise) {
        matches.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          reason: match.reason,
          confidence: match.confidence,
        });
      }
    }

    return matches;
  } catch (error) {
    console.error('AI Exercise Search Error:', error);
    // Fallback to simple text search
    const lowerQuery = query.toLowerCase();
    return EXERCISE_LIBRARY
      .filter(ex => 
        ex.name.toLowerCase().includes(lowerQuery) ||
        ex.primaryMuscles.some(m => m.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 5)
      .map(ex => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        reason: 'Matched by text search',
        confidence: 0.7,
      }));
  }
}

/**
 * AI Program Validator
 * Checks program for volume balance, overuse, recovery, and suggests fixes
 */
export async function aiProgramValidator(program: Program): Promise<AIProgramValidation> {
  try {
    const exerciseSummary = program.workoutTemplates.map(wt => ({
      name: wt.name,
      exercises: wt.exercises.map(e => {
        const exercise = EXERCISE_LIBRARY.find(ex => ex.id === e.exerciseId);
        return {
          name: exercise?.name || e.exerciseId,
          sets: e.setScheme.sets,
          muscles: exercise?.primaryMuscles || [],
        };
      }),
    }));

    const prompt = `You are a certified strength coach. Analyze this training program for potential issues.

Program: ${program.name}
Duration: ${program.durationWeeks} weeks
Split: ${program.split.type} (${program.split.daysPerWeek} days/week)
Experience Level: ${program.experienceLevel}
Goals: ${program.goals.join(', ')}

Workouts:
${JSON.stringify(exerciseSummary, null, 2)}

Analyze for:
1. Volume distribution per muscle group
2. Push/pull balance
3. Recovery adequacy
4. Overuse risk (same muscles too frequently)
5. Exercise progression logic
6. Equipment constraints

Return response in this EXACT JSON format:
{
  "valid": true/false,
  "issues": [
    {
      "severity": "error/warning/info",
      "type": "volume/balance/recovery/equipment/progression",
      "message": "Clear description of issue",
      "suggestedFix": "Specific actionable fix"
    }
  ],
  "overallScore": 0-10
}`;

    const response = await getOpenAIChatResponse(prompt);
    const parsed = JSON.parse(response.content);

    // Calculate sub-region balance
    const subRegionBalance = calculateSubRegionBalance(program);

    return {
      valid: parsed.valid,
      issues: parsed.issues || [],
      subRegionBalance,
    };
  } catch (error) {
    console.error('AI Program Validator Error:', error);
    return {
      valid: true,
      issues: [{
        severity: 'warning',
        type: 'progression',
        message: 'Unable to validate program with AI. Please review manually.',
        suggestedFix: 'Check volume and exercise distribution manually.',
      }],
      subRegionBalance: [],
    };
  }
}

/**
 * AI Progression Advisor
 * Reviews recent sessions and RPE data to suggest load/rep adjustments
 */
export async function aiProgressionAdvisor(
  exerciseId: string,
  exerciseName: string,
  recentSessions: {
    date: string;
    sets: Array<{ reps: number; load: number; rpe?: number; targetReps?: number }>;
  }[]
): Promise<AIProgressionSuggestion> {
  try {
    const sessionSummary = recentSessions.map(s => ({
      date: s.date,
      performance: s.sets.map(set => `${set.reps}@${set.load}kg RPE:${set.rpe || 'N/A'}`).join(', '),
      targetsMet: s.sets.every(set => set.targetReps ? set.reps >= set.targetReps : true),
    }));

    const prompt = `You are a strength & conditioning coach. Review this exercise's recent performance and suggest progression.

Exercise: ${exerciseName}

Recent Sessions (most recent first):
${JSON.stringify(sessionSummary, null, 2)}

Consider:
1. RPE trends (8-9 = good intensity, <7 = too easy, 10 = max effort)
2. Consistency hitting targets
3. Load progression feasibility
4. Recovery signals (high RPE on warm-ups = poor recovery)

Suggest ONE of: increase load, hold load, decrease load, deload week

Return response in this EXACT JSON format:
{
  "suggestedAction": "increase/hold/decrease/deload",
  "suggestedLoad": 100,
  "suggestedReps": 8,
  "reason": "Clear explanation of recommendation",
  "signals": ["signal1", "signal2"],
  "confidence": 0.85
}`;

    const response = await getOpenAIChatResponse(prompt);
    const parsed = JSON.parse(response.content);

    return {
      exerciseId,
      suggestedLoad: parsed.suggestedLoad,
      suggestedReps: parsed.suggestedReps,
      suggestedAction: parsed.suggestedAction,
      reason: parsed.reason,
      signals: parsed.signals,
      confidence: parsed.confidence,
    };
  } catch (error) {
    console.error('AI Progression Advisor Error:', error);
    // Fallback: simple heuristic
    const lastSession = recentSessions[0];
    const allTargetsMet = lastSession.sets.every(s => 
      s.targetReps ? s.reps >= s.targetReps : true
    );
    const avgRPE = lastSession.sets.reduce((sum, s) => sum + (s.rpe || 7), 0) / lastSession.sets.length;

    return {
      exerciseId,
      suggestedAction: allTargetsMet && avgRPE < 8 ? 'increase' : 'hold',
      reason: 'Fallback heuristic: ' + (allTargetsMet ? 'targets met' : 'targets missed'),
      signals: ['fallback-logic'],
      confidence: 0.5,
    };
  }
}

/**
 * AI Coach Tips
 * Post-workout analysis with form tips, imbalance warnings, recovery advice
 */
export async function aiCoachTips(session: Session): Promise<AICoachTip> {
  try {
    const exerciseSummary = session.exercises.map(e => ({
      name: e.exerciseName,
      sets: e.sets.length,
      avgRPE: e.sets.reduce((sum, s) => sum + (s.rpe || 7), 0) / e.sets.length,
      volume: e.sets.reduce((sum, s) => sum + s.actualLoad * s.actualReps, 0),
    }));

    const prompt = `You are a personal training coach. Review this workout session and provide ONE actionable tip.

Session: ${session.workoutName}
Duration: ${session.duration} minutes
Total Sets: ${session.totalSets}

Exercises:
${JSON.stringify(exerciseSummary, null, 2)}

Provide a tip about:
- Form concerns (high RPE but low volume might indicate form issues)
- Muscle imbalances (e.g., too much push, not enough pull)
- Recovery needs (high RPE across all exercises)
- Progression opportunities

Return response in this EXACT JSON format:
{
  "category": "form/balance/recovery/progression/general",
  "shortTip": "One sentence actionable tip",
  "detailedExplanation": "2-3 sentence explanation",
  "actionable": true/false,
  "priority": "low/medium/high"
}`;

    const response = await getOpenAIChatResponse(prompt);
    const parsed = JSON.parse(response.content);

    return {
      category: parsed.category,
      shortTip: parsed.shortTip,
      detailedExplanation: parsed.detailedExplanation,
      actionable: parsed.actionable,
      priority: parsed.priority,
    };
  } catch (error) {
    console.error('AI Coach Tips Error:', error);
    return {
      category: 'general',
      shortTip: 'Great workout! Keep consistent and track your progress.',
      actionable: true,
      priority: 'low',
    };
  }
}

/**
 * AI Recovery Planner
 * Watches fatigue trends and proposes deload weeks
 */
export async function aiRecoveryPlanner(
  recentSessions: Session[],
  weeksInProgram: number
): Promise<AIRecoveryRecommendation> {
  try {
    const sessionSummary = recentSessions.slice(0, 10).map(s => ({
      date: s.completedAt,
      duration: s.duration,
      totalSets: s.totalSets,
      avgRPE: s.exercises.reduce((sum, ex) => {
        const avgExRPE = ex.sets.reduce((s2, set) => s2 + (set.rpe || 7), 0) / ex.sets.length;
        return sum + avgExRPE;
      }, 0) / s.exercises.length,
    }));

    const prompt = `You are a recovery and fatigue management specialist. Analyze training volume and recommend if a deload week is needed.

Current program week: ${weeksInProgram}
Recent Sessions (last 10):
${JSON.stringify(sessionSummary, null, 2)}

Look for:
1. Rising RPE trends (fatigue accumulation)
2. Decreasing performance
3. Consistent high RPE (8-9+) across multiple sessions
4. Time in program (typically deload every 3-4 weeks)

Return response in this EXACT JSON format:
{
  "shouldDeload": true/false,
  "reason": "Clear explanation",
  "recommendedActions": ["action1", "action2"],
  "deloadSuggestion": {
    "intensityModifier": 0.7,
    "volumeModifier": 0.6,
    "duration": 1
  }
}`;

    const response = await getOpenAIChatResponse(prompt);
    const parsed = JSON.parse(response.content);

    return {
      shouldDeload: parsed.shouldDeload,
      reason: parsed.reason,
      recommendedActions: parsed.recommendedActions,
      deloadWeekSuggestion: parsed.deloadSuggestion,
    };
  } catch (error) {
    console.error('AI Recovery Planner Error:', error);
    // Simple heuristic: deload every 4 weeks
    const shouldDeload = weeksInProgram % 4 === 0 && weeksInProgram > 0;
    return {
      shouldDeload,
      reason: shouldDeload ? 'Standard 4-week deload cycle' : 'Continue training',
      recommendedActions: shouldDeload ? ['Reduce load by 30%', 'Reduce sets by 40%'] : [],
      deloadWeekSuggestion: shouldDeload ? {
        intensityModifier: 0.7,
        volumeModifier: 0.6,
        duration: 1,
      } : undefined,
    };
  }
}

/**
 * Helper: Calculate sub-region balance for program validation
 */
function calculateSubRegionBalance(program: Program): Array<{
  region: SubRegion;
  status: 'under' | 'optimal' | 'over';
  currentStimulus: number;
  targetRange: [number, number];
}> {
  // Simplified calculation - in real implementation would track across all workouts
  const balance: Array<{
    region: SubRegion;
    status: 'under' | 'optimal' | 'over';
    currentStimulus: number;
    targetRange: [number, number];
  }> = [];

  program.subRegionTargets?.forEach(target => {
    // Estimate current stimulus from program exercises
    let estimatedStimulus = 0;
    
    program.workoutTemplates.forEach(template => {
      template.exercises.forEach(exTarget => {
        const exercise = EXERCISE_LIBRARY.find(e => e.id === exTarget.exerciseId);
        if (exercise) {
          const regionWeight = exercise.subRegionWeights.find(w => w.region === target.region);
          if (regionWeight) {
            estimatedStimulus += exTarget.setScheme.sets * regionWeight.weight;
          }
        }
      });
    });

    let status: 'under' | 'optimal' | 'over' = 'optimal';
    if (estimatedStimulus < target.weeklyMin) status = 'under';
    if (estimatedStimulus > target.weeklyMax) status = 'over';

    balance.push({
      region: target.region,
      status,
      currentStimulus: estimatedStimulus,
      targetRange: [target.weeklyMin, target.weeklyMax],
    });
  });

  return balance;
}

