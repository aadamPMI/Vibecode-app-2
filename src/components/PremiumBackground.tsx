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
          return ["#0f0f0f", "#1a0f0a", "#0f0f0f", "#0a0a0a"];
        case "nutrition":
          return ["#0f0f0f", "#0a1a1f", "#0f0f0f", "#0a0a0a"];
        case "community":
          return ["#0f0f0f", "#1a0f1f", "#0f0f0f", "#0a0a0a"];
        case "settings":
          return ["#0f0f0f", "#0a0f1a", "#0f0f0f", "#0a0a0a"];
        default:
          return ["#0f0f0f", "#1a0f0a", "#0f0f0f", "#0a0a0a"];
      }
    } else {
      switch (variant) {
        case "workout":
          return ["#fef3e6", "#fff7ed", "#fef3e6", "#fff"];
        case "nutrition":
          return ["#e6f7ff", "#f0f9ff", "#e6f7ff", "#fff"];
        case "community":
          return ["#f3e6ff", "#faf5ff", "#f3e6ff", "#fff"];
        case "settings":
          return ["#f0f4f8", "#f8fafc", "#f0f4f8", "#fff"];
        default:
          return ["#fef3e6", "#fff7ed", "#fef3e6", "#fff"];
      }
    }
  };

  const getGlowColor = () => {
    switch (variant) {
      case "workout":
        return isDark ? "rgba(251, 146, 60, 0.15)" : "rgba(251, 146, 60, 0.12)";
      case "nutrition":
        return isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.12)";
      case "community":
        return isDark ? "rgba(168, 85, 247, 0.15)" : "rgba(168, 85, 247, 0.12)";
      case "settings":
        return isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.12)";
      default:
        return isDark ? "rgba(251, 146, 60, 0.15)" : "rgba(251, 146, 60, 0.12)";
    }
  };

  return (
    <>
      {/* Base gradient */}
      <LinearGradient
        colors={getGradientColors() as any}
        locations={[0, 0.3, 0.7, 1]}
        className="absolute inset-0"
      />

      {/* Ambient glow layer - top */}
      <View className="absolute inset-0" style={{ opacity: isDark ? 0.4 : 0.3 }}>
        <LinearGradient
          colors={["transparent", getGlowColor(), "transparent"]}
          locations={[0, 0.4, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.5 }}
          className="flex-1"
        />
      </View>

      {/* Bottom ambient glow */}
      <View className="absolute inset-0" style={{ opacity: isDark ? 0.3 : 0.25 }}>
        <LinearGradient
          colors={["transparent", getGlowColor(), "transparent"]}
          locations={[0, 0.6, 1]}
          start={{ x: 1, y: 0.5 }}
          end={{ x: 0, y: 1 }}
          className="flex-1"
        />
      </View>

      {/* Subtle noise texture overlay for premium depth */}
      <View
        className="absolute inset-0"
        style={{
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.015)" : "rgba(0, 0, 0, 0.015)",
          opacity: 0.5,
        }}
      />
    </>
  );
}
