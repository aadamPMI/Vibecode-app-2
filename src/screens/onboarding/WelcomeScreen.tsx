import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { cn } from "../../utils/cn";

export default function WelcomeScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <LinearGradient
        colors={
          isDark
            ? ["#0a0a0a", "#1a1a2e", "#0a0a0a"]
            : ["#ffffff", "#e0f2fe", "#ffffff"]
        }
        className="absolute inset-0"
      />

      <View className="flex-1 justify-between px-6 py-12">
        {/* Top spacing */}
        <View />

        {/* Center content */}
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
              <Ionicons name="fitness" size={64} color="#3b82f6" />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)}>
            <Text
              className={cn(
                "text-5xl font-bold text-center mb-4",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Welcome to GainAI
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600)}>
            <Text
              className={cn(
                "text-xl text-center mb-8 px-4",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              Your AI-Powered Fitness Journey Starts Here
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800)} className="w-full">
            <View className="bg-blue-500/10 rounded-3xl p-6 mb-8">
              <View className="flex-row items-center mb-4">
                <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                <Text
                  className={cn(
                    "text-base ml-3 flex-1",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Personalized workout plans
                </Text>
              </View>
              <View className="flex-row items-center mb-4">
                <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                <Text
                  className={cn(
                    "text-base ml-3 flex-1",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  AI-powered nutrition guidance
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                <Text
                  className={cn(
                    "text-base ml-3 flex-1",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Track your progress easily
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Bottom content */}
        <Animated.View entering={FadeInDown.delay(1000)}>
          <OnboardingButton
            title="Get Started"
            onPress={() => navigation.navigate("EmailSignUp")}
          />
          <Text
            className={cn(
              "text-sm text-center mt-4",
              isDark ? "text-gray-500" : "text-gray-500"
            )}
          >
            Takes less than 2 minutes
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
