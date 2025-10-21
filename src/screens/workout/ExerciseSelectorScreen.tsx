// Exercise Selector Screen - Browse or AI search for exercises
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { cn } from '../../utils/cn';
import { useSettingsStore } from '../../state/settingsStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { AIThinking, EmptyState } from '../../components/ui/LoadingStates';
import { PremiumBackground } from '../../components/PremiumBackground';
import {
  EXERCISE_DATABASE,
  searchExercises,
  getExercisesByMuscleGroup,
  getAllMuscleGroups,
} from '../../utils/exerciseDatabase';
import { lookupExercise } from '../../services/openaiService';
import { hapticLight, hapticMedium, hapticSuccess } from '../../utils/haptics';
import { staggerDelays } from '../../utils/animations';
import { MuscleGroup, Exercise, SetSchemeType } from '../../types/workout';

type Tab = 'library' | 'ai-search';

export default function ExerciseSelectorScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === 'system' ? (systemColorScheme || 'light') : theme;
  const isDark = resolvedTheme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();

  const [activeTab, setActiveTab] = useState<Tab>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [isSetSchemeModalVisible, setIsSetSchemeModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const allMuscles = getAllMuscleGroups();

  // Filter exercises
  const getFilteredExercises = (): Exercise[] => {
    let filtered = EXERCISE_DATABASE;

    if (selectedMuscle) {
      filtered = getExercisesByMuscleGroup(selectedMuscle);
    }

    if (searchQuery) {
      filtered = searchExercises(searchQuery);
    }

    return filtered;
  };

  const filteredExercises = getFilteredExercises();

  const handleAISearch = async () => {
    if (!aiSearchQuery.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    setIsLoadingAI(true);
    hapticMedium();

    try {
      const result = await lookupExercise(aiSearchQuery);
      setAiResult(result);
      
      if (result.found) {
        hapticSuccess();
      } else {
        Alert.alert('Not Found', 'Exercise not recognized. Try a different name.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search exercise. Please try again.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsSetSchemeModalVisible(true);
    hapticLight();
  };

  const handleAddExercise = (setScheme: SetSchemeType, sets: number, reps: number) => {
    if (!selectedExercise) return;

    // Navigate back with exercise data
    navigation.navigate({
      name: route.params?.returnScreen || 'SplitBuilder',
      params: {
        addedExercise: {
          exerciseId: selectedExercise.id,
          exerciseName: selectedExercise.name,
          setScheme,
          sets,
          reps,
        },
      },
      merge: true,
    });

    hapticSuccess();
  };

  const delays = staggerDelays(Math.min(filteredExercises.length, 20));

  return (
    <SafeAreaView className={cn('flex-1', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
      <PremiumBackground theme={theme} variant="workout" />

      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Pressable onPress={() => navigation.goBack()} className="mb-2">
          <Ionicons name="arrow-back" size={28} color={isDark ? '#fff' : '#000'} />
        </Pressable>
        <Text className={cn('text-4xl font-bold', isDark ? 'text-white' : 'text-black')}>
          Add Exercise
        </Text>
      </View>

      {/* Tabs */}
      <View className="px-6 mb-4">
        <View className={cn('flex-row rounded-2xl p-1', isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200')}>
          <Pressable
            onPress={() => {
              setActiveTab('library');
              hapticLight();
            }}
            className={cn(
              'flex-1 py-3 rounded-xl',
              activeTab === 'library' ? 'bg-blue-500' : 'bg-transparent'
            )}
          >
            <Text
              className={cn(
                'text-center font-bold',
                activeTab === 'library' ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-600'
              )}
            >
              Library
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setActiveTab('ai-search');
              hapticLight();
            }}
            className={cn(
              'flex-1 py-3 rounded-xl',
              activeTab === 'ai-search' ? 'bg-blue-500' : 'bg-transparent'
            )}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="sparkles" size={16} color={activeTab === 'ai-search' ? '#fff' : isDark ? '#9ca3af' : '#6b7280'} />
              <Text
                className={cn(
                  'text-center font-bold ml-1',
                  activeTab === 'ai-search' ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-600'
                )}
              >
                AI Search
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Library Tab */}
      {activeTab === 'library' && (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="flex-1">
          {/* Search */}
          <View className="px-6 mb-4">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search exercises..."
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              className={cn(
                'rounded-2xl p-4 text-base',
                isDark ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'
              )}
            />
          </View>

          {/* Muscle Group Filter */}
          <View className="px-6 mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Pressable
                onPress={() => {
                  setSelectedMuscle(null);
                  hapticLight();
                }}
                className={cn(
                  'px-4 py-2 rounded-full mr-2',
                  !selectedMuscle ? 'bg-blue-500' : isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200'
                )}
              >
                <Text
                  className={cn(
                    'text-sm font-bold',
                    !selectedMuscle ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-600'
                  )}
                >
                  All
                </Text>
              </Pressable>
              {allMuscles.map((muscle) => (
                <Pressable
                  key={muscle}
                  onPress={() => {
                    setSelectedMuscle(muscle);
                    hapticLight();
                  }}
                  className={cn(
                    'px-4 py-2 rounded-full mr-2',
                    selectedMuscle === muscle ? 'bg-blue-500' : isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200'
                  )}
                >
                  <Text
                    className={cn(
                      'text-sm font-bold capitalize',
                      selectedMuscle === muscle ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-600'
                    )}
                  >
                    {muscle}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Exercise List */}
          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
            {filteredExercises.length === 0 ? (
              <EmptyState
                icon="barbell-outline"
                title="No Exercises"
                message="Try adjusting your filters"
                isDark={isDark}
              />
            ) : (
              filteredExercises.map((exercise, index) => (
                <Animated.View
                  key={exercise.id}
                  entering={FadeInDown.delay(delays[index % 20]).duration(300).springify()}
                >
                  <Pressable onPress={() => handleSelectExercise(exercise)}>
                    <GlassCard intensity={60} isDark={isDark} className="p-4 mb-3">
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                          <Text className={cn('text-lg font-bold mb-1', isDark ? 'text-white' : 'text-black')}>
                            {exercise.name}
                          </Text>
                          <View className="flex-row flex-wrap gap-1 mb-2">
                            {exercise.primaryMuscles.map((muscle) => (
                              <View key={muscle} className="bg-blue-500/20 px-2 py-0.5 rounded">
                                <Text className="text-blue-500 text-xs font-bold capitalize">{muscle}</Text>
                              </View>
                            ))}
                          </View>
                          <View className="flex-row flex-wrap gap-1">
                            {exercise.equipment.map((eq) => (
                              <View key={eq} className={cn('px-2 py-0.5 rounded', isDark ? 'bg-gray-700' : 'bg-gray-200')}>
                                <Text className={cn('text-xs capitalize', isDark ? 'text-gray-300' : 'text-gray-700')}>
                                  {eq}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                        <Ionicons name="add-circle" size={24} color="#3b82f6" />
                      </View>
                    </GlassCard>
                  </Pressable>
                </Animated.View>
              ))
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* AI Search Tab */}
      {activeTab === 'ai-search' && (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="flex-1 px-6">
          <View className="mb-4">
            <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
              Exercise Name
            </Text>
            <TextInput
              value={aiSearchQuery}
              onChangeText={setAiSearchQuery}
              placeholder="e.g., Cable Face Pulls, Nordic Curls"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              className={cn(
                'rounded-2xl p-4 text-base mb-3',
                isDark ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'
              )}
              onSubmitEditing={handleAISearch}
            />
            <GlassButton
              onPress={handleAISearch}
              variant="primary"
              fullWidth
              icon={<Ionicons name="sparkles" size={20} color="white" />}
            >
              AI Lookup
            </GlassButton>
          </View>

          {isLoadingAI && <AIThinking message="Searching exercise..." isDark={isDark} />}

          {aiResult && aiResult.found && (
            <GlassCard intensity={60} isDark={isDark} className="p-5">
              <Text className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
                {aiResult.name}
              </Text>
              
              <View className="mb-3">
                <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  Primary Muscles:
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {aiResult.primaryMuscles.map((muscle: string) => (
                    <View key={muscle} className="bg-blue-500/20 px-3 py-1 rounded-full">
                      <Text className="text-blue-500 text-sm font-bold capitalize">{muscle}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {aiResult.secondaryMuscles.length > 0 && (
                <View className="mb-4">
                  <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    Secondary Muscles:
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {aiResult.secondaryMuscles.map((muscle: string) => (
                      <View key={muscle} className={cn('px-3 py-1 rounded-full', isDark ? 'bg-gray-700' : 'bg-gray-200')}>
                        <Text className={cn('text-sm capitalize', isDark ? 'text-gray-300' : 'text-gray-700')}>
                          {muscle}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <GlassButton
                onPress={() => {
                  // Create exercise from AI result
                  const exercise: Exercise = {
                    id: `custom-${Date.now()}`,
                    name: aiResult.name,
                    movementCategory: 'isolation',
                    primaryMuscles: aiResult.primaryMuscles,
                    secondaryMuscles: aiResult.secondaryMuscles,
                    equipment: ['dumbbell'],
                    isUnilateral: false,
                    trackE1RM: true,
                    subRegionWeights: [],
                    substitutions: [],
                  };
                  handleSelectExercise(exercise);
                }}
                variant="success"
                fullWidth
              >
                Add This Exercise
              </GlassButton>
            </GlassCard>
          )}
        </Animated.View>
      )}

      {/* Set Scheme Selection Modal */}
      <SetSchemeModal
        visible={isSetSchemeModalVisible}
        exercise={selectedExercise}
        onClose={() => setIsSetSchemeModalVisible(false)}
        onConfirm={handleAddExercise}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}

// Set Scheme Selection Modal
interface SetSchemeModalProps {
  visible: boolean;
  exercise: Exercise | null;
  onClose: () => void;
  onConfirm: (setScheme: SetSchemeType, sets: number, reps: number) => void;
  isDark: boolean;
}

const SetSchemeModal: React.FC<SetSchemeModalProps> = ({ visible, exercise, onClose, onConfirm, isDark }) => {
  const [setScheme, setSetScheme] = useState<SetSchemeType>('fixed-reps');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');

  const schemes: Array<{ value: SetSchemeType; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { value: 'fixed-reps', label: 'Fixed Reps', icon: 'repeat' },
    { value: 'rep-range', label: 'Rep Range', icon: 'swap-horizontal' },
    { value: 'amrap', label: 'AMRAP', icon: 'flame' },
  ];

  const handleConfirm = () => {
    const setsNum = parseInt(sets);
    const repsNum = parseInt(reps);

    if (isNaN(setsNum) || isNaN(repsNum) || setsNum <= 0 || repsNum <= 0) {
      Alert.alert('Error', 'Please enter valid sets and reps');
      return;
    }

    onConfirm(setScheme, setsNum, repsNum);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView className={cn('flex-1', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
        <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
          <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-black')}>
            Set Scheme
          </Text>
          <Pressable
            onPress={onClose}
            className={cn('w-10 h-10 rounded-full items-center justify-center', isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200')}
          >
            <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {exercise && (
            <View className="mb-6">
              <Text className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-black')}>
                {exercise.name}
              </Text>
            </View>
          )}

          {/* Scheme Type */}
          <View className="mb-6">
            <Text className={cn('text-sm font-semibold mb-3', isDark ? 'text-gray-300' : 'text-gray-700')}>
              Scheme Type
            </Text>
            <View className="gap-3">
              {schemes.map((scheme) => (
                <Pressable
                  key={scheme.value}
                  onPress={() => {
                    setSetScheme(scheme.value);
                    hapticLight();
                  }}
                  className={cn(
                    'flex-row items-center p-4 rounded-2xl',
                    setScheme === scheme.value ? 'bg-blue-500' : isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200'
                  )}
                >
                  <Ionicons
                    name={scheme.icon}
                    size={24}
                    color={setScheme === scheme.value ? '#fff' : isDark ? '#9ca3af' : '#6b7280'}
                  />
                  <Text
                    className={cn(
                      'text-base font-bold ml-3',
                      setScheme === scheme.value ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'
                    )}
                  >
                    {scheme.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Sets */}
          <View className="mb-4">
            <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
              Number of Sets
            </Text>
            <TextInput
              value={sets}
              onChangeText={setSets}
              keyboardType="number-pad"
              placeholder="3"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              className={cn(
                'rounded-2xl p-4 text-lg',
                isDark ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'
              )}
            />
          </View>

          {/* Reps */}
          <View className="mb-6">
            <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
              {setScheme === 'rep-range' ? 'Target Reps (e.g., 8-12)' : 'Reps per Set'}
            </Text>
            <TextInput
              value={reps}
              onChangeText={setReps}
              keyboardType="number-pad"
              placeholder="10"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              className={cn(
                'rounded-2xl p-4 text-lg',
                isDark ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'
              )}
            />
          </View>

          <GlassButton onPress={handleConfirm} variant="success" size="lg" fullWidth haptic="success">
            Add Exercise
          </GlassButton>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

