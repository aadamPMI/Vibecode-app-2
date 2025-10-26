import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { hapticLight } from '../../src/utils/haptics';
import {
  gradients,
  elevation,
  glowShadow,
  spacing,
  radius,
  darkTheme,
  lightTheme,
  typography,
  getPodiumGradient,
  getPodiumGlowShadow,
  getInnerLightBorder,
} from '../../src/theme/designTokens';

// Animated Text component for count-up
const AnimatedText = Animated.createAnimatedComponent(Text);

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  value: number;
  change?: number; // Change vs last period (positive or negative)
  isTied?: boolean;
}

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  metric: 'workouts' | 'points' | 'streak';
  isDark?: boolean;
  index: number;
  onPress?: (entry: LeaderboardEntry) => void;
}

export function LeaderboardCard({
  entry,
  metric,
  isDark = false,
  index,
  onPress,
}: LeaderboardCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const countValue = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Animate count-up on mount
    countValue.value = withTiming(entry.value, {
      duration: 1000 + index * 100,
      easing: Easing.out(Easing.cubic),
    });
  }, [entry.value, index]);

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 150 });
  };

  const handlePress = () => {
    hapticLight();
    onPress?.(entry);
  };

  const handleLongPress = () => {
    hapticLight();
    setShowTooltip(true);
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedTextProps = useAnimatedProps(() => {
    return {
      text: Math.round(countValue.value).toString(),
    };
  });

  const theme = isDark ? darkTheme : lightTheme;
  const podiumGradientConfig = getPodiumGradient(entry.rank);
  const podiumShadow = getPodiumGlowShadow(entry.rank);

  const getMetricIcon = () => {
    switch (metric) {
      case 'workouts':
        return 'barbell';
      case 'points':
        return 'trophy';
      case 'streak':
        return 'flame';
      default:
        return 'stats-chart';
    }
  };

  const getChangeColor = (change?: number) => {
    if (!change) return theme.text.tertiary;
    return change > 0 ? theme.semantic.success : theme.semantic.error;
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return 'remove';
    return change > 0 ? 'trending-up' : 'trending-down';
  };

  const initials = entry.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <Animated.View
        entering={FadeInDown.delay(index * 80).duration(400)}
        style={cardStyle}
      >
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={handleLongPress}
          style={[
            styles.card,
            { backgroundColor: theme.bg.secondary },
            podiumGradientConfig && styles.podiumCard,
            podiumGradientConfig && podiumShadow,
            podiumGradientConfig && getInnerLightBorder(isDark),
          ]}
        >
          {podiumGradientConfig && (
            <LinearGradient
              colors={podiumGradientConfig.colors as unknown as readonly [string, string, ...string[]]}
              style={styles.podiumGradient}
              start={podiumGradientConfig.start}
              end={podiumGradientConfig.end}
            />
          )}

          {/* Rank Badge */}
          <View style={styles.rankContainer}>
            {podiumGradientConfig ? (
              <LinearGradient
                colors={podiumGradientConfig.colors as unknown as readonly [string, string, ...string[]]}
                style={styles.rankBadge}
                start={podiumGradientConfig.start}
                end={podiumGradientConfig.end}
              >
                <Text style={styles.rankTextPodium}>{entry.rank}</Text>
              </LinearGradient>
            ) : (
              <View
                style={[
                  styles.rankBadge,
                  { backgroundColor: theme.bg.tertiary },
                ]}
              >
                <Text
                  style={[
                    styles.rankText,
                    { color: theme.text.secondary },
                  ]}
                >
                  {entry.rank}
                </Text>
              </View>
            )}

            {entry.isTied && (
              <View style={styles.tiedBadge}>
                <Ionicons name="link" size={10} color={theme.podium.gold.secondary} />
              </View>
            )}
          </View>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {podiumGradientConfig ? (
              <LinearGradient
                colors={podiumGradientConfig.colors as unknown as readonly [string, string, ...string[]]}
                style={styles.avatar}
                start={podiumGradientConfig.start}
                end={podiumGradientConfig.end}
              >
                <Text style={styles.avatarTextPodium}>{initials}</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.avatar, styles.avatarDefault]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
          </View>

          {/* Member Info */}
          <View style={styles.memberInfo}>
            <Text
              style={[
                styles.memberName,
                { color: isDark ? '#ffffff' : '#1f2937' },
              ]}
              numberOfLines={1}
            >
              {entry.name}
            </Text>

            {entry.change !== undefined && (
              <View style={styles.changeContainer}>
                <Ionicons
                  name={getChangeIcon(entry.change)}
                  size={14}
                  color={getChangeColor(entry.change)}
                />
                <Text
                  style={[
                    styles.changeText,
                    { color: getChangeColor(entry.change) },
                  ]}
                >
                  {entry.change > 0 ? '+' : ''}
                  {entry.change}
                </Text>
              </View>
            )}
          </View>

          {/* Value with Count-up Animation */}
          <View style={styles.valueContainer}>
            <Ionicons
              name={getMetricIcon()}
              size={20}
              color={podiumGradientConfig ? theme.podium.gold.secondary : theme.brand.primary}
            />
            <AnimatedText
              // @ts-ignore - animatedProps is not in the type definition
              animatedProps={animatedTextProps}
              style={[
                styles.valueText,
                { color: theme.text.primary },
                podiumGradientConfig && styles.valueTextPodium,
              ]}
            />
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.text.tertiary}
          />
        </Pressable>
      </Animated.View>

      {/* Tooltip Modal */}
      <TooltipModal
        visible={showTooltip}
        entry={entry}
        metric={metric}
        isDark={isDark}
        onClose={() => setShowTooltip(false)}
      />
    </>
  );
}

