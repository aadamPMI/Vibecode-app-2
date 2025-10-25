import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { cn } from "../../utils/cn";

export default function ProgressProjectionScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
              <Text className={cn("text-3xl font-bold text-center mb-8", isDark ? "text-white" : "text-gray-900")}>
                Here's where you could be in 8 weeks
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400)} className="w-full">
              {/* Simple progress projection visualization */}
              <View className={cn("p-6 rounded-3xl", isDark ? "bg-[#1a1a1a]" : "bg-gray-50")}>
                <View className="flex-row justify-between items-end mb-6">
                  <View className="items-center flex-1">
                    <View className="w-16 h-32 bg-gray-400 rounded-2xl mb-2" />
                    <Text className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                      Now
                    </Text>
                  </View>
                  <View className="items-center flex-1">
                    <View className="w-16 h-48 bg-blue-500 rounded-2xl mb-2" />
                    <Text className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>
                      8 Weeks
                    </Text>
                  </View>
                </View>

                <View className="items-center mt-4">
                  <Text className={cn("text-2xl font-bold mb-2", isDark ? "text-white" : "text-gray-900")}>
                    +20% Volume
                  </Text>
                  <Text className={cn("text-base text-center", isDark ? "text-gray-400" : "text-gray-600")}>
                    Average improvement with consistent training
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(600)}>
            <OnboardingButton
              title="Continue"
              onPress={() => navigation.navigate("Community")}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
