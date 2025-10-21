// ActiveWorkoutScreen - In-session workout logging
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { cn } from '../../utils/cn';
import { useTrainingStore } from '../../state/trainingStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getTodaysWorkout, createSessionFromTemplate } from '../../services/scheduler';
import { Session, SetLog } from '../../types/workout';

export default function ActiveWorkoutScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  
  const activeProgram = useTrainingStore(state => state.activeProgram);
  const activeSession = useTrainingStore(state => state.activeSession);
  const createSession = useTrainingStore(state => state.createSession);
  const startSession = useTrainingStore(state => state.startSession);
  const completeSession = useTrainingStore(state => state.completeSession);
  const pauseSession = useTrainingStore(state => state.pauseSession);
  const logSet = useTrainingStore(state => state.logSet);
  const updateSet = useTrainingStore(state => state.updateSet);
  const preferences = useTrainingStore(state => state.preferences);

  const [currentSession, setCurrentSession] = useState<Session | null>(activeSession);
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());

  // Initialize session if none active
  useEffect(() => {
    if (!currentSession && activeProgram) {
      const today = new Date();
      const { template, weekNumber, dayNumber } = getTodaysWorkout(activeProgram, today);
      
      if (template) {
        const newSession = createSessionFromTemplate(
          activeProgram,
          template,
          today,
          weekNumber,
          dayNumber
        );
        createSession(newSession);
        startSession(newSession.id);
        setCurrentSession(newSession);
      } else {
        Alert.alert('No Workout', 'No workout scheduled for today');
        navigation.goBack();
      }
    } else if (activeSession) {
      setCurrentSession(activeSession);
    }
  }, []);

  // Auto-expand all exercises
  useEffect(() => {
    if (currentSession) {
      const allIds = new Set(currentSession.exercises.map(e => e.id));
      setExpandedExercises(allIds);
    }
  }, [currentSession]);

  const handleSetComplete = (exerciseId: string, setIndex: number, reps: number, load: number, rpe?: number) => {
    if (!currentSession) return;

    const exercise = currentSession.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const setLog: SetLog = {
      ...exercise.sets[setIndex],
      actualReps: reps,
      actualLoad: load,
      rpe,
      status: 'completed',
      completedAt: new Date().toISOString(),
    };

    updateSet(currentSession.id, exerciseId, exercise.sets[setIndex].id, setLog);
    
    // Update local state
    setCurrentSession({
      ...currentSession,
      exercises: currentSession.exercises.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s, idx) => idx === setIndex ? setLog : s),
            }
          : ex
      ),
    });
  };

  const handleCompleteWorkout = () => {
    if (!currentSession) return;

    Alert.alert(
      'Complete Workout',
      'Finish this workout and save your progress?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            completeSession(currentSession.id);
            navigation.navigate('WorkoutSummary', { sessionId: currentSession.id });
          },
        },
      ]
    );
  };

  const handlePause = () => {
    if (!currentSession) return;
    pauseSession(currentSession.id);
    Alert.alert('Paused', 'Workout paused. Come back anytime!');
    navigation.goBack();
  };

  if (!currentSession) {
    return (
      <View className={cn('flex-1 items-center justify-center', isDark ? 'bg-gray-900' : 'bg-gray-50')}>
        <Text className={cn('text-lg', isDark ? 'text-white' : 'text-gray-900')}>
          Loading workout...
        </Text>
      </View>
    );
  }

  const completedSets = currentSession.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => s.status === 'completed').length,
    0
  );
  const totalSets = currentSession.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <View className={cn('flex-1', isDark ? 'bg-gray-900' : 'bg-gray-50')}>
      {/* Header */}
      <View className={cn('px-6 pt-16 pb-4', isDark ? 'bg-gray-800' : 'bg-white')}>
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
              {currentSession.workoutName}
            </Text>
            <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
              {completedSets} / {totalSets} sets completed
            </Text>
          </View>
          <TouchableOpacity
            className="bg-yellow-500 rounded-lg px-4 py-2"
            onPress={handlePause}
          >
            <Text className="text-white font-semibold">Pause</Text>
          </TouchableOpacity>
        </View>
        
        {/* Progress Bar */}
        <View className={cn('h-2 rounded-full overflow-hidden', isDark ? 'bg-gray-700' : 'bg-gray-200')}>
          <View
            className="h-full bg-blue-500"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {currentSession.exercises.map((exercise, exIndex) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            isExpanded={expandedExercises.has(exercise.id)}
            onToggle={() => {
              const newExpanded = new Set(expandedExercises);
              if (newExpanded.has(exercise.id)) {
                newExpanded.delete(exercise.id);
              } else {
                newExpanded.add(exercise.id);
              }
              setExpandedExercises(newExpanded);
            }}
            onSetComplete={handleSetComplete}
            unit={preferences.unit}
            isDark={isDark}
          />
        ))}

        {/* Complete Button */}
        <TouchableOpacity
          className="bg-green-500 rounded-xl py-4 items-center mt-6 mb-8"
          onPress={handleCompleteWorkout}
        >
          <Text className="text-white font-bold text-lg">Complete Workout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Exercise Card Component
