// ActiveWorkoutScreen - In-session workout logging
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { cn } from '../../utils/cn';
import { useTrainingStore } from '../../state/trainingStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getTodaysWorkout, createSessionFromTemplate } from '../../services/scheduler';
import { Session, SetLog } from '../../types/workout';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

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
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

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

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

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
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    completeSession(currentSession.id);
    navigation.navigate('WorkoutSummary', { sessionId: currentSession.id });
  };

  const handlePause = () => {
    if (!currentSession) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    pauseSession(currentSession.id);
    navigation.goBack();
  };

  if (!currentSession) {
    return (
      <SafeAreaView className={cn('flex-1 items-center justify-center', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
        <Text className={cn('text-lg', isDark ? 'text-white' : 'text-gray-900')}>
          Loading workout...
        </Text>
      </SafeAreaView>
    );
  }

  const completedSets = currentSession.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => s.status === 'completed').length,
    0
  );
  const totalSets = currentSession.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <SafeAreaView className={cn('flex-1', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
      {/* Floating Header with Liquid Glass Effect */}
      <View className="px-4 pb-3">
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden">
          <View 
            className={cn('p-5', isDark ? 'bg-white/5' : 'bg-white/40')}
            style={{
              shadowColor: isDark ? '#000' : '#1f2937',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.4 : 0.15,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-1 mr-4">
                <Text className={cn('text-2xl font-bold mb-1', isDark ? 'text-white' : 'text-black')}>
                  {currentSession.workoutName}
                </Text>
                <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  {completedSets} of {totalSets} sets completed • {Math.round(progress)}%
                </Text>
              </View>
              <Pressable
                className={cn('rounded-2xl px-5 py-3', isDark ? 'bg-white/10' : 'bg-black/5')}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowPauseModal(true);
                }}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                }}
              >
                <Ionicons name="pause" size={20} color={isDark ? '#fff' : '#000'} />
              </Pressable>
            </View>
            
            {/* Animated Progress Bar */}
            <View className={cn('h-2 rounded-full overflow-hidden', isDark ? 'bg-white/10' : 'bg-black/10')}>
              <LinearGradient
                colors={['#3b82f6', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ 
                  width: `${progress}%`, 
                  height: '100%',
                }}
              />
            </View>
          </View>
        </BlurView>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {currentSession.exercises.map((exercise, exIndex) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            isExpanded={expandedExercises.has(exercise.id)}
            onToggle={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

        {/* Complete Button with Gradient */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowCompleteModal(true);
          }}
          className="rounded-3xl overflow-hidden mb-8 mt-4"
          style={{
            shadowColor: '#22c55e',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          <LinearGradient
            colors={['#22c55e', '#16a34a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 20, alignItems: 'center' }}
          >
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={28} color="white" />
              <Text className="text-white font-bold text-xl ml-2">Complete Workout</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </ScrollView>

      {/* Pause Modal */}
      <Modal
        visible={showPauseModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPauseModal(false)}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-center items-center px-6"
          onPress={() => setShowPauseModal(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden">
              <View className={cn('p-6 w-80', isDark ? 'bg-gray-900/95' : 'bg-white/95')}>
                <Text className={cn('text-2xl font-bold mb-3 text-center', isDark ? 'text-white' : 'text-black')}>
                  Pause Workout
                </Text>
                <Text className={cn('text-center mb-6', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  Your progress will be saved. You can resume anytime from the home screen.
                </Text>
                
                <Pressable
                  className="bg-yellow-500 rounded-2xl py-4 mb-3"
                  onPress={() => {
                    setShowPauseModal(false);
                    handlePause();
                  }}
                  style={{
                    shadowColor: '#eab308',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                  }}
                >
                  <Text className="text-white font-bold text-center text-lg">Pause Workout</Text>
                </Pressable>
                
                <Pressable
                  className={cn('rounded-2xl py-4', isDark ? 'bg-white/10' : 'bg-black/5')}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowPauseModal(false);
                  }}
                >
                  <Text className={cn('font-semibold text-center', isDark ? 'text-white' : 'text-black')}>
                    Continue Training
                  </Text>
                </Pressable>
              </View>
            </BlurView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Complete Modal */}
      <Modal
        visible={showCompleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCompleteModal(false)}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-center items-center px-6"
          onPress={() => setShowCompleteModal(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden">
              <View className={cn('p-6 w-80', isDark ? 'bg-gray-900/95' : 'bg-white/95')}>
                <Text className={cn('text-2xl font-bold text-center mb-3', isDark ? 'text-white' : 'text-black')}>
                  Complete Workout
                </Text>
                <Text className={cn('text-center mb-6', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  Finish this session and save your progress?
                </Text>
                
                <Pressable
                  className="rounded-2xl overflow-hidden mb-3"
                  onPress={() => {
                    setShowCompleteModal(false);
                    handleCompleteWorkout();
                  }}
                  style={{
                    shadowColor: '#22c55e',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                  }}
                >
                  <LinearGradient
                    colors={['#22c55e', '#16a34a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ padding: 16 }}
                  >
                    <Text className="text-white font-bold text-center text-lg">Complete & Save</Text>
                  </LinearGradient>
                </Pressable>
                
                <Pressable
                  className={cn('rounded-2xl py-4', isDark ? 'bg-white/10' : 'bg-black/5')}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowCompleteModal(false);
                  }}
                >
                  <Text className={cn('font-semibold text-center', isDark ? 'text-white' : 'text-black')}>
                    Keep Training
                  </Text>
                </Pressable>
              </View>
            </BlurView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
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
  const allCompleted = completedCount === exercise.sets.length;

  return (
    <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden mb-4">
      <View 
        className={cn('p-5', isDark ? 'bg-white/5' : 'bg-white/40')}
        style={{
          shadowColor: isDark ? '#000' : '#1f2937',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <Pressable onPress={onToggle} className="flex-row justify-between items-center">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-2">
              <Text className={cn('font-bold text-lg flex-1', isDark ? 'text-white' : 'text-black')}>
                {exercise.exerciseName}
              </Text>
              {allCompleted && (
                <View className="ml-2">
                  <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                </View>
              )}
            </View>
            <View className="flex-row items-center">
              <View className={cn('px-3 py-1 rounded-full', allCompleted ? 'bg-green-500/20' : isDark ? 'bg-white/10' : 'bg-black/10')}>
                <Text className={cn('text-xs font-semibold', allCompleted ? 'text-green-400' : isDark ? 'text-gray-400' : 'text-gray-600')}>
                  {completedCount} / {exercise.sets.length} SETS
                </Text>
              </View>
            </View>
          </View>
          <View className={cn('w-8 h-8 rounded-full items-center justify-center', isDark ? 'bg-white/10' : 'bg-black/10')}>
            <Ionicons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={isDark ? '#fff' : '#000'} 
            />
          </View>
        </Pressable>

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
    </BlurView>
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
      isDark ? 'border-white/10' : 'border-black/10'
    )}>
      <View className={cn('w-8 h-8 rounded-full items-center justify-center mr-3', 
        isCompleted ? 'bg-green-500' : isDark ? 'bg-white/10' : 'bg-black/10'
      )}>
        <Text className={cn('font-bold text-sm', isCompleted ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-600')}>
          {setIndex + 1}
        </Text>
      </View>
      
      <TextInput
        className={cn(
          'flex-1 mx-1 px-3 py-3 rounded-xl text-center font-semibold',
          isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black',
          isCompleted && 'opacity-50'
        )}
        placeholder={set.targetLoad ? `${set.targetLoad}${unit}` : 'Load'}
        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
        value={load}
        onChangeText={setLoad}
        keyboardType="numeric"
        editable={!isCompleted}
      />
      
      <Text className={cn('text-lg font-bold mx-1', isDark ? 'text-gray-400' : 'text-gray-600')}>×</Text>
      
      <TextInput
        className={cn(
          'flex-1 mx-1 px-3 py-3 rounded-xl text-center font-semibold',
          isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black',
          isCompleted && 'opacity-50'
        )}
        placeholder={set.targetReps ? `${set.targetReps}` : 'Reps'}
        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
        value={reps}
        onChangeText={setReps}
        keyboardType="numeric"
        editable={!isCompleted}
      />

      <TextInput
        className={cn(
          'w-14 mx-1 px-2 py-3 rounded-xl text-center text-xs font-semibold',
          isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black',
          isCompleted && 'opacity-50'
        )}
        placeholder="RPE"
        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
        value={rpe}
        onChangeText={setRPE}
        keyboardType="numeric"
        editable={!isCompleted}
        maxLength={2}
      />

      {!isCompleted ? (
        <Pressable
          className="ml-2 rounded-xl overflow-hidden"
          onPress={() => {
            const repsNum = parseInt(reps) || 0;
            const loadNum = parseFloat(load) || 0;
            const rpeNum = rpe ? parseInt(rpe) : undefined;
            onComplete(repsNum, loadNum, rpeNum);
          }}
          style={{
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 12, paddingHorizontal: 16 }}
          >
            <Ionicons name="checkmark" size={20} color="white" />
          </LinearGradient>
        </Pressable>
      ) : (
        <View className="ml-2 bg-green-500 rounded-xl p-3 px-4">
          <Ionicons name="checkmark" size={20} color="white" />
        </View>
      )}
    </View>
  );
}