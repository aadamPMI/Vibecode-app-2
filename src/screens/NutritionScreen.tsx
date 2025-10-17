import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useNutritionStore, FoodItem } from "../state/nutritionStore";
import { useSettingsStore } from "../state/settingsStore";
import { cn } from "../utils/cn";

export default function NutritionScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const fitnessGoals = useSettingsStore((s) => s.fitnessGoals);
  const foodLog = useNutritionStore((s) => s.foodLog);
  const addFoodItem = useNutritionStore((s) => s.addFoodItem);
  const deleteFoodItem = useNutritionStore((s) => s.deleteFoodItem);
  
  const isDark = theme === "dark";
  const [isAddFoodModalVisible, setIsAddFoodModalVisible] = useState(false);
  const [viewMealsModalVisible, setViewMealsModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");
  
  // Get current week dates
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    return new Date(today.setDate(diff));
  });

  // Form state
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >("breakfast");

  const handleAddFood = () => {
    if (
      foodName.trim() &&
      calories &&
      protein &&
      carbs &&
      fats
    ) {
      const today = new Date().toISOString().split("T")[0];
      const newFood: FoodItem = {
        id: Date.now().toString(),
        name: foodName,
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fats: parseFloat(fats),
        date: today,
        meal: selectedMeal,
      };
      addFoodItem(newFood);
      setFoodName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFats("");
      setIsAddFoodModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(selectedWeekStart);
      date.setDate(selectedWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getTodayTotals = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayFood = foodLog.filter((f) => f.date === today);
    return todayFood.reduce(
      (totals, food) => ({
        calories: totals.calories + food.calories,
        protein: totals.protein + food.protein,
        carbs: totals.carbs + food.carbs,
        fats: totals.fats + food.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const getWeekTotals = () => {
    const weekDates = getWeekDates().map((d) => d.toISOString().split("T")[0]);
    const weekFood = foodLog.filter((f) => weekDates.includes(f.date));
    return weekFood.reduce(
      (totals, food) => ({
        calories: totals.calories + food.calories,
        protein: totals.protein + food.protein,
        carbs: totals.carbs + food.carbs,
        fats: totals.fats + food.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const getCurrentStreak = () => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayFood = foodLog.filter((f) => f.date === dateStr);
      
      if (dayFood.length > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const getLongestStreak = () => {
    let maxStreak = 0;
    let currentStreak = 0;
    const sortedDates = [...new Set(foodLog.map((f) => f.date))].sort();
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.floor(
          (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
    }
    
    return Math.max(maxStreak, currentStreak);
  };

  const getTodayMeals = () => {
    const today = new Date().toISOString().split("T")[0];
    return foodLog.filter((f) => f.date === today);
  };

  const totals = viewMode === "daily" ? getTodayTotals() : getWeekTotals();
  const targetCalories = fitnessGoals.targetCalories || 2000;
  const targetProtein = fitnessGoals.targetProtein || 150;
  const targetCarbs = fitnessGoals.targetCarbs || 200;
  const targetFats = fitnessGoals.targetFats || 67;

  const navigateWeek = (direction: "prev" | "next") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newDate = new Date(selectedWeekStart);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setSelectedWeekStart(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-white")}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-4 pb-2 flex-row justify-between items-center">
          <Text
            className={cn(
              "text-2xl font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {"Today's Calories"}
          </Text>
          <Text
            className={cn(
              "text-base",
              isDark ? "text-gray-400" : "text-gray-600"
            )}
          >
            {formatDate(new Date())}
          </Text>
        </View>

        {/* View Mode Selector */}
        <View className="px-4 mt-4">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setViewMode(viewMode === "daily" ? "weekly" : "daily");
            }}
            className={cn(
              "rounded-2xl px-4 py-3 border flex-row justify-between items-center",
              isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
            )}
          >
            <Text
              className={cn(
                "text-base font-semibold capitalize",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {viewMode}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />
          </Pressable>
        </View>

        {/* Week Calendar */}
        {viewMode === "weekly" && (
          <View className="px-4 mt-4">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-2"
            >
              {getWeekDates().map((date, index) => {
                const isToday =
                  date.toISOString().split("T")[0] ===
                  new Date().toISOString().split("T")[0];
                return (
                  <Pressable
                    key={index}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    className="items-center mr-4"
                  >
                    <Text
                      className={cn(
                        "text-xs mb-1",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                    </Text>
                    <View
                      className={cn(
                        "w-12 h-12 rounded-full items-center justify-center",
                        isToday
                          ? "bg-blue-500"
                          : isDark
                          ? "bg-gray-800"
                          : "bg-gray-100"
                      )}
                    >
                      <Text
                        className={cn(
                          "text-xl font-bold",
                          isToday
                            ? "text-white"
                            : isDark
                            ? "text-white"
                            : "text-gray-900"
                        )}
                      >
                        {date.getDate()}
                      </Text>
                    </View>
                    <Text
                      className={cn(
                        "text-xs mt-1",
                        isDark ? "text-gray-500" : "text-gray-500"
                      )}
                    >
                      {date.toLocaleDateString("en-US", { month: "short" })}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View className="flex-row justify-center items-center mt-2 mb-4">
              <Pressable onPress={() => navigateWeek("prev")} className="mr-4">
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
              </Pressable>
              <Text
                className={cn(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                Scroll to navigate weeks
              </Text>
              <Pressable onPress={() => navigateWeek("next")} className="ml-4">
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDark ? "#9ca3af" : "#6b7280"}
                />
              </Pressable>
            </View>
          </View>
        )}

        {/* Calorie Display */}
        <View className="px-4 mt-6 items-center">
          <Text className="text-6xl font-bold text-blue-500">
            {Math.round(totals.calories)}
          </Text>
          <Text
            className={cn(
              "text-base mt-2",
              isDark ? "text-gray-400" : "text-gray-600"
            )}
          >
            of {targetCalories} calories
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="px-4 mt-4">
          <View
            className={cn(
              "h-3 rounded-full overflow-hidden",
              isDark ? "bg-gray-800" : "bg-gray-200"
            )}
          >
            <Animated.View
              className="h-full bg-blue-500 rounded-full"
              style={{
                width: `${Math.min((totals.calories / targetCalories) * 100, 100)}%`,
              }}
            />
          </View>
        </View>

        {/* Macros Card */}
        <View className="px-4 mt-6">
          <View
            className={cn(
              "rounded-3xl p-5",
              isDark ? "bg-gray-800" : "bg-gray-50"
            )}
          >
            <MacroRow
              label="Protein"
              value={Math.round(totals.protein)}
              target={targetProtein}
              color="#3b82f6"
              isDark={isDark}
            />
            <MacroRow
              label="Carbs"
              value={Math.round(totals.carbs)}
              target={targetCarbs}
              color="#22c55e"
              isDark={isDark}
            />
            <MacroRow
              label="Fat"
              value={Math.round(totals.fats)}
              target={targetFats}
              color="#f97316"
              isDark={isDark}
            />
          </View>
        </View>

        {/* Streak Card */}
        <View className="px-4 mt-4">
          <View
            className="rounded-3xl p-5"
            style={{ backgroundColor: isDark ? "#1f2937" : "#fef3c7" }}
          >
            <View className="flex-row justify-around">
              <View className="items-center">
                <Ionicons name="flame" size={32} color="#f97316" />
                <Text
                  className={cn(
                    "text-3xl font-bold mt-2",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  {getCurrentStreak()}
                </Text>
                <Text
                  className={cn(
                    "text-sm mt-1",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  Current
                </Text>
              </View>
              <View
                className="w-px"
                style={{ backgroundColor: isDark ? "#374151" : "#d1d5db" }}
              />
              <View className="items-center">
                <Ionicons name="trophy" size={32} color="#f59e0b" />
                <Text
                  className={cn(
                    "text-3xl font-bold mt-2",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  {getLongestStreak()}
                </Text>
                <Text
                  className={cn(
                    "text-sm mt-1",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  Longest
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* View Meals Button */}
        <View className="px-4 mt-4 mb-20">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setViewMealsModalVisible(true);
            }}
            className={cn(
              "rounded-3xl py-4 flex-row justify-center items-center border",
              isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
            )}
          >
            <Ionicons
              name="eye-outline"
              size={24}
              color={isDark ? "#fff" : "#000"}
            />
            <Text
              className={cn(
                "text-base font-semibold ml-2",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              View {getTodayMeals().length} Meals
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setIsAddFoodModalVisible(true);
        }}
        className="absolute bottom-24 right-6 w-16 h-16 bg-blue-500 rounded-full items-center justify-center"
        style={{
          shadowColor: "#3b82f6",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={32} color="white" />
      </Pressable>

      {/* Add Food Modal */}
      <Modal
        visible={isAddFoodModalVisible}
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
                  Add Food
                </Text>
                <View className="flex-row">
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsAddFoodModalVisible(false);
                    }}
                    className="mr-4 px-4 py-2"
                  >
                    <Text className="text-red-500 font-semibold">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleAddFood}
                    className="bg-blue-500 px-4 py-2 rounded-full"
                  >
                    <Text className="text-white font-semibold">Add</Text>
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
                  Food Name
                </Text>
                <TextInput
                  value={foodName}
                  onChangeText={setFoodName}
                  placeholder="e.g., Chicken Breast, Oatmeal"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  className={cn(
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  )}
                />
              </View>

              <View className="mt-4">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Meal
                </Text>
                <View className="flex-row flex-wrap">
                  {(["breakfast", "lunch", "dinner", "snack"] as const).map((meal) => (
                    <Pressable
                      key={meal}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedMeal(meal);
                      }}
                      className={cn(
                        "px-4 py-2 rounded-full mr-2 mb-2",
                        selectedMeal === meal
                          ? "bg-blue-500"
                          : isDark
                          ? "bg-gray-800"
                          : "bg-white"
                      )}
                    >
                      <Text
                        className={cn(
                          "font-semibold capitalize",
                          selectedMeal === meal
                            ? "text-white"
                            : isDark
                            ? "text-gray-400"
                            : "text-gray-600"
                        )}
                      >
                        {meal}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="mt-4">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Calories
                </Text>
                <TextInput
                  value={calories}
                  onChangeText={setCalories}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  className={cn(
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  )}
                />
              </View>

              <View className="mt-4">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Protein (g)
                </Text>
                <TextInput
                  value={protein}
                  onChangeText={setProtein}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  className={cn(
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  )}
                />
              </View>

              <View className="mt-4">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Carbs (g)
                </Text>
                <TextInput
                  value={carbs}
                  onChangeText={setCarbs}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  className={cn(
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  )}
                />
              </View>

              <View className="mt-4 mb-8">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Fats (g)
                </Text>
                <TextInput
                  value={fats}
                  onChangeText={setFats}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  className={cn(
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  )}
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* View Meals Modal */}
      <Modal
        visible={viewMealsModalVisible}
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
                {"Today's Meals"}
              </Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setViewMealsModalVisible(false);
                }}
              >
                <Ionicons
                  name="close"
                  size={28}
                  color={isDark ? "#fff" : "#000"}
                />
              </Pressable>
            </View>
          </View>

          <ScrollView className="flex-1 px-4 pt-4">
            {getTodayMeals().length === 0 ? (
              <View className="flex-1 justify-center items-center py-20">
                <Ionicons
                  name="restaurant-outline"
                  size={64}
                  color={isDark ? "#6b7280" : "#9ca3af"}
                />
                <Text
                  className={cn(
                    "text-lg mt-4",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  No meals logged today
                </Text>
              </View>
            ) : (
              <>
                {["breakfast", "lunch", "dinner", "snack"].map((meal) => {
                  const mealItems = getTodayMeals().filter((f) => f.meal === meal);
                  if (mealItems.length === 0) return null;
                  
                  return (
                    <View key={meal} className="mb-6">
                      <Text
                        className={cn(
                          "text-lg font-bold mb-3 capitalize",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        {meal}
                      </Text>
                      {mealItems.map((item) => (
                        <View
                          key={item.id}
                          className={cn(
                            "rounded-2xl p-4 mb-3",
                            isDark ? "bg-gray-800" : "bg-gray-100"
                          )}
                        >
                          <View className="flex-row justify-between items-start mb-2">
                            <Text
                              className={cn(
                                "text-base font-semibold flex-1",
                                isDark ? "text-white" : "text-gray-900"
                              )}
                            >
                              {item.name}
                            </Text>
                            <Pressable
                              onPress={() => {
                                Haptics.notificationAsync(
                                  Haptics.NotificationFeedbackType.Success
                                );
                                deleteFoodItem(item.id);
                              }}
                              className="p-1"
                            >
                              <Ionicons
                                name="trash-outline"
                                size={18}
                                color={isDark ? "#ef4444" : "#dc2626"}
                              />
                            </Pressable>
                          </View>
                          <View className="flex-row justify-between mt-2">
                            <View>
                              <Text
                                className={cn(
                                  "text-xs",
                                  isDark ? "text-gray-500" : "text-gray-500"
                                )}
                              >
                                Calories
                              </Text>
                              <Text
                                className={cn(
                                  "text-sm font-semibold",
                                  isDark ? "text-blue-400" : "text-blue-600"
                                )}
                              >
                                {item.calories}
                              </Text>
                            </View>
                            <View>
                              <Text
                                className={cn(
                                  "text-xs",
                                  isDark ? "text-gray-500" : "text-gray-500"
                                )}
                              >
                                Protein
                              </Text>
                              <Text
                                className={cn(
                                  "text-sm font-semibold",
                                  isDark ? "text-blue-400" : "text-blue-600"
                                )}
                              >
                                {item.protein}g
                              </Text>
                            </View>
                            <View>
                              <Text
                                className={cn(
                                  "text-xs",
                                  isDark ? "text-gray-500" : "text-gray-500"
                                )}
                              >
                                Carbs
                              </Text>
                              <Text
                                className={cn(
                                  "text-sm font-semibold",
                                  isDark ? "text-green-400" : "text-green-600"
                                )}
                              >
                                {item.carbs}g
                              </Text>
                            </View>
                            <View>
                              <Text
                                className={cn(
                                  "text-xs",
                                  isDark ? "text-gray-500" : "text-gray-500"
                                )}
                              >
                                Fats
                              </Text>
                              <Text
                                className={cn(
                                  "text-sm font-semibold",
                                  isDark ? "text-orange-400" : "text-orange-600"
                                )}
                              >
                                {item.fats}g
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  );
                })}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function MacroRow({
  label,
  value,
  target,
  color,
  isDark,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
  isDark: boolean;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(Math.min((value / target) * 100, 100), {
      damping: 15,
      stiffness: 100,
    });
  }, [value, target]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });

  return (
    <View className="mb-4 last:mb-0">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <View
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: color }}
          />
          <Text
            className={cn(
              "text-base font-semibold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {label}
          </Text>
        </View>
        <Text
          className={cn(
            "text-base font-bold",
            isDark ? "text-white" : "text-gray-900"
          )}
        >
          {value}g / {target}g
        </Text>
      </View>
      <View
        className={cn(
          "h-2 rounded-full overflow-hidden",
          isDark ? "bg-gray-700" : "bg-gray-200"
        )}
      >
        <Animated.View
          className="h-full rounded-full"
          style={[animatedStyle, { backgroundColor: color }]}
        />
      </View>
    </View>
  );
}
