import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { cn } from "../../utils/cn";
import { useOnboardingStore } from "../../state/onboardingStore";
import { useAuthStore } from "../../state/authStore";

type PlanType = "free" | "premium" | "pro";

interface Plan {
  id: PlanType;
  name: string;
  price: string;
  pricePerMonth?: string;
  features: string[];
  popular?: boolean;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    features: [
      "Basic workout tracking",
      "Limited exercise library",
      "Progress photos",
      "Basic statistics",
    ],
    color: "#6b7280",
    icon: "fitness-outline",
  },
  {
    id: "premium",
    name: "Premium",
    price: "$9.99",
    pricePerMonth: "/month",
    popular: true,
    features: [
      "Everything in Free",
      "AI-powered workout plans",
      "Advanced nutrition tracking",
      "Progressive overload suggestions",
      "Unlimited exercise library",
      "Detailed analytics & insights",
      "Priority support",
    ],
    color: "#3b82f6",
    icon: "star",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19.99",
    pricePerMonth: "/month",
    features: [
      "Everything in Premium",
      "Custom AI coach",
      "Meal planning & recipes",
      "Form check with AI",
      "Community access",
      "1-on-1 support",
      "Early access to features",
    ],
    color: "#8b5cf6",
    icon: "trophy",
  },
];

export default function PaymentScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("premium");
  const { clearOnboardingData } = useOnboardingStore();
  const { completeOnboarding } = useAuthStore();

  const handleSelectPlan = (planId: PlanType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const planName = plans.find((p) => p.id === selectedPlan)?.name || "Free";

    // Mock payment success
    Alert.alert(
      "🎉 Welcome to GainAI!",
      `You've selected the ${planName} plan.\n\n(This is a mock payment screen. In production, you would integrate with Stripe, RevenueCat, or Apple/Google Pay)`,
      [
        {
          text: "Start Training!",
          onPress: () => {
            // Complete onboarding
            completeOnboarding();
            clearOnboardingData();
            // Navigation will be handled automatically by auth state
          },
        },
      ]
    );
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      "Continue with Free?",
      "You can always upgrade later from settings.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Continue Free",
          onPress: () => {
            setSelectedPlan("free");
            setTimeout(() => handleContinue(), 100);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className={cn("flex-1", isDark ? "bg-[#0a0a0a]" : "bg-white")}>
      <LinearGradient
        colors={
          isDark
            ? ["#0a0a0a", "#1a1a2e", "#0a0a0a"]
            : ["#ffffff", "#e0f2fe", "#ffffff"]
        }
        className="absolute inset-0"
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-12">
          {/* Header */}
          <Animated.View entering={FadeIn.delay(200)} className="mb-8">
            <Text
              className={cn(
                "text-4xl font-bold text-center mb-3",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              Choose Your Plan
            </Text>
            <Text
              className={cn(
                "text-base text-center",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
            >
              Start your fitness journey today
            </Text>
          </Animated.View>

          {/* Plans */}
          <View className="flex-1 mb-6">
            {plans.map((plan, index) => (
              <Animated.View
                key={plan.id}
                entering={FadeInDown.delay(300 + index * 100)}
                className="mb-4"
              >
                <Pressable
                  onPress={() => handleSelectPlan(plan.id)}
                  className={cn(
                    "rounded-3xl p-5 relative",
                    selectedPlan === plan.id
                      ? isDark
                        ? "bg-[#1a1a1a]"
                        : "bg-white"
                      : isDark
                      ? "bg-[#111111]"
                      : "bg-gray-50"
                  )}
                  style={{
                    borderWidth: selectedPlan === plan.id ? 2 : 1,
                    borderColor: selectedPlan === plan.id ? plan.color : isDark ? "#2a2a2a" : "#e5e7eb",
                    shadowColor: selectedPlan === plan.id ? plan.color : "transparent",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: selectedPlan === plan.id ? 0.3 : 0,
                    shadowRadius: 12,
                    elevation: selectedPlan === plan.id ? 6 : 0,
                  }}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <View
                      className="absolute -top-3 self-center px-4 py-1 rounded-full"
                      style={{ backgroundColor: plan.color }}
                    >
                      <Text className="text-white text-xs font-bold">MOST POPULAR</Text>
                    </View>
                  )}

                  {/* Header */}
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: `${plan.color}20` }}
                      >
                        <Ionicons name={plan.icon} size={24} color={plan.color} />
                      </View>
                      <View>
                        <Text
                          className={cn(
                            "text-xl font-bold",
                            isDark ? "text-white" : "text-gray-900"
                          )}
                        >
                          {plan.name}
                        </Text>
                        <View className="flex-row items-baseline">
                          <Text
                            className={cn(
                              "text-2xl font-bold",
                              isDark ? "text-white" : "text-gray-900"
                            )}
                          >
                            {plan.price}
                          </Text>
                          {plan.pricePerMonth && (
                            <Text
                              className={cn(
                                "text-sm ml-1",
                                isDark ? "text-gray-400" : "text-gray-600"
                              )}
                            >
                              {plan.pricePerMonth}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Checkmark */}
                    {selectedPlan === plan.id && (
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: plan.color }}
                      >
                        <Ionicons name="checkmark" size={20} color="white" />
                      </View>
                    )}
                  </View>

                  {/* Features */}
                  <View>
                    {plan.features.map((feature, featureIndex) => (
                      <View key={featureIndex} className="flex-row items-center mb-2">
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={plan.color}
                        />
                        <Text
                          className={cn(
                            "text-sm ml-2 flex-1",
                            isDark ? "text-gray-300" : "text-gray-700"
                          )}
                        >
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>

          {/* Bottom Section */}
          <View>
            {/* Continue Button */}
            <Animated.View entering={FadeInDown.delay(700)}>
              <Pressable
                onPress={handleContinue}
                className="rounded-2xl py-4 mb-3"
                style={{
                  backgroundColor: plans.find((p) => p.id === selectedPlan)?.color,
                  shadowColor: plans.find((p) => p.id === selectedPlan)?.color,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Text className="text-white text-center text-lg font-bold">
                  {selectedPlan === "free" ? "Start Free" : "Start Trial"}
                </Text>
              </Pressable>
            </Animated.View>

            {/* Skip */}
            {selectedPlan !== "free" && (
              <Animated.View entering={FadeInDown.delay(800)}>
                <Pressable onPress={handleSkip} className="py-3">
                  <Text
                    className={cn(
                      "text-center text-sm",
                      isDark ? "text-gray-500" : "text-gray-500"
                    )}
                  >
                    Continue with Free plan
                  </Text>
                </Pressable>
              </Animated.View>
            )}

            {/* Mock Notice */}
            <Animated.View entering={FadeInDown.delay(900)}>
              <View className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <View className="flex-row items-center">
                  <Ionicons name="information-circle" size={18} color="#3b82f6" />
                  <Text
                    className={cn(
                      "text-xs ml-2 flex-1",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    This is a demo payment screen. No actual charges will be made.
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

