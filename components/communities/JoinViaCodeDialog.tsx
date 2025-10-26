import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  StyleSheet,
  Keyboard,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { hapticLight, hapticMedium, hapticSuccess, hapticError } from '../../src/utils/haptics';
import * as Clipboard from 'expo-clipboard';

interface JoinViaCodeDialogProps {
  visible: boolean;
  onClose: () => void;
  onJoin: (code: string) => Promise<{ success: boolean; error?: string }>;
  isDark?: boolean;
}

const CODE_LENGTH = 8;
const CODE_PATTERN = /^[A-Z0-9]{8}$/;

export function JoinViaCodeDialog({
  visible,
  onClose,
  onJoin,
  isDark = false,
}: JoinViaCodeDialogProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationState, setValidationState] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const validationTimer = useRef<NodeJS.Timeout | null>(null);

  const scale = useSharedValue(1);
  const checkmarkScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Auto-focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 300);

      // Check clipboard for potential invite code
      checkClipboard();
    } else {
      // Reset state when closed
      setCode('');
      setValidationState('idle');
      setErrorMessage('');
      setIsValidating(false);
    }
  }, [visible]);

  useEffect(() => {
    // Real-time validation with debounce
    if (validationTimer.current) {
      clearTimeout(validationTimer.current);
    }

    if (code.length === 0) {
      setValidationState('idle');
      setErrorMessage('');
      return;
    }

    if (code.length === CODE_LENGTH) {
      setIsValidating(true);

      validationTimer.current = setTimeout(() => {
        validateCode(code);
      }, 500);
    } else {
      setValidationState('idle');
      setErrorMessage('');
    }

    return () => {
      if (validationTimer.current) {
        clearTimeout(validationTimer.current);
      }
    };
  }, [code]);

  const checkClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getStringAsync();

      // Check if clipboard contains a valid-looking code
      if (clipboardContent && CODE_PATTERN.test(clipboardContent.toUpperCase())) {
        // Auto-fill from clipboard
        const formattedCode = clipboardContent.toUpperCase();
        setCode(formattedCode);
        hapticLight();
      }
    } catch (error) {
      console.log('Failed to read clipboard:', error);
    }
  };

  const validateCode = async (codeToValidate: string) => {
    try {
      // Simulate API validation
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Check pattern
      if (!CODE_PATTERN.test(codeToValidate)) {
        setValidationState('invalid');
        setErrorMessage('Invalid code format');
        hapticError();
        return;
      }

      // Simulate checking if code exists (replace with actual API call)
      const isValid = Math.random() > 0.3; // 70% success rate for demo

      if (isValid) {
        setValidationState('valid');
        setErrorMessage('');
        checkmarkScale.value = withSpring(1, { damping: 10, stiffness: 150 });
        hapticSuccess();
      } else {
        setValidationState('invalid');
        setErrorMessage('Invalid or expired code');
        hapticError();
      }
    } catch (error) {
      setValidationState('invalid');
      setErrorMessage('Failed to validate code');
      hapticError();
    } finally {
      setIsValidating(false);
    }
  };

  const handleCodeChange = (text: string) => {
    // Auto-format to uppercase
    const formatted = text.toUpperCase();

    // Only allow alphanumeric characters
    const cleaned = formatted.replace(/[^A-Z0-9]/g, '');

    // Limit to CODE_LENGTH characters
    const limited = cleaned.slice(0, CODE_LENGTH);

    setCode(limited);
    checkmarkScale.value = 0;
  };

  const handlePaste = async () => {
    hapticLight();
    try {
      const clipboardContent = await Clipboard.getStringAsync();
      if (clipboardContent) {
        handleCodeChange(clipboardContent);
      }
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  };

  const handleJoin = async () => {
    if (validationState !== 'valid' || isJoining) return;

    hapticMedium();
    setIsJoining(true);

    try {
      const result = await onJoin(code);

      if (result.success) {
        hapticSuccess();
        onClose();
      } else {
        setValidationState('invalid');
        setErrorMessage(result.error || 'Failed to join community');
        hapticError();
      }
    } catch (error) {
      setValidationState('invalid');
      setErrorMessage('An error occurred');
      hapticError();
    } finally {
      setIsJoining(false);
    }
  };

  const handleClose = () => {
    hapticLight();
    Keyboard.dismiss();
    onClose();
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
    opacity: checkmarkScale.value,
  }));

  const getValidationColor = () => {
    switch (validationState) {
      case 'valid':
        return '#10b981';
      case 'invalid':
        return '#ef4444';
      default:
        return isDark ? '#374151' : '#e5e7eb';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />

        <Pressable
          style={styles.dialogContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <Animated.View
            entering={SlideInDown.duration(400).springify()}
            style={[
              styles.dialog,
              { backgroundColor: isDark ? '#1f2937' : '#ffffff' },
            ]}
          >
            {/* Close Button */}
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
            </Pressable>

            {/* Header */}
            <View style={styles.header}>
              <LinearGradient
                colors={['#3b82f6', '#8b5cf6'] as unknown as readonly [string, string, ...string[]]}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="key" size={32} color="white" />
              </LinearGradient>

              <Text
                style={[
                  styles.title,
                  { color: isDark ? '#ffffff' : '#1f2937' },
                ]}
              >
                Join with Code
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  { color: isDark ? '#9ca3af' : '#6b7280' },
                ]}
              >
                Enter the 8-character invite code to join a community
              </Text>
            </View>

            {/* Code Input */}
            <View style={styles.inputContainer}>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: getValidationColor(),
                    backgroundColor: isDark ? '#374151' : '#f9fafb',
                  },
                ]}
              >
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.input,
                    { color: isDark ? '#ffffff' : '#1f2937' },
                  ]}
                  value={code}
                  onChangeText={handleCodeChange}
                  placeholder="Enter code"
                  placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
                  maxLength={CODE_LENGTH}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoComplete="off"
                  keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'visible-password'}
                />

                {/* Paste Button */}
                {code.length === 0 && (
                  <Pressable onPress={handlePaste} style={styles.pasteButton}>
                    <Ionicons name="clipboard-outline" size={20} color="#3b82f6" />
                    <Text style={styles.pasteText}>Paste</Text>
                  </Pressable>
                )}

                {/* Validation Indicator */}
                {isValidating && (
                  <Animated.View entering={FadeIn.duration(200)}>
                    <Ionicons name="sync" size={20} color="#3b82f6" />
                  </Animated.View>
                )}

                {validationState === 'valid' && (
                  <Animated.View style={checkmarkStyle}>
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  </Animated.View>
                )}

                {validationState === 'invalid' && (
                  <Animated.View entering={FadeIn.duration(200)}>
                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                  </Animated.View>
                )}
              </View>

              {/* Character Count */}
              <Text
                style={[
                  styles.charCount,
                  { color: isDark ? '#6b7280' : '#9ca3af' },
                ]}
              >
                {code.length}/{CODE_LENGTH}
              </Text>

              {/* Error Message */}
              {errorMessage && (
                <Animated.View entering={FadeIn.duration(200)} style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </Animated.View>
              )}
            </View>

            {/* Join Button */}
            <Animated.View style={buttonStyle}>
              <Pressable
                onPress={handleJoin}
                onPressIn={() => {
                  scale.value = withTiming(0.96, { duration: 100 });
                }}
                onPressOut={() => {
                  scale.value = withSpring(1, { damping: 10, stiffness: 150 });
                }}
                disabled={validationState !== 'valid' || isJoining}
                style={[
                  styles.joinButton,
                  validationState !== 'valid' && styles.joinButtonDisabled,
                ]}
              >
                <LinearGradient
                  colors={
                    validationState === 'valid'
                      ? (['#3b82f6', '#8b5cf6'] as const)
                      : (['#6b7280', '#4b5563'] as const)
                  }
                  style={styles.joinButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isJoining ? (
                    <>
                      <Ionicons name="sync" size={20} color="white" />
                      <Text style={styles.joinButtonText}>Joining...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="enter" size={20} color="white" />
                      <Text style={styles.joinButtonText}>Join Community</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dialogContainer: {
    width: '90%',
    maxWidth: 400,
  },
  dialog: {
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
  },
  pasteText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    flex: 1,
    color: '#ef4444',
    fontSize: 13,
  },
  joinButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  joinButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.05,
  },
  joinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
