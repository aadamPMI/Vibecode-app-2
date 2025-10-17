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
  const addComment = useCommunityStore((s) => s.addComment);
  const currentUserId = useCommunityStore((s) => s.currentUserId);
  const currentUserName = useCommunityStore((s) => s.currentUserName);

  const isDark = theme === "dark";
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null
  );
  const [isCreatePostModalVisible, setIsCreatePostModalVisible] =
    useState(false);

  // Create community form
  const [communityName, setCommunityName] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");

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
    }
  };

  const handleJoinCommunity = (communityId: string) => {
    joinCommunity(communityId, currentUserId);
  };

  const handleLeaveCommunity = (communityId: string) => {
    leaveCommunity(communityId, currentUserId);
  };

  const handleLikePost = (communityId: string, postId: string) => {
    likePost(communityId, postId, currentUserId);
  };

  const isMember = (community: Community) => {
    return community.members.includes(currentUserId);
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
    <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-gray-50")}>
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text
            className={cn(
              "text-3xl font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            Community
          </Text>
          <Pressable
            onPress={() => setIsCreateModalVisible(true)}
            className="bg-blue-500 px-4 py-2 rounded-full flex-row items-center"
          >
            <Ionicons name="add" size={24} color="white" />
            <Text className="text-white font-semibold ml-1">Create</Text>
          </Pressable>
        </View>

        {communities.length === 0 ? (
          <View className="flex-1 justify-center items-center">
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
                "text-sm mt-2",
                isDark ? "text-gray-500" : "text-gray-500"
              )}
            >
              Create one to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={communities}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  isMember(item) ? setSelectedCommunity(item) : null
                }
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
                <Text
                  className={cn(
                    "text-xl font-bold mb-2",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  {item.name}
                </Text>
                <Text
                  className={cn(
                    "text-sm mb-3",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  {item.description || "No description"}
                </Text>
                <View className="flex-row justify-between items-center">
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
                      {item.members.length} members
                    </Text>
                  </View>
                  {isMember(item) ? (
                    <Pressable
                      onPress={() => handleLeaveCommunity(item.id)}
                      className="bg-red-500 px-4 py-2 rounded-full"
                    >
                      <Text className="text-white font-semibold text-sm">
                        Leave
                      </Text>
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => handleJoinCommunity(item.id)}
                      className="bg-blue-500 px-4 py-2 rounded-full"
                    >
                      <Text className="text-white font-semibold text-sm">
                        Join
                      </Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            )}
          />
        )}
      </View>

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
                    onPress={() => setIsCreateModalVisible(false)}
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
              <Pressable onPress={() => setSelectedCommunity(null)}>
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
              onPress={() => setIsCreatePostModalVisible(true)}
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
                    onPress={() => setIsCreatePostModalVisible(false)}
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
