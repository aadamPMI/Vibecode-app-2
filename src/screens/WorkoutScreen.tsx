import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useWorkoutStore, Workout, Exercise } from "../state/workoutStore";
import { useSettingsStore } from "../state/settingsStore";
import { cn } from "../utils/cn";

export default function WorkoutScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const workouts = useWorkoutStore((s) => s.workouts);
  const addWorkout = useWorkoutStore((s) => s.addWorkout);
  const deleteWorkout = useWorkoutStore((s) => s.deleteWorkout);
  
  const isDark = theme === "dark";
  const [activeView, setActiveView] = useState<"active" | "programs" | "history" | "stats" | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseName, setCurrentExerciseName] = useState("");

  const handleAddExercise = () => {
    if (currentExerciseName.trim()) {
      const newExercise: Exercise = {
        id: Date.now().toString(),
        name: currentExerciseName,
        sets: [],
      };
      setExercises([...exercises, newExercise]);
      setCurrentExerciseName("");
    }
  };

  const handleAddSet = (exerciseId: string, reps: number, weight: number) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                { id: Date.now().toString(), reps, weight },
              ],
            }
          : ex
      )
    );
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
          : ex
      )
    );
  };

  const handleSaveWorkout = () => {
    if (workoutName.trim() && exercises.length > 0) {
      const newWorkout: Workout = {
        id: Date.now().toString(),
        name: workoutName,
        date: new Date().toISOString(),
        exercises,
      };
      addWorkout(newWorkout);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setWorkoutName("");
      setExercises([]);
      setIsCreateModalVisible(false);
      setActiveView(null);
    }
  };

  const handleCancelWorkout = () => {
    setWorkoutName("");
    setExercises([]);
    setIsCreateModalVisible(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTotalVolume = (workout: Workout) => {
    return workout.exercises.reduce(
      (total, exercise) =>
        total +
        exercise.sets.reduce((sum, set) => sum + set.reps * set.weight, 0),
      0
    );
  };

  const getThisWeekWorkouts = () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return workouts.filter((w) => {
      const workoutDate = new Date(w.date);
      return workoutDate >= weekAgo && workoutDate <= today;
    }).length;
  };

  const getTotalPRs = () => {
    // Simple PR calculation: count exercises with max weight
    return workouts.reduce((total, workout) => {
      return total + workout.exercises.length;
    }, 0);
  };


  // Home view with 4 cards
  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-white")}>
      <View className="flex-1 px-4 pt-4">
        <View className="mb-6">
          <Text
            className={cn(
              "text-3xl font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            GainAI
          </Text>
          <Text
            className={cn(
              "text-sm mt-1",
              isDark ? "text-gray-400" : "text-gray-600"
            )}
          >
            Workout
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Active Workout Card */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setActiveView(activeView === "active" ? null : "active");
            }}
            className={cn(
              "rounded-3xl p-6 mb-4",
              activeView === "active"
                ? "border-2 border-orange-500"
                : isDark
                ? "bg-gray-800"
                : "bg-white"
            )}
            style={{
              shadowColor: activeView === "active" ? "#fb923c" : "#000",
              shadowOffset: { width: 0, height: activeView === "active" ? 6 : 4 },
              shadowOpacity: activeView === "active" ? 0.4 : 0.2,
              shadowRadius: activeView === "active" ? 16 : 8,
              elevation: activeView === "active" ? 8 : 5,
            }}
          >
            <View
              className="rounded-3xl p-5 mb-4"
              style={{ 
                backgroundColor: "rgba(251, 146, 60, 0.15)",
                shadowColor: "#fb923c",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
              }}
            >
              <Ionicons name="flame" size={36} color="#fb923c" />
            </View>
            <Text
              className={cn(
                "text-2xl font-bold mb-2",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Active Workout
            </Text>
            <Text
              className={cn(
                "text-sm mb-4",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              Start your training session
            </Text>
            <View className="flex-row items-center">
              <Ionicons
                name="play-circle"
                size={20}
                color="#fb923c"
              />
              <Text className="text-base font-semibold ml-2 text-orange-500">
                Start Workout
              </Text>
            </View>
          </Pressable>

          {/* Active Workout Options - Shows when clicked */}
          {activeView === "active" && (
            <View className="mb-4">
              <View
                className={cn(
                  "rounded-3xl p-6",
                  isDark ? "bg-gray-800" : "bg-gray-100"
                )}
              >
                <Text
                  className={cn(
                    "text-xl font-bold mb-4",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Start Your Workout
                </Text>

                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setIsCreateModalVisible(true);
                  }}
                  className="bg-blue-500 py-4 rounded-2xl mb-3 flex-row items-center justify-center"
                >
                  <Ionicons name="add-circle-outline" size={24} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Create New Workout
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    alert("AI Workout Plan generator coming soon!");
                  }}
                  className={cn(
                    "py-4 rounded-2xl mb-3 flex-row items-center justify-center",
                    isDark ? "bg-purple-600" : "bg-purple-500"
                  )}
                >
                  <Ionicons name="sparkles" size={24} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Generate AI Plan
                  </Text>
                </Pressable>

                <View className="mt-4">
                  <Text
                    className={cn(
                      "text-sm font-semibold mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    Quick Start Templates
                  </Text>
                  {["Push Day", "Pull Day", "Leg Day", "Full Body"].map((template) => (
                    <Pressable
                      key={template}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setWorkoutName(template);
                        setIsCreateModalVisible(true);
                      }}
                      className={cn(
                        "rounded-xl p-3 mb-2",
                        isDark ? "bg-gray-700" : "bg-white"
                      )}
                    >
                      <Text
                        className={cn(
                          "text-base font-semibold",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        {template}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* My Programs Card */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setActiveView(activeView === "programs" ? null : "programs");
            }}
            className={cn(
              "rounded-3xl p-5 mb-4",
              activeView === "programs"
                ? "border-2 border-blue-500"
                : isDark
                ? "bg-gray-800"
                : "bg-gray-100"
            )}
            style={{
              shadowColor: activeView === "programs" ? "#3b82f6" : "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: activeView === "programs" ? 0.4 : 0.1,
              shadowRadius: activeView === "programs" ? 16 : 8,
              elevation: 5,
            }}
          >
            <View
              className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: "rgba(147, 197, 253, 0.3)" }}
            >
              <Ionicons name="fitness-outline" size={32} color="#60a5fa" />
            </View>
            <Text
              className={cn(
                "text-2xl font-bold mb-2",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              My Programs
            </Text>
            <Text
              className={cn(
                "text-sm mb-4",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              Manage workout splits
            </Text>
            <View className="flex-row items-center">
              <Ionicons
                name="albums-outline"
                size={18}
                color={isDark ? "#9ca3af" : "#6b7280"}
              />
              <Text
                className={cn(
                  "text-base font-semibold ml-2",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                0 splits
              </Text>
            </View>
          </Pressable>

          {/* Programs List - Shows when clicked */}
          {activeView === "programs" && (
            <View className="mb-4">
              <View
                className={cn(
                  "rounded-3xl p-6",
                  isDark ? "bg-gray-800" : "bg-gray-100"
                )}
              >
                <View className="items-center py-8">
                  <View
                    className="w-20 h-20 rounded-full items-center justify-center mb-4"
                    style={{ backgroundColor: isDark ? "#1f2937" : "#f3f4f6" }}
                  >
                    <Ionicons
                      name="fitness-outline"
                      size={40}
                      color={isDark ? "#6b7280" : "#9ca3af"}
                    />
                  </View>
                  <Text
                    className={cn(
                      "text-lg font-semibold mb-2",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    No programs yet
                  </Text>
                  <Text
                    className={cn(
                      "text-sm text-center mb-4",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    Create custom workout splits and training programs
                  </Text>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      alert("Program builder coming soon!");
                    }}
                    className="bg-blue-500 px-6 py-3 rounded-full"
                  >
                    <Text className="text-white font-bold">Create Program</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          <View className="flex-row mb-4">
            {/* History Card */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setActiveView(activeView === "history" ? null : "history");
              }}
              className={cn(
                "flex-1 rounded-3xl p-5 mr-2",
                activeView === "history"
                  ? "border-2 border-green-500"
                  : isDark
                  ? "bg-gray-800"
                  : "bg-gray-100"
              )}
              style={{
                shadowColor: activeView === "history" ? "#4ade80" : "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: activeView === "history" ? 0.4 : 0.1,
                shadowRadius: activeView === "history" ? 16 : 8,
                elevation: 5,
              }}
            >
              <View
                className="rounded-2xl p-4 mb-4"
                style={{ backgroundColor: "rgba(134, 239, 172, 0.3)" }}
              >
                <Ionicons name="trending-up" size={28} color="#4ade80" />
              </View>
              <Text
                className={cn(
                  "text-xl font-bold mb-2",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                History
              </Text>
              <Text
                className={cn(
                  "text-xs mb-4",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                Track your progress
              </Text>
              <View className="flex-row items-center">
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
                <Text
                  className={cn(
                    "text-sm font-semibold ml-1",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  {getThisWeekWorkouts()} this week
                </Text>
              </View>
            </Pressable>

            {/* Stats Card */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setActiveView(activeView === "stats" ? null : "stats");
              }}
              className={cn(
                "flex-1 rounded-3xl p-5 ml-2",
                activeView === "stats"
                  ? "border-2 border-purple-500"
                  : isDark
                  ? "bg-gray-800"
                  : "bg-gray-100"
              )}
              style={{
                shadowColor: activeView === "stats" ? "#a855f7" : "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: activeView === "stats" ? 0.4 : 0.1,
                shadowRadius: activeView === "stats" ? 16 : 8,
                elevation: 5,
              }}
            >
              <View
                className="rounded-2xl p-4 mb-4"
                style={{ backgroundColor: "rgba(251, 146, 60, 0.15)" }}
              >
                <Ionicons name="flame" size={28} color="#fb923c" />
              </View>
              <Text
                className={cn(
                  "text-xl font-bold mb-2",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Stats
              </Text>
              <Text
                className={cn(
                  "text-xs mb-4",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                Dashboard & insights
              </Text>
              <View className="flex-row items-center">
                <Ionicons
                  name="star-outline"
                  size={16}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
                <Text
                  className={cn(
                    "text-sm font-semibold ml-1",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  {getTotalPRs()} PRs
                </Text>
              </View>
            </Pressable>
          </View>

          {/* History List - Shows when clicked */}
          {activeView === "history" && (
            <View className="mb-4">
              {workouts.length === 0 ? (
                <View
                  className={cn(
                    "rounded-3xl p-6",
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  )}
                >
                  <View className="items-center py-8">
                    <View
                      className="w-20 h-20 rounded-full items-center justify-center mb-4"
                      style={{ backgroundColor: isDark ? "#1f2937" : "#f3f4f6" }}
                    >
                      <Ionicons
                        name="trending-up-outline"
                        size={40}
                        color={isDark ? "#6b7280" : "#9ca3af"}
                      />
                    </View>
                    <Text
                      className={cn(
                        "text-lg font-semibold mb-2",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      No workouts yet
                    </Text>
                    <Text
                      className={cn(
                        "text-sm text-center",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      Start your first workout to track your progress
                    </Text>
                  </View>
                </View>
              ) : (
                workouts.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedWorkout(item);
                    }}
                    className={cn(
                      "rounded-2xl p-4 mb-3",
                      isDark ? "bg-gray-800" : "bg-gray-100"
                    )}
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <Text
                        className={cn(
                          "text-lg font-bold flex-1",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        {item.name}
                      </Text>
                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          deleteWorkout(item.id);
                        }}
                        className="p-1"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color={isDark ? "#ef4444" : "#dc2626"}
                        />
                      </Pressable>
                    </View>
                    <Text
                      className={cn(
                        "text-sm mb-3",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      {formatDate(item.date)}
                    </Text>
                    <View className="flex-row flex-wrap">
                      <View className="mr-4 mb-2">
                        <Text
                          className={cn(
                            "text-xs",
                            isDark ? "text-gray-500" : "text-gray-500"
                          )}
                        >
                          Exercises
                        </Text>
                        <Text
                          className={cn(
                            "text-base font-semibold",
                            isDark ? "text-blue-400" : "text-blue-600"
                          )}
                        >
                          {item.exercises.length}
                        </Text>
                      </View>
                      <View className="mr-4 mb-2">
                        <Text
                          className={cn(
                            "text-xs",
                            isDark ? "text-gray-500" : "text-gray-500"
                          )}
                        >
                          Total Sets
                        </Text>
                        <Text
                          className={cn(
                            "text-base font-semibold",
                            isDark ? "text-green-400" : "text-green-600"
                          )}
                        >
                          {item.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
                        </Text>
                      </View>
                      <View className="mb-2">
                        <Text
                          className={cn(
                            "text-xs",
                            isDark ? "text-gray-500" : "text-gray-500"
                          )}
                        >
                          Volume (lbs)
                        </Text>
                        <Text
                          className={cn(
                            "text-base font-semibold",
                            isDark ? "text-purple-400" : "text-purple-600"
                          )}
                        >
                          {getTotalVolume(item)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          )}

          {/* Stats Dashboard - Shows when clicked */}
          {activeView === "stats" && (
            <View className="mb-20">
              <View
                className="rounded-3xl p-6 mb-4"
                style={{
                  backgroundColor: "#3b82f6",
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <Text className="text-white text-xs font-semibold mb-2 uppercase opacity-90">Total Workouts</Text>
                <Text className="text-white text-6xl font-bold mb-2">
                  {workouts.length}
                </Text>
                <Text className="text-white text-sm opacity-80">
                  All time - Keep it up! 💪
                </Text>
              </View>

              <View className="flex-row mb-4">
                <View
                  className={cn(
                    "flex-1 rounded-3xl p-5 mr-2",
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  )}
                  style={{
                    shadowColor: "#22c55e",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >
                  <Text
                    className={cn(
                      "text-xs mb-2 font-semibold",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    This Week
                  </Text>
                  <Text className="text-4xl font-bold text-green-500">
                    {getThisWeekWorkouts()}
                  </Text>
                </View>
                <View
                  className={cn(
                    "flex-1 rounded-3xl p-5 ml-2",
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  )}
                  style={{
                    shadowColor: "#f59e0b",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >
                  <Text
                    className={cn(
                      "text-xs mb-2 font-semibold",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    Personal Records
                  </Text>
                  <Text className="text-4xl font-bold text-yellow-500">
                    {getTotalPRs()}
                  </Text>
                </View>
              </View>

              {workouts.length > 0 && (
                <>
                  <Text
                    className={cn(
                      "text-lg font-bold mb-4",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    Recent Workouts
                  </Text>
                  {workouts.slice(0, 5).map((workout) => (
                    <View
                      key={workout.id}
                      className={cn(
                        "rounded-3xl p-5 mb-3",
                        isDark ? "bg-gray-800" : "bg-gray-100"
                      )}
                      style={{
                        shadowColor: "#3b82f6",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      <Text
                        className={cn(
                          "text-base font-bold mb-2",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        {workout.name}
                      </Text>
                      <Text
                        className={cn(
                          "text-sm",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}
                      >
                        {workout.exercises.length} exercises • {getTotalVolume(workout)} lbs total
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}
        </ScrollView>
      </View>

      {/* Create Workout Modal */}
      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-gray-50")}>
            <View className="px-4 pt-4 pb-2 border-b border-gray-200">
              <View className="flex-row justify-between items-center">
                <Text
                  className={cn(
                    "text-2xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  New Workout
                </Text>
                <View className="flex-row">
                  <Pressable
                    onPress={handleCancelWorkout}
                    className="mr-4 px-4 py-2"
                  >
                    <Text className="text-red-500 font-semibold">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSaveWorkout}
                    className="bg-blue-500 px-4 py-2 rounded-full"
                  >
                    <Text className="text-white font-semibold">Save</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <ScrollView
              className="flex-1 px-4"
              keyboardShouldPersistTaps="handled"
            >
              <View className="mt-4">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Workout Name
                </Text>
                <TextInput
                  value={workoutName}
                  onChangeText={setWorkoutName}
                  placeholder="e.g., Push Day, Leg Day"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  className={cn(
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  )}
                />
              </View>

              <View className="mt-6">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Add Exercise
                </Text>
                <View className="flex-row">
                  <TextInput
                    value={currentExerciseName}
                    onChangeText={setCurrentExerciseName}
                    placeholder="Exercise name"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    className={cn(
                      "flex-1 rounded-lg p-3 text-base mr-2",
                      isDark
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-900"
                    )}
                  />
                  <Pressable
                    onPress={handleAddExercise}
                    className="bg-blue-500 rounded-lg px-4 justify-center"
                  >
                    <Text className="text-white font-semibold">Add</Text>
                  </Pressable>
                </View>
              </View>

              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onAddSet={handleAddSet}
                  onRemoveSet={handleRemoveSet}
                  isDark={isDark}
                />
              ))}
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Workout Detail Modal */}
      <Modal
        visible={selectedWorkout !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-gray-50")}>
          <View className="px-4 pt-4 pb-2 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text
                className={cn(
                  "text-2xl font-bold",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {selectedWorkout?.name}
              </Text>
              <Pressable onPress={() => setSelectedWorkout(null)}>
                <Ionicons
                  name="close"
                  size={28}
                  color={isDark ? "#fff" : "#000"}
                />
              </Pressable>
            </View>
            <Text
              className={cn(
                "text-sm mt-1",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              {selectedWorkout && formatDate(selectedWorkout.date)}
            </Text>
          </View>

          <ScrollView className="flex-1 px-4 mt-4">
            {selectedWorkout?.exercises.map((exercise, index) => (
              <View
                key={exercise.id}
                className={cn(
                  "mb-4 rounded-xl p-4",
                  isDark ? "bg-gray-800" : "bg-white"
                )}
              >
                <Text
                  className={cn(
                    "text-lg font-bold mb-3",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  {index + 1}. {exercise.name}
                </Text>
                {exercise.sets.length === 0 ? (
                  <Text
                    className={cn(
                      "text-sm",
                      isDark ? "text-gray-500" : "text-gray-500"
                    )}
                  >
                    No sets recorded
                  </Text>
                ) : (
                  <View>
                    <View className="flex-row mb-2">
                      <Text
                        className={cn(
                          "flex-1 text-xs font-semibold",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}
                      >
                        SET
                      </Text>
                      <Text
                        className={cn(
                          "flex-1 text-xs font-semibold",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}
                      >
                        REPS
                      </Text>
                      <Text
                        className={cn(
                          "flex-1 text-xs font-semibold",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}
                      >
                        WEIGHT
                      </Text>
                    </View>
                    {exercise.sets.map((set, setIndex) => (
                      <View key={set.id} className="flex-row mb-2">
                        <Text
                          className={cn(
                            "flex-1 text-base",
                            isDark ? "text-white" : "text-gray-900"
                          )}
                        >
                          {setIndex + 1}
                        </Text>
                        <Text
                          className={cn(
                            "flex-1 text-base",
                            isDark ? "text-white" : "text-gray-900"
                          )}
                        >
                          {set.reps}
                        </Text>
                        <Text
                          className={cn(
                            "flex-1 text-base",
                            isDark ? "text-white" : "text-gray-900"
                          )}
                        >
                          {set.weight} lbs
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function ExerciseCard({
  exercise,
  onAddSet,
  onRemoveSet,
  isDark,
}: {
  exercise: Exercise;
  onAddSet: (exerciseId: string, reps: number, weight: number) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
  isDark: boolean;
}) {
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  const handleAddSet = () => {
    const repsNum = parseInt(reps);
    const weightNum = parseFloat(weight);
    if (!isNaN(repsNum) && !isNaN(weightNum)) {
      onAddSet(exercise.id, repsNum, weightNum);
      setReps("");
      setWeight("");
    }
  };

  return (
    <View
      className={cn(
        "mt-4 rounded-xl p-4",
        isDark ? "bg-gray-800" : "bg-white"
      )}
    >
      <Text
        className={cn(
          "text-lg font-bold mb-3",
          isDark ? "text-white" : "text-gray-900"
        )}
      >
        {exercise.name}
      </Text>

      {exercise.sets.length > 0 && (
        <View className="mb-3">
          <View className="flex-row mb-2">
            <Text
              className={cn(
                "flex-1 text-xs font-semibold",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              SET
            </Text>
            <Text
              className={cn(
                "flex-1 text-xs font-semibold",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              REPS
            </Text>
            <Text
              className={cn(
                "flex-1 text-xs font-semibold",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              WEIGHT
            </Text>
            <View className="w-8" />
          </View>
          {exercise.sets.map((set, index) => (
            <View key={set.id} className="flex-row mb-2 items-center">
              <Text
                className={cn(
                  "flex-1 text-base",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {index + 1}
              </Text>
              <Text
                className={cn(
                  "flex-1 text-base",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {set.reps}
              </Text>
              <Text
                className={cn(
                  "flex-1 text-base",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {set.weight} lbs
              </Text>
              <Pressable onPress={() => onRemoveSet(exercise.id, set.id)}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={isDark ? "#ef4444" : "#dc2626"}
                />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <View className="flex-row">
        <TextInput
          value={reps}
          onChangeText={setReps}
          placeholder="Reps"
          keyboardType="numeric"
          placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
          className={cn(
            "flex-1 rounded-lg p-3 text-base mr-2",
            isDark ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"
          )}
        />
        <TextInput
          value={weight}
          onChangeText={setWeight}
          placeholder="Weight (lbs)"
          keyboardType="numeric"
          placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
          className={cn(
            "flex-1 rounded-lg p-3 text-base mr-2",
            isDark ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"
          )}
        />
        <Pressable
          onPress={handleAddSet}
          className="bg-green-500 rounded-lg px-4 justify-center"
        >
          <Text className="text-white font-semibold">Add Set</Text>
        </Pressable>
      </View>
    </View>
  );
}
