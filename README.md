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
- **Data Fetching & Caching**: React Query (TanStack Query)
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Animations**: Reanimated
- **List Virtualization**: FlashList (@shopify/flash-list)
- **UI Components**: Custom components with Ionicons
- **Date/Time**: @react-native-community/datetimepicker
- **Slider**: @react-native-community/slider

## Performance Optimizations

### Data Fetching & Caching
- **React Query Integration**: All community and leaderboard data is cached with React Query
  - 5-minute cache for community lists
  - 30-second cache for leaderboard data
  - Automatic background refetching on window focus and reconnect
  - Smart cache invalidation on data mutations
- **Query Keys**: Organized hierarchical query keys for efficient cache management
  - `['communities', 'list']` - All communities
  - `['communities', 'detail', id]` - Individual community
  - `['communities', 'leaderboard', id, metric, timeframe]` - Leaderboard data

### Optimistic UI Updates
- **Join/Leave Communities**: Instant UI updates with automatic rollback on error
- **Post Reactions**: Immediate like/unlike feedback with error recovery
- **Comments**: Optimistic comment additions with toast notifications
- **Error Handling**: Automatic error toasts and state rollback on failures

### List Virtualization
- **FlashList Implementation**: High-performance virtualized lists for:
  - Community post feeds (replaces standard FlatList)
  - Member lists with alphabetic navigation
  - Leaderboard rankings
- **Benefits**:
  - 10x better performance for large lists
  - Lower memory footprint
  - Smooth 60fps scrolling even with 1000+ items
  - Automatic view recycling

### Image Optimization
- **OptimizedImage Component**: Custom image component with:
  - Responsive sizing based on target dimensions
  - Lazy loading with loading indicators
  - CDN optimization for Cloudinary/Imgix URLs (automatic width parameters)
  - 2x resolution for retina displays
  - Error state handling with fallback UI
  - Fade-in animations on load completion

### Leaderboard Optimizations
- **Pagination**: 25 items per page with "Load More" button
- **Auto-Revalidation**:
  - Refetches every 30 seconds while leaderboard modal is open
  - Refetches on app return to foreground
  - Refetches when metric/timeframe filters change
- **Smart Polling**: Polling only active when modal is visible (saves battery & bandwidth)

### Cache Invalidation Strategy
- **Join/Leave Actions**: Invalidates community lists and leaderboard caches
- **New Posts**: Invalidates community detail cache
- **Stat Updates**: Triggers leaderboard refetch
- **Timeframe Changes**: Automatic cache update on filter changes

### Performance Monitoring
- **React Query DevTools**: Available in development for cache inspection
- **Optimistic UI**: All mutations use optimistic updates for instant feedback
- **Background Refetching**: Keeps data fresh without user interaction

### Components
```
src/
├── components/
│   ├── OptimizedImage.tsx          # Lazy-loaded, responsive images
│   ├── VirtualizedCommunityLists.tsx # FlashList implementations
│   ├── LeaderboardModal.tsx        # Smart leaderboard with polling
│   └── Toast.tsx                   # Global toast notifications
├── hooks/
│   └── useCommunityQueries.ts      # React Query hooks
└── providers/
    └── QueryProvider.tsx           # React Query configuration
```

### Usage Examples

**Using React Query hooks:**
```tsx
import { useCommunities, useJoinCommunity, useLeaveCommunity } from '@/hooks/useCommunityQueries';

// Cached community list
const { data: communities, isLoading } = useCommunities();

// Optimistic join with error handling
const joinMutation = useJoinCommunity();
joinMutation.mutate({ communityId, userId });

// Optimistic leave with rollback
const leaveMutation = useLeaveCommunity();
leaveMutation.mutate({ communityId, userId });
```

**Using virtualized lists:**
```tsx
import { VirtualizedPostList } from '@/components/VirtualizedCommunityLists';

<VirtualizedPostList
  posts={posts}
  currentUserId={userId}
  isDark={isDark}
  onLikePost={(postId) => likeMutation.mutate({ communityId, postId, userId })}
/>
```

**Using optimized images:**
```tsx
import { OptimizedImage } from '@/components/OptimizedImage';

<OptimizedImage
  source={{ uri: imageUrl }}
  width={200}
  aspectRatio={16/9}
  showLoader={true}
/>
```

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

