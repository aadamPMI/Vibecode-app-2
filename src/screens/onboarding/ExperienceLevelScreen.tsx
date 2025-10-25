import React, { useState } from "react";
import { View, Text, Pressable, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { useOnboardingStore } from "../../state/onboardingStore";
import { cn } from "../../utils/cn";

export default function ExperienceLevelScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data, updateOnboardingData } = useOnboardingStore();
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced" | undefined>(data.experienceLevel);

  const options = [
    { value: "beginner" as const, label: "Beginner", desc: "New to lifting or less than 6 months", icon: "leaf-outline", color: "#10b981" },
    { value: "intermediate" as const, label: "Intermediate", desc: "6 months to 2 years of training", icon: "barbell-outline", color: "#3b82f6" },
    { value: "advanced" as const, label: "Advanced", desc: "2+ years of consistent training", icon: "trophy-outline", color: "#a855f7" },
  ];

  const handleContinue = () => {
    updateOnboardingData({ experienceLevel: level });
    navigation.navigate("EquipmentAccess");
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <View className="flex-1 px-6 py-8">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <Ionicons name="chevron-back" size={28} color={isDark ? "#fff" : "#000"} />
        </Pressable>

        <Text className={cn("text-4xl font-bold mb-3", isDark ? "text-white" : "text-gray-900")}>
          What's your training experience?
        </Text>
        <Text className={cn("text-base mb-8", isDark ? "text-gray-400" : "text-gray-600")}>
          We'll use this to determine progression speed and plan difficulty
        </Text>

        <View className="flex-1">
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setLevel(option.value);
              }}
              className={cn(
                "p-6 rounded-3xl mb-4",
                level === option.value ? "bg-blue-500" : isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
              )}
              style={{
                shadowColor: level === option.value ? "#3b82f6" : "transparent",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: level === option.value ? 4 : 0,
              }}
            >
              <View className="flex-row items-center mb-2">
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                  style={{ backgroundColor: level === option.value ? "rgba(255,255,255,0.2)" : option.color + "20" }}
                >
                  <Ionicons name={option.icon as any} size={28} color={level === option.value ? "#fff" : option.color} />
                </View>
                <Text className={cn("text-xl font-semibold flex-1", level === option.value ? "text-white" : isDark ? "text-white" : "text-gray-900")}>
                  {option.label}
                </Text>
              </View>
              <Text className={cn("text-sm ml-1", level === option.value ? "text-white/80" : isDark ? "text-gray-400" : "text-gray-600")}>
                {option.desc}
              </Text>
            </Pressable>
          ))}
        </View>

        <OnboardingButton title="Continue" onPress={handleContinue} disabled={!level} />
      </View>
    </SafeAreaView>
  );
}
