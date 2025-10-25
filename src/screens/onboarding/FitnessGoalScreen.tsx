import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Slider from "@react-native-community/slider";
import Animated, { FadeInDown, FadeIn, useAnimatedStyle, useSharedValue, withSpring, withSequence } from "react-native-reanimated";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { useOnboardingStore } from "../../state/onboardingStore";
import { cn } from "../../utils/cn";

type Goal = "build_muscle" | "get_stronger" | "lose_fat" | "improve_endurance";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function FitnessGoalScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data, updateOnboardingData } = useOnboardingStore();
  const [goal, setGoal] = useState<Goal | undefined>(data.primaryGoal);
  const [bodyFocus, setBodyFocus] = useState<number>(data.bodyFocus === "strength" ? 0 : data.bodyFocus === "hypertrophy" ? 100 : 50);

  const goals = [
    { value: "build_muscle" as const, label: "Build Muscle", icon: "barbell-outline", color: "#fb923c", desc: "Gain size and strength" },
    { value: "get_stronger" as const, label: "Get Stronger", icon: "medal-outline", color: "#a855f7", desc: "Build raw power" },
    { value: "lose_fat" as const, label: "Lose Fat", icon: "scale-outline", color: "#ef4444", desc: "Burn fat and get lean" },
    { value: "improve_endurance" as const, label: "Improve Endurance", icon: "bicycle-outline", color: "#3b82f6", desc: "Boost stamina" },
  ];

  const handleContinue = () => {
    const focusValue = bodyFocus < 33 ? "strength" : bodyFocus > 66 ? "hypertrophy" : "balanced";
    updateOnboardingData({
      primaryGoal: goal,
      bodyFocus: focusValue as "strength" | "hypertrophy" | "balanced"
    });
    navigation.navigate("ProgressProjection");
  };

  const GoalCard = ({ g, index }: { g: typeof goals[0]; index: number }) => {
    const scale = useSharedValue(1);
    const isSelected = goal === g.value;

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      scale.value = withSequence(
        withSpring(0.95, { damping: 10 }),
        withSpring(1, { damping: 10 })
      );
      setGoal(g.value);
    };

    return (
      <AnimatedPressable
        entering={FadeInDown.delay(200 + index * 100).springify()}
        style={[animatedStyle]}
        onPress={handlePress}
        className={cn(
          "w-[48%] rounded-3xl p-6 mb-4 min-h-[180px] justify-between",
          isSelected ? "bg-blue-500" : isDark ? "bg-[#1a1a1a]" : "bg-gray-100",
          index % 2 === 0 ? "mr-[4%]" : ""
        )}
      >
        <View
          style={{
            shadowColor: isSelected ? "#3b82f6" : "transparent",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: isSelected ? 4 : 0,
          }}
        >
          <View className="items-center">
            <Animated.View
              className={cn("w-20 h-20 rounded-full items-center justify-center mb-4")}
              style={{
                backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : g.color + "20",
              }}
            >
              <Ionicons name={g.icon as any} size={36} color={isSelected ? "#fff" : g.color} />
            </Animated.View>
            <Text className={cn("text-lg font-bold text-center mb-2", isSelected ? "text-white" : isDark ? "text-white" : "text-gray-900")}>
              {g.label}
            </Text>
            <Text className={cn("text-xs text-center leading-4", isSelected ? "text-white/80" : isDark ? "text-gray-400" : "text-gray-600")}>
              {g.desc}
            </Text>
          </View>
        </View>
      </AnimatedPressable>
    );
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <Pressable onPress={() => navigation.goBack()} className="mb-4">
            <Ionicons name="chevron-back" size={28} color={isDark ? "#fff" : "#000"} />
          </Pressable>

          <Animated.Text entering={FadeIn.delay(100)} className={cn("text-4xl font-bold mt-2 mb-3", isDark ? "text-white" : "text-gray-900")}>
            What's your primary goal?
          </Animated.Text>
          <Animated.Text entering={FadeIn.delay(150)} className={cn("text-base mb-8", isDark ? "text-gray-400" : "text-gray-600")}>
            We'll customize your plan accordingly
          </Animated.Text>

          <View className="flex-row flex-wrap mb-8">
            {goals.map((g, index) => (
              <GoalCard key={g.value} g={g} index={index} />
            ))}
          </View>

          {/* Body Focus Slider */}
          {(goal === "build_muscle" || goal === "get_stronger") && (
            <Animated.View
              entering={FadeInDown.delay(400).springify()}
              className={cn("p-6 rounded-3xl mb-6", isDark ? "bg-[#1a1a1a]" : "bg-gray-100")}
            >
              <Text className={cn("text-lg font-semibold mb-4", isDark ? "text-white" : "text-gray-900")}>
                Body Focus
              </Text>
              <View className="flex-row justify-between mb-2">
                <Text className={cn("text-sm", bodyFocus < 33 ? "font-bold text-blue-500" : isDark ? "text-gray-400" : "text-gray-600")}>
                  Strength
                </Text>
                <Text className={cn("text-sm", bodyFocus > 33 && bodyFocus < 66 ? "font-bold text-blue-500" : isDark ? "text-gray-400" : "text-gray-600")}>
                  Balanced
                </Text>
                <Text className={cn("text-sm", bodyFocus > 66 ? "font-bold text-blue-500" : isDark ? "text-gray-400" : "text-gray-600")}>
                  Hypertrophy
                </Text>
              </View>
              <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={0}
                maximumValue={100}
                value={bodyFocus}
                onValueChange={(value) => setBodyFocus(value)}
                minimumTrackTintColor="#3b82f6"
                maximumTrackTintColor={isDark ? "#333" : "#ddd"}
                thumbTintColor="#3b82f6"
              />
            </Animated.View>
          )}
        </View>
      </ScrollView>
      <View className="px-6 pb-6">
        <OnboardingButton title="Continue" onPress={handleContinue} disabled={!goal} />
      </View>
    </SafeAreaView>
  );
}
