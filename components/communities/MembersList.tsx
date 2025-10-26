import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { hapticLight, hapticSelection } from '../../src/utils/haptics';

export interface Member {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  joinedDate: string;
  isOnline: boolean;
  stats?: {
    workouts: number;
    points: number;
    streak: number;
  };
}

interface MembersListProps {
  members: Member[];
  onMemberPress: (member: Member) => void;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  isDark?: boolean;
}

const ITEMS_PER_PAGE = 20;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

export function MembersList({
  members,
  onMemberPress,
  onLoadMore,
  isLoadingMore = false,
  hasMore = false,
  isDark = false,
}: MembersListProps) {
  const [showAlphaNav, setShowAlphaNav] = useState(false);
  const flatListRef = React.useRef<FlatList>(null);

  // Group members alphabetically
  const groupedMembers = useMemo(() => {
    const sorted = [...members].sort((a, b) => a.name.localeCompare(b.name));
    const grouped: { [key: string]: Member[] } = {};

    sorted.forEach((member) => {
      const firstLetter = member.name[0].toUpperCase();
      const key = /[A-Z]/.test(firstLetter) ? firstLetter : '#';

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(member);
    });

    return grouped;
  }, [members]);

  // Flatten for FlatList with section headers
  const flattenedData = useMemo(() => {
    const data: Array<{ type: 'header' | 'member'; letter?: string; member?: Member }> = [];

    Object.keys(groupedMembers)
      .sort()
      .forEach((letter) => {
        data.push({ type: 'header', letter });
        groupedMembers[letter].forEach((member) => {
          data.push({ type: 'member', member });
        });
      });

    return data;
  }, [groupedMembers]);

  // Get letter positions for jump navigation
  const letterPositions = useMemo(() => {
    const positions: { [key: string]: number } = {};
    flattenedData.forEach((item, index) => {
      if (item.type === 'header' && item.letter) {
        positions[item.letter] = index;
      }
    });
    return positions;
  }, [flattenedData]);

  const handleAlphaNavPress = useCallback(
    (letter: string) => {
      hapticSelection();
      const position = letterPositions[letter];

      if (position !== undefined && flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: position,
          animated: true,
          viewPosition: 0,
        });
      }
    },
    [letterPositions]
  );

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && onLoadMore) {
      onLoadMore();
    }
  }, [isLoadingMore, hasMore, onLoadMore]);

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      if (item.type === 'header') {
        return (
          <View
            style={[
              styles.sectionHeader,
              { backgroundColor: isDark ? '#111827' : '#f9fafb' },
            ]}
          >
            <Text
              style={[
                styles.sectionHeaderText,
                { color: isDark ? '#9ca3af' : '#6b7280' },
              ]}
            >
              {item.letter}
            </Text>
          </View>
        );
      }

      const member = item.member!;
      return (
        <MemberCard
          member={member}
          onPress={() => {
            hapticLight();
            onMemberPress(member);
          }}
          isDark={isDark}
          index={index}
        />
      );
    },
    [isDark, onMemberPress]
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={isDark ? '#3b82f6' : '#8b5cf6'} />
        <Text
          style={[
            styles.footerText,
            { color: isDark ? '#9ca3af' : '#6b7280' },
          ]}
        >
          Loading more...
        </Text>
      </View>
    );
  }, [isLoadingMore, isDark]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={flattenedData}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item.type === 'header' ? `header-${item.letter}` : `member-${item.member?.id}-${index}`
        }
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        onScrollBeginDrag={() => setShowAlphaNav(true)}
        onMomentumScrollEnd={() => {
          setTimeout(() => setShowAlphaNav(false), 2000);
        }}
      />

      {/* Alphabetic Jump Navigation */}
      {showAlphaNav && members.length > 20 && (
        <Animated.View
          entering={FadeInRight.duration(200)}
          style={[
            styles.alphaNav,
            { backgroundColor: isDark ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)' },
          ]}
        >
          {ALPHABET.map((letter) => {
            const hasMembers = letterPositions[letter] !== undefined;
            return (
              <Pressable
                key={letter}
                onPress={() => hasMembers && handleAlphaNavPress(letter)}
                style={styles.alphaNavItem}
                disabled={!hasMembers}
              >
                <Text
                  style={[
                    styles.alphaNavText,
                    {
                      color: hasMembers
                        ? '#3b82f6'
                        : isDark
                        ? '#4b5563'
                        : '#d1d5db',
                    },
                    hasMembers && styles.alphaNavTextActive,
                  ]}
                >
                  {letter}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}

interface MemberCardProps {
  member: Member;
  onPress: () => void;
  isDark: boolean;
  index: number;
}

function MemberCard({ member, onPress, isDark, index }: MemberCardProps) {
  const getRoleBadgeColor = (role: Member['role']) => {
    switch (role) {
      case 'owner':
        return { bg: '#fef3c7', text: '#92400e', icon: 'star' as const };
      case 'admin':
        return { bg: '#dbeafe', text: '#1e40af', icon: 'shield-checkmark' as const };
      default:
        return null;
    }
  };

  const roleBadge = getRoleBadgeColor(member.role);
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Animated.View entering={FadeInRight.delay(index * 30).duration(300)}>
      <Pressable
        onPress={onPress}
        style={[
          styles.memberCard,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' },
        ]}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {member.avatar ? (
            <View style={styles.avatar}>
              {/* Image would go here */}
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}

          {member.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        {/* Member Info */}
        <View style={styles.memberInfo}>
          <View style={styles.memberHeader}>
            <Text
              style={[
                styles.memberName,
                { color: isDark ? '#ffffff' : '#1f2937' },
              ]}
              numberOfLines={1}
            >
              {member.name}
            </Text>

            {roleBadge && (
              <View style={[styles.roleBadge, { backgroundColor: roleBadge.bg }]}>
                <Ionicons name={roleBadge.icon} size={12} color={roleBadge.text} />
                <Text style={[styles.roleBadgeText, { color: roleBadge.text }]}>
                  {member.role}
                </Text>
              </View>
            )}
          </View>

          <Text
            style={[
              styles.memberUsername,
              { color: isDark ? '#9ca3af' : '#6b7280' },
            ]}
            numberOfLines={1}
          >
            @{member.username}
          </Text>

          {member.stats && (
            <View style={styles.memberStats}>
              <View style={styles.statItem}>
                <Ionicons
                  name="barbell-outline"
                  size={14}
                  color={isDark ? '#9ca3af' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.statText,
                    { color: isDark ? '#9ca3af' : '#6b7280' },
                  ]}
                >
                  {member.stats.workouts}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons
                  name="trophy-outline"
                  size={14}
                  color={isDark ? '#9ca3af' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.statText,
                    { color: isDark ? '#9ca3af' : '#6b7280' },
                  ]}
                >
                  {member.stats.points}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Ionicons
                  name="flame-outline"
                  size={14}
                  color={isDark ? '#9ca3af' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.statText,
                    { color: isDark ? '#9ca3af' : '#6b7280' },
                  ]}
                >
                  {member.stats.streak}
                </Text>
              </View>
            </View>
          )}
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? '#6b7280' : '#9ca3af'}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.2)',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.1)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
  },
  avatarPlaceholder: {
    backgroundColor: '#8b5cf6',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  memberInfo: {
    flex: 1,
    gap: 4,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  memberUsername: {
    fontSize: 14,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  memberStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 14,
  },
  alphaNav: {
    position: 'absolute',
    right: 4,
    top: 0,
    bottom: 0,
    width: 24,
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  alphaNavItem: {
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alphaNavText: {
    fontSize: 10,
    fontWeight: '600',
  },
  alphaNavTextActive: {
    fontWeight: '800',
  },
});
