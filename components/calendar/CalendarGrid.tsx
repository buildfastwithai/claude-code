"use client";

import { useState, useEffect } from "react";
import { Lesson } from "@/types/lesson";
import { UserProgress } from "@/types/progress";
import DayCard from "./DayCard";
import { Button } from "@/components/ui/button";

interface CalendarGridProps {
  lessons: Lesson[];
  progress: UserProgress;
}

type FilterCategory = "all" | Lesson["category"];

export default function CalendarGrid({ lessons, progress }: CalendarGridProps) {
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories: { value: FilterCategory; label: string; icon: string }[] = [
    { value: "all", label: "All", icon: "📋" },
    { value: "fundamentals", label: "Fundamentals", icon: "📚" },
    { value: "llms", label: "LLMs", icon: "🤖" },
    { value: "applications", label: "Applications", icon: "💡" },
    { value: "advanced", label: "Advanced", icon: "🚀" },
    { value: "ethics", label: "Ethics", icon: "⚖️" },
    { value: "practical", label: "Practical", icon: "🛠️" },
  ];

  const getDayStatus = (
    lesson: Lesson
  ): "locked" | "available" | "in-progress" | "completed" => {
    if (progress.completedDays.includes(lesson.id)) {
      return "completed";
    }

    // Check if prerequisites are met
    const prerequisitesMet = lesson.prerequisites.every((prereq) =>
      progress.completedDays.includes(prereq)
    );

    if (!prerequisitesMet && lesson.prerequisites.length > 0) {
      return "locked";
    }

    if (lesson.id === progress.currentDay) {
      return "in-progress";
    }

    return "available";
  };

  const filteredLessons = lessons.filter((lesson) => {
    const matchesCategory = filter === "all" || lesson.category === filter;
    const matchesSearch =
      searchTerm === "" ||
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-4">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={filter === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(category.value)}
              className="flex items-center gap-2"
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => (
          <DayCard
            key={lesson.id}
            lesson={lesson}
            status={getDayStatus(lesson)}
            isBookmarked={progress.bookmarks.includes(lesson.id)}
          />
        ))}
      </div>

      {/* No Results */}
      {filteredLessons.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No lessons found matching your criteria
          </p>
        </div>
      )}
    </div>
  );
}
