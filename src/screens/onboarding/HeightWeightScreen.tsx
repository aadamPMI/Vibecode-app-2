import React, { useState, useEffect } from "react";
import { View, Text, Pressable, useColorScheme, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { OnboardingNavigation } from "../../components/onboarding/OnboardingNavigation";
import { useOnboardingStore } from "../../state/onboardingStore";
import { cn } from "../../utils/cn";

export default function HeightWeightScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data, updateOnboardingData } = useOnboardingStore();

  // Height unit state
  const [heightUnit, setHeightUnit] = useState<"ft" | "cm">("ft");
  const [heightFeet, setHeightFeet] = useState(data.heightCm ? Math.floor((data.heightCm / 2.54) / 12).toString() : "5");
  const [heightInches, setHeightInches] = useState(data.heightCm ? Math.round((data.heightCm / 2.54) % 12).toString() : "10");
  const [heightCm, setHeightCm] = useState(data.heightCm?.toString() || "178");

  // Weight unit state
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs");
  const [currentWeightLbs, setCurrentWeightLbs] = useState(data.currentWeightKg ? Math.round(data.currentWeightKg * 2.20462).toString() : "165");
  const [currentWeightKg, setCurrentWeightKg] = useState(data.currentWeightKg?.toString() || "75");

  // Target weight state
  const [targetWeightLbs, setTargetWeightLbs] = useState(data.targetWeightKg ? Math.round(data.targetWeightKg * 2.20462).toString() : "155");
  const [targetWeightKg, setTargetWeightKg] = useState(data.targetWeightKg?.toString() || "70");

  // Sync weight values when unit changes
  useEffect(() => {
    if (weightUnit === "kg" && currentWeightLbs) {
      const kg = Math.round(parseFloat(currentWeightLbs) / 2.20462);
      setCurrentWeightKg(kg.toString());
    } else if (weightUnit === "lbs" && currentWeightKg) {
      const lbs = Math.round(parseFloat(currentWeightKg) * 2.20462);
      setCurrentWeightLbs(lbs.toString());
    }
  }, [weightUnit]);

  useEffect(() => {
    if (weightUnit === "kg" && targetWeightLbs) {
      const kg = Math.round(parseFloat(targetWeightLbs) / 2.20462);
      setTargetWeightKg(kg.toString());
    } else if (weightUnit === "lbs" && targetWeightKg) {
      const lbs = Math.round(parseFloat(targetWeightKg) * 2.20462);
      setTargetWeightLbs(lbs.toString());
    }
  }, [weightUnit]);

  // Sync height values when unit changes
  useEffect(() => {
    if (heightUnit === "cm" && heightFeet && heightInches) {
      const totalInches = parseInt(heightFeet) * 12 + parseInt(heightInches);
      const cm = Math.round(totalInches * 2.54);
      setHeightCm(cm.toString());
    } else if (heightUnit === "ft" && heightCm) {
      const totalInches = parseFloat(heightCm) / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      setHeightFeet(feet.toString());
      setHeightInches(inches.toString());
    }
  }, [heightUnit]);

  const handleContinue = () => {
    const height = heightUnit === "cm"
      ? parseInt(heightCm)
      : Math.round((parseInt(heightFeet) * 12 + parseInt(heightInches)) * 2.54);

    const currentWeight = weightUnit === "kg"
      ? parseInt(currentWeightKg)
      : Math.round(parseInt(currentWeightLbs) / 2.20462);

    const targetWeight = weightUnit === "kg"
      ? parseInt(targetWeightKg)
      : Math.round(parseInt(targetWeightLbs) / 2.20462);

    updateOnboardingData({
      heightCm: height,
      currentWeightKg: currentWeight,
      targetWeightKg: targetWeight
    });
    navigation.navigate("Age");
  };

  const isValid = heightUnit === "cm"
    ? heightCm && parseInt(heightCm) > 0
    : heightFeet && heightInches && parseInt(heightFeet) > 0;

  const isWeightValid = weightUnit === "kg"
    ? currentWeightKg && targetWeightKg && parseInt(currentWeightKg) > 0 && parseInt(targetWeightKg) > 0
    : currentWeightLbs && targetWeightLbs && parseInt(currentWeightLbs) > 0 && parseInt(targetWeightLbs) > 0;

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <Ionicons name="chevron-back" size={28} color={isDark ? "#fff" : "#000"} />
        </Pressable>

        <Text className={cn("text-4xl font-bold mb-3", isDark ? "text-white" : "text-gray-900")}>
          Tell us about yourself
        </Text>
        <Text className={cn("text-base mb-8", isDark ? "text-gray-400" : "text-gray-600")}>
          Height and weight help us personalize your plan
        </Text>

        {/* Height Section */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>
              Height
            </Text>
            <View className="flex-row p-1 rounded-full bg-gray-200 dark:bg-[#1a1a1a]">
              <Pressable
                onPress={() => setHeightUnit("ft")}
                className={cn("px-4 py-2 rounded-full", heightUnit === "ft" && "bg-blue-500")}
              >
                <Text className={cn("text-sm font-semibold", heightUnit === "ft" ? "text-white" : isDark ? "text-gray-400" : "text-gray-600")}>
                  ft
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setHeightUnit("cm")}
                className={cn("px-4 py-2 rounded-full", heightUnit === "cm" && "bg-blue-500")}
              >
                <Text className={cn("text-sm font-semibold", heightUnit === "cm" ? "text-white" : isDark ? "text-gray-400" : "text-gray-600")}>
                  cm
                </Text>
              </Pressable>
            </View>
          </View>

          {heightUnit === "ft" ? (
            <View className="flex-row">
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
            <View>
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
        </View>

        {/* Weight Section */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>
              Weight
            </Text>
            <View className="flex-row p-1 rounded-full bg-gray-200 dark:bg-[#1a1a1a]">
              <Pressable
                onPress={() => setWeightUnit("lbs")}
                className={cn("px-4 py-2 rounded-full", weightUnit === "lbs" && "bg-blue-500")}
              >
                <Text className={cn("text-sm font-semibold", weightUnit === "lbs" ? "text-white" : isDark ? "text-gray-400" : "text-gray-600")}>
                  lbs
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setWeightUnit("kg")}
                className={cn("px-4 py-2 rounded-full", weightUnit === "kg" && "bg-blue-500")}
              >
                <Text className={cn("text-sm font-semibold", weightUnit === "kg" ? "text-white" : isDark ? "text-gray-400" : "text-gray-600")}>
                  kg
                </Text>
              </Pressable>
            </View>
          </View>

          <View className={cn("p-5 rounded-3xl mb-4", isDark ? "bg-[#1a1a1a]" : "bg-gray-50")}>
            <Text className={cn("text-sm mb-2", isDark ? "text-gray-400" : "text-gray-600")}>
              Current Weight
            </Text>
            <TextInput
              value={weightUnit === "lbs" ? currentWeightLbs : currentWeightKg}
              onChangeText={weightUnit === "lbs" ? setCurrentWeightLbs : setCurrentWeightKg}
              keyboardType="number-pad"
              placeholder={weightUnit === "lbs" ? "165" : "75"}
              placeholderTextColor={isDark ? "#666" : "#999"}
              className={cn("text-3xl font-bold", isDark ? "text-white" : "text-gray-900")}
            />
            <Text className={cn("text-sm mt-1", isDark ? "text-gray-500" : "text-gray-500")}>
              {weightUnit === "lbs" ? "pounds" : "kilograms"}
            </Text>
          </View>

          <View className={cn("p-5 rounded-3xl", isDark ? "bg-[#1a1a1a]" : "bg-gray-50")}>
            <Text className={cn("text-sm mb-2", isDark ? "text-gray-400" : "text-gray-600")}>
              Target Weight
            </Text>
            <TextInput
              value={weightUnit === "lbs" ? targetWeightLbs : targetWeightKg}
              onChangeText={weightUnit === "lbs" ? setTargetWeightLbs : setTargetWeightKg}
              keyboardType="number-pad"
              placeholder={weightUnit === "lbs" ? "155" : "70"}
              placeholderTextColor={isDark ? "#666" : "#999"}
              className={cn("text-3xl font-bold", isDark ? "text-white" : "text-gray-900")}
            />
            <Text className={cn("text-sm mt-1", isDark ? "text-gray-500" : "text-gray-500")}>
              {weightUnit === "lbs" ? "pounds" : "kilograms"}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-6 pb-6">
        <OnboardingNavigation
          onBack={() => navigation.goBack()}
          onNext={handleContinue}
          canGoNext={!!(isValid && isWeightValid)}
        />
      </View>
    </SafeAreaView>
  );
}
