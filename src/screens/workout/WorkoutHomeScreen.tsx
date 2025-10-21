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
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

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

        {/* Today's Workout Card with Liquid Glass */}
        {activeProgram && todaysWorkout?.template ? (
          <View className="px-6 mb-6">
            <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden">
              <View 
                className={cn('p-6', isDark ? 'bg-white/5' : 'bg-white/40')}
                style={{
                  shadowColor: isDark ? '#000' : '#1f2937',
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: isDark ? 0.4 : 0.15,
                  shadowRadius: 20,
                  elevation: 8,
                }}
              >
                <View className="flex-row items-center mb-3">
                  <View className={cn('px-3 py-1 rounded-full', isDark ? 'bg-blue-500/20' : 'bg-blue-500/20')}>
                    <Text className={cn('text-xs font-bold tracking-wider', isDark ? 'text-blue-400' : 'text-blue-600')}>
                      TODAY
                    </Text>
                  </View>
                </View>
                <Text className={cn('text-3xl font-bold mb-3', isDark ? 'text-white' : 'text-black')}>
                  {todaysWorkout.template.name}
                </Text>
                <View className="flex-row items-center mb-5">
                  <View className="flex-row items-center mr-4">
                    <Ionicons name="barbell-outline" size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <Text className={cn('text-sm ml-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      {todaysWorkout.template.exercises.length} exercises
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <Text className={cn('text-sm ml-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      {todaysWorkout.template.estimatedDuration} min
                    </Text>
                  </View>
                </View>
                
                {activeSession ? (
                  <Pressable
                    className="rounded-2xl overflow-hidden"
                    style={{
                      shadowColor: '#22c55e',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.5,
                      shadowRadius: 16,
                      elevation: 10,
                    }}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      navigation.navigate('ActiveWorkout');
                    }}
                  >
                    <LinearGradient
                      colors={['#22c55e', '#16a34a']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ padding: 18, alignItems: 'center' }}
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="play-circle" size={24} color="white" />
                        <Text className="text-white font-bold text-lg ml-2">Continue Workout</Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                ) : (
                  <Pressable
                    className="rounded-2xl overflow-hidden"
                    style={{
                      shadowColor: '#3b82f6',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.5,
                      shadowRadius: 16,
                      elevation: 10,
                    }}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      navigation.navigate('ActiveWorkout');
                    }}
                  >
                    <LinearGradient
                      colors={['#3b82f6', '#8b5cf6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ padding: 18, alignItems: 'center' }}
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="fitness" size={24} color="white" />
                        <Text className="text-white font-bold text-lg ml-2">Begin Workout</Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                )}
              </View>
            </BlurView>
          </View>
        ) : (
          <View className="px-6 mb-6">
            <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden">
              <View 
                className={cn('p-6', isDark ? 'bg-white/5' : 'bg-white/40')}
                style={{
                  shadowColor: isDark ? '#000' : '#1f2937',
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: isDark ? 0.4 : 0.15,
                  shadowRadius: 20,
                  elevation: 8,
                }}
              >
                <View className="flex-row items-center mb-3">
                  <View className={cn('px-3 py-1 rounded-full', isDark ? 'bg-gray-500/20' : 'bg-gray-500/20')}>
                    <Text className={cn('text-xs font-bold tracking-wider', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      {activeProgram ? 'REST DAY' : 'NO PROGRAM'}
                    </Text>
                  </View>
                </View>
                <Text className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
                  {activeProgram ? 'Rest & Recovery' : 'Get Started'}
                </Text>
                <Text className={cn('text-sm mb-5', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  {activeProgram 
                    ? 'Recovery is essential for progress'
                    : 'Create or activate a training program'
                  }
                </Text>
                {!activeProgram && (
                  <Pressable
                    className="rounded-2xl overflow-hidden"
                    style={{
                      shadowColor: '#3b82f6',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.5,
                      shadowRadius: 16,
                      elevation: 10,
                    }}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      navigation.navigate('ProgramManager');
                    }}
                  >
                    <LinearGradient
                      colors={['#3b82f6', '#8b5cf6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ padding: 16, alignItems: 'center' }}
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="add-circle-outline" size={22} color="white" />
                        <Text className="text-white font-bold ml-2">Create Program</Text>
                      </View>
                    </LinearGradient>
                  </Pressable>
                )}
              </View>
            </BlurView>
          </View>
        )}

        {/* Quick Stats with Liquid Glass */}
        <View className="px-6 mb-6">
          <Text className={cn('text-2xl font-bold mb-4', isDark ? 'text-white' : 'text-black')}>
            Performance
          </Text>
          <View className="flex-row justify-between">
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="flex-1 rounded-3xl overflow-hidden mr-2">
              <View 
                className={cn('p-5', isDark ? 'bg-white/5' : 'bg-white/40')}
                style={{
                  shadowColor: isDark ? '#000' : '#1f2937',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                <View className="mb-3">
                  <LinearGradient
                    colors={['#f59e0b', '#ef4444']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: 22, 
                      alignItems: 'center', 
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="flame" size={24} color="white" />
                  </LinearGradient>
                </View>
                <Text className={cn('text-4xl font-bold mb-1', isDark ? 'text-white' : 'text-black')}>
                  {stats.streak.currentStreak}
                </Text>
                <Text className={cn('text-xs font-semibold tracking-wide', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  DAY STREAK
                </Text>
              </View>
            </BlurView>
            
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="flex-1 rounded-3xl overflow-hidden mx-1">
              <View 
                className={cn('p-5', isDark ? 'bg-white/5' : 'bg-white/40')}
                style={{
                  shadowColor: isDark ? '#000' : '#1f2937',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                <View className="mb-3">
                  <LinearGradient
                    colors={['#3b82f6', '#8b5cf6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: 22, 
                      alignItems: 'center', 
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="fitness" size={24} color="white" />
                  </LinearGradient>
                </View>
                <Text className={cn('text-4xl font-bold mb-1', isDark ? 'text-white' : 'text-black')}>
                  {stats.totalSessions}
                </Text>
                <Text className={cn('text-xs font-semibold tracking-wide', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  WORKOUTS
                </Text>
              </View>
            </BlurView>
            
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="flex-1 rounded-3xl overflow-hidden ml-2">
              <View 
                className={cn('p-5', isDark ? 'bg-white/5' : 'bg-white/40')}
                style={{
                  shadowColor: isDark ? '#000' : '#1f2937',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                <View className="mb-3">
                  <LinearGradient
                    colors={['#22c55e', '#10b981']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: 22, 
                      alignItems: 'center', 
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="trophy" size={24} color="white" />
                  </LinearGradient>
                </View>
                <Text className={cn('text-4xl font-bold mb-1', isDark ? 'text-white' : 'text-black')}>
                  {stats.prCount}
                </Text>
                <Text className={cn('text-xs font-semibold tracking-wide', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  RECORDS
                </Text>
              </View>
            </BlurView>
          </View>
        </View>

        {/* Quick Actions with Liquid Glass */}
        <View className="px-6 mb-6">
          <Text className={cn('text-2xl font-bold mb-4', isDark ? 'text-white' : 'text-black')}>
            Quick Actions
          </Text>
          <View className="space-y-3">
            {/* Programs */}
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden mb-3">
              <Pressable
                className={cn('p-5 flex-row justify-between items-center', isDark ? 'bg-white/5' : 'bg-white/40')}
                style={{
                  shadowColor: isDark ? '#000' : '#1f2937',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 10,
                  elevation: 4,
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('ProgramManager');
                }}
              >
                <View className="flex-row items-center flex-1">
                  <View 
                    className="w-12 h-12 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)' }}
                  >
                    <Ionicons name="list" size={24} color="#3b82f6" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-black')}>
                      Programs
                    </Text>
                    <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      {programs.length} saved
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={isDark ? "#9ca3af" : "#6b7280"} />
              </Pressable>
            </BlurView>

            {/* Exercise Library */}
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden mb-3">
              <Pressable
                className={cn('p-5 flex-row justify-between items-center', isDark ? 'bg-white/5' : 'bg-white/40')}
                style={{
                  shadowColor: isDark ? '#000' : '#1f2937',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 10,
                  elevation: 4,
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('ExerciseLibrary');
                }}
              >
                <View className="flex-row items-center flex-1">
                  <View 
                    className="w-12 h-12 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)' }}
                  >
                    <Ionicons name="barbell" size={24} color="#8b5cf6" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-black')}>
                      Exercise Library
                    </Text>
                    <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      Browse exercises
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={isDark ? "#9ca3af" : "#6b7280"} />
              </Pressable>
            </BlurView>

            {/* History */}
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden mb-3">
              <Pressable
                className={cn('p-5 flex-row justify-between items-center', isDark ? 'bg-white/5' : 'bg-white/40')}
                style={{
                  shadowColor: isDark ? '#000' : '#1f2937',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 10,
                  elevation: 4,
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('WorkoutHistory');
                }}
              >
                <View className="flex-row items-center flex-1">
                  <View 
                    className="w-12 h-12 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: isDark ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.15)' }}
                  >
                    <Ionicons name="time" size={24} color="#ec4899" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-black')}>
                      History
                    </Text>
                    <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      View all workouts
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={isDark ? "#9ca3af" : "#6b7280"} />
              </Pressable>
            </BlurView>

            {/* Detailed Stats */}
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden mb-3">
              <Pressable
                className={cn('p-5 flex-row justify-between items-center', isDark ? 'bg-white/5' : 'bg-white/40')}
                style={{
                  shadowColor: isDark ? '#000' : '#1f2937',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 10,
                  elevation: 4,
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('WorkoutHistory');
                }}
              >
                <View className="flex-row items-center flex-1">
                  <View 
                    className="w-12 h-12 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)' }}
                  >
                    <Ionicons name="stats-chart" size={24} color="#22c55e" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-black')}>
                      Detailed Stats
                    </Text>
                    <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      View all stats
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={isDark ? "#9ca3af" : "#6b7280"} />
              </Pressable>
            </BlurView>

            {/* Weight Tracking */}
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden mb-3">
              <Pressable
                className={cn('p-5 flex-row justify-between items-center', isDark ? 'bg-white/5' : 'bg-white/40')}
                style={{
                  shadowColor: isDark ? '#000' : '#1f2937',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 10,
                  elevation: 4,
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('WeightTracking');
                }}
              >
                <View className="flex-row items-center flex-1">
                  <View 
                    className="w-12 h-12 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: isDark ? 'rgba(249, 115, 22, 0.2)' : 'rgba(249, 115, 22, 0.15)' }}
                  >
                    <Ionicons name="scale" size={24} color="#f97316" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-black')}>
                      Weight Tracking
                    </Text>
                    <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      Track your progress
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={isDark ? "#9ca3af" : "#6b7280"} />
              </Pressable>
            </BlurView>
          </View>
        </View>

        {/* Upcoming Workouts with Liquid Glass */}
        {upcomingWorkouts.length > 0 && (
          <View className="px-6 mb-8">
            <Text className={cn('text-2xl font-bold mb-4', isDark ? 'text-white' : 'text-black')}>
              This Week
            </Text>
            {upcomingWorkouts.slice(0, 7).map((workout, index) => (
              <BlurView 
                key={index} 
                intensity={60} 
                tint={isDark ? 'dark' : 'light'} 
                className="rounded-3xl overflow-hidden mb-3"
              >
                <View
                  className={cn('p-5 flex-row justify-between items-center', isDark ? 'bg-white/5' : 'bg-white/40')}
                  style={{
                    shadowColor: isDark ? '#000' : '#1f2937',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.2 : 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <View className="flex-1">
                    <Text className={cn('font-bold text-lg mb-1', isDark ? 'text-white' : 'text-black')}>
                      {workout.dayName}
                    </Text>
                    <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      {workout.template ? workout.template.name : 'Rest & Recovery'}
                    </Text>
                  </View>
                  {!workout.isRestDay && workout.template && (
                    <View className="flex-row items-center">
                      <LinearGradient
                        colors={['#3b82f6', '#8b5cf6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}
                      >
                        <Text className="text-white text-xs font-bold">
                          {workout.template.exercises.length} EXERCISES
                        </Text>
                      </LinearGradient>
                    </View>
                  )}
                </View>
              </BlurView>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
