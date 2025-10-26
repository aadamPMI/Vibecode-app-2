import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  isDark?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  isDark = false,
}: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={styles.container}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)' },
        ]}
      >
        <LinearGradient
          colors={['#3b82f6', '#8b5cf6'] as unknown as readonly [string, string, ...string[]]}
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={icon} size={48} color="white" />
        </LinearGradient>
      </View>

      <Text
        style={[
          styles.title,
          { color: isDark ? '#ffffff' : '#1f2937' },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.description,
          { color: isDark ? '#9ca3af' : '#6b7280' },
        ]}
      >
        {description}
      </Text>

      {actionLabel && onAction && (
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Pressable onPress={onAction} style={styles.actionButton}>
            <LinearGradient
              colors={['#3b82f6', '#8b5cf6'] as unknown as readonly [string, string, ...string[]]}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text style={styles.actionText}>{actionLabel}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
  );
}

interface ErrorStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  isDark?: boolean;
}

export function ErrorState({
  icon = 'alert-circle',
  title,
  description,
  actionLabel = 'Try Again',
  onAction,
  isDark = false,
}: ErrorStateProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={styles.container}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)' },
        ]}
      >
        <LinearGradient
          colors={['#ef4444', '#dc2626'] as unknown as readonly [string, string, ...string[]]}
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={icon} size={48} color="white" />
        </LinearGradient>
      </View>

      <Text
        style={[
          styles.title,
          { color: isDark ? '#ffffff' : '#1f2937' },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.description,
          { color: isDark ? '#9ca3af' : '#6b7280' },
        ]}
      >
        {description}
      </Text>

      {onAction && (
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Pressable onPress={onAction} style={styles.actionButton}>
            <LinearGradient
              colors={['#ef4444', '#dc2626'] as unknown as readonly [string, string, ...string[]]}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.actionText}>{actionLabel}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// Specific empty states for each tab
export const CommunityEmptyStates = {
  NoCommunities: ({ isDark, onAction }: { isDark?: boolean; onAction?: () => void }) => (
    <EmptyState
      icon="people-outline"
      title="No Communities Yet"
      description="Create or join a community to start sharing your fitness journey with others!"
      actionLabel="Create Community"
      onAction={onAction}
      isDark={isDark}
    />
  ),

  NoMembers: ({ isDark }: { isDark?: boolean }) => (
    <EmptyState
      icon="person-add-outline"
      title="No Members Yet"
      description="Be the first to join this community and start the journey together!"
      isDark={isDark}
    />
  ),

  NoLeaderboard: ({ isDark }: { isDark?: boolean }) => (
    <EmptyState
      icon="trophy-outline"
      title="No Rankings Yet"
      description="Complete workouts to earn points and climb the leaderboard!"
      isDark={isDark}
    />
  ),

  SearchNoResults: ({ isDark }: { isDark?: boolean }) => (
    <EmptyState
      icon="search-outline"
      title="No Results Found"
      description="Try adjusting your search or create a new community!"
      isDark={isDark}
    />
  ),
};

// Specific error states
export const CommunityErrorStates = {
  LoadFailed: ({ isDark, onRetry }: { isDark?: boolean; onRetry?: () => void }) => (
    <ErrorState
      icon="cloud-offline"
      title="Failed to Load"
      description="We couldn't load the data. Please check your connection and try again."
      actionLabel="Retry"
      onAction={onRetry}
      isDark={isDark}
    />
  ),

  JoinFailed: ({ isDark, onRetry }: { isDark?: boolean; onRetry?: () => void }) => (
    <ErrorState
      icon="close-circle"
      title="Failed to Join"
      description="Something went wrong while joining the community. Please try again."
      actionLabel="Try Again"
      onAction={onRetry}
      isDark={isDark}
    />
  ),

  InvalidCode: ({ isDark }: { isDark?: boolean }) => (
    <ErrorState
      icon="key-outline"
      title="Invalid Invite Code"
      description="The invite code you entered is invalid or has expired. Please check and try again."
      isDark={isDark}
    />
  ),

  NetworkError: ({ isDark, onRetry }: { isDark?: boolean; onRetry?: () => void }) => (
    <ErrorState
      icon="wifi-outline"
      title="Connection Error"
      description="Unable to connect to the server. Please check your internet connection."
      actionLabel="Retry"
      onAction={onRetry}
      isDark={isDark}
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
