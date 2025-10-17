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
  type?: "workout" | "pr" | "meal" | "nutrition_summary" | "streak" | "regular";
  workoutData?: {
    workoutName: string;
    exercises: number;
    sets: number;
    totalVolume: number;
    duration: number;
  };
  prData?: {
    exercise: string;
    newWeight: number;
    previousWeight: number;
    unit: string;
  };
  mealData?: {
    mealName?: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    imageUrl?: string;
  };
  nutritionSummaryData?: {
    totalCalories: number;
    calorieGoal: number;
    protein: number;
    carbs: number;
    fats: number;
    percentageAchieved: number;
  };
  streakData?: {
    type: "workout" | "nutrition";
    days: number;
  };
}

export interface Challenge {
  id: string;
  type: "pb" | "calorie_streak" | "workout_streak" | "custom";
  title: string;
  description: string;
  targetValue?: number;
  targetDays?: number;
  createdBy: string;
  createdAt: string;
  participants: {
    userId: string;
    progress: number;
    completed: boolean;
  }[];
}

export interface Community {
  id: string;
  name: string;
  description: string;
  members: string[];
  admins: string[]; // Admin user IDs
  createdBy: string;
  createdAt: string;
  posts: Post[];
  joinCode?: string; // Private join code
  isPrivate: boolean;
  challenges: Challenge[];
}

interface CommunityStore {
  communities: Community[];
  currentUserId: string;
  currentUserName: string;
  createCommunity: (community: Community) => void;
  joinCommunity: (communityId: string, userId: string) => void;
  joinCommunityWithCode: (joinCode: string, userId: string) => boolean;
  leaveCommunity: (communityId: string, userId: string) => void;
  addPost: (communityId: string, post: Post) => void;
  likePost: (communityId: string, postId: string, userId: string) => void;
  addComment: (communityId: string, postId: string, comment: Post["comments"][0]) => void;
  setCurrentUser: (userId: string, userName: string) => void;
  shareWorkoutToAllCommunities: (workoutData: Post["workoutData"], userId: string, userName: string) => void;
  sharePRToAllCommunities: (prData: Post["prData"], userId: string, userName: string) => void;
  shareMealToAllCommunities: (mealData: Post["mealData"], userId: string, userName: string) => void;
  shareNutritionSummaryToAllCommunities: (summaryData: Post["nutritionSummaryData"], userId: string, userName: string) => void;
  addChallenge: (communityId: string, challenge: Challenge) => void;
  joinChallenge: (communityId: string, challengeId: string, userId: string) => void;
  updateChallengeProgress: (communityId: string, challengeId: string, userId: string, progress: number) => void;
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
      joinCommunityWithCode: (joinCode, userId) => {
        let success = false;
        set((state) => {
          const community = state.communities.find((c) => c.joinCode === joinCode);
          if (community && !community.members.includes(userId)) {
            success = true;
            return {
              communities: state.communities.map((c) =>
                c.joinCode === joinCode
                  ? { ...c, members: [...c.members, userId] }
                  : c
              ),
            };
          }
          return state;
        });
        return success;
      },
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
      
      shareWorkoutToAllCommunities: (workoutData, userId, userName) =>
        set((state) => {
          const post: Post = {
            id: Date.now().toString(),
            userId,
            userName,
            content: `Just crushed a ${workoutData?.workoutName}! 💪\n• ${workoutData?.exercises} exercises\n• ${workoutData?.sets} sets\n• ${workoutData?.totalVolume}kg total volume\n• ${workoutData?.duration} minutes`,
            date: new Date().toISOString(),
            likes: [],
            comments: [],
            type: "workout",
            workoutData,
          };
          
          return {
            communities: state.communities.map((c) =>
              c.members.includes(userId)
                ? { ...c, posts: [post, ...c.posts] }
                : c
            ),
          };
        }),
      
