import { UserProgress } from "@/types/progress";

/**
 * Calculate the difference in days between two dates
 */
function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get today's date as ISO string (date only, no time)
 */
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Check if a date is today
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayDate();
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(dateString: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateString === yesterday.toISOString().split("T")[0];
}

/**
 * Update streak based on completion
 */
export function updateStreak(progress: UserProgress): UserProgress {
  const today = getTodayDate();
  const lastCompleted = progress.lastCompletedDate;

  // If no previous completion, start streak at 1
  if (!lastCompleted) {
    return {
      ...progress,
      currentStreak: 1,
      longestStreak: Math.max(1, progress.longestStreak),
      lastCompletedDate: today,
    };
  }

  // If already completed today, don't update
  if (isToday(lastCompleted)) {
    return progress;
  }

  let newStreak = progress.currentStreak;

  // If completed yesterday, increment streak
  if (isYesterday(lastCompleted)) {
    newStreak = progress.currentStreak + 1;
  }
  // If more than 1 day ago, check if can use streak freeze
  else {
    const daysDiff = getDaysDifference(lastCompleted, today);

    // If more than 1 day gap, streak breaks (unless we implement freeze logic here)
    if (daysDiff > 1) {
      newStreak = 1;
    } else {
      newStreak = progress.currentStreak + 1;
    }
  }

  return {
    ...progress,
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, progress.longestStreak),
    lastCompletedDate: today,
  };
}

/**
 * Check if streak should be broken
 */
export function shouldBreakStreak(lastCompletedDate: string): boolean {
  if (!lastCompletedDate) return false;

  const today = getTodayDate();
  const daysDiff = getDaysDifference(lastCompletedDate, today);

  // Streak breaks if more than 1 day has passed without completion
  return daysDiff > 1;
}

/**
 * Use a streak freeze to maintain the current streak
 */
export function useStreakFreeze(progress: UserProgress): UserProgress {
  if (progress.streakFreezes <= 0) {
    return progress;
  }

  return {
    ...progress,
    streakFreezes: progress.streakFreezes - 1,
    lastStreakFreezeUsed: getTodayDate(),
  };
}

/**
 * Grant a new streak freeze (e.g., weekly reward)
 */
export function grantStreakFreeze(progress: UserProgress): UserProgress {
  return {
    ...progress,
    streakFreezes: progress.streakFreezes + 1,
  };
}

/**
 * Get streak milestone rewards
 */
export function getStreakMilestone(streak: number): number {
  const milestones = [3, 7, 14, 21, 30];

  if (milestones.includes(streak)) {
    return 200; // XP reward for milestone
  }

  return 0;
}

/**
 * Check if user has completed a lesson today
 */
export function hasCompletedToday(progress: UserProgress): boolean {
  return isToday(progress.lastCompletedDate);
}
