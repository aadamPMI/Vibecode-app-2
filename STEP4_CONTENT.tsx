// This is the NEW STEP 4 content to insert between current Step 3 and Step 4
// Add this after line ~1094 in ProgramWizardScreen.tsx

// NEW STEP 4 - Add Exercises to Selected Day
{currentStep === 4 && selectedDayForExercises && (
  <View className="px-6">
    {/* Header Section */}
    <Animated.View
      entering={FadeInDown.delay(100).duration(400).springify()}
      className="mb-4"
    >
      <Text className={cn('text-3xl font-bold mb-2', isDark ? 'text-white' : 'text-black')}>
        Add Exercises
      </Text>
      <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
        Select exercises for{' '}
        <Text className="font-bold">
          {workoutDays.find(d => d.id === selectedDayForExercises)?.name}
        </Text>
      </Text>
    </Animated.View>

    {/* AI Suggestions Section */}
    <Animated.View
      entering={FadeInDown.delay(200).duration(400).springify()}
      className="mb-6"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons name="sparkles" size={20} color="#a855f7" />
          <Text className={cn('text-lg font-bold ml-2', isDark ? 'text-white' : 'text-black')}>
            AI Suggestions
          </Text>
        </View>
        <View className="bg-purple-500/20 px-3 py-1 rounded-full">
          <Text className="text-purple-500 text-xs font-bold">Smart</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
        {(() => {
          const currentDay = workoutDays.find(d => d.id === selectedDayForExercises);
          if (!currentDay) return null;

          // Simple AI suggestion logic
          const aiSuggestions = EXERCISE_LIBRARY
            .filter(ex =>
              currentDay.muscleGroups.some(mg =>
                ex.primaryMuscles.includes(mg as any) ||
                ex.secondaryMuscles?.includes(mg as any)
              )
            )
            .sort((a, b) => {
              // Prioritize compound lifts
              if (a.trackE1RM && !b.trackE1RM) return -1;
              if (!a.trackE1RM && b.trackE1RM) return 1;
              return 0;
            })
            .slice(0, 8);

          return aiSuggestions.map((exercise, idx) => (
            <Pressable
              key={exercise.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const updatedDays = workoutDays.map(day => {
                  if (day.id === selectedDayForExercises) {
                    // Add exercise if not already added
                    if (!day.exercises.includes(exercise.name)) {
                      return { ...day, exercises: [...day.exercises, exercise.name] };
                    }
                  }
                  return day;
                });
                setWorkoutDays(updatedDays);
              }}
              style={{ width: 200 }}
            >
              <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                <View
                  className={cn(
                    'p-4',
                    isDark ? 'bg-purple-500/10' : 'bg-purple-50'
                  )}
                  style={{
                    shadowColor: '#a855f7',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  {exercise.trackE1RM && (
                    <View className="bg-orange-500/20 px-2 py-0.5 rounded-full self-start mb-2">
                      <Text className="text-orange-500 text-xs font-bold">Compound</Text>
                    </View>
                  )}
                  <Text className={cn('text-base font-bold mb-1', isDark ? 'text-white' : 'text-black')} numberOfLines={2}>
                    {exercise.name}
                  </Text>
                  <Text className={cn('text-xs mb-2', isDark ? 'text-gray-400' : 'text-gray-600')} numberOfLines={1}>
                    {exercise.primaryMuscles.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="add-circle" size={16} color="#a855f7" />
                    <Text className="text-purple-500 text-xs font-bold ml-1">Add</Text>
                  </View>
                </View>
              </BlurView>
            </Pressable>
          ));
        })()}
      </ScrollView>
    </Animated.View>

    {/* Selected Exercises Panel */}
    <Animated.View
      entering={FadeInDown.delay(300).duration(400).springify()}
      className="mb-6"
    >
      <Text className={cn('text-lg font-bold mb-3', isDark ? 'text-white' : 'text-black')}>
        Selected Exercises ({workoutDays.find(d => d.id === selectedDayForExercises)?.exercises.length || 0})
      </Text>

      {(() => {
        const currentDay = workoutDays.find(d => d.id === selectedDayForExercises);
        if (!currentDay || currentDay.exercises.length === 0) {
          return (
            <View
              className={cn(
                'p-6 rounded-2xl items-center',
                isDark ? 'bg-[#1a1a1a]' : 'bg-gray-100'
              )}
            >
              <Ionicons name="barbell-outline" size={48} color={isDark ? '#4b5563' : '#9ca3af'} />
              <Text className={cn('text-sm mt-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                No exercises selected yet
              </Text>
            </View>
          );
        }

        return (
          <View className="gap-3">
            {currentDay.exercises.map((exerciseName, index) => (
              <Animated.View
                key={`${exerciseName}-${index}`}
                entering={FadeInDown.delay(index * 50).duration(300).springify()}
              >
                <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
                  <View
                    className={cn(
                      'p-4 flex-row items-center justify-between',
                      isDark ? 'bg-white/5' : 'bg-white/40'
                    )}
                    style={{
                      shadowColor: isDark ? '#000' : '#1f2937',
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.1,
                      shadowRadius: 6,
                      elevation: 2,
                    }}
                  >
                    <View className="flex-row items-center flex-1">
                      <View
                        className={cn(
                          'w-8 h-8 rounded-full items-center justify-center mr-3',
                          isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                        )}
                      >
                        <Text className="text-blue-500 font-bold text-sm">{index + 1}</Text>
                      </View>
                      <Text className={cn('text-base font-semibold flex-1', isDark ? 'text-white' : 'text-black')}>
                        {exerciseName}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      {/* Move Up */}
                      {index > 0 && (
                        <Pressable
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            const updatedDays = workoutDays.map(day => {
                              if (day.id === selectedDayForExercises) {
                                const newExercises = [...day.exercises];
                                [newExercises[index], newExercises[index - 1]] =
                                  [newExercises[index - 1], newExercises[index]];
                                return { ...day, exercises: newExercises };
                              }
                              return day;
                            });
                            setWorkoutDays(updatedDays);
                          }}
                          className={cn('w-8 h-8 rounded-full items-center justify-center', isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200')}
                        >
                          <Ionicons name="chevron-up" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                        </Pressable>
                      )}
                      {/* Move Down */}
                      {index < currentDay.exercises.length - 1 && (
                        <Pressable
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            const updatedDays = workoutDays.map(day => {
                              if (day.id === selectedDayForExercises) {
                                const newExercises = [...day.exercises];
                                [newExercises[index], newExercises[index + 1]] =
                                  [newExercises[index + 1], newExercises[index]];
                                return { ...day, exercises: newExercises };
                              }
                              return day;
                            });
                            setWorkoutDays(updatedDays);
                          }}
                          className={cn('w-8 h-8 rounded-full items-center justify-center', isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200')}
                        >
                          <Ionicons name="chevron-down" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                        </Pressable>
                      )}
                      {/* Remove */}
                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          const updatedDays = workoutDays.map(day => {
                            if (day.id === selectedDayForExercises) {
                              return {
                                ...day,
                                exercises: day.exercises.filter((_, i) => i !== index)
                              };
                            }
                            return day;
                          });
                          setWorkoutDays(updatedDays);
                        }}
                        className="w-8 h-8 rounded-full items-center justify-center bg-red-500/20"
                      >
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                      </Pressable>
                    </View>
                  </View>
                </BlurView>
              </Animated.View>
            ))}
          </View>
        );
      })()}
    </Animated.View>

    {/* Exercise Library Search & Browse */}
    <Animated.View
      entering={FadeInDown.delay(400).duration(400).springify()}
      className="mb-6"
    >
      <Text className={cn('text-lg font-bold mb-3', isDark ? 'text-white' : 'text-black')}>
        Exercise Library
      </Text>

      {/* Search Bar */}
      <View className="mb-4">
        <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-2xl overflow-hidden">
          <View
            className={cn(
              'flex-row items-center px-4 py-3',
              isDark ? 'bg-white/5' : 'bg-white/40'
            )}
          >
            <Ionicons name="search" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
            <TextInput
              placeholder="Search exercises..."
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              className={cn('flex-1 ml-2 text-base', isDark ? 'text-white' : 'text-black')}
              value={exerciseSearchQuery}
              onChangeText={setExerciseSearchQuery}
            />
            {exerciseSearchQuery.length > 0 && (
              <Pressable onPress={() => setExerciseSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
              </Pressable>
            )}
          </View>
        </BlurView>
      </View>

      {/* Exercise List */}
      <ScrollView className="gap-2" style={{ maxHeight: 400 }}>
        {(() => {
          const currentDay = workoutDays.find(d => d.id === selectedDayForExercises);
          if (!currentDay) return null;

          // Filter exercises by search query and muscle groups
          const filteredExercises = EXERCISE_LIBRARY.filter(ex => {
            const matchesSearch = !exerciseSearchQuery ||
              ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase());

            const matchesMuscles = currentDay.muscleGroups.length === 0 ||
              currentDay.muscleGroups.some(mg =>
                ex.primaryMuscles.includes(mg as any) ||
                ex.secondaryMuscles?.includes(mg as any)
              );

            return matchesSearch && matchesMuscles;
          }).slice(0, 20); // Limit to 20 for performance

          if (filteredExercises.length === 0) {
            return (
              <View className="py-8 items-center">
                <Text className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  No exercises found
                </Text>
              </View>
            );
          }

          return filteredExercises.map((exercise) => {
            const isAdded = currentDay.exercises.includes(exercise.name);

            return (
              <Pressable
                key={exercise.id}
                onPress={() => {
                  if (isAdded) return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const updatedDays = workoutDays.map(day => {
                    if (day.id === selectedDayForExercises) {
                      return { ...day, exercises: [...day.exercises, exercise.name] };
                    }
                    return day;
                  });
                  setWorkoutDays(updatedDays);
                }}
                disabled={isAdded}
              >
                <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} className="rounded-xl overflow-hidden">
                  <View
                    className={cn(
                      'p-3 flex-row items-center justify-between',
                      isAdded
                        ? isDark ? 'bg-green-500/10' : 'bg-green-50'
                        : isDark ? 'bg-white/5' : 'bg-white/40'
                    )}
                  >
                    <View className="flex-1">
                      <Text className={cn('text-sm font-semibold mb-0.5', isDark ? 'text-white' : 'text-black')}>
                        {exercise.name}
                      </Text>
                      <Text className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                        {exercise.primaryMuscles.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}
                      </Text>
                    </View>
                    {isAdded ? (
                      <View className="bg-green-500 px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-bold">Added</Text>
                      </View>
                    ) : (
                      <View className={cn('px-3 py-1 rounded-full', isDark ? 'bg-blue-500/20' : 'bg-blue-100')}>
                        <Text className="text-blue-500 text-xs font-bold">+ Add</Text>
                      </View>
                    )}
                  </View>
                </BlurView>
              </Pressable>
            );
          });
        })()}
      </ScrollView>
    </Animated.View>

    {/* Save Day Button */}
    <Animated.View
      entering={FadeInDown.delay(500).duration(400).springify()}
      className="mb-6"
    >
      <Pressable
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Navigate back to Step 3 to select another day or proceed
          setSelectedDayForExercises(null);
          setCurrentStep(3);
        }}
        className="bg-green-500 py-4 rounded-2xl"
        style={{
          shadowColor: '#22c55e',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <View className="flex-row items-center justify-center">
          <Ionicons name="checkmark-circle" size={24} color="white" />
          <Text className="text-white font-bold text-lg ml-2">
            Save Day
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  </View>
)}
