"use client";

import { useEffect, useState } from "react";
import { useProgressStore } from "@/lib/stores/progressStore";
import { Lesson } from "@/types/lesson";
import lessonsData from "@/data/lessons.json";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import StreakDisplay from "@/components/gamification/StreakDisplay";
import XPBar from "@/components/gamification/XPBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { progress, loadProgress, isLoaded } = useProgressStore();
  const [lessons] = useState<Lesson[]>(lessonsData.lessons as Lesson[]);

  useEffect(() => {
    if (!isLoaded) {
      loadProgress();
    }
  }, [isLoaded, loadProgress]);

  const completionRate = (progress.completedDays.length / 30) * 100;

  // Motivational quote based on progress
  const getMotivationalQuote = () => {
    if (completionRate === 0) {
      return "Begin your AI learning journey today! 🚀";
    } else if (completionRate < 25) {
      return "Great start! Keep the momentum going! 💪";
    } else if (completionRate < 50) {
      return "You're making excellent progress! 🌟";
    } else if (completionRate < 75) {
      return "More than halfway there! You're doing amazing! 🎯";
    } else if (completionRate < 100) {
      return "Almost there! The finish line is in sight! 🏁";
    } else {
      return "Congratulations! You've mastered AI fundamentals! 🎓";
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
          Welcome to 30 Days of AI
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {getMotivationalQuote()}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Days Completed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-600 dark:text-gray-400">
              Days Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {progress.completedDays.length}
              </span>
              <span className="text-xl text-gray-500 dark:text-gray-400">
                / 30
              </span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-purple-700 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Day */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-600 dark:text-gray-400">
              Current Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-4xl">
                {lessons[progress.currentDay - 1]?.icon || "🎯"}
              </span>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Day {progress.currentDay}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {lessons[progress.currentDay - 1]?.title || "Get Started"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-600 dark:text-gray-400">
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {progress.achievements.length}
              </span>
              <span className="text-xl text-gray-500 dark:text-gray-400">
                unlocked
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              🏆 Keep learning to unlock more!
            </p>
          </CardContent>
        </Card>

        {/* Time Spent */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-600 dark:text-gray-400">
              Time Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {Math.floor(
                  Object.values(progress.completionData).reduce(
                    (sum, data) => sum + data.timeSpent,
                    0
                  ) / 3600
                )}
                <span className="text-2xl text-gray-500 dark:text-gray-400">h</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                ⏱️ Total learning time
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gamification Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StreakDisplay
          currentStreak={progress.currentStreak}
          longestStreak={progress.longestStreak}
        />
        <XPBar xpPoints={progress.xpPoints} level={progress.level} />
      </div>

      {/* Calendar Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          📚 All Lessons
        </h2>
        <CalendarGrid lessons={lessons} progress={progress} />
      </div>
    </div>
  );
}
