import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { cn } from "../../utils/cn";

export default function IntroPromoScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const features = [
    { icon: "barbell-outline", text: "Adaptive training powered by AI" },
    { icon: "nutrition-outline", text: "Personalized nutrition tracking" },
    { icon: "people-outline", text: "Community accountability" },
    { icon: "trending-up-outline", text: "Real progress tracking" },
    { icon: "flask-outline", text: "Science-based results" },
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
          {/* Top spacing */}
          <View />

          {/* Center content */}
          <View className="items-center">
            <Animated.View entering={FadeInDown.delay(200)} className="mb-12">
              <View
                className="w-32 h-32 rounded-full items-center justify-center mb-6"
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  elevation: 8,
                }}
              >
                <Ionicons name="fitness" size={64} color="#3b82f6" />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400)} className="w-full">
              {features.map((feature, index) => (
                <View
                  key={index}
                  className={cn(
                    "flex-row items-center mb-5 px-4 py-4 rounded-2xl",
                    isDark ? "bg-[#1a1a1a]" : "bg-gray-50"
                  )}
                >
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                  >
                    <Ionicons name={feature.icon as any} size={24} color="#3b82f6" />
                  </View>
                  <Text
                    className={cn(
                      "text-base flex-1",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    {feature.text}
                  </Text>
                </View>
              ))}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600)} className="mt-6">
              <Text
                className={cn(
                  "text-sm text-center italic",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                Train smarter. Let's get started.
              </Text>
            </Animated.View>
          </View>

          {/* Bottom button */}
          <Animated.View entering={FadeInDown.delay(800)}>
            <OnboardingButton
              title="Continue"
              onPress={() => navigation.navigate("Gender")}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
