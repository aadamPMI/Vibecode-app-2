import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { hapticLight } from '../../src/utils/haptics';

interface FlipCardProps {
  frontContent: {
    title: string;
    description: string;
    image?: string;
    members?: number;
    activity?: string;
  };
  backContent: {
    details: string;
    creator: string;
    createdDate: string;
    tags: string[];
  };
  autoFlipDuration?: number; // in milliseconds (3-5s)
  isDark?: boolean;
  onFlip?: (isFront: boolean) => void;
}

export function FlipCard({
  frontContent,
  backContent,
  autoFlipDuration = 4000,
  isDark = false,
  onFlip,
}: FlipCardProps) {
  const rotation = useSharedValue(0);
  const isFlipped = useRef(false);
  const autoFlipTimer = useRef<NodeJS.Timeout | null>(null);

  const handleFlip = () => {
    hapticLight();

    // Cancel any existing auto-flip timer
    if (autoFlipTimer.current) {
      clearTimeout(autoFlipTimer.current);
      autoFlipTimer.current = null;
    }

    isFlipped.current = !isFlipped.current;
    rotation.value = withTiming(isFlipped.current ? 180 : 0, { duration: 600 });

    if (onFlip) {
      onFlip(!isFlipped.current);
    }

    // Set auto-flip back timer when showing back
    if (isFlipped.current) {
      autoFlipTimer.current = setTimeout(() => {
        isFlipped.current = false;
        rotation.value = withTiming(0, { duration: 600 });
        if (onFlip) {
          runOnJS(onFlip)(true);
        }
      }, autoFlipDuration);
    }
  };

  useEffect(() => {
    return () => {
      if (autoFlipTimer.current) {
        clearTimeout(autoFlipTimer.current);
      }
    };
  }, []);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [0, 180]);
    const opacity = interpolate(rotation.value, [0, 90, 180], [1, 0, 0]);

    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity,
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [180, 360]);
    const opacity = interpolate(rotation.value, [0, 90, 180], [0, 0, 1]);

    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity,
      backfaceVisibility: 'hidden',
    };
  });

  return (
    <Pressable onPress={handleFlip} style={styles.container}>
      {/* Front Side */}
      <Animated.View
        style={[
          styles.card,
          styles.cardFront,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' },
          frontAnimatedStyle,
        ]}
      >
        <LinearGradient
          colors={['#3b82f6', '#8b5cf6'] as unknown as readonly [string, string, ...string[]]}
          style={styles.cardHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {frontContent.image ? (
            <Image source={{ uri: frontContent.image }} style={styles.cardImage} />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Ionicons name="people" size={48} color="white" />
            </View>
          )}
        </LinearGradient>

        <View style={styles.cardBody}>
          <Text
            style={[
              styles.cardTitle,
              { color: isDark ? '#ffffff' : '#1f2937' },
            ]}
          >
            {frontContent.title}
          </Text>

          <Text
            style={[
              styles.cardDescription,
              { color: isDark ? '#9ca3af' : '#6b7280' },
            ]}
            numberOfLines={2}
          >
            {frontContent.description}
          </Text>

          <View style={styles.cardStats}>
            <View style={styles.statItem}>
              <Ionicons
                name="people-outline"
                size={16}
                color={isDark ? '#9ca3af' : '#6b7280'}
              />
              <Text style={[styles.statText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                {frontContent.members || 0} members
              </Text>
            </View>

            {frontContent.activity && (
              <View style={styles.statItem}>
                <Ionicons
                  name="pulse-outline"
                  size={16}
                  color={isDark ? '#9ca3af' : '#6b7280'}
                />
                <Text style={[styles.statText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                  {frontContent.activity}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.flipIndicator}>
          <Ionicons name="sync-outline" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
        </View>
      </Animated.View>

      {/* Back Side */}
      <Animated.View
        style={[
          styles.card,
          styles.cardBack,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' },
          backAnimatedStyle,
        ]}
      >
        <View style={[styles.cardBody, { paddingTop: 20 }]}>
          <View style={styles.backHeader}>
            <Ionicons name="information-circle" size={24} color="#3b82f6" />
            <Text
              style={[
                styles.backTitle,
                { color: isDark ? '#ffffff' : '#1f2937' },
              ]}
            >
              About
            </Text>
          </View>

          <Text
            style={[
              styles.backDetails,
              { color: isDark ? '#d1d5db' : '#374151' },
            ]}
          >
            {backContent.details}
          </Text>

          <View style={styles.backInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text style={[styles.infoText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                Created by {backContent.creator}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text style={[styles.infoText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                {backContent.createdDate}
              </Text>
            </View>
          </View>

          {backContent.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {backContent.tags.map((tag, index) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: isDark ? '#374151' : '#f3f4f6' },
                  ]}
                >
                  <Text style={[styles.tagText, { color: isDark ? '#d1d5db' : '#4b5563' }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.flipIndicator}>
          <Ionicons name="sync-outline" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 280,
    marginBottom: 16,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  cardFront: {},
  cardBack: {},
  cardHeader: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    padding: 16,
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
  },
  flipIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  backTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backDetails: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  backInfo: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
