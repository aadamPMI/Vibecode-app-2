// Program Manager Screen - Enhanced with Split Selection
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { cn } from '../../utils/cn';
import { useTrainingStore } from '../../state/trainingStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { EmptyState } from '../../components/ui/LoadingStates';
import { PRESET_SPLITS, PresetSplit } from '../../constants/workoutSplits';
import { Program, ExperienceLevel } from '../../types/workout';
import { PremiumBackground } from '../../components/PremiumBackground';
import { useSettingsStore } from '../../state/settingsStore';
import { staggerDelays } from '../../utils/animations';

export default function ProgramManagerScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === 'system' ? (systemColorScheme || 'light') : theme;
  const isDark = resolvedTheme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  
  const programs = useTrainingStore((state) => state.programs);
  const activeProgram = useTrainingStore((state) => state.activeProgram);
  const setActiveProgram = useTrainingStore((state) => state.setActiveProgram);
  const deleteProgram = useTrainingStore((state) => state.deleteProgram);

  const [isSplitModalVisible, setIsSplitModalVisible] = useState(false);
  const [isCustomNameModalVisible, setIsCustomNameModalVisible] = useState(false);
  const [customProgramName, setCustomProgramName] = useState('');
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<ExperienceLevel>('intermediate');

  const handleCreateProgram = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSplitModalVisible(true);
  };

  const handleSelectPresetSplit = (split: PresetSplit) => {
    setIsSplitModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Navigate to Split Builder with preset
    navigation.navigate('SplitBuilder', {
      preset: split,
      programName: split.name,
    });
  };

  const handleCustomSplit = () => {
    setIsSplitModalVisible(false);
    setIsCustomNameModalVisible(true);
  };

  const handleCreateCustomProgram = () => {
    if (!customProgramName.trim()) {
      Alert.alert('Error', 'Please enter a program name');
      return;
    }

    setIsCustomNameModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Navigate to Split Builder with custom name
    navigation.navigate('SplitBuilder', {
      preset: null,
      programName: customProgramName,
    });

    setCustomProgramName('');
  };

  const handleActivate = (programId: string) => {
    setActiveProgram(programId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDelete = (program: Program) => {
    Alert.alert(
      'Delete Program',
      `Are you sure you want to delete "${program.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteProgram(program.id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  };

  const activePrograms = programs.filter((p) => !p.isArchived);
  const delays = staggerDelays(activePrograms.length);

  const filteredSplits = PRESET_SPLITS.filter((split) =>
    split.experienceLevel.includes(selectedExperienceLevel)
  );

  return (
    <SafeAreaView className={cn('flex-1', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
      <PremiumBackground theme={theme} variant="workout" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4 flex-row justify-between items-center">
          <View>
            <Pressable
              onPress={() => navigation.goBack()}
              className="mb-2"
            >
              <Ionicons name="arrow-back" size={28} color={isDark ? '#fff' : '#000'} />
            </Pressable>
            <Text className={cn('text-4xl font-bold', isDark ? 'text-white' : 'text-black')}>
              My Programs
            </Text>
            <Text className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
              {activePrograms.length} program{activePrograms.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Create New Program Button */}
        <View className="px-6 mb-6">
          <GlassButton
            onPress={handleCreateProgram}
            variant="primary"
            size="lg"
            fullWidth
            icon={<Ionicons name="add-circle-outline" size={24} color="white" />}
            haptic="medium"
          >
            Create New Program
          </GlassButton>
        </View>

        {/* Programs List */}
        {activePrograms.length === 0 ? (
          <View className="px-6">
            <EmptyState
              icon="fitness-outline"
              title="No Programs Yet"
              message="Create your first workout program to get started on your fitness journey"
              actionLabel="Create Program"
              onAction={handleCreateProgram}
              isDark={isDark}
            />
          </View>
        ) : (
          <View className="px-6 mb-6">
            {activePrograms.map((program, index) => (
              <Animated.View
                key={program.id}
                entering={FadeInDown.delay(delays[index]).duration(300).springify()}
              >
                <GlassCard
                  intensity={60}
                  isDark={isDark}
                  elevation="md"
                  borderGlow={program.isActive}
                  glowColor="#3b82f6"
                  className="p-5 mb-4"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className={cn('text-xl font-bold mb-1', isDark ? 'text-white' : 'text-black')}>
                        {program.name}
                      </Text>
                      {program.description && (
                        <Text className={cn('text-sm mb-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                          {program.description}
                        </Text>
                      )}
                    </View>
                    {program.isActive && (
                      <View className="bg-blue-500 px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-bold">ACTIVE</Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row flex-wrap mb-4">
                    <View className="mr-4 mb-2">
                      <Text className={cn('text-xs', isDark ? 'text-gray-500' : 'text-gray-500')}>
                        Days/Week
                      </Text>
                      <Text className={cn('text-base font-semibold', isDark ? 'text-blue-400' : 'text-blue-600')}>
                        {program.split.daysPerWeek}
                      </Text>
                    </View>
                    <View className="mr-4 mb-2">
                      <Text className={cn('text-xs', isDark ? 'text-gray-500' : 'text-gray-500')}>
                        Workouts
                      </Text>
                      <Text className={cn('text-base font-semibold', isDark ? 'text-green-400' : 'text-green-600')}>
                        {program.workoutTemplates.length}
                      </Text>
                    </View>
                    <View className="mb-2">
                      <Text className={cn('text-xs', isDark ? 'text-gray-500' : 'text-gray-500')}>
                        Duration
                      </Text>
                      <Text className={cn('text-base font-semibold', isDark ? 'text-purple-400' : 'text-purple-600')}>
                        {program.durationWeeks}w
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2">
                    {!program.isActive && (
                      <Pressable
                        onPress={() => handleActivate(program.id)}
                        className="flex-1 bg-blue-500 py-3 rounded-2xl"
                      >
                        <Text className="text-white font-bold text-center">Activate</Text>
                      </Pressable>
                    )}
                    <Pressable
                      onPress={() => navigation.navigate('ProgramDetail', { programId: program.id })}
                      className={cn(
                        'flex-1 py-3 rounded-2xl',
                        isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200'
                      )}
                    >
                      <Text className={cn('font-bold text-center', isDark ? 'text-white' : 'text-gray-900')}>
                        View
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(program)}
                      className="py-3 px-4 rounded-2xl bg-red-500/20"
                    >
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </Pressable>
                  </View>
                </GlassCard>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Split Selection Modal */}
      <Modal
        visible={isSplitModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsSplitModalVisible(false)}
      >
        <SafeAreaView className={cn('flex-1', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
          <PremiumBackground theme={theme} variant="workout" />
          
          <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
            <Text className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-black')}>
              Choose Split
            </Text>
            <Pressable
              onPress={() => setIsSplitModalVisible(false)}
              className={cn('w-10 h-10 rounded-full items-center justify-center', isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200')}
            >
              <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
            </Pressable>
          </View>

          {/* Experience Level Filter */}
          <View className="px-6 py-4">
            <Text className={cn('text-sm font-semibold mb-3', isDark ? 'text-gray-300' : 'text-gray-700')}>
              Experience Level
            </Text>
            <View className="flex-row gap-2">
              {(['beginner', 'intermediate', 'advanced'] as ExperienceLevel[]).map((level) => (
                <Pressable
                  key={level}
                  onPress={() => {
                    setSelectedExperienceLevel(level);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={cn(
                    'px-4 py-2 rounded-full',
                    selectedExperienceLevel === level
                      ? 'bg-blue-500'
                      : isDark
                      ? 'bg-[#1a1a1a]'
                      : 'bg-gray-200'
                  )}
                >
                  <Text
                    className={cn(
                      'text-sm font-bold capitalize',
                      selectedExperienceLevel === level
                        ? 'text-white'
                        : isDark
                        ? 'text-gray-400'
                        : 'text-gray-600'
                    )}
                  >
                    {level}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
            {/* Custom Split Option */}
            <GlassCard intensity={60} isDark={isDark} className="p-5 mb-4">
              <View className="flex-row items-center mb-3">
                <View className={cn('w-12 h-12 rounded-2xl items-center justify-center mr-3', isDark ? 'bg-purple-500/20' : 'bg-purple-100')}>
                  <Ionicons name="create-outline" size={24} color="#a855f7" />
                </View>
                <View className="flex-1">
                  <Text className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-black')}>
                    Custom Split
                  </Text>
                  <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    Build from scratch
                  </Text>
                </View>
              </View>
              <GlassButton onPress={handleCustomSplit} variant="secondary" fullWidth>
                Create Custom
              </GlassButton>
            </GlassCard>

            {/* Preset Splits */}
            {filteredSplits.map((split) => (
              <GlassCard key={split.id} intensity={60} isDark={isDark} className="p-5 mb-4">
                <View className="mb-3">
                  <Text className={cn('text-xl font-bold mb-1', isDark ? 'text-white' : 'text-black')}>
                    {split.name}
                  </Text>
                  <Text className={cn('text-sm mb-3', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    {split.description}
                  </Text>
                  
                  <View className="flex-row flex-wrap mb-3">
                    <View className="bg-blue-500/20 px-3 py-1 rounded-full mr-2 mb-2">
                      <Text className="text-blue-500 text-xs font-bold">
                        {split.daysPerWeek} days/week
                      </Text>
                    </View>
                    <View className={cn('px-3 py-1 rounded-full mb-2', isDark ? 'bg-gray-700' : 'bg-gray-200')}>
                      <Text className={cn('text-xs font-bold capitalize', isDark ? 'text-gray-300' : 'text-gray-700')}>
                        {split.experienceLevel.join(', ')}
                      </Text>
                    </View>
                  </View>

                  {/* Pros */}
                  <View className="mb-2">
                    <Text className={cn('text-xs font-semibold mb-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      Pros:
                    </Text>
                    {split.pros.slice(0, 2).map((pro, i) => (
                      <View key={i} className="flex-row items-start mb-1">
                        <Ionicons name="checkmark-circle" size={14} color="#22c55e" style={{ marginTop: 2, marginRight: 4 }} />
                        <Text className={cn('text-xs flex-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                          {pro}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <GlassButton
                  onPress={() => handleSelectPresetSplit(split)}
                  variant="primary"
                  fullWidth
                >
                  Use This Split
                </GlassButton>
              </GlassCard>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Custom Name Modal */}
      <Modal
        visible={isCustomNameModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsCustomNameModalVisible(false)}
      >
        <SafeAreaView className={cn('flex-1', isDark ? 'bg-[#1a1a1a]' : 'bg-white')}>
          <View className="px-6 pt-4 pb-2">
            <Text className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
              Name Your Program
            </Text>
            <Text className={cn('text-sm mb-6', isDark ? 'text-gray-400' : 'text-gray-600')}>
              Give your custom workout program a name
            </Text>

            <TextInput
              value={customProgramName}
              onChangeText={setCustomProgramName}
              placeholder="e.g., Summer Shred, Strength Builder"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              className={cn(
                'rounded-2xl p-4 text-lg mb-6',
                isDark ? 'bg-[#0a0a0a] text-white' : 'bg-gray-100 text-gray-900'
              )}
              autoFocus
            />

            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setIsCustomNameModalVisible(false)}
                className={cn('flex-1 py-4 rounded-2xl', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-200')}
              >
                <Text className={cn('text-center font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleCreateCustomProgram}
                className="flex-1 bg-blue-500 py-4 rounded-2xl"
              >
                <Text className="text-white text-center font-bold">Continue</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
