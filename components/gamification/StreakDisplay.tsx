"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakDisplay({
  currentStreak,
  longestStreak,
}: StreakDisplayProps) {
  // Fire size grows with streak
  const fireSize = Math.min(1 + currentStreak * 0.05, 3);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">🔥 Streak</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <motion.div
              className="text-5xl mb-2"
              animate={{
                scale: [1, fireSize, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              🔥
            </motion.div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {currentStreak} {currentStreak === 1 ? "day" : "days"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Current streak
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
              {longestStreak}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Longest streak
            </p>
          </div>
        </div>

        {/* Streak Milestones */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Milestone Progress
          </p>
          <div className="flex gap-2">
            {[3, 7, 14, 21, 30].map((milestone) => (
              <div
                key={milestone}
                className={`flex-1 h-2 rounded-full ${
                  currentStreak >= milestone
                    ? "bg-orange-500"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
                title={`${milestone} days`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>3</span>
            <span>30</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