      sharePRToAllCommunities: (prData, userId, userName) =>
        set((state) => {
          const improvement = prData ? ((prData.newWeight - prData.previousWeight) / prData.previousWeight * 100).toFixed(1) : "0";
          const post: Post = {
            id: Date.now().toString(),
            userId,
            userName,
            content: `🏆 NEW PERSONAL RECORD!\n${prData?.exercise} - ${prData?.newWeight}${prData?.unit}\nPrevious: ${prData?.previousWeight}${prData?.unit}\nImprovement: +${improvement}%`,
            date: new Date().toISOString(),
            likes: [],
            comments: [],
            type: "pr",
            prData,
          };
          
          return {
            communities: state.communities.map((c) =>
              c.members.includes(userId)
                ? { ...c, posts: [post, ...c.posts] }
                : c
            ),
          };
        }),
      
      shareMealToAllCommunities: (mealData, userId, userName) =>
        set((state) => {
          const post: Post = {
            id: Date.now().toString(),
            userId,
            userName,
            content: `${mealData?.mealName || "Healthy meal"}! 🥗\n📊 Nutrition:\n• ${mealData?.calories} calories\n• Protein: ${mealData?.protein}g\n• Carbs: ${mealData?.carbs}g\n• Fats: ${mealData?.fats}g`,
            date: new Date().toISOString(),
            likes: [],
            comments: [],
            type: "meal",
            mealData,
          };
          
          return {
            communities: state.communities.map((c) =>
              c.members.includes(userId)
                ? { ...c, posts: [post, ...c.posts] }
                : c
            ),
          };
        }),
      
      shareNutritionSummaryToAllCommunities: (summaryData, userId, userName) =>
        set((state) => {
          const post: Post = {
            id: Date.now().toString(),
            userId,
            userName,
            content: `Hit my calorie goal today! 🎯\n• ${summaryData?.totalCalories} / ${summaryData?.calorieGoal} calories (${summaryData?.percentageAchieved}%)\n• Protein: ${summaryData?.protein}g\n• Carbs: ${summaryData?.carbs}g\n• Fats: ${summaryData?.fats}g`,
            date: new Date().toISOString(),
            likes: [],
            comments: [],
            type: "nutrition_summary",
            nutritionSummaryData: summaryData,
          };
          
          return {
            communities: state.communities.map((c) =>
              c.members.includes(userId)
                ? { ...c, posts: [post, ...c.posts] }
                : c
            ),
          };
        }),
      
      addChallenge: (communityId, challenge) =>
        set((state) => ({
          communities: state.communities.map((c) =>
            c.id === communityId
              ? { ...c, challenges: [...c.challenges, challenge] }
              : c
          ),
        })),
      
      joinChallenge: (communityId, challengeId, userId) =>
        set((state) => ({
          communities: state.communities.map((c) =>
            c.id === communityId
              ? {
                  ...c,
                  challenges: c.challenges.map((ch) =>
                    ch.id === challengeId
                      ? {
                          ...ch,
                          participants: [
                            ...ch.participants,
                            { userId, progress: 0, completed: false },
                          ],
                        }
                      : ch
                  ),
                }
              : c
          ),
        })),
      
      updateChallengeProgress: (communityId, challengeId, userId, progress) =>
        set((state) => ({
          communities: state.communities.map((c) =>
            c.id === communityId
              ? {
                  ...c,
                  challenges: c.challenges.map((ch) =>
                    ch.id === challengeId
                      ? {
                          ...ch,
                          participants: ch.participants.map((p) =>
                            p.userId === userId
                              ? { ...p, progress, completed: progress >= (ch.targetValue || ch.targetDays || 100) }
                              : p
                          ),
                        }
                      : ch
                  ),
                }
              : c
          ),
        })),
    }),
    {
      name: "community-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Migration: Ensure all communities have required fields
        if (state?.communities) {
          state.communities = state.communities.map((community) => ({
            ...community,
            admins: community.admins || [community.createdBy],
            isPrivate: community.isPrivate ?? false,
            challenges: community.challenges || [],
          }));
        }
      },
    }
  )
);
