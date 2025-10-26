// Set Logger Component - Log individual sets with premium UI
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';
import { cn } from '../../utils/cn';
import { workoutTheme } from '../../theme/workoutTheme';
import { springConfigs } from '../../utils/animations';
import { hapticMedium, hapticLight, hapticSuccess } from '../../utils/haptics';
import type { SetLog } from '../../types/workout';

interface SetLoggerProps {
  setNumber: number;
  previousSet?: SetLog;
  suggestedWeight?: number;
  suggestedReps?: number;
  onComplete: (weight: number, reps: number, rpe?: number) => void;
  isDark?: boolean;
  trackRPE?: boolean;
  unit?: 'kg' | 'lbs';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SetLogger: React.FC<SetLoggerProps> = ({
  setNumber,
  previousSet,
  suggestedWeight,
  suggestedReps,
  onComplete,
  isDark = false,
  trackRPE = true,
  unit = 'kg',
}) => {
  const [weight, setWeight] = useState(
    suggestedWeight?.toString() || previousSet?.actualLoad.toString() || ''
  );
  const [reps, setReps] = useState(
    suggestedReps?.toString() || previousSet?.actualReps.toString() || ''
  );
  const [rpe, setRpe] = useState<number>(7);
  const [showRPE, setShowRPE] = useState(false);

  const scale = useSharedValue(1);
  const checkmarkScale = useSharedValue(0);

  const handleComplete = () => {
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps);

    if (isNaN(weightNum) || isNaN(repsNum) || weightNum <= 0 || repsNum <= 0) {
      // Shake animation for invalid input
      scale.value = withSequence(
        withTiming(0.95, { duration: 50 }),
        withTiming(1.05, { duration: 50 }),
        withTiming(0.95, { duration: 50 }),
        withTiming(1, { duration: 50 })
      );
      return;
    }

    // Success animation
    checkmarkScale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(1.3, { duration: 200 }),
      withSpring(1, springConfigs.bouncy)
    );

    hapticSuccess();

