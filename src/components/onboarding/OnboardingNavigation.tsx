import React from "react";
import { View, Pressable, Text, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { cn } from "../../utils/cn";

interface OnboardingNavigationProps {
  onBack: () => void;
  onNext: () => void;
  canGoNext: boolean;
  nextLabel?: string;
  showBack?: boolean;
}

export function OnboardingNavigation({
  onBack,
  onNext,
  canGoNext,
  nextLabel = "Next",
  showBack = true,
}: OnboardingNavigationProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  const handleNext = () => {
    if (canGoNext) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onNext();
    }
  };

  return (
    <View className="flex-row items-center justify-between px-6 py-4">
      {showBack ? (
        <Pressable
          onPress={handleBack}
          className={cn(
            "flex-row items-center px-4 py-3 rounded-full",
            isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
          )}
        >
          <Ionicons name="chevron-back" size={20} color={isDark ? "#fff" : "#000"} />
          <Text className={cn("ml-2 font-semibold", isDark ? "text-white" : "text-gray-900")}>
            Back
          </Text>
        </Pressable>
      ) : (
        <View />
      )}

      <Pressable
        onPress={handleNext}
        disabled={!canGoNext}
        className={cn(
          "flex-row items-center px-6 py-3 rounded-full",
          canGoNext
            ? "bg-blue-500"
            : isDark
            ? "bg-gray-800"
            : "bg-gray-200"
        )}
        style={{
          shadowColor: canGoNext ? "#3b82f6" : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: canGoNext ? 3 : 0,
          opacity: canGoNext ? 1 : 0.5,
        }}
      >
        <Text
          className={cn(
            "mr-2 font-semibold",
            canGoNext ? "text-white" : isDark ? "text-gray-600" : "text-gray-400"
          )}
        >
          {nextLabel}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={canGoNext ? "#fff" : isDark ? "#666" : "#999"}
        />
      </Pressable>
    </View>
  );
}
