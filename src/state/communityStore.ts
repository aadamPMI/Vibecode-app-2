import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  date: string;
  likes: string[];
  comments: {
    id: string;
    userId: string;
    userName: string;
    content: string;
    date: string;
  }[];
  workoutData?: {
    exercises: number;
    duration: number;
  };
}

export interface Community {
  id: string;
  name: string;
  description: string;
  members: string[];
  createdBy: string;
  createdAt: string;
  posts: Post[];
}

interface CommunityStore {
  communities: Community[];
  currentUserId: string;
  currentUserName: string;
  createCommunity: (community: Community) => void;
  joinCommunity: (communityId: string, userId: string) => void;
  leaveCommunity: (communityId: string, userId: string) => void;
  addPost: (communityId: string, post: Post) => void;
  likePost: (communityId: string, postId: string, userId: string) => void;
  addComment: (communityId: string, postId: string, comment: Post["comments"][0]) => void;
  setCurrentUser: (userId: string, userName: string) => void;
}

export const useCommunityStore = create<CommunityStore>()(
  persist(
    (set) => ({
      communities: [],
      currentUserId: "user-1",
      currentUserName: "You",
      createCommunity: (community) =>
        set((state) => ({ communities: [community, ...state.communities] })),
      joinCommunity: (communityId, userId) =>
        set((state) => ({
          communities: state.communities.map((c) =>
            c.id === communityId
              ? { ...c, members: [...c.members, userId] }
              : c
          ),
        })),
      leaveCommunity: (communityId, userId) =>
        set((state) => ({
          communities: state.communities.map((c) =>
            c.id === communityId
              ? { ...c, members: c.members.filter((m) => m !== userId) }
              : c
          ),
        })),
      addPost: (communityId, post) =>
        set((state) => ({
          communities: state.communities.map((c) =>
            c.id === communityId ? { ...c, posts: [post, ...c.posts] } : c
          ),
        })),
      likePost: (communityId, postId, userId) =>
        set((state) => ({
          communities: state.communities.map((c) =>
            c.id === communityId
              ? {
                  ...c,
                  posts: c.posts.map((p) =>
                    p.id === postId
                      ? {
                          ...p,
                          likes: p.likes.includes(userId)
                            ? p.likes.filter((l) => l !== userId)
                            : [...p.likes, userId],
                        }
                      : p
                  ),
                }
              : c
          ),
        })),
      addComment: (communityId, postId, comment) =>
        set((state) => ({
          communities: state.communities.map((c) =>
            c.id === communityId
              ? {
                  ...c,
                  posts: c.posts.map((p) =>
                    p.id === postId
                      ? { ...p, comments: [...p.comments, comment] }
                      : p
                  ),
                }
              : c
          ),
        })),
      setCurrentUser: (userId, userName) =>
        set({ currentUserId: userId, currentUserName: userName }),
    }),
    {
      name: "community-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
