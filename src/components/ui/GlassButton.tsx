// Premium Glass Button with Animations and Haptics
import React from 'react';
import { Pressable, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { hapticLight, hapticMedium } from '../../utils/haptics';
import { springConfigs } from '../../utils/animations';
import { workoutTheme } from '../../theme/workoutTheme';
import { cn } from '../../utils/cn';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  className?: string;
  haptic?: 'light' | 'medium' | 'none';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  className,
  haptic = 'light',
  icon,
  iconPosition = 'left',
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfigs.snappy);
  };

  const handlePress = () => {
    if (disabled) return;
    
    if (haptic === 'light') {
      hapticLight();
    } else if (haptic === 'medium') {
      hapticMedium();
    }
    
    onPress();
  };

  const getGradientColors = (): readonly [string, string, ...string[]] => {
    switch (variant) {
      case 'primary':
        return workoutTheme.colors.primary.colors as unknown as readonly [string, string, ...string[]];
      case 'success':
        return workoutTheme.colors.success.colors as unknown as readonly [string, string, ...string[]];
      case 'warning':
        return workoutTheme.colors.warning.colors as unknown as readonly [string, string, ...string[]];
      case 'secondary':
        return ['#6b7280', '#4b5563'] as const;
      case 'ghost':
        return ['transparent', 'transparent'] as const;
      default:
        return workoutTheme.colors.primary.colors as unknown as readonly [string, string, ...string[]];
    }
  };

  const getShadowStyle = () => {
    if (variant === 'ghost' || disabled) return {};
    
    switch (variant) {
      case 'primary':
        return workoutTheme.shadows.glow.primary;
      case 'success':
        return workoutTheme.shadows.glow.success;
      case 'warning':
        return workoutTheme.shadows.glow.warning;
      default:
        return workoutTheme.shadows.md;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'md':
        return { paddingVertical: 12, paddingHorizontal: 24 };
      case 'lg':
        return { paddingVertical: 16, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return workoutTheme.typography.fontSize.sm;
      case 'md':
        return workoutTheme.typography.fontSize.base;
      case 'lg':
        return workoutTheme.typography.fontSize.lg;
      default:
        return workoutTheme.typography.fontSize.base;
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        animatedStyle,
        {
          borderRadius: workoutTheme.borderRadius['2xl'],
          overflow: 'hidden',
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        !disabled && getShadowStyle(),
        style,
      ]}
      className={className}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          getPadding(),
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        {icon && iconPosition === 'left' && (
          <Animated.View style={styles.iconLeft}>{icon}</Animated.View>
        )}
        
        <Text
          style={[
            styles.text,
            {
              fontSize: getTextSize(),
              color: variant === 'ghost' ? workoutTheme.colors.primary.start : '#fff',
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
        
        {icon && iconPosition === 'right' && (
          <Animated.View style={styles.iconRight}>{icon}</Animated.View>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

