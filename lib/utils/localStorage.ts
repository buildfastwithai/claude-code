import { UserProgress } from "@/types/progress";

const STORAGE_KEYS = {
  USER_PROGRESS: "ai-learning-progress",
  VERSION: "ai-learning-version",
} as const;

const CURRENT_VERSION = "1.0.0";

const DEFAULT_PROGRESS: UserProgress = {
  currentDay: 1,
  completedDays: [],
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDate: "",
  xpPoints: 0,
  level: 1,
  completionData: {},
  achievements: [],
  bookmarks: [],
  notes: {},
  streakFreezes: 1, // Start with 1 freeze
  lastStreakFreezeUsed: "",
};

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = "__test__";
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get user progress from localStorage
 */
export function getProgress(): UserProgress {
  if (!isLocalStorageAvailable()) {
    return DEFAULT_PROGRESS;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    if (!stored) {
      return DEFAULT_PROGRESS;
    }

    const parsed = JSON.parse(stored) as UserProgress;
    return validateProgress(parsed);
  } catch (error) {
    console.error("Error reading progress from localStorage:", error);
    return DEFAULT_PROGRESS;
  }
}

/**
 * Save user progress to localStorage
 */
export function saveProgress(progress: UserProgress): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const validated = validateProgress(progress);
    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(validated));
    localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
    return true;
  } catch (error) {
    console.error("Error saving progress to localStorage:", error);

    // Check if quota exceeded
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.error("LocalStorage quota exceeded");
      // Attempt to clear old data or notify user
    }

    return false;
  }
}

/**
 * Validate and sanitize progress data
 */
function validateProgress(progress: Partial<UserProgress>): UserProgress {
  return {
    currentDay: Math.max(1, Math.min(30, progress.currentDay ?? 1)),
    completedDays: Array.isArray(progress.completedDays) ? progress.completedDays : [],
    currentStreak: Math.max(0, progress.currentStreak ?? 0),
    longestStreak: Math.max(0, progress.longestStreak ?? 0),
    lastCompletedDate: progress.lastCompletedDate ?? "",
    xpPoints: Math.max(0, progress.xpPoints ?? 0),
    level: Math.max(1, progress.level ?? 1),
    completionData: progress.completionData ?? {},
    achievements: Array.isArray(progress.achievements) ? progress.achievements : [],
    bookmarks: Array.isArray(progress.bookmarks) ? progress.bookmarks : [],
    notes: progress.notes ?? {},
    streakFreezes: Math.max(0, progress.streakFreezes ?? 1),
    lastStreakFreezeUsed: progress.lastStreakFreezeUsed ?? "",
  };
}

/**
 * Clear all user data
 */
export function clearProgress(): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.USER_PROGRESS);
    return true;
  } catch (error) {
    console.error("Error clearing progress:", error);
    return false;
  }
}

/**
 * Export progress as JSON string
 */
export function exportProgress(): string {
  const progress = getProgress();
  return JSON.stringify(progress, null, 2);
}

/**
 * Import progress from JSON string
 */
export function importProgress(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString) as UserProgress;
    const validated = validateProgress(parsed);
    return saveProgress(validated);
  } catch (error) {
    console.error("Error importing progress:", error);
    return false;
  }
}

/**
 * Get storage size in bytes
 */
export function getStorageSize(): number {
  if (!isLocalStorageAvailable()) {
    return 0;
  }

  let total = 0;
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
}
