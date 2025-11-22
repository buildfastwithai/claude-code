"use client";

import { useEffect, useState } from "react";
import { useProgressStore } from "@/lib/stores/progressStore";
import { Achievement } from "@/types/achievement";
import achievementsData from "@/data/achievements.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AchievementsPage() {
  const { progress, loadProgress, isLoaded } = useProgressStore();
  const [achievements] = useState<Achievement[]>(achievementsData.achievements as Achievement[]);

  useEffect(() => {
    if (!isLoaded) {
      loadProgress();
    }
  }, [isLoaded, loadProgress]);

  const rarityColors = {
    common: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    rare: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    epic: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    legendary: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  };

  const isUnlocked = (achievementId: string) => {
    return progress.achievements.includes(achievementId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
          🏆 Achievements
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {progress.achievements.length} of {achievements.length} unlocked
        </p>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => {
          const unlocked = isUnlocked(achievement.id);

          return (
            <Card
              key={achievement.id}
              className={cn(
                "transition-all duration-200",
                unlocked
                  ? "border-2 border-purple-400 dark:border-purple-600"
                  : "opacity-60 grayscale"
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="text-4xl">{achievement.icon}</div>
                  <Badge className={rarityColors[achievement.rarity]}>
                    {achievement.rarity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {achievement.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    {achievement.xpReward} XP
                  </span>
                  {unlocked && (
                    <Badge variant="success" className="bg-green-100 text-green-700">
                      ✓ Unlocked
                    </Badge>
                  )}
                  {!unlocked && (
                    <Badge variant="secondary">🔒 Locked</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
