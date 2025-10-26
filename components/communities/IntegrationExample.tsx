// Communities Screen - Enhanced with full UX features
// This is a reference implementation showing how to integrate:
// - Loading states (skeletons)
// - Success animations (confetti, pulse glow, badge pop)
// - Toast notifications
// - Empty/Error states
// - Pull-to-refresh
// - Haptic feedback

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Import all UX components
import {
  CommunityCardSkeleton,
  MemberCardSkeleton,
  LeaderboardCardSkeleton,
  HeaderStatsSkeleton,
} from './SkeletonLoader';
import {
  ConfettiBurst,
  PulseGlow,
  BadgePop,
} from './SuccessAnimations';
import { useToast } from './Toast';
import {
  EmptyState,
  ErrorState,
  CommunityEmptyStates,
  CommunityErrorStates,
} from './EmptyErrorStates';
import {
  hapticLight,
  hapticMedium,
  hapticSuccess,
  hapticError,
} from '../../src/utils/haptics';

// Example usage in a Communities List Screen
export function CommunitiesListExample() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { showToast } = useToast();

  // State management
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBadgePop, setShowBadgePop] = useState(false);
  const [newRank, setNewRank] = useState<number | null>(null);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    hapticLight();

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Load communities...
      showToast('Communities refreshed!', 'success');
      hapticSuccess();
    } catch (err) {
      showToast('Failed to refresh', 'error');
      hapticError();
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Create Community with Success Animation
  const handleCreateCommunity = async () => {
    hapticMedium();

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success! Show confetti
      setShowConfetti(true);
      hapticSuccess();
      showToast('Community created successfully!', 'success');

      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      hapticError();
      showToast('Failed to create community', 'error');
    }
  };

  // Join Community with Pulse Glow
  const handleJoinCommunity = async (communityId: string) => {
    hapticMedium();

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      showToast('Joined community!', 'success');
      hapticSuccess();

      // Trigger pulse glow on the joined button (in actual implementation)
    } catch (err) {
      hapticError();
      showToast('Failed to join community', 'error');
    }
  };

  // Leave Community
  const handleLeaveCommunity = async (communityId: string) => {
    hapticLight();

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      showToast('Left community', 'info');
    } catch (err) {
      hapticError();
      showToast('Failed to leave community', 'error');
    }
  };

  // Copy Invite Code
  const handleCopyInviteCode = (code: string) => {
    hapticLight();
    // Copy to clipboard logic here
    showToast('Invite code copied!', 'success');
  };

  // Join Request Actions
  const handleRequestSent = () => {
    hapticMedium();
    showToast('Join request sent!', 'success');
  };

  const handleRequestAccepted = () => {
    hapticSuccess();
    showToast('Request accepted! Welcome to the community', 'success');
  };

  const handleRequestDeclined = () => {
    hapticLight();
    showToast('Request declined', 'warning');
  };

  // Invalid Code
  const handleInvalidCode = () => {
    hapticError();
    showToast('Invalid invite code', 'error');
  };

  // Rank Change with Badge Pop
  const handleRankChange = (newRank: number) => {
    setNewRank(newRank);
    setShowBadgePop(true);
    hapticSuccess();
    showToast(`Congratulations! You're now rank #${newRank}`, 'success');

    setTimeout(() => setShowBadgePop(false), 3000);
  };

  // Render Loading State
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#0a0a0a]">
        <ScrollView className="flex-1 px-4 pt-4">
          <HeaderStatsSkeleton />
          <CommunityCardSkeleton />
          <CommunityCardSkeleton />
          <CommunityCardSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render Error State
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#0a0a0a]">
        <CommunityErrorStates.LoadFailed
          isDark={isDark}
          onRetry={() => {
            setError(null);
            setLoading(true);
            // Retry loading...
          }}
        />
      </SafeAreaView>
    );
  }

  // Render Empty State
  if (communities.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#0a0a0a]">
        <CommunityEmptyStates.NoCommunities
          isDark={isDark}
          onAction={handleCreateCommunity}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Confetti Animation */}
      {showConfetti && <ConfettiBurst onComplete={() => setShowConfetti(false)} />}

      {/* Badge Pop Animation */}
      {showBadgePop && newRank && (
        <View style={{ position: 'absolute', top: '40%', alignSelf: 'center', zIndex: 9999 }}>
          <BadgePop
            rank={newRank}
            color="#f59e0b"
            onComplete={() => setShowBadgePop(false)}
          />
        </View>
      )}

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#3b82f6' : '#8b5cf6'}
            colors={['#3b82f6', '#8b5cf6']}
          />
        }
      >
        {/* Header Stats */}
        <View className="px-4 pt-4 mb-4">
          <View className="flex-row justify-around py-4 bg-white dark:bg-gray-800 rounded-xl">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                12
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Communities
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                1.2k
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Members
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                #5
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Your Rank
              </Text>
            </View>
          </View>
        </View>

        {/* Community Cards with Pulse Glow Example */}
        {communities.map((community, index) => (
          <Animated.View
            key={community.id}
            entering={FadeInDown.delay(index * 100).duration(400)}
            className="px-4 mb-3"
          >
            <PulseGlow color="#10b981">
              <View className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  {community.name}
                </Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {community.description}
                </Text>

                <View className="flex-row mt-3 gap-2">
                  <Pressable
                    onPress={() => handleJoinCommunity(community.id)}
                    className="flex-1 bg-blue-500 rounded-lg py-2 items-center"
                  >
                    <Text className="text-white font-semibold">Join</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleCopyInviteCode(community.inviteCode)}
                    className="px-4 bg-gray-200 dark:bg-gray-700 rounded-lg py-2 items-center"
                  >
                    <Ionicons name="copy-outline" size={20} color={isDark ? '#fff' : '#000'} />
                  </Pressable>
                </View>
              </View>
            </PulseGlow>
          </Animated.View>
        ))}

        {/* Example Button to Trigger Rank Change */}
        <View className="px-4 mt-4 mb-8">
          <Pressable
            onPress={() => handleRankChange(3)}
            className="bg-purple-500 rounded-xl py-4 items-center"
          >
            <Text className="text-white font-bold text-lg">
              Simulate Rank Change (Demo)
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Example: Members Tab with Loading States
export function MembersTabExample() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const isDark = useColorScheme() === 'dark';

  if (loading) {
    return (
      <View className="flex-1 px-4 pt-4">
        <MemberCardSkeleton />
        <MemberCardSkeleton />
        <MemberCardSkeleton />
      </View>
    );
  }

  if (members.length === 0) {
    return <CommunityEmptyStates.NoMembers isDark={isDark} />;
  }

  return (
    <ScrollView className="flex-1 px-4 pt-4">
      {/* Members list */}
    </ScrollView>
  );
}

// Example: Leaderboard Tab with Loading States
export function LeaderboardTabExample() {
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState<any[]>([]);
  const isDark = useColorScheme() === 'dark';

  if (loading) {
    return (
      <View className="flex-1 px-4 pt-4">
        <LeaderboardCardSkeleton rank={1} />
        <LeaderboardCardSkeleton rank={2} />
        <LeaderboardCardSkeleton rank={3} />
      </View>
    );
  }

  if (rankings.length === 0) {
    return <CommunityEmptyStates.NoLeaderboard isDark={isDark} />;
  }

  return (
    <ScrollView className="flex-1 px-4 pt-4">
      {/* Leaderboard list */}
    </ScrollView>
  );
}
