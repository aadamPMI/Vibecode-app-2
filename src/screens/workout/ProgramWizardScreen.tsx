// Program Wizard Screen - Step-by-step program creation
import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, useColorScheme, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { cn } from '../../utils/cn';
import { useSettingsStore } from '../../state/settingsStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PremiumBackground } from '../../components/PremiumBackground';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';

type SplitType = 'push-pull-legs' | 'upper-lower' | 'full-body' | 'custom';

export default function ProgramWizardScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === "system" ? (systemColorScheme || "light") : theme;
  const isDark = resolvedTheme === "dark";
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSplit, setSelectedSplit] = useState<SplitType | null>(null);
  const [programName, setProgramName] = useState('');

  const handleSplitSelect = (splitType: SplitType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSplit(splitType);
  };

  const handleNext = () => {
    if (!selectedSplit) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (selectedSplit === 'custom') {
      // Navigate to custom split builder
      navigation.navigate('SplitBuilder', { preset: null, programName: programName || 'Custom Program' });
    } else {
      // Navigate with preset
      setCurrentStep(2);
      // TODO: Next step implementation
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep === 1) {
      navigation.goBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const splits = [
    {
      type: 'push-pull-legs' as SplitType,
      icon: 'footsteps' as const,
      color: '#3b82f6',
      bgColor: isDark ? 'bg-blue-500/20' : 'bg-blue-100',
      label: 'Push/Pull/Legs',
    },
    {
      type: 'upper-lower' as SplitType,
      icon: 'body' as const,
      color: '#ec4899',
      bgColor: isDark ? 'bg-pink-500/20' : 'bg-pink-100',
      label: 'Upper/Lower',
    },
    {
      type: 'full-body' as SplitType,
      icon: 'flash' as const,
      color: '#22c55e',
      bgColor: isDark ? 'bg-green-500/20' : 'bg-green-100',
      label: 'Full Body',
    },
    {
      type: 'custom' as SplitType,
      icon: 'add' as const,
      color: '#f97316',
      bgColor: isDark ? 'bg-orange-500/20' : 'bg-orange-100',
      label: 'Custom',
    },
  ];

  return (
    <SafeAreaView className={cn('flex-1', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
      <PremiumBackground theme={theme} variant="workout" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1">
              <Text className={cn('text-2xl font-bold', isDark ? 'text-purple-400' : 'text-purple-600')}>
                Create Workout Program
              </Text>
              <Text className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                Choose your workout split
              </Text>
            </View>
            <Pressable
              onPress={() => navigation.goBack()}
              className={cn('w-10 h-10 rounded-full items-center justify-center', isDark ? 'bg-white/10' : 'bg-black/5')}
            >
              <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
            </Pressable>
          </View>

          {/* Progress Indicator */}
          <View className="flex-row items-center gap-2">
            {[1, 2, 3, 4].map((step) => (
              <View key={step} className="flex-1">
                <View
                  className={cn(
                    'h-1 rounded-full',
                    step === currentStep
                      ? 'bg-purple-500'
                      : step < currentStep
                      ? 'bg-purple-500'
                      : isDark
                      ? 'bg-gray-700'
                      : 'bg-gray-300'
                  )}
                />
                <Text
                  className={cn(
                    'text-center text-xs mt-1',
                    step === currentStep
                      ? isDark ? 'text-purple-400' : 'text-purple-600'
                      : isDark ? 'text-gray-600' : 'text-gray-400'
                  )}
                >
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Content */}
        {currentStep === 1 && (
          <View className="px-6">
            {/* Icon */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(400).springify()}
              className="items-center mb-6"
            >
              <View className={cn('w-20 h-20 rounded-3xl items-center justify-center mb-4', isDark ? 'bg-purple-500/20' : 'bg-purple-100')}>
                <Ionicons name="sparkles" size={40} color="#a855f7" />
              </View>
              <Text className={cn('text-2xl font-bold mb-2 text-center', isDark ? 'text-white' : 'text-black')}>
                Choose Your Split
              </Text>
              <Text className={cn('text-sm text-center', isDark ? 'text-gray-400' : 'text-gray-600')}>
                Select a preset or create your own custom workout split
              </Text>
            </Animated.View>

            {/* Split Options */}
            <View className="gap-3 mb-6">
              {splits.map((split, index) => (
                <Animated.View
                  key={split.type}
                  entering={FadeInDown.delay(200 + index * 100).duration(400).springify()}
                >
                  <Pressable
                    onPress={() => handleSplitSelect(split.type)}
                  >
                    <BlurView 
                      intensity={80} 
                      tint={isDark ? 'dark' : 'light'} 
                      className="rounded-3xl overflow-hidden"
                    >
                      <View
                        className={cn(
                          'p-5',
                          selectedSplit === split.type ? 'border-2 border-purple-500' : '',
                          isDark ? 'bg-white/5' : 'bg-white/40'
                        )}
                        style={{
                          shadowColor: selectedSplit === split.type ? '#a855f7' : isDark ? '#000' : '#1f2937',
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: selectedSplit === split.type ? 0.4 : isDark ? 0.3 : 0.1,
                          shadowRadius: 16,
                          elevation: selectedSplit === split.type ? 10 : 5,
                        }}
                      >
                        <View className="flex-row items-center">
                          <View className={cn('w-16 h-16 rounded-2xl items-center justify-center mr-4', split.bgColor)}>
                            <Ionicons name={split.icon} size={32} color={split.color} />
                          </View>
                          <View className="flex-1">
                            <Text className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-black')}>
                              {split.label}
                            </Text>
                          </View>
                          {selectedSplit === split.type && (
                            <View className="w-8 h-8 rounded-full bg-purple-500 items-center justify-center">
                              <Ionicons name="checkmark" size={20} color="white" />
                            </View>
                          )}
                        </View>
                      </View>
                    </BlurView>
                  </Pressable>
                </Animated.View>
              ))}
            </View>

            {/* Split Name Input (Optional) */}
            {selectedSplit && (
              <Animated.View
                entering={FadeInDown.delay(100).duration(400).springify()}
                className="mb-6"
              >
                <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
                  Split Name (Optional)
                </Text>
                <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                  <TextInput
                    value={programName}
                    onChangeText={setProgramName}
                    placeholder="e.g., Summer Shred, Strength Builder"
                    placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                    className={cn(
                      'p-4 text-base',
                      isDark ? 'text-white bg-white/5' : 'text-black bg-white/40'
                    )}
                  />
                </BlurView>
              </Animated.View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-6 pb-6">
        <View className="flex-row gap-3">
          <Pressable
            onPress={handleBack}
            className="flex-1"
          >
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
              <View 
                className={cn('py-4 flex-row items-center justify-center', isDark ? 'bg-white/10' : 'bg-black/5')}
                style={{
                  shadowColor: isDark ? '#000' : '#1f2937',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <Ionicons name="arrow-back" size={20} color={isDark ? '#fff' : '#000'} />
                <Text className={cn('font-bold ml-2', isDark ? 'text-white' : 'text-black')}>
                  Back
                </Text>
              </View>
            </BlurView>
          </Pressable>

          <Pressable
            onPress={handleNext}
            disabled={!selectedSplit}
            className="flex-1"
          >
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
              <View 
                className={cn(
                  'py-4 flex-row items-center justify-center',
                  selectedSplit
                    ? 'bg-purple-500'
                    : isDark
                    ? 'bg-gray-700'
                    : 'bg-gray-300'
                )}
                style={{
                  shadowColor: selectedSplit ? '#a855f7' : '#6b7280',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: selectedSplit ? 0.4 : 0.2,
                  shadowRadius: 12,
                  elevation: selectedSplit ? 8 : 3,
                }}
              >
                <Text className={cn('font-bold mr-2', selectedSplit ? 'text-white' : isDark ? 'text-gray-500' : 'text-gray-400')}>
                  Next
                </Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={20} 
                  color={selectedSplit ? '#fff' : isDark ? '#6b7280' : '#9ca3af'} 
                />
              </View>
            </BlurView>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
