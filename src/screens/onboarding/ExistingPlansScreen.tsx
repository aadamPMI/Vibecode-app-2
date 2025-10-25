import React, { useState } from "react";
import { View, Text, Pressable, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { OnboardingNavigation } from "../../components/onboarding/OnboardingNavigation";
import { useOnboardingStore } from "../../state/onboardingStore";
import { cn } from "../../utils/cn";

export default function ExistingPlansScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { updateOnboardingData } = useOnboardingStore();
  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    { value: "no", label: "No, create a new plan for me", icon: "add-circle-outline", desc: "AI will design everything from scratch" },
    { value: "diet", label: "I have a diet plan", icon: "nutrition-outline", desc: "AI will try to incorporate it" },
    { value: "training", label: "I have a training plan", icon: "barbell-outline", desc: "AI will adapt to your routine" },
    { value: "both", label: "I have both", icon: "checkmark-done-outline", desc: "AI will work with your existing setup" },
  ];

  const handleContinue = () => {
    updateOnboardingData({
      hasExistingPlan: selected !== "no",
      existingPlanType: selected === "no" ? "none" : (selected as any)
    });
    navigation.navigate("FinalPromo");
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <View className="flex-1 px-6 py-8">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <Ionicons name="chevron-back" size={28} color={isDark ? "#fff" : "#000"} />
        </Pressable>

        <Text className={cn("text-4xl font-bold mb-3", isDark ? "text-white" : "text-gray-900")}>
          Do you have existing plans?
        </Text>
        <Text className={cn("text-base mb-8", isDark ? "text-gray-400" : "text-gray-600")}>
          We'll work with what you already have
        </Text>

        <View className="flex-1">
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setSelected(option.value);
              }}
              className={cn(
                "p-6 rounded-3xl mb-4",
                selected === option.value ? "bg-blue-500" : isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
              )}
              style={{
                shadowColor: selected === option.value ? "#3b82f6" : "transparent",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: selected === option.value ? 4 : 0,
              }}
            >
              <View className="flex-row items-center mb-2">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: selected === option.value ? "rgba(255,255,255,0.2)" : "rgba(59, 130, 246, 0.1)" }}
                >
                  <Ionicons name={option.icon as any} size={24} color={selected === option.value ? "#fff" : "#3b82f6"} />
                </View>
                <Text className={cn("text-lg font-semibold flex-1", selected === option.value ? "text-white" : isDark ? "text-white" : "text-gray-900")}>
                  {option.label}
                </Text>
              </View>
              <Text className={cn("text-sm ml-1", selected === option.value ? "text-white/80" : isDark ? "text-gray-400" : "text-gray-600")}>
                {option.desc}
              </Text>
            </Pressable>
          ))}
        </View>

        <OnboardingNavigation
          onBack={() => navigation.goBack()}
          onNext={handleContinue}
          canGoNext={!!selected}
        />
      </View>
    </SafeAreaView>
  );
}
