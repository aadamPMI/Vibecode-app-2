// ProgramBuilderScreen - Simplified program creation
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { cn } from '../../utils/cn';
import { useTrainingStore } from '../../state/trainingStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SPLIT_TEMPLATES, getSplitTemplateById } from '../../constants/splitTemplates';
import { Program, WorkoutTemplate, ExperienceLevel, ProgramGoal, Equipment } from '../../types/workout';

export default function ProgramBuilderScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  
  const createProgram = useTrainingStore(state => state.createProgram);
  const setActiveProgram = useTrainingStore(state => state.setActiveProgram);

  const [programName, setProgramName] = useState('');
  const [durationWeeks, setDurationWeeks] = useState('8');
  const [selectedSplit, setSelectedSplit] = useState(SPLIT_TEMPLATES[0].id);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('intermediate');
  const [goals, setGoals] = useState<ProgramGoal[]>(['hypertrophy']);

  const handleCreate = () => {
    if (!programName.trim()) {
      Alert.alert('Error', 'Please enter a program name');
      return;
    }

    const split = getSplitTemplateById(selectedSplit);
    if (!split) {
      Alert.alert('Error', 'Invalid split selected');
      return;
    }

    // Create empty workout templates based on split
    const workoutTemplates: WorkoutTemplate[] = split.rotationPattern
      .filter(day => day.toLowerCase() !== 'rest')
      .map((day, index) => ({
        id: `template-${Date.now()}-${index}`,
        name: day,
        exercises: [],
        estimatedDuration: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

    const program: Program = {
      id: `program-${Date.now()}`,
      name: programName,
      version: '1.0',
      experienceLevel,
      goals,
      durationWeeks: parseInt(durationWeeks) || 8,
      split: {
        ...split,
        workoutTemplateIds: workoutTemplates.map(t => t.id),
      },
      workoutTemplates,
      periodization: [],
      schedule: {
        preferredDays: [1, 3, 5], // Mon, Wed, Fri
        autoShiftMissed: true,
      },
      subRegionTargets: [],
      isActive: false,
      isArchived: false,
      createdBy: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createProgram(program);
    setActiveProgram(program.id);
    
    Alert.alert(
      'Success',
      `"${programName}" created and activated! Now add exercises to your workouts.`,
      [{ text: 'OK', onPress: () => navigation.navigate('ProgramManager') }]
    );
  };

  const experienceLevels: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];
  const goalOptions: ProgramGoal[] = ['strength', 'hypertrophy', 'fat-loss', 'mixed'];

  return (
    <View className={cn('flex-1', isDark ? 'bg-gray-900' : 'bg-gray-50')}>
      {/* Header */}
      <View className={cn('px-6 pt-16 pb-6', isDark ? 'bg-gray-800' : 'bg-white')}>
        <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
          Create Program
        </Text>
        <Text className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
          Set up your training program
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Program Name */}
        <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
          Program Name
        </Text>
        <TextInput
          className={cn(
            'px-4 py-3 rounded-xl mb-6',
            isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          )}
          placeholder="e.g., Summer Hypertrophy"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          value={programName}
          onChangeText={setProgramName}
        />

        {/* Duration */}
        <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
          Duration (weeks)
        </Text>
        <TextInput
          className={cn(
            'px-4 py-3 rounded-xl mb-6',
            isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          )}
          placeholder="8"
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          value={durationWeeks}
          onChangeText={setDurationWeeks}
          keyboardType="number-pad"
        />

        {/* Experience Level */}
        <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
          Experience Level
        </Text>
        <View className="flex-row mb-6">
          {experienceLevels.map(level => (
            <TouchableOpacity
              key={level}
              className={cn(
                'flex-1 py-3 rounded-xl mr-2 items-center',
                experienceLevel === level ? 'bg-blue-500' : isDark ? 'bg-gray-800' : 'bg-white'
              )}
              onPress={() => setExperienceLevel(level)}
            >
              <Text className={cn(
                'font-semibold capitalize',
                experienceLevel === level ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'
              )}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Goals */}
        <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
          Primary Goal
        </Text>
        <View className="flex-row flex-wrap mb-6">
          {goalOptions.map(goal => (
            <TouchableOpacity
              key={goal}
              className={cn(
                'px-4 py-2 rounded-full mr-2 mb-2',
                goals.includes(goal) ? 'bg-blue-500' : isDark ? 'bg-gray-800' : 'bg-white'
              )}
              onPress={() => setGoals([goal])}
            >
              <Text className={cn(
                'font-semibold capitalize',
                goals.includes(goal) ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-700'
              )}>
                {goal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Split Selection */}
        <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
          Training Split
        </Text>
        <View className="mb-6">
          {SPLIT_TEMPLATES.map(split => (
            <TouchableOpacity
              key={split.id}
              className={cn(
                'p-4 rounded-xl mb-2',
                selectedSplit === split.id
                  ? 'bg-blue-500'
                  : isDark ? 'bg-gray-800' : 'bg-white'
              )}
              onPress={() => setSelectedSplit(split.id)}
            >
              <Text className={cn(
                'font-bold',
                selectedSplit === split.id ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'
              )}>
                {split.name}
              </Text>
              <Text className={cn(
                'text-sm mt-1',
                selectedSplit === split.id ? 'text-white/80' : isDark ? 'text-gray-400' : 'text-gray-600'
              )}>
                {split.daysPerWeek} days per week
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Create Button */}
        <TouchableOpacity
          className="bg-blue-500 rounded-xl py-4 items-center mb-8"
          onPress={handleCreate}
        >
          <Text className="text-white font-bold text-lg">Create Program</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

