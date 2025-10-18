import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ProgressIndicator } from "../../components/onboarding/ProgressIndicator";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { useOnboardingStore } from "../../state/onboardingStore";
import { cn } from "../../utils/cn";

export default function TrainingScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data, updateOnboardingData } = useOnboardingStore();
  const [frequency, setFrequency] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | undefined>(data.trainingFrequency);
  const [intensity, setIntensity] = useState<"light" | "moderate" | "intense" | undefined>(data.trainingIntensity);

  const intensities = [
    { value: "light" as const, label: "Light", icon: "walk-outline", desc: "New to fitness" },
    { value: "moderate" as const, label: "Moderate", icon: "bicycle-outline", desc: "Regular activity" },
    { value: "intense" as const, label: "Intense", icon: "flame-outline", desc: "Advanced training" },
  ];

  const handleContinue = () => {
    updateOnboardingData({ trainingFrequency: frequency, trainingIntensity: intensity });
    navigation.navigate("Injuries");
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <Pressable onPress={() => navigation.goBack()} className="mb-4">
            <Ionicons name="chevron-back" size={28} color={isDark ? "#fff" : "#000"} />
          </Pressable>
          <ProgressIndicator currentStep={5} totalSteps={7} isDark={isDark} />
          <Text className={cn("text-4xl font-bold mt-6 mb-3", isDark ? "text-white" : "text-gray-900")}>
            How often will you train?
          </Text>
          <Text className={cn("text-base mb-6", isDark ? "text-gray-400" : "text-gray-600")}>
            Days per week
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
            <View className="flex-row space-x-3 pr-6">
              {([1, 2, 3, 4, 5, 6, 7] as const).map((day) => (
                <Pressable
                  key={day}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFrequency(day);
                  }}
                  className={cn(
                    "w-16 h-16 rounded-2xl items-center justify-center",
                    frequency === day ? "bg-blue-500" : isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
                  )}
                >
                  <Text className={cn("text-2xl font-bold", frequency === day ? "text-white" : isDark ? "text-white" : "text-gray-900")}>
                    {day}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <Text className={cn("text-2xl font-bold mb-6", isDark ? "text-white" : "text-gray-900")}>
            Training Intensity
          </Text>
          <View className="space-y-3">
            {intensities.map((i) => (
              <Pressable
                key={i.value}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setIntensity(i.value);
                }}
                className={cn(
                  "rounded-3xl p-5 flex-row items-center",
                  intensity === i.value ? "bg-blue-500" : isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
                )}
              >
                <View className={cn("w-12 h-12 rounded-full items-center justify-center mr-4", intensity === i.value ? "bg-white/20" : "bg-blue-500/10")}>
                  <Ionicons name={i.icon as any} size={24} color={intensity === i.value ? "#fff" : "#3b82f6"} />
                </View>
                <View className="flex-1">
                  <Text className={cn("text-xl font-semibold", intensity === i.value ? "text-white" : isDark ? "text-white" : "text-gray-900")}>
                    {i.label}
                  </Text>
                  <Text className={cn("text-sm", intensity === i.value ? "text-white/80" : isDark ? "text-gray-400" : "text-gray-600")}>
                    {i.desc}
                  </Text>
                </View>
                {intensity === i.value && <Ionicons name="checkmark-circle" size={28} color="#fff" />}
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
      <View className="px-6 pb-6">
        <OnboardingButton title="Continue" onPress={handleContinue} disabled={!frequency || !intensity} />
      </View>
    </SafeAreaView>
  );
}
