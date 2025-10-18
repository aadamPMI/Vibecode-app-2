import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/onboarding/WelcomeScreen";
import PersonalInfoScreen from "../screens/onboarding/PersonalInfoScreen";
import WeightScreen from "../screens/onboarding/WeightScreen";
import TimeframeScreen from "../screens/onboarding/TimeframeScreen";
import FitnessGoalScreen from "../screens/onboarding/FitnessGoalScreen";
import TrainingScreen from "../screens/onboarding/TrainingScreen";
import InjuriesScreen from "../screens/onboarding/InjuriesScreen";
import GeneratingScreen from "../screens/onboarding/GeneratingScreen";
import ResultsScreen from "../screens/onboarding/ResultsScreen";

export type OnboardingStackParamList = {
  Welcome: undefined;
  PersonalInfo: undefined;
  Weight: undefined;
  Timeframe: undefined;
  FitnessGoal: undefined;
  Training: undefined;
  Injuries: undefined;
  Generating: undefined;
  Results: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: "fade",
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="Weight" component={WeightScreen} />
      <Stack.Screen name="Timeframe" component={TimeframeScreen} />
      <Stack.Screen name="FitnessGoal" component={FitnessGoalScreen} />
      <Stack.Screen name="Training" component={TrainingScreen} />
      <Stack.Screen name="Injuries" component={InjuriesScreen} />
      <Stack.Screen name="Generating" component={GeneratingScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
    </Stack.Navigator>
  );
}
