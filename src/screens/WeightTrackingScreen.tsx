import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  useColorScheme,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Svg, Line, Circle, Text as SvgText, Polyline } from "react-native-svg";
import { useWeightStore } from "../state/weightStore";
import { useSettingsStore } from "../state/settingsStore";
import { cn } from "../utils/cn";
import { PremiumBackground } from "../components/PremiumBackground";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRAPH_WIDTH = SCREEN_WIDTH - 48; // 24px padding on each side
const GRAPH_HEIGHT = 250;
const GRAPH_PADDING = 40;

export default function WeightTrackingScreen() {
  const colorScheme = useColorScheme();
  const theme = useSettingsStore((s) => s.theme);
  const resolvedTheme = theme === "system" ? (colorScheme || "light") : theme;
  const isDark = resolvedTheme === "dark";

  const { entries, addEntry, deleteEntry } = useWeightStore();
  const targetWeight = useSettingsStore((s) => s.fitnessGoals.targetWeight);
  const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleLogWeight = () => {
    const weight = parseFloat(weightInput);
    if (!isNaN(weight) && weight > 0) {
      addEntry(weight, selectedDate);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setWeightInput("");
      setSelectedDate(new Date());
      setIsModalVisible(false);
    }
  };

  const handleDeleteEntry = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deleteEntry(id);
  };

  // Calculate graph data
  const getGraphData = () => {
    if (sortedEntries.length === 0) return null;

    const weights = sortedEntries.map((e) => e.weight);
    const minWeight = Math.min(...weights, targetWeight || Infinity) - 5;
    const maxWeight = Math.max(...weights, targetWeight || -Infinity) + 5;

    const points = sortedEntries.map((entry, index) => {
      const x = GRAPH_PADDING + (index / Math.max(sortedEntries.length - 1, 1)) * (GRAPH_WIDTH - GRAPH_PADDING * 2);
      const y = GRAPH_HEIGHT - GRAPH_PADDING - ((entry.weight - minWeight) / (maxWeight - minWeight)) * (GRAPH_HEIGHT - GRAPH_PADDING * 2);
      return { x, y, entry };
    });

    // Target weight line Y position
    const targetY = targetWeight
      ? GRAPH_HEIGHT - GRAPH_PADDING - ((targetWeight - minWeight) / (maxWeight - minWeight)) * (GRAPH_HEIGHT - GRAPH_PADDING * 2)
      : null;

    return { points, minWeight, maxWeight, targetY };
  };

  const graphData = getGraphData();

  // Get current and starting weight
  const currentWeight = sortedEntries.length > 0 ? sortedEntries[sortedEntries.length - 1].weight : null;
  const startingWeight = sortedEntries.length > 0 ? sortedEntries[0].weight : null;
  const weightChange = currentWeight && startingWeight ? currentWeight - startingWeight : null;

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-gray-50")}>
      <PremiumBackground theme={theme} variant="settings" />
      
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className={cn("text-5xl font-bold", isDark ? "text-white" : "text-black")}>
            Weight
          </Text>
        </View>

        {/* Stats Cards */}
        {currentWeight && (
          <View className="px-6 mb-4">
            <View className="flex-row space-x-3">
              {/* Current Weight */}
              <Animated.View
                entering={FadeInDown.delay(100)}
                className={cn("flex-1 rounded-3xl p-4", isDark ? "bg-[#1a1a1a]" : "bg-white")}
                style={{
                  shadowColor: isDark ? "#000" : "#1f2937",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text className={cn("text-sm mb-1", isDark ? "text-gray-400" : "text-gray-600")}>
                  Current
                </Text>
                <Text className={cn("text-3xl font-bold", isDark ? "text-white" : "text-black")}>
                  {currentWeight.toFixed(1)}
                </Text>
                <Text className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-500")}>
                  kg
                </Text>
              </Animated.View>

              {/* Target Weight */}
              {targetWeight && (
                <Animated.View
                  entering={FadeInDown.delay(200)}
                  className={cn("flex-1 rounded-3xl p-4", isDark ? "bg-[#1a1a1a]" : "bg-white")}
                  style={{
                    shadowColor: isDark ? "#000" : "#1f2937",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text className={cn("text-sm mb-1", isDark ? "text-gray-400" : "text-gray-600")}>
                    Target
                  </Text>
                  <Text className={cn("text-3xl font-bold", isDark ? "text-white" : "text-black")}>
                    {targetWeight.toFixed(1)}
                  </Text>
                  <Text className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-500")}>
                    kg
                  </Text>
                </Animated.View>
              )}

              {/* Weight Change */}
              {weightChange !== null && (
                <Animated.View
                  entering={FadeInDown.delay(300)}
                  className={cn("flex-1 rounded-3xl p-4", isDark ? "bg-[#1a1a1a]" : "bg-white")}
                  style={{
                    shadowColor: isDark ? "#000" : "#1f2937",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text className={cn("text-sm mb-1", isDark ? "text-gray-400" : "text-gray-600")}>
                    Change
                  </Text>
                  <Text
                    className={cn(
                      "text-3xl font-bold",
                      weightChange > 0 ? "text-orange-500" : weightChange < 0 ? "text-green-500" : isDark ? "text-white" : "text-black"
                    )}
                  >
                    {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)}
                  </Text>
                  <Text className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-500")}>
                    kg
                  </Text>
                </Animated.View>
              )}
            </View>
          </View>
        )}

        {/* Graph Card */}
        <View className="px-6 mb-4">
          <Animated.View
            entering={FadeInDown.delay(400)}
            className={cn("rounded-3xl p-6", isDark ? "bg-[#1a1a1a]" : "bg-white")}
            style={{
              shadowColor: isDark ? "#000" : "#1f2937",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Text className={cn("text-xl font-bold mb-4", isDark ? "text-white" : "text-black")}>
              Progress
            </Text>

            {graphData && graphData.points.length > 0 ? (
              <View>
                <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Line
                      key={`grid-${i}`}
                      x1={GRAPH_PADDING}
                      y1={GRAPH_PADDING + (i * (GRAPH_HEIGHT - GRAPH_PADDING * 2)) / 4}
                      x2={GRAPH_WIDTH - GRAPH_PADDING}
                      y2={GRAPH_PADDING + (i * (GRAPH_HEIGHT - GRAPH_PADDING * 2)) / 4}
                      stroke={isDark ? "#2a2a2a" : "#e5e7eb"}
                      strokeWidth="1"
                    />
                  ))}

                  {/* Target weight line */}
                  {graphData.targetY && (
                    <Line
                      x1={GRAPH_PADDING}
                      y1={graphData.targetY}
                      x2={GRAPH_WIDTH - GRAPH_PADDING}
                      y2={graphData.targetY}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  )}

                  {/* Weight line */}
                  {graphData.points.length > 1 && (
                    <Polyline
                      points={graphData.points.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                    />
                  )}

                  {/* Data points */}
                  {graphData.points.map((point, index) => (
                    <Circle
                      key={`point-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r="6"
                      fill="#10b981"
                      stroke={isDark ? "#0a0a0a" : "#ffffff"}
                      strokeWidth="2"
                    />
                  ))}

                  {/* Y-axis labels */}
                  <SvgText
                    x="5"
                    y={GRAPH_PADDING}
                    fill={isDark ? "#9ca3af" : "#6b7280"}
                    fontSize="12"
                  >
                    {graphData.maxWeight.toFixed(0)}
                  </SvgText>
                  <SvgText
                    x="5"
                    y={GRAPH_HEIGHT - GRAPH_PADDING + 5}
                    fill={isDark ? "#9ca3af" : "#6b7280"}
                    fontSize="12"
                  >
                    {graphData.minWeight.toFixed(0)}
                  </SvgText>
                </Svg>

                {/* Legend */}
                <View className="flex-row items-center justify-center mt-4 space-x-4">
                  <View className="flex-row items-center">
                    <View className="w-4 h-4 rounded-full bg-green-500 mr-2" />
                    <Text className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                      Your Weight
                    </Text>
                  </View>
                  {targetWeight && (
                    <View className="flex-row items-center">
                      <View className="w-4 h-1 bg-blue-500 mr-2" style={{ borderStyle: "dashed" }} />
                      <Text className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-600")}>
                        Target
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View className="items-center justify-center py-12">
                <Ionicons name="scale-outline" size={64} color={isDark ? "#4b5563" : "#9ca3af"} />
                <Text className={cn("text-base mt-4 text-center", isDark ? "text-gray-400" : "text-gray-600")}>
                  No weight data yet.{"\n"}Start tracking your progress!
                </Text>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Log Weight Button */}
        <View className="px-6 mb-4">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsModalVisible(true);
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
            <Text className="text-white text-lg font-bold ml-2">Log Weight</Text>
          </Pressable>
        </View>

        {/* Weight History */}
        {sortedEntries.length > 0 && (
          <View className="px-6 mb-6">
            <Text className={cn("text-xl font-bold mb-4", isDark ? "text-white" : "text-black")}>
              History
            </Text>
            {[...sortedEntries].reverse().map((entry) => (
              <Animated.View
                key={entry.id}
                entering={FadeInDown}
                className={cn("rounded-2xl p-4 mb-3 flex-row items-center justify-between", isDark ? "bg-[#1a1a1a]" : "bg-white")}
                style={{
                  shadowColor: isDark ? "#000" : "#1f2937",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.2 : 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="flex-1">
                  <Text className={cn("text-2xl font-bold", isDark ? "text-white" : "text-black")}>
                    {entry.weight.toFixed(1)} kg
                  </Text>
                  <Text className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-gray-600")}>
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleDeleteEntry(entry.id)}
                  className="p-2"
                >
                  <Ionicons name="trash-outline" size={24} color="#ef4444" />
                </Pressable>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Log Weight Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-gray-50")}>
          <View className="flex-1">
            {/* Header */}
            <View
              className="flex-row items-center justify-between px-6 py-4 border-b"
              style={{ borderBottomColor: isDark ? "#1f1f1f" : "#e5e7eb" }}
            >
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setIsModalVisible(false);
                }}
              >
                <Ionicons name="close" size={28} color={isDark ? "#fff" : "#000"} />
              </Pressable>
              <Text className={cn("text-xl font-bold", isDark ? "text-white" : "text-black")}>
                Log Weight
              </Text>
              <View style={{ width: 28 }} />
            </View>

            <View className="flex-1 px-6 pt-8">
              {/* Weight Input */}
              <View className="mb-6">
                <Text className={cn("text-sm font-semibold mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                  Weight (kg)
                </Text>
                <TextInput
                  value={weightInput}
                  onChangeText={setWeightInput}
                  placeholder="Enter your weight"
                  keyboardType="decimal-pad"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  className={cn("rounded-xl p-4 text-2xl font-bold", isDark ? "bg-[#1a1a1a] text-white" : "bg-gray-100 text-gray-900")}
                  autoFocus
                />
              </View>

              {/* Date Display */}
              <View className="mb-6">
                <Text className={cn("text-sm font-semibold mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                  Date
                </Text>
                <View
                  className={cn("rounded-xl p-4", isDark ? "bg-[#1a1a1a]" : "bg-gray-100")}
                >
                  <Text className={cn("text-base", isDark ? "text-white" : "text-gray-900")}>
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <Text className={cn("text-xs mt-2", isDark ? "text-gray-500" : "text-gray-500")}>
                  Automatically set to today
                </Text>
              </View>

              {/* Log Button */}
              <Pressable
                onPress={handleLogWeight}
                className="bg-blue-500 py-4 rounded-2xl"
                disabled={!weightInput || parseFloat(weightInput) <= 0}
                style={{
                  opacity: !weightInput || parseFloat(weightInput) <= 0 ? 0.5 : 1,
                }}
              >
                <Text className="text-white font-bold text-center text-lg">Log Weight</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
