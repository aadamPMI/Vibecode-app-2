import React from 'react';
import { View, Text, ScrollView, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { cn } from '../utils/cn';
import { useSettingsStore } from '../state/settingsStore';
import { useFriendsStore } from '../state/friendsStore';
import { useTrainingStore } from '../state/trainingStore';
import { PremiumBackground } from '../components/PremiumBackground';
import { BlurView } from 'expo-blur';

export default function FriendProfileScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === 'system' ? (systemColorScheme || 'light') : theme;
  const isDark = resolvedTheme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();

  const friendId = (route.params as any)?.friendId;
  const friend = useFriendsStore((state) => state.getFriend(friendId));

  // For demo purposes, use the current user's data
  // In a real app, this would fetch the friend's data from backend
  const programs = useTrainingStore((state) => state.programs);

  if (!friend) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#000' : '#f9fafb' }}>
        <View className="flex-1 items-center justify-center">
          <Text className={cn('text-lg', isDark ? 'text-gray-400' : 'text-gray-600')}>
            Friend not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? '#000' : '#f9fafb' }}>
      <PremiumBackground theme={resolvedTheme} />

      {/* Header */}
      <View className={cn('px-6 py-4 flex-row items-center', isDark ? 'bg-[#0a0a0a]' : 'bg-white')}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
          className={cn('w-10 h-10 rounded-full items-center justify-center mr-4', isDark ? 'bg-gray-800' : 'bg-gray-200')}
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </Pressable>
        <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
          {friend.username}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Profile Header */}
        <View className="items-center mb-6">
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: isDark ? '#9333ea' : '#e9d5ff' }}
          >
            <Text className={cn('text-4xl font-bold', isDark ? 'text-white' : 'text-purple-700')}>
              {friend.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
            {friend.username}
          </Text>
          <Text className={cn('text-lg', isDark ? 'text-gray-400' : 'text-gray-600')}>
            #{friend.tag}
          </Text>
        </View>

        {/* Sharing Status */}
        <View className="flex-row justify-center mb-6 space-x-2">
          {friend.sharesSplits && (
            <View className={cn('px-3 py-1.5 rounded-full', isDark ? 'bg-blue-500/20' : 'bg-blue-100')}>
              <Text className={cn('text-xs font-semibold', isDark ? 'text-blue-400' : 'text-blue-700')}>
                Shares Splits
              </Text>
            </View>
          )}
          {friend.sharesNutrition && (
            <View className={cn('px-3 py-1.5 rounded-full ml-2', isDark ? 'bg-green-500/20' : 'bg-green-100')}>
              <Text className={cn('text-xs font-semibold', isDark ? 'text-green-400' : 'text-green-700')}>
                Shares Nutrition
              </Text>
            </View>
          )}
          {friend.sharesWorkouts && (
            <View className={cn('px-3 py-1.5 rounded-full ml-2', isDark ? 'bg-purple-500/20' : 'bg-purple-100')}>
              <Text className={cn('text-xs font-semibold', isDark ? 'text-purple-400' : 'text-purple-700')}>
                Shares Workouts
              </Text>
            </View>
          )}
        </View>

        {/* Workout Splits Section */}
        {friend.sharesSplits && (
          <View className="mb-6">
            <Text className={cn('text-xl font-bold mb-4', isDark ? 'text-white' : 'text-gray-900')}>
              Workout Splits
            </Text>

            {programs.length === 0 ? (
              <View className="items-center py-8">
                <Ionicons name="barbell-outline" size={48} color={isDark ? '#6b7280' : '#9ca3af'} />
                <Text className={cn('text-base mt-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  No workout programs yet
                </Text>
              </View>
            ) : (
              programs.map((program) => (
                <BlurView
                  key={program.id}
                  intensity={60}
                  tint={isDark ? 'dark' : 'light'}
                  className="rounded-2xl overflow-hidden mb-3"
                >
                  <View className={cn('p-4', isDark ? 'bg-white/5' : 'bg-white/40')}>
                    <Text className={cn('text-lg font-bold mb-2', isDark ? 'text-white' : 'text-gray-900')}>
                      {program.name}
                    </Text>
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="calendar" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                      <Text className={cn('text-sm ml-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                        {program.split.daysPerWeek} days per week
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="fitness" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                      <Text className={cn('text-sm ml-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                        {program.workoutTemplates.length} workouts
                      </Text>
                    </View>

                    {/* Split type badge */}
                    <View className="mt-3">
                      <View className={cn('px-3 py-1 rounded-full self-start', isDark ? 'bg-blue-500/20' : 'bg-blue-100')}>
                        <Text className={cn('text-xs font-semibold', isDark ? 'text-blue-400' : 'text-blue-600')}>
                          {program.split.type.replace(/-/g, ' ').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </BlurView>
              ))
            )}
          </View>
        )}

        {/* Nutrition Section */}
        {friend.sharesNutrition && (
          <View className="mb-6">
            <Text className={cn('text-xl font-bold mb-4', isDark ? 'text-white' : 'text-gray-900')}>
              Nutrition Goals
            </Text>

            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
              <View className={cn('p-4', isDark ? 'bg-white/5' : 'bg-white/40')}>
                <View className="flex-row justify-between mb-3">
                  <View className="flex-1">
                    <Text className={cn('text-sm mb-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      Calories
                    </Text>
                    <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                      2500
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className={cn('text-sm mb-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      Protein
                    </Text>
                    <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                      180g
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <Text className={cn('text-sm mb-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      Carbs
                    </Text>
                    <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                      250g
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className={cn('text-sm mb-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      Fats
                    </Text>
                    <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                      70g
                    </Text>
                  </View>
                </View>
              </View>
            </BlurView>
          </View>
        )}

        {/* Workout Stats Section */}
        {friend.sharesWorkouts && (
          <View className="mb-6">
            <Text className={cn('text-xl font-bold mb-4', isDark ? 'text-white' : 'text-gray-900')}>
              Workout Stats
            </Text>

            <View className="flex-row gap-3 mb-3">
              <View className="flex-1">
                <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                  <View className={cn('p-4', isDark ? 'bg-purple-500/10' : 'bg-purple-50')}>
                    <Ionicons name="flame" size={24} color="#a855f7" />
                    <Text className={cn('text-2xl font-bold mt-2', isDark ? 'text-white' : 'text-black')}>
                      12
                    </Text>
                    <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      This Week
                    </Text>
                  </View>
                </BlurView>
              </View>
              <View className="flex-1">
                <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                  <View className={cn('p-4', isDark ? 'bg-blue-500/10' : 'bg-blue-50')}>
                    <Ionicons name="trophy" size={24} color="#3b82f6" />
                    <Text className={cn('text-2xl font-bold mt-2', isDark ? 'text-white' : 'text-black')}>
                      48
                    </Text>
                    <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      Total
                    </Text>
                  </View>
                </BlurView>
              </View>
            </View>
          </View>
        )}

        {/* No Data Message */}
        {!friend.sharesSplits && !friend.sharesNutrition && !friend.sharesWorkouts && (
          <View className="items-center py-12">
            <Ionicons name="lock-closed-outline" size={64} color={isDark ? '#6b7280' : '#9ca3af'} />
            <Text className={cn('text-lg mt-4', isDark ? 'text-gray-400' : 'text-gray-600')}>
              Private Profile
            </Text>
            <Text className={cn('text-sm mt-2 text-center', isDark ? 'text-gray-500' : 'text-gray-500')}>
              {friend.username} hasn't shared any information yet
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
