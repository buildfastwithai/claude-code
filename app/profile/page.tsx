"use client";

import { useEffect } from "react";
import { useProgressStore } from "@/lib/stores/progressStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exportProgress } from "@/lib/utils/localStorage";

export default function ProfilePage() {
  const { progress, loadProgress, isLoaded, resetProgress } = useProgressStore();

  useEffect(() => {
    if (!isLoaded) {
      loadProgress();
    }
  }, [isLoaded, loadProgress]);

  const handleExportProgress = () => {
    const data = exportProgress();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-learning-progress-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetProgress = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all your progress? This cannot be undone."
      )
    ) {
      resetProgress();
    }
  };

  const totalTimeMinutes = Object.values(progress.completionData).reduce(
    (sum, data) => sum + data.timeSpent,
    0
  ) / 60;

  const averageQuizScore =
    Object.values(progress.completionData).length > 0
      ? Object.values(progress.completionData).reduce(
          (sum, data) => sum + data.quizScore,
          0
        ) / Object.values(progress.completionData).length
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-6xl">👤</div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
          Your Profile
        </h1>
      </div>

      {/* Level & XP */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Level</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {progress.level}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total XP</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {progress.xpPoints.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Streak</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {progress.currentStreak} 🔥
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Completed
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {progress.completedDays.length}/30
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Learning Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Total Time Spent
              </span>
              <span className="font-bold">
                {Math.floor(totalTimeMinutes / 60)}h {Math.round(totalTimeMinutes % 60)}m
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Average Quiz Score
              </span>
              <span className="font-bold">{Math.round(averageQuizScore)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Longest Streak
              </span>
              <span className="font-bold">{progress.longestStreak} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Bookmarks</span>
              <span className="font-bold">{progress.bookmarks.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Unlocked</span>
                <span className="font-bold">{progress.achievements.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Streak Freezes
                </span>
                <span className="font-bold">{progress.streakFreezes}</span>
              </div>
              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = "/achievements"}
                >
                  View All Achievements
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Export Your Progress</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Download your progress as a JSON file for backup or transfer to
                another device.
              </p>
              <Button onClick={handleExportProgress} variant="outline">
                📥 Export Progress
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-2 text-red-600 dark:text-red-400">
                Reset Progress
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                This will permanently delete all your progress. This action cannot
                be undone.
              </p>
              <Button onClick={handleResetProgress} variant="danger">
                🗑️ Reset All Progress
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
