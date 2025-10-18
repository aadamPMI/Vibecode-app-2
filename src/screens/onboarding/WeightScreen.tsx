import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ProgressIndicator } from "../../components/onboarding/ProgressIndicator";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { useOnboardingStore } from "../../state/onboardingStore";
import { kgToLbs, lbsToKg } from "../../utils/onboarding-utils";
import { cn } from "../../utils/cn";

export default function WeightScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data, updateOnboardingData } = useOnboardingStore();

  const [unit, setUnit] = useState<"kg" | "lbs">("lbs");
  const [currentWeight, setCurrentWeight] = useState(
    data.currentWeightKg ? (unit === "kg" ? data.currentWeightKg.toString() : kgToLbs(data.currentWeightKg).toString()) : ""
  );
  const [targetWeight, setTargetWeight] = useState(
    data.targetWeightKg ? (unit === "kg" ? data.targetWeightKg.toString() : kgToLbs(data.targetWeightKg).toString()) : ""
  );

  const currentKg = unit === "kg" ? parseFloat(currentWeight) : lbsToKg(parseFloat(currentWeight));
  const targetKg = unit === "kg" ? parseFloat(targetWeight) : lbsToKg(parseFloat(targetWeight));
  const difference = targetKg - currentKg;
  const isValid = currentWeight && targetWeight && currentKg > 0 && targetKg > 0;

  const handleContinue = () => {
    updateOnboardingData({
      currentWeightKg: currentKg,
      targetWeightKg: targetKg,
    });
    navigation.navigate("Timeframe");
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <Pressable onPress={() => navigation.goBack()} className="mb-4">
            <Ionicons name="chevron-back" size={28} color={isDark ? "#fff" : "#000"} />
          </Pressable>

          <ProgressIndicator currentStep={2} totalSteps={7} isDark={isDark} />

          <Text className={cn("text-4xl font-bold mt-6 mb-3", isDark ? "text-white" : "text-gray-900")}>
            What are your weight goals?
          </Text>

          {/* Unit Toggle */}
          <View className="flex-row justify-end mb-6">
            <View className="flex-row rounded-full bg-gray-200 dark:bg-gray-800 p-1">
              <Pressable
                onPress={() => setUnit("lbs")}
                className={cn("px-4 py-2 rounded-full", unit === "lbs" ? "bg-blue-500" : "bg-transparent")}
              >
                <Text className={cn("text-sm", unit === "lbs" ? "text-white" : "text-gray-600")}>lbs</Text>
              </Pressable>
              <Pressable
                onPress={() => setUnit("kg")}
                className={cn("px-4 py-2 rounded-full", unit === "kg" ? "bg-blue-500" : "bg-transparent")}
              >
                <Text className={cn("text-sm", unit === "kg" ? "text-white" : "text-gray-600")}>kg</Text>
              </Pressable>
            </View>
          </View>

          {/* Current Weight */}
          <View className="mb-6">
            <Text className={cn("text-base font-semibold mb-3", isDark ? "text-gray-300" : "text-gray-700")}>
              Current Weight
            </Text>
            <TextInput
              value={currentWeight}
              onChangeText={setCurrentWeight}
              placeholder={unit === "kg" ? "70" : "154"}
              keyboardType="numeric"
              placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
              className={cn("rounded-2xl p-4 text-lg", isDark ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-gray-900")}
            />
          </View>

          {/* Target Weight */}
          <View className="mb-6">
            <Text className={cn("text-base font-semibold mb-3", isDark ? "text-gray-300" : "text-gray-700")}>
              Target Weight
            </Text>
            <TextInput
              value={targetWeight}
              onChangeText={setTargetWeight}
              placeholder={unit === "kg" ? "65" : "143"}
              keyboardType="numeric"
              placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
              className={cn("rounded-2xl p-4 text-lg", isDark ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-gray-900")}
            />
          </View>

          {/* Difference Display */}
          {isValid && (
            <View
              className={cn("rounded-2xl p-4 items-center", difference < 0 ? "bg-red-500/10" : "bg-green-500/10")}
            >
              <Text className={cn("text-lg font-semibold", difference < 0 ? "text-red-500" : "text-green-500")}>
                {difference > 0 ? "+" : ""}
                {Math.abs(difference).toFixed(1)} {unit}
              </Text>
              <Text className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                {difference < 0 ? "Weight loss goal" : "Weight gain goal"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="px-6 pb-6">
        <OnboardingButton title="Continue" onPress={handleContinue} disabled={!isValid} />
      </View>
    </SafeAreaView>
  );
}
