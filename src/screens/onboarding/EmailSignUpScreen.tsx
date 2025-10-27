import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { cn } from "../../utils/cn";
import { signUpWithEmail, signInWithEmail } from "../../lib/supabase-auth";

export default function EmailSignUpScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleAuth = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!password) {
      Alert.alert("Error", "Please enter a password");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (isSignUp && password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isSignUp) {
        // Sign up new user
        const { user, session } = await signUpWithEmail(email.trim(), password);
        console.log("✅ User signed up:", user?.id);
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "Success! 🎉",
          "Account created successfully! Check your email for verification.",
          [
            {
              text: "Continue",
              onPress: () => navigation.navigate("IntroPromo"),
            },
          ]
        );
      } else {
        // Sign in existing user
        const { user, session } = await signInWithEmail(email.trim(), password);
        console.log("✅ User signed in:", user?.id);
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "Welcome back! 👋",
          "You've successfully signed in.",
          [
            {
              text: "Continue",
              onPress: () => navigation.navigate("IntroPromo"),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("❌ Auth error:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let errorMessage = "Something went wrong. Please try again.";
      
      if (error.message?.includes("User already registered")) {
        errorMessage = "This email is already registered. Try signing in instead.";
      } else if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password.";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Please verify your email before signing in.";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSignUp(!isSignUp);
    setPassword("");
    setConfirmPassword("");
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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-between px-6 py-12">
            {/* Header */}
            <View>
              <Animated.View entering={FadeIn.delay(200)} className="mb-8">
                <View
                  className="w-24 h-24 rounded-full items-center justify-center self-center"
                  style={{
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    shadowColor: "#3b82f6",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 20,
                    elevation: 8,
                  }}
                >
                  <Ionicons name="mail" size={48} color="#3b82f6" />
                </View>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(400)}>
                <Text
                  className={cn(
                    "text-4xl font-bold text-center mb-3",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </Text>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(500)}>
                <Text
                  className={cn(
                    "text-base text-center mb-8",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  {isSignUp
                    ? "Sign up to start your fitness journey"
                    : "Sign in to continue your progress"}
                </Text>
              </Animated.View>

              {/* Email Input */}
              <Animated.View entering={FadeInDown.delay(600)} className="mb-4">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Email Address
                </Text>
                <View
                  className={cn(
                    "flex-row items-center rounded-2xl px-4 py-4",
                    isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
                  )}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={isDark ? "#9ca3af" : "#6b7280"}
                  />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    className={cn(
                      "flex-1 ml-3 text-base",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  />
                </View>
              </Animated.View>

              {/* Password Input */}
              <Animated.View entering={FadeInDown.delay(700)} className="mb-4">
                <Text
                  className={cn(
                    "text-sm font-semibold mb-2",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  Password
                </Text>
                <View
                  className={cn(
                    "flex-row items-center rounded-2xl px-4 py-4",
                    isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
                  )}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={isDark ? "#9ca3af" : "#6b7280"}
                  />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    className={cn(
                      "flex-1 ml-3 text-base",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  />
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowPassword(!showPassword);
                    }}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                  </Pressable>
                </View>
              </Animated.View>

              {/* Confirm Password (Sign Up only) */}
              {isSignUp && (
                <Animated.View entering={FadeInDown.delay(800)} className="mb-6">
                  <Text
                    className={cn(
                      "text-sm font-semibold mb-2",
                      isDark ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    Confirm Password
                  </Text>
                  <View
                    className={cn(
                      "flex-row items-center rounded-2xl px-4 py-4",
                      isDark ? "bg-[#1a1a1a]" : "bg-gray-100"
                    )}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={isDark ? "#9ca3af" : "#6b7280"}
                    />
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Re-enter your password"
                      placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      className={cn(
                        "flex-1 ml-3 text-base",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    />
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowConfirmPassword(!showConfirmPassword);
                      }}
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={isDark ? "#9ca3af" : "#6b7280"}
                      />
                    </Pressable>
                  </View>
                </Animated.View>
              )}
            </View>

            {/* Bottom Section */}
            <View>
              {/* Auth Button */}
              <Animated.View entering={FadeInDown.delay(900)}>
                <Pressable
                  onPress={handleAuth}
                  disabled={loading}
                  className="rounded-2xl py-4 mb-4"
                  style={{
                    backgroundColor: loading ? "#6b7280" : "#3b82f6",
                    shadowColor: "#3b82f6",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                    elevation: 8,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center text-lg font-bold">
                      {isSignUp ? "Create Account" : "Sign In"}
                    </Text>
                  )}
                </Pressable>
              </Animated.View>

              {/* Toggle Sign In/Sign Up */}
              <Animated.View entering={FadeInDown.delay(1000)}>
                <Pressable onPress={toggleMode} className="py-3">
                  <Text
                    className={cn(
                      "text-center text-base",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    {isSignUp ? "Already have an account? " : "Don't have an account? "}
                    <Text className="text-blue-500 font-semibold">
                      {isSignUp ? "Sign In" : "Sign Up"}
                    </Text>
                  </Text>
                </Pressable>
              </Animated.View>

              {/* Skip for now */}
              <Animated.View entering={FadeInDown.delay(1100)}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate("IntroPromo");
                  }}
                  className="py-3"
                >
                  <Text
                    className={cn(
                      "text-center text-sm",
                      isDark ? "text-gray-500" : "text-gray-500"
                    )}
                  >
                    Skip for now
                  </Text>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

