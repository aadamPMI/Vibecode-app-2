import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/onboarding/WelcomeScreen";
import IntroPromoScreen from "../screens/onboarding/IntroPromoScreen";
import GenderScreen from "../screens/onboarding/GenderScreen";
import WorkoutFrequencyScreen from "../screens/onboarding/WorkoutFrequencyScreen";
import ExperienceLevelScreen from "../screens/onboarding/ExperienceLevelScreen";
import EquipmentAccessScreen from "../screens/onboarding/EquipmentAccessScreen";
import MotivationPromoScreen from "../screens/onboarding/MotivationPromoScreen";
import HeightWeightScreen from "../screens/onboarding/HeightWeightScreen";
import AgeScreen from "../screens/onboarding/AgeScreen";
import FitnessGoalScreen from "../screens/onboarding/FitnessGoalScreen";
import ProgressProjectionScreen from "../screens/onboarding/ProgressProjectionScreen";
import CommunityScreen from "../screens/onboarding/CommunityScreen";
import ExistingPlansScreen from "../screens/onboarding/ExistingPlansScreen";
import FinalPromoScreen from "../screens/onboarding/FinalPromoScreen";
import ProgramPreviewScreen from "../screens/onboarding/ProgramPreviewScreen";
import GeneratingScreen from "../screens/onboarding/GeneratingScreen";
import PlanSummaryScreen from "../screens/onboarding/PlanSummaryScreen";
import ReadyScreen from "../screens/onboarding/ReadyScreen";

export type OnboardingStackParamList = {
  Welcome: undefined;
  IntroPromo: undefined;
  Gender: undefined;
  WorkoutFrequency: undefined;
  ExperienceLevel: undefined;
  EquipmentAccess: undefined;
  MotivationPromo: undefined;
  HeightWeight: undefined;
  Age: undefined;
  FitnessGoal: undefined;
  ProgressProjection: undefined;
  Community: undefined;
  ExistingPlans: undefined;
  FinalPromo: undefined;
  ProgramPreview: undefined;
  Generating: undefined;
  PlanSummary: undefined;
  Ready: undefined;
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
      <Stack.Screen name="IntroPromo" component={IntroPromoScreen} />
      <Stack.Screen name="Gender" component={GenderScreen} />
      <Stack.Screen name="WorkoutFrequency" component={WorkoutFrequencyScreen} />
      <Stack.Screen name="ExperienceLevel" component={ExperienceLevelScreen} />
      <Stack.Screen name="EquipmentAccess" component={EquipmentAccessScreen} />
      <Stack.Screen name="MotivationPromo" component={MotivationPromoScreen} />
      <Stack.Screen name="HeightWeight" component={HeightWeightScreen} />
      <Stack.Screen name="Age" component={AgeScreen} />
      <Stack.Screen name="FitnessGoal" component={FitnessGoalScreen} />
      <Stack.Screen name="ProgressProjection" component={ProgressProjectionScreen} />
      <Stack.Screen name="Community" component={CommunityScreen} />
      <Stack.Screen name="ExistingPlans" component={ExistingPlansScreen} />
      <Stack.Screen name="FinalPromo" component={FinalPromoScreen} />
      <Stack.Screen name="ProgramPreview" component={ProgramPreviewScreen} />
      <Stack.Screen name="Generating" component={GeneratingScreen} />
      <Stack.Screen name="PlanSummary" component={PlanSummaryScreen} />
      <Stack.Screen name="Ready" component={ReadyScreen} />
    </Stack.Navigator>
  );
}
