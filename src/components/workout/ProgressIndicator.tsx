// Progress Indicator Component
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../../utils/cn';
import { workoutTheme } from '../../theme/workoutTheme';
import { springConfigs } from '../../utils/animations';

type ProgressStatus = 'improving' | 'matching' | 'declining';

interface ProgressIndicatorProps {
  status: ProgressStatus;
  percentageChange: number;
  isDark?: boolean;
  animated?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  status,
  percentageChange,
  isDark = false,
  animated = true,
}) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      scale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1, springConfigs.bouncy)
      );

      if (status === 'improving') {
        rotation.value = withSpring(-45, springConfigs.bouncy);
      } else if (status === 'declining') {
        rotation.value = withSpring(45, springConfigs.bouncy);
      }
    } else {
      scale.value = 1;
      rotation.value = status === 'improving' ? -45 : status === 'declining' ? 45 : 0;
    }
  }, [status, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const getGradientColors = (): readonly [string, string, ...string[]] => {
    switch (status) {
      case 'improving':
        return workoutTheme.colors.success.colors as unknown as readonly [string, string, ...string[]];
      case 'declining':
        return workoutTheme.colors.warning.colors as unknown as readonly [string, string, ...string[]];
      case 'matching':
        return ['#f59e0b', '#eab308'] as const;
      default:
        return workoutTheme.colors.primary.colors as unknown as readonly [string, string, ...string[]];
    }
  };

  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'improving':
        return 'trending-up';
      case 'declining':
        return 'trending-down';
      case 'matching':
        return 'remove';
      default:
        return 'remove';
    }
  };

  const getLabel = (): string => {
    const absChange = Math.abs(percentageChange);
    switch (status) {
      case 'improving':
        return `+${absChange.toFixed(0)}% stronger`;
      case 'declining':
        return `-${absChange.toFixed(0)}% weaker`;
      case 'matching':
        return 'Same as last time';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Ionicons name={getIcon()} size={24} color="white" />
        </LinearGradient>
      </Animated.View>
      
      <Text
        className={cn(
          'text-sm font-semibold ml-2',
          isDark ? 'text-white' : 'text-gray-900'
        )}
      >
        {getLabel()}
      </Text>
    </View>
  );
};

// Mini version for compact display
interface MiniProgressIndicatorProps {
  status: ProgressStatus;
  size?: number;
}

export const MiniProgressIndicator: React.FC<MiniProgressIndicatorProps> = ({
  status,
  size = 20,
}) => {
  const getColor = (): string => {
    switch (status) {
      case 'improving':
        return '#22c55e';
      case 'declining':
        return '#ef4444';
      case 'matching':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'improving':
        return 'arrow-up';
      case 'declining':
        return 'arrow-down';
      case 'matching':
        return 'remove';
      default:
        return 'remove';
    }
  };

  return (
    <View
      style={[
        styles.miniContainer,
        {
          backgroundColor: `${getColor()}20`,
          width: size + 8,
          height: size + 8,
        },
      ]}
    >
      <Ionicons name={getIcon()} size={size} color={getColor()} />
    </View>
  );
};

// Calculate progress status helper function
export const calculateProgressStatus = (
  current: { weight: number; reps: number },
  previous: { weight: number; reps: number } | null
): { status: ProgressStatus; percentageChange: number } => {
  if (!previous) {
    return { status: 'matching', percentageChange: 0 };
  }

  const currentVolume = current.weight * current.reps;
  const previousVolume = previous.weight * previous.reps;

  if (currentVolume === previousVolume) {
    return { status: 'matching', percentageChange: 0 };
  }

  const percentageChange = ((currentVolume - previousVolume) / previousVolume) * 100;

  if (percentageChange > 2) {
    return { status: 'improving', percentageChange };
  } else if (percentageChange < -2) {
    return { status: 'declining', percentageChange };
  } else {
    return { status: 'matching', percentageChange: 0 };
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  iconContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniContainer: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

