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
import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout,
  FadeIn,
  SlideInLeft,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import { useWorkoutStore, Workout, Exercise, PersonalRecord } from "../state/workoutStore";
import { useSettingsStore } from "../state/settingsStore";
import { useCommunityStore } from "../state/communityStore";
import { cn } from "../utils/cn";
import { GYM_EXERCISES } from "../utils/exerciseList";
import { Switch } from "react-native";

export default function WorkoutScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const workouts = useWorkoutStore((s) => s.workouts);
  const addWorkout = useWorkoutStore((s) => s.addWorkout);
  const deleteWorkout = useWorkoutStore((s) => s.deleteWorkout);
  const personalRecords = useWorkoutStore((s) => s.personalRecords);
  const addPersonalRecord = useWorkoutStore((s) => s.addPersonalRecord);
  const deletePersonalRecord = useWorkoutStore((s) => s.deletePersonalRecord);
  const bodyWeight = useWorkoutStore((s) => s.bodyWeight);
  const bodyWeightUnit = useWorkoutStore((s) => s.bodyWeightUnit);
  const updateBodyWeight = useWorkoutStore((s) => s.updateBodyWeight);
  const featuredPRs = useWorkoutStore((s) => s.featuredPRs);
  const setFeaturedPRs = useWorkoutStore((s) => s.setFeaturedPRs);
  
  const shareWorkoutToAllCommunities = useCommunityStore((s) => s.shareWorkoutToAllCommunities);
  const currentUserId = useCommunityStore((s) => s.currentUserId);
  const currentUserName = useCommunityStore((s) => s.currentUserName);
  
  const isDark = theme === "dark";
  const [activeView, setActiveView] = useState<"active" | "programs" | "history" | "stats" | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseName, setCurrentExerciseName] = useState("");
  const [completedWorkout, setCompletedWorkout] = useState<Workout | null>(null);
  const [isWorkoutCompletionModalVisible, setIsWorkoutCompletionModalVisible] = useState(false);
  const [shareToFriends, setShareToFriends] = useState(true);
  
  // New state for stats modals
  const [isLogPRModalVisible, setIsLogPRModalVisible] = useState(false);
  const [isFeaturedPRModalVisible, setIsFeaturedPRModalVisible] = useState(false);
  const [isWeightModalVisible, setIsWeightModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [prWeight, setPrWeight] = useState("");
  const [prReps, setPrReps] = useState("1"); // Default to 1 rep
  const [prUnit, setPrUnit] = useState<"kg" | "lbs">("kg");
  const [tempBodyWeight, setTempBodyWeight] = useState(bodyWeight.toString());
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");

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
      setCompletedWorkout(newWorkout);
      setIsCreateModalVisible(false);
      setIsWorkoutCompletionModalVisible(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleFinishWorkoutCompletion = () => {
    if (completedWorkout && shareToFriends) {
      const totalVolume = completedWorkout.exercises.reduce(
        (total, exercise) =>
          total + exercise.sets.reduce((sum, set) => sum + set.reps * set.weight, 0),
        0
      );
      const totalSets = completedWorkout.exercises.reduce(
        (total, exercise) => total + exercise.sets.length,
        0
      );
      
      shareWorkoutToAllCommunities(
        {
          workoutName: completedWorkout.name,
          exercises: completedWorkout.exercises.length,
          sets: totalSets,
          totalVolume: Math.round(totalVolume),
          duration: completedWorkout.duration || 45,
        },
        currentUserId,
        currentUserName
      );
    }
    
    setWorkoutName("");
    setExercises([]);
    setCompletedWorkout(null);
    setIsWorkoutCompletionModalVisible(false);
    setActiveView(null);
    setShareToFriends(true);
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

  const getWorkoutVolume = (workout: Workout) => {
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
    return personalRecords.length;
  };

  const getTotalVolume = () => {
    return workouts.reduce((total, workout) => {
      return total + workout.exercises.reduce(
        (workoutTotal, exercise) =>
          workoutTotal +
          exercise.sets.reduce((sum, set) => sum + set.reps * set.weight, 0),
        0
      );
    }, 0);
  };

  const getTotalSets = () => {
    return workouts.reduce((total, workout) => {
      return total + workout.exercises.reduce(
        (workoutTotal, exercise) => workoutTotal + exercise.sets.length,
        0
      );
    }, 0);
  };

  const getTotalHours = () => {
    return workouts.reduce((total, workout) => {
      return total + (workout.duration || 60); // Default to 60 minutes if not logged
    }, 0) / 60; // Convert to hours
  };

  const getWorkoutStreak = () => {
    if (workouts.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    const sortedWorkouts = [...workouts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Check if most recent workout was today or yesterday
    const lastWorkout = new Date(sortedWorkouts[0].date);
    const daysDiff = Math.floor((today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) return 0; // Streak broken
    
    // Count consecutive days
    const workoutDates = new Set(sortedWorkouts.map(w => 
      new Date(w.date).toISOString().split('T')[0]
    ));
    
    for (let i = 0; i <= 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (workoutDates.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const handleLogPR = () => {
    if (selectedExercise && prWeight && prReps) {
      const newPR: PersonalRecord = {
        id: Date.now().toString(),
        exercise: selectedExercise,
        weight: parseFloat(prWeight),
        reps: parseInt(prReps),
        unit: prUnit,
        date: new Date().toISOString(),
      };
      addPersonalRecord(newPR);
      setSelectedExercise("");
      setPrWeight("");
      setPrReps("1");
      setIsLogPRModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleUpdateWeight = () => {
    const weight = parseFloat(tempBodyWeight);
    if (weight && weight > 0) {
      updateBodyWeight(weight, bodyWeightUnit);
      setIsWeightModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const filteredExercises = GYM_EXERCISES.filter(ex =>
    ex.toLowerCase().includes(exerciseSearchQuery.toLowerCase())
  );


  // Home view with 4 cards
  return (
    <>
      <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-white")}>
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          <View className="pt-4 mb-6">
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

          {/* Top Row - Active Workout & My Programs */}
          <View className="flex-row mb-4">
            {/* Active Workout Card */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setActiveView(activeView === "active" ? null : "active");
              }}
              className={cn(
                "flex-1 rounded-3xl p-5 mr-2",
                activeView === "active"
                  ? "border-2 border-orange-500"
                  : isDark
                  ? "bg-gray-800"
                  : "bg-gray-100"
              )}
              style={{
                shadowColor: activeView === "active" ? "#fb923c" : "#000",
                shadowOffset: { width: 0, height: activeView === "active" ? 6 : 4 },
                shadowOpacity: activeView === "active" ? 0.4 : 0.1,
                shadowRadius: activeView === "active" ? 16 : 8,
                elevation: activeView === "active" ? 8 : 5,
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
                Active Workout
              </Text>
              <Text
                className={cn(
                  "text-xs mb-4",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                Start training
              </Text>
              <View className="flex-row items-center">
                <Ionicons
                  name="play"
                  size={16}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
                <Text
                  className={cn(
                    "text-sm font-semibold ml-1",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  Start
                </Text>
              </View>
            </Pressable>

            {/* My Programs Card */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setActiveView(activeView === "programs" ? null : "programs");
              }}
              className={cn(
                "flex-1 rounded-3xl p-5 ml-2",
                activeView === "programs"
                  ? "border-2 border-blue-500"
                  : isDark
                  ? "bg-gray-800"
                  : "bg-gray-100"
              )}
              style={{
                shadowColor: activeView === "programs" ? "#3b82f6" : "#000",
                shadowOffset: { width: 0, height: activeView === "programs" ? 6 : 4 },
                shadowOpacity: activeView === "programs" ? 0.4 : 0.1,
                shadowRadius: activeView === "programs" ? 16 : 8,
                elevation: activeView === "programs" ? 8 : 5,
              }}
            >
              <View
                className="rounded-2xl p-4 mb-4"
                style={{ backgroundColor: "rgba(147, 197, 253, 0.3)" }}
              >
                <Ionicons name="fitness-outline" size={28} color="#60a5fa" />
              </View>
              <Text
                className={cn(
                  "text-xl font-bold mb-2",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                My Programs
              </Text>
              <Text
                className={cn(
                  "text-xs mb-4",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                Workout splits
              </Text>
              <View className="flex-row items-center">
                <Ionicons
                  name="albums-outline"
                  size={16}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
                <Text
                  className={cn(
                    "text-sm font-semibold ml-1",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  0 splits
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Bottom Row - History & Stats */}
          <View className="flex-row mb-6">
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

          {/* All Expandable Content Sections - Show below all 4 cards */}
          
          {/* Active Workout Options - Shows when clicked */}
          {activeView === "active" && (
            <Animated.View 
              entering={FadeInDown.duration(300).springify()}
              exiting={FadeOutUp.duration(200)}
              className="mb-4"
            >
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
            </Animated.View>
          )}

          {/* Programs List - Shows when clicked */}
          {activeView === "programs" && (
            <Animated.View 
              entering={FadeInDown.duration(300).springify()}
              exiting={FadeOutUp.duration(200)}
              className="mb-4"
            >
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
            </Animated.View>
          )}

          {/* History List - Shows when clicked */}
          {activeView === "history" && (
            <Animated.View 
              entering={FadeInDown.duration(300).springify()}
              exiting={FadeOutUp.duration(200)}
              className="mb-4"
            >
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
                          {getWorkoutVolume(item)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))
              )}
            </Animated.View>
          )}

          {/* Stats Dashboard - Shows when clicked */}
          {activeView === "stats" && (
            <Animated.View 
              entering={FadeInDown.duration(300).springify()}
              exiting={FadeOutUp.duration(200)}
              className="mb-20"
            >
              {/* Top Row - 3 Stat Cards */}
              <View className="flex-row mb-4">
                <View
                  className={cn(
                    "flex-1 rounded-3xl p-4 mr-2",
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  )}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Ionicons 
                    name="fitness" 
                    size={20} 
                    color={isDark ? "#9ca3af" : "#6b7280"} 
                  />
                  <Text className={cn(
                    "text-3xl font-bold mt-2",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {workouts.length}
                  </Text>
                  <Text
                    className={cn(
                      "text-xs mt-1",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    Total Workouts
                  </Text>
                </View>

                <View
                  className={cn(
                    "flex-1 rounded-3xl p-4 mx-1",
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  )}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Ionicons 
                    name="flame" 
                    size={20} 
                    color={isDark ? "#9ca3af" : "#6b7280"} 
                  />
                  <Text className={cn(
                    "text-3xl font-bold mt-2",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {getWorkoutStreak()}
                  </Text>
                  <Text
                    className={cn(
                      "text-xs mt-1",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    Day Streak
                  </Text>
                </View>

                <View
                  className={cn(
                    "flex-1 rounded-3xl p-4 ml-2",
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  )}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Ionicons 
                    name="trophy" 
                    size={20} 
                    color={isDark ? "#9ca3af" : "#6b7280"} 
                  />
                  <Text className={cn(
                    "text-3xl font-bold mt-2",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {getTotalPRs()}
                  </Text>
                  <Text
                    className={cn(
                      "text-xs mt-1",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    Personal Records
                  </Text>
                </View>
              </View>

              {/* Bottom Row - 3 Stat Cards */}
              <View className="flex-row mb-4">
                <View
                  className={cn(
                    "flex-1 rounded-3xl p-4 mr-2",
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  )}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Ionicons 
                    name="barbell" 
                    size={20} 
                    color={isDark ? "#9ca3af" : "#6b7280"} 
                  />
                  <Text className={cn(
                    "text-3xl font-bold mt-2",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {Math.round(getTotalVolume())}
                  </Text>
                  <Text
                    className={cn(
                      "text-xs mt-1",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    Total Volume (kg)
                  </Text>
                </View>

                <View
                  className={cn(
                    "flex-1 rounded-3xl p-4 mx-1",
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  )}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Ionicons 
                    name="repeat" 
                    size={20} 
                    color={isDark ? "#9ca3af" : "#6b7280"} 
                  />
                  <Text className={cn(
                    "text-3xl font-bold mt-2",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {getTotalSets()}
                  </Text>
                  <Text
                    className={cn(
                      "text-xs mt-1",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    Total Sets
                  </Text>
                </View>

                <View
                  className={cn(
                    "flex-1 rounded-3xl p-4 ml-2",
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  )}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Ionicons 
                    name="time" 
                    size={20} 
                    color={isDark ? "#9ca3af" : "#6b7280"} 
                  />
                  <Text className={cn(
                    "text-3xl font-bold mt-2",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {Math.round(getTotalHours())}
                  </Text>
                  <Text
                    className={cn(
                      "text-xs mt-1",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    Training Hours
                  </Text>
                </View>
              </View>

              {/* Strength Progress Graph */}
              <View
                className={cn(
                  "rounded-3xl p-6 mb-4",
                  isDark ? "bg-gray-800" : "bg-gray-100"
                )}
              >
                <Text
                  className={cn(
                    "text-xl font-bold mb-4",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Strength Progress
                </Text>
                <View className="items-center py-12">
                  <Ionicons
                    name="trending-up"
                    size={48}
                    color={isDark ? "#6b7280" : "#9ca3af"}
                  />
                  <Text
                    className={cn(
                      "text-sm mt-4 text-center",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    Graph coming soon - Track your strength gains over time
                  </Text>
                </View>
              </View>

              {/* Weight Tracking Section */}
              <View
                className={cn(
                  "rounded-3xl p-6 mb-4",
                  isDark ? "bg-gray-800" : "bg-gray-100"
                )}
              >
                <View className="flex-row justify-between items-center mb-4">
                  <Text
                    className={cn(
                      "text-xl font-bold",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    Weight Tracking
                  </Text>
                  <Pressable
                    onPress={() => {
                      const newUnit = bodyWeightUnit === "kg" ? "lbs" : "kg";
                      const converted = newUnit === "lbs" 
                        ? bodyWeight * 2.20462 
                        : bodyWeight / 2.20462;
                      updateBodyWeight(Math.round(converted * 10) / 10, newUnit);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full",
                      isDark ? "bg-gray-700" : "bg-white"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-sm font-semibold",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {bodyWeightUnit.toUpperCase()}
                    </Text>
                  </Pressable>
                </View>

                <View className="items-center py-4">
                  <Text className="text-6xl font-bold text-blue-500 mb-2">
                    {bodyWeight}
                  </Text>
                  <Text
                    className={cn(
                      "text-base mb-4",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    Current Body Weight
                  </Text>
                  <Pressable
                    onPress={() => {
                      setTempBodyWeight(bodyWeight.toString());
                      setIsWeightModalVisible(true);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                    className="bg-blue-500 px-6 py-3 rounded-full"
                  >
                    <Text className="text-white font-bold">Update Weight</Text>
                  </Pressable>
                </View>
              </View>

              {/* Personal Records Section */}
              <View
                className={cn(
                  "rounded-3xl p-6 mb-4",
                  isDark ? "bg-gray-800" : "bg-gray-100"
                )}
              >
                <View className="flex-row justify-between items-center mb-4">
                  <Text
                    className={cn(
                      "text-xl font-bold",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    Personal Records
                  </Text>
                  <Pressable
                    onPress={() => {
                      setIsLogPRModalVisible(true);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                    className="bg-yellow-500 px-4 py-2 rounded-full"
                  >
                    <Text className="text-white font-bold">Log PR</Text>
                  </Pressable>
                </View>

                {personalRecords.length === 0 ? (
                  <View className="items-center py-8">
                    <Ionicons
                      name="trophy-outline"
                      size={48}
                      color={isDark ? "#6b7280" : "#9ca3af"}
                    />
                    <Text
                      className={cn(
                        "text-sm mt-4 text-center",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      No personal records yet. Log your first PR!
                    </Text>
                  </View>
                ) : (
                  personalRecords.slice(0, 10).map((pr) => (
                    <View
                      key={pr.id}
                      className={cn(
                        "rounded-2xl p-4 mb-3",
                        isDark ? "bg-gray-700" : "bg-white"
                      )}
                    >
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                          <Text
                            className={cn(
                              "text-base font-bold mb-1",
                              isDark ? "text-white" : "text-gray-900"
                            )}
                          >
                            {pr.exercise}
                          </Text>
                          <Text
                            className={cn(
                              "text-sm",
                              isDark ? "text-gray-400" : "text-gray-600"
                            )}
                          >
                            {pr.weight} {pr.unit} × {pr.reps} {pr.reps === 1 ? "rep" : "reps"}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => {
                            deletePersonalRecord(pr.id);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                          className="p-2"
                        >
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color={isDark ? "#ef4444" : "#dc2626"}
                          />
                        </Pressable>
                      </View>
                    </View>
                  ))
                )}
              </View>

              {/* Featured PRs Section */}
              <View
                className={cn(
                  "rounded-3xl p-6 mb-4",
                  isDark ? "bg-gray-800" : "bg-gray-100"
                )}
              >
                <View className="flex-row justify-between items-center mb-4">
                  <Text
                    className={cn(
                      "text-xl font-bold",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    Featured PRs
                  </Text>
                  <Pressable
                    onPress={() => {
                      setIsFeaturedPRModalVisible(true);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full",
                      isDark ? "bg-gray-700" : "bg-white"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-sm font-semibold",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      Select
                    </Text>
                  </Pressable>
                </View>
                <Text
                  className={cn(
                    "text-xs mb-4",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  Choose up to 5 PRs to feature on your public profile
                </Text>

                {featuredPRs.length === 0 ? (
                  <View className="items-center py-8">
                    <Ionicons
                      name="star-outline"
                      size={48}
                      color={isDark ? "#6b7280" : "#9ca3af"}
                    />
                    <Text
                      className={cn(
                        "text-sm mt-4 text-center",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      No featured PRs selected
                    </Text>
                  </View>
                ) : (
                  featuredPRs.map((prId) => {
                    const pr = personalRecords.find((p) => p.id === prId);
                    if (!pr) return null;
                    return (
                      <View
                        key={pr.id}
                        className={cn(
                          "rounded-2xl p-4 mb-3",
                          isDark ? "bg-gray-700" : "bg-white"
                        )}
                      >
                        <View className="flex-row items-center">
                          <Ionicons name="star" size={20} color="#f59e0b" />
                          <Text
                            className={cn(
                              "text-base font-bold ml-2 flex-1",
                              isDark ? "text-white" : "text-gray-900"
                            )}
                          >
                            {pr.exercise}
                          </Text>
                          <Text
                          className={cn(
                            "text-lg font-bold",
                            isDark ? "text-white" : "text-gray-900"
                          )}
                        >
                          {pr.weight} {pr.unit} × {pr.reps}
                        </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>

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

      {/* Log PR Modal */}
      <Modal
        visible={isLogPRModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-white")}>
            <View className="px-4 pt-4 pb-2 border-b border-gray-200">
              <View className="flex-row justify-between items-center">
                <Text
                  className={cn(
                    "text-2xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Log Personal Record
                </Text>
                <Pressable
                  onPress={() => {
                    setIsLogPRModalVisible(false);
                    setSelectedExercise("");
                    setPrWeight("");
                    setExerciseSearchQuery("");
                  }}
                >
                  <Ionicons name="close" size={28} color={isDark ? "#fff" : "#000"} />
                </Pressable>
              </View>
            </View>

            <ScrollView className="flex-1 px-4 pt-4">
              {/* Exercise Search */}
              <Text
                className={cn(
                  "text-sm font-semibold mb-2",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}
              >
                Select Exercise
              </Text>
              <TextInput
                value={exerciseSearchQuery}
                onChangeText={setExerciseSearchQuery}
                placeholder="Search exercises..."
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                className={cn(
                  "rounded-lg p-3 text-base mb-4",
                  isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
                )}
              />

              {/* Exercise List */}
              <ScrollView className="max-h-64 mb-4">
                {filteredExercises.map((exercise) => (
                  <Pressable
                    key={exercise}
                    onPress={() => {
                      setSelectedExercise(exercise);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className={cn(
                      "rounded-xl p-3 mb-2",
                      selectedExercise === exercise
                        ? "bg-blue-500"
                        : isDark
                        ? "bg-gray-800"
                        : "bg-gray-100"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-base",
                        selectedExercise === exercise
                          ? "text-white font-bold"
                          : isDark
                          ? "text-white"
                          : "text-gray-900"
                      )}
                    >
                      {exercise}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Weight Input */}
              <Text
                className={cn(
                  "text-sm font-semibold mb-2",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}
              >
                PR Weight
              </Text>
              <View className="flex-row mb-4">
                <TextInput
                  value={prWeight}
                  onChangeText={setPrWeight}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  className={cn(
                    "flex-1 rounded-lg p-3 text-base mr-2",
                    isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
                  )}
                />
                <Pressable
                  onPress={() => {
                    setPrUnit(prUnit === "kg" ? "lbs" : "kg");
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={cn(
                    "px-6 rounded-lg items-center justify-center",
                    isDark ? "bg-gray-800" : "bg-gray-100"
                  )}
                >
                  <Text
                    className={cn(
                      "text-base font-bold",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    {prUnit.toUpperCase()}
                  </Text>
                </Pressable>
              </View>

              {/* Reps Input */}
              <Text
                className={cn(
                  "text-sm font-semibold mb-2",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}
              >
                Reps
              </Text>
              <TextInput
                value={prReps}
                onChangeText={setPrReps}
                placeholder="1"
                keyboardType="numeric"
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                className={cn(
                  "rounded-lg p-3 text-base mb-6",
                  isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
                )}
              />

              <Pressable
                onPress={handleLogPR}
                disabled={!selectedExercise || !prWeight || !prReps}
                className={cn(
                  "py-4 rounded-full items-center",
                  !selectedExercise || !prWeight || !prReps
                    ? "bg-gray-400"
                    : "bg-yellow-500"
                )}
              >
                <Text className="text-white font-bold text-base">Log PR</Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Update Weight Modal */}
      <Modal
        visible={isWeightModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-white")}>
          <View className="px-4 pt-4 pb-2 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text
                className={cn(
                  "text-2xl font-bold",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Update Weight
              </Text>
              <Pressable
                onPress={() => setIsWeightModalVisible(false)}
              >
                <Ionicons name="close" size={28} color={isDark ? "#fff" : "#000"} />
              </Pressable>
            </View>
          </View>

          <View className="flex-1 justify-center items-center px-4">
            <WeightSlider
              value={parseFloat(tempBodyWeight) || bodyWeight}
              onValueChange={(val) => setTempBodyWeight(val.toString())}
              min={bodyWeightUnit === "kg" ? 30 : 66}
              max={bodyWeightUnit === "kg" ? 200 : 440}
              unit={bodyWeightUnit}
              isDark={isDark}
            />

            <Pressable
              onPress={handleUpdateWeight}
              className="bg-blue-500 px-12 py-4 rounded-full mt-8"
            >
              <Text className="text-white font-bold text-lg">Save Weight</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Featured PRs Selection Modal */}
      <Modal
        visible={isFeaturedPRModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-white")}>
          <View className="px-4 pt-4 pb-2 border-b border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text
                className={cn(
                  "text-2xl font-bold",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Featured PRs
              </Text>
              <Pressable
                onPress={() => setIsFeaturedPRModalVisible(false)}
              >
                <Ionicons name="close" size={28} color={isDark ? "#fff" : "#000"} />
              </Pressable>
            </View>
          </View>

          <ScrollView className="flex-1 px-4 pt-4">
            <Text
              className={cn(
                "text-sm mb-4",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              Select up to 5 PRs to feature on your profile ({featuredPRs.length}/5)
            </Text>

            {personalRecords.map((pr) => {
              const isFeatured = featuredPRs.includes(pr.id);
              return (
                <Pressable
                  key={pr.id}
                  onPress={() => {
                    if (isFeatured) {
                      setFeaturedPRs(featuredPRs.filter((id) => id !== pr.id));
                    } else if (featuredPRs.length < 5) {
                      setFeaturedPRs([...featuredPRs, pr.id]);
                    }
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={cn(
                    "rounded-2xl p-4 mb-3 flex-row items-center",
                    isFeatured
                      ? "bg-yellow-500"
                      : isDark
                      ? "bg-gray-800"
                      : "bg-gray-100"
                  )}
                >
                  <Ionicons
                    name={isFeatured ? "star" : "star-outline"}
                    size={24}
                    color={isFeatured ? "#fff" : isDark ? "#9ca3af" : "#6b7280"}
                  />
                      <View className="flex-1 ml-3">
                        <Text
                          className={cn(
                            "text-base font-bold",
                            isFeatured
                              ? "text-white"
                              : isDark
                              ? "text-white"
                              : "text-gray-900"
                          )}
                        >
                          {pr.exercise}
                        </Text>
                        <Text
                          className={cn(
                            "text-sm",
                            isFeatured
                              ? "text-white opacity-90"
                              : isDark
                              ? "text-gray-400"
                              : "text-gray-600"
                          )}
                        >
                          {pr.weight} {pr.unit} × {pr.reps}
                        </Text>
                      </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Workout Completion Modal */}
      <Modal
        visible={isWorkoutCompletionModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setIsWorkoutCompletionModalVisible(false);
          handleFinishWorkoutCompletion();
        }}
      >
        <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-white")}>
          <View className="flex-1 items-center justify-center px-6">
            {/* Success Icon */}
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-6"
              style={{
                backgroundColor: isDark ? "rgba(34, 197, 94, 0.2)" : "rgba(34, 197, 94, 0.1)",
              }}
            >
              <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
            </View>

            <Text
              className={cn(
                "text-3xl font-bold mb-2",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Workout Complete! 🎉
            </Text>

            <Text
              className={cn(
                "text-base text-center mb-8",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              Great job on completing {completedWorkout?.name}!
            </Text>

            {/* Workout Summary */}
            <View
              className={cn(
                "w-full rounded-3xl p-6 mb-6",
                isDark ? "bg-gray-800" : "bg-gray-100"
              )}
            >
              <Text
                className={cn(
                  "text-lg font-bold mb-4",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Workout Summary
              </Text>

              <View className="space-y-3">
                <View className="flex-row justify-between items-center py-2">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="barbell"
                      size={20}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                    <Text
                      className={cn(
                        "text-base ml-2",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      Exercises
                    </Text>
                  </View>
                  <Text
                    className={cn(
                      "text-lg font-bold",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    {completedWorkout?.exercises.length}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center py-2">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="repeat"
                      size={20}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                    <Text
                      className={cn(
                        "text-base ml-2",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      Total Sets
                    </Text>
                  </View>
                  <Text
                    className={cn(
                      "text-lg font-bold",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    {completedWorkout?.exercises.reduce(
                      (total, ex) => total + ex.sets.length,
                      0
                    )}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center py-2">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="trending-up"
                      size={20}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                    <Text
                      className={cn(
                        "text-base ml-2",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      Total Volume
                    </Text>
                  </View>
                  <Text
                    className={cn(
                      "text-lg font-bold",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    {Math.round(
                      completedWorkout?.exercises.reduce(
                        (total, exercise) =>
                          total +
                          exercise.sets.reduce(
                            (sum, set) => sum + set.reps * set.weight,
                            0
                          ),
                        0
                      ) || 0
                    )}
                    kg
                  </Text>
                </View>
              </View>
            </View>

            {/* Share Toggle */}
            <View
              className={cn(
                "w-full rounded-2xl p-4 mb-6 flex-row items-center justify-between",
                isDark ? "bg-gray-800" : "bg-gray-100"
              )}
            >
              <View className="flex-1 mr-4">
                <Text
                  className={cn(
                    "text-base font-bold mb-1",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Share to Community
                </Text>
                <Text
                  className={cn(
                    "text-sm",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  Let your friends see your progress
                </Text>
              </View>
              <Switch
                value={shareToFriends}
                onValueChange={(val) => {
                  setShareToFriends(val);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                trackColor={{ false: isDark ? "#374151" : "#d1d5db", true: "#3b82f6" }}
                thumbColor={shareToFriends ? "#ffffff" : "#f3f4f6"}
              />
            </View>

            {/* Done Button */}
            <Pressable
              onPress={handleFinishWorkoutCompletion}
              className="w-full bg-green-500 py-4 rounded-2xl items-center"
            >
              <Text className="text-white font-bold text-lg">Done</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </>
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

// Weight Slider Component
function WeightSlider({
  value,
  onValueChange,
  min = 30,
  max = 300,
  unit,
  isDark,
}: {
  value: number;
  onValueChange: (val: number) => void;
  min?: number;
  max?: number;
  unit: "kg" | "lbs";
  isDark: boolean;
}) {
  const [sliderValue, setSliderValue] = React.useState(value);
  const lastHapticValue = React.useRef(Math.floor(value));

  const handleValueChange = (newValue: number) => {
    const roundedValue = Math.round(newValue * 10) / 10; // Round to nearest 0.1
    setSliderValue(roundedValue);
    
    // Haptic feedback every whole number
    const currentWhole = Math.floor(roundedValue);
    if (currentWhole !== lastHapticValue.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lastHapticValue.current = currentWhole;
    }
  };

  const handleSlidingComplete = (newValue: number) => {
    const roundedValue = Math.round(newValue * 10) / 10;
    setSliderValue(roundedValue);
    onValueChange(roundedValue);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View className="items-center justify-center w-full px-6">
      {/* Current Value Display */}
      <View className="mb-12">
        <Text className="text-8xl font-bold text-blue-500 text-center">
          {sliderValue.toFixed(1)}
        </Text>
        <Text
          className={cn(
            "text-3xl font-bold text-center mt-3",
            isDark ? "text-gray-400" : "text-gray-600"
          )}
        >
          {unit.toUpperCase()}
        </Text>
      </View>

      {/* Range Labels */}
      <View className="flex-row justify-between w-full mb-2 px-2">
        <Text className={cn("text-sm font-semibold", isDark ? "text-gray-500" : "text-gray-600")}>
          {min} {unit}
        </Text>
        <Text className={cn("text-sm font-semibold", isDark ? "text-gray-500" : "text-gray-600")}>
          {max} {unit}
        </Text>
      </View>

      {/* Horizontal Slider */}
      <Slider
        style={{ width: "100%", height: 60 }}
        minimumValue={min}
        maximumValue={max}
        value={sliderValue}
        onValueChange={handleValueChange}
        onSlidingComplete={handleSlidingComplete}
        minimumTrackTintColor="#3b82f6"
        maximumTrackTintColor={isDark ? "#374151" : "#d1d5db"}
        thumbTintColor="#3b82f6"
        step={0.1}
      />

      {/* Quick adjustment buttons */}
      <View className="flex-row items-center justify-center gap-3 mt-6 mb-4">
        <Pressable
          onPress={() => {
            const newValue = Math.max(min, Math.round((sliderValue - 5) * 10) / 10);
            setSliderValue(newValue);
            onValueChange(newValue);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          className={cn(
            "px-6 py-3 rounded-full",
            isDark ? "bg-gray-800" : "bg-gray-200"
          )}
        >
          <Text className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>
            -5
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            const newValue = Math.max(min, Math.round((sliderValue - 1) * 10) / 10);
            setSliderValue(newValue);
            onValueChange(newValue);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          className={cn(
            "px-6 py-3 rounded-full",
            isDark ? "bg-gray-800" : "bg-gray-200"
          )}
        >
          <Text className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>
            -1
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            const newValue = Math.min(max, Math.round((sliderValue + 1) * 10) / 10);
            setSliderValue(newValue);
            onValueChange(newValue);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          className={cn(
            "px-6 py-3 rounded-full",
            isDark ? "bg-gray-800" : "bg-gray-200"
          )}
        >
          <Text className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>
            +1
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            const newValue = Math.min(max, Math.round((sliderValue + 5) * 10) / 10);
            setSliderValue(newValue);
            onValueChange(newValue);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          className={cn(
            "px-6 py-3 rounded-full",
            isDark ? "bg-gray-800" : "bg-gray-200"
          )}
        >
          <Text className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>
            +5
          </Text>
        </Pressable>
      </View>

      <Text
        className={cn(
          "text-sm text-center",
          isDark ? "text-gray-500" : "text-gray-600"
        )}
      >
        Slide or tap buttons to adjust weight (0.1 {unit} precision)
      </Text>
    </View>
  );
}
