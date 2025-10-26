// Exercise Stats Screen - View detailed statistics and strength graphs
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { cn } from '../../utils/cn';
import { useSettingsStore } from '../../state/settingsStore';
import { useTrainingStore } from '../../state/trainingStore';
import type { SetLog } from '../../types/workout';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { EmptyState } from '../../components/ui/LoadingStates';
import { PremiumBackground } from '../../components/PremiumBackground';
import { EXERCISE_DATABASE, searchExercises } from '../../utils/exerciseDatabase';
import { hapticLight, hapticMedium } from '../../utils/haptics';
import { staggerDelays } from '../../utils/animations';

const { width } = Dimensions.get('window');

export default function ExerciseStatsScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === 'system' ? (systemColorScheme || 'light') : theme;
  const isDark = resolvedTheme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const getExerciseHistory = useTrainingStore((s) => s.getExerciseHistory);
  const sessions = useTrainingStore((s) => s.sessions);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(true);

  const filteredExercises = searchQuery ? searchExercises(searchQuery) : EXERCISE_DATABASE.slice(0, 20);

  const handleSelectExercise = (exerciseId: string) => {
    setSelectedExercise(exerciseId);
    setShowSearch(false);
    hapticMedium();
  };

  const handleBackToSearch = () => {
    setSelectedExercise(null);
    setShowSearch(true);
    hapticLight();
  };

  if (!showSearch && selectedExercise) {
    return (
      <ExerciseDetailView
        exerciseId={selectedExercise}
        onBack={handleBackToSearch}
        isDark={isDark}
        theme={theme}
      />
    );
  }

  const delays = staggerDelays(Math.min(filteredExercises.length, 15));

  return (
    <SafeAreaView className={cn('flex-1', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
      <PremiumBackground theme={theme as 'light' | 'dark' | 'system'} variant="workout" />

      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Pressable onPress={() => navigation.goBack()} className="mb-2">
          <Ionicons name="arrow-back" size={28} color={isDark ? '#fff' : '#000'} />
        </Pressable>
        <Text className={cn('text-4xl font-bold', isDark ? 'text-white' : 'text-black')}>
          Exercise Stats
        </Text>
      </View>

      {/* Search */}
      <View className="px-6 mb-4">
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search exercises..."
          placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
          className={cn(
            'rounded-2xl p-4 text-base',
            isDark ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'
          )}
        />
      </View>

      {/* Exercise List */}
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {filteredExercises.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No Exercises"
            message="Try a different search term"
            isDark={isDark}
          />
        ) : (
          filteredExercises.map((exercise, index) => {
            const history = getExerciseHistory(exercise.id, 1);
            const hasData = history.length > 0;

            return (
              <Animated.View
                key={exercise.id}
                entering={FadeInDown.delay(delays[index % 15]).duration(300).springify()}
              >
                <Pressable onPress={() => handleSelectExercise(exercise.id)}>
                  <GlassCard intensity={60} isDark={isDark} className="p-4 mb-3">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1">
                        <Text className={cn('text-lg font-bold mb-1', isDark ? 'text-white' : 'text-black')}>
                          {exercise.name}
                        </Text>
                        {hasData ? (
                          <Text className={cn('text-sm', isDark ? 'text-green-400' : 'text-green-600')}>
                            Has workout data
                          </Text>
                        ) : (
                          <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                            No data yet
                          </Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                    </View>
                  </GlassCard>
                </Pressable>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Exercise Detail View
interface ExerciseDetailViewProps {
  exerciseId: string;
  onBack: () => void;
  isDark: boolean;
  theme: string;
}

const ExerciseDetailView: React.FC<ExerciseDetailViewProps> = ({ exerciseId, onBack, isDark, theme }) => {
  const getExerciseHistory = useTrainingStore((s) => s.getExerciseHistory);
  const sessions = useTrainingStore((s) => s.sessions);

  const exercise = EXERCISE_DATABASE.find((e) => e.id === exerciseId);
  const history = getExerciseHistory(exerciseId, 20);

  if (!exercise) {
    return null;
  }

  // Calculate PRs
  const allSets = history.flatMap((h) => h.exerciseData.sets);
  const maxWeight = allSets.length > 0 ? Math.max(...allSets.map((s: SetLog) => s.actualLoad)) : 0;
  const maxReps = allSets.length > 0 ? Math.max(...allSets.map((s: SetLog) => s.actualReps)) : 0;
  const maxVolume = allSets.length > 0 ? Math.max(...allSets.map((s: SetLog) => s.actualLoad * s.actualReps)) : 0;

  // Calculate estimated 1RM (Epley formula)
  const calculate1RM = (weight: number, reps: number): number => {
    if (reps === 1) return weight;
    return weight * (1 + reps / 30);
  };

  const max1RM = allSets.length > 0 ? Math.max(...allSets.map((s: SetLog) => calculate1RM(s.actualLoad, s.actualReps))) : 0;

  // Prepare chart data
  const chartData = history.slice(-10).reverse().map((h) => {
    const totalVolume = h.exerciseData.sets.reduce((sum: number, s: SetLog) => sum + s.actualLoad * s.actualReps, 0);
    return totalVolume;
  });

  const chartLabels = history.slice(-10).reverse().map((h, index) => {
    if (index % 2 === 0 || history.length <= 5) {
      const date = new Date(h.session.completedAt!);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
    return '';
  });

  const hasData = history.length > 0;

  return (
    <SafeAreaView className={cn('flex-1', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
      <PremiumBackground theme={theme as 'light' | 'dark' | 'system'} variant="workout" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Pressable onPress={onBack} className="mb-2">
            <Ionicons name="arrow-back" size={28} color={isDark ? '#fff' : '#000'} />
          </Pressable>
          <Text className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-black')}>
            {exercise.name}
          </Text>
          <View className="flex-row flex-wrap gap-2 mt-2">
            {exercise.primaryMuscles.map((muscle) => (
              <View key={muscle} className="bg-blue-500/20 px-3 py-1 rounded-full">
                <Text className="text-blue-500 text-xs font-bold capitalize">{muscle}</Text>
              </View>
            ))}
          </View>
        </View>

        {!hasData ? (
          <View className="px-6">
            <EmptyState
              icon="bar-chart-outline"
              title="No Data Yet"
              message="Complete a workout with this exercise to see stats"
              isDark={isDark}
            />
          </View>
        ) : (
          <>
            {/* PRs */}
            <View className="px-6 mb-6">
              <Text className={cn('text-2xl font-bold mb-4', isDark ? 'text-white' : 'text-black')}>
                Personal Records
              </Text>
              <View className="flex-row flex-wrap gap-3">
                <Animated.View entering={FadeInDown.delay(0).duration(400)} className="flex-1 min-w-[45%]">
                  <GlassCard intensity={80} isDark={isDark} className="p-4">
                    <View className="items-center">
                      <View className="bg-yellow-500/20 w-12 h-12 rounded-full items-center justify-center mb-2">
                        <Ionicons name="trophy" size={24} color="#eab308" />
                      </View>
                      <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-black')}>
                        {maxWeight}kg
                      </Text>
                      <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                        Max Weight
                      </Text>
                    </View>
                  </GlassCard>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(100).duration(400)} className="flex-1 min-w-[45%]">
                  <GlassCard intensity={80} isDark={isDark} className="p-4">
                    <View className="items-center">
                      <View className="bg-yellow-500/20 w-12 h-12 rounded-full items-center justify-center mb-2">
                        <Ionicons name="repeat" size={24} color="#eab308" />
                      </View>
                      <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-black')}>
                        {maxReps}
                      </Text>
                      <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                        Max Reps
                      </Text>
                    </View>
                  </GlassCard>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).duration(400)} className="flex-1 min-w-[45%]">
                  <GlassCard intensity={80} isDark={isDark} className="p-4">
                    <View className="items-center">
                      <View className="bg-yellow-500/20 w-12 h-12 rounded-full items-center justify-center mb-2">
                        <Ionicons name="trending-up" size={24} color="#eab308" />
                      </View>
                      <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-black')}>
                        {Math.round(maxVolume)}
                      </Text>
                      <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                        Max Volume
                      </Text>
                    </View>
                  </GlassCard>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).duration(400)} className="flex-1 min-w-[45%]">
                  <GlassCard intensity={80} isDark={isDark} className="p-4">
                    <View className="items-center">
                      <View className="bg-yellow-500/20 w-12 h-12 rounded-full items-center justify-center mb-2">
                        <Ionicons name="barbell" size={24} color="#eab308" />
                      </View>
                      <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-black')}>
                        {Math.round(max1RM)}kg
                      </Text>
                      <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                        Est. 1RM
                      </Text>
                    </View>
                  </GlassCard>
                </Animated.View>
              </View>
            </View>

            {/* Strength Graph */}
            {chartData.length > 1 && (
              <Animated.View entering={FadeInDown.delay(400).duration(500)} className="px-6 mb-6">
                <Text className={cn('text-2xl font-bold mb-4', isDark ? 'text-white' : 'text-black')}>
                  Strength Progress
                </Text>
                <GlassCard intensity={60} isDark={isDark} className="p-4">
                  <SimpleLineChart data={chartData} labels={chartLabels} isDark={isDark} />
                  <Text className={cn('text-sm text-center mt-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    Total Volume (kg) over Time
                  </Text>
                </GlassCard>
              </Animated.View>
            )}

            {/* Recent Workouts */}
            <View className="px-6 mb-6">
              <Text className={cn('text-2xl font-bold mb-4', isDark ? 'text-white' : 'text-black')}>
                Recent Workouts
              </Text>
              {history.slice(0, 10).map((workout, index) => {
                const date = new Date(workout.session.completedAt!);
                const totalVolume = workout.exerciseData.sets.reduce((sum: number, s: SetLog) => sum + s.actualLoad * s.actualReps, 0);

                return (
                  <Animated.View
                    key={workout.session.id}
                    entering={FadeInDown.delay(index * 50).duration(300)}
                  >
                    <GlassCard intensity={60} isDark={isDark} className="p-4 mb-3">
                      <View className="flex-row justify-between items-start mb-2">
                        <Text className={cn('text-base font-bold', isDark ? 'text-white' : 'text-black')}>
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Text>
                        <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                          {Math.round(totalVolume)}kg total
                        </Text>
                      </View>
                      <View className="flex-row flex-wrap gap-2">
                        {workout.exerciseData.sets.map((set: SetLog, setIndex: number) => (
                          <View
                            key={setIndex}
                            className={cn('px-3 py-1 rounded', isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100')}
                          >
                            <Text className={cn('text-sm', isDark ? 'text-white' : 'text-gray-900')}>
                              {set.actualLoad}kg × {set.actualReps}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </GlassCard>
                  </Animated.View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Simple Line Chart Component
interface SimpleLineChartProps {
  data: number[];
  labels: string[];
  isDark: boolean;
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ data, labels, isDark }) => {
  const chartWidth = width - 80;
  const chartHeight = 220;
  const padding = 20;
  const graphWidth = chartWidth - padding * 2;
  const graphHeight = chartHeight - padding * 2;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const valueRange = maxValue - minValue || 1;

  // Calculate points
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * graphWidth;
    const y = padding + graphHeight - ((value - minValue) / valueRange) * graphHeight;
    return { x, y, value };
  });

  // Create path
  const pathData = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `L ${point.x} ${point.y}`;
  }).join(' ');

  return (
    <View style={{ width: chartWidth, height: chartHeight }}>
      {/* Y-axis labels */}
      <View style={{ position: 'absolute', left: 0, top: padding }}>
        <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
          {Math.round(maxValue)}
        </Text>
      </View>
      <View style={{ position: 'absolute', left: 0, bottom: padding }}>
        <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
          {Math.round(minValue)}
        </Text>
      </View>

      {/* Chart area */}
      <View className={cn('rounded-2xl', isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100')} 
        style={{ width: chartWidth, height: chartHeight }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction, index) => {
          const y = padding + graphHeight * (1 - fraction);
          return (
            <View
              key={index}
              style={{
                position: 'absolute',
                left: padding,
                top: y,
                width: graphWidth,
                height: 1,
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              }}
            />
          );
        })}

        {/* Data points and line */}
        {points.map((point, index) => (
          <View key={index}>
            {/* Line segment */}
            {index > 0 && (
              <View
                style={{
                  position: 'absolute',
                  left: points[index - 1].x,
                  top: points[index - 1].y,
                  width: Math.hypot(
                    point.x - points[index - 1].x,
                    point.y - points[index - 1].y
                  ),
                  height: 2,
                  backgroundColor: '#3b82f6',
                  transform: [
                    {
                      rotate: `${Math.atan2(
                        point.y - points[index - 1].y,
                        point.x - points[index - 1].x
                      )}rad`,
                    },
                  ],
                  transformOrigin: '0 0',
                }}
              />
            )}
            {/* Data point */}
            <View
              style={{
                position: 'absolute',
                left: point.x - 5,
                top: point.y - 5,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: '#3b82f6',
                borderWidth: 2,
                borderColor: isDark ? '#0a0a0a' : '#fff',
              }}
            />
          </View>
        ))}

        {/* X-axis labels */}
        {labels.map((label, index) => {
          if (!label) return null;
          const x = padding + (index / (data.length - 1)) * graphWidth;
          return (
            <Text
              key={index}
              className={cn('text-xs absolute', isDark ? 'text-gray-400' : 'text-gray-600')}
              style={{
                left: x - 20,
                bottom: 2,
                width: 40,
                textAlign: 'center',
              }}
            >
              {label}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