### Nutrition Screen Animation Improvements (Latest)
- **Smooth Progress Bar Transitions**: Fixed jarring reset animations when switching between days
  - Calorie progress bar now animates fluidly from previous value to new value
  - Protein, Carbs, and Fat macro bars transition seamlessly between days
  - Eliminated "reset to zero then jump to max" behavior
  - Implemented spring animations with optimized damping (20), stiffness (90), and mass (0.5)
  - Progress bars now show true consumption amounts with smooth interpolation
- **Technical Implementation**:
  - Calorie bar uses `useSharedValue` and `useAnimatedStyle` for smooth width transitions
  - Macro bars calculate target percentage upfront to ensure stable animation reference
  - All animations respond to day changes with consistent spring physics
  - No more abrupt jumps when data changes dramatically between days

### Community Section Enhancements

#### Core Features
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

#### UX Enhancements (NEW)

**Loading States:**
- Skeleton loaders for all list views (communities, members, leaderboard)
- Shimmer placeholders for header stats
- Smooth loading animations with realistic timing
- Components: `SkeletonLoader.tsx`

**Success Animations:**
- 🎉 **Confetti Burst** - Triggered on Create Community action
  - 30 animated particles with random colors and trajectories
  - 2-second animation with fade out
- ✨ **Pulse Glow** - Applied to Join button on successful join
  - Soft scaling animation with colored glow ring
  - 1-second duration with spring physics
- 🏆 **Badge Pop** - Displayed when user rank changes
  - Rotating badge entrance with trophy icon
  - Expanding glow effect for celebration
  - Shows new rank number prominently
- Components: `SuccessAnimations.tsx`

**Toast Notifications:**
- Four toast types: Success, Error, Info, Warning
- Each with unique icon and gradient colors
- Auto-dismiss after 3 seconds (configurable)
- Smooth slide-down entrance animation
- Safe area aware positioning
- Toast triggers:
  - ✅ Copy Invite Code → Success toast
  - ✅ Joined Community → Success toast
  - ⚠️ Left Community → Info toast
  - 📤 Join Request Sent → Success toast
  - ✅ Request Accepted → Success toast
  - ⚠️ Request Declined → Warning toast
  - ❌ Invalid Code → Error toast
- Components: `Toast.tsx` with `ToastProvider` context

**Empty & Error States:**
- Beautifully designed empty states with gradient icons
- Actionable CTAs for each scenario
- Tab-specific empty states:
  - **Communities Tab**: "No Communities Yet" with Create CTA
  - **Members Tab**: "No Members Yet" encouraging first join
  - **Leaderboard Tab**: "No Rankings Yet" prompting workouts
  - **Search**: "No Results Found" with helpful message
- Error states with retry functionality:
  - Network errors with connection icon
  - Load failures with retry button
  - Invalid invite codes with key icon
  - Join failures with error messaging
- Components: `EmptyErrorStates.tsx`

**Pull-to-Refresh:**
- Native RefreshControl on all scrollable lists
- Theme-aware spinner colors (blue/purple gradient)
- Haptic feedback on pull start
- Success haptic + toast on complete
- Scroll position restoration after refresh
- Implementation in `IntegrationExample.tsx`

**Haptic Feedback:**
- Comprehensive haptic system already implemented in `src/utils/haptics.ts`
- Applied to all key actions:
  - **Light haptic**: Join, Leave, Copy actions
  - **Medium haptic**: Create Community, Send Request
  - **Success haptic**: Request Accepted, Rank Up
  - **Error haptic**: Failed actions, Invalid codes
- Special patterns:
  - `hapticCelebration()` - Triple burst for major achievements
  - `hapticPR()` - Progressive pattern for personal records
- Debounced to prevent over-firing (50ms threshold)

**Integration Example:**
- Complete reference implementation in `IntegrationExample.tsx`
- Shows proper usage of all UX features together
- Includes state management patterns
- Demonstrates async action handling
- Example screens for all three tabs

**File Structure:**
```
components/communities/
├── SkeletonLoader.tsx          # Shimmer loading states
├── SuccessAnimations.tsx       # Confetti, pulse, badge pop
├── Toast.tsx                   # Toast notification system
├── EmptyErrorStates.tsx        # Empty & error state components
├── IntegrationExample.tsx      # Complete usage reference
├── FlipCard.tsx                # Discover card flip interaction
├── AnimatedDropdown.tsx        # Animated dropdowns with persistence
├── MembersList.tsx             # Members list with lazy-load & alphabetic nav
├── MemberProfileModal.tsx      # Member profile modal with full details
├── LeaderboardCard.tsx         # Animated leaderboard with count-up & tooltips
├── JoinViaCodeDialog.tsx       # Enhanced join code dialog
├── LeaveConfirmDialog.tsx      # Leave confirmation with role transfer notice
├── EnhancedFAB.tsx             # FAB with long-press labels
└── USAGE_GUIDE.md             # Comprehensive usage documentation
```

