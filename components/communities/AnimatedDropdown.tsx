import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hapticLight, hapticSelection } from '../../src/utils/haptics';

interface DropdownOption {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface AnimatedDropdownProps {
  label: string;
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  persistKey?: string; // Key for AsyncStorage persistence
  communityId?: string; // To persist per community
  isDark?: boolean;
  disabled?: boolean;
}

export function AnimatedDropdown({
  label,
  options,
  selectedValue,
  onSelect,
  persistKey,
  communityId,
  isDark = false,
  disabled = false,
}: AnimatedDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(selectedValue);

  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  // Load persisted value on mount
  useEffect(() => {
    if (persistKey && communityId) {
      loadPersistedValue();
    }
  }, [persistKey, communityId]);

  // Update internal value when prop changes
  useEffect(() => {
    setInternalValue(selectedValue);
  }, [selectedValue]);

  const loadPersistedValue = async () => {
    try {
      const storageKey = `dropdown_${persistKey}_${communityId}`;
      const saved = await AsyncStorage.getItem(storageKey);
      if (saved) {
        setInternalValue(saved);
        onSelect(saved);
      }
    } catch (error) {
      console.error('Failed to load persisted dropdown value:', error);
    }
  };

  const savePersistedValue = async (value: string) => {
    try {
      if (persistKey && communityId) {
        const storageKey = `dropdown_${persistKey}_${communityId}`;
        await AsyncStorage.setItem(storageKey, value);
      }
    } catch (error) {
      console.error('Failed to save dropdown value:', error);
    }
  };

  const handleToggle = () => {
    if (disabled) return;

    hapticLight();
    setIsOpen(!isOpen);

    // Animate icon rotation
    rotation.value = withSpring(isOpen ? 0 : 180, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handleSelect = (value: string) => {
    hapticSelection();
    setInternalValue(value);
    onSelect(value);
    savePersistedValue(value);
    setIsOpen(false);

    // Reset rotation
    rotation.value = withSpring(0, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 150 });
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const selectedOption = options.find((opt) => opt.value === internalValue);

  return (
    <View style={styles.container}>
      {/* Dropdown Button */}
      <Animated.View style={buttonStyle}>
        <Pressable
          onPress={handleToggle}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={[
            styles.button,
            {
              backgroundColor: isDark ? '#374151' : '#f3f4f6',
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <View style={styles.buttonContent}>
            {selectedOption?.icon && (
              <Ionicons
                name={selectedOption.icon}
                size={18}
                color={isDark ? '#d1d5db' : '#4b5563'}
              />
            )}
            <Text
              style={[
                styles.buttonText,
                { color: isDark ? '#ffffff' : '#1f2937' },
              ]}
            >
              {selectedOption?.label || label}
            </Text>
          </View>

          <Animated.View style={iconStyle}>
            <Ionicons
              name="chevron-down"
              size={20}
              color={isDark ? '#9ca3af' : '#6b7280'}
            />
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* Dropdown Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleToggle}
      >
        <Pressable style={styles.modalOverlay} onPress={handleToggle}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Animated.View
              entering={SlideInDown.duration(300).springify()}
              style={[
                styles.dropdown,
                { backgroundColor: isDark ? '#1f2937' : '#ffffff' },
              ]}
            >
              <View style={styles.dropdownHeader}>
                <Text
                  style={[
                    styles.dropdownTitle,
                    { color: isDark ? '#ffffff' : '#1f2937' },
                  ]}
                >
                  {label}
                </Text>
                <Pressable onPress={handleToggle} style={styles.closeButton}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={isDark ? '#9ca3af' : '#6b7280'}
                  />
                </Pressable>
              </View>

              <ScrollView style={styles.optionsList}>
                {options.map((option, index) => {
                  const isSelected = option.value === internalValue;

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => handleSelect(option.value)}
                      style={[
                        styles.option,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? 'rgba(59, 130, 246, 0.15)'
                              : 'rgba(59, 130, 246, 0.1)'
                            : 'transparent',
                        },
                        index === 0 && styles.firstOption,
                      ]}
                    >
                      <View style={styles.optionContent}>
                        {option.icon && (
                          <Ionicons
                            name={option.icon}
                            size={20}
                            color={
                              isSelected
                                ? '#3b82f6'
                                : isDark
                                ? '#d1d5db'
                                : '#4b5563'
                            }
                          />
                        )}
                        <Text
                          style={[
                            styles.optionText,
                            {
                              color: isSelected
                                ? '#3b82f6'
                                : isDark
                                ? '#ffffff'
                                : '#1f2937',
                            },
                            isSelected && styles.optionTextSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </View>

                      {isSelected && (
                        <Ionicons name="checkmark" size={24} color="#3b82f6" />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// Keyboard accessible version (for web)
export function KeyboardAccessibleDropdown(props: AnimatedDropdownProps) {
  // On mobile, use the AnimatedDropdown
  // On web, this could be enhanced with keyboard navigation
  return <AnimatedDropdown {...props} />;
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  dropdown: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.2)',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  optionsList: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(156, 163, 175, 0.1)',
  },
  firstOption: {
    borderTopWidth: 0,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionText: {
    fontSize: 16,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
});
