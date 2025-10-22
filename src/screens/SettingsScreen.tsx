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
  useColorScheme,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSettingsStore } from "../state/settingsStore";
import { useAuthStore } from "../state/authStore";
import { cn } from "../utils/cn";
import { PremiumBackground } from "../components/PremiumBackground";

export default function SettingsScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const profileSettings = useSettingsStore((s) => s.profileSettings);
  const privacySettings = useSettingsStore((s) => s.privacySettings);
  const preferencesSettings = useSettingsStore((s) => s.preferencesSettings);
  const fitnessGoals = useSettingsStore((s) => s.fitnessGoals);
  const updateProfileSettings = useSettingsStore((s) => s.updateProfileSettings);
  const updatePrivacySettings = useSettingsStore((s) => s.updatePrivacySettings);
  const updatePreferencesSettings = useSettingsStore((s) => s.updatePreferencesSettings);
  const updateFitnessGoals = useSettingsStore((s) => s.updateFitnessGoals);
  const resetOnboarding = useAuthStore((s) => s.resetOnboarding);

  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === "system" ? (systemColorScheme || "light") : theme;
  const isDark = resolvedTheme === "dark";
  const [activeSection, setActiveSection] = useState<
    "profile" | "privacy" | "display" | "goals" | "notifications" | "weight" | "language" | null
  >(null);

  // Profile modal state
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  // Triple-tap counter for debug reset
  const [tapCount, setTapCount] = useState(0);
  const [tapTimeout, setTapTimeout] = useState<NodeJS.Timeout | null>(null);

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

  const handleSaveProfileModal = () => {
    updateProfileSettings({
      name,
      age: age ? parseInt(age) : undefined,
      email: email || undefined,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsProfileModalVisible(false);
  };

  const handleSignOut = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    resetOnboarding(); // This will trigger the onboarding flow again
    setIsProfileModalVisible(false);
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

  // Triple-tap handler for debug reset
  const handleHeaderTap = () => {
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    // Clear existing timeout
    if (tapTimeout) {
      clearTimeout(tapTimeout);
    }

    // Reset tap count after 1 second
    const timeout = setTimeout(() => {
      setTapCount(0);
    }, 1000);
    setTapTimeout(timeout);

    // If triple-tapped, reset onboarding
    if (newTapCount === 3) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      resetOnboarding();
      setTapCount(0);
      if (tapTimeout) {
        clearTimeout(tapTimeout);
      }
    }
  };

  // If a section is open, show detail view (keeping existing detail views)
  if (activeSection && activeSection !== null) {
    return (
      <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-gray-50")}>
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
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-gray-50")}>
      <PremiumBackground theme={theme} variant="settings" />
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-6">
          <Pressable onPress={handleHeaderTap}>
            <Text
              className={cn(
                "text-4xl font-bold",
                isDark ? "text-white" : "text-black"
              )}
            >
              Settings
            </Text>
          </Pressable>
        </View>

        <View className="px-6">
          {/* Profile Card */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsProfileModalVisible(true);
            }}
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

            {/* Chevron Icon */}
            <Ionicons name="chevron-forward" size={24} color={isDark ? "#9ca3af" : "#6b7280"} />
          </Pressable>

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
              <Text className={cn("text-base font-bold ml-2", isDark ? "text-white" : "text-black")}>
                Invite friends
              </Text>
            </View>

            {/* Image Banner */}
            <View className="rounded-2xl overflow-hidden bg-gray-800 h-48 items-center justify-center">
              <Text className="text-white text-base font-bold text-center px-6 mb-2">
                The journey is easier together
              </Text>
              <View className="bg-white rounded-full px-6 py-3 mt-2">
                <Text className="text-black font-bold text-xs">
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
              <Text className={cn("text-base font-bold ml-4 flex-1", isDark ? "text-white" : "text-black")}>
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
              <Text className={cn("text-base font-bold ml-4 flex-1", isDark ? "text-white" : "text-black")}>
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
              <Text className={cn("text-base font-bold ml-4 flex-1", isDark ? "text-white" : "text-black")}>
                Goals & current weight
              </Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </Pressable>

            {/* Language */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveSection("language");
              }}
              className="flex-row items-center p-5 border-b border-gray-200/10"
            >
              <Ionicons name="language-outline" size={24} color={isDark ? "#fff" : "#000"} />
              <Text className={cn("text-base font-bold ml-4 flex-1", isDark ? "text-white" : "text-black")}>
                Language
              </Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </Pressable>
          </View>

          {/* Preferences Card */}
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
            {/* Preferences Header */}
            <View className="flex-row items-center p-5 border-b border-gray-200/10">
              <Ionicons name="settings-outline" size={24} color={isDark ? "#fff" : "#000"} />
              <Text className={cn("text-base font-bold ml-3", isDark ? "text-white" : "text-black")}>
                Preferences
              </Text>
            </View>

            {/* Appearance */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Cycle through theme options
                if (theme === "light") {
                  setTheme("dark");
                } else if (theme === "dark") {
                  setTheme("system");
                } else {
                  setTheme("light");
                }
              }}
              className="px-5 py-4 border-b border-gray-200/10"
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className={cn("text-base font-bold mb-1", isDark ? "text-white" : "text-black")}>
                    Appearance
                  </Text>
                  <Text className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>
                    Choose light, dark, or system appearance
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className={cn("text-sm mr-2", isDark ? "text-white" : "text-black")}>
                    {theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
                </View>
              </View>
            </Pressable>

            {/* Rollover calories */}
            <View className="px-5 py-4 border-b border-gray-200/10">
              <View className="flex-row justify-between items-center">
                <View className="flex-1 mr-4">
                  <Text className={cn("text-base font-bold mb-1", isDark ? "text-white" : "text-black")}>
                    Rollover calories
                  </Text>
                  <Text className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>
                    Add up to 200 left over calories from yesterday into {"today's"} daily goal
                  </Text>
                </View>
                <Switch
                  value={preferencesSettings.rolloverCalories}
                  onValueChange={(value) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    updatePreferencesSettings({ rolloverCalories: value });
                  }}
                  trackColor={{ false: "#767577", true: "#3b82f6" }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>

            {/* Workout Profile Visibility */}
            <View className="px-5 py-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-1 mr-4">
                  <Text className={cn("text-base font-bold mb-1", isDark ? "text-white" : "text-black")}>
                    Workout profile visibility
                  </Text>
                  <Text className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-600")}>
                    Allow others to see your workout programs and history on your profile
                  </Text>
                </View>
                <Switch
                  value={privacySettings.publicProfile}
                  onValueChange={(value) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    updatePrivacySettings({ publicProfile: value });
                  }}
                  trackColor={{ false: "#767577", true: "#3b82f6" }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          </View>

          {/* Account & Legal Card */}
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
            {/* Terms and Conditions */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // TODO: Open Terms and Conditions
              }}
              className="flex-row items-center p-5 border-b border-gray-200/10"
            >
              <Ionicons name="document-text-outline" size={24} color={isDark ? "#fff" : "#000"} />
              <Text className={cn("text-base ml-4 flex-1", isDark ? "text-white" : "text-black")}>
                Terms and Conditions
              </Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </Pressable>

            {/* Privacy Policy */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // TODO: Open Privacy Policy
              }}
              className="flex-row items-center p-5 border-b border-gray-200/10"
            >
              <Ionicons name="shield-checkmark-outline" size={24} color={isDark ? "#fff" : "#000"} />
              <Text className={cn("text-base ml-4 flex-1", isDark ? "text-white" : "text-black")}>
                Privacy Policy
              </Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </Pressable>

            {/* Support Email */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // TODO: Open email to support
              }}
              className="flex-row items-center p-5 border-b border-gray-200/10"
            >
              <Ionicons name="mail-outline" size={24} color={isDark ? "#fff" : "#000"} />
              <Text className={cn("text-base ml-4 flex-1", isDark ? "text-white" : "text-black")}>
                Support Email
              </Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </Pressable>

            {/* Delete Account */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // TODO: Show delete account confirmation
              }}
              className="flex-row items-center p-5 border-b border-gray-200/10"
            >
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
              <Text className={cn("text-base ml-4 flex-1", "text-red-500")}>
                Delete Account
              </Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </Pressable>

            {/* Log Out */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // TODO: Log out user
              }}
              className="flex-row items-center p-5"
            >
              <Ionicons name="log-out-outline" size={24} color={isDark ? "#fff" : "#000"} />
              <Text className={cn("text-base ml-4 flex-1", isDark ? "text-white" : "text-black")}>
                Log Out
              </Text>
              <Ionicons name="chevron-forward" size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={isProfileModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsProfileModalVisible(false)}
      >
        <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-gray-50")}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
          >
            <View className="flex-1">
              {/* Header */}
              <View className="flex-row items-center justify-between px-6 py-4 border-b" style={{ borderBottomColor: isDark ? "#1f1f1f" : "#e5e7eb" }}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIsProfileModalVisible(false);
                  }}
                >
                  <Ionicons name="close" size={28} color={isDark ? "#fff" : "#000"} />
                </Pressable>
                <Text className={cn("text-xl font-bold", isDark ? "text-white" : "text-black")}>
                  Profile
                </Text>
                <View style={{ width: 28 }} />
              </View>

              <ScrollView className="flex-1 px-6 pt-6">
                {/* Avatar Section */}
                <View className="items-center mb-8">
                  <View
                    className="w-32 h-32 rounded-full items-center justify-center mb-4"
                    style={{ backgroundColor: "#4A6FA5" }}
                  >
                    <Text className="text-white text-5xl font-bold">
                      {name ? name[0].toUpperCase() : "A"}
                    </Text>
                  </View>
                </View>

                {/* Name Input */}
                <View className="mb-6">
                  <Text className={cn("text-sm font-semibold mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                    Name
                  </Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn("rounded-xl p-4 text-base", isDark ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-gray-900")}
                  />
                </View>

                {/* Age Input */}
                <View className="mb-6">
                  <Text className={cn("text-sm font-semibold mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                    Age
                  </Text>
                  <TextInput
                    value={age}
                    onChangeText={setAge}
                    placeholder="Enter your age"
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn("rounded-xl p-4 text-base", isDark ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-gray-900")}
                  />
                </View>

                {/* Email Input */}
                <View className="mb-6">
                  <Text className={cn("text-sm font-semibold mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                    Email
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn("rounded-xl p-4 text-base", isDark ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-gray-900")}
                  />
                </View>

                {/* Save Button */}
                <Pressable 
                  onPress={handleSaveProfileModal} 
                  className="bg-blue-500 py-4 rounded-2xl mb-4"
                >
                  <Text className="text-white font-bold text-center text-base">Save Changes</Text>
                </Pressable>

                {/* Sign Out Button */}
                <Pressable 
                  onPress={handleSignOut} 
                  className="bg-red-500 py-4 rounded-2xl mb-6"
                >
                  <Text className="text-white font-bold text-center text-base">Sign Out</Text>
                </Pressable>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
