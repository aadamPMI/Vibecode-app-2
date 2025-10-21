# Program System Guide

## How the Workout Program System Works

Your fitness app has a sophisticated program management system that automatically schedules and tracks your workouts. Here's how everything connects:

### 1. **Creating Programs**

**Location**: Program Manager Screen (`ProgramManagerScreen.tsx`)

- Create a new training program (e.g., "Push Pull Legs", "Upper Lower")
- Define your workout split rotation (e.g., Push, Pull, Legs, Rest, repeat)
- Set program duration (e.g., 12 weeks)
- Add workout templates for each day

### 2. **Activating a Program**

**How it works:**
- Only ONE program can be active at a time
- Tap "Activate" on any program in the Program Manager
- The system sets this as your `activeProgram` in the training store
- The active program becomes your current training schedule

**What it does:**
- Automatically schedules workouts based on your split rotation
- Calculates which workout you should do each day
- Tracks your progress through the program weeks

### 3. **Today's Workout Detection**

**Automatic Scheduling** (`scheduler.ts`):

When you navigate to the Workout Home Screen:
- The system checks your active program
- Calculates days since program start
- Determines current week number
- Maps today to your rotation pattern (e.g., Day 3 = "Legs")
- Finds the matching workout template
- Displays it as "Today's Workout"

**Example Rotation:**
```
Pattern: ["Push", "Pull", "Legs", "Rest", "Push", "Pull", "Legs"]
Day 0: Push
Day 1: Pull  
Day 2: Legs
Day 3: Rest Day
Day 4: Push
... (repeats)
```

### 4. **Beginning a Workout**

**Flow:**

1. **Tap "Begin Workout"** → Opens `ActiveWorkoutScreen`

2. **Automatic Session Creation:**
   - System gets today's workout template
   - Creates a new Session from the template
   - Pre-fills exercise list with your programmed exercises
   - Sets up empty set logs ready for input
   - Starts the session timer

3. **Pre-loaded Exercises:**
   - All exercises from today's template are listed
   - Sets are pre-populated based on your program
   - Previous performance data may be shown
   - Target reps/loads are displayed

### 5. **During Workout**

**Features Available:**

- **View All Exercises**: Scroll through your complete workout
- **Input Sets**: Enter weight, reps, and RPE for each set
- **Swap Exercises**: Tap the swap icon (⇄) to substitute any exercise
- **Track Progress**: See completion percentage at the top
- **Pause**: Save progress and resume later
- **Complete**: Finish and save the session

**Exercise Swapping:**
- Tap the swap icon on any exercise
- Opens Exercise Selector
- Choose a replacement exercise
- System maintains your set/rep scheme
- Continue logging with the new exercise

### 6. **Data Persistence**

**What Gets Saved:**

- Active program selection
- All completed sessions
- Exercise performance history
- Volume tracking
- Personal records
- E1RM calculations
- Progress photos (if enabled)

**Storage:**
- Uses Zustand with AsyncStorage
- Data persists across app restarts
- Program progress continues automatically

### 7. **Program Progression**

**Week-to-Week:**
- System tracks which week you're in
- Can apply deload modifications
- Monitors adherence rate
- Suggests rest days
- Alerts when program completes

**Automatic Features:**
- Missed session tracking
- Adherence rate calculation
- Progressive overload suggestions
- Volume load monitoring

## Key Files

### State Management
- `trainingStore.ts` - Central state for programs, sessions, exercises
- Handles all CRUD operations for workouts

### Services
- `scheduler.ts` - Workout scheduling logic
- `progressionEngine.ts` - Progressive overload calculations
- `prDetection.ts` - Personal record tracking

### Screens
- `ProgramManagerScreen` - Create/manage programs
- `WorkoutHomeScreen` - Shows today's scheduled workout
- `ActiveWorkoutScreen` - In-workout logging interface
- `ProgramBuilderScreen` - Build custom programs

## User Workflow Summary

```
1. Create Program
   ↓
2. Activate Program
   ↓
3. System Schedules Workouts
   ↓
4. See Today's Workout (Home Screen)
   ↓
5. Tap "Begin Workout"
   ↓
6. Exercises Pre-loaded Automatically
   ↓
7. Log Sets (Weight, Reps, RPE)
   ↓
8. Optional: Swap Exercises
   ↓
9. Complete Workout
   ↓
10. System Saves Data & Updates Progress
```

## Benefits of This System

✅ **Automatic Scheduling** - No manual planning needed
✅ **Progress Tracking** - Complete history of every workout  
✅ **Flexibility** - Swap exercises on the fly
✅ **Smart Recommendations** - AI-powered progressive overload
✅ **Data Persistence** - Never lose your progress
✅ **Week Awareness** - Knows exactly where you are in your program
✅ **Rest Day Detection** - Automatically shows rest days
✅ **Program Rotation** - Handles complex split patterns

## Current Implementation Status

✅ Program creation and management
✅ Program activation system
✅ Automatic workout scheduling  
✅ Session creation from templates
✅ Exercise pre-loading
✅ Set logging (weight, reps, RPE)
✅ Exercise swapping during workout
✅ Progress tracking
✅ Data persistence
✅ Week/day calculation
✅ Rest day detection

The system is **fully functional** and ready to use!
