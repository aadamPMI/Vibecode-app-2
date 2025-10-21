// Premium Liquid Glass Design System for Workout Module
import { Platform } from 'react-native';

export const workoutTheme = {
  // Color Palette
  colors: {
    // Primary Gradients
    primary: {
      start: '#3b82f6',
      end: '#8b5cf6',
      colors: ['#3b82f6', '#8b5cf6'],
    },
    success: {
      start: '#22c55e',
      end: '#10b981',
      colors: ['#22c55e', '#10b981'],
    },
    warning: {
      start: '#f97316',
      end: '#ef4444',
      colors: ['#f97316', '#ef4444'],
    },
    info: {
      start: '#06b6d4',
      end: '#3b82f6',
      colors: ['#06b6d4', '#3b82f6'],
    },
    
    // Glass Backgrounds
    glass: {
      light: {
        background: 'rgba(255, 255, 255, 0.4)',
        border: 'rgba(255, 255, 255, 0.6)',
        subtle: 'rgba(255, 255, 255, 0.2)',
      },
      dark: {
        background: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.1)',
        subtle: 'rgba(255, 255, 255, 0.03)',
      },
    },
    
    // Semantic Colors
    exercise: {
      chest: '#ef4444',
      back: '#3b82f6',
      shoulders: '#f97316',
      biceps: '#8b5cf6',
      triceps: '#ec4899',
      legs: '#22c55e',
      core: '#f59e0b',
    },
  },
  
  // Blur Configurations
  blur: {
    subtle: 40,
    medium: 60,
    strong: 80,
    intense: 100,
  },
  
  // Shadow Configurations
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.25,
      shadowRadius: 30,
      elevation: 12,
    },
    
    // Colored Glow Shadows
    glow: {
      primary: {
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
      },
      success: {
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
      },
      warning: {
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
      },
    },
  },
  
  // Typography
  typography: {
    // Font Families (SF Pro inspired)
    fontFamily: {
      regular: Platform.select({
        ios: 'System',
        android: 'Roboto',
      }),
      medium: Platform.select({
        ios: 'System',
        android: 'Roboto-Medium',
      }),
      semibold: Platform.select({
        ios: 'System',
        android: 'Roboto-Medium',
      }),
      bold: Platform.select({
        ios: 'System',
        android: 'Roboto-Bold',
      }),
    },
    
    // Font Sizes
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
      '6xl': 60,
      '7xl': 72,
    },
    
    // Line Heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
    
    // Letter Spacing
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
      wider: 1,
      widest: 2,
    },
  },
  
  // Spacing Scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 64,
  },
  
  // Border Radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },
  
  // Animation Durations
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 1000,
  },
};

export type WorkoutTheme = typeof workoutTheme;

