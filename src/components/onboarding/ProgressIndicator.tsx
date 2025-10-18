import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { cn } from "../../utils/cn";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  isDark?: boolean;
}

export function ProgressIndicator({ currentStep, totalSteps, isDark = false }: ProgressIndicatorProps) {
  return (
    <View className="items-center py-4">
      <Text className={cn("text-sm mb-3", isDark ? "text-gray-400" : "text-gray-600")}>
        Step {currentStep} of {totalSteps}
      </Text>
      <View className="flex-row space-x-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(index * 50)}
            className={cn(
              "h-2 rounded-full",
              index < currentStep
                ? "w-8 bg-blue-500"
                : index === currentStep - 1
                ? "w-12 bg-blue-500"
                : "w-8 bg-gray-300 dark:bg-gray-700"
            )}
          />
        ))}
      </View>
    </View>
  );
}
