import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ProgressIndicator } from "../../components/onboarding/ProgressIndicator";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { useOnboardingStore } from "../../state/onboardingStore";
import { cn } from "../../utils/cn";

export default function InjuriesScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data, updateOnboardingData } = useOnboardingStore();
  const [injuries, setInjuries] = useState(data.injuries || "");
  const maxLength = 500;

  const handleContinue = () => {
    updateOnboardingData({ injuries: injuries.trim() || undefined });
    navigation.navigate("Generating");
  };

  const handleSkip = () => {
    updateOnboardingData({ injuries: undefined });
    navigation.navigate("Generating");
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <Pressable onPress={() => navigation.goBack()} className="mb-4">
            <Ionicons name="chevron-back" size={28} color={isDark ? "#fff" : "#000"} />
          </Pressable>
          <ProgressIndicator currentStep={6} totalSteps={7} isDark={isDark} />
          <Text className={cn("text-4xl font-bold mt-6 mb-3", isDark ? "text-white" : "text-gray-900")}>
            Any injuries or limitations?
          </Text>
          <Text className={cn("text-base mb-6", isDark ? "text-gray-400" : "text-gray-600")}>
            Help us keep you safe (optional)
          </Text>
          <View className={cn("rounded-2xl p-4 mb-4", isDark ? "bg-[#1a1a1a]" : "bg-gray-100")}>
            <Text className={cn("text-sm mb-2", isDark ? "text-gray-400" : "text-gray-600")}>
              Examples:
            </Text>
            <Text className={cn("text-sm", isDark ? "text-gray-500" : "text-gray-500")}>
              • Lower back pain{"\n"}
              • Knee injury - no squats{"\n"}
              • Shoulder issues{"\n"}
              • Recovering from surgery
            </Text>
          </View>
          <TextInput
            value={injuries}
            onChangeText={(text) => {
              if (text.length <= maxLength) setInjuries(text);
            }}
            placeholder="e.g., Lower back pain, no heavy lifting..."
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            className={cn(
              "rounded-2xl p-4 text-base min-h-[150px] mb-2",
              isDark ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-gray-900"
            )}
          />
          <Text className={cn("text-sm text-right", isDark ? "text-gray-500" : "text-gray-500")}>
            {injuries.length}/{maxLength}
          </Text>
        </View>
      </ScrollView>
      <View className="px-6 pb-6 space-y-3">
        <OnboardingButton title={injuries ? "Continue" : "Skip"} onPress={injuries ? handleContinue : handleSkip} />
        {injuries && (
          <Pressable onPress={handleSkip} className="items-center py-2">
            <Text className="text-blue-500 text-base">Skip this step</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
