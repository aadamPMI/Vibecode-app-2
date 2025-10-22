// WorkoutHomeScreen - Main hub for workout section
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { 
  FadeInDown, 
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { cn } from '../../utils/cn';
import { useSettingsStore } from '../../state/settingsStore';
import { useTrainingStore } from '../../state/trainingStore';
import { getTodaysWorkout, getUpcomingWorkouts } from '../../services/scheduler';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PremiumBackground } from '../../components/PremiumBackground';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

type CardType = 'workout' | 'programs' | 'history' | 'stats' | null;

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
  const [expandedCard, setExpandedCard] = useState<CardType>(null);
  
  // Get today's workout
  const today = new Date();
  const todaysWorkout = activeProgram ? getTodaysWorkout(activeProgram, today) : null;
  const upcomingWorkouts = activeProgram ? getUpcomingWorkouts(activeProgram, today, 7) : [];

  const handleCardPress = (cardType: CardType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedCard(expandedCard === cardType ? null : cardType);
  };

  // Pulsing animation for the Create Program button
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <SafeAreaView className={cn('flex-1', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
      <PremiumBackground theme={theme} variant="workout" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeIn.delay(100)} className="px-6 pt-6 pb-4">
          <Text className={cn('text-5xl font-bold', isDark ? 'text-white' : 'text-black')}>
            Workout
          </Text>
        </Animated.View>

        {/* Big Animated Create Program Button */}
        {!activeProgram && (
          <Animated.View entering={FadeInDown.delay(200)} className="px-6 mb-6">
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                navigation.navigate('ProgramWizard');
              }}
            >
              <Animated.View style={animatedButtonStyle}>
                {/* Glow effect */}
                <Animated.View
                  style={[
                    animatedGlowStyle,
                    {
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 28,
                      shadowColor: '#8b5cf6',
                      shadowOffset: { width: 0, height: 12 },
                      shadowOpacity: 0.6,
                      shadowRadius: 24,
                      elevation: 20,
                    },
                  ]}
                />
                
                {/* Button content */}
                <View className="rounded-[28px] overflow-hidden">
                  <LinearGradient
                    colors={['#8b5cf6', '#6366f1', '#3b82f6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ padding: 24 }}
                  >
                    <View className="flex-row items-center justify-center">
                      {/* Icon with background */}
                      <View 
                        className="w-14 h-14 rounded-full items-center justify-center mr-4"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <Ionicons name="add-circle" size={32} color="white" />
                      </View>
                      
                      {/* Text */}
                      <View className="flex-1">
                        <Text className="text-white text-2xl font-bold mb-1">
                          Create Program
                        </Text>
                        <Text className="text-white/80 text-sm">
                          Start your fitness journey
                        </Text>
                      </View>

                      {/* Arrow */}
                      <Ionicons name="arrow-forward" size={24} color="white" />
                    </View>
                  </LinearGradient>
                </View>
              </Animated.View>
            </Pressable>
          </Animated.View>
        )}

        {/* 4 Card Grid */}
        <Animated.View entering={FadeInDown.delay(activeProgram ? 200 : 400)} className="px-6 mb-4">
          <View className="flex-row gap-4 mb-4">
            {/* Active Workout Card */}
            <Pressable 
              className="flex-1"
              onPress={() => handleCardPress('workout')}
            >
              <View 
                className={cn(
                  'rounded-3xl p-6 aspect-square justify-between',
                  expandedCard === 'workout' ? 'border-2 border-blue-500' : '',
                  isDark ? 'bg-[#1c1c1e]' : 'bg-white'
                )}
                style={{
                  shadowColor: isDark ? '#000' : '#1f2937',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isDark ? 0.6 : 0.12,
                  shadowRadius: 20,
                  elevation: 10,
                }}
              >
                {/* Icon Container - Larger pill shape */}
                <View 
                  className="rounded-3xl p-5 self-start"
                  style={{
                    backgroundColor: isDark ? 'rgba(251, 146, 60, 0.15)' : '#fed7aa',
                  }}
                >
                  <Ionicons name="flame" size={28} color="#f97316" />
                </View>
                
                <View>
                  <Text className={cn('text-xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
                    Active{'\n'}Workout
                  </Text>
                  <Text className={cn('text-xs mb-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    {todaysWorkout?.template ? todaysWorkout.template.name : 'Start training'}
                  </Text>
                  {activeSession ? (
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                      <Text className="text-green-500 text-xs font-semibold">In Progress</Text>
                    </View>
                  ) : todaysWorkout?.template ? (
                    <View className="flex-row items-center">
                      <Ionicons name="play" size={14} color="#6b7280" />
                      <Text className={cn('text-xs font-semibold ml-1', isDark ? 'text-gray-400' : 'text-gray-600')}>Start</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Pressable>

            {/* My Programs Card */}
            <Pressable 
              className="flex-1"
              onPress={() => handleCardPress('programs')}
            >
              <View 
                className={cn(
                  'rounded-3xl p-6 aspect-square justify-between',
                  expandedCard === 'programs' ? 'border-2 border-blue-500' : '',
                  isDark ? 'bg-[#1c1c1e]' : 'bg-white'
                )}
                style={{
                  shadowColor: isDark ? '#000' : '#1f2937',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isDark ? 0.6 : 0.12,
                  shadowRadius: 20,
                  elevation: 10,
                }}
              >
                {/* Icon Container - Larger pill shape */}
                <View 
                  className="rounded-3xl p-5 self-start"
                  style={{
                    backgroundColor: isDark ? 'rgba(147, 197, 253, 0.15)' : '#dbeafe',
                  }}
                >
                  <Ionicons name="heart-circle-outline" size={28} color="#3b82f6" />
                </View>
                
                <View>
                  <Text className={cn('text-xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
                    My Programs
                  </Text>
                  <Text className={cn('text-xs mb-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    Workout splits
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="layers-outline" size={14} color="#6b7280" />
                    <Text className={cn('text-xs font-semibold ml-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      {programs.length} {programs.length === 1 ? 'split' : 'splits'}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>

          <View className="flex-row gap-4">
            {/* History Card */}
            <Pressable 
              className="flex-1"
              onPress={() => handleCardPress('history')}
            >
              <View 
                className={cn(
                  'rounded-3xl p-6 aspect-square justify-between',
                  expandedCard === 'history' ? 'border-2 border-blue-500' : '',
                  isDark ? 'bg-[#1c1c1e]' : 'bg-white'
                )}
                style={{
                  shadowColor: isDark ? '#000' : '#1f2937',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isDark ? 0.6 : 0.12,
                  shadowRadius: 20,
                  elevation: 10,
                }}
              >
                {/* Icon Container - Larger pill shape */}
                <View 
                  className="rounded-3xl p-5 self-start"
                  style={{
                    backgroundColor: isDark ? 'rgba(134, 239, 172, 0.15)' : '#d1fae5',
                  }}
                >
                  <Ionicons name="trending-up" size={28} color="#22c55e" />
                </View>
                
                <View>
                  <Text className={cn('text-xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
                    History
                  </Text>
                  <Text className={cn('text-xs mb-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    Track your progress
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={14} color="#6b7280" />
                    <Text className={cn('text-xs font-semibold ml-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      {stats.totalSessions} this week
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>

            {/* Stats Card */}
            <Pressable 
              className="flex-1"
              onPress={() => handleCardPress('stats')}
            >
              <View 
                className={cn(
                  'rounded-3xl p-6 aspect-square justify-between',
                  expandedCard === 'stats' ? 'border-2 border-blue-500' : '',
                  isDark ? 'bg-[#1c1c1e]' : 'bg-white'
                )}
                style={{
                  shadowColor: isDark ? '#000' : '#1f2937',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isDark ? 0.6 : 0.12,
                  shadowRadius: 20,
                  elevation: 10,
                }}
              >
                {/* Icon Container - Larger pill shape */}
                <View 
                  className="rounded-3xl p-5 self-start"
                  style={{
                    backgroundColor: isDark ? 'rgba(251, 146, 60, 0.15)' : '#fed7aa',
                  }}
                >
                  <Ionicons name="flame" size={28} color="#f97316" />
                </View>
                
                <View>
                  <Text className={cn('text-xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
                    Stats
                  </Text>
                  <Text className={cn('text-xs mb-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    Dashboard & insights
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="star-outline" size={14} color="#6b7280" />
                    <Text className={cn('text-xs font-semibold ml-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      {stats.prCount} PRs
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>
        </Animated.View>

        {/* Expanded Card Content */}
        {expandedCard === 'workout' && (
          <Animated.View entering={FadeInDown.duration(300)} className="px-6 mb-6">
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden">
              <View className={cn('p-6', isDark ? 'bg-white/5' : 'bg-white/40')}>
                {activeProgram && todaysWorkout?.template ? (
                  <>
                    <Text className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
                      {todaysWorkout.template.name}
                    </Text>
                    <View className="flex-row items-center mb-4">
                      <View className="flex-row items-center mr-4">
                        <Ionicons name="barbell-outline" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                        <Text className={cn('text-sm ml-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                          {todaysWorkout.template.exercises.length} exercises
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                        <Text className={cn('text-sm ml-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
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
                          style={{ padding: 16, alignItems: 'center' }}
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
                          style={{ padding: 16, alignItems: 'center' }}
                        >
                          <View className="flex-row items-center">
                            <Ionicons name="fitness" size={24} color="white" />
                            <Text className="text-white font-bold text-lg ml-2">Start Workout</Text>
                          </View>
                        </LinearGradient>
                      </Pressable>
                    )}
                  </>
                ) : (
                  <>
                    <Text className={cn('text-xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
                      {activeProgram ? 'Rest & Recovery' : 'No Active Program'}
                    </Text>
                    <Text className={cn('text-sm mb-4', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      {activeProgram 
                        ? 'Recovery is essential for progress'
                        : 'Create or activate a program to get started'
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
                          navigation.navigate('ProgramWizard');
                        }}
                      >
                        <LinearGradient
                          colors={['#3b82f6', '#8b5cf6']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{ padding: 14, alignItems: 'center' }}
                        >
                          <View className="flex-row items-center">
                            <Ionicons name="add-circle-outline" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Create Program</Text>
                          </View>
                        </LinearGradient>
                      </Pressable>
                    )}
                  </>
                )}
              </View>
            </BlurView>
          </Animated.View>
        )}

        {expandedCard === 'programs' && (
          <Animated.View entering={FadeInDown.duration(300)} className="px-6 mb-6">
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden">
              <View className={cn('p-6', isDark ? 'bg-white/5' : 'bg-white/40')}>
                <Text className={cn('text-2xl font-bold mb-4', isDark ? 'text-white' : 'text-black')}>
                  My Programs
                </Text>
                {programs.length === 0 ? (
                  <Text className={cn('text-sm mb-4', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    No programs yet. Create your first one!
                  </Text>
                ) : (
                  <View className="mb-4">
                    {programs.slice(0, 3).map((program) => (
                      <View key={program.id} className="mb-3">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <Text className={cn('font-bold', isDark ? 'text-white' : 'text-black')}>
                              {program.name}
                            </Text>
                            {program.isActive && (
                              <View className="flex-row items-center mt-1">
                                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                                <Text className="text-green-500 text-xs font-bold">Active</Text>
                              </View>
                            )}
                          </View>
                          <Ionicons name="chevron-forward" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        </View>
                      </View>
                    ))}
                  </View>
                )}
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('ProgramManager');
                  }}
                >
                  <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                    <View 
                      className={cn('py-4', isDark ? 'bg-white/10' : 'bg-black/5')}
                      style={{
                        shadowColor: isDark ? '#000' : '#1f2937',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 3,
                      }}
                    >
                      <Text className={cn('font-bold text-center', isDark ? 'text-white' : 'text-black')}>
                        View All Programs
                      </Text>
                    </View>
                  </BlurView>
                </Pressable>
              </View>
            </BlurView>
          </Animated.View>
        )}

        {expandedCard === 'history' && (
          <Animated.View entering={FadeInDown.duration(300)} className="px-6 mb-6">
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden">
              <View className={cn('p-6', isDark ? 'bg-white/5' : 'bg-white/40')}>
                <Text className={cn('text-2xl font-bold mb-4', isDark ? 'text-white' : 'text-black')}>
                  Workout History
                </Text>
                <View className="flex-row justify-between mb-4">
                  <View className="items-center">
                    <Text className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-black')}>
                      {stats.streak.currentStreak}
                    </Text>
                    <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      Day Streak
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-black')}>
                      {stats.totalSessions}
                    </Text>
                    <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      Total Workouts
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('WorkoutHistory');
                  }}
                >
                  <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                    <View 
                      className={cn('py-4', isDark ? 'bg-white/10' : 'bg-black/5')}
                      style={{
                        shadowColor: isDark ? '#000' : '#1f2937',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 3,
                      }}
                    >
                      <Text className={cn('font-bold text-center', isDark ? 'text-white' : 'text-black')}>
                        View Full History
                      </Text>
                    </View>
                  </BlurView>
                </Pressable>
              </View>
            </BlurView>
          </Animated.View>
        )}

        {expandedCard === 'stats' && (
          <Animated.View entering={FadeInDown.duration(300)} className="px-6 mb-6">
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden">
              <View className={cn('p-6', isDark ? 'bg-white/5' : 'bg-white/40')}>
                <Text className={cn('text-2xl font-bold mb-4', isDark ? 'text-white' : 'text-black')}>
                  Performance Stats
                </Text>
                <View className="flex-row flex-wrap gap-3 mb-4">
                  <View className="flex-1 min-w-[45%]">
                    <View className={cn('rounded-2xl p-4', isDark ? 'bg-white/5' : 'bg-black/5')}>
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="flame" size={20} color="#f97316" />
                        <Text className={cn('ml-2 text-sm font-bold', isDark ? 'text-gray-400' : 'text-gray-600')}>
                          Streak
                        </Text>
                      </View>
                      <Text className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-black')}>
                        {stats.streak.currentStreak}
                      </Text>
                      <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                        days
                      </Text>
                    </View>
                  </View>
                  <View className="flex-1 min-w-[45%]">
                    <View className={cn('rounded-2xl p-4', isDark ? 'bg-white/5' : 'bg-black/5')}>
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="trophy" size={20} color="#eab308" />
                        <Text className={cn('ml-2 text-sm font-bold', isDark ? 'text-gray-400' : 'text-gray-600')}>
                          Records
                        </Text>
                      </View>
                      <Text className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-black')}>
                        {stats.prCount}
                      </Text>
                      <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                        PRs
                      </Text>
                    </View>
                  </View>
                </View>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('ExerciseStats');
                  }}
                >
                  <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden mb-3">
                    <View 
                      className={cn('py-4', isDark ? 'bg-white/10' : 'bg-black/5')}
                      style={{
                        shadowColor: isDark ? '#000' : '#1f2937',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 3,
                      }}
                    >
                      <Text className={cn('font-bold text-center', isDark ? 'text-white' : 'text-black')}>
                        Exercise Stats
                      </Text>
                    </View>
                  </BlurView>
                </Pressable>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('WeightTracking');
                  }}
                >
                  <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                    <View 
                      className={cn('py-4', isDark ? 'bg-white/10' : 'bg-black/5')}
                      style={{
                        shadowColor: isDark ? '#000' : '#1f2937',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 3,
                      }}
                    >
                      <Text className={cn('font-bold text-center', isDark ? 'text-white' : 'text-black')}>
                        Weight Tracking
                      </Text>
                    </View>
                  </BlurView>
                </Pressable>
              </View>
            </BlurView>
          </Animated.View>
        )}

        {/* This Week Section */}
        {upcomingWorkouts.length > 0 && (
          <Animated.View entering={FadeInDown.delay(activeProgram ? 400 : 600)} className="px-6 mb-8">
            <Text className={cn('text-2xl font-bold mb-4', isDark ? 'text-white' : 'text-black')}>
              This Week
            </Text>
            {upcomingWorkouts.slice(0, 7).map((workout, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay((activeProgram ? 500 : 700) + index * 100).springify()}
              >
                <BlurView 
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
              </Animated.View>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
