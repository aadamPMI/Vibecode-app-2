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
  const [showMealsInline, setShowMealsInline] = useState(false);
  const [showMacroTotals, setShowMacroTotals] = useState(false);
  const [isManualEntryVisible, setIsManualEntryVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get current week dates - starting 3 weeks ago
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day - 21; // Start 3 weeks ago
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
  const [searchQuery, setSearchQuery] = useState("");

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
    // Show 4 weeks total (3 weeks before + current week + 1 week ahead)
    for (let week = 0; week < 5; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(selectedWeekStart);
        date.setDate(selectedWeekStart.getDate() + (week * 7) + day);
        dates.push(date);
      }
    }
    return dates;
  };

  const getDayTotals = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const dayFood = foodLog.filter((f) => f.date === dateStr);
    return dayFood.reduce(
      (totals, food) => ({
        calories: totals.calories + food.calories,
        protein: totals.protein + food.protein,
        carbs: totals.carbs + food.carbs,
        fats: totals.fats + food.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const getTodayTotals = () => {
    const dateStr = selectedDate.toISOString().split("T")[0];
    const dayFood = foodLog.filter((f) => f.date === dateStr);
    return dayFood.reduce(
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
    // Not used anymore, but keeping for compatibility
    return getTodayTotals();
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
    const dateStr = selectedDate.toISOString().split("T")[0];
    return foodLog.filter((f) => f.date === dateStr);
  };

  const totals = getTodayTotals();
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

  const handleDayPress = (date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedDate(date);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-800" : "bg-white")}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-4 pb-4">
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
            Nutrition
          </Text>
        </View>

        {/* Week Calendar - Horizontal Scroll */}
        <View className="mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {getWeekDates().map((date, index) => {
              const isToday =
                date.toISOString().split("T")[0] ===
                new Date().toISOString().split("T")[0];
              const isSelected = 
                date.toISOString().split("T")[0] ===
                selectedDate.toISOString().split("T")[0];
              const dayTotals = getDayTotals(date);
              const hasData = dayTotals.calories > 0;
              const metGoal = dayTotals.calories >= targetCalories;
              const missedGoal = hasData && !metGoal; // Has data but didn't meet goal
              
              return (
                <Pressable
                  key={index}
                  onPress={() => handleDayPress(date)}
                  className="items-center mr-4"
                >
                  <Text
                    className={cn(
                      "text-xs mb-2",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </Text>
                  <View className="relative items-center justify-center">
                    {/* Outer dotted/solid circle */}
                    <View
                      className="absolute w-14 h-14 rounded-full items-center justify-center"
                      style={{
                        borderWidth: 2,
                        borderStyle: missedGoal ? "solid" : "dashed",
                        borderColor: missedGoal
                          ? "#ef4444"
                          : metGoal
                          ? "#22c55e"
                          : isDark
                          ? "#4b5563"
                          : "#d1d5db",
                      }}
                    />
                    {/* Inner solid circle */}
                    <View
                      className={cn(
                        "w-12 h-12 rounded-full items-center justify-center",
                        isSelected
                          ? "bg-blue-500"
                          : metGoal
                          ? "bg-green-500"
                          : isDark
                          ? "bg-gray-800"
                          : "bg-gray-100"
                      )}
                      style={{
                        shadowColor: isSelected
                          ? "#3b82f6"
                          : metGoal
                          ? "#22c55e"
                          : "transparent",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 3,
                      }}
                    >
                      <Text
                        className={cn(
                          "text-xl font-bold",
                          isSelected || metGoal
                            ? "text-white"
                            : isDark
                            ? "text-white"
                            : "text-gray-900"
                        )}
                      >
                        {date.getDate()}
                      </Text>
                    </View>
                  </View>
                  <Text
                    className={cn(
                      "text-xs mt-2",
                      isDark ? "text-gray-500" : "text-gray-500"
                    )}
                  >
                    {date.toLocaleDateString("en-US", { month: "short" })}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Calorie Display */}
        <View className="px-4 mt-6 items-center">
          <Text 
            className="text-7xl font-bold"
            style={{
              color: totals.calories >= targetCalories ? "#22c55e" : "#3b82f6",
              textShadowColor: totals.calories >= targetCalories ? "rgba(34, 197, 94, 0.4)" : "rgba(59, 130, 246, 0.4)",
              textShadowOffset: { width: 0, height: 3 },
              textShadowRadius: 10,
            }}
          >
            {Math.round(totals.calories)}
          </Text>
          {totals.calories >= targetCalories && (
            <Text className="text-2xl mt-1">🎉</Text>
          )}
          <Text
            className={cn(
              "text-base mt-2",
              totals.calories >= targetCalories
                ? "text-green-500 font-semibold"
                : isDark ? "text-gray-400" : "text-gray-600"
            )}
          >
            {totals.calories >= targetCalories 
              ? "Goal reached! Keep it up 💪" 
              : `of ${targetCalories} calories`}
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="px-4 mt-4">
          <View
            className={cn(
              "h-4 rounded-full overflow-hidden",
              isDark ? "bg-gray-800" : "bg-gray-200"
            )}
            style={{
              shadowColor: totals.calories >= targetCalories ? "#22c55e" : "#3b82f6",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Animated.View
              className="h-full rounded-full"
              style={{
                width: `${Math.min((totals.calories / targetCalories) * 100, 100)}%`,
                backgroundColor: totals.calories >= targetCalories ? "#22c55e" : "#3b82f6",
              }}
            />
          </View>
        </View>

        {/* Macros Card */}
        <View className="px-4 mt-6">
          <View
            className={cn(
              "rounded-3xl p-6",
              isDark ? "bg-gray-900/40" : "bg-white/60"
            )}
            style={{
              shadowColor: isDark ? "#000" : "#1f2937",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDark ? 0.6 : 0.25,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <MacroRow
              label="Protein"
              value={Math.round(totals.protein)}
              target={targetProtein}
              color="#3b82f6"
              isDark={isDark}
              showTotals={showMacroTotals}
              onToggle={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowMacroTotals(!showMacroTotals);
              }}
            />
            <View className="h-5" />
            <MacroRow
              label="Carbs"
              value={Math.round(totals.carbs)}
              target={targetCarbs}
              color="#22c55e"
              isDark={isDark}
              showTotals={showMacroTotals}
              onToggle={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowMacroTotals(!showMacroTotals);
              }}
            />
            <View className="h-5" />
            <MacroRow
              label="Fat"
              value={Math.round(totals.fats)}
              target={targetFats}
              color="#f97316"
              isDark={isDark}
              showTotals={showMacroTotals}
              onToggle={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowMacroTotals(!showMacroTotals);
              }}
            />
          </View>
        </View>

        {/* Add Meal Button - Separate Card */}
        <View className="px-4 mt-4">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsAddFoodModalVisible(true);
            }}
            className="rounded-3xl py-4 flex-row justify-center items-center"
            style={{
              backgroundColor: "#3b82f6",
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text className="text-white text-base font-bold ml-2">
              Add Meal
            </Text>
          </Pressable>
        </View>

        {/* Streak Card */}
        <View className="px-4 mt-4">
          <View 
            className="rounded-3xl p-6 overflow-hidden"
            style={{
              backgroundColor: isDark ? "#1f2937" : "#fff7ed",
              borderWidth: 2,
              borderColor: isDark ? "#f59e0b" : "#fb923c",
              shadowColor: "#f59e0b",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 6,
            }}
          >
              <View className="flex-row justify-around">
                <View className="items-center flex-1">
                  <View className="mb-3">
                    <Ionicons name="flame" size={48} color="#f97316" />
                  </View>
                  <Text
                    className="text-5xl font-bold"
                    style={{
                      color: "#f97316",
                      textShadowColor: "rgba(249, 115, 22, 0.3)",
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 8,
                    }}
                  >
                    {getCurrentStreak()}
                  </Text>
                  <Text
                    className={cn(
                      "text-xs font-semibold mt-2",
                      isDark ? "text-orange-400" : "text-orange-600"
                    )}
                  >
                    Day Streak
                  </Text>
                </View>
                <View
                  className="w-0.5 mx-3"
                  style={{ backgroundColor: isDark ? "#fb923c" : "#fdba74" }}
                />
                <View className="items-center flex-1">
                  <View className="mb-3">
                    <Ionicons name="trophy" size={48} color="#f59e0b" />
                  </View>
                  <Text
                    className="text-5xl font-bold"
                    style={{
                      color: "#f59e0b",
                      textShadowColor: "rgba(245, 158, 11, 0.3)",
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 8,
                    }}
                  >
                    {getLongestStreak()}
                  </Text>
                  <Text
                    className={cn(
                      "text-xs font-semibold mt-2",
                      isDark ? "text-yellow-400" : "text-yellow-600"
                    )}
                  >
                    Best Streak
                  </Text>
                </View>
              </View>
            </View>
          </View>

        {/* View Meals Button */}
        <View className="px-4 mt-4">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowMealsInline(!showMealsInline);
            }}
            className={cn(
              "rounded-3xl py-4 flex-row justify-center items-center border",
              isDark ? "bg-gray-900/40 border-gray-700" : "bg-white/60 border-gray-200"
            )}
            style={{
              shadowColor: isDark ? "#000" : "#1f2937",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDark ? 0.6 : 0.25,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Ionicons
              name={showMealsInline ? "chevron-up" : "chevron-down"}
              size={24}
              color={isDark ? "#fff" : "#000"}
            />
            <Text
              className={cn(
                "text-base font-semibold ml-2",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {showMealsInline ? "Hide" : "View"} {getTodayMeals().length} Meals
            </Text>
          </Pressable>
        </View>

        {/* Meals List - Inline Dropdown */}
        {showMealsInline && getTodayMeals().length > 0 && (
          <View className="px-4 mt-4">
            {getTodayMeals().map((item) => (
              <View
                key={item.id}
                className={cn(
                  "rounded-3xl p-5 mb-3",
                  isDark ? "bg-gray-900/40" : "bg-white/60"
                )}
                style={{
                  shadowColor: isDark ? "#000" : "#1f2937",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isDark ? 0.4 : 0.2,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text
                      className={cn(
                        "text-lg font-bold mb-1",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {item.name}
                    </Text>
                    <View
                      className="px-3 py-1 rounded-full self-start"
                      style={{
                        backgroundColor:
                          item.meal === "breakfast"
                            ? "#fbbf24"
                            : item.meal === "lunch"
                            ? "#3b82f6"
                            : item.meal === "dinner"
                            ? "#8b5cf6"
                            : "#ec4899",
                      }}
                    >
                      <Text className="text-white text-xs font-semibold capitalize">
                        {item.meal}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      deleteFoodItem(item.id);
                    }}
                    className="ml-3"
                  >
                    <Ionicons name="trash-outline" size={24} color="#ef4444" />
                  </Pressable>
                </View>

                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <Text
                      className={cn(
                        "text-xs mb-1",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      Calories
                    </Text>
                    <Text
                      className={cn(
                        "text-base font-bold",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {item.calories}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className={cn(
                        "text-xs mb-1",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      Protein
                    </Text>
                    <Text
                      className={cn(
                        "text-base font-bold",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {item.protein}g
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className={cn(
                        "text-xs mb-1",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      Carbs
                    </Text>
                    <Text
                      className={cn(
                        "text-base font-bold",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {item.carbs}g
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className={cn(
                        "text-xs mb-1",
                        isDark ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      Fat
                    </Text>
                    <Text
                      className={cn(
                        "text-base font-bold",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {item.fats}g
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Food Options Modal - Liquid Glass UI */}
      <Modal
        visible={isAddFoodModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-800" : "bg-white")}>
          <View className="flex-1 px-6">
            {/* Header */}
            <View className="pt-6 pb-4">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsAddFoodModalVisible(false);
                }}
                className="self-end mb-4"
              >
                <Ionicons
                  name="close"
                  size={28}
                  color={isDark ? "#fff" : "#000"}
                />
              </Pressable>
              <Text
                className={cn(
                  "text-4xl font-bold mb-2",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                Add Food
              </Text>
              <Text
                className={cn(
                  "text-lg",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                How would you like to add food?
              </Text>
            </View>

            {/* Options */}
            <View className="flex-1 justify-center pb-20">
              {/* Take Photo Option */}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  // Camera functionality - mockup for now
                  setIsAddFoodModalVisible(false);
                  setTimeout(() => {
                    alert("Camera feature coming soon! AI will analyze your meal automatically.");
                  }, 300);
                }}
                className="rounded-3xl p-6 mb-4 overflow-hidden"
                style={{
                  backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#3b82f6",
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-20 h-20 rounded-3xl items-center justify-center mr-4"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(59, 130, 246, 0.3)"
                        : "rgba(255, 255, 255, 0.25)",
                    }}
                  >
                    <Ionicons name="camera" size={40} color="#fff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-2xl font-bold mb-1">
                      Take Photo
                    </Text>
                    <Text className="text-white text-base opacity-90">
                      AI will analyze your meal automatically
                    </Text>
                  </View>
                </View>
              </Pressable>

              {/* Smart Lookup Option */}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setIsAddFoodModalVisible(false);
                  setIsSearchVisible(true);
                }}
                className="rounded-3xl p-6 mb-4 overflow-hidden"
                style={{
                  backgroundColor: isDark ? "rgba(168, 85, 247, 0.15)" : "#a855f7",
                  shadowColor: "#a855f7",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-20 h-20 rounded-3xl items-center justify-center mr-4"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(168, 85, 247, 0.3)"
                        : "rgba(255, 255, 255, 0.25)",
                    }}
                  >
                    <Ionicons name="search" size={40} color="#fff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-2xl font-bold mb-1">
                      Smart Lookup
                    </Text>
                    <Text className="text-white text-base opacity-90">
                      Search database or add custom food
                    </Text>
                  </View>
                </View>
              </Pressable>

              {/* Scan Barcode Option */}
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  // Barcode scanner - mockup for now
                  setIsAddFoodModalVisible(false);
                  setTimeout(() => {
                    alert("Barcode scanner coming soon! Quick lookup for packaged foods.");
                  }, 300);
                }}
                className="rounded-3xl p-6 overflow-hidden"
                style={{
                  backgroundColor: isDark ? "rgba(34, 197, 94, 0.15)" : "#22c55e",
                  shadowColor: "#22c55e",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-20 h-20 rounded-3xl items-center justify-center mr-4"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(34, 197, 94, 0.3)"
                        : "rgba(255, 255, 255, 0.25)",
                    }}
                  >
                    <Ionicons name="scan" size={40} color="#fff" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-2xl font-bold mb-1">
                      Scan Barcode
                    </Text>
                    <Text className="text-white text-base opacity-90">
                      Quick lookup for packaged foods
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Smart Lookup / Manual Entry Modal */}
      <Modal
        visible={isSearchVisible || isManualEntryVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-800" : "bg-gray-50")}>
            <View className="px-4 pt-4 pb-2 border-b border-gray-200">
              <View className="flex-row justify-between items-center">
                <Text
                  className={cn(
                    "text-2xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  {isSearchVisible ? "Search Food" : "Add Food"}
                </Text>
                <View className="flex-row">
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsSearchVisible(false);
                      setIsManualEntryVisible(false);
                    }}
                    className="mr-4 px-4 py-2"
                  >
                    <Text className="text-red-500 font-semibold">Cancel</Text>
                  </Pressable>
                  {isManualEntryVisible && (
                    <Pressable
                      onPress={handleAddFood}
                      className="bg-blue-500 px-4 py-2 rounded-full"
                    >
                      <Text className="text-white font-semibold">Add</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>

            <ScrollView
              className="flex-1 px-4"
              keyboardShouldPersistTaps="handled"
            >
              {isSearchVisible && (
                <View className="mt-4">
                  <View className="flex-row items-center mb-4">
                    <View className="flex-1 mr-2">
                      <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search for food..."
                        placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                        className={cn(
                          "rounded-lg p-3 text-base",
                          isDark
                            ? "bg-gray-900 text-white"
                            : "bg-white text-gray-900"
                        )}
                      />
                    </View>
                  </View>
                  
                  <Text
                    className={cn(
                      "text-sm mb-3",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    Search results will appear here
                  </Text>

                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsSearchVisible(false);
                      setIsManualEntryVisible(true);
                    }}
                    className="bg-blue-500 py-3 rounded-lg"
                  >
                    <Text className="text-white font-semibold text-center">
                      Add Custom Food
                    </Text>
                  </Pressable>
                </View>
              )}

              {isManualEntryVisible && (
                <>
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
                          ? "bg-gray-900 text-white"
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
                          ? "bg-gray-900 text-white"
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
                          ? "bg-gray-900 text-white"
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
                          ? "bg-gray-900 text-white"
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
                          ? "bg-gray-900 text-white"
                          : "bg-white text-gray-900"
                      )}
                    />
                  </View>
                </>
              )}
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
        <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-800" : "bg-white")}>
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
  showTotals,
  onToggle,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
  isDark: boolean;
  showTotals: boolean;
  onToggle: () => void;
}) {
  const progress = useSharedValue(0);
  const isComplete = value >= target;

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
    <View>
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <View
            className="w-4 h-4 rounded-full mr-3"
            style={{ 
              backgroundColor: color,
              shadowColor: color,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 4,
              elevation: 2,
            }}
          />
          <Text
            className={cn(
              "text-lg font-semibold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {label}
          </Text>
          {isComplete && (
            <Text className="ml-2 text-base">✨</Text>
          )}
        </View>
        <Pressable onPress={onToggle}>
          <Text
            className={cn(
              "text-base font-semibold",
              isComplete
                ? "text-green-500"
                : isDark ? "text-white" : "text-gray-900"
            )}
          >
            {showTotals 
              ? `${value}g / ${target}g`
              : isComplete 
                ? `Complete! ✓` 
                : `${Math.max(0, target - value)}g left`}
          </Text>
        </Pressable>
      </View>
      <View
        className={cn(
          "h-3 rounded-full overflow-hidden",
          isDark ? "bg-gray-800" : "bg-gray-200"
        )}
        style={{
          shadowColor: isComplete ? color : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: isComplete ? 2 : 0,
        }}
      >
        <Animated.View
          className="h-full rounded-full"
          style={[
            animatedStyle, 
            { 
              backgroundColor: color,
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 6,
            }
          ]}
        />
      </View>
    </View>
  );
}
