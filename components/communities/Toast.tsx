import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onHide: () => void;
  duration?: number;
}

export function Toast({ message, type, onHide, duration = 3000 }: ToastProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Show animation
    translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 200 });

    // Auto hide
    const timer = setTimeout(() => {
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(onHide)();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          colors: ['#10b981', '#059669'] as const,
          bgColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
          borderColor: '#10b981',
        };
      case 'error':
        return {
          icon: 'close-circle' as const,
          colors: ['#ef4444', '#dc2626'] as const,
          bgColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
          borderColor: '#ef4444',
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          colors: ['#f59e0b', '#d97706'] as const,
          bgColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
          borderColor: '#f59e0b',
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          colors: ['#3b82f6', '#2563eb'] as const,
          bgColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
          borderColor: '#3b82f6',
        };
    }
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 16 },
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={config.colors as unknown as readonly [string, string, ...string[]]}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={config.icon} size={20} color="white" />
          </LinearGradient>
        </View>
        <Text
          style={[
            styles.message,
            { color: isDark ? '#ffffff' : '#1f2937' },
          ]}
          numberOfLines={2}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

// Toast Manager Context
interface ToastContextValue {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onHide={() => hideToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

// Quick toast helper functions
export const showSuccessToast = (showToast: (msg: string, type: ToastType) => void, message: string) => {
  showToast(message, 'success');
};

export const showErrorToast = (showToast: (msg: string, type: ToastType) => void, message: string) => {
  showToast(message, 'error');
};

export const showInfoToast = (showToast: (msg: string, type: ToastType) => void, message: string) => {
  showToast(message, 'info');
};

export const showWarningToast = (showToast: (msg: string, type: ToastType) => void, message: string) => {
  showToast(message, 'warning');
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
