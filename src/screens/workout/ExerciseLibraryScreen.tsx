// ExerciseLibraryScreen - Browse exercise library
import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { cn } from '../../utils/cn';
import { EXERCISE_LIBRARY, searchExercises } from '../../constants/exerciseData';
import { Exercise } from '../../types/workout';

export default function ExerciseLibraryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const filteredExercises = searchQuery
    ? searchExercises(searchQuery)
    : selectedCategory === 'all'
    ? EXERCISE_LIBRARY
    : EXERCISE_LIBRARY.filter(ex => 
        ex.movementCategory === selectedCategory ||
        ex.primaryMuscles.includes(selectedCategory as any)
      );

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'chest', label: 'Chest' },
    { id: 'back', label: 'Back' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'quads', label: 'Legs' },
    { id: 'biceps', label: 'Arms' },
    { id: 'core', label: 'Core' },
  ];

  return (
    <View className={cn('flex-1', isDark ? 'bg-gray-900' : 'bg-gray-50')}>
      {/* Header */}
      <View className={cn('px-6 pt-16 pb-4', isDark ? 'bg-gray-800' : 'bg-white')}>
        <Text className={cn('text-2xl font-bold mb-4', isDark ? 'text-white' : 'text-gray-900')}>
          Exercise Library
        </Text>
        
        {/* Search */}
        <TextInput
          className={cn(
            'px-4 py-3 rounded-xl',
            isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
          )}
          placeholder="Search exercises..."
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 -mx-6 px-6"
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              className={cn(
                'px-4 py-2 rounded-full mr-2',
                selectedCategory === cat.id
                  ? 'bg-blue-500'
                  : isDark ? 'bg-gray-700' : 'bg-gray-200'
              )}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text
                className={cn(
                  'font-semibold',
                  selectedCategory === cat.id
                    ? 'text-white'
                    : isDark ? 'text-gray-300' : 'text-gray-700'
                )}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        <Text className={cn('text-sm mb-3', isDark ? 'text-gray-400' : 'text-gray-600')}>
          {filteredExercises.length} exercises
        </Text>
        
        {filteredExercises.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            className={cn(
              'rounded-xl p-4 mb-3',
              isDark ? 'bg-gray-800' : 'bg-white'
            )}
            onPress={() => setSelectedExercise(exercise)}
          >
            <Text className={cn('font-bold text-lg mb-1', isDark ? 'text-white' : 'text-gray-900')}>
              {exercise.name}
            </Text>
            <View className="flex-row flex-wrap mt-2">
              <View className="bg-blue-500 rounded-full px-2 py-1 mr-2 mb-1">
                <Text className="text-white text-xs">{exercise.movementCategory}</Text>
              </View>
              {exercise.primaryMuscles.map(muscle => (
                <View key={muscle} className={cn(
                  'rounded-full px-2 py-1 mr-2 mb-1',
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                )}>
                  <Text className={cn('text-xs', isDark ? 'text-gray-300' : 'text-gray-700')}>
                    {muscle}
                  </Text>
                </View>
              ))}
            </View>
            {exercise.equipment.length > 0 && (
              <Text className={cn('text-xs mt-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                Equipment: {exercise.equipment.join(', ')}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <TouchableOpacity
          className="absolute inset-0 bg-black/50 items-center justify-center"
          activeOpacity={1}
          onPress={() => setSelectedExercise(null)}
        >
          <View
            className={cn(
              'mx-6 rounded-2xl p-6 max-h-[80%]',
              isDark ? 'bg-gray-800' : 'bg-white'
            )}
            onStartShouldSetResponder={() => true}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className={cn('text-2xl font-bold mb-4', isDark ? 'text-white' : 'text-gray-900')}>
                {selectedExercise.name}
              </Text>
              
              <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
                Movement Category
              </Text>
              <Text className={cn('text-sm mb-4', isDark ? 'text-gray-400' : 'text-gray-600')}>
                {selectedExercise.movementCategory}
              </Text>

              <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
                Primary Muscles
              </Text>
              <Text className={cn('text-sm mb-4', isDark ? 'text-gray-400' : 'text-gray-600')}>
                {selectedExercise.primaryMuscles.join(', ')}
              </Text>

              {selectedExercise.secondaryMuscles.length > 0 && (
                <>
                  <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
                    Secondary Muscles
                  </Text>
                  <Text className={cn('text-sm mb-4', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    {selectedExercise.secondaryMuscles.join(', ')}
                  </Text>
                </>
              )}

              <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
                Equipment
              </Text>
              <Text className={cn('text-sm mb-4', isDark ? 'text-gray-400' : 'text-gray-600')}>
                {selectedExercise.equipment.join(', ')}
              </Text>

              {selectedExercise.formNotes && (
                <>
                  <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
                    Form Notes
                  </Text>
                  <Text className={cn('text-sm mb-4', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    {selectedExercise.formNotes}
                  </Text>
                </>
              )}

              <TouchableOpacity
                className="bg-blue-500 rounded-lg py-3 items-center mt-4"
                onPress={() => setSelectedExercise(null)}
              >
                <Text className="text-white font-semibold">Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

