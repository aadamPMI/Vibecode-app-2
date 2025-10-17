import React, { useState } from "react";
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
} from "../state/communityStore";
import { useSettingsStore } from "../state/settingsStore";
import { cn } from "../utils/cn";

export default function CommunityScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const communities = useCommunityStore((s) => s.communities);
  const createCommunity = useCommunityStore((s) => s.createCommunity);
  const joinCommunity = useCommunityStore((s) => s.joinCommunity);
  const leaveCommunity = useCommunityStore((s) => s.leaveCommunity);
  const addPost = useCommunityStore((s) => s.addPost);
  const likePost = useCommunityStore((s) => s.likePost);
  const currentUserId = useCommunityStore((s) => s.currentUserId);
  const currentUserName = useCommunityStore((s) => s.currentUserName);

  const isDark = theme === "dark";
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isJoinPrivateModalVisible, setIsJoinPrivateModalVisible] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null
  );
  const [isCreatePostModalVisible, setIsCreatePostModalVisible] =
    useState(false);
  const [activeView, setActiveView] = useState<"my" | "discover" | "trending" | null>(null);

  // Create community form
  const [communityName, setCommunityName] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  // Create post form
  const [postContent, setPostContent] = useState("");

  const handleCreateCommunity = () => {
    if (communityName.trim()) {
      const newCommunity: Community = {
        id: Date.now().toString(),
        name: communityName,
        description: communityDescription,
        members: [currentUserId],
        createdBy: currentUserId,
        createdAt: new Date().toISOString(),
        posts: [],
      };
      createCommunity(newCommunity);
      setCommunityName("");
      setCommunityDescription("");
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
    <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-white")}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-4 pb-4">
          <Text
            className={cn(
              "text-3xl font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            GainAI
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
              setActiveView(activeView === "my" ? null : "my");
            }}
            className={cn(
              "rounded-3xl p-6 mb-4",
              activeView === "my"
                ? "border-2 border-green-500"
                : isDark
                ? "bg-gray-800"
                : "bg-white"
            )}
            style={{
              shadowColor: activeView === "my" ? "#22c55e" : "#000",
              shadowOffset: { width: 0, height: activeView === "my" ? 6 : 4 },
              shadowOpacity: activeView === "my" ? 0.4 : 0.1,
              shadowRadius: activeView === "my" ? 16 : 12,
              elevation: activeView === "my" ? 8 : 5,
            }}
          >
            <View
              className="rounded-3xl p-5 mb-4"
              style={{ 
                backgroundColor: isDark ? "rgba(34, 197, 94, 0.15)" : "#bbf7d0",
                shadowColor: "#22c55e",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
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
                ? "bg-gray-800"
                : "bg-white"
            )}
            style={{
              shadowColor: activeView === "discover" ? "#3b82f6" : "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: activeView === "discover" ? 0.4 : 0.1,
              shadowRadius: activeView === "discover" ? 16 : 12,
              elevation: 5,
            }}
          >
            <View
              className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: isDark ? "rgba(147, 197, 253, 0.2)" : "#dbeafe" }}
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
                isDark ? "bg-gray-700" : "bg-gray-100"
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

          {/* Trending Card */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setActiveView(activeView === "trending" ? null : "trending");
            }}
            className={cn(
              "flex-1 rounded-3xl p-6 ml-2",
              activeView === "trending"
                ? "border-2 border-orange-500"
                : isDark
                ? "bg-gray-800"
                : "bg-white"
            )}
            style={{
              shadowColor: activeView === "trending" ? "#f97316" : "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: activeView === "trending" ? 0.4 : 0.1,
              shadowRadius: activeView === "trending" ? 16 : 12,
              elevation: 5,
            }}
          >
            <View
              className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: isDark ? "rgba(251, 146, 60, 0.15)" : "#fed7aa" }}
            >
              <Ionicons
                name="flame"
                size={32}
                color={isDark ? "#fb923c" : "#f97316"}
              />
            </View>
            <Text
              className={cn(
                "text-xl font-bold mb-2",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Trending
            </Text>
            <Text
              className={cn(
                "text-sm mb-3",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              Popular & active
            </Text>
            <View
              className={cn(
                "rounded-full px-3 py-1.5 self-start flex-row items-center",
                isDark ? "bg-gray-700" : "bg-gray-100"
              )}
            >
              <Ionicons
                name="flame"
                size={12}
                color={isDark ? "#fb923c" : "#f97316"}
              />
              <Text
                className={cn(
                  "text-xs font-semibold ml-1",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Hot
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

        {/* Community Details Panel - Shows when activeView is "my", "discover", or "trending" */}
        {activeView && getJoinedCommunities().length > 0 && activeView === "my" && (
          <Animated.View 
            entering={FadeInDown.duration(300).springify()}
            exiting={FadeOutUp.duration(200)}
            className="px-4 mb-4"
          >
            {getJoinedCommunities().map((community) => (
              <View
                key={community.id}
                className="rounded-3xl overflow-hidden mb-4"
                style={{
                  backgroundColor: isDark ? "rgba(236, 72, 153, 0.15)" : "#fce7f3",
                  shadowColor: "#ec4899",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 12,
                  elevation: 5,
                }}
              >
                {/* Header with gradient background */}
                <View
                  className="p-6"
                  style={{
                    backgroundColor: isDark ? "#ec4899" : "#f9a8d4",
                  }}
                >
                  <View className="flex-row items-center justify-between mb-4">
                    <View
                      className="w-20 h-20 rounded-full items-center justify-center border-4"
                      style={{
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.2)"
                          : "rgba(255, 255, 255, 0.4)",
                        borderColor: isDark ? "#fce7f3" : "#ffffff",
                      }}
                    >
                      <Ionicons name="people" size={40} color="#fff" />
                    </View>
                    <View className="flex-row">
                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        className="mr-2"
                      >
                        <View
                          className="w-12 h-12 rounded-2xl items-center justify-center"
                          style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                        >
                          <Ionicons name="star" size={24} color="#fbbf24" />
                        </View>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <View
                          className="w-12 h-12 rounded-2xl items-center justify-center"
                          style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                        >
                          <Ionicons name="globe" size={24} color="#22c55e" />
                        </View>
                      </Pressable>
                    </View>
                  </View>
                  <Text className="text-white text-3xl font-bold">
                    {community.name}
                  </Text>
                </View>

                {/* Content section */}
                <View className={cn("p-6", isDark ? "bg-gray-800" : "bg-white")}>
                  <Text
                    className={cn(
                      "text-base mb-4",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    {community.description || "A community for fitness lovers to share their journey"}
                  </Text>

                  <View className="flex-row mb-4">
                    <View
                      className={cn(
                        "rounded-full px-4 py-2 mr-2 flex-row items-center",
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      )}
                    >
                      <Ionicons
                        name="people"
                        size={16}
                        color={isDark ? "#9ca3af" : "#6b7280"}
                      />
                      <Text
                        className={cn(
                          "text-sm font-semibold ml-1",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        {community.members.length} members
                      </Text>
                    </View>
                    <View
                      className={cn(
                        "rounded-full px-4 py-2 flex-row items-center",
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      )}
                    >
                      <Ionicons
                        name="pulse"
                        size={16}
                        color={isDark ? "#22c55e" : "#16a34a"}
                      />
                      <Text
                        className={cn(
                          "text-sm font-semibold ml-1",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        Active today
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setSelectedCommunity(community);
                      }}
                      className="flex-1 bg-blue-500 py-4 rounded-2xl mr-2 flex-row items-center justify-center"
                    >
                      <Ionicons name="trophy" size={20} color="white" />
                      <Text className="text-white font-bold text-base ml-2">
                        View
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      className={cn(
                        "w-14 h-14 rounded-2xl items-center justify-center mr-2",
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      )}
                    >
                      <Ionicons
                        name="copy-outline"
                        size={24}
                        color={isDark ? "#fff" : "#000"}
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        handleLeaveCommunity(community.id);
                      }}
                      className="w-14 h-14 bg-red-500 rounded-2xl items-center justify-center"
                    >
                      <Ionicons name="close" size={24} color="white" />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </Animated.View>
        )}

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
                  isDark ? "bg-gray-800" : "bg-gray-100"
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

        {/* Trending Communities - Shows when activeView is "trending" */}
        {activeView === "trending" && (
          <Animated.View 
            entering={FadeInDown.duration(300).springify()}
            exiting={FadeOutUp.duration(200)}
            className="px-4 mb-20"
          >
            <Text
              className={cn(
                "text-xl font-bold mb-3",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Trending Communities
            </Text>
            <View className="items-center py-12">
              <Ionicons
                name="flame-outline"
                size={64}
                color={isDark ? "#6b7280" : "#9ca3af"}
              />
              <Text
                className={cn(
                  "text-lg mt-4",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                No trending communities
              </Text>
              <Text
                className={cn(
                  "text-sm mt-2 text-center",
                  isDark ? "text-gray-500" : "text-gray-500"
                )}
              >
                Check back later for hot communities
              </Text>
            </View>
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
          <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-gray-50")}>
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
                      ? "bg-gray-800 text-white"
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
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  )}
                />
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
        <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-gray-50")}>
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
                isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
              )}
              autoCapitalize="characters"
            />

            <Pressable
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setIsJoinPrivateModalVisible(false);
                setTimeout(() => {
                  alert("Private community feature coming soon!");
                }, 300);
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
        <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-gray-50")}>
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
                    isDark ? "bg-gray-800" : "bg-white"
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
          <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-gray-50")}>
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
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  )}
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
