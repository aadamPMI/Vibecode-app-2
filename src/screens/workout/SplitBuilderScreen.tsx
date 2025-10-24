// Split Builder Screen - Create workout split with days
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { cn } from '../../utils/cn';
import { useTrainingStore } from '../../state/trainingStore';
import { useSettingsStore } from '../../state/settingsStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { EmptyState, AIThinking } from '../../components/ui/LoadingStates';
import { PresetSplit, PresetSplitDay } from '../../constants/workoutSplits';
import { suggestMuscleGroups } from '../../services/openaiService';
import { MuscleGroup, Program, WorkoutTemplate } from '../../types/workout';
import { PremiumBackground } from '../../components/PremiumBackground';
import { hapticMedium, hapticLight, hapticSuccess } from '../../utils/haptics';
import { staggerDelays } from '../../utils/animations';

interface WorkoutDay {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  exercises: string[];
}

export default function SplitBuilderScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const systemColorScheme = useColorScheme();
  const resolvedTheme = theme === 'system' ? (systemColorScheme || 'light') : theme;
  const isDark = resolvedTheme === 'dark';
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  
  const createProgram = useTrainingStore((state) => state.createProgram);
  
  const preset = route.params?.preset as PresetSplit | null;
  const programName = route.params?.programName as string;

  const [days, setDays] = useState<WorkoutDay[]>(
    preset?.days.map((day, i) => ({
      id: `day-${i}`,
      name: day.dayName,
      muscleGroups: day.suggestedMuscleGroups,
      exercises: [],
    })) || []
  );

  const [isDayEditorVisible, setIsDayEditorVisible] = useState(false);
  const [editingDay, setEditingDay] = useState<WorkoutDay | null>(null);
  const [isNewDay, setIsNewDay] = useState(false);

  const handleAddDay = () => {
    setEditingDay({
      id: `day-${Date.now()}`,
      name: '',
      muscleGroups: [],
      exercises: [],
    });
    setIsNewDay(true);
    setIsDayEditorVisible(true);
    hapticMedium();
  };

  const handleEditDay = (day: WorkoutDay) => {
    setEditingDay(day);
    setIsNewDay(false);
    setIsDayEditorVisible(true);
    hapticLight();
  };

  const handleSaveDay = (day: WorkoutDay) => {
    if (isNewDay) {
      setDays([...days, day]);
    } else {
      setDays(days.map((d) => (d.id === day.id ? day : d)));
    }
    setIsDayEditorVisible(false);
    setEditingDay(null);
    hapticSuccess();
  };

  const handleDeleteDay = (dayId: string) => {
    Alert.alert('Delete Day', 'Are you sure you want to delete this workout day?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setDays(days.filter((d) => d.id !== dayId));
          hapticMedium();
        },
      },
    ]);
  };

  const handleCreateProgram = () => {
    if (days.length === 0) {
      Alert.alert('Error', 'Please add at least one workout day');
      return;
    }

    // Create program
    const program: Program = {
      id: `program-${Date.now()}`,
      name: programName,
      description: preset?.description || 'Custom workout program',
      version: '1.0',
      experienceLevel: preset?.experienceLevel[0] || 'intermediate',
      goals: ['hypertrophy'],
      durationWeeks: 8,
      split: {
        id: `split-${Date.now()}`,
        name: programName,
        type: preset?.type || 'custom',
        daysPerWeek: days.length,
        workoutTemplateIds: [],
        rotationPattern: days.map((d) => d.name),
      },
      workoutTemplates: days.map((day) => ({
        id: `template-${day.id}`,
        name: day.name,
        description: `${day.muscleGroups.join(', ')} workout`,
        exercises: [],
        estimatedDuration: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      periodization: [],
      schedule: {
        preferredDays: [],
        autoShiftMissed: true,
      },
      subRegionTargets: [],
      isActive: false,
      isArchived: false,
      createdBy: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createProgram(program);
    hapticSuccess();
    
    Alert.alert('Success!', 'Your program has been created', [
      {
        text: 'OK',
        onPress: () => navigation.navigate('ProgramManager'),
      },
    ]);
  };

  const delays = staggerDelays(days.length);

  return (
    <SafeAreaView className={cn('flex-1', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
      <PremiumBackground theme={theme} variant="workout" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Pressable onPress={() => navigation.goBack()} className="mb-2">
            <Ionicons name="arrow-back" size={28} color={isDark ? '#fff' : '#000'} />
          </Pressable>
          <Text className={cn('text-4xl font-bold mb-1', isDark ? 'text-white' : 'text-black')}>
            {programName}
          </Text>
          <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
            {days.length} workout day{days.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Days List */}
        {days.length === 0 ? (
          <View className="px-6">
            <EmptyState
              icon="barbell-outline"
              title="No Workout Days"
              message="Add your first workout day to start building your program"
              actionLabel="Add Day"
              onAction={handleAddDay}
              isDark={isDark}
            />
          </View>
        ) : (
          <View className="px-6 mb-6">
            {days.map((day, index) => (
              <Animated.View
                key={day.id}
                entering={FadeInDown.delay(delays[index]).duration(300).springify()}
              >
                <GlassCard intensity={60} isDark={isDark} className="p-5 mb-4">
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className={cn('text-xl font-bold mb-1', isDark ? 'text-white' : 'text-black')}>
                        {day.name}
                      </Text>
                      <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                        {day.muscleGroups.length > 0
                          ? day.muscleGroups.join(', ')
                          : 'No muscles selected'}
                      </Text>
                    </View>
                    <View className="bg-blue-500/20 px-3 py-1 rounded-full">
                      <Text className="text-blue-500 text-xs font-bold">Day {index + 1}</Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => handleEditDay(day)}
                      className={cn('flex-1 py-3 rounded-2xl', isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200')}
                    >
                      <Text className={cn('font-bold text-center', isDark ? 'text-white' : 'text-gray-900')}>
                        Edit
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteDay(day.id)}
                      className="py-3 px-4 rounded-2xl bg-red-500/20"
                    >
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </Pressable>
                  </View>
                </GlassCard>
              </Animated.View>
            ))}

            {/* Add Day Button - Only shown when there are existing days */}
            <GlassButton
              onPress={handleAddDay}
              variant="secondary"
              fullWidth
              icon={<Ionicons name="add-circle-outline" size={20} color={isDark ? '#fff' : '#000'} />}
            >
              Add Workout Day
            </GlassButton>
          </View>
        )}

        {/* Create Program Button */}
        {days.length > 0 && (
          <View className="px-6 mb-8">
            <GlassButton
              onPress={handleCreateProgram}
              variant="success"
              size="lg"
              fullWidth
              icon={<Ionicons name="checkmark-circle-outline" size={24} color="white" />}
              haptic="success"
            >
              Create Program
            </GlassButton>
          </View>
        )}
      </ScrollView>

      {/* Day Editor Modal */}
      <DayEditorModal
        visible={isDayEditorVisible}
        day={editingDay}
        onSave={handleSaveDay}
        onClose={() => {
          setIsDayEditorVisible(false);
          setEditingDay(null);
        }}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}

// Day Editor Modal Component
interface DayEditorModalProps {
  visible: boolean;
  day: WorkoutDay | null;
  onSave: (day: WorkoutDay) => void;
  onClose: () => void;
  isDark: boolean;
}

const DayEditorModal: React.FC<DayEditorModalProps> = ({ visible, day, onSave, onClose, isDark }) => {
  const [name, setName] = useState(day?.name || '');
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>(day?.muscleGroups || []);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const allMuscleGroups: MuscleGroup[] = [
    'chest',
    'back',
    'shoulders',
    'biceps',
    'triceps',
    'forearms',
    'quads',
    'hamstrings',
    'glutes',
    'calves',
    'core',
    'abs',
    'obliques',
  ];

  const handleAISuggestion = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter a day name first');
      return;
    }

    setIsLoadingAI(true);
    hapticMedium();

    try {
      const suggested = await suggestMuscleGroups(name, 'custom');
      setMuscleGroups(suggested);
      hapticSuccess();
    } catch (error) {
      Alert.alert('Error', 'Failed to get AI suggestions. Using default groups.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const toggleMuscle = (muscle: MuscleGroup) => {
    if (muscleGroups.includes(muscle)) {
      setMuscleGroups(muscleGroups.filter((m) => m !== muscle));
    } else {
      setMuscleGroups([...muscleGroups, muscle]);
    }
    hapticLight();
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a day name');
      return;
    }

    if (muscleGroups.length === 0) {
      Alert.alert('Error', 'Please select at least one muscle group');
      return;
    }

    onSave({
      id: day?.id || `day-${Date.now()}`,
      name: name.trim(),
      muscleGroups,
      exercises: day?.exercises || [],
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView className={cn('flex-1', isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50')}>
        <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
          <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-black')}>
            {day?.id ? 'Edit Day' : 'Add Day'}
          </Text>
          <Pressable onPress={onClose} className={cn('w-10 h-10 rounded-full items-center justify-center', isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200')}>
            <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Day Name */}
          <View className="mb-6">
            <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-gray-300' : 'text-gray-700')}>
              Day Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Push Day, Leg Day"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              className={cn(
                'rounded-2xl p-4 text-lg',
                isDark ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-900'
              )}
            />
          </View>

          {/* AI Suggestion Button */}
          <GlassButton
            onPress={handleAISuggestion}
            variant="primary"
            fullWidth
            icon={<Ionicons name="sparkles" size={20} color="white" />}
            className="mb-6"
          >
            AI Suggest Muscles
          </GlassButton>

          {isLoadingAI && <AIThinking message="Getting AI suggestions..." isDark={isDark} />}

          {/* Muscle Group Selection */}
          <View className="mb-6">
            <Text className={cn('text-sm font-semibold mb-3', isDark ? 'text-gray-300' : 'text-gray-700')}>
              Target Muscles ({muscleGroups.length} selected)
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {allMuscleGroups.map((muscle) => (
                <Pressable
                  key={muscle}
                  onPress={() => toggleMuscle(muscle)}
                  className={cn(
                    'px-4 py-2 rounded-full',
                    muscleGroups.includes(muscle) ? 'bg-blue-500' : isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200'
                  )}
                >
                  <Text
                    className={cn(
                      'text-sm font-bold capitalize',
                      muscleGroups.includes(muscle) ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-600'
                    )}
                  >
                    {muscle}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <GlassButton
            onPress={handleSave}
            variant="success"
            size="lg"
            fullWidth
            haptic="success"
            className="mb-6"
          >
            Save Day
          </GlassButton>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

