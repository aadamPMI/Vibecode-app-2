import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCommunityStore, Community, Post, Challenge } from '../state/communityStore';
import { useToastStore } from '../state/toastStore';

// Query Keys
export const communityKeys = {
  all: ['communities'] as const,
  lists: () => [...communityKeys.all, 'list'] as const,
  list: () => [...communityKeys.lists()] as const,
  detail: (id: string) => [...communityKeys.all, 'detail', id] as const,
  leaderboard: (communityId: string, metric: string, timeframe: string) =>
    [...communityKeys.all, 'leaderboard', communityId, metric, timeframe] as const,
};

// Hook to get all communities (cached)
export function useCommunities() {
  const communities = useCommunityStore((s) => s.communities);

  return useQuery({
    queryKey: communityKeys.list(),
    queryFn: () => communities,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get a single community (cached)
export function useCommunity(communityId: string) {
  const communities = useCommunityStore((s) => s.communities);

  return useQuery({
    queryKey: communityKeys.detail(communityId),
    queryFn: () => communities.find((c) => c.id === communityId),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for leaderboard with pagination
interface LeaderboardEntry {
  userId: string;
  userName: string;
  value: number;
  rank: number;
}

export function useLeaderboard(
  communityId: string,
  metric: 'workouts' | 'volume' | 'prs' | 'streak',
  timeframe: 'week' | 'month' | 'alltime',
  options?: {
    refetchInterval?: number;
    enabled?: boolean;
  }
) {
  const community = useCommunityStore((s) => s.communities.find((c) => c.id === communityId));

  return useQuery({
    queryKey: communityKeys.leaderboard(communityId, metric, timeframe),
    queryFn: () => {
      if (!community) return [];

      // Calculate leaderboard based on posts and stats
      const memberStats = new Map<string, { userName: string; value: number }>();

      community.posts.forEach((post) => {
        const existing = memberStats.get(post.userId) || { userName: post.userName, value: 0 };

        if (metric === 'workouts' && post.type === 'workout') {
          existing.value += 1;
        } else if (metric === 'volume' && post.type === 'workout' && post.workoutData) {
          existing.value += post.workoutData.totalVolume;
        } else if (metric === 'prs' && post.type === 'pr') {
          existing.value += 1;
        }

        memberStats.set(post.userId, existing);
      });

      // Convert to array and sort
      const leaderboard: LeaderboardEntry[] = Array.from(memberStats.entries())
        .map(([userId, data]) => ({
          userId,
          userName: data.userName,
          value: data.value,
          rank: 0,
        }))
        .sort((a, b) => b.value - a.value)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      return leaderboard;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled,
  });
}

// Mutation: Join Community with optimistic update
export function useJoinCommunity() {
  const queryClient = useQueryClient();
  const joinCommunity = useCommunityStore((s: any) => s.joinCommunity);
  const showToast = useToastStore((s: any) => s.showToast);

  return useMutation({
    mutationFn: async ({ communityId, userId }: { communityId: string; userId: string }) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      joinCommunity(communityId, userId);
      return { communityId, userId };
    },
    onMutate: async ({ communityId, userId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: communityKeys.list() });
      await queryClient.cancelQueries({ queryKey: communityKeys.detail(communityId) });

      // Snapshot previous value
      const previousCommunities = queryClient.getQueryData(communityKeys.list());
      const previousCommunity = queryClient.getQueryData(communityKeys.detail(communityId));

      // Optimistically update
      queryClient.setQueryData(communityKeys.list(), (old: Community[] | undefined) => {
        if (!old) return old;
        return old.map((c) =>
          c.id === communityId ? { ...c, members: [...c.members, userId] } : c
        );
      });

      queryClient.setQueryData(communityKeys.detail(communityId), (old: Community | undefined) => {
        if (!old) return old;
        return { ...old, members: [...old.members, userId] };
      });

      return { previousCommunities, previousCommunity };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCommunities) {
        queryClient.setQueryData(communityKeys.list(), context.previousCommunities);
      }
      if (context?.previousCommunity) {
        queryClient.setQueryData(
          communityKeys.detail(variables.communityId),
          context.previousCommunity
        );
      }
      showToast('Failed to join community. Please try again.', 'error');
    },
    onSuccess: () => {
      showToast('Successfully joined community!', 'success');
    },
    onSettled: (data) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: communityKeys.list() });
      if (data) {
        queryClient.invalidateQueries({ queryKey: communityKeys.detail(data.communityId) });
        queryClient.invalidateQueries({
          queryKey: communityKeys.leaderboard(data.communityId, '', '')
        });
      }
    },
  });
}

// Mutation: Leave Community with optimistic update
export function useLeaveCommunity() {
  const queryClient = useQueryClient();
  const leaveCommunity = useCommunityStore((s: any) => s.leaveCommunity);
  const showToast = useToastStore((s: any) => s.showToast);

  return useMutation({
    mutationFn: async ({ communityId, userId }: { communityId: string; userId: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      leaveCommunity(communityId, userId);
      return { communityId, userId };
    },
    onMutate: async ({ communityId, userId }) => {
      await queryClient.cancelQueries({ queryKey: communityKeys.list() });
      await queryClient.cancelQueries({ queryKey: communityKeys.detail(communityId) });

      const previousCommunities = queryClient.getQueryData(communityKeys.list());
      const previousCommunity = queryClient.getQueryData(communityKeys.detail(communityId));

      queryClient.setQueryData(communityKeys.list(), (old: Community[] | undefined) => {
        if (!old) return old;
        return old.map((c) =>
          c.id === communityId
            ? { ...c, members: c.members.filter((m) => m !== userId) }
            : c
        );
      });

      queryClient.setQueryData(communityKeys.detail(communityId), (old: Community | undefined) => {
        if (!old) return old;
        return { ...old, members: old.members.filter((m) => m !== userId) };
      });

      return { previousCommunities, previousCommunity };
    },
    onError: (err, variables, context) => {
      if (context?.previousCommunities) {
        queryClient.setQueryData(communityKeys.list(), context.previousCommunities);
      }
      if (context?.previousCommunity) {
        queryClient.setQueryData(
          communityKeys.detail(variables.communityId),
          context.previousCommunity
        );
      }
      showToast('Failed to leave community. Please try again.', 'error');
    },
    onSuccess: () => {
      showToast('Successfully left community.', 'success');
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.list() });
      if (data) {
        queryClient.invalidateQueries({ queryKey: communityKeys.detail(data.communityId) });
        queryClient.invalidateQueries({
          queryKey: communityKeys.leaderboard(data.communityId, '', '')
        });
      }
    },
  });
}

