import React, { useState } from "react";
import { View, Text, Pressable, useColorScheme, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { useOnboardingStore } from "../../state/onboardingStore";
import { cn } from "../../utils/cn";

export default function HeightWeightScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data, updateOnboardingData } = useOnboardingStore();

  const [unit, setUnit] = useState<"metric" | "imperial">("imperial");
  const [heightFeet, setHeightFeet] = useState(data.heightCm ? Math.floor((data.heightCm / 2.54) / 12).toString() : "5");
  const [heightInches, setHeightInches] = useState(data.heightCm ? Math.round((data.heightCm / 2.54) % 12).toString() : "10");
  const [heightCm, setHeightCm] = useState(data.heightCm?.toString() || "178");
  const [weightLbs, setWeightLbs] = useState(data.currentWeightKg ? Math.round(data.currentWeightKg * 2.20462).toString() : "165");
  const [weightKg, setWeightKg] = useState(data.currentWeightKg?.toString() || "75");

  const handleContinue = () => {
    const height = unit === "metric"
      ? parseInt(heightCm)
      : Math.round((parseInt(heightFeet) * 12 + parseInt(heightInches)) * 2.54);

    const weight = unit === "metric"
      ? parseInt(weightKg)
      : Math.round(parseInt(weightLbs) / 2.20462);

    updateOnboardingData({
      heightCm: height,
      currentWeightKg: weight
    });
    navigation.navigate("Age");
  };

  const isValid = unit === "metric"
    ? heightCm && weightKg && parseInt(heightCm) > 0 && parseInt(weightKg) > 0
    : heightFeet && heightInches && weightLbs && parseInt(heightFeet) > 0 && parseInt(weightLbs) > 0;

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <View className="flex-1 px-6 py-8">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <Ionicons name="chevron-back" size={28} color={isDark ? "#fff" : "#000"} />
        </Pressable>

        <Text className={cn("text-4xl font-bold mb-3", isDark ? "text-white" : "text-gray-900")}>
          Tell us about yourself
        </Text>
        <Text className={cn("text-base mb-8", isDark ? "text-gray-400" : "text-gray-600")}>
          Height and weight help us personalize your plan
        </Text>

        {/* Unit Toggle */}
        <View className="flex-row mb-8 p-1 rounded-full bg-gray-200 dark:bg-[#1a1a1a]">
          <Pressable
            onPress={() => setUnit("imperial")}
            className={cn("flex-1 py-3 rounded-full", unit === "imperial" && "bg-blue-500")}
          >
            <Text className={cn("text-center font-semibold", unit === "imperial" ? "text-white" : isDark ? "text-gray-400" : "text-gray-600")}>
              Imperial
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setUnit("metric")}
            className={cn("flex-1 py-3 rounded-full", unit === "metric" && "bg-blue-500")}
          >
            <Text className={cn("text-center font-semibold", unit === "metric" ? "text-white" : isDark ? "text-gray-400" : "text-gray-600")}>
              Metric
            </Text>
          </Pressable>
        </View>

        <View className="flex-1">
          {/* Height Input */}
          <Text className={cn("text-lg font-semibold mb-3", isDark ? "text-white" : "text-gray-900")}>
            Height
          </Text>
          {unit === "imperial" ? (
            <View className="flex-row mb-8">
              <View className="flex-1 mr-2">
                <TextInput
                  value={heightFeet}
                  onChangeText={setHeightFeet}
                  keyboardType="number-pad"
                  placeholder="5"
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  className={cn("p-4 rounded-2xl text-2xl text-center", isDark ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-gray-900")}
                />
                <Text className={cn("text-center mt-2", isDark ? "text-gray-400" : "text-gray-600")}>feet</Text>
              </View>
              <View className="flex-1 ml-2">
                <TextInput
                  value={heightInches}
                  onChangeText={setHeightInches}
                  keyboardType="number-pad"
                  placeholder="10"
                  placeholderTextColor={isDark ? "#666" : "#999"}
                  className={cn("p-4 rounded-2xl text-2xl text-center", isDark ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-gray-900")}
                />
                <Text className={cn("text-center mt-2", isDark ? "text-gray-400" : "text-gray-600")}>inches</Text>
              </View>
            </View>
          ) : (
            <View className="mb-8">
              <TextInput
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="number-pad"
                placeholder="178"
                placeholderTextColor={isDark ? "#666" : "#999"}
                className={cn("p-4 rounded-2xl text-2xl text-center", isDark ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-gray-900")}
              />
              <Text className={cn("text-center mt-2", isDark ? "text-gray-400" : "text-gray-600")}>cm</Text>
            </View>
          )}

          {/* Weight Input */}
          <Text className={cn("text-lg font-semibold mb-3", isDark ? "text-white" : "text-gray-900")}>
            Current Weight
          </Text>
          <View className="mb-8">
            <TextInput
              value={unit === "imperial" ? weightLbs : weightKg}
              onChangeText={unit === "imperial" ? setWeightLbs : setWeightKg}
              keyboardType="number-pad"
              placeholder={unit === "imperial" ? "165" : "75"}
              placeholderTextColor={isDark ? "#666" : "#999"}
              className={cn("p-4 rounded-2xl text-2xl text-center", isDark ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-gray-900")}
            />
            <Text className={cn("text-center mt-2", isDark ? "text-gray-400" : "text-gray-600")}>
              {unit === "imperial" ? "lbs" : "kg"}
            </Text>
          </View>
        </View>

        <OnboardingButton title="Continue" onPress={handleContinue} disabled={!isValid} />
      </View>
    </SafeAreaView>
  );
}
