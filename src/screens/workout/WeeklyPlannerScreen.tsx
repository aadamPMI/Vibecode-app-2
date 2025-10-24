// Weekly Planner Screen - 7-day workout planner with drag-and-drop reordering
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, useColorScheme, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn, useAnimatedStyle, useSharedValue, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { cn } from '../../utils/cn';
import { useSettingsStore } from '../../state/settingsStore';
import { useTrainingStore } from '../../state/trainingStore';
import { PremiumBackground } from '../../components/PremiumBackground';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { WeeklyPlannerDay } from '../../types/workout';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeeklyPlannerScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === 'system' ? (systemColorScheme || 'light') : theme;
  const isDark = resolvedTheme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const activeProgram = useTrainingStore((state) => state.activeProgram);
  const updateProgram = useTrainingStore((state) => state.updateProgram);

  // Initialize weekly plan from active program
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlannerDay[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Shared values for drag state across all items
  const draggingIndex = useSharedValue(-1);
  const dragOffset = useSharedValue(0);

  useEffect(() => {
    if (!activeProgram) {
      navigation.replace('SelectActiveProgram');
      return;
    }

    // Initialize the weekly plan from the program's rotation pattern
    const plan: WeeklyPlannerDay[] = WEEKDAYS.map((dayLabel, index) => {
      const weekday = index + 1; // 1=Mon, 7=Sun

      // Check if this day exceeds the program's days per week
      const isRestDay = index >= activeProgram.split.daysPerWeek;

      if (isRestDay) {
        // Automatic rest day for non-training days
        return {
          weekday,
          dayLabel,
          type: 'rest',
          workoutName: undefined,
          workoutTemplateId: undefined,
        };
      }

      // Get the workout for this training day
      const rotationIndex = index % activeProgram.split.rotationPattern.length;
      const dayName = activeProgram.split.rotationPattern[rotationIndex];

      // Check if this is an explicit rest day in the pattern
      const isExplicitRest = dayName.toLowerCase().includes('rest');

      // Find the corresponding workout template
      const template = !isExplicitRest ? activeProgram.workoutTemplates.find(t =>
        t.name.toLowerCase() === dayName.toLowerCase()
      ) : undefined;

      return {
        weekday,
        dayLabel,
        type: isExplicitRest ? 'rest' : 'workout',
        workoutName: isExplicitRest ? undefined : dayName,
        workoutTemplateId: template?.id,
      };
    });

    setWeeklyPlan(plan);
  }, [activeProgram]);

  const handleDayPress = (day: WeeklyPlannerDay) => {
    if (day.type === 'rest') {
      Alert.alert('Rest Day', 'This is a rest day. Take time to recover!');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Navigate to workout detail/log screen
    if (day.workoutTemplateId) {
      navigation.navigate('ActiveWorkout', {
        templateId: day.workoutTemplateId,
        dayName: day.workoutName
      });
    }
  };

  const handleReorderDays = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newPlan = [...weeklyPlan];
    const [movedDay] = newPlan.splice(fromIndex, 1);
    newPlan.splice(toIndex, 0, movedDay);

    // Update weekday numbers to match new positions
    const updatedPlan = newPlan.map((day, index) => ({
      ...day,
      weekday: index + 1,
      dayLabel: WEEKDAYS[index],
    }));

    setWeeklyPlan(updatedPlan);

    // Persist to store immediately
    if (activeProgram) {
      // Build new rotation pattern from the updated plan
      const newRotationPattern = updatedPlan
        .filter(day => day.type === 'workout')
        .map(day => day.workoutName || '');

      // Update the program with the new rotation pattern
      const updatedProgram = {
        ...activeProgram,
        split: {
          ...activeProgram.split,
          rotationPattern: newRotationPattern,
        },
        updatedAt: new Date().toISOString(),
      };

      // Save to store
      updateProgram(activeProgram.id, updatedProgram);
    }
  };

  const toggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(!isExpanded);
  };

  if (!activeProgram) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className={cn('flex-1', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
        <PremiumBackground theme={theme} variant="workout" />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-6 pb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Pressable onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={28} color={isDark ? '#fff' : '#000'} />
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('SelectActiveProgram')}
                className={cn('px-4 py-2 rounded-full', isDark ? 'bg-purple-500/20' : 'bg-purple-100')}
              >
                <Text className={cn('text-sm font-bold', isDark ? 'text-purple-400' : 'text-purple-600')}>
                  Change Program
                </Text>
              </Pressable>
            </View>

            <Text className={cn('text-4xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
              {activeProgram.name}
            </Text>
            <Text className={cn('text-base', isDark ? 'text-gray-400' : 'text-gray-600')}>
              Your weekly workout schedule
            </Text>
          </View>

          {/* Weekly Planner Card */}
          <View className="px-6 mb-6">
            <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
              <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} className="rounded-3xl overflow-hidden">
                <View
                  className={cn('p-6', isDark ? 'bg-white/5' : 'bg-white/40')}
                  style={{
                    shadowColor: isDark ? '#000' : '#1f2937',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 16,
                    elevation: 8,
                  }}
                >
                  {/* Header Row */}
                  <Pressable onPress={toggleExpanded} className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <View className={cn('w-12 h-12 rounded-2xl items-center justify-center mr-3', isDark ? 'bg-purple-500/20' : 'bg-purple-100')}>
                        <Ionicons name="calendar" size={24} color="#a855f7" />
                      </View>
                      <View>
                        <Text className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-black')}>
                          Weekly Plan
                        </Text>
                        <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                          {weeklyPlan.filter(d => d.type === 'workout').length} workouts this week
                        </Text>
                      </View>
                    </View>
                    <Animated.View
                      style={{
                        transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
                      }}
                    >
                      <Ionicons name="chevron-down" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                    </Animated.View>
                  </Pressable>

                  {/* Weekly Days List */}
                  {isExpanded && (
                    <Animated.View entering={FadeIn.duration(300)}>
                      <View className="gap-3">
                        {weeklyPlan.map((day, index) => (
                          <DayRow
                            key={`${day.weekday}-${index}`}
                            day={day}
                            index={index}
                            isDark={isDark}
                            onPress={() => handleDayPress(day)}
                            onReorder={handleReorderDays}
                            draggingIndex={draggingIndex}
                            dragOffset={dragOffset}
                          />
                        ))}
                      </View>

                      {/* Instructions */}
                      <View className="mt-6 pt-4 border-t" style={{ borderTopColor: isDark ? '#374151' : '#e5e7eb' }}>
                        <View className="flex-row items-start">
                          <Ionicons name="information-circle" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                          <Text className={cn('text-xs ml-2 flex-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                            Long press and drag days to reorder your weekly schedule
                          </Text>
                        </View>
                      </View>
                    </Animated.View>
                  )}
                </View>
              </BlurView>
            </Animated.View>
          </View>

          {/* Quick Stats */}
          <View className="px-6 mb-6">
            <Text className={cn('text-lg font-bold mb-3', isDark ? 'text-white' : 'text-black')}>
              Program Overview
            </Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                  <View className={cn('p-4', isDark ? 'bg-blue-500/10' : 'bg-blue-50')}>
                    <Ionicons name="barbell" size={24} color="#3b82f6" />
                    <Text className={cn('text-2xl font-bold mt-2', isDark ? 'text-white' : 'text-black')}>
                      {activeProgram.split.daysPerWeek}
                    </Text>
                    <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      Days/Week
                    </Text>
                  </View>
                </BlurView>
              </View>
              <View className="flex-1">
                <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                  <View className={cn('p-4', isDark ? 'bg-purple-500/10' : 'bg-purple-50')}>
                    <Ionicons name="fitness" size={24} color="#a855f7" />
                    <Text className={cn('text-2xl font-bold mt-2', isDark ? 'text-white' : 'text-black')}>
                      {activeProgram.workoutTemplates.length}
                    </Text>
                    <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                      Workouts
                    </Text>
                  </View>
                </BlurView>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// Day Row Component with Drag-and-Drop
interface DayRowProps {
  day: WeeklyPlannerDay;
  index: number;
  isDark: boolean;
  onPress: () => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  draggingIndex: Animated.SharedValue<number>;
  dragOffset: Animated.SharedValue<number>;
}

function DayRow({ day, index, isDark, onPress, onReorder, draggingIndex, dragOffset }: DayRowProps) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const isDragging = useSharedValue(false);

  const ITEM_HEIGHT = 80;

  // Simultaneous long press and pan gesture
  const longPress = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      isDragging.value = true;
      draggingIndex.value = index;
      scale.value = withSpring(1.05);
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
    });

  const pan = Gesture.Pan()
    .activeOffsetY([-10, 10])
    .onUpdate((event) => {
      if (isDragging.value) {
        translateY.value = event.translationY;
        dragOffset.value = event.translationY;

        // Calculate which position we're dragging to
        const offset = Math.round(translateY.value / ITEM_HEIGHT);

        // Provide haptic feedback when crossing item boundaries
        if (Math.abs(translateY.value % ITEM_HEIGHT) < 10 && offset !== 0) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    })
    .onEnd(() => {
      if (isDragging.value) {
        const offset = Math.round(translateY.value / ITEM_HEIGHT);
        const newIndex = Math.max(0, Math.min(6, index + offset));

        if (newIndex !== index) {
          runOnJS(onReorder)(index, newIndex);
        }

        isDragging.value = false;
        draggingIndex.value = -1;
        dragOffset.value = 0;
        scale.value = withSpring(1);
        translateY.value = withSpring(0);
      }
    });

  // Combine gestures: long press activates dragging, pan handles the drag
  const gesture = Gesture.Simultaneous(longPress, pan);

  const animatedStyle = useAnimatedStyle(() => {
    // Calculate if this item should be displaced
    const isDraggedItem = draggingIndex.value === index;
    const draggedItemIndex = draggingIndex.value;

    if (isDraggedItem) {
      // This is the item being dragged
      return {
        transform: [
          { translateY: translateY.value },
          { scale: scale.value },
        ],
        zIndex: 1000,
        opacity: withTiming(0.8, { duration: 200 }),
      };
    } else if (draggedItemIndex !== -1) {
      // This item is not being dragged, but another item is being dragged
      const offset = Math.round(dragOffset.value / ITEM_HEIGHT);
      const targetIndex = draggedItemIndex + offset;

      let displacement = 0;

      // If the dragged item is moving down and passes this item
      if (draggedItemIndex < index && targetIndex >= index) {
        displacement = -ITEM_HEIGHT;
      }
      // If the dragged item is moving up and passes this item
      else if (draggedItemIndex > index && targetIndex <= index) {
        displacement = ITEM_HEIGHT;
      }

      return {
        transform: [
          { translateY: withSpring(displacement, { damping: 20, stiffness: 300 }) },
          { scale: 1 },
        ],
        zIndex: 1,
        opacity: 1,
      };
    }

    // Default state - no drag happening
    return {
      transform: [
        { translateY: 0 },
        { scale: 1 },
      ],
      zIndex: 1,
      opacity: 1,
    };
  });

  const isRestDay = day.type === 'rest';

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        <Pressable onPress={onPress}>
          <View
            className={cn(
              'rounded-2xl p-4 flex-row items-center justify-between mb-3',
              isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100'
            )}
            style={{
              shadowColor: isDark ? '#000' : '#1f2937',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center flex-1">
              {/* Drag Handle */}
              <View className="mr-3">
                <Ionicons name="reorder-two" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
              </View>

              {/* Day Label */}
              <View className={cn('w-12 h-12 rounded-full items-center justify-center mr-3',
                isRestDay
                  ? isDark ? 'bg-green-500/20' : 'bg-green-100'
                  : isDark ? 'bg-blue-500/20' : 'bg-blue-100'
              )}>
                <Text className={cn('text-sm font-bold',
                  isRestDay ? 'text-green-500' : 'text-blue-500'
                )}>
                  {day.dayLabel}
                </Text>
              </View>

              {/* Workout Info */}
              <View className="flex-1">
                <Text className={cn('text-base font-bold', isDark ? 'text-white' : 'text-black')}>
                  {isRestDay ? 'Rest Day' : day.workoutName}
                </Text>
                <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  {isRestDay ? 'Recovery & rest' : 'Tap to start workout'}
                </Text>
              </View>
            </View>

            {/* Arrow Icon */}
            {!isRestDay && (
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
            )}
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}
