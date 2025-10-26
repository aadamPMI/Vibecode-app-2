import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Confetti Particle Component
interface ConfettiParticleProps {
  color: string;
  delay: number;
  startX: number;
  onComplete?: () => void;
}

function ConfettiParticle({ color, delay, startX, onComplete }: ConfettiParticleProps) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const randomX = (Math.random() - 0.5) * 200;
    const randomRotation = Math.random() * 720 - 360;

    translateY.value = withTiming(-600, { duration: 2000, easing: Easing.out(Easing.quad) });
    translateX.value = withTiming(randomX, { duration: 2000, easing: Easing.out(Easing.quad) });
    rotation.value = withTiming(randomRotation, { duration: 2000 });
    opacity.value = withSequence(
      withTiming(1, { duration: 1000 }),
      withTiming(0, { duration: 1000 }, () => {
        if (onComplete) {
          runOnJS(onComplete)();
        }
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confettiParticle,
        { backgroundColor: color, left: startX },
        animatedStyle,
      ]}
    />
  );
}

// Confetti Burst Component
interface ConfettiBurstProps {
  onComplete?: () => void;
}

export function ConfettiBurst({ onComplete }: ConfettiBurstProps) {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];
  const [particlesComplete, setParticlesComplete] = React.useState(0);
  const totalParticles = 30;

  useEffect(() => {
    if (particlesComplete >= totalParticles && onComplete) {
      onComplete();
    }
  }, [particlesComplete, totalParticles, onComplete]);

  const handleParticleComplete = () => {
    setParticlesComplete((prev) => prev + 1);
  };

  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {Array.from({ length: totalParticles }).map((_, index) => (
        <ConfettiParticle
          key={index}
          color={colors[index % colors.length]}
          delay={index * 20}
          startX={Math.random() * 300 + 50}
          onComplete={handleParticleComplete}
        />
      ))}
    </View>
  );
}

// Pulse Glow Animation
interface PulseGlowProps {
  children: React.ReactNode;
  color?: string;
  duration?: number;
}

export function PulseGlow({ children, color = '#10b981', duration = 1000 }: PulseGlowProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.05, { damping: 10, stiffness: 100 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    glowOpacity.value = withSequence(
      withTiming(0.8, { duration: duration / 2 }),
      withTiming(0, { duration: duration / 2 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View style={styles.glowContainer}>
        {children}
        <Animated.View
          style={[
            styles.glowRing,
            { borderColor: color, shadowColor: color },
            glowStyle,
          ]}
        />
      </View>
    </Animated.View>
  );
}

// Badge Pop Animation
interface BadgePopProps {
  rank: number;
  color: string;
  onComplete?: () => void;
}

export function BadgePop({ rank, color, onComplete }: BadgePopProps) {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(-180);
  const glowScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Badge pop
    scale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 100 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    rotation.value = withSpring(0, { damping: 10, stiffness: 80 });

    // Glow effect
    glowScale.value = withSequence(
      withTiming(1.5, { duration: 600 }),
      withTiming(0, { duration: 400 }, () => {
        if (onComplete) {
          runOnJS(onComplete)();
        }
      })
    );

    glowOpacity.value = withSequence(
      withTiming(0.6, { duration: 300 }),
      withTiming(0, { duration: 700 })
    );
  }, []);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.badgeContainer}>
      <Animated.View style={[styles.badgeGlow, glowStyle]}>
        <LinearGradient
          colors={[color, `${color}00`] as unknown as readonly [string, string, ...string[]]}
          style={styles.badgeGlowGradient}
        />
      </Animated.View>
      <Animated.View style={[styles.badge, badgeStyle]}>
        <LinearGradient
          colors={[color, color] as unknown as readonly [string, string, ...string[]]}
          style={styles.badgeGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.badgeContent}>
            <Ionicons name="trophy" size={32} color="white" />
            <Animated.Text style={styles.badgeText}>#{rank}</Animated.Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

// Shimmer Loading Animation (for skeleton)
export function ShimmerAnimation({ children, style }: { children: React.ReactNode; style?: any }) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = shimmer.value * 400 - 200;
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.shimmerContainer, style]}>
      {children}
      <Animated.View style={[styles.shimmerOverlay, animatedStyle]}>
        <LinearGradient
          colors={[
            'rgba(255,255,255,0)',
            'rgba(255,255,255,0.3)',
            'rgba(255,255,255,0)',
          ] as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    pointerEvents: 'none',
  },
  confettiParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    bottom: '50%',
    borderRadius: 2,
  },
  glowContainer: {
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 20,
    borderWidth: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  badgeGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  badgeGlowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  shimmerContainer: {
    overflow: 'hidden',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    width: 200,
  },
  shimmerGradient: {
    flex: 1,
  },
});
