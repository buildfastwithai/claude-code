"use client";

import Link from "next/link";
import { useProgressStore } from "@/lib/stores/progressStore";
import { useEffect } from "react";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

export default function Header() {
  const { progress, loadProgress, isLoaded } = useProgressStore();

  useEffect(() => {
    if (!isLoaded) {
      loadProgress();
    }
  }, [isLoaded, loadProgress]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🤖</span>
              <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                30 Days of AI
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/achievements"
                className="text-sm font-medium text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors"
              >
                Achievements
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors"
              >
                Profile
              </Link>
            </nav>
          </div>

          {/* User Stats */}
          <div className="flex items-center gap-4">
            {/* Streak */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950">
              <span className="text-lg">🔥</span>
              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                {progress.currentStreak} day{progress.currentStreak !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Level */}
            <div className="flex items-center gap-2">
              <Badge variant="default" className="px-3 py-1">
                <span className="text-xs font-bold">Level {progress.level}</span>
              </Badge>
            </div>

            {/* XP Progress */}
            <div className="hidden lg:flex flex-col gap-1 min-w-[120px]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  {progress.xpPoints % 500} / 500 XP
                </span>
              </div>
              <Progress
                value={(progress.xpPoints % 500)}
                max={500}
                className="h-1.5"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
