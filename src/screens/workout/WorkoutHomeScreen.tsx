// WorkoutHomeScreen - Main hub for workout section
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, useColorScheme } from 'react-native';
import { cn } from '../../utils/cn';
import { useTrainingStore } from '../../state/trainingStore';
import { getTodaysWorkout, getUpcomingWorkouts } from '../../services/scheduler';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

export default function WorkoutHomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
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
    <View className={cn('flex-1', isDark ? 'bg-gray-900' : 'bg-gray-50')}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className={cn('px-6 pt-16 pb-6', isDark ? 'bg-gray-800' : 'bg-white')}>
          <Text
            className={cn(
              'text-3xl font-bold',
              isDark ? 'text-white' : 'text-gray-900'
            )}
          >
            POTTY AI
          </Text>
          <Text className={cn('text-base mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
            {activeProgram ? activeProgram.name : 'No active program'}
          </Text>
        </View>

        {/* Today's Workout Card */}
        {activeProgram && todaysWorkout?.template ? (
          <View className="px-6 mt-6">
            <View className={cn(
              'rounded-xl p-6',
              isDark ? 'bg-gray-800' : 'bg-white',
              'shadow-lg'
            )}>
              <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-blue-400' : 'text-blue-600')}>
                TODAY'S WORKOUT
              </Text>
              <Text className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900')}>
                {todaysWorkout.template.name}
              </Text>
              <Text className={cn('text-sm mb-4', isDark ? 'text-gray-400' : 'text-gray-600')}>
                {todaysWorkout.template.exercises.length} exercises • ~{todaysWorkout.template.estimatedDuration} min
              </Text>
              
              {activeSession ? (
                <TouchableOpacity
                  className="bg-green-500 rounded-lg py-4 items-center"
                  onPress={() => navigation.navigate('ActiveWorkout')}
                >
                  <Text className="text-white font-bold text-lg">Continue Workout</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="bg-blue-500 rounded-lg py-4 items-center"
                  onPress={() => {
                    // Create and start session
                    navigation.navigate('ActiveWorkout');
                  }}
                >
                  <Text className="text-white font-bold text-lg">Begin Workout</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View className="px-6 mt-6">
            <View className={cn(
              'rounded-xl p-6',
              isDark ? 'bg-gray-800' : 'bg-white',
            )}>
              <Text className={cn('text-lg font-bold mb-2', isDark ? 'text-white' : 'text-gray-900')}>
                {activeProgram ? 'Rest Day' : 'No Active Program'}
              </Text>
              <Text className={cn('text-sm mb-4', isDark ? 'text-gray-400' : 'text-gray-600')}>
                {activeProgram 
                  ? 'Recovery is part of the process!'
                  : 'Create or activate a program to get started'
                }
              </Text>
              {!activeProgram && (
                <TouchableOpacity
                  className="bg-blue-500 rounded-lg py-3 items-center"
                  onPress={() => navigation.navigate('ProgramManager')}
                >
                  <Text className="text-white font-semibold">Create Program</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Quick Stats */}
        <View className="px-6 mt-6">
          <Text className={cn('text-lg font-bold mb-3', isDark ? 'text-white' : 'text-gray-900')}>
            Stats
          </Text>
          <View className="flex-row justify-between">
            <View className={cn(
              'flex-1 rounded-xl p-4 mr-2',
              isDark ? 'bg-gray-800' : 'bg-white'
            )}>
              <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                {stats.streak.currentStreak}
              </Text>
              <Text className={cn('text-xs mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                Day Streak
              </Text>
            </View>
            <View className={cn(
              'flex-1 rounded-xl p-4 mx-1',
              isDark ? 'bg-gray-800' : 'bg-white'
            )}>
              <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                {stats.totalSessions}
              </Text>
              <Text className={cn('text-xs mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                Workouts
              </Text>
            </View>
            <View className={cn(
              'flex-1 rounded-xl p-4 ml-2',
              isDark ? 'bg-gray-800' : 'bg-white'
            )}>
              <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                {stats.prCount}
              </Text>
              <Text className={cn('text-xs mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                PRs
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mt-6">
          <Text className={cn('text-lg font-bold mb-3', isDark ? 'text-white' : 'text-gray-900')}>
            Quick Actions
          </Text>
          <View className="space-y-3">
            <TouchableOpacity
              className={cn(
                'rounded-xl p-4 flex-row justify-between items-center',
                isDark ? 'bg-gray-800' : 'bg-white'
              )}
              onPress={() => navigation.navigate('ProgramManager')}
            >
              <Text className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                Programs
              </Text>
              <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                {programs.length} saved
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={cn(
                'rounded-xl p-4 flex-row justify-between items-center mt-3',
                isDark ? 'bg-gray-800' : 'bg-white'
              )}
              onPress={() => navigation.navigate('ExerciseLibrary')}
            >
              <Text className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                Exercise Library
              </Text>
              <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                Browse
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={cn(
                'rounded-xl p-4 flex-row justify-between items-center mt-3',
                isDark ? 'bg-gray-800' : 'bg-white'
              )}
              onPress={() => navigation.navigate('WorkoutHistory')}
            >
              <Text className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                History
              </Text>
              <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                View all
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Workouts */}
        {upcomingWorkouts.length > 0 && (
          <View className="px-6 mt-6 mb-8">
            <Text className={cn('text-lg font-bold mb-3', isDark ? 'text-white' : 'text-gray-900')}>
              This Week
            </Text>
            {upcomingWorkouts.slice(0, 7).map((workout, index) => (
              <View
                key={index}
                className={cn(
                  'rounded-lg p-3 mb-2 flex-row justify-between items-center',
                  isDark ? 'bg-gray-800' : 'bg-white'
                )}
              >
                <View className="flex-1">
                  <Text className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
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
    </View>
  );
}

