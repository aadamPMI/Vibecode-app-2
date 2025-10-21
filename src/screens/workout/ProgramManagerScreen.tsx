// ProgramManagerScreen - View and manage workout programs
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { cn } from '../../utils/cn';
import { useTrainingStore } from '../../state/trainingStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Program } from '../../types/workout';

export default function ProgramManagerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  
  const programs = useTrainingStore(state => state.programs);
  const activeProgram = useTrainingStore(state => state.activeProgram);
  const setActiveProgram = useTrainingStore(state => state.setActiveProgram);
  const deleteProgram = useTrainingStore(state => state.deleteProgram);
  const archiveProgram = useTrainingStore(state => state.archiveProgram);

  const handleActivate = (programId: string) => {
    setActiveProgram(programId);
    Alert.alert('Success', 'Program activated!');
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
          onPress: () => deleteProgram(program.id),
        },
      ]
    );
  };

  const handleArchive = (programId: string) => {
    archiveProgram(programId);
    Alert.alert('Success', 'Program archived');
  };

  const activePrograms = programs.filter(p => !p.isArchived);
  const archivedPrograms = programs.filter(p => p.isArchived);

  return (
    <View className={cn('flex-1', isDark ? 'bg-gray-900' : 'bg-gray-50')}>
      {/* Header */}
      <View className={cn('px-6 pt-16 pb-6', isDark ? 'bg-gray-800' : 'bg-white')}>
        <View className="flex-row justify-between items-center">
          <View>
            <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
              Programs
            </Text>
            <Text className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
              {activePrograms.length} active
            </Text>
          </View>
          <TouchableOpacity
            className="bg-blue-500 rounded-lg px-4 py-2"
            onPress={() => navigation.navigate('ProgramBuilder')}
          >
            <Text className="text-white font-semibold">+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {/* Active Programs */}
        {activePrograms.length === 0 ? (
          <View className={cn(
            'rounded-xl p-8 items-center justify-center',
            isDark ? 'bg-gray-800' : 'bg-white'
          )}>
            <Text className={cn('text-lg font-bold mb-2', isDark ? 'text-white' : 'text-gray-900')}>
              No Programs Yet
            </Text>
            <Text className={cn('text-sm text-center mb-4', isDark ? 'text-gray-400' : 'text-gray-600')}>
              Create your first workout program to get started
            </Text>
            <TouchableOpacity
              className="bg-blue-500 rounded-lg px-6 py-3"
              onPress={() => navigation.navigate('ProgramBuilder')}
            >
              <Text className="text-white font-semibold">Create Program</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {activePrograms.map((program) => (
              <View
                key={program.id}
                className={cn(
                  'rounded-xl p-4 mb-4',
                  isDark ? 'bg-gray-800' : 'bg-white',
                  program.isActive && 'border-2 border-blue-500'
                )}
              >
                {program.isActive && (
                  <View className="bg-blue-500 rounded-full px-3 py-1 self-start mb-2">
                    <Text className="text-white text-xs font-bold">ACTIVE</Text>
                  </View>
                )}
                
                <Text className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                  {program.name}
                </Text>
                
                <Text className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  {program.durationWeeks} weeks • {program.split.daysPerWeek} days/week
                </Text>
                
                <Text className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  {program.split.type.replace(/-/g, ' ')} • {program.experienceLevel}
                </Text>

                <View className="flex-row mt-4 space-x-2">
                  {!program.isActive && (
                    <TouchableOpacity
                      className="bg-blue-500 rounded-lg px-4 py-2 mr-2"
                      onPress={() => handleActivate(program.id)}
                    >
                      <Text className="text-white font-semibold">Activate</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    className={cn(
                      'rounded-lg px-4 py-2 mr-2',
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    )}
                    onPress={() => {
                      // Navigate to program editor
                      Alert.alert('Edit', 'Program editor coming soon!');
                    }}
                  >
                    <Text className={cn(isDark ? 'text-white' : 'text-gray-900')}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className={cn(
                      'rounded-lg px-4 py-2 mr-2',
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    )}
                    onPress={() => handleArchive(program.id)}
                  >
                    <Text className={cn(isDark ? 'text-white' : 'text-gray-900')}>
                      Archive
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="bg-red-500 rounded-lg px-4 py-2"
                    onPress={() => handleDelete(program)}
                  >
                    <Text className="text-white font-semibold">Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Archived Programs */}
        {archivedPrograms.length > 0 && (
          <View className="mt-6 mb-8">
            <Text className={cn('text-lg font-bold mb-3', isDark ? 'text-white' : 'text-gray-900')}>
              Archived
            </Text>
            {archivedPrograms.map((program) => (
              <View
                key={program.id}
                className={cn(
                  'rounded-xl p-4 mb-3',
                  isDark ? 'bg-gray-800' : 'bg-gray-200'
                )}
              >
                <Text className={cn('font-semibold', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  {program.name}
                </Text>
                <Text className={cn('text-xs mt-1', isDark ? 'text-gray-500' : 'text-gray-500')}>
                  {program.durationWeeks} weeks • {program.split.type}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

