// WorkoutHomeScreen - Main hub for workout section
import React from 'react';
import { View, Text, ScrollView, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { cn } from '../../utils/cn';
import { useSettingsStore } from '../../state/settingsStore';
import { useTrainingStore } from '../../state/trainingStore';
import { getTodaysWorkout, getUpcomingWorkouts } from '../../services/scheduler';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PremiumBackground } from '../../components/PremiumBackground';

export default function WorkoutHomeScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === "system" ? (systemColorScheme || "light") : theme;
  const isDark = resolvedTheme === "dark";
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  
  const activeProgram = useTrainingStore(state => state.activeProgram);
  const activeSession = useTrainingStore(state => state.activeSession);
  const programs = useTrainingStore(state => state.programs);
  const getWorkoutStats = useTrainingStore(state => state.getWorkoutStats);
  
  const stats = getWorkoutStats();
  
  // Get today's workout
  const today = new Date();
  const todaysWorkout = activeProgram ? getTodaysWorkout(activeProgram, today) : null;
  const upcomingWorkouts = activeProgram ? getUpcomingWorkouts(activeProgram, today, 7) : [];

  return (
    <SafeAreaView className={cn('flex-1', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
      <PremiumBackground theme={theme} variant="workout" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className={cn('text-5xl font-bold', isDark ? 'text-white' : 'text-black')}>
            Workout
          </Text>
          <Text className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
            {activeProgram ? activeProgram.name : 'No active program'}
          </Text>
        </View>

        {/* Today's Workout Card */}
        {activeProgram && todaysWorkout?.template ? (
          <View className="px-6 mb-4">
            <View 
              className={cn('rounded-3xl p-6', isDark ? 'bg-white/5' : 'bg-white')}
              style={{
                shadowColor: isDark ? '#000' : '#1f2937',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-blue-400' : 'text-blue-600')}>
                TODAY&apos;S WORKOUT
              </Text>
              <Text className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
                {todaysWorkout.template.name}
              </Text>
              <Text className={cn('text-sm mb-4', isDark ? 'text-gray-400' : 'text-gray-600')}>
                {todaysWorkout.template.exercises.length} exercises • ~{todaysWorkout.template.estimatedDuration} min
              </Text>
              
              {activeSession ? (
                <Pressable
                  className="rounded-2xl py-4 items-center"
                  style={{
                    backgroundColor: '#22c55e',
                    shadowColor: '#22c55e',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    navigation.navigate('ActiveWorkout');
                  }}
                >
                  <Text className="text-white font-bold text-lg">Continue Workout</Text>
                </Pressable>
              ) : (
                <Pressable
                  className="rounded-2xl py-4 items-center"
                  style={{
                    backgroundColor: '#3b82f6',
                    shadowColor: '#3b82f6',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    navigation.navigate('ActiveWorkout');
                  }}
                >
                  <Text className="text-white font-bold text-lg">Begin Workout</Text>
                </Pressable>
              )}
            </View>
          </View>
        ) : (
          <View className="px-6 mb-4">
            <View 
              className={cn('rounded-3xl p-6', isDark ? 'bg-white/5' : 'bg-white')}
              style={{
                shadowColor: isDark ? '#000' : '#1f2937',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              <Text className={cn('text-lg font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
                {activeProgram ? 'Rest Day' : 'No Active Program'}
              </Text>
              <Text className={cn('text-sm mb-4', isDark ? 'text-gray-400' : 'text-gray-600')}>
                {activeProgram 
                  ? 'Recovery is part of the process!'
                  : 'Create or activate a program to get started'
                }
              </Text>
              {!activeProgram && (
                <Pressable
                  className="rounded-2xl py-3 items-center"
                  style={{
                    backgroundColor: '#3b82f6',
                    shadowColor: '#3b82f6',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    navigation.navigate('ProgramManager');
                  }}
                >
                  <Text className="text-white font-semibold">Create Program</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Quick Stats */}
        <View className="px-6 mb-4">
          <Text className={cn('text-xl font-bold mb-4', isDark ? 'text-white' : 'text-black')}>
            Stats
          </Text>
          <View className="flex-row justify-between">
            <View 
              className={cn('flex-1 rounded-3xl p-4 mr-2', isDark ? 'bg-white/5' : 'bg-white')}
              style={{
                shadowColor: isDark ? '#000' : '#1f2937',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Text className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-black')}>
                {stats.streak.currentStreak}
              </Text>
              <Text className={cn('text-xs mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                Day Streak
              </Text>
            </View>
            <View 
              className={cn('flex-1 rounded-3xl p-4 mx-1', isDark ? 'bg-white/5' : 'bg-white')}
              style={{
                shadowColor: isDark ? '#000' : '#1f2937',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Text className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-black')}>
                {stats.totalSessions}
              </Text>
              <Text className={cn('text-xs mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                Workouts
              </Text>
            </View>
            <View 
              className={cn('flex-1 rounded-3xl p-4 ml-2', isDark ? 'bg-white/5' : 'bg-white')}
              style={{
                shadowColor: isDark ? '#000' : '#1f2937',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Text className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-black')}>
                {stats.prCount}
              </Text>
              <Text className={cn('text-xs mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                PRs
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-4">
          <Text className={cn('text-xl font-bold mb-4', isDark ? 'text-white' : 'text-black')}>
            Quick Actions
          </Text>
          <View className="space-y-3">
            <Pressable
              className={cn('rounded-3xl p-5 flex-row justify-between items-center', isDark ? 'bg-white/5' : 'bg-white')}
              style={{
                shadowColor: isDark ? '#000' : '#1f2937',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('ProgramManager');
              }}
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="list-outline" size={24} color={isDark ? "#fff" : "#000"} />
                <Text className={cn('font-semibold ml-3', isDark ? 'text-white' : 'text-black')}>
                  Programs
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className={cn('text-sm mr-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  {programs.length} saved
                </Text>
                <Ionicons name="chevron-forward" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
              </View>
            </Pressable>

            <Pressable
              className={cn('rounded-3xl p-5 flex-row justify-between items-center mt-3', isDark ? 'bg-white/5' : 'bg-white')}
              style={{
                shadowColor: isDark ? '#000' : '#1f2937',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('ExerciseLibrary');
              }}
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="barbell-outline" size={24} color={isDark ? "#fff" : "#000"} />
                <Text className={cn('font-semibold ml-3', isDark ? 'text-white' : 'text-black')}>
                  Exercise Library
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className={cn('text-sm mr-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  Browse
                </Text>
                <Ionicons name="chevron-forward" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
              </View>
            </Pressable>

            <Pressable
              className={cn('rounded-3xl p-5 flex-row justify-between items-center mt-3', isDark ? 'bg-white/5' : 'bg-white')}
              style={{
                shadowColor: isDark ? '#000' : '#1f2937',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('WorkoutHistory');
              }}
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="time-outline" size={24} color={isDark ? "#fff" : "#000"} />
                <Text className={cn('font-semibold ml-3', isDark ? 'text-white' : 'text-black')}>
                  History
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className={cn('text-sm mr-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  View all
                </Text>
                <Ionicons name="chevron-forward" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Upcoming Workouts */}
        {upcomingWorkouts.length > 0 && (
          <View className="px-6 mb-8">
            <Text className={cn('text-xl font-bold mb-4', isDark ? 'text-white' : 'text-black')}>
              This Week
            </Text>
            {upcomingWorkouts.slice(0, 7).map((workout, index) => (
              <View
                key={index}
                className={cn('rounded-2xl p-4 mb-3 flex-row justify-between items-center', isDark ? 'bg-white/5' : 'bg-white')}
                style={{
                  shadowColor: isDark ? '#000' : '#1f2937',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.2 : 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="flex-1">
                  <Text className={cn('font-semibold mb-1', isDark ? 'text-white' : 'text-black')}>
                    {workout.dayName}
                  </Text>
                  <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    {workout.template ? workout.template.name : 'Rest'}
                  </Text>
                </View>
                {!workout.isRestDay && (
                  <View className="bg-blue-500 rounded-full px-3 py-1">
                    <Text className="text-white text-xs font-semibold">
                      {workout.template?.exercises.length} exercises
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
