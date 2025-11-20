export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  category: AchievementCategory;
  requirement: AchievementRequirement;
  xpReward: number;
  unlockedAt?: string; // ISO date string when unlocked
}

export type AchievementCategory =
  | "streak"
  | "completion"
  | "quiz"
  | "speed"
  | "category"
  | "special";

export interface AchievementRequirement {
  type: "streak" | "completion" | "quiz_score" | "speed" | "time" | "category_complete";
  value: number;
  metadata?: Record<string, unknown>;
}

export interface AchievementProgress {
  achievementId: string;
  current: number;
  required: number;
  percentage: number;
}
