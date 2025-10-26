// Loading States with Premium Animations
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../../utils/cn';
import { workoutTheme } from '../../theme/workoutTheme';

// Shimmer Loading Skeleton
interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
  isDark?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius = 12,
  style,
  isDark = false,
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

// AI Thinking Indicator
interface AIThinkingProps {
  message?: string;
  isDark?: boolean;
}

export const AIThinking: React.FC<AIThinkingProps> = ({
  message = 'AI is thinking...',
  isDark = false,
}) => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 400 }),
        withTiming(0, { duration: 400 })
      ),
      -1
    );

    setTimeout(() => {
      dot2.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 400 }),
          withTiming(0, { duration: 400 })
        ),
        -1
      );
    }, 150);

    setTimeout(() => {
      dot3.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 400 }),
          withTiming(0, { duration: 400 })
        ),
        -1
      );
    }, 300);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3.value }],
  }));

  return (
    <View style={styles.aiThinkingContainer}>
      <LinearGradient
        colors={workoutTheme.colors.primary.colors as unknown as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.aiIconContainer}
      >
        <Ionicons name="sparkles" size={20} color="white" />
      </LinearGradient>
      
      <Text
        className={cn(
          'text-base ml-3',
          isDark ? 'text-white' : 'text-gray-900'
        )}
      >
        {message}
      </Text>
      
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, dot1Style]}>
          <LinearGradient
            colors={workoutTheme.colors.primary.colors as unknown as readonly [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dotGradient}
          />
        </Animated.View>
        <Animated.View style={[styles.dot, dot2Style]}>
          <LinearGradient
            colors={workoutTheme.colors.primary.colors as unknown as readonly [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dotGradient}
          />
        </Animated.View>
        <Animated.View style={[styles.dot, dot3Style]}>
          <LinearGradient
            colors={workoutTheme.colors.primary.colors as unknown as readonly [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dotGradient}
          />
        </Animated.View>
      </View>
    </View>
  );
};

// Inline Loading Spinner
interface InlineLoadingProps {
  message?: string;
  isDark?: boolean;
  size?: 'small' | 'large';
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  message,
  isDark = false,
  size = 'small',
}) => {
  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator
        size={size}
        color={workoutTheme.colors.primary.start}
      />
      {message && (
        <Text
          className={cn(
            'text-sm ml-2',
            isDark ? 'text-gray-400' : 'text-gray-600'
          )}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

// Empty State
interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  isDark?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  isDark = false,
}) => {
  return (
    <View style={styles.emptyStateContainer}>
      <View
        className={cn(
          'w-20 h-20 rounded-full items-center justify-center mb-4',
          isDark ? 'bg-[#1f2937]' : 'bg-gray-100'
        )}
      >
        <Ionicons
          name={icon}
          size={48}
          color={isDark ? '#6b7280' : '#9ca3af'}
        />
      </View>
      
      <Text
        className={cn(
          'text-xl font-bold mb-2',
          isDark ? 'text-white' : 'text-gray-900'
        )}
      >
        {title}
      </Text>
      
      <Text
        className={cn(
          'text-sm text-center mb-4 px-8',
          isDark ? 'text-gray-400' : 'text-gray-600'
        )}
      >
        {message}
      </Text>
      
      {actionLabel && onAction && (
        <Animated.View>
          <LinearGradient
            colors={workoutTheme.colors.primary.colors as unknown as readonly [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyStateButton}
          >
            <Ionicons name="add-circle-outline" size={20} color="white" />
            <Text style={styles.emptyStateButtonText}>{actionLabel}</Text>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
};

// Error State
interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  isDark?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Oops!',
  message,
  onRetry,
  isDark = false,
}) => {
  return (
    <View style={styles.emptyStateContainer}>
      <View
        className={cn(
          'w-20 h-20 rounded-full items-center justify-center mb-4',
          isDark ? 'bg-red-900/20' : 'bg-red-50'
        )}
      >
        <Ionicons
          name="alert-circle"
          size={48}
          color="#ef4444"
        />
      </View>
      
      <Text
        className={cn(
          'text-xl font-bold mb-2',
          isDark ? 'text-white' : 'text-gray-900'
        )}
      >
        {title}
      </Text>
      
      <Text
        className={cn(
          'text-sm text-center mb-4 px-8',
          isDark ? 'text-gray-400' : 'text-gray-600'
        )}
      >
        {message}
      </Text>
      
      {onRetry && (
        <Animated.View>
          <LinearGradient
            colors={['#ef4444', '#dc2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyStateButton}
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.emptyStateButtonText}>Try Again</Text>
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  aiThinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  aiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginLeft: 12,
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  dotGradient: {
    width: '100%',
    height: '100%',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

