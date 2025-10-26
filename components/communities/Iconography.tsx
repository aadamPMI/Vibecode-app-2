import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import {
  gradients,
  darkTheme,
  lightTheme,
  elevation,
  radius,
} from '../../src/theme/designTokens';

// ============================================================================
// PODIUM MEDAL ICONS
// Filled gradient medals for 1st, 2nd, 3rd place
// ============================================================================

interface PodiumMedalProps {
  rank: 1 | 2 | 3;
  size?: number;
  animated?: boolean;
  isDark?: boolean;
}

export function PodiumMedal({ rank, size = 48, animated = false, isDark = true }: PodiumMedalProps) {
  const theme = isDark ? darkTheme : lightTheme;

  const getGradient = () => {
    switch (rank) {
      case 1:
        return gradients.gold;
      case 2:
        return gradients.silver;
      case 3:
        return gradients.bronze;
    }
  };

  const gradient = getGradient();
  const iconSize = size * 0.6;

  const Container = animated ? Animated.View : View;
  const animationProps = animated ? { entering: ZoomIn.springify().damping(12) } : {};

  return (
    <Container style={[styles.medalContainer, { width: size, height: size }]} {...animationProps}>
      <LinearGradient
        colors={gradient.colors as unknown as readonly [string, string, ...string[]]}
        start={gradient.start}
        end={gradient.end}
        style={[
          styles.medalGradient,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          rank === 1 && elevation.lg,
          rank === 2 && elevation.md,
          rank === 3 && elevation.sm,
        ]}
      >
        <Ionicons name="medal" size={iconSize} color="#ffffff" />
      </LinearGradient>
    </Container>
  );
}

// ============================================================================
// TROPHY ICON
// For winners and top performers
// ============================================================================

interface TrophyIconProps {
  size?: number;
  color?: string;
  animated?: boolean;
  variant?: 'outline' | 'filled';
}

export function TrophyIcon({
  size = 24,
  color = '#f59e0b',
  animated = false,
  variant = 'filled',
}: TrophyIconProps) {
  const iconName = variant === 'filled' ? 'trophy' : 'trophy-outline';
  const Container = animated ? Animated.View : View;
  const animationProps = animated ? { entering: FadeIn.duration(300) } : {};

  return (
    <Container {...animationProps}>
      <Ionicons name={iconName} size={size} color={color} />
    </Container>
  );
}

// ============================================================================
// RANK BADGE
// Circular badge showing rank number with optional gradient
// ============================================================================

interface RankBadgeProps {
  rank: number;
  size?: number;
  isPodium?: boolean;
  isDark?: boolean;
}

export function RankBadge({ rank, size = 36, isPodium = false, isDark = true }: RankBadgeProps) {
  const theme = isDark ? darkTheme : lightTheme;
  const fontSize = size * 0.45;

  if (isPodium && rank <= 3) {
    const gradient = rank === 1 ? gradients.gold : rank === 2 ? gradients.silver : gradients.bronze;

    return (
      <LinearGradient
        colors={gradient.colors as unknown as readonly [string, string, ...string[]]}
        start={gradient.start}
        end={gradient.end}
        style={[
          styles.rankBadge,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Animated.Text
          entering={ZoomIn.springify()}
          style={[styles.rankTextPodium, { fontSize }]}
        >
          {rank}
        </Animated.Text>
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.rankBadge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.bg.tertiary,
        },
      ]}
    >
      <Animated.Text
        entering={FadeIn.duration(200)}
        style={[styles.rankText, { fontSize, color: theme.text.secondary }]}
      >
        {rank}
      </Animated.Text>
    </View>
  );
}

// ============================================================================
// COMMUNITY ICONS
// Consistent icon set for community features
// ============================================================================

type CommunityIconName =
  | 'members'
  | 'workouts'
  | 'streak'
  | 'points'
  | 'leaderboard'
  | 'settings'
  | 'share'
  | 'copy'
  | 'check'
  | 'close'
  | 'add'
  | 'remove'
  | 'edit'
  | 'search'
  | 'filter'
  | 'more';

interface CommunityIconProps {
  name: CommunityIconName;
  size?: number;
  color?: string;
  variant?: 'outline' | 'filled';
}

export function CommunityIcon({
  name,
  size = 24,
  color = '#3b82f6',
  variant = 'outline',
}: CommunityIconProps) {
  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<CommunityIconName, { outline: string; filled: string }> = {
      members: { outline: 'people-outline', filled: 'people' },
      workouts: { outline: 'barbell-outline', filled: 'barbell' },
      streak: { outline: 'flame-outline', filled: 'flame' },
      points: { outline: 'star-outline', filled: 'star' },
      leaderboard: { outline: 'podium-outline', filled: 'podium' },
      settings: { outline: 'settings-outline', filled: 'settings' },
      share: { outline: 'share-outline', filled: 'share' },
      copy: { outline: 'copy-outline', filled: 'copy' },
      check: { outline: 'checkmark-circle-outline', filled: 'checkmark-circle' },
      close: { outline: 'close-circle-outline', filled: 'close-circle' },
      add: { outline: 'add-circle-outline', filled: 'add-circle' },
      remove: { outline: 'remove-circle-outline', filled: 'remove-circle' },
      edit: { outline: 'create-outline', filled: 'create' },
      search: { outline: 'search-outline', filled: 'search' },
      filter: { outline: 'filter-outline', filled: 'filter' },
      more: { outline: 'ellipsis-horizontal-outline', filled: 'ellipsis-horizontal' },
    };

    const icons = iconMap[name];
    return (variant === 'filled' ? icons.filled : icons.outline) as keyof typeof Ionicons.glyphMap;
  };

  return <Ionicons name={getIconName()} size={size} color={color} />;
}

// ============================================================================
// CHANGE INDICATOR
// Shows rank change with icon and color
// ============================================================================

interface ChangeIndicatorProps {
  change: number;
  size?: number;
  showValue?: boolean;
  isDark?: boolean;
}

export function ChangeIndicator({
  change,
  size = 16,
  showValue = true,
  isDark = true,
}: ChangeIndicatorProps) {
  const theme = isDark ? darkTheme : lightTheme;
  const color = change > 0 ? theme.semantic.success : change < 0 ? theme.semantic.error : theme.text.tertiary;
  const iconName = change > 0 ? 'trending-up' : change < 0 ? 'trending-down' : 'remove';

  return (
    <View style={styles.changeIndicator}>
      <Ionicons name={iconName} size={size} color={color} />
      {showValue && change !== 0 && (
        <Animated.Text
          entering={FadeIn.duration(200)}
          style={[styles.changeText, { fontSize: size * 0.875, color }]}
        >
          {change > 0 ? '+' : ''}
          {change}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  medalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontWeight: 'bold',
  },
  rankTextPodium: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontWeight: '600',
  },
});
