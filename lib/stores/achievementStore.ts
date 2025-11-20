import { create } from "zustand";
import { Achievement } from "@/types/achievement";
import { checkNewAchievements, getAchievementProgress } from "@/lib/utils/achievementChecker";
import { useProgressStore } from "./progressStore";

interface AchievementStore {
  achievements: Achievement[];
  newlyUnlocked: Achievement[];

  // Actions
  loadAchievements: (allAchievements: Achievement[]) => void;
  checkAchievements: () => Achievement[];
  dismissNewAchievement: (achievementId: string) => void;
  clearNewAchievements: () => void;
}

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  achievements: [],
  newlyUnlocked: [],

  loadAchievements: (allAchievements: Achievement[]) => {
    set({ achievements: allAchievements });
  },

  checkAchievements: () => {
    const { achievements } = get();
    const progress = useProgressStore.getState().progress;

    const newAchievements = checkNewAchievements(achievements, progress);

    if (newAchievements.length > 0) {
      set({ newlyUnlocked: newAchievements });

      // Update progress with new achievements
      const updatedProgress = {
        ...progress,
        achievements: [
          ...progress.achievements,
          ...newAchievements.map((a) => a.id),
        ],
        xpPoints:
          progress.xpPoints +
          newAchievements.reduce((sum, a) => sum + a.xpReward, 0),
      };

      useProgressStore.getState().importProgress(updatedProgress);
    }

    return newAchievements;
  },

  dismissNewAchievement: (achievementId: string) => {
    set((state) => ({
      newlyUnlocked: state.newlyUnlocked.filter((a) => a.id !== achievementId),
    }));
  },

  clearNewAchievements: () => {
    set({ newlyUnlocked: [] });
  },
}));