    setTimeout(() => {
      onComplete(weightNum, repsNum, trackRPE && showRPE ? rpe : undefined);
    }, 300);
  };

  const incrementWeight = (amount: number) => {
    const current = parseFloat(weight) || 0;
    setWeight((current + amount).toString());
    hapticLight();
  };

  const incrementReps = (amount: number) => {
    const current = parseInt(reps) || 0;
    const newValue = Math.max(0, current + amount);
    setReps(newValue.toString());
    hapticLight();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
    opacity: checkmarkScale.value,
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={[styles.container]}
    >
      <BlurView
        intensity={isDark ? 80 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blur}
      >
        <View
          className={cn(
            'p-6 rounded-3xl',
            isDark ? 'bg-white/5' : 'bg-white/40'
          )}
        >
          {/* Set Number Header */}
          <View style={styles.header}>
            <View
              className={cn(
                'px-4 py-2 rounded-full',
                isDark ? 'bg-blue-500/20' : 'bg-blue-500/20'
              )}
            >
              <Text className="text-blue-500 font-bold">
                Set {setNumber}
              </Text>
            </View>
          </View>

          {/* Weight Input */}
          <View style={styles.inputSection}>
            <Text
              className={cn(
                'text-sm font-semibold mb-2',
                isDark ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Weight ({unit})
            </Text>
            
            <View style={styles.inputRow}>
              <Pressable
                onPress={() => incrementWeight(-2.5)}
                className={cn(
                  'w-12 h-12 rounded-2xl items-center justify-center',
                  isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200'
                )}
              >
                <Ionicons
                  name="remove"
                  size={24}
                  color={isDark ? '#fff' : '#000'}
                />
              </Pressable>

              <TextInput
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                className={cn(
                  'flex-1 mx-3 text-center text-3xl font-bold rounded-2xl py-3',
                  isDark ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'
                )}
              />

              <Pressable
                onPress={() => incrementWeight(2.5)}
                className={cn(
                  'w-12 h-12 rounded-2xl items-center justify-center',
                  isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200'
                )}
              >
                <Ionicons
                  name="add"
                  size={24}
                  color={isDark ? '#fff' : '#000'}
                />
              </Pressable>
            </View>

            {/* Quick increments */}
            <View style={styles.quickButtons}>
              {[5, 10, 20].map((amount) => (
                <Pressable
                  key={amount}
                  onPress={() => incrementWeight(amount)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg',
                    isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                  )}
                >
                  <Text className="text-blue-500 text-xs font-bold">
                    +{amount}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Reps Input */}
          <View style={styles.inputSection}>
            <Text
              className={cn(
                'text-sm font-semibold mb-2',
                isDark ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Reps
            </Text>
            
            <View style={styles.inputRow}>
              <Pressable
                onPress={() => incrementReps(-1)}
                className={cn(
                  'w-12 h-12 rounded-2xl items-center justify-center',
                  isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200'
                )}
              >
                <Ionicons
                  name="remove"
                  size={24}
                  color={isDark ? '#fff' : '#000'}
                />
              </Pressable>

              <TextInput
                value={reps}
                onChangeText={setReps}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                className={cn(
                  'flex-1 mx-3 text-center text-3xl font-bold rounded-2xl py-3',
                  isDark ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'
                )}
              />

              <Pressable
                onPress={() => incrementReps(1)}
                className={cn(
                  'w-12 h-12 rounded-2xl items-center justify-center',
                  isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200'
                )}
              >
                <Ionicons
                  name="add"
                  size={24}
                  color={isDark ? '#fff' : '#000'}
                />
              </Pressable>
            </View>
          </View>

          {/* RPE Toggle */}
          {trackRPE && (
            <Pressable
              onPress={() => {
                setShowRPE(!showRPE);
                hapticLight();
              }}
              className={cn(
                'flex-row items-center justify-between p-3 rounded-xl mb-4',
                isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100'
              )}
            >
              <Text
                className={cn(
                  'text-sm font-semibold',
                  isDark ? 'text-white' : 'text-gray-900'
                )}
              >
                Track RPE (difficulty)
              </Text>
              <Ionicons
                name={showRPE ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={showRPE ? '#3b82f6' : (isDark ? '#6b7280' : '#9ca3af')}
              />
            </Pressable>
          )}

          {/* RPE Slider */}
          {trackRPE && showRPE && (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={styles.rpeSection}
            >
              <View style={styles.rpeHeader}>
                <Text
                  className={cn(
                    'text-sm font-semibold',
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  )}
                >
                  Rate of Perceived Exertion
                </Text>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: getRPEColor(rpe) }}
                >
                  <Text className="text-white font-bold">{rpe}</Text>
                </View>
              </View>

              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={0.5}
                value={rpe}
                onValueChange={(value) => {
                  setRpe(value);
                  hapticLight();
                }}
                minimumTrackTintColor="#3b82f6"
                maximumTrackTintColor={isDark ? '#374151' : '#d1d5db'}
                thumbTintColor="#3b82f6"
              />

              <View style={styles.rpeLabels}>
                <Text className={cn('text-xs', isDark ? 'text-gray-500' : 'text-gray-600')}>
                  Easy
                </Text>
                <Text className={cn('text-xs', isDark ? 'text-gray-500' : 'text-gray-600')}>
                  Hard
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Complete Button */}
          <AnimatedPressable
            onPress={handleComplete}
            style={[animatedStyle, styles.completeButton]}
          >
            <LinearGradient
              colors={workoutTheme.colors.success.colors as unknown as readonly [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.completeGradient}
            >
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text style={styles.completeText}>Complete Set</Text>
            </LinearGradient>
          </AnimatedPressable>

          {/* Success Checkmark Overlay */}
          <Animated.View style={[styles.checkmarkOverlay, checkmarkStyle]}>
            <View style={styles.checkmarkCircle}>
              <Ionicons name="checkmark" size={60} color="white" />
            </View>
          </Animated.View>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const getRPEColor = (rpe: number): string => {
  if (rpe <= 5) return '#22c55e'; // Green - easy
  if (rpe <= 7) return '#f59e0b'; // Yellow - moderate
  if (rpe <= 8.5) return '#f97316'; // Orange - hard
  return '#ef4444'; // Red - very hard
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  blur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  rpeSection: {
    marginBottom: 20,
  },
  rpeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rpeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  completeButton: {
    borderRadius: 20,
    overflow: 'hidden',
    ...workoutTheme.shadows.glow.success,
  },
  completeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  completeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  checkmarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
});

