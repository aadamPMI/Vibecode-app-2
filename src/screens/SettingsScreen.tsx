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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSettingsStore } from "../state/settingsStore";
import { cn } from "../utils/cn";

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
    "profile" | "privacy" | "display" | "goals" | "notifications" | null
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

  // If a section is open, show its detail view
  if (activeSection) {
    return (
      <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-white")}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="px-4 pt-4 pb-3 border-b border-gray-200">
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
                  {activeSection === "profile" && "Profile Settings"}
                  {activeSection === "privacy" && "Privacy Settings"}
                  {activeSection === "display" && "Display Settings"}
                  {activeSection === "goals" && "Goals Settings"}
                  {activeSection === "notifications" && "Notifications"}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
            {/* Profile Settings Content */}
            {activeSection === "profile" && (
              <View>
                <View className="mb-4">
                  <Text
                    className={cn(
                      "text-sm font-semibold mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    Name
                  </Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Your name"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn(
                      "rounded-xl p-4 text-base",
                      isDark
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-900"
                    )}
                  />
                </View>

                <View className="mb-4">
                  <Text
                    className={cn(
                      "text-sm font-semibold mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    Email
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    keyboardType="email-address"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn(
                      "rounded-xl p-4 text-base",
                      isDark
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-900"
                    )}
                  />
                </View>

                <View className="mb-4">
                  <Text
                    className={cn(
                      "text-sm font-semibold mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    Age
                  </Text>
                  <TextInput
                    value={age}
                    onChangeText={setAge}
                    placeholder="Age"
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn(
                      "rounded-xl p-4 text-base",
                      isDark
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-900"
                    )}
                  />
                </View>

                <View className="mb-4">
                  <Text
                    className={cn(
                      "text-sm font-semibold mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    Height (inches)
                  </Text>
                  <TextInput
                    value={height}
                    onChangeText={setHeight}
                    placeholder="Height"
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn(
                      "rounded-xl p-4 text-base",
                      isDark
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-900"
                    )}
                  />
                </View>

                <View className="mb-6">
                  <Text
                    className={cn(
                      "text-sm font-semibold mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    Current Weight (lbs)
                  </Text>
                  <TextInput
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="Weight"
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn(
                      "rounded-xl p-4 text-base",
                      isDark
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-900"
                    )}
                  />
                </View>

                <Pressable
                  onPress={handleSaveProfile}
                  className="bg-blue-500 py-4 rounded-2xl mb-6"
                >
                  <Text className="text-white font-bold text-center text-base">
                    Save Changes
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Privacy Settings Content */}
            {activeSection === "privacy" && (
              <View>
                <View
                  className={cn(
                    "rounded-2xl p-4 mb-4 flex-row justify-between items-center",
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  )}
                >
                  <Text
                    className={cn(
                      "text-base font-semibold flex-1",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    Share Progress
                  </Text>
                  <Switch
                    value={privacySettings.shareProgress}
                    onValueChange={(value) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      updatePrivacySettings({ shareProgress: value });
                    }}
                    trackColor={{ false: "#767577", true: "#3b82f6" }}
                    thumbColor="#ffffff"
                  />
                </View>

                <View
                  className={cn(
                    "rounded-2xl p-4 mb-4 flex-row justify-between items-center",
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  )}
                >
                  <Text
                    className={cn(
                      "text-base font-semibold flex-1",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    Public Profile
                  </Text>
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

                <View
                  className={cn(
                    "rounded-2xl p-4 mb-4 flex-row justify-between items-center",
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  )}
                >
                  <Text
                    className={cn(
                      "text-base font-semibold flex-1",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    Allow Messages
                  </Text>
                  <Switch
                    value={privacySettings.allowMessages}
                    onValueChange={(value) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      updatePrivacySettings({ allowMessages: value });
                    }}
                    trackColor={{ false: "#767577", true: "#3b82f6" }}
                    thumbColor="#ffffff"
                  />
                </View>
              </View>
            )}

            {/* Display Settings Content */}
            {activeSection === "display" && (
              <View>
                <View
                  className={cn(
                    "rounded-2xl p-4 mb-4 flex-row justify-between items-center",
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  )}
                >
                  <Text
                    className={cn(
                      "text-base font-semibold flex-1",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    Dark Mode
                  </Text>
                  <Switch
                    value={isDark}
                    onValueChange={(value) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setTheme(value ? "dark" : "light");
                    }}
                    trackColor={{ false: "#767577", true: "#3b82f6" }}
                    thumbColor="#ffffff"
                  />
                </View>

                <Text
                  className={cn(
                    "text-sm px-2 mt-2",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  Theme and appearance options
                </Text>
              </View>
            )}

            {/* Goals Settings Content */}
            {activeSection === "goals" && (
              <View>
                <View className="mb-4">
                  <Text
                    className={cn(
                      "text-sm font-semibold mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    Fitness Goal
                  </Text>
                  <View className="flex-row flex-wrap">
                    {[
                      { key: "lose_weight" as const, label: "Lose Weight" },
                      { key: "gain_muscle" as const, label: "Gain Muscle" },
                      { key: "maintain" as const, label: "Maintain" },
                      { key: "general_fitness" as const, label: "General Fitness" },
                    ].map((goal) => (
                      <Pressable
                        key={goal.key}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedGoal(goal.key);
                        }}
                        className={cn(
                          "px-4 py-2 rounded-full mr-2 mb-2",
                          selectedGoal === goal.key
                            ? "bg-blue-500"
                            : isDark
                            ? "bg-gray-800"
                            : "bg-gray-100"
                        )}
                      >
                        <Text
                          className={cn(
                            "text-sm font-semibold",
                            selectedGoal === goal.key
                              ? "text-white"
                              : isDark
                              ? "text-gray-300"
                              : "text-gray-700"
                          )}
                        >
                          {goal.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View className="mb-4">
                  <Text
                    className={cn(
                      "text-sm font-semibold mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    Daily Calorie Target
                  </Text>
                  <TextInput
                    value={targetCalories}
                    onChangeText={setTargetCalories}
                    placeholder="2000"
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn(
                      "rounded-xl p-4 text-base",
                      isDark
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-900"
                    )}
                  />
                </View>

                <View className="mb-4">
                  <Text
                    className={cn(
                      "text-sm font-semibold mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    Daily Protein Target (g)
                  </Text>
                  <TextInput
                    value={targetProtein}
                    onChangeText={setTargetProtein}
                    placeholder="150"
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn(
                      "rounded-xl p-4 text-base",
                      isDark
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-900"
                    )}
                  />
                </View>

                <View className="mb-4">
                  <Text
                    className={cn(
                      "text-sm font-semibold mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    Daily Carbs Target (g)
                  </Text>
                  <TextInput
                    value={targetCarbs}
                    onChangeText={setTargetCarbs}
                    placeholder="200"
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn(
                      "rounded-xl p-4 text-base",
                      isDark
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-900"
                    )}
                  />
                </View>

                <View className="mb-4">
                  <Text
                    className={cn(
                      "text-sm font-semibold mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    Daily Fats Target (g)
                  </Text>
                  <TextInput
                    value={targetFats}
                    onChangeText={setTargetFats}
                    placeholder="65"
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn(
                      "rounded-xl p-4 text-base",
                      isDark
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-900"
                    )}
                  />
                </View>

                <View className="mb-6">
                  <Text
                    className={cn(
                      "text-sm font-semibold mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    Weekly Workout Goal
                  </Text>
                  <TextInput
                    value={weeklyWorkouts}
                    onChangeText={setWeeklyWorkouts}
                    placeholder="4"
                    keyboardType="numeric"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn(
                      "rounded-xl p-4 text-base",
                      isDark
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-900"
                    )}
                  />
                </View>

                <Pressable
                  onPress={handleSaveGoals}
                  className="bg-blue-500 py-4 rounded-2xl mb-6"
                >
                  <Text className="text-white font-bold text-center text-base">
                    Save Goals
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Notifications Content */}
            {activeSection === "notifications" && (
              <View>
                <View
                  className={cn(
                    "rounded-2xl p-4 mb-4",
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  )}
                >
                  <View className="flex-row justify-between items-center mb-4">
                    <Text
                      className={cn(
                        "text-base font-semibold flex-1",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      Workout Reminders
                    </Text>
                    <Switch
                      value={true}
                      onValueChange={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      trackColor={{ false: "#767577", true: "#3b82f6" }}
                      thumbColor="#ffffff"
                    />
                  </View>
                  <Text
                    className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    Get notified about your scheduled workouts
                  </Text>
                </View>

                <View
                  className={cn(
                    "rounded-2xl p-4 mb-4",
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  )}
                >
                  <View className="flex-row justify-between items-center mb-4">
                    <Text
                      className={cn(
                        "text-base font-semibold flex-1",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      Meal Tracking
                    </Text>
                    <Switch
                      value={true}
                      onValueChange={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      trackColor={{ false: "#767577", true: "#3b82f6" }}
                      thumbColor="#ffffff"
                    />
                  </View>
                  <Text
                    className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    Reminders to log your meals
                  </Text>
                </View>

                <View
                  className={cn(
                    "rounded-2xl p-4 mb-4",
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  )}
                >
                  <View className="flex-row justify-between items-center mb-4">
                    <Text
                      className={cn(
                        "text-base font-semibold flex-1",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      Community Updates
                    </Text>
                    <Switch
                      value={false}
                      onValueChange={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      trackColor={{ false: "#767577", true: "#3b82f6" }}
                      thumbColor="#ffffff"
                    />
                  </View>
                  <Text
                    className={cn(
                      "text-sm",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    Get notified about community posts and activity
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Main Settings Menu
  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-white")}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-blue-500 rounded-2xl items-center justify-center mr-3">
                <Ionicons name="fitness" size={24} color="white" />
              </View>
              <View>
                <Text
                  className={cn(
                    "text-2xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  GainAI
                </Text>
                <Text
                  className={cn(
                    "text-sm",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  Settings
                </Text>
              </View>
            </View>
            <Pressable className="w-12 h-12 rounded-full items-center justify-center border-2 border-blue-500">
              <Text className="text-blue-500 text-lg font-bold">A</Text>
            </Pressable>
          </View>
        </View>

        <View className="px-4 pt-4">
          <Text
            className={cn(
              "text-3xl font-bold mb-6",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            Settings
          </Text>

          {/* Profile Settings Card */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setActiveSection("profile");
            }}
            className={cn(
              "rounded-3xl p-5 mb-4 flex-row items-center",
              isDark ? "bg-gray-800" : "bg-white"
            )}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4 bg-blue-100">
              <Ionicons name="person" size={28} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text
                className={cn(
                  "text-xl font-bold mb-1",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Profile Settings
              </Text>
              <Text
                className={cn(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                Manage your personal information
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />
          </Pressable>

          {/* Privacy Settings Card */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setActiveSection("privacy");
            }}
            className={cn(
              "rounded-3xl p-5 mb-4 flex-row items-center",
              isDark ? "bg-gray-800" : "bg-white"
            )}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4 bg-purple-100">
              <Ionicons name="shield-checkmark" size={28} color="#a855f7" />
            </View>
            <View className="flex-1">
              <Text
                className={cn(
                  "text-xl font-bold mb-1",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Privacy Settings
              </Text>
              <Text
                className={cn(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                Control your data and visibility
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />
          </Pressable>

          {/* Display Settings Card */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setActiveSection("display");
            }}
            className={cn(
              "rounded-3xl p-5 mb-4 flex-row items-center",
              isDark ? "bg-gray-800" : "bg-white"
            )}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4 bg-cyan-100">
              <Ionicons name="color-palette" size={28} color="#06b6d4" />
            </View>
            <View className="flex-1">
              <Text
                className={cn(
                  "text-xl font-bold mb-1",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Display Settings
              </Text>
              <Text
                className={cn(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                Theme and appearance options
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />
          </Pressable>

          {/* Goals Settings Card */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setActiveSection("goals");
            }}
            className={cn(
              "rounded-3xl p-5 mb-4 flex-row items-center",
              isDark ? "bg-gray-800" : "bg-white"
            )}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4 bg-green-100">
              <Ionicons name="trophy" size={28} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text
                className={cn(
                  "text-xl font-bold mb-1",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Goals Settings
              </Text>
              <Text
                className={cn(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                Nutrition and fitness targets
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />
          </Pressable>

          {/* Notifications Card */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setActiveSection("notifications");
            }}
            className={cn(
              "rounded-3xl p-5 mb-6 flex-row items-center",
              isDark ? "bg-gray-800" : "bg-white"
            )}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4 bg-orange-100">
              <Ionicons name="notifications" size={28} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text
                className={cn(
                  "text-xl font-bold mb-1",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Notifications
              </Text>
              <Text
                className={cn(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                Manage alerts and reminders
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
