import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ProgressIndicator } from "../../components/onboarding/ProgressIndicator";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { useOnboardingStore } from "../../state/onboardingStore";
import { cn } from "../../utils/cn";

type Goal = "lose_weight" | "build_muscle" | "improve_endurance" | "general_fitness" | "strength_training";

export default function FitnessGoalScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data, updateOnboardingData } = useOnboardingStore();
  const [goal, setGoal] = useState<Goal | undefined>(data.primaryGoal);

  const goals = [
    { value: "lose_weight" as const, label: "Lose Weight", icon: "scale-outline", color: "#ef4444", desc: "Burn fat and slim down" },
    { value: "build_muscle" as const, label: "Build Muscle", icon: "barbell-outline", color: "#fb923c", desc: "Gain size and strength" },
    { value: "improve_endurance" as const, label: "Improve Endurance", icon: "bicycle-outline", color: "#3b82f6", desc: "Boost stamina and cardio" },
    { value: "general_fitness" as const, label: "General Fitness", icon: "fitness-outline", color: "#10b981", desc: "Stay healthy and active" },
    { value: "strength_training" as const, label: "Strength Training", icon: "medal-outline", color: "#a855f7", desc: "Build raw power" },
  ];

  const handleContinue = () => {
    updateOnboardingData({ primaryGoal: goal });
    navigation.navigate("Training");
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <Pressable onPress={() => navigation.goBack()} className="mb-4">
            <Ionicons name="chevron-back" size={28} color={isDark ? "#fff" : "#000"} />
          </Pressable>
          <ProgressIndicator currentStep={4} totalSteps={7} isDark={isDark} />
          <Text className={cn("text-4xl font-bold mt-6 mb-3", isDark ? "text-white" : "text-gray-900")}>
            What's your primary goal?
          </Text>
          <Text className={cn("text-base mb-8", isDark ? "text-gray-400" : "text-gray-600")}>
            We'll customize your plan accordingly
          </Text>
          <View className="flex-row flex-wrap">
            {goals.map((g) => (
              <Pressable
                key={g.value}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setGoal(g.value);
                }}
                className={cn(
                  "w-[48%] rounded-3xl p-5 mb-4",
                  goal === g.value ? "bg-blue-500" : isDark ? "bg-[#1a1a1a]" : "bg-gray-100",
                  g.value === "lose_weight" || g.value === "improve_endurance" ? "mr-[4%]" : ""
                )}
                style={{
                  shadowColor: goal === g.value ? "#3b82f6" : "transparent",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: goal === g.value ? 4 : 0,
                }}
              >
                <View className="items-center">
                  <View
                    className={cn("w-16 h-16 rounded-full items-center justify-center mb-3", goal === g.value ? "bg-white/20" : "")}
                    style={{ backgroundColor: goal === g.value ? "rgba(255,255,255,0.2)" : g.color + "20" }}
                  >
                    <Ionicons name={g.icon as any} size={32} color={goal === g.value ? "#fff" : g.color} />
                  </View>
                  <Text className={cn("text-base font-bold text-center mb-1", goal === g.value ? "text-white" : isDark ? "text-white" : "text-gray-900")}>
                    {g.label}
                  </Text>
                  <Text className={cn("text-xs text-center", goal === g.value ? "text-white/80" : isDark ? "text-gray-400" : "text-gray-600")}>
                    {g.desc}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
      <View className="px-6 pb-6">
        <OnboardingButton title="Continue" onPress={handleContinue} disabled={!goal} />
      </View>
    </SafeAreaView>
  );
}