// Mutation: Like/Unlike Post with optimistic update
export function useLikePost() {
  const queryClient = useQueryClient();
  const likePost = useCommunityStore((s: any) => s.likePost);
  const showToast = useToastStore((s: any) => s.showToast);

  return useMutation({
    mutationFn: async ({
      communityId,
      postId,
      userId,
    }: {
      communityId: string;
      postId: string;
      userId: string;
    }) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      likePost(communityId, postId, userId);
      return { communityId, postId, userId };
    },
    onMutate: async ({ communityId, postId, userId }) => {
      await queryClient.cancelQueries({ queryKey: communityKeys.detail(communityId) });

      const previousCommunity = queryClient.getQueryData(communityKeys.detail(communityId));

      queryClient.setQueryData(communityKeys.detail(communityId), (old: Community | undefined) => {
        if (!old) return old;
        return {
          ...old,
          posts: old.posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likes: p.likes.includes(userId)
                    ? p.likes.filter((l) => l !== userId)
                    : [...p.likes, userId],
                }
              : p
          ),
        };
      });

      return { previousCommunity };
    },
    onError: (err, variables, context) => {
      if (context?.previousCommunity) {
        queryClient.setQueryData(
          communityKeys.detail(variables.communityId),
          context.previousCommunity
        );
      }
      showToast('Failed to update like. Please try again.', 'error');
    },
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: communityKeys.detail(data.communityId) });
      }
    },
  });
}

// Mutation: Add Comment with optimistic update
export function useAddComment() {
  const queryClient = useQueryClient();
  const addComment = useCommunityStore((s: any) => s.addComment);
  const showToast = useToastStore((s: any) => s.showToast);

  return useMutation({
    mutationFn: async ({
      communityId,
      postId,
      comment,
    }: {
      communityId: string;
      postId: string;
      comment: Post['comments'][0];
    }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      addComment(communityId, postId, comment);
      return { communityId, postId, comment };
    },
    onMutate: async ({ communityId, postId, comment }) => {
      await queryClient.cancelQueries({ queryKey: communityKeys.detail(communityId) });

      const previousCommunity = queryClient.getQueryData(communityKeys.detail(communityId));

      queryClient.setQueryData(communityKeys.detail(communityId), (old: Community | undefined) => {
        if (!old) return old;
        return {
          ...old,
          posts: old.posts.map((p) =>
            p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
          ),
        };
      });

      return { previousCommunity };
    },
    onError: (err, variables, context) => {
      if (context?.previousCommunity) {
        queryClient.setQueryData(
          communityKeys.detail(variables.communityId),
          context.previousCommunity
        );
      }
      showToast('Failed to add comment. Please try again.', 'error');
    },
    onSuccess: () => {
      showToast('Comment added!', 'success');
    },
    onSettled: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: communityKeys.detail(data.communityId) });
      }
    },
  });
}
