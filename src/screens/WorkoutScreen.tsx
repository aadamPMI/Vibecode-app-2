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
import { useWorkoutStore, Workout, Exercise } from "../state/workoutStore";
import { useSettingsStore } from "../state/settingsStore";
import { cn } from "../utils/cn";

export default function WorkoutScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const workouts = useWorkoutStore((s) => s.workouts);
  const addWorkout = useWorkoutStore((s) => s.addWorkout);
  const deleteWorkout = useWorkoutStore((s) => s.deleteWorkout);
  
  const isDark = theme === "dark";
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
      setWorkoutName("");
      setExercises([]);
      setIsCreateModalVisible(false);
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

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-gray-50")}>
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text
            className={cn(
              "text-3xl font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            Workouts
          </Text>
          <Pressable
            onPress={() => setIsCreateModalVisible(true)}
            className="bg-blue-500 px-4 py-2 rounded-full flex-row items-center"
          >
            <Ionicons name="add" size={24} color="white" />
            <Text className="text-white font-semibold ml-1">New Workout</Text>
          </Pressable>
        </View>

        {workouts.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Ionicons
              name="barbell-outline"
              size={64}
              color={isDark ? "#6b7280" : "#9ca3af"}
            />
            <Text
              className={cn(
                "text-lg mt-4",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              No workouts yet
            </Text>
            <Text
              className={cn(
                "text-sm mt-2",
                isDark ? "text-gray-500" : "text-gray-500"
              )}
            >
              Tap New Workout to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={workouts}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setSelectedWorkout(item)}
                className={cn(
                  "mb-4 rounded-xl p-4",
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
                <View className="flex-row justify-between items-start mb-2">
                  <Text
                    className={cn(
                      "text-xl font-bold flex-1",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    {item.name}
                  </Text>
                  <Pressable
                    onPress={() => deleteWorkout(item.id)}
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
                        "text-lg font-semibold",
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
                        "text-lg font-semibold",
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
                        "text-lg font-semibold",
                        isDark ? "text-purple-400" : "text-purple-600"
                      )}
                    >
                      {getTotalVolume(item)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            )}
          />
        )}
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
