import { UserProgress } from "@/types/progress";
import { Achievement } from "@/types/achievement";

/**
 * Check if an achievement requirement is met
 */
export function isAchievementUnlocked(
  achievement: Achievement,
  progress: UserProgress
): boolean {
  const { type, value, metadata } = achievement.requirement;

  switch (type) {
    case "streak":
      return progress.currentStreak >= value;

    case "completion":
      return progress.completedDays.length >= value;

    case "quiz_score":
      // Check if user has X perfect quiz scores
      const perfectScores = Object.values(progress.completionData).filter(
        (data) => data.quizScore === 100
      ).length;
      return perfectScores >= value;

    case "speed":
      // Check if any lesson was completed under X minutes
      const hasSpeedCompletion = Object.values(progress.completionData).some(
        (data) => data.timeSpent <= value * 60
      );
      return hasSpeedCompletion;

    case "time":
      // Check if lesson was completed during specific hours
      const timeRange = metadata?.timeRange as { start: number; end: number };
      if (!timeRange) return false;

      return Object.values(progress.completionData).some((data) => {
        const hour = new Date(data.completedAt).getHours();
        return hour >= timeRange.start && hour <= timeRange.end;
      });

    case "category_complete":
      // Check if all lessons in a category are completed
      const categoryId = metadata?.category as string;
      if (!categoryId) return false;
      // This would need lesson data to check which lessons belong to the category
      // For now, return false (to be implemented with lesson data)
      return false;

    default:
      return false;
  }
}

/**
 * Get progress towards an achievement
 */
export function getAchievementProgress(
  achievement: Achievement,
  progress: UserProgress
): { current: number; required: number; percentage: number } {
  const { type, value } = achievement.requirement;
  let current = 0;

  switch (type) {
    case "streak":
      current = progress.currentStreak;
      break;

    case "completion":
      current = progress.completedDays.length;
      break;

    case "quiz_score":
      current = Object.values(progress.completionData).filter(
        (data) => data.quizScore === 100
      ).length;
      break;

    case "speed":
      current = Object.values(progress.completionData).filter(
        (data) => data.timeSpent <= value * 60
      ).length;
      break;

    case "time":
      const timeRange = achievement.requirement.metadata?.timeRange as {
        start: number;
        end: number;
      };
      if (timeRange) {
        current = Object.values(progress.completionData).filter((data) => {
          const hour = new Date(data.completedAt).getHours();
          return hour >= timeRange.start && hour <= timeRange.end;
        }).length;
      }
      break;

    case "category_complete":
      // To be implemented with lesson data
      current = 0;
      break;
  }

  const percentage = Math.min(100, (current / value) * 100);

  return { current, required: value, percentage };
}

/**
 * Check for newly unlocked achievements
 */
export function checkNewAchievements(
  allAchievements: Achievement[],
  progress: UserProgress
): Achievement[] {
  return allAchievements.filter(
    (achievement) =>
      !progress.achievements.includes(achievement.id) &&
      isAchievementUnlocked(achievement, progress)
  );
}
