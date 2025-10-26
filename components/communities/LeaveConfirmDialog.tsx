import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated, {
  SlideInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { hapticLight, hapticMedium, hapticWarning } from '../../src/utils/haptics';

interface LeaveConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  communityName: string;
  userRole?: 'owner' | 'admin' | 'member';
  memberCount?: number;
  isDark?: boolean;
}

export function LeaveConfirmDialog({
  visible,
  onClose,
  onConfirm,
  communityName,
  userRole = 'member',
  memberCount = 0,
  isDark = false,
}: LeaveConfirmDialogProps) {
  const cancelScale = useSharedValue(1);
  const confirmScale = useSharedValue(1);

  const handleClose = () => {
    hapticLight();
    onClose();
  };

  const handleConfirm = () => {
    hapticMedium();
    onConfirm();
  };

  const cancelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cancelScale.value }],
  }));

  const confirmStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confirmScale.value }],
  }));

  const isOwner = userRole === 'owner';
  const hasOtherMembers = memberCount > 1;

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
            {/* Warning Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#f59e0b', '#ef4444'] as unknown as readonly [string, string, ...string[]]}
                style={styles.iconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="warning" size={40} color="white" />
              </LinearGradient>
            </View>

            {/* Title */}
            <Text
              style={[
                styles.title,
                { color: isDark ? '#ffffff' : '#1f2937' },
              ]}
            >
              Leave Community?
            </Text>

            {/* Description */}
            <Text
              style={[
                styles.description,
                { color: isDark ? '#9ca3af' : '#6b7280' },
              ]}
            >
              Are you sure you want to leave{' '}
              <Text style={styles.communityName}>{communityName}</Text>?
            </Text>

            {/* Owner Transfer Notice */}
            {isOwner && hasOtherMembers && (
              <Animated.View
                entering={SlideInDown.delay(200).duration(400)}
                style={[
                  styles.noticeContainer,
                  {
                    backgroundColor: isDark ? '#374151' : '#fef3c7',
                    borderColor: isDark ? '#4b5563' : '#fbbf24',
                  },
                ]}
              >
                <View style={styles.noticeHeader}>
                  <Ionicons name="star" size={20} color="#f59e0b" />
                  <Text
                    style={[
                      styles.noticeTitle,
                      { color: isDark ? '#fbbf24' : '#92400e' },
                    ]}
                  >
                    Owner Role Transfer Required
                  </Text>
                </View>

                <Text
                  style={[
                    styles.noticeText,
                    { color: isDark ? '#d1d5db' : '#78350f' },
                  ]}
                >
                  As the owner, you must transfer ownership to another member before leaving. The
                  most senior admin will automatically become the new owner.
                </Text>

                {memberCount > 0 && (
                  <View style={styles.noticeInfo}>
                    <Ionicons
                      name="people"
                      size={16}
                      color={isDark ? '#9ca3af' : '#92400e'}
                    />
                    <Text
                      style={[
                        styles.noticeInfoText,
                        { color: isDark ? '#9ca3af' : '#92400e' },
                      ]}
                    >
                      {memberCount - 1} {memberCount - 1 === 1 ? 'member' : 'members'} will
                      remain
                    </Text>
                  </View>
                )}
              </Animated.View>
            )}

            {/* Owner with No Other Members Warning */}
            {isOwner && !hasOtherMembers && (
              <Animated.View
                entering={SlideInDown.delay(200).duration(400)}
                style={[
                  styles.noticeContainer,
                  styles.dangerNotice,
                  {
                    backgroundColor: isDark ? '#7f1d1d' : '#fee2e2',
                    borderColor: isDark ? '#991b1b' : '#f87171',
                  },
                ]}
              >
                <View style={styles.noticeHeader}>
                  <Ionicons name="alert-circle" size={20} color="#ef4444" />
                  <Text
                    style={[
                      styles.noticeTitle,
                      { color: isDark ? '#fca5a5' : '#991b1b' },
                    ]}
                  >
                    Community Will Be Deleted
                  </Text>
                </View>

                <Text
                  style={[
                    styles.noticeText,
                    { color: isDark ? '#fca5a5' : '#991b1b' },
                  ]}
                >
                  You are the only member. Leaving will permanently delete this community and all
                  its data. This action cannot be undone.
                </Text>
              </Animated.View>
            )}

            {/* Consequences List */}
            <View style={styles.consequencesList}>
              <View style={styles.consequenceItem}>
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={isDark ? '#9ca3af' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.consequenceText,
                    { color: isDark ? '#9ca3af' : '#6b7280' },
                  ]}
                >
                  You'll lose access to community content
                </Text>
              </View>

              <View style={styles.consequenceItem}>
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={isDark ? '#9ca3af' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.consequenceText,
                    { color: isDark ? '#9ca3af' : '#6b7280' },
                  ]}
                >
                  Your progress in this community will be hidden
                </Text>
              </View>

              <View style={styles.consequenceItem}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color={isDark ? '#9ca3af' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.consequenceText,
                    { color: isDark ? '#9ca3af' : '#6b7280' },
                  ]}
                >
                  You can rejoin with an invite code
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Animated.View style={[styles.button, cancelStyle]}>
                <Pressable
                  onPress={handleClose}
                  onPressIn={() => {
                    cancelScale.value = withTiming(0.96, { duration: 100 });
                  }}
                  onPressOut={() => {
                    cancelScale.value = withSpring(1, { damping: 10, stiffness: 150 });
                  }}
                  style={[
                    styles.cancelButton,
                    {
                      backgroundColor: isDark ? '#374151' : '#f3f4f6',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.cancelButtonText,
                      { color: isDark ? '#d1d5db' : '#4b5563' },
                    ]}
                  >
                    Cancel
                  </Text>
                </Pressable>
              </Animated.View>

              <Animated.View style={[styles.button, confirmStyle]}>
                <Pressable
                  onPress={handleConfirm}
                  onPressIn={() => {
                    confirmScale.value = withTiming(0.96, { duration: 100 });
                    hapticWarning();
                  }}
                  onPressOut={() => {
                    confirmScale.value = withSpring(1, { damping: 10, stiffness: 150 });
                  }}
                  style={styles.confirmButton}
                >
                  <LinearGradient
                    colors={['#ef4444', '#dc2626'] as unknown as readonly [string, string, ...string[]]}
                    style={styles.confirmButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="exit-outline" size={20} color="white" />
                    <Text style={styles.confirmButtonText}>
                      {isOwner && !hasOtherMembers ? 'Delete & Leave' : 'Leave Community'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>
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
    maxWidth: 450,
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  communityName: {
    fontWeight: '600',
  },
  noticeContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  dangerNotice: {},
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  noticeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  noticeInfoText: {
    fontSize: 13,
    fontWeight: '600',
  },
  consequencesList: {
    gap: 12,
    marginBottom: 24,
  },
  consequenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  consequenceText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
