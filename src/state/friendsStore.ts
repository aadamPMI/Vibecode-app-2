import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Friend {
  id: string;
  username: string;
  tag: string; // 4-digit tag like #1234
  fullUsername: string; // username#1234
  addedAt: string;
  // Profile info
  bio?: string;
  avatar?: string;
  // Visibility settings
  sharesWorkouts: boolean;
  sharesNutrition: boolean;
  sharesSplits: boolean;
}

export interface FriendRequest {
  id: string;
  from: Friend;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

interface FriendsState {
  friends: Friend[];
  friendRequests: FriendRequest[];
  currentUserTag: string;

  // Actions
  generateUserTag: () => string;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  sendFriendRequest: (username: string, tag: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  getFriend: (friendId: string) => Friend | undefined;
  searchFriendByUsername: (fullUsername: string) => Friend | undefined;
}

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set, get) => ({
      friends: [],
      friendRequests: [],
      currentUserTag: '',

      generateUserTag: () => {
        // Generate a random 4-digit tag
        const tag = Math.floor(1000 + Math.random() * 9000).toString();
        set({ currentUserTag: tag });
        return tag;
      },

      addFriend: (friend) =>
        set((state) => ({
          friends: [...state.friends, { ...friend, addedAt: new Date().toISOString() }],
        })),

      removeFriend: (friendId) =>
        set((state) => ({
          friends: state.friends.filter((f) => f.id !== friendId),
        })),

      sendFriendRequest: (username, tag) => {
        // In a real app, this would send a request to a backend
        // For now, we'll simulate it by creating a mock friend
        const mockFriend: Friend = {
          id: `friend-${Date.now()}`,
          username,
          tag,
          fullUsername: `${username}#${tag}`,
          addedAt: new Date().toISOString(),
          sharesWorkouts: true,
          sharesNutrition: true,
          sharesSplits: true,
        };

        // Simulate adding the friend directly (in real app, they'd need to accept)
        set((state) => ({
          friends: [...state.friends, mockFriend],
        }));
      },

      acceptFriendRequest: (requestId) =>
        set((state) => {
          const request = state.friendRequests.find((r) => r.id === requestId);
          if (!request) return state;

          return {
            friends: [...state.friends, request.from],
            friendRequests: state.friendRequests.filter((r) => r.id !== requestId),
          };
        }),

      rejectFriendRequest: (requestId) =>
        set((state) => ({
          friendRequests: state.friendRequests.filter((r) => r.id !== requestId),
        })),

      getFriend: (friendId) => {
        return get().friends.find((f) => f.id === friendId);
      },

      searchFriendByUsername: (fullUsername) => {
        return get().friends.find((f) => f.fullUsername === fullUsername);
      },
    }),
    {
      name: 'friends-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
