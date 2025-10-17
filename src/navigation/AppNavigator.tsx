import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import WorkoutScreen from "../screens/WorkoutScreen";
import NutritionScreen from "../screens/NutritionScreen";
import CommunityScreen from "../screens/CommunityScreen";
import MyCommunitiesScreen from "../screens/MyCommunitiesScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { useSettingsStore } from "../state/settingsStore";

export type RootTabParamList = {
  Workout: undefined;
  Nutrition: undefined;
  CommunityStack: undefined;
  Settings: undefined;
};

export type CommunityStackParamList = {
  Community: { openCommunity?: any };
  MyCommunities: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const CommunityStack = createNativeStackNavigator<CommunityStackParamList>();

function CommunityStackNavigator() {
  return (
    <CommunityStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <CommunityStack.Screen name="Community" component={CommunityScreen} />
      <CommunityStack.Screen name="MyCommunities" component={MyCommunitiesScreen} />
    </CommunityStack.Navigator>
  );
}

export default function AppNavigator() {
  const theme = useSettingsStore((s) => s.theme);
  const isDark = theme === "dark";

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          if (route.name === "Workout") {
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
          backgroundColor: isDark ? "#1f2937" : "#ffffff",
          borderTopColor: isDark ? "#374151" : "#e5e7eb",
          borderTopWidth: 1,
        },
      })}
    >
      <Tab.Screen name="Workout" component={WorkoutScreen} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} />
      <Tab.Screen 
        name="CommunityStack" 
        component={CommunityStackNavigator}
        options={{
          tabBarLabel: "Community",
        }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
