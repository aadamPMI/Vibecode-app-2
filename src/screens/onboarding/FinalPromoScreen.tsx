import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { cn } from "../../utils/cn";

export default function FinalPromoScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const features = [
    { icon: "barbell-outline", text: "Adaptive workout plans" },
    { icon: "nutrition-outline", text: "Smart nutrition tracking" },
    { icon: "people-outline", text: "Community support" },
    { icon: "trending-up-outline", text: "Real-time progress" },
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
        <View className="flex-1 justify-between">
          <View />

          <View className="items-center">
            <Animated.View entering={FadeIn.delay(200)} className="mb-8">
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
                <Ionicons name="rocket" size={64} color="#3b82f6" />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400)}>
              <Text className={cn("text-4xl font-bold text-center mb-6", isDark ? "text-white" : "text-gray-900")}>
                GainAI isn't just a tracker
              </Text>
              <Text className={cn("text-xl text-center mb-8", isDark ? "text-gray-400" : "text-gray-600")}>
                It's your adaptive coach
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600)} className="w-full">
              {features.map((feature, index) => (
                <View
                  key={index}
                  className={cn("flex-row items-center mb-4 px-4 py-3 rounded-2xl", isDark ? "bg-[#1a1a1a]" : "bg-gray-50")}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                  >
                    <Ionicons name={feature.icon as any} size={20} color="#3b82f6" />
                  </View>
                  <Text className={cn("text-base", isDark ? "text-white" : "text-gray-900")}>
                    {feature.text}
                  </Text>
                </View>
              ))}
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(800)}>
            <OnboardingButton
              title="Continue"
              onPress={() => navigation.navigate("ProgramPreview")}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
