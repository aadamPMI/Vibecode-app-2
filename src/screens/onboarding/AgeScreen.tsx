import React, { useState } from "react";
import { View, Text, Pressable, useColorScheme, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Animated, { FadeInDown } from "react-native-reanimated";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { useOnboardingStore } from "../../state/onboardingStore";
import { cn } from "../../utils/cn";

export default function AgeScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data, updateOnboardingData } = useOnboardingStore();

  const [dateOfBirth, setDateOfBirth] = useState<Date>(data.dateOfBirth || new Date(2000, 0, 1));
  const [showPicker, setShowPicker] = useState(true); // Always show picker on mobile

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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

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
          <Animated.View
            entering={FadeInDown.delay(200)}
            className={cn("w-48 h-48 rounded-full items-center justify-center mb-12", isDark ? "bg-[#1a1a1a]" : "bg-gray-100")}
            style={{
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <Text className={cn("text-7xl font-bold", isDark ? "text-white" : "text-gray-900")}>
              {age}
            </Text>
            <Text className={cn("text-lg mt-2", isDark ? "text-gray-400" : "text-gray-600")}>
              years old
            </Text>
          </Animated.View>

          {showPicker && (
            <Animated.View entering={FadeInDown.delay(400)} className="w-full items-center">
              <DateTimePicker
                value={dateOfBirth}
                mode="date"
                display={Platform.OS === 'ios' ? "spinner" : "default"}
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1920, 0, 1)}
                textColor={isDark ? "#ffffff" : "#000000"}
                style={{ width: "100%" }}
              />
            </Animated.View>
          )}

          {Platform.OS === 'android' && !showPicker && (
            <Pressable
              onPress={() => setShowPicker(true)}
              className={cn("px-8 py-4 rounded-2xl", isDark ? "bg-[#1a1a1a]" : "bg-gray-100")}
            >
              <Text className={cn("text-xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
                {dateOfBirth.toLocaleDateString()}
              </Text>
            </Pressable>
          )}
        </View>

        <OnboardingButton title="Continue" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}
