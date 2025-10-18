import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, useColorScheme, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ProgressIndicator } from "../../components/onboarding/ProgressIndicator";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { useOnboardingStore } from "../../state/onboardingStore";
import { isWeightGoalSafe } from "../../utils/onboarding-utils";
import { cn } from "../../utils/cn";

type TimeframeOption = "1_month" | "3_months" | "6_months" | "1_year" | "custom";

export default function TimeframeScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data, updateOnboardingData } = useOnboardingStore();

  const [timeframe, setTimeframe] = useState<TimeframeOption>(data.timeframe || "3_months");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customMonths, setCustomMonths] = useState("");

  const timeframes = [
    { value: "1_month" as const, label: "1 Month", days: 30, icon: "flash" },
    { value: "3_months" as const, label: "3 Months", days: 90, icon: "calendar", recommended: true },
    { value: "6_months" as const, label: "6 Months", days: 180, icon: "time" },
    { value: "1_year" as const, label: "1 Year", days: 365, icon: "trending-up" },
    { value: "custom" as const, label: "Custom", days: 0, icon: "create" },
  ];

  const handleContinue = () => {
    if (timeframe === "custom") {
      const days = parseInt(customMonths) * 30;
      updateOnboardingData({ timeframe, customTimeframeDays: days });
    } else {
      const selected = timeframes.find((t) => t.value === timeframe);
      updateOnboardingData({ timeframe, customTimeframeDays: selected?.days });
    }

    // Check if goal is safe
    if (data.currentWeightKg && data.targetWeightKg) {
      const days = timeframe === "custom" ? parseInt(customMonths) * 30 : timeframes.find((t) => t.value === timeframe)?.days || 90;
      const safety = isWeightGoalSafe(data.currentWeightKg, data.targetWeightKg, days);
      if (!safety.safe) {
        // Show warning but allow to continue
        console.warn(safety.message);
      }
    }

    navigation.navigate("FitnessGoal");
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <Pressable onPress={() => navigation.goBack()} className="mb-4">
            <Ionicons name="chevron-back" size={28} color={isDark ? "#fff" : "#000"} />
          </Pressable>

          <ProgressIndicator currentStep={3} totalSteps={7} isDark={isDark} />

          <Text className={cn("text-4xl font-bold mt-6 mb-3", isDark ? "text-white" : "text-gray-900")}>
            When do you want to reach your goal?
          </Text>
          <Text className={cn("text-base mb-8", isDark ? "text-gray-400" : "text-gray-600")}>
            Choose a realistic timeframe
          </Text>

          <View className="space-y-3">
            {timeframes.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setTimeframe(option.value);
                  if (option.value === "custom") setShowCustomModal(true);
                }}
                className={cn(
                  "rounded-3xl p-5 flex-row items-center",
                  timeframe === option.value ? "bg-blue-500 border-2 border-blue-500" : isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
                )}
                style={{
                  shadowColor: timeframe === option.value ? "#3b82f6" : "transparent",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: timeframe === option.value ? 4 : 0,
                }}
              >
                <View
                  className={cn(
                    "w-12 h-12 rounded-full items-center justify-center mr-4",
                    timeframe === option.value ? "bg-white/20" : "bg-blue-500/10"
                  )}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={timeframe === option.value ? "#fff" : "#3b82f6"}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={cn(
                      "text-xl font-semibold",
                      timeframe === option.value ? "text-white" : isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    {option.label}
                  </Text>
                  {option.recommended && (
                    <Text className="text-sm text-blue-300 mt-1">Recommended</Text>
                  )}
                </View>
                {timeframe === option.value && <Ionicons name="checkmark-circle" size={28} color="#fff" />}
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Custom Timeframe Modal */}
      <Modal visible={showCustomModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className={cn("rounded-t-3xl p-6", isDark ? "bg-[#1a1a1a]" : "bg-white")}>
            <Text className={cn("text-2xl font-bold mb-4", isDark ? "text-white" : "text-gray-900")}>
              Custom Timeframe
            </Text>
            <Text className={cn("text-base mb-4", isDark ? "text-gray-400" : "text-gray-600")}>
              How many months?
            </Text>
            <TextInput
              value={customMonths}
              onChangeText={setCustomMonths}
              placeholder="6"
              keyboardType="numeric"
              placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
              className={cn("rounded-2xl p-4 text-lg mb-6", isDark ? "bg-[#0a0a0a] text-white" : "bg-gray-100 text-gray-900")}
            />
            <OnboardingButton
              title="Set Timeframe"
              onPress={() => {
                if (customMonths) {
                  setShowCustomModal(false);
                }
              }}
              disabled={!customMonths}
            />
            <Pressable onPress={() => setShowCustomModal(false)} className="mt-3 items-center">
              <Text className="text-blue-500 text-base">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View className="px-6 pb-6">
        <OnboardingButton
          title="Continue"
          onPress={handleContinue}
          disabled={timeframe === "custom" && !customMonths}
        />
      </View>
    </SafeAreaView>
  );
}
