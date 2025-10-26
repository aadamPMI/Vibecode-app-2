import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { hapticLight, hapticMedium } from '../../src/utils/haptics';

interface FABAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

interface EnhancedFABProps {
  actions: FABAction[];
  isDark?: boolean;
}

export function EnhancedFAB({ actions, isDark = false }: EnhancedFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLabels, setShowLabels] = useState(false);

  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const handlePress = () => {
    hapticMedium();
    setIsExpanded(!isExpanded);

    rotation.value = withSpring(isExpanded ? 0 : 135, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handleLongPress = () => {
    if (!isExpanded) {
      hapticLight();
      handlePress();
    }
    setShowLabels(true);
  };

  const handleActionPress = (action: FABAction) => {
    hapticLight();
    action.onPress();
    handleClose();
  };

  const handleClose = () => {
    setIsExpanded(false);
    setShowLabels(false);
    rotation.value = withSpring(0, {
      damping: 15,
      stiffness: 150,
    });
  };

  const fabStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <>
      {/* Backdrop + Overlay */}
      {isExpanded && (
        <Modal transparent visible={isExpanded} animationType="none">
          <Pressable style={styles.backdrop} onPress={handleClose}>
            <BlurView
              intensity={10}
              style={StyleSheet.absoluteFill}
              tint={isDark ? 'dark' : 'light'}
            />
          </Pressable>
        </Modal>
      )}

      {/* Action Buttons */}
      {isExpanded && (
        <View style={styles.actionsContainer} pointerEvents="box-none">
          {actions.map((action, index) => (
            <ActionButton
              key={action.label}
              action={action}
              index={index}
              onPress={() => handleActionPress(action)}
              showLabel={showLabels}
              isDark={isDark}
            />
          ))}
        </View>
      )}

      {/* Main FAB */}
      <Animated.View style={[styles.fab, fabStyle]}>
        <Pressable
          onPress={handlePress}
          onLongPress={handleLongPress}
          onPressIn={() => {
            scale.value = withTiming(0.9, { duration: 100 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 10, stiffness: 150 });
          }}
          delayLongPress={500}
          style={styles.fabPressable}
        >
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6'] as unknown as readonly [string, string, ...string[]]}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add" size={28} color="white" />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </>
  );
}

interface ActionButtonProps {
  action: FABAction;
  index: number;
  onPress: () => void;
  showLabel: boolean;
  isDark: boolean;
}

function ActionButton({ action, index, onPress, showLabel, isDark }: ActionButtonProps) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const labelOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  React.useEffect(() => {
    // Staggered entrance animation
    const delay = index * 50;

    translateY.value = withDelay(
      delay,
      withSpring(-70 * (index + 1), {
        damping: 15,
        stiffness: 150,
      })
    );

    scale.value = withDelay(
      delay,
      withSpring(1, {
        damping: 12,
        stiffness: 150,
      })
    );
  }, [index]);

  React.useEffect(() => {
    if (showLabel) {
      labelOpacity.value = withDelay(
        index * 30,
        withTiming(1, { duration: 200 })
      );
    } else {
      labelOpacity.value = withTiming(0, { duration: 100 });
    }
  }, [showLabel, index]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value * buttonScale.value },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  return (
    <Animated.View style={[styles.actionButton, buttonStyle]}>
      {showLabel && (
        <Animated.View
          style={[
            styles.labelContainer,
            { backgroundColor: isDark ? '#1f2937' : '#ffffff' },
            labelStyle,
          ]}
        >
          <Text
            style={[
              styles.labelText,
              { color: isDark ? '#ffffff' : '#1f2937' },
            ]}
          >
            {action.label}
          </Text>
        </Animated.View>
      )}

      <Pressable
        onPress={onPress}
        onPressIn={() => {
          buttonScale.value = withTiming(0.9, { duration: 100 });
        }}
        onPressOut={() => {
          buttonScale.value = withSpring(1, { damping: 10, stiffness: 150 });
        }}
        style={styles.actionButtonPressable}
      >
        <View
          style={[
            styles.actionButtonCircle,
            { backgroundColor: action.color },
          ]}
        >
          <Ionicons name={action.icon} size={24} color="white" />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabPressable: {
    width: '100%',
    height: '100%',
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  actionButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButtonPressable: {
    width: 56,
    height: 56,
  },
  actionButtonCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  labelContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  labelText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