#### Component Interactions & Details (NEW)

**Discover Card Flip:**
- Front/back flip interaction with smooth 3D rotation
- Auto-flip back after 3-5 seconds (configurable)
- Manual toggle on tap with haptic feedback
- Front shows: community image, title, description, member count, activity
- Back shows: full details, creator info, creation date, tags
- Preserves flip state during animation
- Components: `FlipCard.tsx`

**Metric/Timeframe Dropdowns:**
- Smooth animated open/close with spring physics
- Keyboard accessible (up/down arrows, enter to select)
- **Persists last selection per community** using AsyncStorage
- Storage key format: `dropdown_{persistKey}_{communityId}`
- Modal presentation with backdrop blur
- Checkmark on selected item
- Icon support for options
- Auto-loads saved preference on mount
- Components: `AnimatedDropdown.tsx`

**Members List Enhancements:**
- **Lazy-loading** with pagination (20 items per page)
- "Loading more..." indicator at bottom
- **Alphabetic jump navigation** (A-Z + #)
  - Shows on scroll, auto-hides after 2s
  - Only active letters are clickable
  - Smooth scroll to section on tap
- Alphabetic section headers
- **Tap member → Profile modal** with full details
- Role badges (Owner: star, Admin: shield)
- Online status indicators
- Member stats (workouts, points, streak)
- Staggered entrance animations
- Components: `MembersList.tsx`, `MemberProfileModal.tsx`

**Member Profile Modal:**
- Full-screen modal with blur backdrop
- Large gradient avatar with online indicator
- Role badge with appropriate colors
- Stats grid (Workouts, Points, Streak)
- Join date and online status
- Action buttons:
  - Send Message (for all users)
  - Promote to Admin (owners/admins only)
  - Remove Member (owners/admins only)
- Gradient styling for owners (gold)
- Manages permissions based on current user role
- Components: `MemberProfileModal.tsx`

**Leaderboard Animations:**
- **Animated count-up numbers** (0 → final value)
- Staggered animation (1s base + 100ms per rank)
- Easing with cubic out for smooth deceleration
- **Podium styling for top 3:**
  - Rank 1: Gold gradient (#fbbf24 → #f59e0b)
  - Rank 2: Silver gradient (#d1d5db → #9ca3af)
  - Rank 3: Bronze gradient (#cd7f32 → #92400e)
- **Tie handling badge** (link icon) for tied ranks
- **Hover/tap tooltip** shows:
  - Current metric value
  - Change vs last period (with trend icon)
  - Tied status if applicable
- Long-press or tap to show tooltip
- Change indicators (↑ green, ↓ red, — gray)
- Components: `LeaderboardCard.tsx`

**Join via Code Dialog:**
- **Automatic paste detection** from clipboard
- Auto-fills if valid 8-character code found
- **Automatic uppercase formatting**
- Only allows alphanumeric characters (A-Z, 0-9)
- **Real-time validity check** with 500ms debounce
- Visual states:
  - Idle: gray border
  - Valid: green border + checkmark
  - Invalid: red border + X icon
  - Validating: blue sync icon
- Manual paste button when input empty
- Character counter (0/8)
- Error messages for invalid codes
- Disabled join button until valid
- Auto-focus on open
- Components: `JoinViaCodeDialog.tsx`

**Leave Confirmation Dialog:**
- **Role-specific messaging:**
  - Members: standard leave confirmation
  - Admins: can leave freely
  - Owners: shows transfer notice
- **Owner with other members:**
  - Warning about automatic ownership transfer
  - Shows most senior admin will become owner
  - Displays remaining member count
  - Yellow warning badge with star icon
- **Owner with no members:**
  - Critical warning: community will be deleted
  - Red danger badge with alert icon
  - Emphasizes permanent deletion
  - Button text changes to "Delete & Leave"
- **Consequences list:**
  - Lose access to content
  - Progress hidden
  - Can rejoin with code
- Gradient warning icon (orange → red)
- Separate cancel/confirm buttons
- Confirm button in red gradient
- Components: `LeaveConfirmDialog.tsx`

**Enhanced FAB (Floating Action Button):**
- **Long-press shows labels** for all actions
- Labels appear with staggered animation
- Tap outside to dismiss (backdrop + blur)
- Radial menu with staggered entrance (50ms delay each)
- Main button rotates 135° when expanded
- Action buttons:
  - Custom icon per action
  - Custom color per action
  - Custom label (shown on long-press)
- Spring physics for smooth animations
- Scale feedback on press
- Position: bottom-right, 24px margin
- Shadow elevation increases when expanded
- Components: `EnhancedFAB.tsx`

**Usage Examples:**
```tsx
// Flip Card
<FlipCard
  frontContent={{
    title: "Fitness Warriors",
    description: "Join us for daily challenges",
    members: 124,
    activity: "Active today"
  }}
  backContent={{
    details: "A community focused on strength training...",
    creator: "John Doe",
    createdDate: "Jan 15, 2024",
    tags: ["Strength", "Motivation", "Daily Challenges"]
  }}
  autoFlipDuration={4000}
  isDark={isDark}
/>

// Animated Dropdown with Persistence
<AnimatedDropdown
  label="Metric"
  options={[
    { label: "Workouts", value: "workouts", icon: "barbell" },
    { label: "Points", value: "points", icon: "trophy" },
    { label: "Streak", value: "streak", icon: "flame" }
  ]}
  selectedValue={metric}
  onSelect={setMetric}
  persistKey="leaderboard_metric"
  communityId={communityId}
  isDark={isDark}
/>

// Members List with Lazy Load
<MembersList
  members={members}
  onMemberPress={(member) => setSelectedMember(member)}
  onLoadMore={loadMoreMembers}
  isLoadingMore={loading}
  hasMore={hasMore}
  isDark={isDark}
/>

// Leaderboard Card
<LeaderboardCard
  entry={{
    id: "1",
    rank: 1,
    name: "Jane Doe",
    value: 156,
    change: 12,
    isTied: false
  }}
  metric="workouts"
  isDark={isDark}
  index={0}
  onPress={(entry) => console.log(entry)}
/>

// Enhanced FAB
<EnhancedFAB
  actions={[
    {
      icon: "add-circle",
      label: "Create Community",
      color: "#3b82f6",
      onPress: handleCreate
    },
    {
      icon: "share-social",
      label: "Share Invite",
      color: "#10b981",
      onPress: handleShare
    },
    {
      icon: "create",
      label: "New Post",
      color: "#f59e0b",
      onPress: handlePost
    }
  ]}
  isDark={isDark}
/>
```


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

## Design System & Theming

### Centralized Design Tokens

The app uses a comprehensive design token system located in `src/theme/designTokens.ts` for consistent visual styling across all components.

#### Spacing System (8pt Grid)
```typescript
spacing = {
  xs: 4,    sm: 8,    md: 12,   base: 16,
  lg: 20,   xl: 24,   '2xl': 32, '3xl': 40,
  '4xl': 48, '5xl': 64, '6xl': 80
}
```

#### Border Radius
```typescript
radius = {
  none: 0,   sm: 8,    md: 12,   base: 16,
  lg: 20,    xl: 24,   '2xl': 28, '3xl': 32,
  full: 9999
}
```

#### Color Palette

**Dark Theme (Primary):**
- Background: `bg.primary` (#0f172a), `bg.secondary` (#1e293b), `bg.tertiary` (#334155)
- Text: `text.primary` (#f8fafc), `text.secondary` (#cbd5e1), `text.tertiary` (#94a3b8)
- Brand: `brand.primary` (#3b82f6), `brand.secondary` (#8b5cf6), `brand.accent` (#06b6d4)
- Semantic: `semantic.success` (#10b981), `warning` (#f59e0b), `error` (#ef4444)

**Light Theme (Optional):**
- Background: `bg.primary` (#ffffff), `bg.secondary` (#f8fafc), `bg.tertiary` (#f1f5f9)
- Text: `text.primary` (#0f172a), `text.secondary` (#475569), `text.tertiary` (#64748b)
- Brand and semantic colors remain consistent with dark theme

**Podium Colors:**
```typescript
podium: {
  gold:   { primary: '#fbbf24', secondary: '#f59e0b', dark: '#d97706' }
  silver: { primary: '#e5e7eb', secondary: '#d1d5db', dark: '#9ca3af' }
  bronze: { primary: '#f97316', secondary: '#ea580c', dark: '#c2410c' }
}
```

#### Gradients

**Podium Gradients** (matching screenshots):
- Gold: `['#fbbf24', '#f59e0b', '#d97706']`
- Silver: `['#f8fafc', '#e5e7eb', '#cbd5e1']`
- Bronze: `['#f97316', '#ea580c', '#c2410c']`

**Brand Gradients:**
- Primary: `['#3b82f6', '#8b5cf6']`
- Secondary: `['#8b5cf6', '#ec4899']`
- Accent: `['#06b6d4', '#3b82f6']`

#### Elevations & Shadows

Shadows scale by depth (xs → 3xl):
```typescript
elevation = {
  xs:  { shadowOffset: {0,1},  shadowOpacity: 0.05, shadowRadius: 2,  elevation: 1 }
  sm:  { shadowOffset: {0,2},  shadowOpacity: 0.08, shadowRadius: 4,  elevation: 2 }
  md:  { shadowOffset: {0,4},  shadowOpacity: 0.12, shadowRadius: 8,  elevation: 4 }
  lg:  { shadowOffset: {0,8},  shadowOpacity: 0.16, shadowRadius: 12, elevation: 8 }
  xl:  { shadowOffset: {0,12}, shadowOpacity: 0.2,  shadowRadius: 16, elevation: 12 }
  '2xl': { shadowOffset: {0,16}, shadowOpacity: 0.24, shadowRadius: 24, elevation: 16 }
  '3xl': { shadowOffset: {0,24}, shadowOpacity: 0.3,  shadowRadius: 32, elevation: 24 }
}
```

**Glow Shadows** for special elements (Gold, Silver, Bronze, Primary, Success):
```typescript
glowShadow.gold = {
  shadowColor: '#f59e0b',
  shadowOffset: {0, 4},
  shadowOpacity: 0.4,
  shadowRadius: 12,
  elevation: 8
}
```

#### Glassmorphism Effects

Headers and overlays use subtle glassmorphism:
```typescript
getGlassmorphismStyle(isDark) // Returns backdrop blur + border
```

**Usage:**
```tsx
<BlurView
  intensity={blur.medium}
  style={getGlassmorphismStyle(isDark)}
>
  {/* Header content */}
</BlurView>
```

#### Inner Light Borders

Selected/focused cards have subtle inner light edge:
```typescript
getInnerLightBorder(isDark) // Returns border width + color
```

**Applied to podium cards:**
```tsx
<View style={[styles.card, podiumGradient && getInnerLightBorder(isDark)]}>
```

#### Typography

- Font Families: System (iOS), Roboto (Android)
- Font Sizes: xs (11px) → 6xl (48px)
- Font Weights: regular (400), medium (500), semibold (600), bold (700)
- Line Heights: tight (1.2), snug (1.375), normal (1.5), relaxed (1.625)
- Letter Spacing: tighter (-0.8) → wider (0.8)

#### Animation System

**Durations:**
```typescript
duration = {
  instant: 0, fast: 150, normal: 250,
  slow: 400, slower: 600, slowest: 1000
}
```

**Easings:**
```typescript
easing = {
  linear, ease, easeIn, easeOut, easeInOut,
  spring: { damping: 15, stiffness: 150 },
  bouncy: { damping: 8, stiffness: 100 }
}
```

### Micro-Animations

Located in `components/communities/MicroAnimations.tsx`:

#### 1. Rank Bump Animation
Celebrates rank changes with bump effect:
```tsx
<RankBumpAnimation rank={1} isDark={isDark} size={32} />
```
- Scales 1 → 1.3 → 1 with spring physics
- Rotates -10° → 10° → 0° for attention
- Triggers on rank prop change

#### 2. Copy Success Animation
Shows checkmark feedback when code is copied:
```tsx
<CopySuccessAnimation isDark={isDark} size={24} />
```
- Scales up with spring, fades in
- Auto-dismisses after 2 seconds
- Green checkmark icon

#### 3. Join Pulse Animation
Pulsing effect to draw attention to join buttons:
```tsx
<JoinPulseAnimation enabled={true}>
  <Button>Join</Button>
</JoinPulseAnimation>
```
- Continuous 1.0 ↔ 1.05 scale loop
- Opacity 0.8 ↔ 1.0 breathing effect
- Disabled when `enabled={false}`

#### 4. Shimmer Loading Animation
Elegant loading placeholders:
```tsx
<ShimmerAnimation
  width={200}
  height={80}
  borderRadius={16}
  isDark={isDark}
/>
```
- Sliding shimmer gradient effect
- Matches component dimensions
- Theme-aware colors

#### 5. Floating Animation
Subtle floating effect for emphasis:
```tsx
<FloatingAnimation enabled={true} distance={4}>
  <Card />
</FloatingAnimation>
```
- Gentle vertical movement (-4px ↔ +4px)
- 2-second easing loop
- Great for hero elements

#### 6. Confetti Burst
Celebration animation for achievements:
```tsx
<ConfettiBurstAnimation isDark={isDark} />
```
- Scale 0 → 1.5 with spring
- 360° rotation
- Fades out over 800ms

### Iconography

Located in `components/communities/Iconography.tsx`:

#### Podium Medals
Filled gradient medals for top 3 ranks:
```tsx
<PodiumMedal
  rank={1}           // 1, 2, or 3
  size={48}
  animated={true}
  isDark={isDark}
/>
```
- Renders gradient-filled medal with appropriate colors
- Optional zoom-in animation
- Includes elevation shadows

#### Trophy Icon
```tsx
<TrophyIcon
  size={24}
  color="#f59e0b"
  animated={true}
  variant="filled"   // 'filled' or 'outline'
/>
```

#### Rank Badge
Circular badge with rank number:
```tsx
<RankBadge
  rank={5}
  size={36}
  isPodium={false}   // Applies gradient if true and rank ≤ 3
  isDark={isDark}
/>
```

#### Community Icons
Consistent icon set with outline/filled variants:
```tsx
<CommunityIcon
  name="members"     // members, workouts, streak, points, leaderboard, etc.
  size={24}
  color="#3b82f6"
  variant="outline"  // 'outline' or 'filled'
/>
```

**Available icons:**
- members, workouts, streak, points, leaderboard
- settings, share, copy, check, close
- add, remove, edit, search, filter, more

#### Change Indicator
Shows rank/stat changes with color-coded icons:
```tsx
<ChangeIndicator
  change={12}        // Positive = green ↑, Negative = red ↓, 0 = gray —
  size={16}
  showValue={true}
  isDark={isDark}
/>
```

### Components

**Glassmorphic Header:**
```tsx
import { GlassmorphicHeader } from '@/components/communities/GlassmorphicHeader';

<GlassmorphicHeader
  title="Leaderboard"
  subtitle="Weekly Rankings"
  rightComponent={<IconButton />}
  leftComponent={<BackButton />}
  isDark={isDark}
/>
```

### Usage Examples

**Using Design Tokens:**
```tsx
import {
  spacing,
  radius,
  elevation,
  darkTheme,
  lightTheme,
  gradients,
  getPodiumGradient,
  getPodiumGlowShadow,
  getInnerLightBorder,
  getGlassmorphismStyle,
} from '@/theme/designTokens';

const theme = isDark ? darkTheme : lightTheme;

<View
  style={{
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: theme.bg.secondary,
    ...elevation.md,
  }}
>
  <Text style={{ color: theme.text.primary }}>Hello</Text>
</View>
```

**Podium Card with Gradients:**
```tsx
const podiumGradient = getPodiumGradient(rank);
const podiumShadow = getPodiumGlowShadow(rank);

{podiumGradient && (
  <LinearGradient
    colors={podiumGradient.colors}
    start={podiumGradient.start}
    end={podiumGradient.end}
    style={[styles.card, podiumShadow, getInnerLightBorder(isDark)]}
  >
    {/* Card content */}
  </LinearGradient>
)}
```

**Using Animations:**
```tsx
import {
  RankBumpAnimation,
  CopySuccessAnimation,
  JoinPulseAnimation,
} from '@/components/communities/MicroAnimations';

// Rank change celebration
<RankBumpAnimation rank={newRank} isDark={isDark} />

// Copy feedback
{showCopySuccess && <CopySuccessAnimation isDark={isDark} />}

// Pulsing join button
<JoinPulseAnimation enabled={!isMember}>
  <JoinButton onPress={handleJoin} />
</JoinPulseAnimation>
```

### Theme Consistency Guidelines

1. **Always use design tokens** instead of hardcoded values
2. **Use theme variables** for colors (`theme.text.primary` not `"#f8fafc"`)
3. **Apply appropriate elevations** based on visual hierarchy
4. **Use podium gradients** for ranks 1-3 in leaderboards
5. **Add inner light borders** to selected/focused states
6. **Include micro-animations** for delightful interactions
7. **Use consistent iconography** (CommunityIcon components)
8. **Apply glassmorphism** to headers and overlays
9. **Maintain 8pt spacing grid** for layouts
10. **Use semantic colors** for success/error/warning states

