// Active Workout Screen - Exercise-by-exercise workout logging with AI suggestions
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  useColorScheme,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInRight,
  FlipInEYAxis,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { cn } from '../../utils/cn';
import { useSettingsStore } from '../../state/settingsStore';
import { useTrainingStore } from '../../state/trainingStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { SetLogger } from '../../components/workout/SetLogger';
import { ProgressIndicator } from '../../components/workout/ProgressIndicator';
import { AIThinking } from '../../components/ui/LoadingStates';
import { PremiumBackground } from '../../components/PremiumBackground';
import { suggestProgressiveOverload } from '../../services/openaiService';
import { hapticLight, hapticMedium, hapticSuccess, hapticHeavy } from '../../utils/haptics';
import { SetLog } from '../../types/workout';

const { width } = Dimensions.get('window');

export default function ActiveWorkoutScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === 'system' ? (systemColorScheme || 'light') : theme;
  const isDark = resolvedTheme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();

  const activeSession = useTrainingStore((s) => s.activeSession);
  const logSet = useTrainingStore((s) => s.logSet);
  const completeSession = useTrainingStore((s) => s.completeSession);
  const getExerciseHistory = useTrainingStore((s) => s.getExerciseHistory);
  const getLastPerformance = useTrainingStore((s) => s.getPreviousPerformance);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, any>>({});
  const [loadingAI, setLoadingAI] = useState<Record<string, boolean>>({});
  const [elapsedTime, setElapsedTime] = useState(0);

  const flipAnimation = useSharedValue(0);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format time
  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!activeSession || !activeSession.template) {
    return (
      <SafeAreaView className={cn('flex-1 items-center justify-center', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
        <Text className={cn('text-lg', isDark ? 'text-white' : 'text-black')}>No active workout</Text>
        <GlassButton onPress={() => navigation.goBack()} variant="primary" className="mt-4">
          Go Back
        </GlassButton>
      </SafeAreaView>
    );
  }

  const currentExercise = activeSession.template.exercises[currentExerciseIndex];
  const exerciseLogs = activeSession.sets.filter((s) => s.exerciseId === currentExercise.exerciseId);
  const totalExercises = activeSession.template.exercises.length;
  const completedExercises = currentExerciseIndex;
  const progress = completedExercises / totalExercises;

  // Load AI suggestion for current exercise
  useEffect(() => {
    if (!currentExercise) return;

    const loadAISuggestion = async () => {
      if (aiSuggestions[currentExercise.exerciseId]) return; // Already loaded

      setLoadingAI((prev) => ({ ...prev, [currentExercise.exerciseId]: true }));

      try {
        const history = getExerciseHistory(currentExercise.exerciseId, 3);
        const lastPerformance = getLastPerformance(currentExercise.exerciseId);

        if (history.length === 0) {
          // No history, no suggestion
          setAiSuggestions((prev) => ({ ...prev, [currentExercise.exerciseId]: null }));
          return;
        }

        const suggestion = await suggestProgressiveOverload(currentExercise.exerciseName, history);
        setAiSuggestions((prev) => ({ ...prev, [currentExercise.exerciseId]: suggestion }));
      } catch (error) {
        console.error('Failed to load AI suggestion:', error);
        setAiSuggestions((prev) => ({ ...prev, [currentExercise.exerciseId]: null }));
      } finally {
        setLoadingAI((prev) => ({ ...prev, [currentExercise.exerciseId]: false }));
      }
    };

    loadAISuggestion();
  }, [currentExercise]);

  // Animate card flip when changing exercises
  useEffect(() => {
    flipAnimation.value = 0;
    flipAnimation.value = withTiming(1, { duration: 600 });
  }, [currentExerciseIndex]);

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnimation.value, [0, 0.5, 1], [90, 0, 0]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
    };
  });

  const handleAddSet = (weight: number, reps: number, rpe?: number) => {
    logSet(
      activeSession.id,
      currentExercise.exerciseId,
      weight,
      reps,
      rpe
    );
    hapticMedium();
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
      hapticLight();
    } else {
      // All exercises done
      hapticHeavy();
      setCompletionModalVisible(true);
    }
  };

  const handleCompleteWorkout = () => {
    completeSession(activeSession.id);
    hapticSuccess();
    navigation.navigate('WorkoutHome');
  };

  const lastPerformance = getLastPerformance(currentExercise.exerciseId);
  const aiSuggestion = aiSuggestions[currentExercise.exerciseId];
  const isLoadingAISuggestion = loadingAI[currentExercise.exerciseId];

  return (
    <SafeAreaView className={cn('flex-1', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
      <PremiumBackground theme={theme} variant="workout" />

      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row justify-between items-center mb-2">
          <Pressable onPress={() => {
            Alert.alert('Exit Workout?', 'Your progress will be saved as a draft.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() },
            ]);
          }}>
            <Ionicons name="close" size={28} color={isDark ? '#fff' : '#000'} />
          </Pressable>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
            <Text className={cn('text-lg font-bold ml-1', isDark ? 'text-white' : 'text-black')}>
              {formatTime(elapsedTime)}
            </Text>
          </View>
        </View>

        <Text className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-black')}>
          {activeSession.template.name}
        </Text>

        {/* Progress Bar */}
        <View className="mt-4">
          <View className={cn('h-2 rounded-full overflow-hidden', isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200')}>
            <Animated.View
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              style={{ width: `${progress * 100}%` }}
            />
          </View>
          <Text className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
            Exercise {completedExercises + 1} of {totalExercises}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Current Exercise Card */}
        <Animated.View style={animatedCardStyle}>
          <GlassCard intensity={80} isDark={isDark} className="p-6 mb-4">
            <Text className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
              {currentExercise.exerciseName}
            </Text>
            <View className="flex-row items-center">
              <View className={cn('px-3 py-1 rounded-full mr-2', isDark ? 'bg-blue-500/20' : 'bg-blue-100')}>
                <Text className="text-blue-500 text-sm font-bold">
                  {currentExercise.sets} × {currentExercise.reps} reps
                </Text>
              </View>
              <Text className={cn('text-sm capitalize', isDark ? 'text-gray-400' : 'text-gray-600')}>
                {currentExercise.setScheme}
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Last Performance */}
        {lastPerformance && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <GlassCard intensity={60} isDark={isDark} className="p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="bar-chart-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                <Text className={cn('text-sm font-bold ml-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
                  Last Performance
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {lastPerformance.sets.map((set, index) => (
                  <View key={index} className={cn('px-3 py-1 rounded', isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100')}>
                    <Text className={cn('text-sm', isDark ? 'text-white' : 'text-gray-900')}>
                      {set.weight}kg × {set.reps}
                    </Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* AI Suggestion */}
        {isLoadingAISuggestion && <AIThinking message="Calculating progressive overload..." isDark={isDark} />}

        {aiSuggestion && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <GlassCard intensity={60} isDark={isDark} className="p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="sparkles" size={20} color="#3b82f6" />
                <Text className="text-blue-500 text-sm font-bold ml-2">AI Suggestion</Text>
              </View>
              <Text className={cn('text-base mb-2', isDark ? 'text-white' : 'text-gray-900')}>
                {aiSuggestion.suggestion}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {aiSuggestion.recommendedSets && aiSuggestion.recommendedSets.map((set: any, index: number) => (
                  <View key={index} className="bg-green-500/20 px-3 py-1 rounded">
                    <Text className="text-green-500 text-sm font-bold">
                      {set.weight}kg × {set.reps}
                    </Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Set Logger */}
        <SetLogger
          exerciseId={currentExercise.exerciseId}
          sessionId={activeSession.id}
          onAddSet={handleAddSet}
          existingSets={exerciseLogs}
          aiSuggestion={aiSuggestion}
          isDark={isDark}
        />

        {/* Navigation */}
        <View className="flex-row gap-3 mt-6 mb-8">
          {currentExerciseIndex > 0 && (
            <GlassButton
              onPress={() => {
                setCurrentExerciseIndex((prev) => prev - 1);
                hapticLight();
              }}
              variant="secondary"
              className="flex-1"
              icon={<Ionicons name="arrow-back" size={20} color={isDark ? '#fff' : '#000'} />}
            >
              Previous
            </GlassButton>
          )}
          {exerciseLogs.length > 0 && (
            <GlassButton
              onPress={handleNextExercise}
              variant="primary"
              className="flex-1"
              icon={<Ionicons name="arrow-forward" size={20} color="#fff" />}
              haptic="medium"
            >
              {currentExerciseIndex < totalExercises - 1 ? 'Next Exercise' : 'Finish'}
            </GlassButton>
          )}
        </View>

        {/* Exercise List - Jump to any exercise */}
        <View className="mb-6">
          <Text className={cn('text-lg font-bold mb-3', isDark ? 'text-white' : 'text-black')}>
            All Exercises
          </Text>
          {activeSession.template.exercises.map((exercise, index) => {
            const sets = activeSession.sets.filter((s) => s.exerciseId === exercise.exerciseId);
            const isComplete = sets.length >= exercise.sets;
            const isCurrent = index === currentExerciseIndex;

            return (
              <Pressable
                key={exercise.exerciseId}
                onPress={() => {
                  setCurrentExerciseIndex(index);
                  hapticLight();
                }}
                className="mb-2"
              >
                <GlassCard
                  intensity={isCurrent ? 80 : 40}
                  isDark={isDark}
                  className={cn('p-4', isCurrent && 'border-2 border-blue-500')}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className={cn('text-base font-bold', isDark ? 'text-white' : 'text-black')}>
                        {exercise.exerciseName}
                      </Text>
                      <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                        {sets.length} / {exercise.sets} sets
                      </Text>
                    </View>
                    {isComplete ? (
                      <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                    ) : isCurrent ? (
                      <View className="bg-blue-500 w-3 h-3 rounded-full" />
                    ) : (
                      <Ionicons name="ellipse-outline" size={24} color={isDark ? '#4b5563' : '#d1d5db'} />
                    )}
                  </View>
                </GlassCard>
              </Pressable>
            );
          })}
        </View>

        {/* Complete Workout Button */}
        <GlassButton
          onPress={() => {
            hapticHeavy();
            setCompletionModalVisible(true);
          }}
          variant="success"
          size="lg"
          fullWidth
          icon={<Ionicons name="checkmark-circle" size={24} color="#fff" />}
          className="mb-8"
          haptic="heavy"
        >
          Complete Workout
        </GlassButton>
      </ScrollView>

      {/* Completion Modal */}
      <WorkoutCompletionModal
        visible={completionModalVisible}
        onClose={() => setCompletionModalVisible(false)}
        onConfirm={handleCompleteWorkout}
        session={activeSession}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}

// Workout Completion Modal
interface WorkoutCompletionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  session: any;
  isDark: boolean;
}

const WorkoutCompletionModal: React.FC<WorkoutCompletionModalProps> = ({
  visible,
  onClose,
  onConfirm,
  session,
  isDark,
}) => {
  const totalSets = session?.sets.length || 0;
  const totalVolume = session?.sets.reduce((sum: number, set: any) => sum + set.weight * set.reps, 0) || 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <Animated.View
          entering={SlideInRight.duration(400).springify()}
          className={cn('rounded-t-3xl p-6', isDark ? 'bg-[#0a0a0a]' : 'bg-white')}
        >
          <View className="items-center mb-6">
            <View className="bg-green-500/20 w-20 h-20 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
            </View>
            <Text className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-black')}>
              Workout Complete!
            </Text>
          </View>

          {/* Stats */}
          <View className="flex-row justify-around mb-6">
            <View className="items-center">
              <Text className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-black')}>
                {totalSets}
              </Text>
              <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>Sets</Text>
            </View>
            <View className="items-center">
              <Text className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-black')}>
                {Math.round(totalVolume)}kg
              </Text>
              <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>Volume</Text>
            </View>
          </View>

          <Text className={cn('text-center text-sm mb-6', isDark ? 'text-gray-400' : 'text-gray-600')}>
            Are you sure you want to complete this workout? All your sets will be saved.
          </Text>

          <View className="gap-3">
            <GlassButton onPress={onConfirm} variant="success" size="lg" fullWidth haptic="success">
              Confirm & Save
            </GlassButton>
            <GlassButton onPress={onClose} variant="secondary" size="lg" fullWidth>
              Go Back
            </GlassButton>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
