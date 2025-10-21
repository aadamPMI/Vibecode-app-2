// Liquid Glass Card Component
import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { cn } from '../../utils/cn';
import { workoutTheme } from '../../theme/workoutTheme';

interface GlassCardProps {
  children: React.ReactNode;
  intensity?: 40 | 60 | 80 | 100;
  isDark?: boolean;
  style?: ViewStyle;
  className?: string;
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
  borderGlow?: boolean;
  glowColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  intensity = 60,
  isDark = false,
  style,
  className,
  elevation = 'md',
  borderGlow = false,
  glowColor,
}) => {
  const shadowStyle = workoutTheme.shadows[elevation];
  
  const glassBackground = isDark
    ? workoutTheme.colors.glass.dark.background
    : workoutTheme.colors.glass.light.background;
  
  const borderColor = isDark
    ? workoutTheme.colors.glass.dark.border
    : workoutTheme.colors.glass.light.border;

  return (
    <View
      style={[
        styles.container,
        shadowStyle,
        {
          borderRadius: workoutTheme.borderRadius.xl,
          overflow: 'hidden',
        },
        borderGlow && {
          borderWidth: 1,
          borderColor: glowColor || (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)'),
        },
        style,
      ]}
      className={className}
    >
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blurView}
      >
        <View
          style={[
            styles.content,
            {
              backgroundColor: glassBackground,
            },
          ]}
        >
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  blurView: {
    overflow: 'hidden',
  },
  content: {
    overflow: 'hidden',
  },
});

