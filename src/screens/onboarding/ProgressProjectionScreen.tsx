import React, { useEffect } from "react";
import { View, Text, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  withSpring
} from "react-native-reanimated";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { useOnboardingStore } from "../../state/onboardingStore";
import { cn } from "../../utils/cn";

export default function ProgressProjectionScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data } = useOnboardingStore();

  // Personalize based on goal
  const getProjectionData = () => {
    const goal = data.primaryGoal;
    const experience = data.experienceLevel;

    // Base improvements vary by goal and experience
    let volumeIncrease = 20;
    let metric = "Volume";

    if (goal === "lose_fat") {
      metric = "Fat Loss";
      volumeIncrease = experience === "beginner" ? 8 : experience === "intermediate" ? 6 : 4;
    } else if (goal === "get_stronger") {
      metric = "Strength";
      volumeIncrease = experience === "beginner" ? 25 : experience === "intermediate" ? 18 : 12;
    } else if (goal === "improve_endurance") {
      metric = "Endurance";
      volumeIncrease = experience === "beginner" ? 30 : experience === "intermediate" ? 22 : 15;
    } else {
      // build_muscle
      metric = "Muscle Volume";
      volumeIncrease = experience === "beginner" ? 22 : experience === "intermediate" ? 18 : 12;
    }

    return { volumeIncrease, metric };
  };

  const { volumeIncrease, metric } = getProjectionData();

  // Animation values
  const currentBarHeight = useSharedValue(0);
  const futureBarHeight = useSharedValue(0);
  const percentageOpacity = useSharedValue(0);

  useEffect(() => {
    currentBarHeight.value = withDelay(
      400,
      withSpring(128, { damping: 15, stiffness: 100 })
    );
    futureBarHeight.value = withDelay(
      800,
      withSpring(192, { damping: 15, stiffness: 100 })
    );
    percentageOpacity.value = withDelay(
      1200,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const currentBarStyle = useAnimatedStyle(() => ({
    height: currentBarHeight.value,
  }));

  const futureBarStyle = useAnimatedStyle(() => ({
    height: futureBarHeight.value,
  }));

  const percentageStyle = useAnimatedStyle(() => ({
    opacity: percentageOpacity.value,
  }));

  return (
    <View className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <LinearGradient
        colors={
          isDark
            ? ["#0a0a0a", "#1a1a2e", "#0a0a0a"]
            : ["#ffffff", "#e0f2fe", "#ffffff"]
        }
        className="absolute inset-0"
      />

      <SafeAreaView className="flex-1 px-6 py-12">
        <View className="flex-1 justify-between">
          <View />

          <View className="items-center">
            <Animated.View entering={FadeIn.delay(200)} className="mb-12">
              <Text className={cn("text-3xl font-bold text-center mb-3", isDark ? "text-white" : "text-gray-900")}>
                Here's where you could be in 8 weeks
              </Text>
              <Text className={cn("text-base text-center", isDark ? "text-gray-400" : "text-gray-600")}>
                Based on your {data.experienceLevel} level
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300)} className="w-full">
              <View className={cn("p-8 rounded-3xl", isDark ? "bg-[#1a1a1a]" : "bg-gray-50")}>
                <View className="flex-row justify-around items-end mb-8" style={{ height: 220 }}>
                  <View className="items-center flex-1">
                    <Animated.View
                      style={[currentBarStyle]}
                      className="w-20 bg-gray-400 rounded-2xl mb-3"
                    />
                    <Text className={cn("text-sm font-medium", isDark ? "text-gray-400" : "text-gray-600")}>
                      Now
                    </Text>
                  </View>
                  <View className="items-center flex-1">
                    <Animated.View
                      style={[futureBarStyle]}
                      className="w-20 bg-blue-500 rounded-2xl mb-3"
                    />
                    <Text className={cn("text-sm font-bold", isDark ? "text-white" : "text-gray-900")}>
                      8 Weeks
                    </Text>
                  </View>
                </View>

                <Animated.View style={percentageStyle} className="items-center pt-6 border-t border-gray-300 dark:border-gray-700">
                  <Text className={cn("text-4xl font-bold mb-2 text-blue-500")}>
                    +{volumeIncrease}%
                  </Text>
                  <Text className={cn("text-lg font-semibold mb-1", isDark ? "text-white" : "text-gray-900")}>
                    {metric} Increase
                  </Text>
                  <Text className={cn("text-sm text-center", isDark ? "text-gray-400" : "text-gray-600")}>
                    {data.experienceLevel === "beginner"
                      ? "Beginners see the fastest gains"
                      : data.experienceLevel === "intermediate"
                      ? "Steady progress with consistency"
                      : "Optimized gains for advanced lifters"}
                  </Text>
                </Animated.View>
              </View>
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(1400)}>
            <OnboardingButton
              title="Continue"
              onPress={() => navigation.navigate("Community")}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
