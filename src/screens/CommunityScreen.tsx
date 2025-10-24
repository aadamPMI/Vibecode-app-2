import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeOutUp,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  useCommunityStore,
  Community,
  Post,
  Challenge,
} from "../state/communityStore";
import { useFriendsStore } from "../state/friendsStore";
import { useSettingsStore } from "../state/settingsStore";
import { cn } from "../utils/cn";

export default function CommunityScreen({ navigation, route }: any) {
  const theme = useSettingsStore((s) => s.theme);
  const communities = useCommunityStore((s) => s.communities);
  const createCommunity = useCommunityStore((s) => s.createCommunity);
  const joinCommunity = useCommunityStore((s) => s.joinCommunity);
  const joinCommunityWithCode = useCommunityStore((s) => s.joinCommunityWithCode);
  const leaveCommunity = useCommunityStore((s) => s.leaveCommunity);
  const addPost = useCommunityStore((s) => s.addPost);
  const likePost = useCommunityStore((s) => s.likePost);
  const addChallenge = useCommunityStore((s) => s.addChallenge);
  const joinChallenge = useCommunityStore((s) => s.joinChallenge);
  const currentUserId = useCommunityStore((s) => s.currentUserId);
  const currentUserName = useCommunityStore((s) => s.currentUserName);

  // Friends store
  const friends = useFriendsStore((s) => s.friends);
  const currentUserTag = useFriendsStore((s) => s.currentUserTag);
  const generateUserTag = useFriendsStore((s) => s.generateUserTag);

  // Generate user tag if not exists
  useEffect(() => {
    if (!currentUserTag) {
      generateUserTag();
    }
  }, [currentUserTag, generateUserTag]);

  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === "system" ? (systemColorScheme || "light") : theme;
  const isDark = resolvedTheme === "dark";
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isJoinPrivateModalVisible, setIsJoinPrivateModalVisible] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null
  );
  const [isCreatePostModalVisible, setIsCreatePostModalVisible] =
    useState(false);
  const [activeView, setActiveView] = useState<"my" | "discover" | "friends" | null>(null);
  const [isFriendsListVisible, setIsFriendsListVisible] = useState(false);
  const [isCommunityDetailVisible, setIsCommunityDetailVisible] = useState(false);
  const [detailCommunity, setDetailCommunity] = useState<Community | null>(null);
  const [activeTab, setActiveTab] = useState<"members" | "leaderboard" | "challenges">("members");
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);

  // Handle navigation from MyCommunitiesScreen
  useEffect(() => {
    if (route.params?.openCommunity) {
      const community = route.params.openCommunity;
      setDetailCommunity(community);
      setIsCommunityDetailVisible(true);
      setActiveTab("members");
      // Clear the param so it doesn't reopen on re-render
      navigation.setParams({ openCommunity: undefined });
    }
  }, [route.params?.openCommunity]);

  // Create community form
  const [communityName, setCommunityName] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  // Create post form
  const [postContent, setPostContent] = useState("");

  // Create challenge form
  const [isCreateChallengeModalVisible, setIsCreateChallengeModalVisible] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeType, setChallengeType] = useState<"pb" | "calorie_streak" | "workout_streak" | "custom">("workout_streak");
  const [challengeTargetValue, setChallengeTargetValue] = useState("");
  const [challengeTargetDays, setChallengeTargetDays] = useState("");

  const handleCreateCommunity = () => {
    if (communityName.trim()) {
      // Generate random 6-character join code if private
      const generateJoinCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      const joinCode = isPrivate ? generateJoinCode() : undefined;

      const newCommunity: Community = {
        id: Date.now().toString(),
        name: communityName,
        description: communityDescription,
        members: [currentUserId],
        admins: [currentUserId], // Creator is admin
        createdBy: currentUserId,
        createdAt: new Date().toISOString(),
        posts: [],
        joinCode,
        isPrivate,
        challenges: [],
      };
      createCommunity(newCommunity);
      setCommunityName("");
      setCommunityDescription("");
      setIsPrivate(false);
      setIsCreateModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleCreatePost = () => {
    if (postContent.trim() && selectedCommunity) {
      const newPost: Post = {
        id: Date.now().toString(),
        userId: currentUserId,
        userName: currentUserName,
        content: postContent,
        date: new Date().toISOString(),
        likes: [],
        comments: [],
      };
      addPost(selectedCommunity.id, newPost);
      setPostContent("");
      setIsCreatePostModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleCreateChallenge = () => {
    if (challengeTitle.trim() && detailCommunity) {
      const newChallenge: Challenge = {
        id: Date.now().toString(),
        type: challengeType,
        title: challengeTitle,
        description: challengeDescription,
        targetValue: challengeTargetValue ? parseInt(challengeTargetValue) : undefined,
        targetDays: challengeTargetDays ? parseInt(challengeTargetDays) : undefined,
        createdBy: currentUserId,
        createdAt: new Date().toISOString(),
        participants: [],
      };
      addChallenge(detailCommunity.id, newChallenge);
      setChallengeTitle("");
      setChallengeDescription("");
      setChallengeType("workout_streak");
      setChallengeTargetValue("");
      setChallengeTargetDays("");
      setIsCreateChallengeModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleJoinCommunity = (communityId: string) => {
    joinCommunity(communityId, currentUserId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLeaveCommunity = (communityId: string) => {
    leaveCommunity(communityId, currentUserId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleLikePost = (communityId: string, postId: string) => {
    likePost(communityId, postId, currentUserId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const isMember = (community: Community) => {
    return community.members.includes(currentUserId);
  };

  const getJoinedCommunities = () => {
    return communities.filter((c) => isMember(c));
  };

  const getAvailableCommunities = () => {
    return communities.filter((c) => !isMember(c));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#1a1a1a]" : "bg-white")}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-4 pb-4">
          <Text
            className={cn(
              "text-3xl font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            POTTY AI
          </Text>
          <Text
            className={cn(
              "text-sm mt-1",
              isDark ? "text-gray-400" : "text-gray-600"
            )}
          >
            Community
          </Text>
        </View>

        {/* My Communities Card */}
        <View className="px-4">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate("MyCommunities");
            }}
            className={cn(
              "rounded-3xl p-6 mb-4",
              isDark ? "bg-[#1a1a1a]" : "bg-white"
            )}
            style={{
              shadowColor: isDark ? "#000" : "#1f2937",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDark ? 0.6 : 0.25,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View
              className="rounded-3xl p-5 mb-4"
              style={{ 
                backgroundColor: isDark ? "rgba(34, 197, 94, 0.15)" : "#bbf7d0",
                shadowColor: "#22c55e",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Ionicons
                name="people"
                size={36}
                color={isDark ? "#22c55e" : "#16a34a"}
              />
            </View>
            <Text
              className={cn(
                "text-2xl font-bold mb-2",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              My Communities
            </Text>
            <Text
              className={cn(
                "text-sm mb-3",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              Your joined communities
            </Text>
            <View
              className="rounded-full px-4 py-2 self-start"
              style={{
                backgroundColor: "#22c55e",
                shadowColor: "#22c55e",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
              }}
            >
              <Text className="text-sm font-bold text-white">
                {getJoinedCommunities().length} Joined
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Discover and Trending Row */}
        <View className="px-4 flex-row mb-4">
          {/* Discover Card */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setActiveView(activeView === "discover" ? null : "discover");
            }}
            className={cn(
              "flex-1 rounded-3xl p-6 mr-2",
              activeView === "discover"
                ? "border-2 border-blue-500"
                : isDark
                ? "bg-[#1a1a1a]"
                : "bg-white"
            )}
            style={{
              shadowColor: activeView === "discover" ? "#3b82f6" : (isDark ? "#000" : "#1f2937"),
              shadowOffset: { width: 0, height: activeView === "discover" ? 8 : 6 },
              shadowOpacity: activeView === "discover" ? 0.5 : (isDark ? 0.6 : 0.25),
              shadowRadius: activeView === "discover" ? 20 : 12,
              elevation: activeView === "discover" ? 10 : 8,
            }}
          >
            <View
              className="rounded-2xl p-4 mb-4"
              style={{ 
                backgroundColor: isDark ? "rgba(147, 197, 253, 0.2)" : "#dbeafe",
                shadowColor: "#3b82f6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Ionicons
                name="search"
                size={32}
                color={isDark ? "#60a5fa" : "#3b82f6"}
              />
            </View>
            <Text
              className={cn(
                "text-xl font-bold mb-2",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Discover
            </Text>
            <Text
              className={cn(
                "text-sm mb-3",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              Explore new communities
            </Text>
            <View
              className={cn(
                "rounded-full px-3 py-1.5 self-start",
                isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
              )}
            >
              <Text
                className={cn(
                  "text-xs font-semibold",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {getAvailableCommunities().length} available
              </Text>
            </View>
          </Pressable>

          {/* Friends Card */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsFriendsListVisible(true);
            }}
            className={cn(
              "flex-1 rounded-3xl p-6 ml-2",
              isDark ? "bg-[#1a1a1a]" : "bg-white"
            )}
            style={{
              shadowColor: isDark ? "#000" : "#1f2937",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDark ? 0.6 : 0.25,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View
              className="rounded-2xl p-4 mb-4"
              style={{
                backgroundColor: isDark ? "rgba(147, 51, 234, 0.15)" : "#e9d5ff",
                shadowColor: "#9333ea",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Ionicons
                name="people"
                size={32}
                color={isDark ? "#c084fc" : "#9333ea"}
              />
            </View>
            <Text
              className={cn(
                "text-xl font-bold mb-2",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Friends
            </Text>
            <Text
              className={cn(
                "text-sm mb-3",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              Connect & share progress
            </Text>
            <View
              className={cn(
                "rounded-full px-3 py-1.5 self-start flex-row items-center",
                isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
              )}
            >
              <Ionicons
                name="people"
                size={12}
                color={isDark ? "#c084fc" : "#9333ea"}
              />
              <Text
                className={cn(
                  "text-xs font-semibold ml-1",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {friends.length} friends
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Join Private Community Card */}
        <View className="px-4 mb-6">
          <View
            className="rounded-3xl p-6"
            style={{
              backgroundColor: isDark ? "rgba(168, 85, 247, 0.15)" : "#f3e8ff",
              shadowColor: "#a855f7",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-3">
                  <View
                    className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(168, 85, 247, 0.3)"
                        : "rgba(168, 85, 247, 0.2)",
                    }}
                  >
                    <Ionicons
                      name="lock-closed"
                      size={24}
                      color={isDark ? "#c084fc" : "#a855f7"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={cn(
                        "text-xl font-bold",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      Join Private Community
                    </Text>
                  </View>
                </View>
                <Text
                  className={cn(
                    "text-sm mb-3",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  Enter an invite code to join
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setIsJoinPrivateModalVisible(true);
                }}
                className="rounded-2xl px-5 py-3"
                style={{ backgroundColor: "#a855f7" }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="lock-closed" size={18} color="white" />
                  <Text className="text-white font-bold ml-2">Enter Code</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Discover Communities - Shows when activeView is "discover" */}
        {activeView === "discover" && getAvailableCommunities().length > 0 && (
          <Animated.View 
            entering={FadeInDown.duration(300).springify()}
            exiting={FadeOutUp.duration(200)}
            className="px-4 mb-4"
          >
            <Text
              className={cn(
                "text-xl font-bold mb-3",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Available Communities
            </Text>
            {getAvailableCommunities().map((community) => (
              <Pressable
                key={community.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className={cn(
                  "rounded-2xl p-4 mb-3",
                  isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
                )}
              >
                <Text
                  className={cn(
                    "text-lg font-bold mb-1",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  {community.name}
                </Text>
                <Text
                  className={cn(
                    "text-sm mb-2",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  {community.description || "No description"}
                </Text>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="people"
                      size={16}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                    <Text
                      className={cn(
                        "text-sm ml-1",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      {community.members.length} members
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleJoinCommunity(community.id)}
                    className="bg-blue-500 px-3 py-1.5 rounded-full"
                  >
                    <Text className="text-white font-semibold text-xs">
                      Join
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </Animated.View>
        )}

        {/* Old Communities List - Remove this section */}
        {!activeView && getJoinedCommunities().length > 0 && (
          <View className="px-4 mb-20">
            <Text
              className={cn(
                "text-base text-center",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              Tap a card above to view communities
            </Text>
          </View>
        )}

        {!activeView && getAvailableCommunities().length === 0 && getJoinedCommunities().length === 0 && (
          <View className="px-4 mb-20">
            <View className="items-center py-12">
              <Ionicons
                name="people-outline"
                size={64}
                color={isDark ? "#6b7280" : "#9ca3af"}
              />
              <Text
                className={cn(
                  "text-lg mt-4",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                No communities yet
              </Text>
              <Text
                className={cn(
                  "text-sm mt-2 text-center",
                  isDark ? "text-gray-500" : "text-gray-500"
                )}
              >
                Create one to get started
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Create Button */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setIsCreateModalVisible(true);
        }}
        className="absolute bottom-24 right-6 w-16 h-16 rounded-full items-center justify-center"
        style={{
          backgroundColor: "#3b82f6",
          shadowColor: "#3b82f6",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={32} color="white" />
      </Pressable>

      {/* Create Community Modal */}
      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <SafeAreaView className={cn("flex-1", isDark ? "bg-[#1a1a1a]" : "bg-gray-50")}>
            <View className="px-4 pt-4 pb-2 border-b border-gray-200">
              <View className="flex-row justify-between items-center">
                <Text
                  className={cn(
                    "text-2xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Create Community
                </Text>
                <View className="flex-row">
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsCreateModalVisible(false);
                    }}
                    className="mr-4 px-4 py-2"
                  >
                    <Text className="text-red-500 font-semibold">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleCreateCommunity}
                    className="bg-blue-500 px-4 py-2 rounded-full"
                  >
                    <Text className="text-white font-semibold">Create</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <ScrollView
              className="flex-1 px-4"
              keyboardShouldPersistTaps="handled"
            >
              <View className="mt-4">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Community Name
                </Text>
                <TextInput
                  value={communityName}
                  onChangeText={setCommunityName}
                  placeholder="e.g., Morning Warriors, Gym Squad"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  className={cn(
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-[#0a0a0a] text-white"
                      : "bg-white text-gray-900"
                  )}
                />
              </View>

              <View className="mt-4">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Description (Optional)
                </Text>
                <TextInput
                  value={communityDescription}
                  onChangeText={setCommunityDescription}
                  placeholder="Describe your community..."
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className={cn(
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-[#0a0a0a] text-white"
                      : "bg-white text-gray-900"
                  )}
                />
              </View>

              <View className="mt-6">
                <View
                  className={cn(
                    "rounded-2xl p-4",
                    isDark ? "bg-[#1a1a1a]" : "bg-white"
                  )}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-4">
                      <View className="flex-row items-center mb-2">
                        <Ionicons 
                          name="lock-closed" 
                          size={20} 
                          color={isPrivate ? "#a855f7" : (isDark ? "#9ca3af" : "#6b7280")} 
                        />
                        <Text
                          className={cn(
                            "text-base font-bold ml-2",
                            isPrivate 
                              ? "text-purple-600" 
                              : isDark 
                              ? "text-white" 
                              : "text-gray-900"
                          )}
                        >
                          Private Community
                        </Text>
                      </View>
                      <Text
                        className={cn(
                          "text-xs",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}
                      >
                        Requires an invite code to join
                      </Text>
                    </View>
                    <Switch
                      value={isPrivate}
                      onValueChange={(value) => {
                        setIsPrivate(value);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      trackColor={{ false: isDark ? "#374151" : "#d1d5db", true: "#a855f7" }}
                      thumbColor={isPrivate ? "#fff" : "#f3f4f6"}
                    />
                  </View>

                  {isPrivate && (
                    <View 
                      className={cn(
                        "mt-4 p-3 rounded-xl",
                        isDark ? "bg-purple-900/20" : "bg-purple-50"
                      )}
                    >
                      <View className="flex-row items-center">
                        <Ionicons name="information-circle" size={16} color="#a855f7" />
                        <Text className={cn("text-xs ml-2", isDark ? "text-purple-300" : "text-purple-700")}>
                          A unique invite code will be generated after creation
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Join Private Community Modal */}
      <Modal
        visible={isJoinPrivateModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className={cn("flex-1", isDark ? "bg-[#1a1a1a]" : "bg-gray-50")}>
          <View className="px-4 pt-4 pb-2 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text
                className={cn(
                  "text-2xl font-bold",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Join Private Community
              </Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsJoinPrivateModalVisible(false);
                }}
              >
                <Ionicons
                  name="close"
                  size={28}
                  color={isDark ? "#fff" : "#000"}
                />
              </Pressable>
            </View>
          </View>

          <View className="flex-1 px-4 justify-center">
            <View className="items-center mb-8">
              <View
                className="w-24 h-24 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: isDark ? "#1f2937" : "#f3f4f6" }}
              >
                <Ionicons
                  name="lock-closed"
                  size={48}
                  color={isDark ? "#a855f7" : "#9333ea"}
                />
              </View>
              <Text
                className={cn(
                  "text-lg text-center mb-2",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Enter Invite Code
              </Text>
              <Text
                className={cn(
                  "text-sm text-center",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                Ask a community member for an invite code
              </Text>
            </View>

            <TextInput
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="Enter code"
              placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
              className={cn(
                "rounded-2xl p-4 text-lg text-center mb-4",
                isDark ? "bg-[#0a0a0a] text-white" : "bg-white text-gray-900"
              )}
              autoCapitalize="characters"
            />

            <Pressable
              onPress={() => {
                if (inviteCode.trim()) {
                  const success = joinCommunityWithCode(inviteCode.trim().toUpperCase(), currentUserId);
                  
                  if (success) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setInviteCode("");
                    setIsJoinPrivateModalVisible(false);
                    setActiveView("my"); // Switch to "my" view to show joined community
                    
                    // Show success feedback on the screen
                    setTimeout(() => {
                      // Could add a success toast/banner here
                    }, 300);
                  } else {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    alert("Invalid code or you are already a member!");
                  }
                } else {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  alert("Please enter an invite code");
                }
              }}
              className="bg-purple-600 py-4 rounded-2xl"
            >
              <Text className="text-white font-bold text-center text-lg">
                Join Community
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Community Detail Modal */}
      <Modal
        visible={selectedCommunity !== null}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView className={cn("flex-1", isDark ? "bg-[#1a1a1a]" : "bg-gray-50")}>
          <View className="px-4 pt-4 pb-2 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text
                className={cn(
                  "text-2xl font-bold flex-1",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {selectedCommunity?.name}
              </Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCommunity(null);
                }}
              >
                <Ionicons
                  name="close"
                  size={28}
                  color={isDark ? "#fff" : "#000"}
                />
              </Pressable>
            </View>
            <View className="flex-row items-center mt-2">
              <Ionicons
                name="people"
                size={14}
                color={isDark ? "#9ca3af" : "#6b7280"}
              />
              <Text
                className={cn(
                  "text-sm ml-1",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                {selectedCommunity?.members.length} members
              </Text>
            </View>
          </View>

          <View className="px-4 py-3 border-b border-gray-200">
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setIsCreatePostModalVisible(true);
              }}
              className="bg-blue-500 py-3 rounded-full"
            >
              <Text className="text-white font-semibold text-center">
                Share Your Progress
              </Text>
            </Pressable>
          </View>

          {selectedCommunity?.posts.length === 0 ? (
            <View className="flex-1 justify-center items-center px-4">
              <Ionicons
                name="chatbubbles-outline"
                size={64}
                color={isDark ? "#6b7280" : "#9ca3af"}
              />
              <Text
                className={cn(
                  "text-lg mt-4",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                No posts yet
              </Text>
              <Text
                className={cn(
                  "text-sm mt-2 text-center",
                  isDark ? "text-gray-500" : "text-gray-500"
                )}
              >
                Be the first to share your progress
              </Text>
            </View>
          ) : (
            <FlatList
              data={selectedCommunity?.posts}
              keyExtractor={(item) => item.id}
              className="flex-1 px-4"
              contentContainerStyle={{ paddingTop: 16 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View
                  className={cn(
                    "mb-4 rounded-xl p-4",
                    isDark ? "bg-[#1a1a1a]" : "bg-white"
                  )}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <View className="flex-row items-center mb-3">
                    <View
                      className={cn(
                        "w-10 h-10 rounded-full items-center justify-center",
                        isDark ? "bg-blue-600" : "bg-blue-500"
                      )}
                    >
                      <Text className="text-white font-bold text-lg">
                        {item.userName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="ml-3 flex-1">
                      <Text
                        className={cn(
                          "font-semibold",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        {item.userName}
                      </Text>
                      <Text
                        className={cn(
                          "text-xs",
                          isDark ? "text-gray-500" : "text-gray-500"
                        )}
                      >
                        {formatDate(item.date)}
                      </Text>
                    </View>
                  </View>

                  <Text
                    className={cn(
                      "text-base mb-3",
                      isDark ? "text-gray-300" : "text-gray-800"
                    )}
                  >
                    {item.content}
                  </Text>

                  <View className="flex-row pt-3 border-t border-gray-700">
                    <Pressable
                      onPress={() =>
                        selectedCommunity &&
                        handleLikePost(selectedCommunity.id, item.id)
                      }
                      className="flex-row items-center mr-4"
                    >
                      <Ionicons
                        name={
                          item.likes.includes(currentUserId)
                            ? "heart"
                            : "heart-outline"
                        }
                        size={20}
                        color={
                          item.likes.includes(currentUserId)
                            ? "#ef4444"
                            : isDark
                            ? "#9ca3af"
                            : "#6b7280"
                        }
                      />
                      <Text
                        className={cn(
                          "ml-1 text-sm",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}
                      >
                        {item.likes.length}
                      </Text>
                    </Pressable>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="chatbubble-outline"
                        size={18}
                        color={isDark ? "#9ca3af" : "#6b7280"}
                      />
                      <Text
                        className={cn(
                          "ml-1 text-sm",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}
                      >
                        {item.comments.length}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Create Post Modal */}
      <Modal
        visible={isCreatePostModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <SafeAreaView className={cn("flex-1", isDark ? "bg-[#1a1a1a]" : "bg-gray-50")}>
            <View className="px-4 pt-4 pb-2 border-b border-gray-200">
              <View className="flex-row justify-between items-center">
                <Text
                  className={cn(
                    "text-2xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  New Post
                </Text>
                <View className="flex-row">
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsCreatePostModalVisible(false);
                    }}
                    className="mr-4 px-4 py-2"
                  >
                    <Text className="text-red-500 font-semibold">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleCreatePost}
                    className="bg-blue-500 px-4 py-2 rounded-full"
                  >
                    <Text className="text-white font-semibold">Post</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <ScrollView
              className="flex-1 px-4"
              keyboardShouldPersistTaps="handled"
            >
              <View className="mt-4">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Share your progress
                </Text>
                <TextInput
                  value={postContent}
                  onChangeText={setPostContent}
                  placeholder="What did you accomplish today?"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  className={cn(
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-[#0a0a0a] text-white"
                      : "bg-white text-gray-900"
                  )}
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Community Detail Modal */}
      <Modal
        visible={isCommunityDetailVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className={cn("flex-1", isDark ? "bg-[#1a1a1a]" : "bg-white")}>
          {/* Header */}
          <View className={cn("px-4 pt-4 pb-3", isDark ? "bg-[#0a0a0a]/50" : "bg-gray-50")}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center">
                  <View
                    className="w-16 h-16 rounded-3xl items-center justify-center mr-4"
                    style={{
                      backgroundColor: isDark ? "rgba(147, 51, 234, 0.2)" : "rgba(147, 51, 234, 0.1)",
                    }}
                  >
                    <Ionicons name="people" size={32} color="#9333ea" />
                  </View>
                  <Pressable 
                    className="flex-1"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsAboutModalVisible(true);
                    }}
                  >
                    <View className="flex-row items-center">
                      <Text
                        className={cn(
                          "text-2xl font-bold",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        {detailCommunity?.name}
                      </Text>
                      <Ionicons 
                        name="information-circle" 
                        size={20} 
                        color={isDark ? "#9ca3af" : "#6b7280"} 
                        style={{ marginLeft: 8 }}
                      />
                    </View>
                    <View className="flex-row items-center mt-1">
                      <View className={detailCommunity?.isPrivate ? "bg-purple-500 px-3 py-1 rounded-full mr-2" : "bg-blue-500 px-3 py-1 rounded-full mr-2"}>
                        <Text className="text-white text-xs font-semibold">
                          {detailCommunity?.isPrivate ? "Private" : "Public"}
                        </Text>
                      </View>
                      <View className={cn("px-3 py-1 rounded-full", isDark ? "bg-[#1a1a1a]" : "bg-gray-200")}>
                        <Text className={cn("text-xs font-semibold", isDark ? "text-gray-300" : "text-gray-700")}>
                          {detailCommunity?.members.length} members
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                </View>
              </View>
              <Pressable
                onPress={() => {
                  setIsCommunityDetailVisible(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className="ml-2"
              >
                <Ionicons name="close" size={28} color={isDark ? "#fff" : "#000"} />
              </Pressable>
            </View>

            {/* Action Buttons */}
            <View className="flex-row mt-4">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (detailCommunity) {
                    setSelectedCommunity(detailCommunity);
                    setIsCommunityDetailVisible(false);
                  }
                }}
                className="flex-1 bg-blue-500 py-3 rounded-2xl mr-2 flex-row items-center justify-center"
              >
                <Ionicons name="arrow-forward" size={18} color="white" />
                <Text className="text-white font-bold ml-2">Enter Community</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className={cn(
                  "px-6 py-3 rounded-2xl flex-row items-center justify-center",
                  isDark ? "bg-[#1a1a1a]" : "bg-gray-200"
                )}
              >
                <Ionicons name="copy-outline" size={18} color={isDark ? "#fff" : "#000"} />
                <Text className={cn("font-bold ml-2", isDark ? "text-white" : "text-gray-900")}>
                  Copy Invite
                </Text>
              </Pressable>
            </View>

            {/* Leave Button */}
            <Pressable
              onPress={() => {
                if (detailCommunity) {
                  handleLeaveCommunity(detailCommunity.id);
                  setIsCommunityDetailVisible(false);
                }
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
              className="mt-3 py-3 rounded-2xl flex-row items-center justify-center border-2 border-red-500/30"
            >
              <Ionicons name="close-circle-outline" size={18} color="#ef4444" />
              <Text className="text-red-500 font-bold ml-2">Leave</Text>
            </Pressable>
          </View>

          {/* Tabs */}
          <View className={cn("flex-row px-4 py-3 border-b", isDark ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-white")}>
            <Pressable
              onPress={() => {
                setActiveTab("members");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="flex-1 items-center"
            >
              <View className="flex-row items-center pb-2">
                <Ionicons name="people" size={18} color={activeTab === "members" ? "#9333ea" : (isDark ? "#6b7280" : "#9ca3af")} />
                <Text
                  className={cn(
                    "text-base font-semibold ml-2",
                    activeTab === "members"
                      ? "text-purple-600"
                      : isDark
                      ? "text-gray-500"
                      : "text-gray-400"
                  )}
                >
                  Members
                </Text>
              </View>
              {activeTab === "members" && (
                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setActiveTab("leaderboard");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="flex-1 items-center"
            >
              <View className="flex-row items-center pb-2">
                <Ionicons name="trophy" size={18} color={activeTab === "leaderboard" ? "#9333ea" : (isDark ? "#6b7280" : "#9ca3af")} />
                <Text
                  className={cn(
                    "text-base font-semibold ml-2",
                    activeTab === "leaderboard"
                      ? "text-purple-600"
                      : isDark
                      ? "text-gray-500"
                      : "text-gray-400"
                  )}
                >
                  Leaderboard
                </Text>
              </View>
              {activeTab === "leaderboard" && (
                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                setActiveTab("challenges");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="flex-1 items-center"
            >
              <View className="flex-row items-center pb-2">
                <Ionicons name="trophy-outline" size={18} color={activeTab === "challenges" ? "#9333ea" : (isDark ? "#6b7280" : "#9ca3af")} />
                <Text
                  className={cn(
                    "text-base font-semibold ml-2",
                    activeTab === "challenges"
                      ? "text-purple-600"
                      : isDark
                      ? "text-gray-500"
                      : "text-gray-400"
                  )}
                >
                  Challenges
                </Text>
              </View>
              {activeTab === "challenges" && (
                <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
            </Pressable>
          </View>

          {/* Tab Content */}
          <ScrollView className="flex-1 px-4 pt-4">
            {activeTab === "members" && (
              <View>
                <Text className={cn("text-sm mb-4", isDark ? "text-gray-400" : "text-gray-600")}>
                  {detailCommunity?.members.length} member{detailCommunity?.members.length !== 1 ? "s" : ""} in this community
                </Text>
                {detailCommunity?.members.map((memberId, index) => (
                  <View
                    key={memberId}
                    className={cn(
                      "rounded-2xl p-4 mb-3 flex-row items-center",
                      isDark ? "bg-[#1a1a1a]" : "bg-gray-50"
                    )}
                  >
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      style={{
                        backgroundColor: isDark ? "rgba(147, 51, 234, 0.2)" : "rgba(147, 51, 234, 0.1)",
                      }}
                    >
                      <Ionicons name="person" size={24} color="#9333ea" />
                    </View>
                    <View className="flex-1">
                      <Text className={cn("text-base font-bold", isDark ? "text-white" : "text-gray-900")}>
                        {memberId === currentUserId ? currentUserName : `Member ${index + 1}`}
                      </Text>
                      <Text className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                        {memberId === detailCommunity?.createdBy ? "Creator" : "Member"}
                      </Text>
                    </View>
                    {memberId === currentUserId && (
                      <View className="bg-purple-500/20 px-3 py-1 rounded-full">
                        <Text className="text-purple-500 text-xs font-bold">You</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {activeTab === "leaderboard" && (
              <View>
                <Text className={cn("text-sm mb-4", isDark ? "text-gray-400" : "text-gray-600")}>
                  Top performers based on total workouts completed
                </Text>
                {detailCommunity?.members.map((memberId, index) => (
                  <View
                    key={memberId}
                    className={cn(
                      "rounded-2xl p-4 mb-3 flex-row items-center",
                      index === 0 ? "bg-yellow-500/10 border-2 border-yellow-500/30" :
                      index === 1 ? "bg-gray-400/10 border-2 border-gray-400/30" :
                      index === 2 ? "bg-orange-500/10 border-2 border-orange-500/30" :
                      isDark ? "bg-[#1a1a1a]" : "bg-gray-50"
                    )}
                  >
                    <View className="w-10 items-center mr-3">
                      {index < 3 ? (
                        <Ionicons
                          name="trophy"
                          size={24}
                          color={index === 0 ? "#eab308" : index === 1 ? "#9ca3af" : "#f97316"}
                        />
                      ) : (
                        <Text className={cn("text-lg font-bold", isDark ? "text-gray-500" : "text-gray-400")}>
                          #{index + 1}
                        </Text>
                      )}
                    </View>
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-3"
                      style={{
                        backgroundColor: isDark ? "rgba(147, 51, 234, 0.2)" : "rgba(147, 51, 234, 0.1)",
                      }}
                    >
                      <Ionicons name="person" size={24} color="#9333ea" />
                    </View>
                    <View className="flex-1">
                      <Text className={cn("text-base font-bold", isDark ? "text-white" : "text-gray-900")}>
                        {memberId === currentUserId ? currentUserName : `Member ${index + 1}`}
                      </Text>
                      <Text className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                        {Math.floor(Math.random() * 50) + 10} workouts completed
                      </Text>
                    </View>
                    <View className={cn("px-3 py-1 rounded-full", isDark ? "bg-purple-500/20" : "bg-purple-100")}>
                      <Text className={cn("text-sm font-bold", isDark ? "text-purple-400" : "text-purple-600")}>
                        {Math.floor(Math.random() * 500) + 100} pts
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {activeTab === "challenges" && (
              <View>
                <Text className={cn("text-sm mb-4", isDark ? "text-gray-400" : "text-gray-600")}>
                  {detailCommunity?.challenges && detailCommunity.challenges.length > 0 
                    ? `${detailCommunity.challenges.length} active challenge${detailCommunity.challenges.length !== 1 ? "s" : ""}`
                    : "No active challenges"}
                </Text>

                {/* Admin Create Challenge Button */}
                {detailCommunity && detailCommunity.admins && detailCommunity.admins.includes(currentUserId) && (
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setIsCreateChallengeModalVisible(true);
                    }}
                    className="rounded-2xl p-4 mb-4 flex-row items-center justify-center border-2 border-dashed border-purple-500"
                  >
                    <Ionicons name="add-circle" size={24} color="#9333ea" />
                    <Text className="text-purple-600 font-bold ml-2">Create Challenge</Text>
                  </Pressable>
                )}

                {/* Challenges List */}
                {detailCommunity?.challenges && detailCommunity.challenges.length > 0 ? (
                  detailCommunity.challenges.map((challenge) => {
                    const userParticipation = challenge.participants.find(p => p.userId === currentUserId);
                    const isParticipating = !!userParticipation;
                    const progress = userParticipation?.progress || 0;
                    const targetValue = challenge.targetValue || challenge.targetDays || 100;
                    const progressPercent = Math.min((progress / targetValue) * 100, 100);

                    return (
                      <View
                        key={challenge.id}
                        className={cn(
                          "rounded-3xl p-5 mb-4",
                          isDark ? "bg-[#1a1a1a]" : "bg-gray-50"
                        )}
                      >
                        {/* Challenge Header */}
                        <View className="flex-row items-start justify-between mb-3">
                          <View className="flex-1">
                            <View className="flex-row items-center mb-2">
                              <View
                                className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                                style={{
                                  backgroundColor: isDark 
                                    ? "rgba(147, 51, 234, 0.2)" 
                                    : "rgba(147, 51, 234, 0.1)",
                                }}
                              >
                                <Ionicons 
                                  name={
                                    challenge.type === "pb" ? "trophy" :
                                    challenge.type === "workout_streak" ? "flame" :
                                    challenge.type === "calorie_streak" ? "nutrition" :
                                    "flag"
                                  } 
                                  size={20} 
                                  color="#9333ea" 
                                />
                              </View>
                              <View className="flex-1">
                                <Text className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>
                                  {challenge.title}
                                </Text>
                                <Text className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-600")}>
                                  {challenge.participants.length} participant{challenge.participants.length !== 1 ? "s" : ""}
                                </Text>
                              </View>
                            </View>
                            <Text className={cn("text-sm mb-3", isDark ? "text-gray-400" : "text-gray-600")}>
                              {challenge.description}
                            </Text>

                            {/* Challenge Goal */}
                            <View className="flex-row items-center mb-3">
                              <Text className={cn("text-xs font-semibold mr-2", isDark ? "text-gray-500" : "text-gray-600")}>
                                TARGET:
                              </Text>
                              <View className={cn("px-3 py-1 rounded-full", isDark ? "bg-purple-500/20" : "bg-purple-100")}>
                                <Text className="text-purple-600 text-xs font-bold">
                                  {challenge.targetValue 
                                    ? `${challenge.targetValue}${challenge.type === "pb" ? "kg" : ""}`
                                    : `${challenge.targetDays} days`}
                                </Text>
                              </View>
                            </View>

                            {/* Progress Bar (if participating) */}
                            {isParticipating && (
                              <View>
                                <View className="flex-row justify-between items-center mb-2">
                                  <Text className={cn("text-xs font-semibold", isDark ? "text-gray-400" : "text-gray-600")}>
                                    Your Progress
                                  </Text>
                                  <Text className={cn("text-xs font-bold", isDark ? "text-purple-400" : "text-purple-600")}>
                                    {progress} / {targetValue} ({progressPercent.toFixed(0)}%)
                                  </Text>
                                </View>
                                <View 
                                  className={cn("h-2 rounded-full overflow-hidden", isDark ? "bg-[#1a1a1a]" : "bg-gray-200")}
                                >
                                  <View 
                                    className="h-full bg-purple-500 rounded-full"
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </View>
                              </View>
                            )}
                          </View>
                        </View>

                        {/* Join/Leave Button */}
                        {!isParticipating ? (
                          <Pressable
                            onPress={() => {
                              if (detailCommunity) {
                                joinChallenge(detailCommunity.id, challenge.id, currentUserId);
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                              }
                            }}
                            className="bg-purple-600 py-3 rounded-2xl flex-row items-center justify-center"
                          >
                            <Ionicons name="add" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Join Challenge</Text>
                          </Pressable>
                        ) : (
                          <View className="bg-green-500/20 py-3 rounded-2xl flex-row items-center justify-center">
                            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                            <Text className="text-green-500 font-bold ml-2">Participating</Text>
                          </View>
                        )}
                      </View>
                    );
                  })
                ) : (
                  <View className="items-center py-12">
                    <Ionicons
                      name="flag-outline"
                      size={64}
                      color={isDark ? "#6b7280" : "#9ca3af"}
                    />
                    <Text className={cn("text-lg mt-4", isDark ? "text-gray-400" : "text-gray-600")}>
                      No challenges yet
                    </Text>
                    <Text className={cn("text-sm mt-2 text-center", isDark ? "text-gray-500" : "text-gray-500")}>
                      {detailCommunity && detailCommunity.admins && detailCommunity.admins.includes(currentUserId)
                        ? "Create the first challenge for this community"
                        : "Check back later for new challenges"}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Create Challenge Modal */}
      <Modal
        visible={isCreateChallengeModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <SafeAreaView className={cn("flex-1", isDark ? "bg-[#1a1a1a]" : "bg-gray-50")}>
            <View className="px-4 pt-4 pb-2 border-b border-gray-200">
              <View className="flex-row justify-between items-center">
                <Text
                  className={cn(
                    "text-2xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Create Challenge
                </Text>
                <View className="flex-row">
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsCreateChallengeModalVisible(false);
                    }}
                    className="mr-4 px-4 py-2"
                  >
                    <Text className="text-red-500 font-semibold">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleCreateChallenge}
                    className="bg-purple-600 px-4 py-2 rounded-full"
                  >
                    <Text className="text-white font-semibold">Create</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <ScrollView
              className="flex-1 px-4"
              keyboardShouldPersistTaps="handled"
            >
              <View className="mt-4">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Challenge Type
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {[
                    { value: "workout_streak", label: "Workout Streak", icon: "flame" },
                    { value: "calorie_streak", label: "Calorie Streak", icon: "nutrition" },
                    { value: "pb", label: "Personal Best", icon: "trophy" },
                    { value: "custom", label: "Custom", icon: "flag" },
                  ].map((type) => (
                    <Pressable
                      key={type.value}
                      onPress={() => {
                        setChallengeType(type.value as typeof challengeType);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      className={cn(
                        "flex-row items-center px-4 py-3 rounded-2xl",
                        challengeType === type.value
                          ? "bg-purple-600"
                          : isDark
                          ? "bg-[#1a1a1a]"
                          : "bg-white"
                      )}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={18}
                        color={challengeType === type.value ? "white" : (isDark ? "#9ca3af" : "#6b7280")}
                      />
                      <Text
                        className={cn(
                          "ml-2 font-semibold text-sm",
                          challengeType === type.value
                            ? "text-white"
                            : isDark
                            ? "text-gray-300"
                            : "text-gray-700"
                        )}
                      >
                        {type.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="mt-2">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Challenge Title
                </Text>
                <TextInput
                  value={challengeTitle}
                  onChangeText={setChallengeTitle}
                  placeholder="e.g., 30 Day Workout Streak"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  className={cn(
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-[#0a0a0a] text-white"
                      : "bg-white text-gray-900"
                  )}
                />
              </View>

              <View className="mt-4">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Description
                </Text>
                <TextInput
                  value={challengeDescription}
                  onChangeText={setChallengeDescription}
                  placeholder="Describe the challenge..."
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className={cn(
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-[#0a0a0a] text-white"
                      : "bg-white text-gray-900"
                  )}
                />
              </View>

              {challengeType === "pb" ? (
                <View className="mt-4">
                  <Text
                    className={cn(
                      "text-sm font-semibold mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    Target Weight (kg)
                  </Text>
                  <TextInput
                    value={challengeTargetValue}
                    onChangeText={setChallengeTargetValue}
                    placeholder="e.g., 100"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    keyboardType="numeric"
                    className={cn(
                      "rounded-lg p-3 text-base",
                      isDark
                        ? "bg-[#0a0a0a] text-white"
                        : "bg-white text-gray-900"
                    )}
                  />
                </View>
              ) : (
                <View className="mt-4">
                  <Text
                    className={cn(
                      "text-sm font-semibold mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    Target Days
                  </Text>
                  <TextInput
                    value={challengeTargetDays}
                    onChangeText={setChallengeTargetDays}
                    placeholder="e.g., 30"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    keyboardType="numeric"
                    className={cn(
                      "rounded-lg p-3 text-base",
                      isDark
                        ? "bg-[#0a0a0a] text-white"
                        : "bg-white text-gray-900"
                    )}
                  />
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* About Info Modal */}
      <Modal
        visible={isAboutModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className={cn("flex-1", isDark ? "bg-[#1a1a1a]" : "bg-white")}>
          {/* Header */}
          <View className={cn("px-4 pt-4 pb-3 border-b", isDark ? "border-[#1a1a1a]" : "border-gray-200")}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                  style={{
                    backgroundColor: isDark ? "rgba(147, 51, 234, 0.2)" : "rgba(147, 51, 234, 0.1)",
                  }}
                >
                  <Ionicons name="information-circle" size={24} color="#9333ea" />
                </View>
                <Text
                  className={cn(
                    "text-2xl font-bold flex-1",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                  numberOfLines={1}
                >
                  About
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setIsAboutModalVisible(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Ionicons name="close" size={28} color={isDark ? "#fff" : "#000"} />
              </Pressable>
            </View>
          </View>

          <ScrollView className="flex-1 px-4 pt-4">
            {/* Description */}
            <View
              className={cn(
                "rounded-3xl p-6 mb-4",
                isDark ? "bg-[#1a1a1a]" : "bg-gray-50"
              )}
            >
              <View className="flex-row items-center mb-3">
                <Ionicons name="sparkles" size={20} color="#9333ea" />
                <Text className={cn("text-lg font-bold ml-2", isDark ? "text-purple-400" : "text-purple-600")}>
                  Description
                </Text>
              </View>
              <Text className={cn("text-base leading-6", isDark ? "text-gray-300" : "text-gray-700")}>
                {detailCommunity?.description || "A community for fitness lovers to share their journey"}
              </Text>
            </View>

            {/* Community Info */}
            <View
              className={cn(
                "rounded-3xl p-6 mb-4",
                isDark ? "bg-[#1a1a1a]" : "bg-gray-50"
              )}
            >
              <View className="flex-row items-center mb-4">
                <Ionicons name="information-circle" size={20} color="#9333ea" />
                <Text className={cn("text-lg font-bold ml-2", isDark ? "text-purple-400" : "text-purple-600")}>
                  Community Info
                </Text>
              </View>

              <View className="space-y-3">
                <View className="flex-row justify-between items-center py-3 border-b border-gray-700/30">
                  <Text className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                    Created
                  </Text>
                  <Text className={cn("text-base font-semibold", isDark ? "text-white" : "text-gray-900")}>
                    {detailCommunity?.createdAt ? new Date(detailCommunity.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric"
                    }) : "October 17, 2025"}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center py-3 border-b border-gray-700/30">
                  <Text className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                    Total Members
                  </Text>
                  <Text className={cn("text-base font-bold", isDark ? "text-white" : "text-gray-900")}>
                    {detailCommunity?.members.length || 0}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center py-3">
                  <Text className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                    Visibility
                  </Text>
                  <View className={detailCommunity?.isPrivate ? "bg-purple-500 px-3 py-1 rounded-full" : "bg-blue-500 px-3 py-1 rounded-full"}>
                    <Text className="text-white text-sm font-semibold">
                      {detailCommunity?.isPrivate ? "Private" : "Public"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Join Code (Admin Only) */}
            {detailCommunity && detailCommunity.admins && detailCommunity.admins.includes(currentUserId) && detailCommunity.joinCode && (
              <View
                className={cn(
                  "rounded-3xl p-6 mb-4",
                  isDark ? "bg-purple-900/20" : "bg-purple-50"
                )}
                style={{
                  borderWidth: 2,
                  borderColor: isDark ? "rgba(168, 85, 247, 0.3)" : "rgba(168, 85, 247, 0.2)",
                }}
              >
                <View className="flex-row items-center mb-4">
                  <Ionicons name="key" size={20} color="#a855f7" />
                  <Text className={cn("text-lg font-bold ml-2", isDark ? "text-purple-400" : "text-purple-600")}>
                    Admin: Invite Code
                  </Text>
                </View>
                
                <Text className={cn("text-sm mb-3", isDark ? "text-gray-400" : "text-gray-600")}>
                  Share this code with people to invite them to your private community
                </Text>

                <View 
                  className={cn(
                    "rounded-2xl p-4 flex-row items-center justify-between",
                    isDark ? "bg-[#1a1a1a]" : "bg-white"
                  )}
                >
                  <View className="flex-row items-center flex-1">
                    <Ionicons name="lock-closed" size={20} color="#a855f7" />
                    <Text 
                      className={cn(
                        "ml-3 text-2xl font-bold tracking-widest",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {detailCommunity.joinCode}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      alert(`Code copied: ${detailCommunity.joinCode}`);
                    }}
                    className="bg-purple-600 px-4 py-2 rounded-xl flex-row items-center"
                  >
                    <Ionicons name="copy" size={18} color="white" />
                    <Text className="text-white font-bold ml-2">Copy</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Friends List Modal */}
      <Modal
        visible={isFriendsListVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsFriendsListVisible(false)}
      >
        <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? "#000" : "#f9fafb" }}>
          <View className="flex-1">
            {/* Header */}
            <View
              className={cn("px-6 py-4 border-b", isDark ? "border-gray-800 bg-[#0a0a0a]" : "border-gray-200 bg-white")}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                    Friends
                  </Text>
                  <Text className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-gray-600")}>
                    Your username: {currentUserName}#{currentUserTag}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setIsFriendsListVisible(false)}
                  className={cn("w-10 h-10 rounded-full items-center justify-center", isDark ? "bg-gray-800" : "bg-gray-200")}
                >
                  <Ionicons name="close" size={24} color={isDark ? "#fff" : "#000"} />
                </Pressable>
              </View>
            </View>

            <ScrollView className="flex-1 px-6 py-4">
              {/* Add Friend Section */}
              <View className="mb-6">
                <Text className={cn("text-lg font-bold mb-3", isDark ? "text-white" : "text-gray-900")}>
                  Add Friend
                </Text>
                <View
                  className={cn("rounded-2xl p-4", isDark ? "bg-[#1a1a1a]" : "bg-white")}
                  style={{
                    shadowColor: isDark ? "#000" : "#1f2937",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Text className={cn("text-sm mb-2", isDark ? "text-gray-400" : "text-gray-600")}>
                    Enter friend's username#tag
                  </Text>
                  <View className="flex-row">
                    <TextInput
                      placeholder="username#1234"
                      placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                      className={cn(
                        "flex-1 px-4 py-3 rounded-xl mr-2",
                        isDark ? "bg-[#0a0a0a] text-white" : "bg-gray-100 text-gray-900"
                      )}
                    />
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        // TODO: Implement add friend logic
                        alert("Add friend functionality coming soon!");
                      }}
                      className="bg-purple-600 px-6 rounded-xl items-center justify-center"
                    >
                      <Ionicons name="person-add" size={20} color="white" />
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Friends List */}
              <Text className={cn("text-lg font-bold mb-3", isDark ? "text-white" : "text-gray-900")}>
                My Friends ({friends.length})
              </Text>

              {friends.length === 0 ? (
                <View className="items-center py-12">
                  <Ionicons name="people-outline" size={64} color={isDark ? "#6b7280" : "#9ca3af"} />
                  <Text className={cn("text-lg mt-4", isDark ? "text-gray-400" : "text-gray-600")}>
                    No friends yet
                  </Text>
                  <Text className={cn("text-sm mt-2 text-center", isDark ? "text-gray-500" : "text-gray-500")}>
                    Add friends to see their progress
                  </Text>
                </View>
              ) : (
                <View className="space-y-3">
                  {friends.map((friend) => (
                    <Pressable
                      key={friend.id}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        // Navigate to friend profile
                        navigation.navigate('FriendProfile', { friendId: friend.id });
                        setIsFriendsListVisible(false);
                      }}
                      className={cn(
                        "rounded-2xl p-4 mb-3",
                        isDark ? "bg-[#1a1a1a]" : "bg-white"
                      )}
                      style={{
                        shadowColor: isDark ? "#000" : "#1f2937",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      <View className="flex-row items-center">
                        <View
                          className="w-12 h-12 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: isDark ? "#9333ea" : "#e9d5ff" }}
                        >
                          <Text className={cn("text-xl font-bold", isDark ? "text-white" : "text-purple-700")}>
                            {friend.username.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className={cn("text-base font-bold", isDark ? "text-white" : "text-gray-900")}>
                            {friend.username}
                          </Text>
                          <Text className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                            #{friend.tag}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={isDark ? "#6b7280" : "#9ca3af"} />
                      </View>

                      {/* Sharing indicators */}
                      <View className="flex-row mt-3 space-x-2">
                        {friend.sharesSplits && (
                          <View className={cn("px-2 py-1 rounded-full", isDark ? "bg-blue-500/20" : "bg-blue-100")}>
                            <Text className={cn("text-xs font-semibold", isDark ? "text-blue-400" : "text-blue-700")}>
                              Splits
                            </Text>
                          </View>
                        )}
                        {friend.sharesNutrition && (
                          <View className={cn("px-2 py-1 rounded-full ml-2", isDark ? "bg-green-500/20" : "bg-green-100")}>
                            <Text className={cn("text-xs font-semibold", isDark ? "text-green-400" : "text-green-700")}>
                              Nutrition
                            </Text>
                          </View>
                        )}
                        {friend.sharesWorkouts && (
                          <View className={cn("px-2 py-1 rounded-full ml-2", isDark ? "bg-purple-500/20" : "bg-purple-100")}>
                            <Text className={cn("text-xs font-semibold", isDark ? "text-purple-400" : "text-purple-700")}>
                              Workouts
                            </Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
