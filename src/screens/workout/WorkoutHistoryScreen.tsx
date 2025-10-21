// WorkoutHistoryScreen - View past workout sessions
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useColorScheme } from '../../hooks/useColorScheme';
import { cn } from '../../utils/cn';
import { useTrainingStore } from '../../state/trainingStore';

export default function WorkoutHistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const sessions = useTrainingStore(state => state.sessions);
  const completedSessions = sessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View className={cn('flex-1', isDark ? 'bg-gray-900' : 'bg-gray-50')}>
      {/* Header */}
      <View className={cn('px-6 pt-16 pb-6', isDark ? 'bg-gray-800' : 'bg-white')}>
        <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
          Workout History
        </Text>
        <Text className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
          {completedSessions.length} total workouts
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        {completedSessions.length === 0 ? (
          <View className={cn(
            'rounded-xl p-8 items-center justify-center',
            isDark ? 'bg-gray-800' : 'bg-white'
          )}>
            <Text className="text-4xl mb-3">📝</Text>
            <Text className={cn('text-lg font-bold mb-2', isDark ? 'text-white' : 'text-gray-900')}>
              No Workouts Yet
            </Text>
            <Text className={cn('text-sm text-center', isDark ? 'text-gray-400' : 'text-gray-600')}>
              Complete your first workout to see it here
            </Text>
          </View>
        ) : (
          <>
            {completedSessions.map((session) => (
              <View
                key={session.id}
                className={cn(
                  'rounded-xl p-4 mb-3',
                  isDark ? 'bg-gray-800' : 'bg-white'
                )}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-gray-900')}>
                      {session.workoutName}
                    </Text>
                    <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      {formatDate(session.completedAt!)}
                    </Text>
                  </View>
                  {session.prEvents && session.prEvents.length > 0 && (
                    <View className="bg-yellow-500 rounded-full px-2 py-1">
                      <Text className="text-white text-xs font-bold">{session.prEvents.length} PR</Text>
                    </View>
                  )}
                </View>

                <View className="flex-row justify-between mt-3">
                  <View>
                    <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      Duration
                    </Text>
                    <Text className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                      {session.duration} min
                    </Text>
                  </View>
                  <View>
                    <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      Sets
                    </Text>
                    <Text className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                      {session.totalSets}
                    </Text>
                  </View>
                  <View>
                    <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      Volume
                    </Text>
                    <Text className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                      {Math.round(session.totalVolume)}
                    </Text>
                  </View>
                  <View>
                    <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      Exercises
                    </Text>
                    <Text className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                      {session.exercises.length}
                    </Text>
                  </View>
                </View>

                {session.aiCoachTip && (
                  <View className={cn(
                    'mt-3 p-2 rounded-lg',
                    isDark ? 'bg-blue-900/20' : 'bg-blue-50'
                  )}>
                    <Text className={cn('text-xs', isDark ? 'text-blue-400' : 'text-blue-600')}>
                      💡 {session.aiCoachTip}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

