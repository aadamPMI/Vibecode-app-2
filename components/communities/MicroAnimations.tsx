import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
  withRepeat,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { darkTheme, lightTheme, duration } from '../../src/theme/designTokens';

// ============================================================================
// RANK BUMP ANIMATION
// When a user's rank changes, this animates a subtle "bump" effect
// ============================================================================
interface RankBumpProps {
  rank: number;
  isDark?: boolean;
  size?: number;
}

export function RankBumpAnimation({ rank, isDark = true, size = 32 }: RankBumpProps) {
  const theme = isDark ? darkTheme : lightTheme;
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    // Trigger animation when rank changes
    scale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );

    rotate.value = withSequence(
      withTiming(-10, { duration: 100, easing: Easing.out(Easing.ease) }),
      withTiming(10, { duration: 100, easing: Easing.out(Easing.ease) }),
      withTiming(0, { duration: 100, easing: Easing.out(Easing.ease) })
    );
  }, [rank]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Ionicons name="trophy" size={size} color={theme.podium.gold.primary} />
    </Animated.View>
  );
}

// ============================================================================
// COPY SUCCESS ANIMATION
// Shows a checkmark with success feedback when code is copied
// ============================================================================
interface CopySuccessProps {
  isDark?: boolean;
  size?: number;
}

export function CopySuccessAnimation({ isDark = true, size = 24 }: CopySuccessProps) {
  const theme = isDark ? darkTheme : lightTheme;
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Scale up and fade in
    scale.value = withSpring(1, { damping: 12, stiffness: 180 });
    opacity.value = withTiming(1, { duration: duration.fast });

    // After 2 seconds, fade out
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: duration.normal });
      scale.value = withTiming(0.8, { duration: duration.normal });
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Ionicons name="checkmark-circle" size={size} color={theme.semantic.success} />
    </Animated.View>
  );
}

// ============================================================================
// JOIN PULSE ANIMATION
// Pulsing animation for join/add buttons to draw attention
// ============================================================================
interface JoinPulseProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export function JoinPulseAnimation({ children, enabled = true }: JoinPulseProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    if (enabled) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      scale.value = withTiming(1, { duration: duration.normal });
      opacity.value = withTiming(1, { duration: duration.normal });
    }
  }, [enabled]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

// ============================================================================
// SHIMMER LOADING ANIMATION
// For loading states with a subtle shimmer effect
// ============================================================================
interface ShimmerProps {
  width: number;
  height: number;
  borderRadius?: number;
  isDark?: boolean;
}

export function ShimmerAnimation({
  width,
  height,
  borderRadius = 8,
  isDark = true,
}: ShimmerProps) {
  const theme = isDark ? darkTheme : lightTheme;
  const translateX = useSharedValue(-width);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(width, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, [width]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.shimmerContainer,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.bg.tertiary,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.shimmerGradient,
          {
            width: width * 0.5,
            height: '100%',
            backgroundColor: theme.glass.medium,
          },
          animatedStyle,
        ]}
      />
    </Animated.View>
  );
}

// ============================================================================
// FLOATING ANIMATION
// Subtle floating effect for cards or elements
// ============================================================================
interface FloatingProps {
  children: React.ReactNode;
  enabled?: boolean;
  distance?: number;
}

export function FloatingAnimation({
  children,
  enabled = true,
  distance = 4,
}: FloatingProps) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (enabled) {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-distance, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(distance, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      translateY.value = withTiming(0, { duration: duration.normal });
    }
  }, [enabled, distance]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

// ============================================================================
// CONFETTI BURST
// Quick celebration animation for achievements
// ============================================================================
interface ConfettiBurstProps {
  isDark?: boolean;
}

export function ConfettiBurstAnimation({ isDark = true }: ConfettiBurstProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1.5, { damping: 6, stiffness: 100 });
    rotate.value = withTiming(360, { duration: 800, easing: Easing.out(Easing.ease) });
    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
  }));

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <Animated.View style={[styles.confettiContainer, animatedStyle]}>
      <Ionicons name="sparkles" size={40} color={theme.podium.gold.primary} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shimmerContainer: {
    overflow: 'hidden',
  },
  shimmerGradient: {
    position: 'absolute',
  },
  confettiContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
