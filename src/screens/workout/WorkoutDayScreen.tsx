// Workout Day Screen - Individual day workout with exercise tracking
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { cn } from '../../utils/cn';
import { useSettingsStore } from '../../state/settingsStore';
import { PremiumBackground } from '../../components/PremiumBackground';

interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export default function WorkoutDayScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === 'system' ? (systemColorScheme || 'light') : theme;
  const isDark = resolvedTheme === 'dark';
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { dayName, date, workoutName } = route.params || {};
  const workoutDate = date ? new Date(date) : new Date();

  // Sample exercises - TODO: Get from active program
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: '1',
      name: 'Barbell Bench Press',
      sets: [
        { id: 's1', reps: 10, weight: 60, completed: false },
        { id: 's2', reps: 8, weight: 70, completed: false },
        { id: 's3', reps: 6, weight: 80, completed: false },
      ],
    },
    {
      id: '2',
      name: 'Incline Dumbbell Press',
      sets: [
        { id: 's1', reps: 12, weight: 25, completed: false },
        { id: 's2', reps: 10, weight: 30, completed: false },
        { id: 's3', reps: 8, weight: 35, completed: false },
      ],
    },
    {
      id: '3',
      name: 'Cable Flyes',
      sets: [
        { id: 's1', reps: 15, weight: 15, completed: false },
        { id: 's2', reps: 12, weight: 20, completed: false },
        { id: 's3', reps: 12, weight: 20, completed: false },
      ],
    },
  ]);

  const toggleSetComplete = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(set =>
            set.id === setId ? { ...set, completed: !set.completed } : set
          ),
        };
      }
      return ex;
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: string) => {
    const numValue = parseInt(value) || 0;
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(set =>
            set.id === setId ? { ...set, [field]: numValue } : set
          ),
        };
      }
      return ex;
    }));
  };

  const completedSets = exercises.reduce(
    (total, ex) => total + ex.sets.filter(s => s.completed).length,
    0
  );
  const totalSets = exercises.reduce((total, ex) => total + ex.sets.length, 0);
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <SafeAreaView className={cn('flex-1', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
      <PremiumBackground theme={theme} variant="workout" />

      {/* Header */}
      <View className="px-6 pt-4 pb-3">
        <Pressable onPress={() => navigation.goBack()} className="mb-3">
          <Ionicons name="arrow-back" size={28} color={isDark ? '#fff' : '#000'} />
        </Pressable>

        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className={cn('text-3xl font-bold mb-1', isDark ? 'text-white' : 'text-black')}>
              {workoutName || 'Workout'}
            </Text>
            <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
              {dayName} • {workoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>

          {/* Progress Badge */}
          <View
            className="rounded-2xl px-4 py-3"
            style={{
              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
              borderWidth: 1.5,
              borderColor: '#3b82f6',
            }}
          >
            <Text className="text-blue-500 text-lg font-bold text-center">
              {completedSets}/{totalSets}
            </Text>
            <Text className="text-blue-500 text-xs font-semibold text-center">Sets</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View className={cn('h-2 rounded-full overflow-hidden', isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200')}>
          <Animated.View
            className="h-full bg-blue-500"
            style={{ width: `${progressPercent}%` }}
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Exercises List */}
        {exercises.map((exercise, exerciseIndex) => {
          const completedExerciseSets = exercise.sets.filter(s => s.completed).length;
          const allSetsCompleted = completedExerciseSets === exercise.sets.length;

          return (
            <Animated.View
              key={exercise.id}
              entering={FadeInDown.delay(exerciseIndex * 100).duration(300).springify()}
              className="mb-6"
            >
              <View
                className={cn(
                  'rounded-3xl p-5',
                  isDark ? 'bg-[#1a1a1a]' : 'bg-white'
                )}
                style={{
                  shadowColor: isDark ? '#000' : '#1f2937',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                {/* Exercise Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <Text className={cn('text-xl font-bold mb-1', isDark ? 'text-white' : 'text-black')}>
                      {exercise.name}
                    </Text>
                    <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      {completedExerciseSets} of {exercise.sets.length} sets completed
                    </Text>
                  </View>
                  {allSetsCompleted && (
                    <View className="bg-green-500 px-3 py-1.5 rounded-full">
                      <Ionicons name="checkmark-circle" size={20} color="white" />
                    </View>
                  )}
                </View>

                {/* Sets Table Header */}
                <View className="flex-row items-center mb-3 px-2">
                  <View className="w-10">
                    <Text className={cn('text-xs font-bold', isDark ? 'text-gray-500' : 'text-gray-500')}>
                      SET
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className={cn('text-xs font-bold text-center', isDark ? 'text-gray-500' : 'text-gray-500')}>
                      REPS
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className={cn('text-xs font-bold text-center', isDark ? 'text-gray-500' : 'text-gray-500')}>
                      WEIGHT (kg)
                    </Text>
                  </View>
                  <View className="w-12" />
                </View>

                {/* Sets List */}
                {exercise.sets.map((set, setIndex) => (
                  <View
                    key={set.id}
                    className={cn(
                      'flex-row items-center mb-2 p-2 rounded-2xl',
                      set.completed
                        ? 'bg-green-500/10'
                        : isDark
                        ? 'bg-[#0a0a0a]'
                        : 'bg-gray-50'
                    )}
                  >
                    {/* Set Number */}
                    <View className="w-10">
                      <Text
                        className={cn(
                          'text-base font-bold',
                          set.completed
                            ? 'text-green-500'
                            : isDark
                            ? 'text-gray-400'
                            : 'text-gray-600'
                        )}
                      >
                        {setIndex + 1}
                      </Text>
                    </View>

                    {/* Reps Input */}
                    <View className="flex-1 items-center">
                      <TextInput
                        value={set.reps.toString()}
                        onChangeText={(value) => updateSet(exercise.id, set.id, 'reps', value)}
                        keyboardType="number-pad"
                        className={cn(
                          'text-center text-base font-bold py-2 px-3 rounded-xl w-16',
                          set.completed
                            ? 'text-green-500'
                            : isDark
                            ? 'text-white bg-[#1a1a1a]'
                            : 'text-gray-900 bg-white'
                        )}
                      />
                    </View>

                    {/* Weight Input */}
                    <View className="flex-1 items-center">
                      <TextInput
                        value={set.weight.toString()}
                        onChangeText={(value) => updateSet(exercise.id, set.id, 'weight', value)}
                        keyboardType="decimal-pad"
                        className={cn(
                          'text-center text-base font-bold py-2 px-3 rounded-xl w-16',
                          set.completed
                            ? 'text-green-500'
                            : isDark
                            ? 'text-white bg-[#1a1a1a]'
                            : 'text-gray-900 bg-white'
                        )}
                      />
                    </View>

                    {/* Complete Button */}
                    <Pressable
                      onPress={() => toggleSetComplete(exercise.id, set.id)}
                      className={cn(
                        'w-12 h-10 rounded-xl items-center justify-center',
                        set.completed ? 'bg-green-500' : isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200'
                      )}
                    >
                      <Ionicons
                        name={set.completed ? 'checkmark' : 'ellipse-outline'}
                        size={24}
                        color={set.completed ? 'white' : isDark ? '#6b7280' : '#9ca3af'}
                      />
                    </Pressable>
                  </View>
                ))}
              </View>
            </Animated.View>
          );
        })}

        {/* Complete Workout Button */}
        <View className="mb-8">
          <Pressable
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              navigation.goBack();
            }}
            disabled={completedSets !== totalSets}
            className={cn(
              'py-4 rounded-2xl flex-row items-center justify-center',
              completedSets === totalSets
                ? 'bg-green-500'
                : isDark
                ? 'bg-gray-700'
                : 'bg-gray-300'
            )}
            style={{
              shadowColor: completedSets === totalSets ? '#22c55e' : '#6b7280',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: completedSets === totalSets ? 0.4 : 0.2,
              shadowRadius: 12,
              elevation: completedSets === totalSets ? 8 : 3,
            }}
          >
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={completedSets === totalSets ? 'white' : isDark ? '#9ca3af' : '#6b7280'}
            />
            <Text
              className={cn(
                'font-bold text-lg ml-2',
                completedSets === totalSets
                  ? 'text-white'
                  : isDark
                  ? 'text-gray-400'
                  : 'text-gray-600'
              )}
            >
              Complete Workout
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
