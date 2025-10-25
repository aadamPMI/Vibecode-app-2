import React from "react";
import { View, Text, useColorScheme, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { useOnboardingStore } from "../../state/onboardingStore";
import { cn } from "../../utils/cn";

export default function ProgramPreviewScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data } = useOnboardingStore();

  const frequency = data.workoutFrequency || "3-5";
  const equipment = data.equipment?.[0] || "dumbbells";

  const days = ["Mon", "Wed", "Fri"];

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text className={cn("text-4xl font-bold text-center mb-4", isDark ? "text-white" : "text-gray-900")}>
            Your Program Preview
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)}>
          <Text className={cn("text-lg text-center mb-8", isDark ? "text-gray-400" : "text-gray-600")}>
            Based on your preferences
          </Text>
        </Animated.View>

        {/* Program Summary */}
        <Animated.View entering={FadeInDown.delay(600)} className={cn("p-6 rounded-3xl mb-6", isDark ? "bg-[#1a1a1a]" : "bg-gray-50")}>
          <View className="items-center mb-6">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
            >
              <Ionicons name="barbell" size={40} color="#3b82f6" />
            </View>
            <Text className={cn("text-2xl font-bold mb-2", isDark ? "text-white" : "text-gray-900")}>
              Full-Body {frequency === "6+" ? "6×" : frequency === "3-5" ? "3×" : "2×"}
            </Text>
            <Text className={cn("text-base", isDark ? "text-gray-400" : "text-gray-600")}>
              45–60 min • {equipment.charAt(0).toUpperCase() + equipment.slice(1)}
            </Text>
          </View>

          {/* Weekly Schedule */}
          <View>
            <Text className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-gray-900")}>
              Weekly Schedule
            </Text>
            <View className="flex-row justify-around">
              {days.map((day, index) => (
                <View key={index} className="items-center">
                  <View
                    className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                    style={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }}
                  >
                    <Text className="text-blue-500 font-bold text-lg">{day}</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Program Highlights */}
        <Animated.View entering={FadeInDown.delay(800)} className="mb-8">
          {[
            { icon: "flash-outline", text: "Progressive overload built-in" },
            { icon: "sync-outline", text: "Adapts to your recovery" },
            { icon: "analytics-outline", text: "Tracks all your PRs" },
          ].map((item, index) => (
            <View key={index} className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
              >
                <Ionicons name={item.icon as any} size={20} color="#3b82f6" />
              </View>
              <Text className={cn("text-base flex-1", isDark ? "text-white" : "text-gray-900")}>
                {item.text}
              </Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      <View className="px-6 pb-6">
        <Animated.View entering={FadeInDown.delay(1000)}>
          <OnboardingButton
            title="Generate My Training Plan"
            onPress={() => navigation.navigate("Generating")}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
