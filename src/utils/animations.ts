// Animation System using react-native-reanimated
import {
  Easing,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  WithSpringConfig,
  WithTimingConfig,
} from 'react-native-reanimated';

// Spring Physics Configurations
export const springConfigs = {
  gentle: {
    damping: 20,
    stiffness: 120,
    mass: 0.8,
  } as WithSpringConfig,
  
  bouncy: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  } as WithSpringConfig,
  
  snappy: {
    damping: 25,
    stiffness: 200,
    mass: 0.5,
  } as WithSpringConfig,
  
  smooth: {
    damping: 30,
    stiffness: 100,
    mass: 1,
  } as WithSpringConfig,
};

// Timing Configurations
export const timingConfigs = {
  fast: {
    duration: 150,
    easing: Easing.out(Easing.cubic),
  } as WithTimingConfig,
  
  normal: {
    duration: 300,
    easing: Easing.out(Easing.cubic),
  } as WithTimingConfig,
  
  slow: {
    duration: 500,
    easing: Easing.out(Easing.cubic),
  } as WithTimingConfig,
  
  linear: {
    duration: 300,
    easing: Easing.linear,
  } as WithTimingConfig,
  
  easeInOut: {
    duration: 300,
    easing: Easing.inOut(Easing.ease),
  } as WithTimingConfig,
};

// Predefined Animations

/**
 * Fade in from bottom with spring
 */
export const fadeInUp = (delay = 0) => {
  return {
    opacity: withDelay(delay, withTiming(1, timingConfigs.normal)),
    transform: [
      {
        translateY: withDelay(
          delay,
          withSpring(0, springConfigs.gentle)
        ),
      },
    ],
  };
};

/**
 * Scale in with spring
 */
export const scaleIn = (toValue = 1, delay = 0) => {
  return {
    transform: [
      {
        scale: withDelay(
          delay,
          withSpring(toValue, springConfigs.bouncy)
        ),
      },
    ],
  };
};

/**
 * Scale bounce animation for interactions
 */
export const scaleBounce = () => {
  return {
    transform: [
      {
        scale: withSequence(
          withTiming(0.95, { duration: 100 }),
          withSpring(1, springConfigs.bouncy)
        ),
      },
    ],
  };
};

/**
 * Slide in from right
 */
export const slideInRight = (delay = 0) => {
  return {
    opacity: withDelay(delay, withTiming(1, timingConfigs.normal)),
    transform: [
      {
        translateX: withDelay(
          delay,
          withSpring(0, springConfigs.gentle)
        ),
      },
    ],
  };
};

/**
 * Slide in from left
 */
export const slideInLeft = (delay = 0) => {
  return {
    opacity: withDelay(delay, withTiming(1, timingConfigs.normal)),
    transform: [
      {
        translateX: withDelay(
          delay,
          withSpring(0, springConfigs.gentle)
        ),
      },
    ],
  };
};

/**
 * Bounce in animation
 */
export const bounceIn = (delay = 0) => {
  return {
    opacity: withDelay(delay, withTiming(1, timingConfigs.fast)),
    transform: [
      {
        scale: withDelay(
          delay,
          withSequence(
            withSpring(1.1, springConfigs.bouncy),
            withSpring(1, springConfigs.bouncy)
          )
        ),
      },
    ],
  };
};

/**
 * Pulse animation for active indicators
 */
export const pulse = (toValue = 1.05) => {
  return {
    transform: [
      {
        scale: withSequence(
          withTiming(toValue, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
      },
    ],
  };
};

/**
 * Shimmer animation for loading states
 */
export const shimmer = () => {
  return {
    opacity: withSequence(
      withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
    ),
  };
};

/**
 * Shake animation for errors
 */
export const shake = () => {
  return {
    transform: [
      {
        translateX: withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(0, { duration: 50 })
        ),
      },
    ],
  };
};

/**
 * Rotate animation
 */
export const rotate = (toValue: number, duration = 300) => {
  return {
    transform: [
      {
        rotate: withTiming(`${toValue}deg`, { duration, easing: Easing.out(Easing.cubic) }),
      },
    ],
  };
};

/**
 * Flip card animation (3D flip)
 */
export const flipCard = () => {
  return {
    transform: [
      {
        rotateY: withSequence(
          withTiming('90deg', { duration: 200, easing: Easing.in(Easing.ease) }),
          withTiming('0deg', { duration: 200, easing: Easing.out(Easing.ease) })
        ),
      },
    ],
  };
};

/**
 * Number counting animation helper
 */
export const animateNumber = (
  from: number,
  to: number,
  duration = 1000,
  callback: (value: number) => void
) => {
  const startTime = Date.now();
  const difference = to - from;
  
  const animate = () => {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = from + difference * easeProgress;
    
    callback(currentValue);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      callback(to); // Ensure final value is exact
    }
  };
  
  animate();
};

/**
 * Stagger animation helper - returns delays for multiple items
 */
export const staggerDelays = (count: number, baseDelay = 0, increment = 50) => {
  return Array.from({ length: count }, (_, i) => baseDelay + i * increment);
};

/**
 * Button press animation
 */
export const buttonPress = () => {
  return {
    transform: [
      {
        scale: withSequence(
          withTiming(0.95, { duration: 100, easing: Easing.out(Easing.cubic) }),
          withSpring(1, springConfigs.snappy)
        ),
      },
    ],
  };
};

/**
 * Swipe delete animation
 */
export const swipeDelete = () => {
  return {
    opacity: withTiming(0, { duration: 300 }),
    transform: [
      {
        translateX: withTiming(-300, { duration: 300, easing: Easing.out(Easing.cubic) }),
      },
    ],
  };
};

/**
 * Modal slide up animation
 */
export const modalSlideUp = () => {
  return {
    opacity: withTiming(1, timingConfigs.fast),
    transform: [
      {
        translateY: withSpring(0, springConfigs.smooth),
      },
    ],
  };
};

/**
 * Success checkmark animation
 */
export const successCheck = () => {
  return {
    opacity: withTiming(1, { duration: 200 }),
    transform: [
      {
        scale: withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(1.3, { duration: 200, easing: Easing.out(Easing.back(2)) }),
          withSpring(1, springConfigs.bouncy)
        ),
      },
    ],
  };
};

