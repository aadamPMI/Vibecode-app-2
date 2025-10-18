import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, useColorScheme, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { ProgressIndicator } from "../../components/onboarding/ProgressIndicator";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { useOnboardingStore } from "../../state/onboardingStore";
import { calculateAge, feetInchesToCm } from "../../utils/onboarding-utils";
import { cn } from "../../utils/cn";

export default function PersonalInfoScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data, updateOnboardingData } = useOnboardingStore();

  const [dateOfBirth, setDateOfBirth] = useState<Date>(data.dateOfBirth || new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<"male" | "female" | "other" | undefined>(data.gender);
  const [heightUnit, setHeightUnit] = useState<"metric" | "imperial">("imperial");
  const [heightCm, setHeightCm] = useState(data.heightCm?.toString() || "");
  const [heightFeet, setHeightFeet] = useState("5");
  const [heightInches, setHeightInches] = useState("8");

  const age = calculateAge(dateOfBirth);
  const isValid = age >= 13 && gender && (heightCm || (heightFeet && heightInches));

  const handleContinue = () => {
    const finalHeightCm =
      heightUnit === "metric"
        ? parseInt(heightCm)
        : feetInchesToCm(parseInt(heightFeet), parseInt(heightInches));

    updateOnboardingData({
      dateOfBirth,
      age,
      gender,
      heightCm: finalHeightCm,
    });

    navigation.navigate("Weight");
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <Pressable
            onPress={() => navigation.goBack()}
            className="mb-4"
          >
            <Ionicons name="chevron-back" size={28} color={isDark ? "#fff" : "#000"} />
          </Pressable>

          <ProgressIndicator currentStep={1} totalSteps={7} isDark={isDark} />

          <Text className={cn("text-4xl font-bold mt-6 mb-3", isDark ? "text-white" : "text-gray-900")}>
            Tell us about yourself
          </Text>
          <Text className={cn("text-base mb-8", isDark ? "text-gray-400" : "text-gray-600")}>
            This helps us personalize your plan
          </Text>

          {/* Date of Birth */}
          <View className="mb-6">
            <Text className={cn("text-base font-semibold mb-3", isDark ? "text-gray-300" : "text-gray-700")}>
              Date of Birth
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowDatePicker(true);
              }}
              className={cn(
                "rounded-2xl p-4 flex-row justify-between items-center",
                isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
              )}
            >
              <Text className={cn("text-lg", isDark ? "text-white" : "text-gray-900")}>
                {dateOfBirth.toLocaleDateString()} ({age} years old)
              </Text>
              <Ionicons name="calendar-outline" size={24} color={isDark ? "#9ca3af" : "#6b7280"} />
            </Pressable>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, selected) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selected) setDateOfBirth(selected);
              }}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
            />
          )}

          {/* Gender */}
          <View className="mb-6">
            <Text className={cn("text-base font-semibold mb-3", isDark ? "text-gray-300" : "text-gray-700")}>
              Gender
            </Text>
            <View className="flex-row space-x-3">
              {(["male", "female", "other"] as const).map((g) => (
                <Pressable
                  key={g}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setGender(g);
                  }}
                  className={cn(
                    "flex-1 rounded-2xl p-4 items-center",
                    gender === g
                      ? "bg-blue-500"
                      : isDark
                      ? "bg-[#1a1a1a]"
                      : "bg-gray-100"
                  )}
                >
                  <Ionicons
                    name={g === "male" ? "male" : g === "female" ? "female" : "people"}
                    size={32}
                    color={gender === g ? "#fff" : isDark ? "#9ca3af" : "#6b7280"}
                  />
                  <Text
                    className={cn(
                      "text-sm font-semibold mt-2 capitalize",
                      gender === g ? "text-white" : isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    {g}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Height */}
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-3">
              <Text className={cn("text-base font-semibold", isDark ? "text-gray-300" : "text-gray-700")}>
                Height
              </Text>
              <View className="flex-row rounded-full bg-gray-200 dark:bg-gray-800 p-1">
                <Pressable
                  onPress={() => setHeightUnit("imperial")}
                  className={cn(
                    "px-4 py-2 rounded-full",
                    heightUnit === "imperial" ? "bg-blue-500" : "bg-transparent"
                  )}
                >
                  <Text className={cn("text-sm", heightUnit === "imperial" ? "text-white" : "text-gray-600")}>
                    ft/in
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setHeightUnit("metric")}
                  className={cn(
                    "px-4 py-2 rounded-full",
                    heightUnit === "metric" ? "bg-blue-500" : "bg-transparent"
                  )}
                >
                  <Text className={cn("text-sm", heightUnit === "metric" ? "text-white" : "text-gray-600")}>
                    cm
                  </Text>
                </Pressable>
              </View>
            </View>

            {heightUnit === "metric" ? (
              <TextInput
                value={heightCm}
                onChangeText={setHeightCm}
                placeholder="170"
                keyboardType="numeric"
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                className={cn(
                  "rounded-2xl p-4 text-lg",
                  isDark ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-gray-900"
                )}
              />
            ) : (
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Text className={cn("text-sm mb-2", isDark ? "text-gray-400" : "text-gray-600")}>Feet</Text>
                  <TextInput
                    value={heightFeet}
                    onChangeText={setHeightFeet}
                    placeholder="5"
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn(
                      "rounded-2xl p-4 text-lg",
                      isDark ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-gray-900"
                    )}
                  />
                </View>
                <View className="flex-1">
                  <Text className={cn("text-sm mb-2", isDark ? "text-gray-400" : "text-gray-600")}>Inches</Text>
                  <TextInput
                    value={heightInches}
                    onChangeText={setHeightInches}
                    placeholder="8"
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn(
                      "rounded-2xl p-4 text-lg",
                      isDark ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-gray-900"
                    )}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View className="px-6 pb-6">
        <OnboardingButton title="Continue" onPress={handleContinue} disabled={!isValid} />
      </View>
    </SafeAreaView>
  );
}
