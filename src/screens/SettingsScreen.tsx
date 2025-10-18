import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSettingsStore } from "../state/settingsStore";
import { cn } from "../utils/cn";
import { PremiumBackground } from "../components/PremiumBackground";

export default function SettingsScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const profileSettings = useSettingsStore((s) => s.profileSettings);
  const privacySettings = useSettingsStore((s) => s.privacySettings);
  const fitnessGoals = useSettingsStore((s) => s.fitnessGoals);
  const updateProfileSettings = useSettingsStore((s) => s.updateProfileSettings);
  const updatePrivacySettings = useSettingsStore((s) => s.updatePrivacySettings);
  const updateFitnessGoals = useSettingsStore((s) => s.updateFitnessGoals);

  const isDark = theme === "dark";
  const [activeSection, setActiveSection] = useState<
    "profile" | "privacy" | "display" | "goals" | "notifications" | "weight" | "language" | null
  >(null);

  // Profile form state
  const [name, setName] = useState(profileSettings.name);
  const [age, setAge] = useState(profileSettings.age?.toString() || "");
  const [height, setHeight] = useState(profileSettings.height?.toString() || "");
  const [weight, setWeight] = useState(profileSettings.weight?.toString() || "");
  const [email, setEmail] = useState(profileSettings.email || "");

  // Goals form state
  const [targetWeight, setTargetWeight] = useState(
    fitnessGoals.targetWeight?.toString() || ""
  );
  const [targetCalories, setTargetCalories] = useState(
    fitnessGoals.targetCalories?.toString() || ""
  );
  const [targetProtein, setTargetProtein] = useState(
    fitnessGoals.targetProtein?.toString() || ""
  );
  const [targetCarbs, setTargetCarbs] = useState(
    fitnessGoals.targetCarbs?.toString() || ""
  );
  const [targetFats, setTargetFats] = useState(
    fitnessGoals.targetFats?.toString() || ""
  );
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(
    fitnessGoals.weeklyWorkouts?.toString() || ""
  );
  const [selectedGoal, setSelectedGoal] = useState(fitnessGoals.goal);
  const [selectedLevel, setSelectedLevel] = useState(fitnessGoals.fitnessLevel);

  const handleSaveProfile = () => {
    updateProfileSettings({
      name,
      age: age ? parseInt(age) : undefined,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      email: email || undefined,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setActiveSection(null);
  };

  const handleSaveGoals = () => {
    updateFitnessGoals({
      targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
      targetCalories: targetCalories ? parseInt(targetCalories) : undefined,
      targetProtein: targetProtein ? parseFloat(targetProtein) : undefined,
      targetCarbs: targetCarbs ? parseFloat(targetCarbs) : undefined,
      targetFats: targetFats ? parseFloat(targetFats) : undefined,
      weeklyWorkouts: weeklyWorkouts ? parseInt(weeklyWorkouts) : undefined,
      goal: selectedGoal,
      fitnessLevel: selectedLevel,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setActiveSection(null);
  };

  // If a section is open, show detail view (keeping existing detail views)
  if (activeSection && activeSection !== null) {
    return (
      <SafeAreaView className="flex-1">
        <PremiumBackground theme={theme} variant="settings" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="px-4 pt-4 pb-3 border-b border-gray-200/20">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveSection(null);
                  }}
                  className="mr-3"
                >
                  <Ionicons
                    name="chevron-back"
                    size={28}
                    color={isDark ? "#fff" : "#000"}
                  />
                </Pressable>
                <Text
                  className={cn(
                    "text-2xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  {activeSection === "profile" && "Personal details"}
                  {activeSection === "goals" && "Edit nutrition goals"}
                  {activeSection === "weight" && "Goals & current weight"}
                  {activeSection === "language" && "Language"}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
            {/* Existing detail view content */}
            {activeSection === "profile" && (
              <View className={cn(
                "rounded-3xl p-6 mb-6",
                isDark ? "bg-white/5" : "bg-white"
              )}>
                <View className="mb-6">
                  <Text className={cn("text-base font-semibold mb-3", isDark ? "text-gray-300" : "text-gray-700")}>
                    Username
                  </Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter username"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn("rounded-2xl p-4 text-lg", isDark ? "bg-black/40 text-white border border-gray-700/30" : "bg-white text-gray-900 border border-gray-300")}
                  />
                </View>
                
                <View className="mb-6">
                  <Text className={cn("text-base font-semibold mb-3", isDark ? "text-gray-300" : "text-gray-700")}>
                    Age
                  </Text>
                  <TextInput
                    value={age}
                    onChangeText={setAge}
                    placeholder="25"
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn("rounded-2xl p-4 text-lg", isDark ? "bg-black/40 text-white border border-gray-700/30" : "bg-white text-gray-900 border border-gray-300")}
                  />
                </View>

                <Pressable onPress={handleSaveProfile} className="bg-blue-500 py-4 rounded-2xl">
                  <Text className="text-white font-bold text-center text-lg">Save Changes</Text>
                </Pressable>
              </View>
            )}

            {activeSection === "goals" && (
              <View>
                <View className="mb-4">
                  <Text className={cn("text-sm font-semibold mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                    Daily Calorie Target
                  </Text>
                  <TextInput
                    value={targetCalories}
                    onChangeText={setTargetCalories}
                    placeholder="2000"
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn("rounded-xl p-4 text-base", isDark ? "bg-white/5 text-white" : "bg-gray-100 text-gray-900")}
                  />
                </View>

                <View className="mb-4">
                  <Text className={cn("text-sm font-semibold mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                    Daily Protein Target (g)
                  </Text>
                  <TextInput
                    value={targetProtein}
                    onChangeText={setTargetProtein}
                    placeholder="150"
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn("rounded-xl p-4 text-base", isDark ? "bg-white/5 text-white" : "bg-gray-100 text-gray-900")}
                  />
                </View>

                <View className="mb-4">
                  <Text className={cn("text-sm font-semibold mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                    Daily Carbs Target (g)
                  </Text>
                  <TextInput
                    value={targetCarbs}
                    onChangeText={setTargetCarbs}
                    placeholder="200"
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn("rounded-xl p-4 text-base", isDark ? "bg-white/5 text-white" : "bg-gray-100 text-gray-900")}
                  />
                </View>

                <View className="mb-6">
                  <Text className={cn("text-sm font-semibold mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                    Daily Fats Target (g)
                  </Text>
                  <TextInput
                    value={targetFats}
                    onChangeText={setTargetFats}
                    placeholder="65"
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn("rounded-xl p-4 text-base", isDark ? "bg-white/5 text-white" : "bg-gray-100 text-gray-900")}
                  />
                </View>

                <Pressable onPress={handleSaveGoals} className="bg-blue-500 py-4 rounded-2xl mb-6">
                  <Text className="text-white font-bold text-center text-base">Save Goals</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Main Settings Screen - Redesigned to match image
  return (
    <SafeAreaView className="flex-1">
      <PremiumBackground theme={theme} variant="settings" />
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-6">
          <Text className={cn("text-5xl font-bold", isDark ? "text-white" : "text-black")}>
            Settings
          </Text>
        </View>

        <View className="px-6">
          {/* Profile Card */}
          <View
            className={cn("rounded-3xl p-6 mb-6 flex-row items-center", isDark ? "bg-white/5" : "bg-white")}
            style={{
              shadowColor: isDark ? "#000" : "#1f2937",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {/* Avatar Circle */}
            <View
              className="w-20 h-20 rounded-full mr-4 items-center justify-center"
              style={{ backgroundColor: "#4A6FA5" }}
            >
              <Text className="text-white text-2xl font-bold">
                {profileSettings.name ? profileSettings.name[0].toUpperCase() : "A"}
              </Text>
            </View>
            
            {/* Name and Age */}
            <View className="flex-1">
              <Text className={cn("text-2xl font-bold mb-1", isDark ? "text-white" : "text-black")}>
                {profileSettings.name || "Aadam"}
              </Text>
              <Text className={cn("text-base", isDark ? "text-gray-400" : "text-gray-600")}>
                {profileSettings.age || "18"} years old
              </Text>
            </View>
          </View>

          {/* Invite Friends Card */}
          <View
            className={cn("rounded-3xl p-6 mb-6", isDark ? "bg-white/5" : "bg-white")}
            style={{
              shadowColor: isDark ? "#000" : "#1f2937",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center mb-4">
              <Ionicons name="people-outline" size={24} color={isDark ? "#fff" : "#000"} />
              <Text className={cn("text-lg font-semibold ml-2", isDark ? "text-white" : "text-black")}>
                Invite friends
              </Text>
            </View>

            {/* Image Banner */}
            <View className="rounded-2xl overflow-hidden bg-gray-800 h-48 items-center justify-center">
              <Text className="text-white text-xl font-bold text-center px-6 mb-2">
                The journey is easier together
              </Text>
              <View className="bg-white rounded-full px-6 py-3 mt-2">
                <Text className="text-black font-semibold">
                  Earn $10 for each friend referred
                </Text>
              </View>
            </View>
          </View>

          {/* Settings Menu Card */}
          <View
            className={cn("rounded-3xl overflow-hidden mb-6", isDark ? "bg-white/5" : "bg-white")}
            style={{
              shadowColor: isDark ? "#000" : "#1f2937",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {/* Personal details */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveSection("profile");
              }}
              className="flex-row items-center p-5 border-b border-gray-200/10"
            >
              <Ionicons name="id-card-outline" size={24} color={isDark ? "#fff" : "#000"} />
              <Text className={cn("text-lg ml-4 flex-1", isDark ? "text-white" : "text-black")}>
                Personal details
              </Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </Pressable>

            {/* Edit nutrition goals */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveSection("goals");
              }}
              className="flex-row items-center p-5 border-b border-gray-200/10"
            >
              <Ionicons name="nutrition-outline" size={24} color={isDark ? "#fff" : "#000"} />
              <Text className={cn("text-lg ml-4 flex-1", isDark ? "text-white" : "text-black")}>
                Edit nutrition goals
              </Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </Pressable>

            {/* Goals & current weight */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveSection("weight");
              }}
              className="flex-row items-center p-5 border-b border-gray-200/10"
            >
              <Ionicons name="flag-outline" size={24} color={isDark ? "#fff" : "#000"} />
              <Text className={cn("text-lg ml-4 flex-1", isDark ? "text-white" : "text-black")}>
                Goals & current weight
              </Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </Pressable>

            {/* Weight history */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="flex-row items-center p-5 border-b border-gray-200/10"
            >
              <Ionicons name="trending-up-outline" size={24} color={isDark ? "#fff" : "#000"} />
              <Text className={cn("text-lg ml-4 flex-1", isDark ? "text-white" : "text-black")}>
                Weight history
              </Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </Pressable>

            {/* Language */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveSection("language");
              }}
              className="flex-row items-center p-5"
            >
              <Ionicons name="language-outline" size={24} color={isDark ? "#fff" : "#000"} />
              <Text className={cn("text-lg ml-4 flex-1", isDark ? "text-white" : "text-black")}>
                Language
              </Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
