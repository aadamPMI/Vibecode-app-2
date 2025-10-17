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
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

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
      const newFood: FoodItem = {
        id: Date.now().toString(),
        name: foodName,
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fats: parseFloat(fats),
        date: selectedDate,
        meal: selectedMeal,
      };
      addFoodItem(newFood);
      setFoodName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFats("");
      setIsAddFoodModalVisible(false);
    }
  };

  const getTodayFood = () => {
    return foodLog.filter((f) => f.date === selectedDate);
  };

  const getWeekFood = () => {
    const today = new Date(selectedDate);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return foodLog.filter((f) => {
      const foodDate = new Date(f.date);
      return foodDate >= weekAgo && foodDate <= today;
    });
  };

  const getCurrentFood = () => {
    return viewMode === "day" ? getTodayFood() : getWeekFood();
  };

  const getTotals = () => {
    const foods = getCurrentFood();
    return foods.reduce(
      (totals, food) => ({
        calories: totals.calories + food.calories,
        protein: totals.protein + food.protein,
        carbs: totals.carbs + food.carbs,
        fats: totals.fats + food.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const totals = getTotals();
  const todayFood = getTodayFood();

  const getMealFood = (meal: string) => {
    return todayFood.filter((f) => f.meal === meal);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const changeDate = (direction: "prev" | "next") => {
    const date = new Date(selectedDate);
    if (direction === "prev") {
      date.setDate(date.getDate() - 1);
    } else {
      date.setDate(date.getDate() + 1);
    }
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-gray-900" : "bg-gray-50")}>
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text
            className={cn(
              "text-3xl font-bold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            Nutrition
          </Text>
          <Pressable
            onPress={() => setIsAddFoodModalVisible(true)}
            className="bg-blue-500 px-4 py-2 rounded-full flex-row items-center"
          >
            <Ionicons name="add" size={24} color="white" />
            <Text className="text-white font-semibold ml-1">Add Food</Text>
          </Pressable>
        </View>

        {/* Date Navigation */}
        <View className="flex-row justify-between items-center mb-4">
          <Pressable onPress={() => changeDate("prev")} className="p-2">
            <Ionicons
              name="chevron-back"
              size={24}
              color={isDark ? "#fff" : "#000"}
            />
          </Pressable>
          <View className="items-center">
            <Text
              className={cn(
                "text-lg font-semibold",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {formatDate(selectedDate)}
            </Text>
            {selectedDate !== new Date().toISOString().split("T")[0] && (
              <Pressable onPress={goToToday}>
                <Text className="text-blue-500 text-sm">Today</Text>
              </Pressable>
            )}
          </View>
          <Pressable onPress={() => changeDate("next")} className="p-2">
            <Ionicons
              name="chevron-forward"
              size={24}
              color={isDark ? "#fff" : "#000"}
            />
          </Pressable>
        </View>

        {/* View Mode Toggle */}
        <View className="flex-row mb-4">
          <Pressable
            onPress={() => setViewMode("day")}
            className={cn(
              "flex-1 py-2 rounded-l-lg",
              viewMode === "day"
                ? "bg-blue-500"
                : isDark
                ? "bg-gray-800"
                : "bg-white"
            )}
          >
            <Text
              className={cn(
                "text-center font-semibold",
                viewMode === "day"
                  ? "text-white"
                  : isDark
                  ? "text-gray-400"
                  : "text-gray-600"
              )}
            >
              Day
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode("week")}
            className={cn(
              "flex-1 py-2 rounded-r-lg",
              viewMode === "week"
                ? "bg-blue-500"
                : isDark
                ? "bg-gray-800"
                : "bg-white"
            )}
          >
            <Text
              className={cn(
                "text-center font-semibold",
                viewMode === "week"
                  ? "text-white"
                  : isDark
                  ? "text-gray-400"
                  : "text-gray-600"
              )}
            >
              Week
            </Text>
          </Pressable>
        </View>

        {/* Totals Card */}
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
          <Text
            className={cn(
              "text-lg font-bold mb-3",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {viewMode === "day" ? "Today" : "Last 7 Days"}
          </Text>
          
          {/* Calories */}
          <View className="mb-3">
            <View className="flex-row justify-between mb-1">
              <Text
                className={cn(
                  "text-sm",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}
              >
                Calories
              </Text>
              <Text
                className={cn(
                  "text-sm font-semibold",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {Math.round(totals.calories)} / {fitnessGoals.targetCalories || 2000}
              </Text>
            </View>
            <View className="h-2 bg-gray-300 rounded-full overflow-hidden">
              <View
                className="h-full bg-blue-500"
                style={{
                  width: `${Math.min(
                    (totals.calories / (fitnessGoals.targetCalories || 2000)) * 100,
                    100
                  )}%`,
                }}
              />
            </View>
          </View>

          {/* Macros */}
          <View className="flex-row justify-between">
            <View className="flex-1 mr-2">
              <Text
                className={cn(
                  "text-xs mb-1",
                  isDark ? "text-gray-500" : "text-gray-500"
                )}
              >
                Protein
              </Text>
              <Text
                className={cn(
                  "text-base font-bold",
                  isDark ? "text-green-400" : "text-green-600"
                )}
              >
                {Math.round(totals.protein)}g
              </Text>
              <Text
                className={cn(
                  "text-xs",
                  isDark ? "text-gray-500" : "text-gray-500"
                )}
              >
                / {fitnessGoals.targetProtein || 150}g
              </Text>
            </View>
            <View className="flex-1 mr-2">
              <Text
                className={cn(
                  "text-xs mb-1",
                  isDark ? "text-gray-500" : "text-gray-500"
                )}
              >
                Carbs
              </Text>
              <Text
                className={cn(
                  "text-base font-bold",
                  isDark ? "text-yellow-400" : "text-yellow-600"
                )}
              >
                {Math.round(totals.carbs)}g
              </Text>
              <Text
                className={cn(
                  "text-xs",
                  isDark ? "text-gray-500" : "text-gray-500"
                )}
              >
                / {fitnessGoals.targetCarbs || 200}g
              </Text>
            </View>
            <View className="flex-1">
              <Text
                className={cn(
                  "text-xs mb-1",
                  isDark ? "text-gray-500" : "text-gray-500"
                )}
              >
                Fats
              </Text>
              <Text
                className={cn(
                  "text-base font-bold",
                  isDark ? "text-purple-400" : "text-purple-600"
                )}
              >
                {Math.round(totals.fats)}g
              </Text>
              <Text
                className={cn(
                  "text-xs",
                  isDark ? "text-gray-500" : "text-gray-500"
                )}
              >
                / {fitnessGoals.targetFats || 65}g
              </Text>
            </View>
          </View>
        </View>

        {/* Food List by Meal */}
        {viewMode === "day" ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {todayFood.length === 0 ? (
              <View className="flex-1 justify-center items-center py-12">
                <Ionicons
                  name="nutrition-outline"
                  size={64}
                  color={isDark ? "#6b7280" : "#9ca3af"}
                />
                <Text
                  className={cn(
                    "text-lg mt-4",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  No food logged today
                </Text>
                <Text
                  className={cn(
                    "text-sm mt-2",
                    isDark ? "text-gray-500" : "text-gray-500"
                  )}
                >
                  Tap Add Food to get started
                </Text>
              </View>
            ) : (
              <>
                {["breakfast", "lunch", "dinner", "snack"].map((meal) => {
                  const mealItems = getMealFood(meal);
                  if (mealItems.length === 0) return null;
                  
                  return (
                    <View key={meal} className="mb-4">
                      <Text
                        className={cn(
                          "text-lg font-bold mb-2 capitalize",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        {meal}
                      </Text>
                      {mealItems.map((item) => (
                        <View
                          key={item.id}
                          className={cn(
                            "rounded-xl p-4 mb-2",
                            isDark ? "bg-gray-800" : "bg-white"
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
                              onPress={() => deleteFoodItem(item.id)}
                              className="p-1"
                            >
                              <Ionicons
                                name="trash-outline"
                                size={18}
                                color={isDark ? "#ef4444" : "#dc2626"}
                              />
                            </Pressable>
                          </View>
                          <View className="flex-row justify-between">
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
                                  isDark ? "text-green-400" : "text-green-600"
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
                                  isDark ? "text-yellow-400" : "text-yellow-600"
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
                                  isDark ? "text-purple-400" : "text-purple-600"
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
        ) : (
          <FlatList
            data={getWeekFood()}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View
                className={cn(
                  "rounded-xl p-4 mb-2",
                  isDark ? "bg-gray-800" : "bg-white"
                )}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text
                      className={cn(
                        "text-base font-semibold",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {item.name}
                    </Text>
                    <Text
                      className={cn(
                        "text-xs mt-1",
                        isDark ? "text-gray-500" : "text-gray-500"
                      )}
                    >
                      {formatDate(item.date)} • {item.meal}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => deleteFoodItem(item.id)}
                    className="p-1"
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={isDark ? "#ef4444" : "#dc2626"}
                    />
                  </Pressable>
                </View>
                <View className="flex-row justify-between">
                  <View>
                    <Text
                      className={cn(
                        "text-xs",
                        isDark ? "text-gray-500" : "text-gray-500"
                      )}
                    >
                      Cal
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
                      P
                    </Text>
                    <Text
                      className={cn(
                        "text-sm font-semibold",
                        isDark ? "text-green-400" : "text-green-600"
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
                      C
                    </Text>
                    <Text
                      className={cn(
                        "text-sm font-semibold",
                        isDark ? "text-yellow-400" : "text-yellow-600"
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
                      F
                    </Text>
                    <Text
                      className={cn(
                        "text-sm font-semibold",
                        isDark ? "text-purple-400" : "text-purple-600"
                      )}
                    >
                      {item.fats}g
                    </Text>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>

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
                    onPress={() => setIsAddFoodModalVisible(false)}
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
                      onPress={() => setSelectedMeal(meal)}
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
    </SafeAreaView>
  );
}
