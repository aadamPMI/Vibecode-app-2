import React from "react";
import { View, Text, Pressable, useColorScheme, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { cn } from "../../utils/cn";

export default function CommunityScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const crews = [
    { name: "No-Gym Crew", members: "1.2k", color: "#10b981" },
    { name: "Beginner Strength", members: "850", color: "#3b82f6" },
    { name: "Dubai Runners", members: "324", color: "#ef4444" },
    { name: "Morning Lifters", members: "567", color: "#f59e0b" },
  ];

  return (
    <View className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <LinearGradient
        colors={
          isDark
            ? ["#0a0a0a", "#1a1a2e", "#0a0a0a"]
            : ["#ffffff", "#e0f2fe", "#ffffff"]
        }
        className="absolute inset-0"
      />

      <SafeAreaView className="flex-1 px-6 py-12">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(200)}>
            <Text className={cn("text-4xl font-bold text-center mb-4", isDark ? "text-white" : "text-gray-900")}>
              Progress is easier with others
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)}>
            <Text className={cn("text-lg text-center mb-12", isDark ? "text-gray-400" : "text-gray-600")}>
              Join a Crew that fits you
            </Text>
          </Animated.View>

          <View className="mb-8">
            {crews.map((crew, index) => (
              <Animated.View key={crew.name} entering={FadeInDown.delay(600 + index * 100)}>
                <Pressable
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  className={cn("p-6 rounded-3xl mb-4", isDark ? "bg-[#1a1a1a]" : "bg-white")}
                  style={{
                    shadowColor: crew.color,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: crew.color + "20" }}
                      >
                        <View className="w-6 h-6 rounded-full" style={{ backgroundColor: crew.color }} />
                      </View>
                      <View className="flex-1">
                        <Text className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>
                          {crew.name}
                        </Text>
                        <Text className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                          {crew.members} members
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </ScrollView>

        <Animated.View entering={FadeInDown.delay(1000)}>
          <OnboardingButton
            title="Continue"
            onPress={() => navigation.navigate("ExistingPlans")}
          />
          <Pressable onPress={() => navigation.navigate("ExistingPlans")} className="mt-4">
            <Text className={cn("text-center text-sm", isDark ? "text-gray-500" : "text-gray-500")}>
              Skip for now
            </Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
