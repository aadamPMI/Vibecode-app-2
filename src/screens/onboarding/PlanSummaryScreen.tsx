import React from "react";
import { View, Text, useColorScheme, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { cn } from "../../utils/cn";

export default function PlanSummaryScreen({ navigation, route }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const plan = route.params?.plan;

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(200)}>
          <View className="items-center mb-8">
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-4"
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                shadowColor: "#3b82f6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Ionicons name="checkmark-circle" size={60} color="#10b981" />
            </View>
            <Text className={cn("text-3xl font-bold text-center mb-2", isDark ? "text-white" : "text-gray-900")}>
              Your Plan is Ready!
            </Text>
            <Text className={cn("text-base text-center", isDark ? "text-gray-400" : "text-gray-600")}>
              AI-Generated Summary
            </Text>
          </View>
        </Animated.View>

        {/* Plan Details */}
        <Animated.View entering={FadeInDown.delay(400)} className={cn("p-6 rounded-3xl mb-6", isDark ? "bg-[#1a1a1a]" : "bg-gray-50")}>
          <Text className={cn("text-xl font-bold mb-4", isDark ? "text-white" : "text-gray-900")}>
            Program Overview
          </Text>
          <View className="space-y-3">
            <View className="flex-row items-center mb-3">
              <Ionicons name="barbell-outline" size={24} color="#3b82f6" className="mr-3" />
              <View className="flex-1 ml-3">
                <Text className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                  Split Type
                </Text>
                <Text className={cn("text-base font-semibold", isDark ? "text-white" : "text-gray-900")}>
                  Full-Body 3×
                </Text>
              </View>
            </View>
            <View className="flex-row items-center mb-3">
              <Ionicons name="time-outline" size={24} color="#3b82f6" className="mr-3" />
              <View className="flex-1 ml-3">
                <Text className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                  Weekly Duration
                </Text>
                <Text className={cn("text-base font-semibold", isDark ? "text-white" : "text-gray-900")}>
                  ~180 minutes
                </Text>
              </View>
            </View>
            <View className="flex-row items-center mb-3">
              <Ionicons name="flame-outline" size={24} color="#3b82f6" className="mr-3" />
              <View className="flex-1 ml-3">
                <Text className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                  Daily Calories
                </Text>
                <Text className={cn("text-base font-semibold", isDark ? "text-white" : "text-gray-900")}>
                  {plan?.dailyCalories || 2000} kcal
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="nutrition-outline" size={24} color="#3b82f6" className="mr-3" />
              <View className="flex-1 ml-3">
                <Text className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                  Macros
                </Text>
                <Text className={cn("text-base font-semibold", isDark ? "text-white" : "text-gray-900")}>
                  P: {plan?.protein || 150}g • C: {plan?.carbs || 200}g • F: {plan?.fats || 65}g
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Week 1 Preview */}
        <Animated.View entering={FadeInDown.delay(600)} className={cn("p-6 rounded-3xl mb-6", isDark ? "bg-[#1a1a1a]" : "bg-gray-50")}>
          <Text className={cn("text-xl font-bold mb-4", isDark ? "text-white" : "text-gray-900")}>
            Week 1 Outline
          </Text>
          {["Day 1: Full Body", "Day 2: Rest", "Day 3: Full Body", "Day 4: Rest", "Day 5: Full Body"].map((day, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <Ionicons
                name={day.includes("Rest") ? "moon-outline" : "fitness-outline"}
                size={20}
                color={day.includes("Rest") ? "#6b7280" : "#3b82f6"}
              />
              <Text className={cn("ml-3", isDark ? (day.includes("Rest") ? "text-gray-500" : "text-white") : (day.includes("Rest") ? "text-gray-500" : "text-gray-900"))}>
                {day}
              </Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      <View className="px-6 pb-6">
        <Animated.View entering={FadeInDown.delay(800)}>
          <OnboardingButton
            title="Start Free Trial"
            onPress={() => navigation.navigate("Ready")}
          />
          <Text className={cn("text-center text-sm mt-3", isDark ? "text-gray-500" : "text-gray-500")}>
            or continue with free version
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
