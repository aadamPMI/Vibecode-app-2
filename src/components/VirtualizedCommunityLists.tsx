import React from 'react';
import { View, Text, Pressable, useColorScheme } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../state/communityStore';
import { cn } from '../utils/cn';

interface VirtualizedPostListProps {
  posts: Post[];
  currentUserId: string;
  isDark: boolean;
  onLikePost: (postId: string) => void;
}

export function VirtualizedPostList({
  posts,
  currentUserId,
  isDark,
  onLikePost,
}: VirtualizedPostListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View
      className={cn(
        'mb-4 rounded-xl p-4 mx-4',
        isDark ? 'bg-[#1a1a1a]' : 'bg-white'
      )}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center mb-3">
        <View
          className={cn(
            'w-10 h-10 rounded-full items-center justify-center',
            isDark ? 'bg-blue-600' : 'bg-blue-500'
          )}
        >
          <Text className="text-white font-bold text-lg">
            {item.userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="ml-3 flex-1">
          <Text
            className={cn(
              'font-semibold',
              isDark ? 'text-white' : 'text-gray-900'
            )}
          >
            {item.userName}
          </Text>
          <Text
            className={cn(
              'text-xs',
              isDark ? 'text-gray-500' : 'text-gray-500'
            )}
          >
            {formatDate(item.date)}
          </Text>
        </View>
      </View>

      <Text
        className={cn(
          'text-base mb-3',
          isDark ? 'text-gray-300' : 'text-gray-800'
        )}
      >
        {item.content}
      </Text>

      <View className="flex-row pt-3 border-t border-gray-700">
        <Pressable
          onPress={() => onLikePost(item.id)}
          className="flex-row items-center mr-4"
        >
          <Ionicons
            name={
              item.likes.includes(currentUserId)
                ? 'heart'
                : 'heart-outline'
            }
            size={20}
            color={
              item.likes.includes(currentUserId)
                ? '#ef4444'
                : isDark
                ? '#9ca3af'
                : '#6b7280'
            }
          />
          <Text
            className={cn(
              'ml-1 text-sm',
              isDark ? 'text-gray-400' : 'text-gray-600'
            )}
          >
            {item.likes.length}
          </Text>
        </Pressable>
        <View className="flex-row items-center">
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={isDark ? '#9ca3af' : '#6b7280'}
          />
          <Text
            className={cn(
              'ml-1 text-sm',
              isDark ? 'text-gray-400' : 'text-gray-600'
            )}
          >
            {item.comments.length}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <FlashList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
    />
  );
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  value: number;
  rank: number;
}

interface VirtualizedLeaderboardProps {
  data: LeaderboardEntry[];
  isDark: boolean;
  pageSize?: number;
}

export function VirtualizedLeaderboard({
  data,
  isDark,
  pageSize = 25,
}: VirtualizedLeaderboardProps) {
  const [displayedData, setDisplayedData] = React.useState<LeaderboardEntry[]>(
    data.slice(0, pageSize)
  );
  const [hasMore, setHasMore] = React.useState(data.length > pageSize);

  React.useEffect(() => {
    setDisplayedData(data.slice(0, pageSize));
    setHasMore(data.length > pageSize);
  }, [data, pageSize]);

  const loadMore = () => {
    const currentLength = displayedData.length;
    const nextData = data.slice(0, currentLength + pageSize);
    setDisplayedData(nextData);
    setHasMore(nextData.length < data.length);
  };

  const renderLeaderboardEntry = ({ item }: { item: LeaderboardEntry }) => (
    <View
      className={cn(
        'flex-row items-center px-4 py-3 mb-2 mx-4 rounded-lg',
        isDark ? 'bg-[#1a1a1a]' : 'bg-white'
      )}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View
        className={cn(
          'w-8 h-8 rounded-full items-center justify-center',
          item.rank === 1
            ? 'bg-yellow-500'
            : item.rank === 2
            ? 'bg-gray-400'
            : item.rank === 3
            ? 'bg-orange-600'
            : isDark
            ? 'bg-[#2a2a2a]'
            : 'bg-gray-200'
        )}
      >
        <Text
          className={cn(
            'font-bold text-sm',
            item.rank <= 3 ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-600'
          )}
        >
          {item.rank}
        </Text>
      </View>
      <Text
        className={cn(
          'flex-1 ml-3 font-medium',
          isDark ? 'text-white' : 'text-gray-900'
        )}
      >
        {item.userName}
      </Text>
      <Text
        className={cn(
          'font-bold',
          isDark ? 'text-blue-400' : 'text-blue-600'
        )}
      >
        {item.value.toLocaleString()}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;

    return (
      <Pressable
        onPress={loadMore}
        className={cn(
          'mx-4 my-4 py-3 rounded-lg items-center',
          isDark ? 'bg-blue-600' : 'bg-blue-500'
        )}
      >
        <Text className="text-white font-semibold">Load More</Text>
      </Pressable>
    );
  };

  return (
    <FlashList
      data={displayedData}
      renderItem={renderLeaderboardEntry}
      keyExtractor={(item) => item.userId}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
      ListFooterComponent={renderFooter}
    />
  );
}

interface VirtualizedMemberListProps {
  members: string[];
  isDark: boolean;
}

export function VirtualizedMemberList({
  members,
  isDark,
}: VirtualizedMemberListProps) {
  const renderMember = ({ item }: { item: string }) => (
    <View
      className={cn(
        'flex-row items-center px-4 py-3 mb-2 mx-4 rounded-lg',
        isDark ? 'bg-[#1a1a1a]' : 'bg-white'
      )}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View
        className={cn(
          'w-10 h-10 rounded-full items-center justify-center',
          isDark ? 'bg-blue-600' : 'bg-blue-500'
        )}
      >
        <Text className="text-white font-bold text-lg">
          {item.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text
        className={cn(
          'ml-3 font-medium',
          isDark ? 'text-white' : 'text-gray-900'
        )}
      >
        {item}
      </Text>
    </View>
  );

  return (
    <FlashList
      data={members}
      renderItem={renderMember}
      keyExtractor={(item, index) => `${item}-${index}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
    />
  );
}
