import React, { useEffect } from "react";
import { View, Text, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withRepeat
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { cn } from "../../utils/cn";

export default function CommunityScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Animation values for progress bars
  const progress1 = useSharedValue(0);
  const progress2 = useSharedValue(0);
  const progress3 = useSharedValue(0);

  useEffect(() => {
    progress1.value = withDelay(600, withSpring(0.7, { damping: 15 }));
    progress2.value = withDelay(800, withSpring(0.85, { damping: 15 }));
    progress3.value = withDelay(1000, withSpring(0.6, { damping: 15 }));
  }, []);

  const progress1Style = useAnimatedStyle(() => ({
    width: `${progress1.value * 100}%`,
  }));

  const progress2Style = useAnimatedStyle(() => ({
    width: `${progress2.value * 100}%`,
  }));

  const progress3Style = useAnimatedStyle(() => ({
    width: `${progress3.value * 100}%`,
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
          <View className="flex-1 justify-center">
            <Animated.View entering={FadeInDown.delay(200)}>
              <Text className={cn("text-4xl font-bold text-center mb-4", isDark ? "text-white" : "text-gray-900")}>
                Progress is easier with others
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400)}>
              <Text className={cn("text-lg text-center mb-12", isDark ? "text-gray-400" : "text-gray-600")}>
                Train with a community and see better results
              </Text>
            </Animated.View>

            {/* Progress Visualization */}
            <Animated.View
              entering={FadeInDown.delay(500)}
              className={cn("p-8 rounded-3xl mb-8", isDark ? "bg-[#1a1a1a]" : "bg-gray-50")}
            >
              {/* Person 1 */}
              <View className="mb-6">
                <View className="flex-row items-center mb-2">
                  <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-3">
                    <Ionicons name="person" size={20} color="#fff" />
                  </View>
                  <Text className={cn("text-base font-semibold flex-1", isDark ? "text-white" : "text-gray-900")}>
                    Member
                  </Text>
                  <Text className={cn("text-sm font-bold text-blue-500")}>
                    +70%
                  </Text>
                </View>
                <View className={cn("h-3 rounded-full overflow-hidden", isDark ? "bg-[#2a2a2a]" : "bg-gray-200")}>
                  <Animated.View
                    style={[progress1Style, { backgroundColor: "#3b82f6" }]}
                    className="h-full rounded-full"
                  />
                </View>
              </View>

              {/* Person 2 */}
              <View className="mb-6">
                <View className="flex-row items-center mb-2">
                  <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center mr-3">
                    <Ionicons name="person" size={20} color="#fff" />
                  </View>
                  <Text className={cn("text-base font-semibold flex-1", isDark ? "text-white" : "text-gray-900")}>
                    Member
                  </Text>
                  <Text className={cn("text-sm font-bold text-green-500")}>
                    +85%
                  </Text>
                </View>
                <View className={cn("h-3 rounded-full overflow-hidden", isDark ? "bg-[#2a2a2a]" : "bg-gray-200")}>
                  <Animated.View
                    style={[progress2Style, { backgroundColor: "#10b981" }]}
                    className="h-full rounded-full"
                  />
                </View>
              </View>

              {/* Person 3 */}
              <View>
                <View className="flex-row items-center mb-2">
                  <View className="w-10 h-10 rounded-full bg-purple-500 items-center justify-center mr-3">
                    <Ionicons name="person" size={20} color="#fff" />
                  </View>
                  <Text className={cn("text-base font-semibold flex-1", isDark ? "text-white" : "text-gray-900")}>
                    Member
                  </Text>
                  <Text className={cn("text-sm font-bold text-purple-500")}>
                    +60%
                  </Text>
                </View>
                <View className={cn("h-3 rounded-full overflow-hidden", isDark ? "bg-[#2a2a2a]" : "bg-gray-200")}>
                  <Animated.View
                    style={[progress3Style, { backgroundColor: "#a855f7" }]}
                    className="h-full rounded-full"
                  />
                </View>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(1200)}>
              <Text className={cn("text-sm text-center px-8", isDark ? "text-gray-500" : "text-gray-500")}>
                Or you can still train solo using the app and make significant progress
              </Text>
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(1400)}>
            <OnboardingButton
              title="Continue"
              onPress={() => navigation.navigate("FinalPromo")}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}
