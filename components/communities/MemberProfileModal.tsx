import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { hapticLight, hapticMedium } from '../../src/utils/haptics';
import type { Member } from './MembersList';

interface MemberProfileModalProps {
  member: Member | null;
  visible: boolean;
  onClose: () => void;
  onMessage?: (member: Member) => void;
  onRemove?: (member: Member) => void;
  onPromote?: (member: Member) => void;
  currentUserRole?: 'owner' | 'admin' | 'member';
}

export function MemberProfileModal({
  member,
  visible,
  onClose,
  onMessage,
  onRemove,
  onPromote,
  currentUserRole = 'member',
}: MemberProfileModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!member) return null;

  const handleClose = () => {
    hapticLight();
    onClose();
  };

  const handleMessage = () => {
    hapticMedium();
    onMessage?.(member);
    onClose();
  };

  const handleRemove = () => {
    hapticMedium();
    onRemove?.(member);
  };

  const handlePromote = () => {
    hapticMedium();
    onPromote?.(member);
  };

  const canManage =
    (currentUserRole === 'owner' || currentUserRole === 'admin') &&
    member.role === 'member';

  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getRoleColor = (role: Member['role']) => {
    switch (role) {
      case 'owner':
        return '#f59e0b';
      case 'admin':
        return '#3b82f6';
      default:
        return '#6b7280';
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
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <Animated.View
            entering={SlideInDown.duration(400).springify()}
            style={[
              styles.modal,
              { backgroundColor: isDark ? '#1f2937' : '#ffffff' },
            ]}
          >
            {/* Close Button */}
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
            </Pressable>

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              {/* Header with Avatar */}
              <View style={styles.header}>
                <LinearGradient
                  colors={['#3b82f6', '#8b5cf6'] as unknown as readonly [string, string, ...string[]]}
                  style={styles.avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.avatarLarge}>
                    <Text style={styles.avatarLargeText}>{initials}</Text>
                  </View>

                  {member.isOnline && (
                    <View style={styles.onlineIndicatorLarge}>
                      <View style={styles.onlineDot} />
                    </View>
                  )}
                </LinearGradient>

                <View style={styles.headerInfo}>
                  <Text
                    style={[
                      styles.memberNameLarge,
                      { color: isDark ? '#ffffff' : '#1f2937' },
                    ]}
                  >
                    {member.name}
                  </Text>

                  <Text
                    style={[
                      styles.memberUsernameLarge,
                      { color: isDark ? '#9ca3af' : '#6b7280' },
                    ]}
                  >
                    @{member.username}
                  </Text>

                  <View
                    style={[
                      styles.roleBadgeLarge,
                      { backgroundColor: getRoleColor(member.role) + '20' },
                    ]}
                  >
                    <Ionicons
                      name={
                        member.role === 'owner'
                          ? 'star'
                          : member.role === 'admin'
                          ? 'shield-checkmark'
                          : 'person'
                      }
                      size={16}
                      color={getRoleColor(member.role)}
                    />
                    <Text
                      style={[
                        styles.roleBadgeTextLarge,
                        { color: getRoleColor(member.role) },
                      ]}
                    >
                      {member.role.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Stats Grid */}
              {member.stats && (
                <View style={styles.statsGrid}>
                  <View
                    style={[
                      styles.statCard,
                      { backgroundColor: isDark ? '#374151' : '#f9fafb' },
                    ]}
                  >
                    <Ionicons name="barbell" size={24} color="#3b82f6" />
                    <Text
                      style={[
                        styles.statValue,
                        { color: isDark ? '#ffffff' : '#1f2937' },
                      ]}
                    >
                      {member.stats.workouts}
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: isDark ? '#9ca3af' : '#6b7280' },
                      ]}
                    >
                      Workouts
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statCard,
                      { backgroundColor: isDark ? '#374151' : '#f9fafb' },
                    ]}
                  >
                    <Ionicons name="trophy" size={24} color="#f59e0b" />
                    <Text
                      style={[
                        styles.statValue,
                        { color: isDark ? '#ffffff' : '#1f2937' },
                      ]}
                    >
                      {member.stats.points}
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: isDark ? '#9ca3af' : '#6b7280' },
                      ]}
                    >
                      Points
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statCard,
                      { backgroundColor: isDark ? '#374151' : '#f9fafb' },
                    ]}
                  >
                    <Ionicons name="flame" size={24} color="#ef4444" />
                    <Text
                      style={[
                        styles.statValue,
                        { color: isDark ? '#ffffff' : '#1f2937' },
                      ]}
                    >
                      {member.stats.streak}
                    </Text>
                    <Text
                      style={[
                        styles.statLabel,
                        { color: isDark ? '#9ca3af' : '#6b7280' },
                      ]}
                    >
                      Day Streak
                    </Text>
                  </View>
                </View>
              )}

              {/* Info Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={isDark ? '#9ca3af' : '#6b7280'}
                  />
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: isDark ? '#9ca3af' : '#6b7280' },
                      ]}
                    >
                      Joined
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        { color: isDark ? '#ffffff' : '#1f2937' },
                      ]}
                    >
                      {member.joinedDate}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons
                    name={member.isOnline ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={member.isOnline ? '#10b981' : isDark ? '#9ca3af' : '#6b7280'}
                  />
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        { color: isDark ? '#9ca3af' : '#6b7280' },
                      ]}
                    >
                      Status
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        { color: member.isOnline ? '#10b981' : isDark ? '#ffffff' : '#1f2937' },
                      ]}
                    >
                      {member.isOnline ? 'Online' : 'Offline'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                {onMessage && (
                  <Pressable
                    onPress={handleMessage}
                    style={[
                      styles.actionButton,
                      styles.primaryButton,
                    ]}
                  >
                    <LinearGradient
                      colors={['#3b82f6', '#8b5cf6'] as unknown as readonly [string, string, ...string[]]}
                      style={styles.actionButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="chatbubble-outline" size={20} color="white" />
                      <Text style={styles.primaryButtonText}>Send Message</Text>
                    </LinearGradient>
                  </Pressable>
                )}

                {canManage && (
                  <View style={styles.managementButtons}>
                    {onPromote && (
                      <Pressable
                        onPress={handlePromote}
                        style={[
                          styles.actionButton,
                          styles.secondaryButton,
                          { borderColor: isDark ? '#374151' : '#e5e7eb' },
                        ]}
                      >
                        <Ionicons name="arrow-up-circle-outline" size={20} color="#3b82f6" />
                        <Text style={[styles.secondaryButtonText, { color: '#3b82f6' }]}>
                          Promote to Admin
                        </Text>
                      </Pressable>
                    )}

                    {onRemove && (
                      <Pressable
                        onPress={handleRemove}
                        style={[
                          styles.actionButton,
                          styles.secondaryButton,
                          { borderColor: isDark ? '#374151' : '#e5e7eb' },
                        ]}
                      >
                        <Ionicons name="person-remove-outline" size={20} color="#ef4444" />
                        <Text style={[styles.secondaryButtonText, { color: '#ef4444' }]}>
                          Remove Member
                        </Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            </ScrollView>
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
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '85%',
  },
  modal: {
    borderRadius: 24,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    maxHeight: '100%',
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLargeText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  onlineIndicatorLarge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
  },
  headerInfo: {
    alignItems: 'center',
  },
  memberNameLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberUsernameLarge: {
    fontSize: 16,
    marginBottom: 12,
  },
  roleBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleBadgeTextLarge: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  managementButtons: {
    gap: 12,
  },
});
