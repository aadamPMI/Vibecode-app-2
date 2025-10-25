import React, { useState } from "react";
import { View, Text, Pressable, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { OnboardingNavigation } from "../../components/onboarding/OnboardingNavigation";
import { useOnboardingStore } from "../../state/onboardingStore";
import { cn } from "../../utils/cn";

export default function WorkoutFrequencyScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data, updateOnboardingData } = useOnboardingStore();
  const [frequency, setFrequency] = useState<"0-2" | "3-5" | "6+" | undefined>(data.workoutFrequency);

  const options = [
    { value: "0-2" as const, label: "0-2 times per week", icon: "walk-outline", color: "#10b981" },
    { value: "3-5" as const, label: "3-5 times per week", icon: "barbell-outline", color: "#3b82f6" },
    { value: "6+" as const, label: "6+ times per week", icon: "flame-outline", color: "#ef4444" },
  ];

  const handleContinue = () => {
    updateOnboardingData({ workoutFrequency: frequency });
    navigation.navigate("ExperienceLevel");
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <View className="flex-1">
        <View className="flex-1 px-6 py-8">

        <Text className={cn("text-4xl font-bold mb-3", isDark ? "text-white" : "text-gray-900")}>
          How often do you plan to workout?
        </Text>
        <Text className={cn("text-base mb-8", isDark ? "text-gray-400" : "text-gray-600")}>
          We'll optimize your training schedule
        </Text>

        <View className="flex-1">
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setFrequency(option.value);
              }}
              className={cn(
                "p-6 rounded-3xl mb-4",
                frequency === option.value ? "bg-blue-500" : isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
              )}
              style={{
                shadowColor: frequency === option.value ? "#3b82f6" : "transparent",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: frequency === option.value ? 4 : 0,
              }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                  style={{ backgroundColor: frequency === option.value ? "rgba(255,255,255,0.2)" : option.color + "20" }}
                >
                  <Ionicons name={option.icon as any} size={32} color={frequency === option.value ? "#fff" : option.color} />
                </View>
                <Text className={cn("text-xl font-semibold flex-1", frequency === option.value ? "text-white" : isDark ? "text-white" : "text-gray-900")}>
                  {option.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
        </View>

        <OnboardingNavigation
          onBack={() => navigation.goBack()}
          onNext={handleContinue}
          canGoNext={!!frequency}
        />
      </View>
    </SafeAreaView>
  );
}
