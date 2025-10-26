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

  const getPodiumGradient = (rank: number) => {
    switch (rank) {
      case 1:
        return ['#fbbf24', '#f59e0b'] as const; // Gold
      case 2:
        return ['#d1d5db', '#9ca3af'] as const; // Silver
      case 3:
        return ['#cd7f32', '#92400e'] as const; // Bronze
      default:
        return null;
    }
  };

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
    if (!change) return isDark ? '#9ca3af' : '#6b7280';
    return change > 0 ? '#10b981' : '#ef4444';
  };

  const getChangeIcon = (change?: number) => {
    if (!change) return 'remove';
    return change > 0 ? 'trending-up' : 'trending-down';
  };

  const podiumGradient = getPodiumGradient(entry.rank);
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
            { backgroundColor: isDark ? '#1f2937' : '#ffffff' },
            podiumGradient && styles.podiumCard,
          ]}
        >
          {podiumGradient && (
            <LinearGradient
              colors={podiumGradient as unknown as readonly [string, string, ...string[]]}
              style={styles.podiumGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          )}

          {/* Rank Badge */}
          <View style={styles.rankContainer}>
            {podiumGradient ? (
              <LinearGradient
                colors={podiumGradient as unknown as readonly [string, string, ...string[]]}
                style={styles.rankBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.rankTextPodium}>{entry.rank}</Text>
              </LinearGradient>
            ) : (
              <View
                style={[
                  styles.rankBadge,
                  { backgroundColor: isDark ? '#374151' : '#f3f4f6' },
                ]}
              >
                <Text
                  style={[
                    styles.rankText,
                    { color: isDark ? '#d1d5db' : '#4b5563' },
                  ]}
                >
                  {entry.rank}
                </Text>
              </View>
            )}

            {entry.isTied && (
              <View style={styles.tiedBadge}>
                <Ionicons name="link" size={10} color="#f59e0b" />
              </View>
            )}
          </View>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {podiumGradient ? (
              <LinearGradient
                colors={podiumGradient as unknown as readonly [string, string, ...string[]]}
                style={styles.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
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
              color={podiumGradient ? '#f59e0b' : '#3b82f6'}
            />
            <AnimatedText
              // @ts-ignore - animatedProps is not in the type definition
              animatedProps={animatedTextProps}
              style={[
                styles.valueText,
                { color: isDark ? '#ffffff' : '#1f2937' },
                podiumGradient && styles.valueTextPodium,
              ]}
            />
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? '#6b7280' : '#9ca3af'}
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
            { backgroundColor: isDark ? '#1f2937' : '#ffffff' },
          ]}
        >
          <View style={styles.tooltipHeader}>
            <Text
              style={[
                styles.tooltipTitle,
                { color: isDark ? '#ffffff' : '#1f2937' },
              ]}
            >
              {entry.name}
            </Text>
            <View
              style={[
                styles.tooltipRank,
                { backgroundColor: isDark ? '#374151' : '#f3f4f6' },
              ]}
            >
              <Text
                style={[
                  styles.tooltipRankText,
                  { color: isDark ? '#d1d5db' : '#4b5563' },
                ]}
              >
                Rank #{entry.rank}
              </Text>
            </View>
          </View>

          <View style={styles.tooltipDivider} />

          <View style={styles.tooltipContent}>
            <View style={styles.tooltipRow}>
              <Text
                style={[
                  styles.tooltipLabel,
                  { color: isDark ? '#9ca3af' : '#6b7280' },
                ]}
              >
                Current {metric}:
              </Text>
              <Text
                style={[
                  styles.tooltipValue,
                  { color: isDark ? '#ffffff' : '#1f2937' },
                ]}
              >
                {entry.value}
              </Text>
            </View>

            <View style={styles.tooltipRow}>
              <Text
                style={[
                  styles.tooltipLabel,
                  { color: isDark ? '#9ca3af' : '#6b7280' },
                ]}
              >
                Change:
              </Text>
              <Text
                style={[
                  styles.tooltipValue,
                  { color: entry.change && entry.change > 0 ? '#10b981' : '#ef4444' },
                ]}
              >
                {getChangeText()}
              </Text>
            </View>

            {entry.isTied && (
              <View style={styles.tiedNotice}>
                <Ionicons name="link" size={16} color="#f59e0b" />
                <Text
                  style={[
                    styles.tiedText,
                    { color: isDark ? '#d1d5db' : '#4b5563' },
                  ]}
                >
                  Tied with other members
                </Text>
              </View>
            )}
          </View>

          <Pressable
            onPress={onClose}
            style={styles.tooltipCloseButton}
          >
            <Text style={styles.tooltipCloseText}>Got it</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  podiumCard: {
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
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
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  tooltipHeader: {
    marginBottom: 16,
  },
  tooltipTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tooltipRank: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tooltipRankText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tooltipDivider: {
    height: 1,
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    marginBottom: 16,
  },
  tooltipContent: {
    gap: 12,
    marginBottom: 20,
  },
  tooltipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tooltipLabel: {
    fontSize: 15,
  },
  tooltipValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  tiedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(156, 163, 175, 0.2)',
  },
  tiedText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  tooltipCloseButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  tooltipCloseText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
