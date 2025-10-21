// Centralized Haptic Feedback System
import * as Haptics from 'expo-haptics';

let lastHapticTime = 0;
const HAPTIC_DEBOUNCE = 50; // ms

/**
 * Debounced haptic feedback to prevent over-firing
 */
const triggerHaptic = (
  hapticFn: () => Promise<void>,
  forceImmediate = false
): void => {
  const now = Date.now();
  
  if (forceImmediate || now - lastHapticTime > HAPTIC_DEBOUNCE) {
    hapticFn();
    lastHapticTime = now;
  }
};

/**
 * Light haptic - UI interactions (taps, toggles)
 */
export const hapticLight = (immediate = false) => {
  triggerHaptic(
    () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    immediate
  );
};

/**
 * Medium haptic - Confirmations (save, complete set)
 */
export const hapticMedium = (immediate = false) => {
  triggerHaptic(
    () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    immediate
  );
};

/**
 * Heavy haptic - Important actions (start workout, complete workout)
 */
export const hapticHeavy = (immediate = false) => {
  triggerHaptic(
    () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
    immediate
  );
};

/**
 * Success haptic - Achievement unlocked (PR, workout complete)
 */
export const hapticSuccess = (immediate = true) => {
  triggerHaptic(
    () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    immediate
  );
};

/**
 * Warning haptic - Attention needed
 */
export const hapticWarning = (immediate = true) => {
  triggerHaptic(
    () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    immediate
  );
};

/**
 * Error haptic - Something went wrong
 */
export const hapticError = (immediate = true) => {
  triggerHaptic(
    () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    immediate
  );
};

/**
 * Selection haptic - Picker/slider changes
 */
export const hapticSelection = (immediate = false) => {
  triggerHaptic(
    () => Haptics.selectionAsync(),
    immediate
  );
};

/**
 * Complex haptic pattern for celebrations
 */
export const hapticCelebration = async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, 100);
  setTimeout(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, 200);
};

/**
 * PR Celebration - Special haptic pattern for personal records
 */
export const hapticPR = async () => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, 150);
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, 300);
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, 450);
};

/**
 * Contextual haptic based on action type
 */
export const hapticAction = (
  action: 'tap' | 'save' | 'delete' | 'complete' | 'cancel' | 'pr' | 'select'
) => {
  switch (action) {
    case 'tap':
      hapticLight();
      break;
    case 'save':
      hapticMedium();
      break;
    case 'delete':
      hapticWarning();
      break;
    case 'complete':
      hapticSuccess();
      break;
    case 'cancel':
      hapticLight();
      break;
    case 'pr':
      hapticPR();
      break;
    case 'select':
      hapticSelection();
      break;
    default:
      hapticLight();
  }
};

