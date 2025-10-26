/**
 * Design Tokens - Centralized Visual System
 *
 * This file contains all design tokens for consistent theming across the app.
 * Includes spacing, colors, gradients, elevations, and more.
 */

import { Platform } from 'react-native';

// ============================================================================
// SPACING SYSTEM (8pt Grid)
// ============================================================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================
export const radius = {
  none: 0,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 32,
  full: 9999,
} as const;

// ============================================================================
// COLOR PALETTE
// ============================================================================

// Dark Theme (Primary)
export const darkTheme = {
  // Background colors
  bg: {
    primary: '#0f172a',     // Main background
    secondary: '#1e293b',   // Card background
    tertiary: '#334155',    // Elevated surfaces
    elevated: '#475569',    // Higher elevation
  },

  // Text colors
  text: {
    primary: '#f8fafc',     // Primary text
    secondary: '#cbd5e1',   // Secondary text
    tertiary: '#94a3b8',    // Tertiary text
    disabled: '#64748b',    // Disabled text
    inverse: '#0f172a',     // Text on light backgrounds
  },

  // Border colors
  border: {
    primary: '#334155',
    secondary: '#475569',
    focus: '#3b82f6',
    light: 'rgba(255, 255, 255, 0.1)',
  },

  // Brand colors
  brand: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
  },

  // Semantic colors
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Podium colors
  podium: {
    gold: {
      primary: '#fbbf24',
      secondary: '#f59e0b',
      dark: '#d97706',
      text: '#78350f',
    },
    silver: {
      primary: '#e5e7eb',
      secondary: '#d1d5db',
      dark: '#9ca3af',
      text: '#374151',
    },
    bronze: {
      primary: '#f97316',
      secondary: '#ea580c',
      dark: '#c2410c',
      text: '#7c2d12',
    },
  },

  // Glass/Blur effects
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.15)',
  },
} as const;

// Light Theme (Optional)
export const lightTheme = {
  // Background colors
  bg: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    elevated: '#e2e8f0',
  },

  // Text colors
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#64748b',
    disabled: '#94a3b8',
    inverse: '#f8fafc',
  },

  // Border colors
  border: {
    primary: '#e2e8f0',
    secondary: '#cbd5e1',
    focus: '#3b82f6',
    light: 'rgba(0, 0, 0, 0.1)',
  },

  // Brand colors (same as dark)
  brand: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
  },

  // Semantic colors (same as dark)
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Podium colors (same as dark)
  podium: {
    gold: {
      primary: '#fbbf24',
      secondary: '#f59e0b',
      dark: '#d97706',
      text: '#78350f',
    },
    silver: {
      primary: '#e5e7eb',
      secondary: '#d1d5db',
      dark: '#9ca3af',
      text: '#374151',
    },
    bronze: {
      primary: '#f97316',
      secondary: '#ea580c',
      dark: '#c2410c',
      text: '#7c2d12',
    },
  },

  // Glass/Blur effects
  glass: {
    light: 'rgba(255, 255, 255, 0.6)',
    medium: 'rgba(255, 255, 255, 0.75)',
    strong: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(255, 255, 255, 0.9)',
  },
} as const;

// ============================================================================
// GRADIENTS
// ============================================================================
export const gradients = {
  // Podium gradients (matching screenshots)
  gold: {
    colors: ['#fbbf24', '#f59e0b', '#d97706'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  silver: {
    colors: ['#f8fafc', '#e5e7eb', '#cbd5e1'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  bronze: {
    colors: ['#f97316', '#ea580c', '#c2410c'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Brand gradients
  primary: {
    colors: ['#3b82f6', '#8b5cf6'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  secondary: {
    colors: ['#8b5cf6', '#ec4899'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  accent: {
    colors: ['#06b6d4', '#3b82f6'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },

  // Semantic gradients
  success: {
    colors: ['#10b981', '#059669'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  warning: {
    colors: ['#f59e0b', '#d97706'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  error: {
    colors: ['#ef4444', '#dc2626'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
} as const;

// ============================================================================
// ELEVATIONS & SHADOWS
// ============================================================================
export const elevation = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 16,
  },
  '3xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 24,
  },
} as const;

// Glow shadows for special elements
export const glowShadow = {
  gold: {
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  silver: {
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  bronze: {
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  primary: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  success: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// ============================================================================
// BLUR INTENSITIES
// ============================================================================
export const blur = {
  subtle: 10,
  light: 20,
  medium: 40,
  strong: 60,
  intense: 80,
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================
export const typography = {
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    semibold: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
  },

  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
    '5xl': 40,
    '6xl': 48,
  },

  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
  },
} as const;

// ============================================================================
// ANIMATION DURATIONS
// ============================================================================
export const duration = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
  slowest: 1000,
} as const;

// ============================================================================
// ANIMATION EASINGS
// ============================================================================
export const easing = {
  linear: [0.0, 0.0, 1.0, 1.0] as const,
  ease: [0.25, 0.1, 0.25, 1.0] as const,
  easeIn: [0.42, 0.0, 1.0, 1.0] as const,
  easeOut: [0.0, 0.0, 0.58, 1.0] as const,
  easeInOut: [0.42, 0.0, 0.58, 1.0] as const,
  spring: { damping: 15, stiffness: 150 } as const,
  bouncy: { damping: 8, stiffness: 100 } as const,
} as const;

// ============================================================================
// ICON SIZES
// ============================================================================
export const iconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

// ============================================================================
// BORDER WIDTHS
// ============================================================================
export const borderWidth = {
  hairline: Platform.select({ ios: 0.5, android: 1, default: 1 }),
  thin: 1,
  base: 2,
  thick: 3,
  heavy: 4,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get inner light border for selected/focused cards
 */
export const getInnerLightBorder = (isDark: boolean = true) => ({
  borderWidth: borderWidth.thin,
  borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.8)',
});

/**
 * Get glassmorphism style for headers
 */
export const getGlassmorphismStyle = (isDark: boolean = true) => ({
  backgroundColor: isDark ? darkTheme.glass.medium : lightTheme.glass.medium,
  borderBottomWidth: borderWidth.hairline,
  borderBottomColor: isDark ? darkTheme.border.light : lightTheme.border.light,
});

/**
 * Get podium gradient colors
 */
export const getPodiumGradient = (rank: number) => {
  switch (rank) {
    case 1:
      return gradients.gold;
    case 2:
      return gradients.silver;
    case 3:
      return gradients.bronze;
    default:
      return null;
  }
};

/**
 * Get podium glow shadow
 */
export const getPodiumGlowShadow = (rank: number) => {
  switch (rank) {
    case 1:
      return glowShadow.gold;
    case 2:
      return glowShadow.silver;
    case 3:
      return glowShadow.bronze;
    default:
      return elevation.sm;
  }
};

// ============================================================================
// EXPORTS
// ============================================================================
export const tokens = {
  spacing,
  radius,
  darkTheme,
  lightTheme,
  gradients,
  elevation,
  glowShadow,
  blur,
  typography,
  duration,
  easing,
  iconSize,
  borderWidth,
} as const;

export type Theme = typeof darkTheme;
export type ThemeMode = 'dark' | 'light';

// Default theme
export const defaultTheme = darkTheme;
