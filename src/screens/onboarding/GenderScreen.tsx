import React, { useState } from "react";
import { View, Text, Pressable, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { OnboardingNavigation } from "../../components/onboarding/OnboardingNavigation";
import { useOnboardingStore } from "../../state/onboardingStore";
import { cn } from "../../utils/cn";

export default function GenderScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data, updateOnboardingData } = useOnboardingStore();
  const [gender, setGender] = useState<"male" | "female" | "other" | undefined>(data.gender);

  const options = [
    { value: "male" as const, label: "Male", icon: "male-outline" },
    { value: "female" as const, label: "Female", icon: "female-outline" },
    { value: "other" as const, label: "Other", icon: "people-outline" },
  ];

  const handleContinue = () => {
    updateOnboardingData({ gender });
    navigation.navigate("WorkoutFrequency");
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <View className="flex-1">
        <View className="flex-1 px-6 py-8">
          <Text className={cn("text-4xl font-bold mb-3", isDark ? "text-white" : "text-gray-900")}>
            What's your gender?
          </Text>
          <Text className={cn("text-base mb-8", isDark ? "text-gray-400" : "text-gray-600")}>
            GainAI uses this to personalize recovery and load targets.
          </Text>

          <View className="flex-1">
            {options.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setGender(option.value);
                }}
                className={cn(
                  "flex-row items-center p-6 rounded-3xl mb-4",
                  gender === option.value ? "bg-blue-500" : isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
                )}
                style={{
                  shadowColor: gender === option.value ? "#3b82f6" : "transparent",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: gender === option.value ? 4 : 0,
                }}
              >
                <View
                  className={cn("w-14 h-14 rounded-full items-center justify-center mr-4")}
                  style={{ backgroundColor: gender === option.value ? "rgba(255,255,255,0.2)" : "rgba(59, 130, 246, 0.1)" }}
                >
                  <Ionicons name={option.icon as any} size={28} color={gender === option.value ? "#fff" : "#3b82f6"} />
                </View>
                <Text className={cn("text-xl font-semibold", gender === option.value ? "text-white" : isDark ? "text-white" : "text-gray-900")}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <OnboardingNavigation
          onBack={() => navigation.goBack()}
          onNext={handleContinue}
          canGoNext={!!gender}
        />
      </View>
    </SafeAreaView>
  );
}
