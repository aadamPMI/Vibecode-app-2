import React, { useEffect } from 'react';
import { View, Text, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useToastStore } from '../state/toastStore';
import { useSettingsStore } from '../state/settingsStore';
import { cn } from '../utils/cn';

export function Toast() {
  const { message, type, visible, hideToast } = useToastStore();
  const theme = useSettingsStore((s: any) => s.theme);
  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === 'system' ? (systemColorScheme || 'light') : theme;
  const isDark = resolvedTheme === 'dark';

  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(hideToast)();
        });
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible && opacity.value === 0) return null;

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      default:
        return 'information-circle';
    }
  };

  const getBackgroundColor = () => {
    if (type === 'success') {
      return isDark ? 'bg-green-600' : 'bg-green-500';
    } else if (type === 'error') {
      return isDark ? 'bg-red-600' : 'bg-red-500';
    } else {
      return isDark ? 'bg-blue-600' : 'bg-blue-500';
    }
  };

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          top: 60,
          left: 16,
          right: 16,
          zIndex: 9999,
        },
      ]}
    >
      <View
        className={cn('flex-row items-center px-4 py-3 rounded-lg', getBackgroundColor())}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name={getIconName() as any} size={24} color="#fff" />
        <Text className="flex-1 ml-3 text-white font-medium">{message}</Text>
      </View>
    </Animated.View>
  );
}
