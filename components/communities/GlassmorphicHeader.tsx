import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  spacing,
  radius,
  darkTheme,
  lightTheme,
  blur,
  elevation,
  getGlassmorphismStyle,
} from '../../src/theme/designTokens';

interface GlassmorphicHeaderProps {
  title: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  isDark?: boolean;
}

export function GlassmorphicHeader({
  title,
  subtitle,
  rightComponent,
  leftComponent,
  isDark = true,
}: GlassmorphicHeaderProps) {
  const insets = useSafeAreaInsets();
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <BlurView
      intensity={blur.medium}
      tint={isDark ? 'dark' : 'light'}
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.md,
        },
        getGlassmorphismStyle(isDark),
      ]}
    >
      <View style={styles.content}>
        {leftComponent && <View style={styles.leftSection}>{leftComponent}</View>}

        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.text.tertiary }]}>
              {subtitle}
            </Text>
          )}
        </View>

        {rightComponent && <View style={styles.rightSection}>{rightComponent}</View>}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    ...elevation.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  leftSection: {
    minWidth: 40,
  },
  titleSection: {
    flex: 1,
  },
  rightSection: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
});
