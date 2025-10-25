import React, { useState } from "react";
import { View, Text, Pressable, useColorScheme, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { OnboardingButton } from "../../components/onboarding/OnboardingButton";
import { useOnboardingStore } from "../../state/onboardingStore";
import { cn } from "../../utils/cn";

export default function EquipmentAccessScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data, updateOnboardingData } = useOnboardingStore();
  const [equipment, setEquipment] = useState<string[]>(data.equipment || []);

  const options = [
    { value: "bodyweight", label: "Bodyweight", icon: "body-outline" },
    { value: "dumbbells", label: "Dumbbells", icon: "barbell-outline" },
    { value: "barbell", label: "Barbell", icon: "barbell-outline" },
    { value: "machines", label: "Machines", icon: "business-outline" },
    { value: "bands", label: "Resistance Bands", icon: "resize-outline" },
    { value: "kettlebells", label: "Kettlebells", icon: "fitness-outline" },
    { value: "pullup_bar", label: "Pull-up Bar", icon: "remove-outline" },
  ];

  const toggleEquipment = (value: string) => {
    if (equipment.includes(value)) {
      setEquipment(equipment.filter((e) => e !== value));
    } else {
      setEquipment([...equipment, value]);
    }
  };

  const handleContinue = () => {
    updateOnboardingData({ equipment });
    navigation.navigate("MotivationPromo");
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()} className="mb-4">
          <Ionicons name="chevron-back" size={28} color={isDark ? "#fff" : "#000"} />
        </Pressable>

        <Text className={cn("text-4xl font-bold mb-3", isDark ? "text-white" : "text-gray-900")}>
          What equipment do you have access to?
        </Text>
        <Text className={cn("text-base mb-8", isDark ? "text-gray-400" : "text-gray-600")}>
          Choose everything you can access at least twice a week
        </Text>

        <View className="flex-row flex-wrap mb-6">
          {options.map((option) => {
            const isSelected = equipment.includes(option.value);
            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleEquipment(option.value);
                }}
                className={cn(
                  "w-[48%] p-5 rounded-3xl mb-4",
                  isSelected ? "bg-blue-500" : isDark ? "bg-[#1a1a1a]" : "bg-gray-100",
                  option.value === "bodyweight" || option.value === "barbell" || option.value === "bands" || option.value === "pullup_bar" ? "mr-[4%]" : ""
                )}
                style={{
                  shadowColor: isSelected ? "#3b82f6" : "transparent",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: isSelected ? 4 : 0,
                }}
              >
                <View className="items-center">
                  <View
                    className="w-14 h-14 rounded-full items-center justify-center mb-3"
                    style={{ backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : "rgba(59, 130, 246, 0.1)" }}
                  >
                    <Ionicons name={option.icon as any} size={28} color={isSelected ? "#fff" : "#3b82f6"} />
                  </View>
                  <Text className={cn("text-base font-semibold text-center", isSelected ? "text-white" : isDark ? "text-white" : "text-gray-900")}>
                    {option.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="px-6 pb-6">
        <OnboardingButton title="Continue" onPress={handleContinue} disabled={equipment.length === 0} />
      </View>
    </SafeAreaView>
  );
}