// Tooltip Component
interface TooltipModalProps {
  visible: boolean;
  entry: LeaderboardEntry;
  metric: string;
  isDark: boolean;
  onClose: () => void;
}

function TooltipModal({
  visible,
  entry,
  metric,
  isDark,
  onClose,
}: TooltipModalProps) {
  if (!visible) return null;

  const theme = isDark ? darkTheme : lightTheme;

  const getChangeText = () => {
    if (!entry.change) return 'No change';
    const direction = entry.change > 0 ? 'up' : 'down';
    return `${Math.abs(entry.change)} ${direction} from last period`;
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.tooltipOverlay} onPress={onClose}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />

        <Animated.View
          entering={FadeInDown.duration(200)}
          style={[
            styles.tooltip,
            { backgroundColor: theme.bg.secondary },
            elevation.xl,
          ]}
        >
          <View style={styles.tooltipHeader}>
            <Text
              style={[
                styles.tooltipTitle,
                { color: theme.text.primary },
              ]}
            >
              {entry.name}
            </Text>
            <View
              style={[
                styles.tooltipRank,
                { backgroundColor: theme.bg.tertiary },
              ]}
            >
              <Text
                style={[
                  styles.tooltipRankText,
                  { color: theme.text.secondary },
                ]}
              >
                Rank #{entry.rank}
              </Text>
            </View>
          </View>

          <View style={[styles.tooltipDivider, { backgroundColor: theme.border.primary }]} />

          <View style={styles.tooltipContent}>
            <View style={styles.tooltipRow}>
              <Text
                style={[
                  styles.tooltipLabel,
                  { color: theme.text.tertiary },
                ]}
              >
                Current {metric}:
              </Text>
              <Text
                style={[
                  styles.tooltipValue,
                  { color: theme.text.primary },
                ]}
              >
                {entry.value}
              </Text>
            </View>

            <View style={styles.tooltipRow}>
              <Text
                style={[
                  styles.tooltipLabel,
                  { color: theme.text.tertiary },
                ]}
              >
                Change:
              </Text>
              <Text
                style={[
                  styles.tooltipValue,
                  { color: entry.change && entry.change > 0 ? theme.semantic.success : theme.semantic.error },
                ]}
              >
                {getChangeText()}
              </Text>
            </View>

            {entry.isTied && (
              <View style={[styles.tiedNotice, { borderTopColor: theme.border.primary }]}>
                <Ionicons name="link" size={16} color={theme.podium.gold.secondary} />
                <Text
                  style={[
                    styles.tiedText,
                    { color: theme.text.secondary },
                  ]}
                >
                  Tied with other members
                </Text>
              </View>
            )}
          </View>

          <Pressable
            onPress={onClose}
            style={[styles.tooltipCloseButton, { backgroundColor: theme.brand.primary }]}
          >
            <Text style={[styles.tooltipCloseText, { color: theme.text.inverse }]}>Got it</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
    marginBottom: spacing.sm,
    borderRadius: radius.base,
    gap: spacing.md,
    ...elevation.sm,
    overflow: 'hidden',
  },
  podiumCard: {
    ...elevation.lg,
  },
  podiumGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  rankContainer: {
    position: 'relative',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rankTextPodium: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tiedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fffbeb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  avatarContainer: {},
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarDefault: {
    backgroundColor: '#3b82f6',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatarTextPodium: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
    gap: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valueText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  valueTextPodium: {
    color: '#f59e0b',
  },
  tooltipOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  tooltip: {
    width: '85%',
    maxWidth: 400,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  tooltipHeader: {
    marginBottom: spacing.base,
  },
  tooltipTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  tooltipRank: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  tooltipRankText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  tooltipDivider: {
    height: 1,
    marginBottom: spacing.base,
  },
  tooltipContent: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  tooltipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tooltipLabel: {
    fontSize: typography.fontSize.base,
  },
  tooltipValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  tiedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  tiedText: {
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
  },
  tooltipCloseButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  tooltipCloseText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});
