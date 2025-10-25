import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, useSharedValue, withRepeat, withTiming, useAnimatedStyle } from "react-native-reanimated";
import { useOnboardingStore } from "../../state/onboardingStore";
import { generateWorkoutPlan, WorkoutPlanResult } from "../../api/onboarding-ai";
import { cn } from "../../utils/cn";

export default function GeneratingScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { getOnboardingData } = useOnboardingStore();
  const [statusIndex, setStatusIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const statuses = [
    "Calibrating volume targets...",
    "Balancing push/pull ratios...",
    "Estimating recovery windows...",
    "Personalizing accessory pools...",
    "Generating starter weights...",
  ];

  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 2000 }), -1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const generatePlan = async () => {
      try {
        const data = getOnboardingData();
        const result: WorkoutPlanResult = await generateWorkoutPlan(data);
        
        // Small delay for better UX
        setTimeout(() => {
          navigation.navigate("PlanSummary", { plan: result });
        }, 1000);
      } catch (err) {
        console.error("Error generating plan:", err);
        setError("Failed to generate plan. Please try again.");
      }
    };

    const timeout = setTimeout(generatePlan, 1000);
    return () => clearTimeout(timeout);
  }, []);

  if (error) {
    return (
      <SafeAreaView className={cn("flex-1 items-center justify-center px-6", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className={cn("text-2xl font-bold mt-4 text-center", isDark ? "text-white" : "text-gray-900")}>
          {error}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View style={animatedStyle} className="mb-8">
          <View
            className="w-32 h-32 rounded-full items-center justify-center"
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <Ionicons name="sparkles" size={64} color="#3b82f6" />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown}>
          <Text className={cn("text-3xl font-bold text-center mb-4", isDark ? "text-white" : "text-gray-900")}>
            Creating Your{"\n"}Personalized Plan...
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} className="mb-8">
          <Text className={cn("text-lg text-center", isDark ? "text-gray-400" : "text-gray-600")}>
            {statuses[statusIndex]}
          </Text>
        </Animated.View>

        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    </SafeAreaView>
  );
}
