// Select Active Program Screen - Choose which program to make active
import React from 'react';
import { View, Text, ScrollView, Pressable, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { cn } from '../../utils/cn';
import { useSettingsStore } from '../../state/settingsStore';
import { useTrainingStore } from '../../state/trainingStore';
import { PremiumBackground } from '../../components/PremiumBackground';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

export default function SelectActiveProgramScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === 'system' ? (systemColorScheme || 'light') : theme;
  const isDark = resolvedTheme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const programs = useTrainingStore((state) => state.programs);
  const activeProgram = useTrainingStore((state) => state.activeProgram);
  const setActiveProgram = useTrainingStore((state) => state.setActiveProgram);

  const handleSelectProgram = (programId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setActiveProgram(programId);
    // Navigate to the weekly planner
    navigation.replace('WeeklyPlanner');
  };

  return (
    <SafeAreaView className={cn('flex-1', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
      <PremiumBackground theme={theme} variant="workout" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Pressable onPress={() => navigation.goBack()} className="mb-4">
            <Ionicons name="arrow-back" size={28} color={isDark ? '#fff' : '#000'} />
          </Pressable>
          <Text className={cn('text-4xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
            Select Active Program
          </Text>
          <Text className={cn('text-base', isDark ? 'text-gray-400' : 'text-gray-600')}>
            Choose a program to activate and track your weekly workouts
          </Text>
        </View>

        {/* Programs List */}
        <View className="px-6 mb-6">
          {programs.length === 0 ? (
            <Animated.View
              entering={FadeInDown.delay(100).duration(400).springify()}
              className="py-12"
            >
              <View className="items-center">
                <View className={cn('w-20 h-20 rounded-3xl items-center justify-center mb-4', isDark ? 'bg-purple-500/20' : 'bg-purple-100')}>
                  <Ionicons name="barbell-outline" size={40} color="#a855f7" />
                </View>
                <Text className={cn('text-xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
                  No Programs Yet
                </Text>
                <Text className={cn('text-sm text-center mb-6', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  Create your first workout program to get started
                </Text>
                <Pressable
                  onPress={() => navigation.navigate('ProgramWizard')}
                  className="bg-purple-500 px-6 py-3 rounded-2xl"
                >
                  <Text className="text-white font-bold">Create Program</Text>
                </Pressable>
              </View>
            </Animated.View>
          ) : (
            programs.map((program, index) => (
              <Animated.View
                key={program.id}
                entering={FadeInDown.delay(100 + index * 50).duration(400).springify()}
                className="mb-4"
              >
                <Pressable onPress={() => handleSelectProgram(program.id)}>
                  <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden">
                    <View
                      className={cn(
                        'p-6',
                        program.id === activeProgram?.id ? 'border-2 border-purple-500' : '',
                        isDark ? 'bg-white/5' : 'bg-white/40'
                      )}
                      style={{
                        shadowColor: program.id === activeProgram?.id ? '#a855f7' : isDark ? '#000' : '#1f2937',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: program.id === activeProgram?.id ? 0.4 : isDark ? 0.3 : 0.1,
                        shadowRadius: 16,
                        elevation: program.id === activeProgram?.id ? 10 : 5,
                      }}
                    >
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-1">
                          <Text className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
                            {program.name}
                          </Text>
                          {program.description && (
                            <Text className={cn('text-sm mb-3', isDark ? 'text-gray-400' : 'text-gray-600')}>
                              {program.description}
                            </Text>
                          )}
                        </View>
                        {program.id === activeProgram?.id && (
                          <View className="bg-green-500 px-3 py-1 rounded-full">
                            <Text className="text-white text-xs font-bold">Active</Text>
                          </View>
                        )}
                      </View>

                      {/* Split Info */}
                      <View className="flex-row flex-wrap gap-2 mb-3">
                        <View className={cn('px-3 py-1 rounded-full', isDark ? 'bg-blue-500/20' : 'bg-blue-100')}>
                          <Text className={cn('text-xs font-bold', isDark ? 'text-blue-400' : 'text-blue-600')}>
                            {program.split.type.replace(/-/g, ' ').toUpperCase()}
                          </Text>
                        </View>
                        <View className={cn('px-3 py-1 rounded-full', isDark ? 'bg-orange-500/20' : 'bg-orange-100')}>
                          <Text className={cn('text-xs font-bold', isDark ? 'text-orange-400' : 'text-orange-600')}>
                            {program.split.daysPerWeek} days/week
                          </Text>
                        </View>
                        <View className={cn('px-3 py-1 rounded-full', isDark ? 'bg-purple-500/20' : 'bg-purple-100')}>
                          <Text className={cn('text-xs font-bold', isDark ? 'text-purple-400' : 'text-purple-600')}>
                            {program.durationWeeks} weeks
                          </Text>
                        </View>
                      </View>

                      {/* Action Button */}
                      {program.id === activeProgram?.id ? (
                        <Pressable
                          onPress={() => navigation.navigate('WeeklyPlanner')}
                          className="bg-purple-500 py-3 rounded-2xl"
                        >
                          <Text className="text-white font-bold text-center">View Weekly Plan</Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={() => handleSelectProgram(program.id)}
                          className={cn('py-3 rounded-2xl', isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200')}
                        >
                          <Text className={cn('font-bold text-center', isDark ? 'text-white' : 'text-gray-900')}>
                            Set as Active
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </BlurView>
                </Pressable>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
