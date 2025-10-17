import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
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
    "profile" | "privacy" | "display" | "goals" | null
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
    setActiveSection(null);
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-gray-50")}>
      <ScrollView className="flex-1 px-4 pt-4">
        <Text
          className={cn(
            "text-3xl font-bold mb-6",
            isDark ? "text-white" : "text-gray-900"
          )}
        >
          Settings
        </Text>

        {/* Profile Settings */}
        <View
          className={cn(
            "rounded-xl p-4 mb-4",
            isDark ? "bg-gray-800" : "bg-white"
          )}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Pressable
            onPress={() =>
              setActiveSection(activeSection === "profile" ? null : "profile")
            }
            className="flex-row justify-between items-center"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="person-circle-outline"
                size={24}
                color={isDark ? "#60a5fa" : "#3b82f6"}
              />
              <Text
                className={cn(
                  "text-lg font-semibold ml-3",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Profile Settings
              </Text>
            </View>
            <Ionicons
              name={
                activeSection === "profile" ? "chevron-up" : "chevron-down"
              }
              size={24}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />
          </Pressable>

          {activeSection === "profile" && (
            <View className="mt-4">
              <View className="mb-3">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-1",
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
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                />
              </View>

              <View className="mb-3">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-1",
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
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                />
              </View>

              <View className="mb-3">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-1",
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
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                />
              </View>

              <View className="mb-3">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-1",
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
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                />
              </View>

              <View className="mb-4">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-1",
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
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                />
              </View>

              <Pressable
                onPress={handleSaveProfile}
                className="bg-blue-500 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold text-center">
                  Save Profile
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Privacy Settings */}
        <View
          className={cn(
            "rounded-xl p-4 mb-4",
            isDark ? "bg-gray-800" : "bg-white"
          )}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Pressable
            onPress={() =>
              setActiveSection(activeSection === "privacy" ? null : "privacy")
            }
            className="flex-row justify-between items-center"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={isDark ? "#60a5fa" : "#3b82f6"}
              />
              <Text
                className={cn(
                  "text-lg font-semibold ml-3",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Privacy Settings
              </Text>
            </View>
            <Ionicons
              name={
                activeSection === "privacy" ? "chevron-up" : "chevron-down"
              }
              size={24}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />
          </Pressable>

          {activeSection === "privacy" && (
            <View className="mt-4">
              <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700">
                <Text
                  className={cn(
                    "text-base flex-1",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Share Progress
                </Text>
                <Switch
                  value={privacySettings.shareProgress}
                  onValueChange={(value) =>
                    updatePrivacySettings({ shareProgress: value })
                  }
                  trackColor={{ false: "#767577", true: "#3b82f6" }}
                  thumbColor="#ffffff"
                />
              </View>

              <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-700">
                <Text
                  className={cn(
                    "text-base flex-1",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Public Profile
                </Text>
                <Switch
                  value={privacySettings.publicProfile}
                  onValueChange={(value) =>
                    updatePrivacySettings({ publicProfile: value })
                  }
                  trackColor={{ false: "#767577", true: "#3b82f6" }}
                  thumbColor="#ffffff"
                />
              </View>

              <View className="flex-row justify-between items-center">
                <Text
                  className={cn(
                    "text-base flex-1",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Allow Messages
                </Text>
                <Switch
                  value={privacySettings.allowMessages}
                  onValueChange={(value) =>
                    updatePrivacySettings({ allowMessages: value })
                  }
                  trackColor={{ false: "#767577", true: "#3b82f6" }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          )}
        </View>

        {/* Display Settings */}
        <View
          className={cn(
            "rounded-xl p-4 mb-4",
            isDark ? "bg-gray-800" : "bg-white"
          )}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Pressable
            onPress={() =>
              setActiveSection(activeSection === "display" ? null : "display")
            }
            className="flex-row justify-between items-center"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="color-palette-outline"
                size={24}
                color={isDark ? "#60a5fa" : "#3b82f6"}
              />
              <Text
                className={cn(
                  "text-lg font-semibold ml-3",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Display Settings
              </Text>
            </View>
            <Ionicons
              name={
                activeSection === "display" ? "chevron-up" : "chevron-down"
              }
              size={24}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />
          </Pressable>

          {activeSection === "display" && (
            <View className="mt-4">
              <View className="flex-row justify-between items-center">
                <Text
                  className={cn(
                    "text-base flex-1",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Dark Mode
                </Text>
                <Switch
                  value={isDark}
                  onValueChange={(value) => setTheme(value ? "dark" : "light")}
                  trackColor={{ false: "#767577", true: "#3b82f6" }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          )}
        </View>

        {/* Fitness Goals */}
        <View
          className={cn(
            "rounded-xl p-4 mb-6",
            isDark ? "bg-gray-800" : "bg-white"
          )}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Pressable
            onPress={() =>
              setActiveSection(activeSection === "goals" ? null : "goals")
            }
            className="flex-row justify-between items-center"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="trophy-outline"
                size={24}
                color={isDark ? "#60a5fa" : "#3b82f6"}
              />
              <Text
                className={cn(
                  "text-lg font-semibold ml-3",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Fitness Goals
              </Text>
            </View>
            <Ionicons
              name={activeSection === "goals" ? "chevron-up" : "chevron-down"}
              size={24}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />
          </Pressable>

          {activeSection === "goals" && (
            <View className="mt-4">
              <View className="mb-3">
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
                      onPress={() => setSelectedGoal(goal.key)}
                      className={cn(
                        "px-3 py-2 rounded-full mr-2 mb-2",
                        selectedGoal === goal.key
                          ? "bg-blue-500"
                          : isDark
                          ? "bg-gray-700"
                          : "bg-gray-200"
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

              <View className="mb-3">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Fitness Level
                </Text>
                <View className="flex-row flex-wrap">
                  {[
                    { key: "beginner" as const, label: "Beginner" },
                    { key: "intermediate" as const, label: "Intermediate" },
                    { key: "advanced" as const, label: "Advanced" },
                  ].map((level) => (
                    <Pressable
                      key={level.key}
                      onPress={() => setSelectedLevel(level.key)}
                      className={cn(
                        "px-3 py-2 rounded-full mr-2 mb-2",
                        selectedLevel === level.key
                          ? "bg-blue-500"
                          : isDark
                          ? "bg-gray-700"
                          : "bg-gray-200"
                      )}
                    >
                      <Text
                        className={cn(
                          "text-sm font-semibold",
                          selectedLevel === level.key
                            ? "text-white"
                            : isDark
                            ? "text-gray-300"
                            : "text-gray-700"
                        )}
                      >
                        {level.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="mb-3">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-1",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Target Weight (lbs)
                </Text>
                <TextInput
                  value={targetWeight}
                  onChangeText={setTargetWeight}
                  placeholder="Target weight"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  className={cn(
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                />
              </View>

              <View className="mb-3">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-1",
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
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                />
              </View>

              <View className="mb-3">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-1",
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
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                />
              </View>

              <View className="mb-3">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-1",
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
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                />
              </View>

              <View className="mb-3">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-1",
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
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                />
              </View>

              <View className="mb-4">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-1",
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
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-900"
                  )}
                />
              </View>

              <Pressable
                onPress={handleSaveGoals}
                className="bg-blue-500 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold text-center">
                  Save Goals
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
