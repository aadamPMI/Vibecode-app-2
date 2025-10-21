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
type DayPreset = 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'custom';
type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'abs' | 'cardio';

export default function ProgramWizardScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === "system" ? (systemColorScheme || "light") : theme;
  const isDark = resolvedTheme === "dark";
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSplit, setSelectedSplit] = useState<SplitType | null>(null);
  const [programName, setProgramName] = useState('');
  
  // Step 2 - Workout Days
  const [dayName, setDayName] = useState('');
  const [isRestDay, setIsRestDay] = useState(false);
  const [selectedDayPreset, setSelectedDayPreset] = useState<DayPreset | null>(null);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<MuscleGroup[]>([]);
  
  // Step 3 - Days list and selection
  const [workoutDays, setWorkoutDays] = useState<Array<{
    id: string;
    name: string;
    muscleGroups: MuscleGroup[];
    isRestDay: boolean;
    exercises: string[];
  }>>([]);
  const [selectedDayForExercises, setSelectedDayForExercises] = useState<string | null>(null);

  const handleSplitSelect = (splitType: SplitType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSplit(splitType);
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedSplit) return;
    if (currentStep === 2 && !dayName.trim() && !isRestDay) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (currentStep === 1) {
      if (selectedSplit === 'custom') {
        navigation.navigate('SplitBuilder', { preset: null, programName: programName || 'Custom Program' });
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      // Save the day and move to step 3
      const newDay = {
        id: Date.now().toString(),
        name: dayName,
        muscleGroups: selectedMuscleGroups,
        isRestDay: isRestDay,
        exercises: [] as string[], // Initialize empty exercises array
      };
      setWorkoutDays([...workoutDays, newDay]);
      
      // Reset step 2 fields
      setDayName('');
      setSelectedMuscleGroups([]);
      setIsRestDay(false);
      setSelectedDayPreset(null);
      
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Add mock exercises to selected day and move to step 4
      if (selectedDayForExercises) {
        const updatedDays = workoutDays.map(day => {
          if (day.id === selectedDayForExercises) {
            // Add mock exercises based on muscle groups
            const mockExercises: string[] = [];
            if (day.muscleGroups.includes('chest')) mockExercises.push('Bench Press', 'Push-ups');
            if (day.muscleGroups.includes('back')) mockExercises.push('Lat Pulldowns', 'Barbell Rows');
            if (day.muscleGroups.includes('quads')) mockExercises.push('Squats');
            if (day.muscleGroups.includes('biceps')) mockExercises.push('Barbell Curls');
            if (day.muscleGroups.includes('cardio')) mockExercises.push('Running', 'Cycling');
            
            return { ...day, exercises: mockExercises.length > 0 ? mockExercises : ['Sample Exercise 1', 'Sample Exercise 2'] };
          }
          return day;
        });
        setWorkoutDays(updatedDays);
      }
      setCurrentStep(4);
    }
  };

  const handleDayPresetSelect = (preset: DayPreset) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDayPreset(preset);
    
    // Auto-populate muscle groups based on preset
    if (preset === 'push') {
      setSelectedMuscleGroups(['chest', 'shoulders', 'triceps']);
      setDayName('Push Day');
    } else if (preset === 'pull') {
      setSelectedMuscleGroups(['back', 'biceps']);
      setDayName('Pull Day');
    } else if (preset === 'legs') {
      setSelectedMuscleGroups(['quads', 'hamstrings', 'glutes', 'calves']);
      setDayName('Legs Day');
    } else if (preset === 'upper') {
      setSelectedMuscleGroups(['chest', 'back', 'shoulders', 'biceps', 'triceps']);
      setDayName('Upper Body');
    } else if (preset === 'lower') {
      setSelectedMuscleGroups(['quads', 'hamstrings', 'glutes', 'calves']);
      setDayName('Lower Body');
    } else {
      setSelectedMuscleGroups([]);
      setDayName('');
    }
  };

  const toggleMuscleGroup = (muscle: MuscleGroup) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMuscleGroups(prev => 
      prev.includes(muscle) 
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
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
                {currentStep === 1 
                  ? 'Choose your workout split' 
                  : currentStep === 2 
                  ? 'Create workout days' 
                  : currentStep === 3
                  ? 'Add exercises to days'
                  : 'Review program'}
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

        {/* Step 2 - Create Workout Day */}
        {currentStep === 2 && (
          <View className="px-6">
            {/* Day Preset Buttons - Top Row */}
            <View className="mb-6">
              <View className="flex-row flex-wrap gap-3 mb-4">
                <Pressable
                  onPress={() => handleDayPresetSelect('push')}
                  className="flex-1 min-w-[30%]"
                >
                  <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden">
                    <View
                      className={cn(
                        'p-5 items-center aspect-square justify-center',
                        selectedDayPreset === 'push' ? 'border-2 border-purple-500' : '',
                        'bg-blue-500/20'
                      )}
                      style={{
                        shadowColor: selectedDayPreset === 'push' ? '#a855f7' : isDark ? '#000' : '#1f2937',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: selectedDayPreset === 'push' ? 0.4 : 0.2,
                        shadowRadius: 12,
                        elevation: selectedDayPreset === 'push' ? 8 : 4,
                      }}
                    >
                      <Ionicons name="fitness" size={32} color="#3b82f6" />
                      <Text className={cn('text-sm font-bold mt-2', isDark ? 'text-white' : 'text-black')}>
                        Push
                      </Text>
                    </View>
                  </BlurView>
                </Pressable>

                <Pressable
                  onPress={() => handleDayPresetSelect('pull')}
                  className="flex-1 min-w-[30%]"
                >
                  <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden">
                    <View
                      className={cn(
                        'p-5 items-center aspect-square justify-center',
                        selectedDayPreset === 'pull' ? 'border-2 border-purple-500' : '',
                        'bg-pink-500/20'
                      )}
                      style={{
                        shadowColor: selectedDayPreset === 'pull' ? '#a855f7' : isDark ? '#000' : '#1f2937',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: selectedDayPreset === 'pull' ? 0.4 : 0.2,
                        shadowRadius: 12,
                        elevation: selectedDayPreset === 'pull' ? 8 : 4,
                      }}
                    >
                      <Ionicons name="contract" size={32} color="#ec4899" />
                      <Text className={cn('text-sm font-bold mt-2', isDark ? 'text-white' : 'text-black')}>
                        Pull
                      </Text>
                    </View>
                  </BlurView>
                </Pressable>

                <Pressable
                  onPress={() => handleDayPresetSelect('legs')}
                  className="flex-1 min-w-[30%]"
                >
                  <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden">
                    <View
                      className={cn(
                        'p-5 items-center aspect-square justify-center',
                        selectedDayPreset === 'legs' ? 'border-2 border-purple-500' : '',
                        'bg-green-500/20'
                      )}
                      style={{
                        shadowColor: selectedDayPreset === 'legs' ? '#a855f7' : isDark ? '#000' : '#1f2937',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: selectedDayPreset === 'legs' ? 0.4 : 0.2,
                        shadowRadius: 12,
                        elevation: selectedDayPreset === 'legs' ? 8 : 4,
                      }}
                    >
                      <Ionicons name="walk" size={32} color="#22c55e" />
                      <Text className={cn('text-sm font-bold mt-2', isDark ? 'text-white' : 'text-black')}>
                        Legs
                      </Text>
                    </View>
                  </BlurView>
                </Pressable>
              </View>

              <View className="flex-row gap-3 mb-4">
                <Pressable
                  onPress={() => handleDayPresetSelect('upper')}
                  className="flex-1"
                >
                  <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden">
                    <View
                      className={cn(
                        'p-5 items-center aspect-square justify-center',
                        selectedDayPreset === 'upper' ? 'border-2 border-purple-500' : '',
                        'bg-purple-500/20'
                      )}
                      style={{
                        shadowColor: selectedDayPreset === 'upper' ? '#a855f7' : isDark ? '#000' : '#1f2937',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: selectedDayPreset === 'upper' ? 0.4 : 0.2,
                        shadowRadius: 12,
                        elevation: selectedDayPreset === 'upper' ? 8 : 4,
                      }}
                    >
                      <Ionicons name="body" size={32} color="#a855f7" />
                      <Text className={cn('text-sm font-bold mt-2', isDark ? 'text-white' : 'text-black')}>
                        Upper
                      </Text>
                    </View>
                  </BlurView>
                </Pressable>

                <Pressable
                  onPress={() => handleDayPresetSelect('custom')}
                  className="flex-1"
                >
                  <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden">
                    <View
                      className={cn(
                        'p-5 items-center aspect-square justify-center',
                        selectedDayPreset === 'custom' ? 'border-2 border-purple-500' : '',
                        'bg-orange-500/20'
                      )}
                      style={{
                        shadowColor: selectedDayPreset === 'custom' ? '#a855f7' : isDark ? '#000' : '#1f2937',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: selectedDayPreset === 'custom' ? 0.4 : 0.2,
                        shadowRadius: 12,
                        elevation: selectedDayPreset === 'custom' ? 8 : 4,
                      }}
                    >
                      <Ionicons name="add" size={32} color="#f97316" />
                      <Text className={cn('text-sm font-bold mt-2', isDark ? 'text-white' : 'text-black')}>
                        Custom
                      </Text>
                    </View>
                  </BlurView>
                </Pressable>
              </View>
            </View>

            {/* Day Name Input */}
            <View className="mb-4">
              <Text className={cn('text-base font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
                Day Name *
              </Text>
              <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                <TextInput
                  value={dayName}
                  onChangeText={setDayName}
                  placeholder="e.g., Push Day"
                  placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                  className={cn(
                    'p-4 text-base',
                    isDark ? 'text-white bg-white/5' : 'text-black bg-white/40'
                  )}
                />
              </BlurView>
            </View>

            {/* Rest Day Toggle */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsRestDay(!isRestDay);
              }}
              className="mb-6"
            >
              <View className="flex-row items-center">
                <View
                  className={cn(
                    'w-6 h-6 rounded-full border-2 items-center justify-center mr-3',
                    isRestDay ? 'border-blue-500 bg-blue-500' : isDark ? 'border-gray-600' : 'border-gray-400'
                  )}
                >
                  {isRestDay && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text className={cn('text-base', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  This is a rest day
                </Text>
              </View>
            </Pressable>

            {/* Muscle Groups */}
            {!isRestDay && (
              <View className="mb-6">
                <Text className={cn('text-base font-bold mb-3', isDark ? 'text-white' : 'text-black')}>
                  Muscle Groups
                </Text>
                
                <View className="flex-row flex-wrap gap-3">
                  {/* Chest */}
                  <Pressable
                    onPress={() => toggleMuscleGroup('chest')}
                    className="w-[47%]"
                  >
                    <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                      <View
                        className={cn(
                          'p-4 flex-row items-center justify-center',
                          selectedMuscleGroups.includes('chest') ? 'border-2 border-blue-500' : '',
                          isDark ? 'bg-white/5' : 'bg-white/40'
                        )}
                        style={{
                          shadowColor: selectedMuscleGroups.includes('chest') ? '#3b82f6' : isDark ? '#000' : '#1f2937',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: selectedMuscleGroups.includes('chest') ? 0.3 : 0.1,
                          shadowRadius: 8,
                          elevation: selectedMuscleGroups.includes('chest') ? 6 : 3,
                        }}
                      >
                        <Ionicons name="heart-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        <Text className={cn('ml-2 font-semibold', isDark ? 'text-white' : 'text-black')}>
                          Chest
                        </Text>
                      </View>
                    </BlurView>
                  </Pressable>

                  {/* Back */}
                  <Pressable
                    onPress={() => toggleMuscleGroup('back')}
                    className="w-[47%]"
                  >
                    <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                      <View
                        className={cn(
                          'p-4 flex-row items-center justify-center',
                          selectedMuscleGroups.includes('back') ? 'border-2 border-blue-500' : '',
                          isDark ? 'bg-white/5' : 'bg-white/40'
                        )}
                        style={{
                          shadowColor: selectedMuscleGroups.includes('back') ? '#3b82f6' : isDark ? '#000' : '#1f2937',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: selectedMuscleGroups.includes('back') ? 0.3 : 0.1,
                          shadowRadius: 8,
                          elevation: selectedMuscleGroups.includes('back') ? 6 : 3,
                        }}
                      >
                        <Ionicons name="flash-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        <Text className={cn('ml-2 font-semibold', isDark ? 'text-white' : 'text-black')}>
                          Back
                        </Text>
                      </View>
                    </BlurView>
                  </Pressable>

                  {/* Shoulders */}
                  <Pressable
                    onPress={() => toggleMuscleGroup('shoulders')}
                    className="w-[47%]"
                  >
                    <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                      <View
                        className={cn(
                          'p-4 flex-row items-center justify-center',
                          selectedMuscleGroups.includes('shoulders') ? 'border-2 border-blue-500' : '',
                          isDark ? 'bg-white/5' : 'bg-white/40'
                        )}
                        style={{
                          shadowColor: selectedMuscleGroups.includes('shoulders') ? '#3b82f6' : isDark ? '#000' : '#1f2937',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: selectedMuscleGroups.includes('shoulders') ? 0.3 : 0.1,
                          shadowRadius: 8,
                          elevation: selectedMuscleGroups.includes('shoulders') ? 6 : 3,
                        }}
                      >
                        <Ionicons name="shield-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        <Text className={cn('ml-2 font-semibold', isDark ? 'text-white' : 'text-black')}>
                          Shoulders
                        </Text>
                      </View>
                    </BlurView>
                  </Pressable>

                  {/* Biceps */}
                  <Pressable
                    onPress={() => toggleMuscleGroup('biceps')}
                    className="w-[47%]"
                  >
                    <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                      <View
                        className={cn(
                          'p-4 flex-row items-center justify-center',
                          selectedMuscleGroups.includes('biceps') ? 'border-2 border-blue-500' : '',
                          isDark ? 'bg-white/5' : 'bg-white/40'
                        )}
                        style={{
                          shadowColor: selectedMuscleGroups.includes('biceps') ? '#3b82f6' : isDark ? '#000' : '#1f2937',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: selectedMuscleGroups.includes('biceps') ? 0.3 : 0.1,
                          shadowRadius: 8,
                          elevation: selectedMuscleGroups.includes('biceps') ? 6 : 3,
                        }}
                      >
                        <Ionicons name="fitness-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        <Text className={cn('ml-2 font-semibold', isDark ? 'text-white' : 'text-black')}>
                          Biceps
                        </Text>
                      </View>
                    </BlurView>
                  </Pressable>

                  {/* Triceps */}
                  <Pressable
                    onPress={() => toggleMuscleGroup('triceps')}
                    className="w-[47%]"
                  >
                    <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                      <View
                        className={cn(
                          'p-4 flex-row items-center justify-center',
                          selectedMuscleGroups.includes('triceps') ? 'border-2 border-blue-500' : '',
                          isDark ? 'bg-white/5' : 'bg-white/40'
                        )}
                        style={{
                          shadowColor: selectedMuscleGroups.includes('triceps') ? '#3b82f6' : isDark ? '#000' : '#1f2937',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: selectedMuscleGroups.includes('triceps') ? 0.3 : 0.1,
                          shadowRadius: 8,
                          elevation: selectedMuscleGroups.includes('triceps') ? 6 : 3,
                        }}
                      >
                        <Ionicons name="barbell-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        <Text className={cn('ml-2 font-semibold', isDark ? 'text-white' : 'text-black')}>
                          Triceps
                        </Text>
                      </View>
                    </BlurView>
                  </Pressable>

                  {/* Quads */}
                  <Pressable
                    onPress={() => toggleMuscleGroup('quads')}
                    className="w-[47%]"
                  >
                    <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                      <View
                        className={cn(
                          'p-4 flex-row items-center justify-center',
                          selectedMuscleGroups.includes('quads') ? 'border-2 border-blue-500' : '',
                          isDark ? 'bg-white/5' : 'bg-white/40'
                        )}
                        style={{
                          shadowColor: selectedMuscleGroups.includes('quads') ? '#3b82f6' : isDark ? '#000' : '#1f2937',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: selectedMuscleGroups.includes('quads') ? 0.3 : 0.1,
                          shadowRadius: 8,
                          elevation: selectedMuscleGroups.includes('quads') ? 6 : 3,
                        }}
                      >
                        <Ionicons name="pulse-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        <Text className={cn('ml-2 font-semibold', isDark ? 'text-white' : 'text-black')}>
                          Quads
                        </Text>
                      </View>
                    </BlurView>
                  </Pressable>

                  {/* Hamstrings */}
                  <Pressable
                    onPress={() => toggleMuscleGroup('hamstrings')}
                    className="w-[47%]"
                  >
                    <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                      <View
                        className={cn(
                          'p-4 flex-row items-center justify-center',
                          selectedMuscleGroups.includes('hamstrings') ? 'border-2 border-blue-500' : '',
                          isDark ? 'bg-white/5' : 'bg-white/40'
                        )}
                        style={{
                          shadowColor: selectedMuscleGroups.includes('hamstrings') ? '#3b82f6' : isDark ? '#000' : '#1f2937',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: selectedMuscleGroups.includes('hamstrings') ? 0.3 : 0.1,
                          shadowRadius: 8,
                          elevation: selectedMuscleGroups.includes('hamstrings') ? 6 : 3,
                        }}
                      >
                        <Ionicons name="contract-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        <Text className={cn('ml-2 font-semibold', isDark ? 'text-white' : 'text-black')}>
                          Hamstrings
                        </Text>
                      </View>
                    </BlurView>
                  </Pressable>

                  {/* Glutes */}
                  <Pressable
                    onPress={() => toggleMuscleGroup('glutes')}
                    className="w-[47%]"
                  >
                    <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                      <View
                        className={cn(
                          'p-4 flex-row items-center justify-center',
                          selectedMuscleGroups.includes('glutes') ? 'border-2 border-blue-500' : '',
                          isDark ? 'bg-white/5' : 'bg-white/40'
                        )}
                        style={{
                          shadowColor: selectedMuscleGroups.includes('glutes') ? '#3b82f6' : isDark ? '#000' : '#1f2937',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: selectedMuscleGroups.includes('glutes') ? 0.3 : 0.1,
                          shadowRadius: 8,
                          elevation: selectedMuscleGroups.includes('glutes') ? 6 : 3,
                        }}
                      >
                        <Ionicons name="ellipse-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        <Text className={cn('ml-2 font-semibold', isDark ? 'text-white' : 'text-black')}>
                          Glutes
                        </Text>
                      </View>
                    </BlurView>
                  </Pressable>

                  {/* Calves */}
                  <Pressable
                    onPress={() => toggleMuscleGroup('calves')}
                    className="w-[47%]"
                  >
                    <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                      <View
                        className={cn(
                          'p-4 flex-row items-center justify-center',
                          selectedMuscleGroups.includes('calves') ? 'border-2 border-blue-500' : '',
                          isDark ? 'bg-white/5' : 'bg-white/40'
                        )}
                        style={{
                          shadowColor: selectedMuscleGroups.includes('calves') ? '#3b82f6' : isDark ? '#000' : '#1f2937',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: selectedMuscleGroups.includes('calves') ? 0.3 : 0.1,
                          shadowRadius: 8,
                          elevation: selectedMuscleGroups.includes('calves') ? 6 : 3,
                        }}
                      >
                        <Ionicons name="arrow-up-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        <Text className={cn('ml-2 font-semibold', isDark ? 'text-white' : 'text-black')}>
                          Calves
                        </Text>
                      </View>
                    </BlurView>
                  </Pressable>

                  {/* Abs */}
                  <Pressable
                    onPress={() => toggleMuscleGroup('abs')}
                    className="w-[47%]"
                  >
                    <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                      <View
                        className={cn(
                          'p-4 flex-row items-center justify-center',
                          selectedMuscleGroups.includes('abs') ? 'border-2 border-blue-500' : '',
                          isDark ? 'bg-white/5' : 'bg-white/40'
                        )}
                        style={{
                          shadowColor: selectedMuscleGroups.includes('abs') ? '#3b82f6' : isDark ? '#000' : '#1f2937',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: selectedMuscleGroups.includes('abs') ? 0.3 : 0.1,
                          shadowRadius: 8,
                          elevation: selectedMuscleGroups.includes('abs') ? 6 : 3,
                        }}
                      >
                        <Ionicons name="square-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        <Text className={cn('ml-2 font-semibold', isDark ? 'text-white' : 'text-black')}>
                          Abs
                        </Text>
                      </View>
                    </BlurView>
                  </Pressable>

                  {/* Cardio */}
                  <Pressable
                    onPress={() => toggleMuscleGroup('cardio')}
                    className="w-[47%]"
                  >
                    <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                      <View
                        className={cn(
                          'p-4 flex-row items-center justify-center',
                          selectedMuscleGroups.includes('cardio') ? 'border-2 border-blue-500' : '',
                          isDark ? 'bg-white/5' : 'bg-white/40'
                        )}
                        style={{
                          shadowColor: selectedMuscleGroups.includes('cardio') ? '#3b82f6' : isDark ? '#000' : '#1f2937',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: selectedMuscleGroups.includes('cardio') ? 0.3 : 0.1,
                          shadowRadius: 8,
                          elevation: selectedMuscleGroups.includes('cardio') ? 6 : 3,
                        }}
                      >
                        <Ionicons name="heart-circle-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                        <Text className={cn('ml-2 font-semibold', isDark ? 'text-white' : 'text-black')}>
                          Cardio
                        </Text>
                      </View>
                    </BlurView>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Step 3 - Select Day to Add Exercises */}
        {currentStep === 3 && (
          <View className="px-6">
            {/* Section Title */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(400).springify()}
              className="mb-6"
            >
              <Text className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
                Select a Day to Add Exercises
              </Text>
              <View className="flex-row items-start">
                <Text className="text-xl mr-2">👆</Text>
                <Text className={cn('text-sm flex-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  Click a day below to start adding exercises
                </Text>
              </View>
            </Animated.View>

            {/* Days List */}
            <View className="gap-4 mb-6">
              {workoutDays.map((day, index) => (
                <Animated.View
                  key={day.id}
                  entering={FadeInDown.delay(200 + index * 100).duration(400).springify()}
                >
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedDayForExercises(day.id);
                    }}
                  >
                    <BlurView 
                      intensity={80} 
                      tint={isDark ? 'dark' : 'light'} 
                      className="rounded-3xl overflow-hidden"
                    >
                      <View
                        className={cn(
                          'p-6',
                          selectedDayForExercises === day.id ? 'border-2 border-purple-500' : '',
                          isDark ? 'bg-white/5' : 'bg-white/40'
                        )}
                        style={{
                          shadowColor: selectedDayForExercises === day.id ? '#a855f7' : isDark ? '#000' : '#1f2937',
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: selectedDayForExercises === day.id ? 0.4 : isDark ? 0.3 : 0.1,
                          shadowRadius: 16,
                          elevation: selectedDayForExercises === day.id ? 10 : 5,
                        }}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <Text className={cn('text-xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
                              {day.name}
                            </Text>
                            <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                              0 exercises
                            </Text>
                          </View>
                          
                          {selectedDayForExercises === day.id && (
                            <View className="w-8 h-8 rounded-full bg-purple-500 items-center justify-center">
                              <Ionicons name="checkmark" size={20} color="white" />
                            </View>
                          )}
                        </View>

                        {/* Muscle Groups Tags */}
                        {!day.isRestDay && day.muscleGroups.length > 0 && (
                          <View className="flex-row flex-wrap gap-2 mt-3">
                            {day.muscleGroups.slice(0, 4).map((muscle) => (
                              <View
                                key={muscle}
                                className={cn(
                                  'px-3 py-1 rounded-full',
                                  isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                                )}
                              >
                                <Text className={cn('text-xs font-bold capitalize', isDark ? 'text-blue-400' : 'text-blue-600')}>
                                  {muscle}
                                </Text>
                              </View>
                            ))}
                            {day.muscleGroups.length > 4 && (
                              <View
                                className={cn(
                                  'px-3 py-1 rounded-full',
                                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                                )}
                              >
                                <Text className={cn('text-xs font-bold', isDark ? 'text-gray-400' : 'text-gray-600')}>
                                  +{day.muscleGroups.length - 4}
                                </Text>
                              </View>
                            )}
                          </View>
                        )}

                        {day.isRestDay && (
                          <View className="mt-2">
                            <View
                              className={cn(
                                'px-3 py-1 rounded-full self-start',
                                isDark ? 'bg-green-500/20' : 'bg-green-100'
                              )}
                            >
                              <Text className={cn('text-xs font-bold', isDark ? 'text-green-400' : 'text-green-600')}>
                                Rest Day
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </BlurView>
                  </Pressable>
                </Animated.View>
              ))}

              {/* Add Another Day Button */}
              <Animated.View
                entering={FadeInDown.delay(200 + workoutDays.length * 100).duration(400).springify()}
              >
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setCurrentStep(2);
                  }}
                >
                  <BlurView 
                    intensity={60} 
                    tint={isDark ? 'dark' : 'light'} 
                    className="rounded-3xl overflow-hidden"
                  >
                    <View
                      className={cn(
                        'p-6 flex-row items-center justify-center',
                        isDark ? 'bg-white/5' : 'bg-white/40'
                      )}
                      style={{
                        shadowColor: isDark ? '#000' : '#1f2937',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 3,
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        borderColor: isDark ? '#4b5563' : '#d1d5db',
                      }}
                    >
                      <Ionicons 
                        name="add-circle-outline" 
                        size={24} 
                        color={isDark ? '#9ca3af' : '#6b7280'} 
                      />
                      <Text className={cn('ml-2 font-bold', isDark ? 'text-gray-400' : 'text-gray-600')}>
                        Add Another Day
                      </Text>
                    </View>
                  </BlurView>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        )}

        {/* Step 4 - Review Program */}
        {currentStep === 4 && (
          <View className="px-6">
            {/* Header Section */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(400).springify()}
              className="mb-6"
            >
              <Text className={cn('text-3xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
                Review Your Program
              </Text>
              <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                Review your workout program before activating it
              </Text>
            </Animated.View>

            {/* Split Name */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(400).springify()}
              className="mb-6"
            >
              <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                Split Name
              </Text>
              <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-black')}>
                {programName || (selectedSplit === 'push-pull-legs' ? 'Push/Pull/Legs' : 
                  selectedSplit === 'upper-lower' ? 'Upper/Lower' : 
                  selectedSplit === 'full-body' ? 'Full Body' : 'Custom Split')}
              </Text>
            </Animated.View>

            {/* Workout Days */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(400).springify()}
              className="mb-6"
            >
              <Text className={cn('text-sm font-semibold mb-3', isDark ? 'text-gray-400' : 'text-gray-600')}>
                Workout Days ({workoutDays.length})
              </Text>

              <View className="gap-4">
                {workoutDays.map((day, index) => (
                  <BlurView 
                    key={day.id}
                    intensity={60} 
                    tint={isDark ? 'dark' : 'light'} 
                    className="rounded-3xl overflow-hidden"
                  >
                    <View
                      className={cn('p-5', isDark ? 'bg-white/5' : 'bg-white/40')}
                      style={{
                        shadowColor: isDark ? '#000' : '#1f2937',
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.15,
                        shadowRadius: 12,
                        elevation: 5,
                      }}
                    >
                      <Text className={cn('text-xl font-bold mb-3', isDark ? 'text-white' : 'text-black')}>
                        {day.name}
                      </Text>

                      {/* Muscle Groups */}
                      {!day.isRestDay && day.muscleGroups.length > 0 && (
                        <View className="mb-3">
                          <View className="flex-row flex-wrap gap-2">
                            {day.muscleGroups.map((muscle) => (
                              <View
                                key={muscle}
                                className={cn(
                                  'px-3 py-1 rounded-full',
                                  isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                                )}
                              >
                                <Text className={cn('text-xs font-bold capitalize', isDark ? 'text-blue-400' : 'text-blue-600')}>
                                  {muscle}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Exercises */}
                      <View>
                        <Text className={cn('text-xs font-semibold mb-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                          Exercises ({day.exercises.length})
                        </Text>
                        
                        {day.exercises.length > 0 ? (
                          <View className="gap-1">
                            {day.exercises.map((exercise, idx) => (
                              <Text 
                                key={idx}
                                className={cn('text-sm', isDark ? 'text-gray-300' : 'text-gray-700')}
                              >
                                • {exercise}
                              </Text>
                            ))}
                          </View>
                        ) : (
                          <Text className={cn('text-sm italic', isDark ? 'text-gray-500' : 'text-gray-400')}>
                            No exercises added yet
                          </Text>
                        )}
                      </View>

                      {day.isRestDay && (
                        <View
                          className={cn(
                            'px-3 py-1 rounded-full self-start',
                            isDark ? 'bg-green-500/20' : 'bg-green-100'
                          )}
                        >
                          <Text className={cn('text-xs font-bold', isDark ? 'text-green-400' : 'text-green-600')}>
                            Rest Day
                          </Text>
                        </View>
                      )}
                    </View>
                  </BlurView>
                ))}
              </View>
            </Animated.View>

            {/* Create & Activate Button */}
            <Animated.View
              entering={FadeInDown.delay(400).duration(400).springify()}
              className="mb-6"
            >
              <Pressable
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  // TODO: Save program and activate
                  navigation.goBack();
                }}
              >
                <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                  <View
                    className="bg-purple-500 p-5 flex-row items-center justify-center"
                    style={{
                      shadowColor: '#a855f7',
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.5,
                      shadowRadius: 16,
                      elevation: 10,
                    }}
                  >
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">
                      Create & Activate Program
                    </Text>
                  </View>
                </BlurView>
              </Pressable>
            </Animated.View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-6 pb-6">
        {currentStep === 4 ? (
          // Step 4 - Only Back button
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
        ) : (
          // Steps 1-3 - Back and Next buttons
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
            disabled={
              (currentStep === 1 && !selectedSplit) ||
              (currentStep === 2 && !dayName.trim() && !isRestDay) ||
              (currentStep === 3 && !selectedDayForExercises)
            }
            className="flex-1"
          >
            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
              <View 
                className={cn(
                  'py-4 flex-row items-center justify-center',
                  ((currentStep === 1 && selectedSplit) ||
                   (currentStep === 2 && (dayName.trim() || isRestDay)) ||
                   (currentStep === 3 && selectedDayForExercises))
                    ? 'bg-purple-500'
                    : isDark
                    ? 'bg-gray-700'
                    : 'bg-gray-300'
                )}
                style={{
                  shadowColor: 
                    ((currentStep === 1 && selectedSplit) ||
                     (currentStep === 2 && (dayName.trim() || isRestDay)) ||
                     (currentStep === 3 && selectedDayForExercises))
                      ? '#a855f7' 
                      : '#6b7280',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 
                    ((currentStep === 1 && selectedSplit) ||
                     (currentStep === 2 && (dayName.trim() || isRestDay)) ||
                     (currentStep === 3 && selectedDayForExercises))
                      ? 0.4 
                      : 0.2,
                  shadowRadius: 12,
                  elevation: 
                    ((currentStep === 1 && selectedSplit) ||
                     (currentStep === 2 && (dayName.trim() || isRestDay)) ||
                     (currentStep === 3 && selectedDayForExercises))
                      ? 8 
                      : 3,
                }}
              >
                <Text className={cn(
                  'font-bold mr-2', 
                  ((currentStep === 1 && selectedSplit) ||
                   (currentStep === 2 && (dayName.trim() || isRestDay)) ||
                   (currentStep === 3 && selectedDayForExercises))
                    ? 'text-white' 
                    : isDark 
                    ? 'text-gray-500' 
                    : 'text-gray-400'
                )}>
                  Next
                </Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={20} 
                  color={
                    ((currentStep === 1 && selectedSplit) ||
                     (currentStep === 2 && (dayName.trim() || isRestDay)) ||
                     (currentStep === 3 && selectedDayForExercises))
                      ? '#fff' 
                      : isDark 
                      ? '#6b7280' 
                      : '#9ca3af'
                  } 
                />
              </View>
            </BlurView>
          </Pressable>
        </View>
        )}
      </View>
    </SafeAreaView>
  );
}
