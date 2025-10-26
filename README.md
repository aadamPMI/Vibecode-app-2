# GainAI - AI-Powered Fitness App

GainAI is a comprehensive fitness application built with React Native and Expo that provides personalized workout plans, nutrition tracking, and community features powered by AI.

## Features

### 1. Onboarding Flow
A comprehensive 18-step onboarding process that collects user data and generates personalized training plans:

1. **Welcome Screen** - Initial landing with app overview
2. **Intro Promo** - Feature highlights (adaptive training, nutrition, community, progress, science-based)
3. **Gender Selection** - Personalizes recovery and load targets
4. **Workout Frequency** - 0-2x, 3-5x, or 6+ times per week
5. **Experience Level** - Beginner, Intermediate, or Advanced
6. **Equipment Access** - Multi-select equipment availability
7. **Motivation Promo** - Progress statistics and motivation
8. **Height & Weight** - Both metric and imperial support
9. **Age Input** - Date picker for birthdate
10. **Goal Setting** - Build muscle, get stronger, lose fat, or improve endurance
    - Includes body focus slider (Strength ↔ Hypertrophy) for muscle/strength goals
11. **Progress Projection** - Visual representation of potential progress
12. **Community** - Crew/group recommendations
13. **Existing Plans** - Check if user has existing diet/training plans
14. **Final Promo** - GainAI as adaptive coach messaging
15. **Program Preview** - Show generated program summary
16. **AI Generation** - Loading screen with realistic AI tasks
17. **Plan Summary** - Complete AI-generated plan details
18. **Ready Screen** - Final confirmation before entering app

### 2. Core Features
- **Workout Tracking** - Log exercises, sets, reps, and weight
- **Nutrition Tracking** - Calorie and macro tracking
- **Progress Analytics** - Charts and statistics
- **Community/Crews** - Social features and group accountability
- **AI-Powered Recommendations** - Adaptive training and nutrition suggestions

### 3. Data Collection
The onboarding flow collects:
- Personal info (age, gender, height, weight)
- Fitness goals and experience level
- Workout frequency and available equipment
- Body composition focus (strength vs hypertrophy)
- Existing plans and preferences

## Tech Stack

- **Framework**: React Native 0.76.7 with Expo SDK 53
- **Navigation**: React Navigation v7
- **State Management**: Zustand
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Animations**: Reanimated
- **UI Components**: Custom components with Ionicons
- **Date/Time**: @react-native-community/datetimepicker
- **Slider**: @react-native-community/slider

## Project Structure

```
src/
├── screens/
│   ├── onboarding/
│   │   ├── WelcomeScreen.tsx
│   │   ├── IntroPromoScreen.tsx
│   │   ├── GenderScreen.tsx
│   │   ├── WorkoutFrequencyScreen.tsx
│   │   ├── ExperienceLevelScreen.tsx
│   │   ├── EquipmentAccessScreen.tsx
│   │   ├── MotivationPromoScreen.tsx
│   │   ├── HeightWeightScreen.tsx
│   │   ├── AgeScreen.tsx
│   │   ├── FitnessGoalScreen.tsx
│   │   ├── ProgressProjectionScreen.tsx
│   │   ├── CommunityScreen.tsx
│   │   ├── ExistingPlansScreen.tsx
│   │   ├── FinalPromoScreen.tsx
│   │   ├── ProgramPreviewScreen.tsx
│   │   ├── GeneratingScreen.tsx
│   │   ├── PlanSummaryScreen.tsx
│   │   └── ReadyScreen.tsx
│   └── [other screens]
├── components/
│   └── onboarding/
│       ├── OnboardingButton.tsx
│       └── ProgressIndicator.tsx
├── navigation/
│   └── OnboardingNavigator.tsx
├── state/
│   ├── onboardingStore.ts
│   ├── authStore.ts
│   └── settingsStore.ts
├── utils/
│   └── onboarding-utils.ts
└── api/
    └── onboarding-ai.ts
```

## Onboarding Data Model

```typescript
interface OnboardingData {
  // Personal Info
  dateOfBirth?: Date;
  age?: number;
  gender?: "male" | "female" | "other";
  heightCm?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;

  // Workout Info
  workoutFrequency?: "0-2" | "3-5" | "6+";
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  equipment?: string[]; // bodyweight, dumbbells, barbell, machines, bands, kettlebells, pullup_bar

  // Goals
  primaryGoal?: "build_muscle" | "get_stronger" | "lose_fat" | "improve_endurance";
  bodyFocus?: "strength" | "hypertrophy" | "balanced";

  // Existing Plans
  hasExistingPlan?: boolean;
  existingPlanType?: "diet" | "training" | "community" | "none";
}
```

## Running the App

The app is configured to run automatically on port 8081. Changes are reflected in real-time via hot reload.

```bash
# Install dependencies
bun install

# Start Expo dev server (already running)
npx expo start
```

## Design Philosophy

1. **User-Centric**: Collects comprehensive data upfront to provide truly personalized experiences
2. **Motivational**: Progress projections and statistics to keep users engaged
3. **Transparent**: Shows AI generation process to build trust
4. **Beautiful**: Consistent design system with smooth animations and haptic feedback
5. **Adaptive**: Plans adjust based on user's specific goals, experience, and available equipment

## Recent Updates

### Community Section Enhancements (Latest)
- **Floating Action Button (FAB)** with radial menu for quick actions:
  - Create Community
  - Share Invite Code
  - New Post
- **Enhanced Header** with "GainAI • Community" branding and user avatar button
- **My Communities Screen** improvements:
  - Activity status chips (Active today, Active Xd ago)
  - Improved action buttons (View, Copy Invite)
  - Better visual hierarchy with glass morphism effects
- **Community Detail Modal** enhancements:
  - Improved copy invite functionality with success toast
  - Better button styling and interactions
- **Members Tab** upgrades:
  - Avatar initials display
  - Online status indicators (green dot)
  - Enhanced member cards with role badges
- **Leaderboard Tab** improvements:
  - Dropdown filters for Metric (Workouts, Points, Streak)
  - Dropdown filters for Timeframe (Week, Month, All Time)
  - Podium-style gold/silver/bronze gradients for top 3
  - Dynamic metric display
- **Copy-to-Clipboard** functionality with animated success toast
- All UI elements maintain existing rounded corners (16-20px) and shadow effects

### Onboarding Redesign
- Complete 18-step onboarding flow
- Added body focus slider for strength vs hypertrophy preference
- Equipment multi-select functionality
- Community/Crew introduction
- Enhanced AI generation screen with realistic task names
- Program preview before generation
- Comprehensive plan summary screen
- Improved data collection for better personalization

## Notes

- All screens support both light and dark mode
- Haptic feedback on all interactive elements
- Animations for smooth UX transitions
- Progress indicators removed from individual screens for cleaner design
- Metric and imperial unit support throughout
