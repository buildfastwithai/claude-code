"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lesson } from "@/types/lesson";
import { cn } from "@/lib/utils";

interface DayCardProps {
  lesson: Lesson;
  status: "locked" | "available" | "in-progress" | "completed";
  isBookmarked?: boolean;
}

export default function DayCard({ lesson, status, isBookmarked }: DayCardProps) {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";

  const statusColors = {
    locked: "bg-gray-100 dark:bg-gray-800 opacity-60",
    available: "bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 hover:shadow-lg",
    "in-progress": "bg-purple-50 dark:bg-purple-950 border-2 border-purple-400 dark:border-purple-600",
    completed: "bg-green-50 dark:bg-green-950 border-2 border-green-400 dark:border-green-700",
  };

  const difficultyColors = {
    beginner: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    advanced: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  const categoryIcons = {
    fundamentals: "📚",
    llms: "🤖",
    applications: "💡",
    advanced: "🚀",
    ethics: "⚖️",
    practical: "🛠️",
  };

  const CardWrapper = isLocked ? "div" : motion(Link);
  const cardProps = isLocked
    ? {}
    : {
        href: `/lesson/${lesson.id}`,
        whileHover: { y: -4 },
        whileTap: { scale: 0.98 },
        transition: { duration: 0.2 },
      };

  return (
    <CardWrapper {...cardProps}>
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-200 cursor-pointer",
          statusColors[status],
          isLocked && "cursor-not-allowed"
        )}
      >
        {/* Status Indicator */}
        <div className="absolute top-3 right-3 flex gap-2">
          {isBookmarked && <span className="text-lg">🔖</span>}
          {isCompleted && <span className="text-lg">✅</span>}
          {isLocked && <span className="text-lg">🔒</span>}
        </div>

        <div className="p-6">
          {/* Day Number and Icon */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{lesson.icon}</span>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Day {lesson.id}
                </p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                  {lesson.title}
                </h3>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {lesson.description}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {categoryIcons[lesson.category]} {lesson.category}
              </Badge>
              <Badge
                className={cn("text-xs", difficultyColors[lesson.difficulty])}
              >
                {lesson.difficulty}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                ⏱️ {lesson.estimatedTime}m
              </span>
              <span className="flex items-center gap-1">
                ⭐ {lesson.xpReward} XP
              </span>
            </div>
          </div>

          {/* Lock Overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-gray-900/10 dark:bg-gray-900/30 backdrop-blur-[1px] flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Complete prerequisites to unlock
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </CardWrapper>
  );
}
