// WorkoutSummaryScreen - Post-workout celebration and stats
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { cn } from '../../utils/cn';
import { useTrainingStore } from '../../state/trainingStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { aiCoachTips } from '../../services/workoutAI';
import { Session } from '../../types/workout';

export default function WorkoutSummaryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  
  const { sessionId } = route.params as { sessionId: string };
  const sessions = useTrainingStore(state => state.sessions);
  const [coachTip, setCoachTip] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const session = sessions.find(s => s.id === sessionId);

  useEffect(() => {
    if (session && session.status === 'completed') {
      // Get AI coach tip
      aiCoachTips(session)
        .then(tip => {
          setCoachTip(tip.shortTip);
        })
        .catch(() => {
          setCoachTip('Great workout! Keep up the consistency.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [session]);

  if (!session) {
    return (
      <View className={cn('flex-1 items-center justify-center', isDark ? 'bg-gray-900' : 'bg-gray-50')}>
        <Text className={cn('text-lg', isDark ? 'text-white' : 'text-gray-900')}>
          Session not found
        </Text>
      </View>
    );
  }

  const stats = {
    duration: session.duration || 0,
    totalVolume: session.totalVolume || 0,
    totalSets: session.totalSets || 0,
    prCount: session.prEvents?.length || 0,
  };

  return (
    <View className={cn('flex-1', isDark ? 'bg-gray-900' : 'bg-gray-50')}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Celebration Header */}
        <View className={cn('px-6 pt-16 pb-8 items-center', isDark ? 'bg-gray-800' : 'bg-white')}>
          <Text className="text-6xl mb-4">🎉</Text>
          <Text className={cn('text-3xl font-bold mb-2', isDark ? 'text-white' : 'text-gray-900')}>
            Workout Complete!
          </Text>
          <Text className={cn('text-base', isDark ? 'text-gray-400' : 'text-gray-600')}>
            {session.workoutName}
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="px-6 mt-6">
          <View className="flex-row flex-wrap justify-between">
            <View className={cn(
              'rounded-xl p-4 mb-3',
              isDark ? 'bg-gray-800' : 'bg-white',
              'w-[48%]'
            )}>
              <Text className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                {stats.duration}
              </Text>
              <Text className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                Minutes
              </Text>
            </View>

            <View className={cn(
              'rounded-xl p-4 mb-3',
              isDark ? 'bg-gray-800' : 'bg-white',
              'w-[48%]'
            )}>
              <Text className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                {stats.totalSets}
              </Text>
              <Text className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                Total Sets
              </Text>
            </View>

            <View className={cn(
              'rounded-xl p-4 mb-3',
              isDark ? 'bg-gray-800' : 'bg-white',
              'w-[48%]'
            )}>
              <Text className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                {Math.round(stats.totalVolume)}
              </Text>
              <Text className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                Total Volume
              </Text>
            </View>

            <View className={cn(
              'rounded-xl p-4 mb-3',
              isDark ? 'bg-gray-800' : 'bg-white',
              'w-[48%]'
            )}>
              <Text className={cn('text-3xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                {stats.prCount}
              </Text>
              <Text className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                PRs Hit
              </Text>
            </View>
          </View>
        </View>

        {/* PR Events */}
        {session.prEvents && session.prEvents.length > 0 && (
          <View className="px-6 mt-6">
            <Text className={cn('text-lg font-bold mb-3', isDark ? 'text-white' : 'text-gray-900')}>
              Personal Records
            </Text>
            {session.prEvents.map((pr, index) => (
              <View
                key={index}
                className={cn(
                  'rounded-xl p-4 mb-2',
                  isDark ? 'bg-gray-800' : 'bg-white'
                )}
              >
                <Text className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                  {pr.description}
                </Text>
                <Text className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  {pr.exerciseName}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* AI Coach Tip */}
        {!loading && coachTip && (
          <View className="px-6 mt-6">
            <View className={cn(
              'rounded-xl p-4',
              isDark ? 'bg-blue-900/30 border border-blue-500' : 'bg-blue-50 border border-blue-200'
            )}>
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl mr-2">💡</Text>
                <Text className={cn('font-bold', isDark ? 'text-blue-400' : 'text-blue-600')}>
                  Coach Tip
                </Text>
              </View>
              <Text className={cn('text-sm', isDark ? 'text-gray-300' : 'text-gray-700')}>
                {coachTip}
              </Text>
            </View>
          </View>
        )}

        {/* Exercise Breakdown */}
        <View className="px-6 mt-6 mb-8">
          <Text className={cn('text-lg font-bold mb-3', isDark ? 'text-white' : 'text-gray-900')}>
            Exercise Breakdown
          </Text>
          {session.exercises.map((exercise, index) => (
            <View
              key={index}
              className={cn(
                'rounded-xl p-4 mb-2',
                isDark ? 'bg-gray-800' : 'bg-white'
              )}
            >
              <Text className={cn('font-semibold mb-2', isDark ? 'text-white' : 'text-gray-900')}>
                {exercise.exerciseName}
              </Text>
              {exercise.sets
                .filter(s => s.status === 'completed')
                .map((set, setIndex) => (
                  <Text
                    key={setIndex}
                    className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}
                  >
                    Set {set.setNumber}: {set.actualLoad}kg × {set.actualReps}
                    {set.rpe && ` @ RPE ${set.rpe}`}
                  </Text>
                ))}
            </View>
          ))}
        </View>

        {/* Actions */}
        <View className="px-6 mb-8">
          <TouchableOpacity
            className="bg-blue-500 rounded-xl py-4 items-center"
            onPress={() => navigation.navigate('WorkoutHome')}
          >
            <Text className="text-white font-bold text-lg">Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

