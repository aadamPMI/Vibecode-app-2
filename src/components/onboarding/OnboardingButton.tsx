import React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { cn } from "../../utils/cn";

interface OnboardingButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  loading?: boolean;
}

export function OnboardingButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}: OnboardingButtonProps) {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      className={cn(
        "w-full py-4 rounded-full items-center justify-center",
        variant === "primary"
          ? disabled || loading
            ? "bg-gray-300 dark:bg-gray-700"
            : "bg-blue-500"
          : "bg-transparent border-2 border-blue-500"
      )}
      style={{
        shadowColor: variant === "primary" && !disabled ? "#3b82f6" : "transparent",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: variant === "primary" && !disabled ? 4 : 0,
        opacity: disabled || loading ? 0.5 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "white" : "#3b82f6"} />
      ) : (
        <Text
          className={cn(
            "text-lg font-semibold",
            variant === "primary" ? "text-white" : "text-blue-500"
          )}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
