import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

// Shimmer effect component
export function ShimmerView({ width, height, style }: { width: string | number; height: number; style?: any }) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.7, 0.3]);
    return { opacity };
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: '#E5E7EB',
          borderRadius: 8,
        },
        style,
        animatedStyle,
      ]}
    />
  );
}

// Community Card Skeleton
export function CommunityCardSkeleton() {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700">
      <View className="flex-row items-start mb-3">
        <ShimmerView width={56} height={56} style={{ borderRadius: 12 }} />
        <View className="flex-1 ml-3">
          <ShimmerView width="60%" height={20} style={{ marginBottom: 8 }} />
          <ShimmerView width="40%" height={16} />
        </View>
      </View>

      <ShimmerView width="100%" height={40} style={{ marginBottom: 12 }} />

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-4">
          <ShimmerView width={60} height={16} />
          <ShimmerView width={60} height={16} />
        </View>
        <ShimmerView width={80} height={32} style={{ borderRadius: 16 }} />
      </View>
    </View>
  );
}

// Member Card Skeleton
export function MemberCardSkeleton() {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-3 mb-2 flex-row items-center justify-between border border-gray-100 dark:border-gray-700">
      <View className="flex-row items-center flex-1">
        <ShimmerView width={48} height={48} style={{ borderRadius: 24 }} />
        <View className="ml-3 flex-1">
          <ShimmerView width="50%" height={18} style={{ marginBottom: 6 }} />
          <ShimmerView width="35%" height={14} />
        </View>
      </View>
      <ShimmerView width={60} height={24} style={{ borderRadius: 12 }} />
    </View>
  );
}

// Leaderboard Card Skeleton
export function LeaderboardCardSkeleton({ rank }: { rank: number }) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-2 border border-gray-100 dark:border-gray-700">
      <View className="flex-row items-center">
        <View className="w-8 mr-3">
          <ShimmerView width={32} height={32} style={{ borderRadius: 16 }} />
        </View>
        <ShimmerView width={48} height={48} style={{ borderRadius: 24 }} />
        <View className="flex-1 ml-3">
          <ShimmerView width="50%" height={18} style={{ marginBottom: 6 }} />
          <ShimmerView width="35%" height={14} />
        </View>
        <View className="items-end">
          <ShimmerView width={60} height={20} style={{ marginBottom: 6 }} />
          <ShimmerView width={40} height={14} />
        </View>
      </View>
    </View>
  );
}

// Header Stats Skeleton
export function HeaderStatsSkeleton() {
  return (
    <View className="flex-row items-center justify-around py-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-4">
      {[1, 2, 3].map((i) => (
        <View key={i} className="items-center">
          <ShimmerView width={48} height={24} style={{ marginBottom: 6 }} />
          <ShimmerView width={60} height={14} />
        </View>
      ))}
    </View>
  );
}
