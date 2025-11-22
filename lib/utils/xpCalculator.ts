import { UserProgress } from "@/types/progress";
import { hasCompletedToday } from "./streakCalculator";

const XP_PER_LEVEL = 500;

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/**
 * Calculate XP needed for next level
 */
export function xpToNextLevel(xp: number): number {
  const currentLevelXP = (calculateLevel(xp) - 1) * XP_PER_LEVEL;
  return XP_PER_LEVEL - (xp - currentLevelXP);
}

/**
 * Calculate XP progress percentage to next level
 */
export function xpProgressPercentage(xp: number): number {
  const currentLevelXP = (calculateLevel(xp) - 1) * XP_PER_LEVEL;
  const xpInCurrentLevel = xp - currentLevelXP;
  return (xpInCurrentLevel / XP_PER_LEVEL) * 100;
}

/**
 * Award XP for completing a lesson
 */
export function awardLessonXP(
  progress: UserProgress,
  baseXP: number,
  quizScore: number
): { newProgress: UserProgress; earnedXP: number; leveledUp: boolean } {
  let earnedXP = baseXP;

  // Perfect quiz score bonus
  if (quizScore === 100) {
    earnedXP += 50;
  }

  // First completion of the day bonus
  if (!hasCompletedToday(progress)) {
    earnedXP += 25;
  }

  const oldLevel = progress.level;
  const newXP = progress.xpPoints + earnedXP;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > oldLevel;

  return {
    newProgress: {
      ...progress,
      xpPoints: newXP,
      level: newLevel,
    },
    earnedXP,
    leveledUp,
  };
}

/**
 * Award XP for completing a challenge
 */
export function awardChallengeXP(progress: UserProgress): UserProgress {
  const challengeXP = 75;
  const newXP = progress.xpPoints + challengeXP;

  return {
    ...progress,
    xpPoints: newXP,
    level: calculateLevel(newXP),
  };
}

/**
 * Award XP for achieving a streak milestone
 */
export function awardStreakMilestoneXP(
  progress: UserProgress,
  milestoneXP: number
): UserProgress {
  const newXP = progress.xpPoints + milestoneXP;

  return {
    ...progress,
    xpPoints: newXP,
    level: calculateLevel(newXP),
  };
}

/**
 * Get XP multiplier based on streak
 */
export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 2.0;
  if (streak >= 21) return 1.75;
  if (streak >= 14) return 1.5;
  if (streak >= 7) return 1.25;
  return 1.0;
}

/**
 * Get rewards unlocked at a specific level
 */
export function getLevelRewards(level: number): string[] {
  const rewards: Record<number, string[]> = {
    5: ["Novice Badge", "Profile Background: Blue"],
    10: ["Apprentice Badge", "Profile Background: Purple"],
    15: ["Expert Badge", "Profile Border: Gold"],
    20: ["Master Badge", "Achievement: Dedicated Learner"],
    25: ["Grand Master Badge", "Profile Background: Galaxy"],
    30: ["Legend Badge", "Achievement: AI Master", "Special Certificate"],
  };

  return rewards[level] || [];
}
