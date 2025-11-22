export interface Lesson {
  id: number;
  title: string;
  description: string;
  category: LessonCategory;
  icon: string;
  estimatedTime: number; // in minutes
  xpReward: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites: number[];
  visualizationType: string;
  hasQuiz: boolean;
  hasChallenge: boolean;
}

export type LessonCategory =
  | "fundamentals"
  | "llms"
  | "applications"
  | "advanced"
  | "ethics"
  | "practical";

export interface LessonSection {
  type: "introduction" | "interactive-demo" | "key-insights" | "quiz" | "challenge";
  content?: string; // Markdown content
  component?: string; // Component name for interactive demos
  config?: Record<string, unknown>; // Demo-specific configuration
  points?: string[]; // For key insights
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LessonContent {
  dayNumber: number;
  title: string;
  sections: LessonSection[];
  resources: LessonResource[];
}

export interface LessonResource {
  title: string;
  url: string;
}
