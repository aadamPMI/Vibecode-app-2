import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, useColorScheme } from 'react-native';
import { useAppState } from '@react-native-community/hooks';
import { useLeaderboard } from '../hooks/useCommunityQueries';
import { VirtualizedLeaderboard } from './VirtualizedCommunityLists';
import { useSettingsStore } from '../state/settingsStore';
import { cn } from '../utils/cn';
import { Ionicons } from '@expo/vector-icons';

interface LeaderboardModalProps {
  visible: boolean;
  onClose: () => void;
  communityId: string;
  communityName: string;
}

export function LeaderboardModal({
  visible,
  onClose,
  communityId,
  communityName,
}: LeaderboardModalProps) {
  const theme = useSettingsStore((s: any) => s.theme);
  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === 'system' ? (systemColorScheme || 'light') : theme;
  const isDark = resolvedTheme === 'dark';

  const [selectedMetric, setSelectedMetric] = useState<'workouts' | 'volume' | 'prs' | 'streak'>('workouts');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'alltime'>('week');
  const [showMetricDropdown, setShowMetricDropdown] = useState(false);
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);

  // App state for refetch on visibility
  const currentAppState = useAppState();
  const [wasInBackground, setWasInBackground] = useState(false);

  // Use the leaderboard query with polling when modal is open
  const { data: leaderboardData, refetch, isLoading } = useLeaderboard(
    communityId,
    selectedMetric,
    selectedTimeframe,
    {
      // Poll every 30 seconds while modal is visible
      refetchInterval: visible ? 30 * 1000 : undefined,
      enabled: visible,
    }
  );

  // Refetch when modal becomes visible
  useEffect(() => {
    if (visible) {
      refetch();
    }
  }, [visible, refetch]);

  // Refetch when metric or timeframe changes
  useEffect(() => {
    if (visible) {
      refetch();
    }
  }, [selectedMetric, selectedTimeframe, visible, refetch]);

  // Refetch when app comes back to foreground
  useEffect(() => {
    if (currentAppState === 'background' || currentAppState === 'inactive') {
      setWasInBackground(true);
    } else if (currentAppState === 'active' && wasInBackground && visible) {
      setWasInBackground(false);
      refetch();
    }
  }, [currentAppState, wasInBackground, visible, refetch]);

  const metricOptions: { value: typeof selectedMetric; label: string }[] = [
    { value: 'workouts', label: 'Workouts' },
    { value: 'volume', label: 'Volume (kg)' },
    { value: 'prs', label: 'Personal Records' },
    { value: 'streak', label: 'Streak' },
  ];

  const timeframeOptions: { value: typeof selectedTimeframe; label: string }[] = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'alltime', label: 'All Time' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View className={cn('flex-1', isDark ? 'bg-black' : 'bg-gray-50')}>
        {/* Header */}
        <View
          className={cn(
            'px-4 pt-12 pb-4 border-b',
            isDark ? 'bg-[#0a0a0a] border-gray-800' : 'bg-white border-gray-200'
          )}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1">
              <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                Leaderboard
              </Text>
              <Text className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                {communityName}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className={cn(
                'w-10 h-10 rounded-full items-center justify-center',
                isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100'
              )}
            >
              <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
            </Pressable>
          </View>

          {/* Filter Row */}
          <View className="flex-row gap-2">
            {/* Metric Dropdown */}
            <View className="flex-1 relative">
              <Pressable
                onPress={() => {
                  setShowMetricDropdown(!showMetricDropdown);
                  setShowTimeframeDropdown(false);
                }}
                className={cn(
                  'px-4 py-2 rounded-lg flex-row items-center justify-between',
                  isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100'
                )}
              >
                <Text className={cn('font-medium', isDark ? 'text-white' : 'text-gray-900')}>
                  {metricOptions.find((o) => o.value === selectedMetric)?.label}
                </Text>
                <Ionicons
                  name={showMetricDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={isDark ? '#fff' : '#000'}
                />
              </Pressable>

              {showMetricDropdown && (
                <View
                  className={cn(
                    'absolute top-full left-0 right-0 mt-1 rounded-lg z-50',
                    isDark ? 'bg-[#1a1a1a]' : 'bg-white'
                  )}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  {metricOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        setSelectedMetric(option.value);
                        setShowMetricDropdown(false);
                      }}
                      className={cn(
                        'px-4 py-3 border-b',
                        isDark ? 'border-gray-800' : 'border-gray-200'
                      )}
                    >
                      <Text
                        className={cn(
                          'font-medium',
                          selectedMetric === option.value
                            ? 'text-blue-500'
                            : isDark
                            ? 'text-white'
                            : 'text-gray-900'
                        )}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Timeframe Dropdown */}
            <View className="flex-1 relative">
              <Pressable
                onPress={() => {
                  setShowTimeframeDropdown(!showTimeframeDropdown);
                  setShowMetricDropdown(false);
                }}
                className={cn(
                  'px-4 py-2 rounded-lg flex-row items-center justify-between',
                  isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100'
                )}
              >
                <Text className={cn('font-medium', isDark ? 'text-white' : 'text-gray-900')}>
                  {timeframeOptions.find((o) => o.value === selectedTimeframe)?.label}
                </Text>
                <Ionicons
                  name={showTimeframeDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={isDark ? '#fff' : '#000'}
                />
              </Pressable>

              {showTimeframeDropdown && (
                <View
                  className={cn(
                    'absolute top-full left-0 right-0 mt-1 rounded-lg z-50',
                    isDark ? 'bg-[#1a1a1a]' : 'bg-white'
                  )}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  {timeframeOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        setSelectedTimeframe(option.value);
                        setShowTimeframeDropdown(false);
                      }}
                      className={cn(
                        'px-4 py-3 border-b',
                        isDark ? 'border-gray-800' : 'border-gray-200'
                      )}
                    >
                      <Text
                        className={cn(
                          'font-medium',
                          selectedTimeframe === option.value
                            ? 'text-blue-500'
                            : isDark
                            ? 'text-white'
                            : 'text-gray-900'
                        )}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Leaderboard List */}
        <View className="flex-1">
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <Text className={cn('text-base', isDark ? 'text-gray-400' : 'text-gray-600')}>
                Loading leaderboard...
              </Text>
            </View>
          ) : !leaderboardData || leaderboardData.length === 0 ? (
            <View className="flex-1 items-center justify-center px-8">
              <Text className={cn('text-base text-center', isDark ? 'text-gray-400' : 'text-gray-600')}>
                No data available for this metric and timeframe yet.
              </Text>
            </View>
          ) : (
            <VirtualizedLeaderboard data={leaderboardData} isDark={isDark} pageSize={25} />
          )}
        </View>
      </View>
    </Modal>
  );
}
