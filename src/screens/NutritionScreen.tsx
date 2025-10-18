import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useIsFocused } from "@react-navigation/native";
import { useNutritionStore, FoodItem } from "../state/nutritionStore";
import { useSettingsStore } from "../state/settingsStore";
import { cn } from "../utils/cn";
import { PremiumBackground } from "../components/PremiumBackground";


export default function NutritionScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const fitnessGoals = useSettingsStore((s) => s.fitnessGoals);
  const foodLog = useNutritionStore((s) => s.foodLog);
  const addFoodItem = useNutritionStore((s) => s.addFoodItem);
  const deleteFoodItem = useNutritionStore((s) => s.deleteFoodItem);
  const updateFoodItem = useNutritionStore((s) => s.updateFoodItem);
  
  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === "system" ? (systemColorScheme || "light") : theme;
  const isDark = resolvedTheme === "dark";
  const isFocused = useIsFocused();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [isAddFoodModalVisible, setIsAddFoodModalVisible] = useState(false);
  const [viewMealsModalVisible, setViewMealsModalVisible] = useState(false);
  const [showMacroTotals, setShowMacroTotals] = useState(false);
  const [isManualEntryVisible, setIsManualEntryVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get week dates - start from 1 year ago
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    // Go back 1 year to the Sunday of that week
    const pastDate = new Date(today);
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    const pastDay = pastDate.getDay();
    const diff = pastDate.getDate() - pastDay;
    const startSunday = new Date(pastDate);
    startSunday.setDate(diff);
    return startSunday;
  });

  // Constants for snapping
  const DAY_ITEM_WIDTH = 60; // 48px circle + 12px margin-right
  const WEEK_WIDTH = DAY_ITEM_WIDTH * 7; // Width of one full week (420px)
  const SCREEN_WIDTH = Dimensions.get("window").width;
  const PADDING_HORIZONTAL = 16; // px-4 = 16px

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

  // Edit meal states
  const [isEditMealModalVisible, setIsEditMealModalVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState<FoodItem | null>(null);
  const [editCalories, setEditCalories] = useState("");
  const [editProtein, setEditProtein] = useState("");
  const [editCarbs, setEditCarbs] = useState("");
  const [editFats, setEditFats] = useState("");

  const handleEditMeal = (meal: FoodItem) => {
    setEditingMeal(meal);
    setEditCalories(meal.calories.toString());
    setEditProtein(meal.protein.toString());
    setEditCarbs(meal.carbs.toString());
    setEditFats(meal.fats.toString());
    setIsEditMealModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSaveEditMeal = () => {
    if (editingMeal && editCalories && editProtein && editCarbs && editFats) {
      updateFoodItem(editingMeal.id, {
        calories: parseFloat(editCalories),
        protein: parseFloat(editProtein),
        carbs: parseFloat(editCarbs),
        fats: parseFloat(editFats),
      });
      setIsEditMealModalVisible(false);
      setEditingMeal(null);
      setEditCalories("");
      setEditProtein("");
      setEditCarbs("");
      setEditFats("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

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
    const today = new Date();
    
    // Calculate the max date (7 days from today)
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 7);
    const maxDateStr = maxDate.toISOString().split("T")[0];
    
    // Generate weeks from selectedWeekStart until we hit the 7-day future limit
    let weekIndex = 0;
    let shouldContinue = true;
    
    while (shouldContinue && weekIndex < 100) { // Max 100 weeks (~2 years) as safety
      let weekHasValidDate = false;
      
      for (let day = 0; day < 7; day++) {
        const date = new Date(selectedWeekStart);
        date.setDate(selectedWeekStart.getDate() + (weekIndex * 7) + day);
        const dateStr = date.toISOString().split("T")[0];
        
        // Check if this date is within the allowed range
        if (dateStr <= maxDateStr) {
          weekHasValidDate = true;
        }
        
        dates.push(date);
      }
      
      // If this entire week is beyond the 7-day future limit, stop
      if (!weekHasValidDate) {
        // Remove the last 7 dates we just added
        dates.splice(-7, 7);
        shouldContinue = false;
      }
      
      weekIndex++;
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

  // Scroll to current week when tab is focused
  useEffect(() => {
    if (isFocused && scrollViewRef.current) {
      const today = new Date();
      const todaySunday = new Date(today);
      const day = todaySunday.getDay();
      todaySunday.setDate(todaySunday.getDate() - day); // Get Sunday of current week
      
      // Calculate number of weeks between selectedWeekStart and today's week
      const timeDiff = todaySunday.getTime() - selectedWeekStart.getTime();
      const weeksDiff = Math.floor(timeDiff / (7 * 24 * 60 * 60 * 1000));
      
      const scrollToX = weeksDiff * WEEK_WIDTH;
      
      // Delay to ensure ScrollView is mounted
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: scrollToX,
          animated: true,
        });
      }, 100);
    }
  }, [isFocused]);

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-gray-50")}>
      <PremiumBackground theme={theme} variant="nutrition" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-4 mb-6 flex-row justify-between items-start">
          <View>
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
          {/* Nutrition Streak Badge */}
          <View 
            className="rounded-2xl px-3 py-2 flex-row items-center"
            style={{
              backgroundColor: isDark ? "rgba(249, 115, 22, 0.15)" : "#fff7ed",
              borderWidth: 1.5,
              borderColor: "#f97316",
            }}
          >
            <Ionicons name="flame" size={20} color="#f97316" />
            <Text 
              className="text-lg font-bold ml-1"
              style={{ color: "#f97316" }}
            >
              {getCurrentStreak()}
            </Text>
          </View>
        </View>

        {/* Week Calendar - Horizontal Scroll */}
        <View className="mb-3">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4"
            contentContainerStyle={{ paddingRight: 16 }}
            snapToInterval={WEEK_WIDTH}
            decelerationRate="fast"
            snapToAlignment="start"
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
                  className="items-center mr-3"
                >
                  <Text
                    className={cn(
                      "text-xs mb-1",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </Text>
                  <View className="relative items-center justify-center">
                    {/* Outer dotted/solid circle */}
                    <View
                      className="absolute w-12 h-12 rounded-full items-center justify-center"
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
                        "w-10 h-10 rounded-full items-center justify-center",
                        isSelected
                          ? "bg-blue-500"
                          : metGoal
                          ? "bg-green-500"
                          : isDark
                          ? "bg-[#1a1a1a]"
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
                          "text-lg font-bold",
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
        </View>

        {/* Calorie Counter Card */}
        <View className="px-4 mt-3">
          <View
            className={cn(
              "rounded-3xl p-4 items-center",
              isDark ? "bg-[#1a1a1a]" : "bg-white/60"
            )}
            style={{
              shadowColor: isDark ? "#000" : "#1f2937",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDark ? 0.6 : 0.25,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text 
              className="text-6xl font-bold"
              style={{
                color: isDark ? "#ffffff" : "#000000",
                textShadowColor: isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.1)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}
            >
              {Math.round(totals.calories)}
            </Text>
            {totals.calories >= targetCalories && (
              <Text className="text-xl mt-1">🎉</Text>
            )}
            <Text
              className={cn(
                "text-sm mt-1",
                totals.calories >= targetCalories
                  ? "text-green-500 font-semibold"
                  : isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              {totals.calories >= targetCalories 
                ? "Goal reached! Keep it up 💪" 
                : `of ${targetCalories} calories`}
            </Text>

            {/* Progress Bar - Blue & Glowy Dopamine Inducing */}
            <View className="w-full mt-3">
              <View
                className={cn(
                  "h-4 rounded-full overflow-visible",
                  isDark ? "bg-[#1a1a1a]" : "bg-gray-200"
                )}
                style={{
                  shadowColor: "#3b82f6",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 15,
                  elevation: 8,
                }}
              >
                <Animated.View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min((totals.calories / targetCalories) * 100, 100)}%`,
                    backgroundColor: "#3b82f6",
                    shadowColor: "#3b82f6",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1,
                    shadowRadius: 20,
                    elevation: 15,
                  }}
                />
                {/* Extra glow layer for more dopamine */}
                <View
                  className="absolute inset-0 rounded-full"
                  style={{
                    shadowColor: "#3b82f6",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 25,
                  }}
                />
                {/* Third glow layer for maximum effect */}
                <View
                  className="absolute inset-0 rounded-full"
                  style={{
                    shadowColor: "#3b82f6",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 30,
                  }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Macros Card */}
        <View className="px-4 mt-3">
          <View
            className={cn(
              "rounded-3xl p-4",
              isDark ? "bg-[#1a1a1a]" : "bg-white/60"
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
              color="#ef4444"
              isDark={isDark}
              showTotals={showMacroTotals}
              onToggle={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowMacroTotals(!showMacroTotals);
              }}
            />
            <View className="h-4" />
            <MacroRow
              label="Carbs"
              value={Math.round(totals.carbs)}
              target={targetCarbs}
              color="#fb923c"
              isDark={isDark}
              showTotals={showMacroTotals}
              onToggle={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowMacroTotals(!showMacroTotals);
              }}
            />
            <View className="h-4" />
            <MacroRow
              label="Fat"
              value={Math.round(totals.fats)}
              target={targetFats}
              color="#ec4899"
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
        <View className="px-4 mt-3">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsAddFoodModalVisible(true);
            }}
            className="rounded-3xl py-3 flex-row justify-center items-center"
            style={{
              backgroundColor: "#3b82f6",
              shadowColor: "#3b82f6",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Ionicons name="add-circle" size={22} color="white" />
            <Text className="text-white text-base font-bold ml-2">
              Add Meal
            </Text>
          </Pressable>
        </View>

        {/* Meals List */}
        {getTodayMeals().length > 0 && (
          <View className="px-4 mt-4 mb-4">
            {getTodayMeals().map((item) => (
              <View
                key={item.id}
                className={cn(
                  "rounded-3xl p-5 mb-3",
                  isDark ? "bg-[#1a1a1a]" : "bg-white/60"
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
        <SafeAreaView className={cn("flex-1", isDark ? "bg-[#1a1a1a]" : "bg-white")}>
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
          <SafeAreaView className={cn("flex-1", isDark ? "bg-[#1a1a1a]" : "bg-gray-50")}>
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
                            ? "bg-[#1a1a1a] text-white"
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
                          ? "bg-[#1a1a1a] text-white"
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
                              ? "bg-[#1a1a1a]"
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
                          ? "bg-[#1a1a1a] text-white"
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
                          ? "bg-[#1a1a1a] text-white"
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
                          ? "bg-[#1a1a1a] text-white"
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
                          ? "bg-[#1a1a1a] text-white"
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
        <SafeAreaView className={cn("flex-1", isDark ? "bg-[#1a1a1a]" : "bg-white")}>
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
                        <Pressable
                          key={item.id}
                          onPress={() => handleEditMeal(item)}
                          className={cn(
                            "rounded-2xl p-4 mb-3",
                            isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
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
                              onPress={(e) => {
                                e.stopPropagation();
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
                        </Pressable>
                      ))}
                    </View>
                  );
                })}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Edit Meal Modal */}
      <Modal
        visible={isEditMealModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-gray-50")}>
            <View className="px-4 pt-4 pb-2 border-b border-gray-200">
              <View className="flex-row justify-between items-center">
                <Text
                  className={cn(
                    "text-2xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  Edit Meal
                </Text>
                <View className="flex-row">
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsEditMealModalVisible(false);
                    }}
                    className="mr-4 px-4 py-2"
                  >
                    <Text className="text-red-500 font-semibold">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSaveEditMeal}
                    className="bg-green-500 px-4 py-2 rounded-full"
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
              {/* Meal Name (Read-only) */}
              <View className="mt-4">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Meal Name
                </Text>
                <View
                  className={cn(
                    "rounded-lg p-3",
                    isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
                  )}
                >
                  <Text
                    className={cn(
                      "text-base",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    {editingMeal?.name}
                  </Text>
                </View>
              </View>

              {/* Calories */}
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
                  value={editCalories}
                  onChangeText={setEditCalories}
                  placeholder="e.g., 500"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  keyboardType="numeric"
                  className={cn(
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-white text-gray-900"
                  )}
                />
              </View>

              {/* Protein */}
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
                  value={editProtein}
                  onChangeText={setEditProtein}
                  placeholder="e.g., 30"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  keyboardType="numeric"
                  className={cn(
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-white text-gray-900"
                  )}
                />
              </View>

              {/* Carbs */}
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
                  value={editCarbs}
                  onChangeText={setEditCarbs}
                  placeholder="e.g., 50"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  keyboardType="numeric"
                  className={cn(
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-white text-gray-900"
                  )}
                />
              </View>

              {/* Fats */}
              <View className="mt-4">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Fats (g)
                </Text>
                <TextInput
                  value={editFats}
                  onChangeText={setEditFats}
                  placeholder="e.g., 15"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  keyboardType="numeric"
                  className={cn(
                    "rounded-lg p-3 text-base",
                    isDark
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-white text-gray-900"
                  )}
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
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
          isDark ? "bg-[#1a1a1a]" : "bg-gray-200"
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
