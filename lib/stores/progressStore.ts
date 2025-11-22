import { create } from "zustand";
import { UserProgress, DayCompletion } from "@/types/progress";
import { getProgress, saveProgress } from "@/lib/utils/localStorage";
import { updateStreak, getTodayDate } from "@/lib/utils/streakCalculator";
import { awardLessonXP } from "@/lib/utils/xpCalculator";

interface ProgressStore {
  progress: UserProgress;
  isLoaded: boolean;

  // Actions
  loadProgress: () => void;
  completeLesson: (
    dayNumber: number,
    timeSpent: number,
    quizScore: number
  ) => { earnedXP: number; leveledUp: boolean };
  addBookmark: (dayNumber: number) => void;
  removeBookmark: (dayNumber: number) => void;
  saveNote: (dayNumber: number, note: string) => void;
  useStreakFreeze: () => boolean;
  resetProgress: () => void;
  importProgress: (data: UserProgress) => void;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  progress: getProgress(),
  isLoaded: false,

  loadProgress: () => {
    const progress = getProgress();
    set({ progress, isLoaded: true });
  },

  completeLesson: (dayNumber: number, timeSpent: number, quizScore: number) => {
    const currentProgress = get().progress;

    // Check if already completed today
    const alreadyCompleted = currentProgress.completedDays.includes(dayNumber);

    // Update completion data
    const completionKey = dayNumber.toString();
    const existingCompletion = currentProgress.completionData[completionKey];

    const newCompletion: DayCompletion = {
      completedAt: getTodayDate(),
      timeSpent: alreadyCompleted
        ? existingCompletion.timeSpent + timeSpent
        : timeSpent,
      quizScore: Math.max(quizScore, existingCompletion?.quizScore || 0),
      attempts: (existingCompletion?.attempts || 0) + 1,
    };

    // Update progress
    let updatedProgress: UserProgress = {
      ...currentProgress,
      completedDays: alreadyCompleted
        ? currentProgress.completedDays
        : [...currentProgress.completedDays, dayNumber],
      completionData: {
        ...currentProgress.completionData,
        [completionKey]: newCompletion,
      },
      currentDay: Math.max(currentProgress.currentDay, dayNumber + 1),
    };

    // Update streak
    updatedProgress = updateStreak(updatedProgress);

    // Award XP (base XP is 100)
    const { newProgress, earnedXP, leveledUp } = awardLessonXP(
      updatedProgress,
      100,
      quizScore
    );

    // Save to localStorage
    saveProgress(newProgress);
    set({ progress: newProgress });

    return { earnedXP, leveledUp };
  },

  addBookmark: (dayNumber: number) => {
    const currentProgress = get().progress;

    if (currentProgress.bookmarks.includes(dayNumber)) {
      return;
    }

    const updatedProgress = {
      ...currentProgress,
      bookmarks: [...currentProgress.bookmarks, dayNumber],
    };

    saveProgress(updatedProgress);
    set({ progress: updatedProgress });
  },

  removeBookmark: (dayNumber: number) => {
    const currentProgress = get().progress;

    const updatedProgress = {
      ...currentProgress,
      bookmarks: currentProgress.bookmarks.filter((b) => b !== dayNumber),
    };

    saveProgress(updatedProgress);
    set({ progress: updatedProgress });
  },

  saveNote: (dayNumber: number, note: string) => {
    const currentProgress = get().progress;

    const updatedProgress = {
      ...currentProgress,
      notes: {
        ...currentProgress.notes,
        [dayNumber.toString()]: note,
      },
    };

    saveProgress(updatedProgress);
    set({ progress: updatedProgress });
  },

  useStreakFreeze: () => {
    const currentProgress = get().progress;

    if (currentProgress.streakFreezes <= 0) {
      return false;
    }

    const updatedProgress = {
      ...currentProgress,
      streakFreezes: currentProgress.streakFreezes - 1,
      lastStreakFreezeUsed: getTodayDate(),
    };

    saveProgress(updatedProgress);
    set({ progress: updatedProgress });

    return true;
  },

  resetProgress: () => {
    const defaultProgress = getProgress();
    saveProgress(defaultProgress);
    set({ progress: defaultProgress });
  },

  importProgress: (data: UserProgress) => {
    saveProgress(data);
    set({ progress: data });
  },
}));
