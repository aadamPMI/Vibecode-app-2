import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface PremiumBackgroundProps {
  theme: "dark" | "light";
  variant?: "workout" | "nutrition" | "community" | "settings";
}

export function PremiumBackground({ theme, variant = "workout" }: PremiumBackgroundProps) {
  const isDark = theme === "dark";

  const getGradientColors = () => {
    if (isDark) {
      switch (variant) {
        case "workout":
          return ["#111827", "#1f2937", "#111827"];
        case "nutrition":
          return ["#111827", "#1a231f", "#111827"];
        case "community":
          return ["#111827", "#1a1a2e", "#111827"];
        case "settings":
          return ["#111827", "#1a2332", "#111827"];
        default:
          return ["#111827", "#1f2937", "#111827"];
      }
    } else {
      switch (variant) {
        case "workout":
          return ["#ffffff", "#fef5f3", "#fff7ed", "#fef3c7", "#ffffff"];
        case "nutrition":
          return ["#ffffff", "#f0fdf4", "#fef3c7", "#fef5f3", "#ffffff"];
        case "community":
          return ["#ffffff", "#faf5ff", "#ede9fe", "#f5f3ff", "#ffffff"];
        case "settings":
          return ["#ffffff", "#f8fafc", "#f1f5f9", "#ffffff"];
        default:
          return ["#ffffff", "#f5f3ff", "#fff7ed", "#ffffff"];
      }
    }
  };

  const getGlowColor = () => {
    switch (variant) {
      case "workout":
        return isDark ? "rgba(251, 146, 60, 0.06)" : "rgba(251, 146, 60, 0.08)";
      case "nutrition":
        return isDark ? "rgba(74, 222, 128, 0.06)" : "rgba(74, 222, 128, 0.08)";
      case "community":
        return isDark ? "rgba(168, 85, 247, 0.06)" : "rgba(168, 85, 247, 0.08)";
      case "settings":
        return isDark ? "rgba(59, 130, 246, 0.06)" : "rgba(59, 130, 246, 0.08)";
      default:
        return isDark ? "rgba(251, 146, 60, 0.06)" : "rgba(251, 146, 60, 0.08)";
    }
  };

  return (
    <>
      {/* Base gradient */}
      <LinearGradient
        colors={getGradientColors() as any}
        locations={isDark ? [0, 0.33, 0.66, 1] : [0, 0.25, 0.5, 0.75, 1]}
        className="absolute inset-0"
      />

      {/* Ambient glow layer */}
      <View className="absolute inset-0" style={{ opacity: isDark ? 0.5 : 0.4 }}>
        <LinearGradient
          colors={["transparent", getGlowColor(), "transparent"]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1"
        />
      </View>

      {/* Subtle noise texture overlay for depth */}
      <View
        className="absolute inset-0"
        style={{
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.01)" : "rgba(0, 0, 0, 0.01)",
          opacity: 0.3,
        }}
      />
    </>
  );
}