function ExerciseCard({
  exercise,
  isExpanded,
  onToggle,
  onSetComplete,
  unit,
  isDark,
}: {
  exercise: any;
  isExpanded: boolean;
  onToggle: () => void;
  onSetComplete: (exerciseId: string, setIndex: number, reps: number, load: number, rpe?: number) => void;
  unit: 'kg' | 'lbs';
  isDark: boolean;
}) {
  const completedCount = exercise.sets.filter((s: SetLog) => s.status === 'completed').length;

  return (
    <View className={cn(
      'rounded-xl p-4 mb-3',
      isDark ? 'bg-gray-800' : 'bg-white'
    )}>
      <TouchableOpacity onPress={onToggle} className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-gray-900')}>
            {exercise.exerciseName}
          </Text>
          <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
            {completedCount} / {exercise.sets.length} sets
          </Text>
        </View>
        <Text className={cn('text-2xl', isDark ? 'text-gray-400' : 'text-gray-600')}>
          {isExpanded ? '−' : '+'}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View className="mt-4">
          {exercise.sets.map((set: SetLog, setIndex: number) => (
            <SetRow
              key={set.id}
              set={set}
              setIndex={setIndex}
              onComplete={(reps, load, rpe) => onSetComplete(exercise.id, setIndex, reps, load, rpe)}
              unit={unit}
              isDark={isDark}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// Set Row Component
function SetRow({
  set,
  setIndex,
  onComplete,
  unit,
  isDark,
}: {
  set: SetLog;
  setIndex: number;
  onComplete: (reps: number, load: number, rpe?: number) => void;
  unit: 'kg' | 'lbs';
  isDark: boolean;
}) {
  const [reps, setReps] = useState(set.actualReps > 0 ? set.actualReps.toString() : '');
  const [load, setLoad] = useState(set.actualLoad > 0 ? set.actualLoad.toString() : set.targetLoad?.toString() || '');
  const [rpe, setRPE] = useState(set.rpe?.toString() || '');

  const isCompleted = set.status === 'completed';

  return (
    <View className={cn(
      'flex-row items-center py-3 border-t',
      isDark ? 'border-gray-700' : 'border-gray-200'
    )}>
      <Text className={cn('w-8', isDark ? 'text-gray-400' : 'text-gray-600')}>
        {setIndex + 1}
      </Text>
      
      <TextInput
        className={cn(
          'flex-1 mx-2 px-3 py-2 rounded-lg text-center',
          isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900',
          isCompleted && 'opacity-50'
        )}
        placeholder={set.targetLoad ? `${set.targetLoad}${unit}` : 'Load'}
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={load}
        onChangeText={setLoad}
        keyboardType="numeric"
        editable={!isCompleted}
      />
      
      <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>×</Text>
      
      <TextInput
        className={cn(
          'flex-1 mx-2 px-3 py-2 rounded-lg text-center',
          isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900',
          isCompleted && 'opacity-50'
        )}
        placeholder={set.targetReps ? `${set.targetReps}` : 'Reps'}
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={reps}
        onChangeText={setReps}
        keyboardType="numeric"
        editable={!isCompleted}
      />

      <TextInput
        className={cn(
          'w-12 mx-2 px-2 py-2 rounded-lg text-center text-xs',
          isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900',
          isCompleted && 'opacity-50'
        )}
        placeholder="RPE"
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        value={rpe}
        onChangeText={setRPE}
        keyboardType="numeric"
        editable={!isCompleted}
        maxLength={2}
      />

      {!isCompleted ? (
        <TouchableOpacity
          className="bg-blue-500 rounded-lg px-3 py-2"
          onPress={() => {
            const repsNum = parseInt(reps) || 0;
            const loadNum = parseFloat(load) || 0;
            const rpeNum = rpe ? parseInt(rpe) : undefined;
            onComplete(repsNum, loadNum, rpeNum);
          }}
        >
          <Text className="text-white font-semibold text-xs">✓</Text>
        </TouchableOpacity>
      ) : (
        <View className="bg-green-500 rounded-lg px-3 py-2">
          <Text className="text-white font-semibold text-xs">✓</Text>
        </View>
      )}
    </View>
  );
}

