import React from "react";
import { View, Text, ScrollView, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { useOnboardingStore } from "../../state/onboardingStore";
import { saveOnboardingToStores } from "../../utils/onboarding-utils";
import { WorkoutPlanResult } from "../../api/onboarding-ai";
import { cn } from "../../utils/cn";

export default function ResultsScreen({ route, navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { getOnboardingData, clearOnboardingData } = useOnboardingStore();
  const plan: WorkoutPlanResult = route.params?.plan;

  const handleStart = () => {
    const data = getOnboardingData();
    saveOnboardingToStores(data, plan);
    clearOnboardingData();
    // Navigation will automatically redirect to main app
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-8">
          <Animated.View entering={FadeInDown} className="items-center mb-8">
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-4"
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                shadowColor: "#10b981",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 8,
              }}
            >
              <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            </View>
            <Text className={cn("text-4xl font-bold text-center", isDark ? "text-white" : "text-gray-900")}>
              Your Plan is Ready! 🎉
            </Text>
            <Text className={cn("text-lg text-center mt-2", isDark ? "text-gray-400" : "text-gray-600")}>
              Here's what we recommend
            </Text>
          </Animated.View>

          {/* Calories Card */}
          <Animated.View
            entering={FadeInDown.delay(200)}
            className={cn("rounded-3xl p-6 mb-4", isDark ? "bg-[#1a1a1a]" : "bg-gray-100")}
          >
            <Text className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-gray-900")}>
              Daily Nutrition
            </Text>
            <View className="items-center mb-4">
              <Text className={cn("text-5xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                {plan.dailyCalories}
              </Text>
              <Text className={cn("text-base", isDark ? "text-gray-400" : "text-gray-600")}>
                calories per day
              </Text>
            </View>
            <View className="space-y-3">
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full bg-red-500 mr-3" />
                <Text className={cn("flex-1", isDark ? "text-gray-300" : "text-gray-700")}>
                  Protein
                </Text>
                <Text className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                  {plan.protein}g
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full bg-orange-500 mr-3" />
                <Text className={cn("flex-1", isDark ? "text-gray-300" : "text-gray-700")}>
                  Carbs
                </Text>
                <Text className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                  {plan.carbs}g
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-4 h-4 rounded-full bg-pink-500 mr-3" />
                <Text className={cn("flex-1", isDark ? "text-gray-300" : "text-gray-700")}>
                  Fats
                </Text>
                <Text className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                  {plan.fats}g
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Workout Plan Card */}
          <Animated.View
            entering={FadeInDown.delay(400)}
            className={cn("rounded-3xl p-6 mb-4", isDark ? "bg-[#1a1a1a]" : "bg-gray-100")}
          >
            <Text className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-gray-900")}>
              Your Weekly Split
            </Text>
            <View className="space-y-2">
              {plan.workoutSplit.map((workout, index) => (
                <View key={index} className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
                  <Text className={cn("ml-3", isDark ? "text-gray-300" : "text-gray-700")}>
                    {workout}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Timeline Card */}
          <Animated.View
            entering={FadeInDown.delay(600)}
            className={cn("rounded-3xl p-6 mb-6", isDark ? "bg-[#1a1a1a]" : "bg-gray-100")}
          >
            <Text className={cn("text-lg font-semibold mb-2", isDark ? "text-white" : "text-gray-900")}>
              Estimated Timeline
            </Text>
            <Text className={cn("text-4xl font-bold", isDark ? "text-white" : "text-gray-900")}>
              {plan.estimatedWeeks} weeks
            </Text>
            <Text className={cn("text-base", isDark ? "text-gray-400" : "text-gray-600")}>
              to reach your goal
            </Text>
            {plan.additionalNotes && (
              <View className="mt-4 pt-4 border-t border-gray-700/30">
                <Text className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                  {plan.additionalNotes}
                </Text>
              </View>
            )}
          </Animated.View>
        </View>
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(800)} className="px-6 pb-6">
        <OnboardingButton title="Start Your Journey" onPress={handleStart} />
        <Text className={cn("text-sm text-center mt-4", isDark ? "text-gray-500" : "text-gray-500")}>
          You can adjust these settings later in Settings
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}
