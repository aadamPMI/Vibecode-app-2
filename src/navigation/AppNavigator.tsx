import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import WorkoutScreen from "../screens/WorkoutScreen";
import NutritionScreen from "../screens/NutritionScreen";
import CommunityScreen from "../screens/CommunityScreen";
import MyCommunitiesScreen from "../screens/MyCommunitiesScreen";
import SettingsScreen from "../screens/SettingsScreen";
import WeightTrackingScreen from "../screens/WeightTrackingScreen";
import { useSettingsStore } from "../state/settingsStore";
import { useAuthStore } from "../state/authStore";
import OnboardingNavigator from "./OnboardingNavigator";

// Wrapper components with fade animations
const AnimatedNutritionScreen = () => (
  <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={{ flex: 1 }}>
    <NutritionScreen />
  </Animated.View>
);

const AnimatedSettingsScreen = () => (
  <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={{ flex: 1 }}>
    <SettingsScreen />
  </Animated.View>
);

export type RootTabParamList = {
  WorkoutStack: undefined;
  Nutrition: undefined;
  CommunityStack: undefined;
  Settings: undefined;
};

export type WorkoutStackParamList = {
  Workout: undefined;
  WeightTracking: undefined;
};

export type CommunityStackParamList = {
  Community: { openCommunity?: any };
  MyCommunities: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const WorkoutStack = createNativeStackNavigator<WorkoutStackParamList>();
const CommunityStack = createNativeStackNavigator<CommunityStackParamList>();

function WorkoutStackNavigator() {
  return (
    <WorkoutStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: 200,
      }}
    >
      <WorkoutStack.Screen name="Workout" component={WorkoutScreen} />
      <WorkoutStack.Screen name="WeightTracking" component={WeightTrackingScreen} />
    </WorkoutStack.Navigator>
  );
}

// Animated wrapper for workout stack
const AnimatedWorkoutStack = () => (
  <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={{ flex: 1 }}>
    <WorkoutStackNavigator />
  </Animated.View>
);

function CommunityStackNavigator() {
  return (
    <CommunityStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: 200,
      }}
    >
      <CommunityStack.Screen name="Community" component={CommunityScreen} />
      <CommunityStack.Screen name="MyCommunities" component={MyCommunitiesScreen} />
    </CommunityStack.Navigator>
  );
}

// Animated wrapper for community stack
const AnimatedCommunityStack = () => (
  <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={{ flex: 1 }}>
    <CommunityStackNavigator />
  </Animated.View>
);

export default function AppNavigator() {
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === "dark";
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);

  // Show onboarding flow if user has not completed it
  if (!hasCompletedOnboarding) {
    return <OnboardingNavigator />;
  }

  // Show main app navigation after onboarding is complete
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "WorkoutStack") {
            iconName = focused ? "barbell" : "barbell-outline";
          } else if (route.name === "Nutrition") {
            iconName = focused ? "nutrition" : "nutrition-outline";
          } else if (route.name === "CommunityStack") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: isDark ? "#9ca3af" : "#6b7280",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#0a0a0a" : "#ffffff",
          borderTopColor: isDark ? "#1f1f1f" : "#e5e7eb",
          borderTopWidth: 1,
        },
      })}
    >
      <Tab.Screen 
        name="WorkoutStack" 
        component={AnimatedWorkoutStack}
        options={{
          tabBarLabel: "Workout",
        }}
      />
      <Tab.Screen name="Nutrition" component={AnimatedNutritionScreen} />
      <Tab.Screen 
        name="CommunityStack" 
        component={AnimatedCommunityStack}
        options={{
          tabBarLabel: "Community",
        }}
      />
      <Tab.Screen name="Settings" component={AnimatedSettingsScreen} />
    </Tab.Navigator>
  );
}
