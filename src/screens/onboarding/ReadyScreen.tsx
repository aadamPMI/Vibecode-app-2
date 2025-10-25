import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { useOnboardingStore } from "../../state/onboardingStore";
import { useAuthStore } from "../../state/authStore";
import { cn } from "../../utils/cn";

export default function ReadyScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { clearOnboardingData } = useOnboardingStore();
  const { completeOnboarding } = useAuthStore();

  const handleStart = () => {
    completeOnboarding();
    clearOnboardingData();
    // Navigation will be handled automatically by auth state change
  };

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
        <View className="flex-1 justify-between">
          <View />

          <View className="items-center">
            <Animated.View entering={FadeIn.delay(200)} className="mb-8">
              <View
                className="w-40 h-40 rounded-full items-center justify-center"
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  elevation: 8,
                }}
              >
                <Ionicons name="rocket" size={80} color="#3b82f6" />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400)}>
              <Text className={cn("text-5xl font-bold text-center mb-6", isDark ? "text-white" : "text-gray-900")}>
                You're All Set!
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600)}>
              <Text className={cn("text-2xl text-center mb-4", isDark ? "text-gray-300" : "text-gray-700")}>
                Your personalized training engine is ready
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(800)}>
              <Text className={cn("text-lg text-center italic", isDark ? "text-gray-400" : "text-gray-600")}>
                Let's start building your best self
              </Text>
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(1000)}>
            <OnboardingButton
              title="Start My Plan"
              onPress={handleStart}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
