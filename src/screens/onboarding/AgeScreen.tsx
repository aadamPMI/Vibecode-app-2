import React, { useState } from "react";
import { View, Text, Pressable, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { useOnboardingStore } from "../../state/onboardingStore";
import { cn } from "../../utils/cn";

export default function AgeScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data, updateOnboardingData } = useOnboardingStore();

  const [dateOfBirth, setDateOfBirth] = useState<Date>(data.dateOfBirth || new Date(2000, 0, 1));
  const [showPicker, setShowPicker] = useState(false);

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(dateOfBirth);

  const handleContinue = () => {
    updateOnboardingData({
      dateOfBirth,
      age
    });
    navigation.navigate("FitnessGoal");
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <View className="flex-1 px-6 py-8">
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <Ionicons name="chevron-back" size={28} color={isDark ? "#fff" : "#000"} />
        </Pressable>

        <Text className={cn("text-4xl font-bold mb-3", isDark ? "text-white" : "text-gray-900")}>
          When were you born?
        </Text>
        <Text className={cn("text-base mb-8", isDark ? "text-gray-400" : "text-gray-600")}>
          This helps us personalize your training recommendations
        </Text>

        <View className="flex-1 items-center justify-center">
          <View
            className={cn("w-48 h-48 rounded-full items-center justify-center mb-8", isDark ? "bg-[#1a1a1a]" : "bg-gray-100")}
            style={{
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Text className={cn("text-6xl font-bold", isDark ? "text-white" : "text-gray-900")}>
              {age}
            </Text>
            <Text className={cn("text-lg mt-2", isDark ? "text-gray-400" : "text-gray-600")}>
              years old
            </Text>
          </View>

          <Pressable
            onPress={() => setShowPicker(true)}
            className={cn("px-8 py-4 rounded-2xl", isDark ? "bg-[#1a1a1a]" : "bg-gray-100")}
          >
            <Text className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
              {dateOfBirth.toLocaleDateString()}
            </Text>
          </Pressable>

          {showPicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display="spinner"
              onChange={(event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) {
                  setDateOfBirth(selectedDate);
                }
              }}
              maximumDate={new Date()}
              minimumDate={new Date(1920, 0, 1)}
            />
          )}
        </View>

        <OnboardingButton title="Continue" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}
