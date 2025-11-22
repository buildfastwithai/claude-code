export interface UserProgress {
  currentDay: number;
  completedDays: number[];
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string; // ISO date string
  xpPoints: number;
  level: number;
  completionData: Record<
    string,
    {
      completedAt: string;
      timeSpent: number; // seconds
      quizScore: number; // percentage
      attempts: number;
    }
  >;
  achievements: string[]; // achievement IDs
  bookmarks: number[]; // day numbers
  notes: Record<string, string>;
  streakFreezes: number; // Number of streak freezes available
  lastStreakFreezeUsed: string; // ISO date string
}

export interface DayCompletion {
  completedAt: string;
  timeSpent: number;
  quizScore: number;
  attempts: number;
}
