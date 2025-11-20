"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { xpToNextLevel, xpProgressPercentage } from "@/lib/utils/xpCalculator";

interface XPBarProps {
  xpPoints: number;
  level: number;
}

export default function XPBar({ xpPoints, level }: XPBarProps) {
  const xpNeeded = xpToNextLevel(xpPoints);
  const percentage = xpProgressPercentage(xpPoints);
  const currentLevelXP = xpPoints % 500;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">⭐ Level Progress</CardTitle>
          <motion.div
            className="px-3 py-1 bg-purple-100 dark:bg-purple-900 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
              Level {level}
            </span>
          </motion.div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {currentLevelXP} / 500 XP
              </span>
              <span className="font-medium text-purple-600 dark:text-purple-400">
                {xpNeeded} XP to level {level + 1}
              </span>
            </div>
            <Progress value={currentLevelXP} max={500} className="h-3" />
          </div>

          {/* Total XP */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total XP Earned
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {xpPoints.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
