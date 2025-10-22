import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { cn } from '../../utils/cn';
import { useSettingsStore } from '../../state/settingsStore';
import { useTrainingStore } from '../../state/trainingStore';
import { BlurView } from 'expo-blur';
import { EmptyState } from '../../components/ui/LoadingStates';
import { PremiumBackground } from '../../components/PremiumBackground';
import { hapticLight } from '../../utils/haptics';
import { staggerDelays } from '../../utils/animations';

export default function WorkoutHistoryScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === 'system' ? (systemColorScheme || 'light') : theme;
  const isDark = resolvedTheme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const sessions = useTrainingStore((state) => state.sessions);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  const completedSessions = sessions
    .filter((s) => s.status === 'completed')
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  const filteredSessions = searchQuery
    ? completedSessions.filter((s) =>
        s.workoutName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : completedSessions;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toggleExpanded = (sessionId: string) => {
    setExpandedSessions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
    hapticLight();
  };

  const delays = staggerDelays(Math.min(filteredSessions.length, 15));

  return (
    <SafeAreaView className={cn('flex-1', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
      <PremiumBackground theme={theme} variant="workout" />

      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Pressable onPress={() => navigation.goBack()} className="mb-2">
          <Ionicons name="arrow-back" size={28} color={isDark ? '#fff' : '#000'} />
        </Pressable>
        <Text className={cn('text-4xl font-bold', isDark ? 'text-white' : 'text-black')}>
          Workout History
        </Text>
        <Text className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
          {completedSessions.length} total workouts
        </Text>
      </View>

      {/* Search */}
      <View className="px-6 mb-4">
        <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search workouts..."
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            className={cn(
              'p-4 text-base',
              isDark ? 'bg-white/5 text-white' : 'bg-white/40 text-black'
            )}
          />
        </BlurView>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {filteredSessions.length === 0 ? (
          <EmptyState
            icon="barbell-outline"
            title={searchQuery ? 'No Matching Workouts' : 'No Workouts Yet'}
            message={searchQuery ? 'Try a different search term' : 'Complete your first workout to see it here'}
            isDark={isDark}
          />
        ) : (
          filteredSessions.map((session, index) => {
            const isExpanded = expandedSessions.has(session.id);
            return (
              <Animated.View
                key={session.id}
                entering={FadeInDown.delay(delays[index % 15]).duration(300).springify()}
                layout={Layout.springify()}
              >
                <Pressable onPress={() => toggleExpanded(session.id)}>
                  <BlurView 
                    intensity={80} 
                    tint={isDark ? 'dark' : 'light'} 
                    className="rounded-3xl overflow-hidden mb-4"
                  >
                    <View 
                      className={cn('p-6', isDark ? 'bg-white/5' : 'bg-white/40')}
                      style={{
                        shadowColor: isDark ? '#000' : '#1f2937',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: isDark ? 0.4 : 0.15,
                        shadowRadius: 16,
                        elevation: 8,
                      }}
                    >
                      <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1">
                          <Text className={cn('font-bold text-xl mb-1', isDark ? 'text-white' : 'text-black')}>
                            {session.workoutName}
                          </Text>
                          <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                            {formatDate(session.completedAt!)}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          {session.prEvents && session.prEvents.length > 0 && (
                            <View className="bg-yellow-500/20 rounded-full px-3 py-1">
                              <Text className="text-yellow-500 text-xs font-bold">
                                {session.prEvents.length} PR
                              </Text>
                            </View>
                          )}
                          <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={24}
                            color={isDark ? '#9ca3af' : '#6b7280'}
                          />
                        </View>
                      </View>

                      <View className="flex-row justify-between mt-4">
                        <View className="items-center">
                          <Text className={cn('text-xs mb-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                            Duration
                          </Text>
                          <Text className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-black')}>
                            {session.duration}m
                          </Text>
                        </View>
                        <View className="items-center">
                          <Text className={cn('text-xs mb-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                            Sets
                          </Text>
                          <Text className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-black')}>
                            {session.totalSets}
                          </Text>
                        </View>
                        <View className="items-center">
                          <Text className={cn('text-xs mb-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                            Volume
                          </Text>
                          <Text className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-black')}>
                            {Math.round(session.totalVolume)}kg
                          </Text>
                        </View>
                        <View className="items-center">
                          <Text className={cn('text-xs mb-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                            Exercises
                          </Text>
                          <Text className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-black')}>
                            {session.exercises.length}
                          </Text>
                        </View>
                      </View>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <Animated.View 
                          entering={FadeInDown.duration(300)} 
                          className={cn('mt-5 pt-5 border-t', isDark ? 'border-gray-700/30' : 'border-gray-300/30')}
                        >
                          <Text className={cn('text-base font-bold mb-3', isDark ? 'text-white' : 'text-black')}>
                            Exercises:
                          </Text>
                          {session.exercises.map((exercise, exIdx) => {
                            return (
                              <View key={exIdx} className="mb-4">
                                <Text className={cn('text-base font-semibold mb-2', isDark ? 'text-white' : 'text-black')}>
                                  {exercise.exerciseName}
                                </Text>
                                <View className="flex-row flex-wrap gap-2">
                                  {exercise.sets.map((set, setIdx) => (
                                    <View
                                      key={setIdx}
                                      className={cn(
                                        'px-3 py-2 rounded-xl',
                                        isDark ? 'bg-white/10' : 'bg-black/5'
                                      )}
                                    >
                                      <Text className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-black')}>
                                        {set.actualLoad}kg × {set.actualReps}
                                      </Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            );
                          })}
                        </Animated.View>
                      )}

                      {session.aiCoachTip && (
                        <View
                          className={cn(
                            'mt-4 p-4 rounded-2xl',
                            isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                          )}
                        >
                          <View className="flex-row items-start">
                            <Ionicons name="bulb" size={18} color="#3b82f6" />
                            <Text className={cn('text-sm ml-2 flex-1 font-medium', isDark ? 'text-blue-400' : 'text-blue-700')}>
                              {session.aiCoachTip}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </BlurView>
                </Pressable>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

