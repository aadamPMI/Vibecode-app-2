# Communities UX Features - Quick Usage Guide

This guide shows you how to use all the new UX features in the Communities section.

## 1. Toast Notifications

### Setup (App-wide)
First, wrap your app with the `ToastProvider`:

```tsx
import { ToastProvider } from './components/communities/Toast';

function App() {
  return (
    <ToastProvider>
      {/* Your app content */}
    </ToastProvider>
  );
}
```

### Usage in Components
```tsx
import { useToast } from './components/communities/Toast';

function MyCommunityScreen() {
  const { showToast } = useToast();

  const handleAction = () => {
    // Show success toast
    showToast('Community created!', 'success');

    // Show error toast
    showToast('Failed to join', 'error');

    // Show info toast
    showToast('Left community', 'info');

    // Show warning toast
    showToast('Request declined', 'warning');
  };
}
```

## 2. Loading States (Skeletons)

### Usage
```tsx
import {
  CommunityCardSkeleton,
  MemberCardSkeleton,
  LeaderboardCardSkeleton,
  HeaderStatsSkeleton,
} from './components/communities/SkeletonLoader';

function CommunitiesScreen() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <ScrollView>
        <HeaderStatsSkeleton />
        <CommunityCardSkeleton />
        <CommunityCardSkeleton />
        <CommunityCardSkeleton />
      </ScrollView>
    );
  }

  return <YourContent />;
}
```

## 3. Success Animations

### Confetti Burst (Create Community)
```tsx
import { ConfettiBurst } from './components/communities/SuccessAnimations';

function CreateCommunityButton() {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleCreate = async () => {
    // Create community...
    setShowConfetti(true);

    // Auto-hide after animation
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <>
      {showConfetti && <ConfettiBurst onComplete={() => setShowConfetti(false)} />}
      <Button onPress={handleCreate}>Create Community</Button>
    </>
  );
}
```

### Pulse Glow (Join Button)
```tsx
import { PulseGlow } from './components/communities/SuccessAnimations';

function JoinButton() {
  const [justJoined, setJustJoined] = useState(false);

  const handleJoin = async () => {
    // Join logic...
    setJustJoined(true);
    setTimeout(() => setJustJoined(false), 1000);
  };

  return (
    <PulseGlow color="#10b981">
      <Button onPress={handleJoin}>
        {justJoined ? 'Joined!' : 'Join'}
      </Button>
    </PulseGlow>
  );
}
```

### Badge Pop (Rank Change)
```tsx
import { BadgePop } from './components/communities/SuccessAnimations';

function RankDisplay() {
  const [showBadge, setShowBadge] = useState(false);
  const [newRank, setNewRank] = useState<number | null>(null);

  const handleRankChange = (rank: number) => {
    setNewRank(rank);
    setShowBadge(true);
    setTimeout(() => setShowBadge(false), 3000);
  };

  return (
    <>
      {showBadge && newRank && (
        <View style={{ position: 'absolute', top: '40%', alignSelf: 'center', zIndex: 9999 }}>
          <BadgePop
            rank={newRank}
            color="#f59e0b"
            onComplete={() => setShowBadge(false)}
          />
        </View>
      )}
    </>
  );
}
```

## 4. Empty & Error States

### Empty States
```tsx
import { CommunityEmptyStates } from './components/communities/EmptyErrorStates';

function CommunitiesTab() {
  const [communities, setCommunities] = useState([]);
  const isDark = useColorScheme() === 'dark';

  if (communities.length === 0) {
    return (
      <CommunityEmptyStates.NoCommunities
        isDark={isDark}
        onAction={() => {/* Navigate to create */}}
      />
    );
  }

  // For other tabs:
  // <CommunityEmptyStates.NoMembers isDark={isDark} />
  // <CommunityEmptyStates.NoLeaderboard isDark={isDark} />
  // <CommunityEmptyStates.SearchNoResults isDark={isDark} />
}
```

### Error States
```tsx
import { CommunityErrorStates } from './components/communities/EmptyErrorStates';

function CommunitiesScreen() {
  const [error, setError] = useState<string | null>(null);
  const isDark = useColorScheme() === 'dark';

  if (error) {
    return (
      <CommunityErrorStates.LoadFailed
        isDark={isDark}
        onRetry={() => {
          setError(null);
          loadData();
        }}
      />
    );
  }

  // Other error states available:
  // <CommunityErrorStates.JoinFailed />
  // <CommunityErrorStates.InvalidCode />
  // <CommunityErrorStates.NetworkError />
}
```

## 5. Pull-to-Refresh

```tsx
function CommunitiesList() {
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToast();
  const isDark = useColorScheme() === 'dark';

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    hapticLight(); // Haptic on pull start

    try {
      await loadCommunities();
      showToast('Refreshed!', 'success');
      hapticSuccess(); // Haptic on success
    } catch (error) {
      showToast('Failed to refresh', 'error');
      hapticError(); // Haptic on error
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? '#3b82f6' : '#8b5cf6'}
          colors={['#3b82f6', '#8b5cf6']}
        />
      }
    >
      {/* Your content */}
    </ScrollView>
  );
}
```

## 6. Haptic Feedback

```tsx
import {
  hapticLight,
  hapticMedium,
  hapticSuccess,
  hapticError,
  hapticCelebration,
} from '../src/utils/haptics';

function CommunityActions() {
  const handleJoin = async () => {
    hapticMedium(); // On button press
    try {
      await joinCommunity();
      hapticSuccess(); // On success
    } catch {
      hapticError(); // On error
    }
  };

  const handleCopy = () => {
    hapticLight(); // Light feedback for copy
    // Copy logic...
  };

  const handleRankUp = () => {
    hapticCelebration(); // Special celebration pattern
    // Show rank badge...
  };

  return (
    <>
      <Button onPress={handleJoin}>Join</Button>
      <Button onPress={handleCopy}>Copy Code</Button>
    </>
  );
}
```

## Complete Integration Example

See `components/communities/IntegrationExample.tsx` for a complete working example that shows:
- All loading states
- Success animations
- Toast notifications
- Empty/error states
- Pull-to-refresh
- Haptic feedback
- Proper state management
- Async action handling

## Best Practices

1. **Loading States**: Always show skeleton loaders during data fetching
2. **Toasts**: Keep messages short (1-2 lines) and use appropriate types
3. **Haptics**: Use light for UI interactions, medium for confirmations, success for achievements
4. **Empty States**: Provide actionable CTAs when possible
5. **Error States**: Always include retry functionality
6. **Animations**: Don't overuse - save confetti for major achievements only
7. **Pull-to-Refresh**: Combine with haptics and toasts for best UX

## Troubleshooting

**Toast not showing:**
- Ensure `ToastProvider` wraps your entire app
- Check that you're calling `showToast` from `useToast()` hook

**Haptics not working:**
- Test on physical device (haptics don't work in simulator)
- Check device haptic settings are enabled

**Animations laggy:**
- Ensure you're testing on a physical device
- Check if React Native Reanimated is properly configured

**Skeleton not matching content:**
- Adjust skeleton component dimensions to match your actual content
- Use multiple skeleton types for complex layouts
