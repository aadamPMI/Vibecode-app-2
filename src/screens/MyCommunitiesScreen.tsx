import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  useCommunityStore,
  Community,
} from "../state/communityStore";
import { useSettingsStore } from "../state/settingsStore";
import { cn } from "../utils/cn";

export default function MyCommunitiesScreen({ navigation }: any) {
  const theme = useSettingsStore((s) => s.theme);
  const communities = useCommunityStore((s) => s.communities);
  const currentUserId = useCommunityStore((s) => s.currentUserId);

  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === "system" ? (systemColorScheme || "light") : theme;
  const isDark = resolvedTheme === "dark";

  const getJoinedCommunities = () => {
    return communities.filter((c) => c.members.includes(currentUserId));
  };

  const handleCommunityPress = (community: Community) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate back to CommunityScreen and pass the community to open
    navigation.navigate("Community", { openCommunity: community });
  };

  const joinedCommunities = getJoinedCommunities();

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      {/* Header */}
      <View className="px-4 pt-4 pb-4 flex-row items-center">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
          className="mr-4"
        >
          <Ionicons
            name="arrow-back"
            size={28}
            color={isDark ? "#fff" : "#000"}
          />
        </Pressable>
        <View className="flex-1">
          <Text
            className={cn(
              "text-3xl font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            My Communities
          </Text>
          <Text
            className={cn(
              "text-sm mt-1",
              isDark ? "text-gray-400" : "text-gray-600"
            )}
          >
            {joinedCommunities.length} {joinedCommunities.length === 1 ? "community" : "communities"}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {joinedCommunities.length === 0 ? (
          <View className="items-center py-12 mt-20">
            <Ionicons
              name="people-outline"
              size={64}
              color={isDark ? "#6b7280" : "#9ca3af"}
            />
            <Text
              className={cn(
                "text-lg mt-4 font-semibold",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              No Communities Yet
            </Text>
            <Text
              className={cn(
                "text-sm mt-2 text-center px-8",
                isDark ? "text-gray-500" : "text-gray-500"
              )}
            >
              {"You haven't joined any communities. Go back to discover and join communities!"}
            </Text>
            <Pressable
              onPress={() => {
                navigation.goBack();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              className="mt-6 bg-green-500 px-6 py-3 rounded-2xl"
            >
              <Text className="text-white font-bold">Discover Communities</Text>
            </Pressable>
          </View>
        ) : (
          <Animated.View entering={FadeInDown.duration(300).springify()}>
            {joinedCommunities.map((community) => (
              <Pressable
                key={community.id}
                onPress={() => handleCommunityPress(community)}
                className="rounded-2xl overflow-hidden mb-4"
                style={{
                  backgroundColor: isDark ? "rgba(30, 30, 40, 0.6)" : "rgba(255, 255, 255, 0.7)",
                  borderWidth: 1,
                  borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
                  shadowColor: "#ec4899",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isDark ? 0.3 : 0.15,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                {/* Glass morphism backdrop */}
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: isDark 
                      ? "rgba(236, 72, 153, 0.08)" 
                      : "rgba(236, 72, 153, 0.05)",
                  }}
                />

                {/* Content */}
                <View className="flex-row items-center p-4">
                  {/* Community Icon */}
                  <View
                    className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(236, 72, 153, 0.25)"
                        : "rgba(236, 72, 153, 0.15)",
                      shadowColor: "#ec4899",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <Ionicons 
                      name="people" 
                      size={28} 
                      color={isDark ? "#f9a8d4" : "#ec4899"} 
                    />
                  </View>

                  {/* Community Info */}
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text
                        className={cn(
                          "text-lg font-bold flex-1",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                        numberOfLines={1}
                      >
                        {community.name}
                      </Text>
                      {community.isPrivate && (
                        <View className="bg-purple-500/20 px-2 py-1 rounded-lg ml-2">
                          <Ionicons name="lock-closed" size={12} color="#a855f7" />
                        </View>
                      )}
                    </View>
                    
                    {community.description && (
                      <Text
                        className={cn(
                          "text-sm mb-2",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}
                        numberOfLines={1}
                      >
                        {community.description}
                      </Text>
                    )}

                    <View className="flex-row items-center">
                      <View className="flex-row items-center mr-4">
                        <Ionicons
                          name="people"
                          size={14}
                          color={isDark ? "#9ca3af" : "#6b7280"}
                        />
                        <Text
                          className={cn(
                            "text-xs font-semibold ml-1",
                            isDark ? "text-gray-400" : "text-gray-600"
                          )}
                        >
                          {community.members.length} members
                        </Text>
                      </View>
                      {community.challenges && community.challenges.length > 0 && (
                        <View className="flex-row items-center mr-4">
                          <Ionicons
                            name="flag"
                            size={14}
                            color={isDark ? "#9ca3af" : "#6b7280"}
                          />
                          <Text
                            className={cn(
                              "text-xs font-semibold ml-1",
                              isDark ? "text-gray-400" : "text-gray-600"
                            )}
                          >
                            {community.challenges.length} challenges
                          </Text>
                        </View>
                      )}
                      <View className="flex-row items-center">
                        <View
                          className="w-2 h-2 rounded-full mr-1.5"
                          style={{ backgroundColor: "#22c55e" }}
                        />
                        <Text
                          className={cn(
                            "text-xs font-semibold",
                            isDark ? "text-gray-400" : "text-gray-600"
                          )}
                        >
                          Active
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Chevron */}
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center ml-2"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                  </View>
                </View>
              </Pressable>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
