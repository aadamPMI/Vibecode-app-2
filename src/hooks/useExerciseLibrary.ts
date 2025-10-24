// Hook for exercise library with search and filtering
import { useState, useMemo } from 'react';
import { EXERCISE_LIBRARY } from '../constants/exerciseData';
import { Exercise, MuscleGroup } from '../types/workout';

export interface ExerciseFilters {
  muscleGroups: MuscleGroup[];
  equipment: string[];
  searchQuery: string;
}

export function useExerciseLibrary() {
  const [filters, setFilters] = useState<ExerciseFilters>({
    muscleGroups: [],
    equipment: [],
    searchQuery: '',
  });

  // Fuzzy search helper
  const fuzzyMatch = (text: string, query: string): boolean => {
    if (!query) return true;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    return lowerText.includes(lowerQuery);
  };

  // Filtered exercises
  const filteredExercises = useMemo(() => {
    return EXERCISE_LIBRARY.filter((exercise) => {
      // Search filter
      if (filters.searchQuery && !fuzzyMatch(exercise.name, filters.searchQuery)) {
        return false;
      }

      // Muscle group filter
      if (filters.muscleGroups.length > 0) {
        const hasMatchingMuscle = filters.muscleGroups.some(
          (mg) =>
            exercise.primaryMuscles.includes(mg) ||
            exercise.secondaryMuscles?.includes(mg)
        );
        if (!hasMatchingMuscle) return false;
      }

      // Equipment filter
      if (filters.equipment.length > 0) {
        const hasMatchingEquipment = filters.equipment.some((eq) =>
          exercise.equipment.includes(eq as any)
        );
        if (!hasMatchingEquipment) return false;
      }

      return true;
    });
  }, [filters]);

  const updateSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const updateMuscleGroups = (groups: MuscleGroup[]) => {
    setFilters((prev) => ({ ...prev, muscleGroups: groups }));
  };

  const updateEquipment = (equipment: string[]) => {
    setFilters((prev) => ({ ...prev, equipment }));
  };

  const clearFilters = () => {
    setFilters({
      muscleGroups: [],
      equipment: [],
      searchQuery: '',
    });
  };

  return {
    exercises: filteredExercises,
    allExercises: EXERCISE_LIBRARY,
    filters,
    updateSearch,
    updateMuscleGroups,
    updateEquipment,
    clearFilters,
  };
}
