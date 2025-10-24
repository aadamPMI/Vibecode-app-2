# Versioned Calorie Targets Implementation

## Overview
This implementation provides versioned calorie target tracking, ensuring that when a user changes their calorie goal in Settings, the new target applies from the current date forward while preserving historical targets for past days.

## Implementation Status
✅ **Core Store Created** (`src/state/calorieTargetStore.ts`)
✅ **Settings Screen Updated** (partial integration in `src/screens/SettingsScreen.tsx`)
⏳ **Remaining Integration** (NutritionScreen and complete Settings flow)

## Architecture

### Data Model
```typescript
interface CalorieTargetVersion {
  id: string;
  effective_from: string; // ISO date (YYYY-MM-DD) in user's local timezone
  target_kcal: number;
  target_protein?: number;
  target_carbs?: number;
  target_fats?: number;
  created_at: string; // ISO timestamp
}
```

### Key Features
1. **Version History**: Each calorie target change creates a new version with an `effective_from` date
2. **No Retroactive Changes**: Past days retain their original targets
3. **Date-based Queries**: Get the appropriate target for any historical or future date
4. **Local Timezone Support**: Uses device timezone via `Intl.DateTimeFormat()`

## Files Created/Modified

### 1. `/src/state/calorieTargetStore.ts` ✅ CREATED
Complete Zustand store with AsyncStorage persistence providing:

**Functions:**
- `saveCalorieTarget(targetKcal, targetProtein?, targetCarbs?, targetFats?, effectiveDate?)` - Save a new versioned target
- `getTargetForDate(date)` - Retrieve the appropriate target for any date
- `getAllVersions()` - Get complete version history
- `setTimezone(tz)` - Update user timezone
- `initializeDefaultTarget(...)` - Initialize with defaults on first load

**Helper Functions:**
- `getLocalDateString(date, timezone?)` - Convert Date to YYYY-MM-DD string
- `normalizeDateString(date)` - Parse any date format to normalized string

### 2. `/src/screens/SettingsScreen.tsx` ⏳ PARTIAL
- ✅ Imported `useCalorieTargetStore`
- ✅ Added `saveCalorieTarget` reference
- ⏳ Need to update `handleSaveGoals` function

### 3. `/src/state/settingsStore.ts` ⏳ PARTIAL
- ✅ Imported `useCalorieTargetStore`
- ⏳ Can optionally add migration logic

## How to Complete the Integration

### Step 1: Update Settings Screen's `handleSaveGoals`

In `/src/screens/SettingsScreen.tsx` around line 107, modify `handleSaveGoals`:

```typescript
const handleSaveGoals = () => {
  const newCalories = targetCalories ? parseInt(targetCalories) : undefined;
  const newProtein = targetProtein ? parseFloat(targetProtein) : undefined;
  const newCarbs = targetCarbs ? parseFloat(targetCarbs) : undefined;
  const newFats = targetFats ? parseFloat(targetFats) : undefined;

  // Save versioned calorie target (effective from today)
  if (newCalories) {
    saveCalorieTarget(newCalories, newProtein, newCarbs, newFats);
  }

  // Still update the settings store for backward compatibility
  updateFitnessGoals({
    targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
    targetCalories: newCalories,
    targetProtein: newProtein,
    targetCarbs: newCarbs,
    targetFats: newFats,
    weeklyWorkouts: weeklyWorkouts ? parseInt(weeklyWorkouts) : undefined,
    goal: selectedGoal,
    fitnessLevel: selectedLevel,
  });

  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setActiveSection(null);
};
```

### Step 2: Update NutritionScreen to Use Versioned Targets

In `/src/screens/NutritionScreen.tsx`:

```typescript
// Add at top with other imports
import { useCalorieTargetStore } from "../state/calorieTargetStore";

// Add in component
const getTargetForDate = useCalorieTargetStore((s) => s.getTargetForDate);

// Replace line 229-232 (the hardcoded fallbacks) with:
const versionedTarget = getTargetForDate(selectedDate);
const targetCalories = versionedTarget?.target_kcal || fitnessGoals.targetCalories || 2000;
const targetProtein = versionedTarget?.target_protein || fitnessGoals.targetProtein || 150;
const targetCarbs = versionedTarget?.target_carbs || fitnessGoals.targetCarbs || 200;
const targetFats = versionedTarget?.target_fats || fitnessGoals.targetFats || 67;
```

### Step 3: Initialize Default Targets on First Launch

Add initialization logic in `App.tsx` or a useEffect in the main app component:

```typescript
import { useCalorieTargetStore } from "./src/state/calorieTargetStore";
import { useSettingsStore } from "./src/state/settingsStore";

// In main component
useEffect(() => {
  const initializeDefaultTarget = useCalorieTargetStore.getState().initializeDefaultTarget;
  const fitnessGoals = useSettingsStore.getState().fitnessGoals;

  // Initialize with current settings if no versions exist
  initializeDefaultTarget(
    fitnessGoals.targetCalories || 2000,
    fitnessGoals.targetProtein || 150,
    fitnessGoals.targetCarbs || 200,
    fitnessGoals.targetFats || 67
  );
}, []);
```

## Usage Examples

### Save a New Target (Effective Today)
```typescript
saveCalorieTarget(2200, 160, 220, 70);
```

### Get Target for a Specific Date
```typescript
const target = getTargetForDate(new Date('2025-10-20'));
console.log(target?.target_kcal); // e.g., 2000
```

### Get Target for Today
```typescript
const todayTarget = getTargetForDate(new Date());
console.log(todayTarget?.target_kcal);
```

## Behavior Examples

### Scenario 1: User Changes Goal Mid-Month
- **Oct 1-20**: User had 2000 kcal target
- **Oct 21**: User updates to 2200 kcal
- **Result**:
  - Oct 1-20 days still show 2000 kcal target
  - Oct 21 onward show 2200 kcal target

### Scenario 2: Multiple Changes Same Day
- User updates target twice on Oct 21
- Only the latest update applies (newest `created_at`)

### Scenario 3: No Target Set
- Returns `null`
- Fallback to `fitnessGoals.targetCalories` from settings store

## Data Storage
- **Store**: Zustand with AsyncStorage persistence
- **Storage Key**: `calorie-target-storage`
- **Format**: JSON with versioned array

## Testing Checklist
- [ ] Change calorie goal in Settings → verify new version created
- [ ] Check nutrition screen for today → should show new target
- [ ] Check nutrition screen for yesterday → should show old target
- [ ] Change goal multiple times same day → latest should apply
- [ ] Restart app → versions should persist
- [ ] Check with different dates in calendar view

## Migration Notes
- Existing users will need their current `fitnessGoals.targetCalories` migrated to a versioned entry
- Add migration logic in `App.tsx` or initial load hook
- Backward compatible: still updates `settingsStore` for any code that hasn't been updated yet

## Future Enhancements
1. UI to view target history
2. Ability to set future targets (e.g., "increase to 2500 kcal starting next Monday")
3. Export target history for analytics
4. Sync targets across devices

## Notes
- Timezone is detected automatically from device via `Intl.DateTimeFormat().resolvedOptions().timeZone`
- All dates stored as YYYY-MM-DD strings for consistency
- No server/backend required - fully client-side with AsyncStorage
