"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProgressStore } from "@/lib/stores/progressStore";
import { Lesson, LessonContent, QuizQuestion } from "@/types/lesson";
import lessonsData from "@/data/lessons.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from "react-markdown";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const dayNumber = parseInt(params.day as string);
  const { progress, completeLesson, loadProgress, isLoaded } = useProgressStore();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [startTime] = useState(Date.now());
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      loadProgress();
    }
  }, [isLoaded, loadProgress]);

  useEffect(() => {
    // Load lesson metadata
    const lessonData = (lessonsData.lessons as Lesson[]).find((l) => l.id === dayNumber);
    setLesson((lessonData as Lesson) || null);

    // Try to load lesson content
    import(`@/data/lessons/content/day-${dayNumber}.json`)
      .then((module) => setLessonContent(module.default))
      .catch(() => {
        // If content doesn't exist, create a placeholder
        setLessonContent({
          dayNumber,
          title: lessonData?.title || "",
          sections: [
            {
              type: "introduction",
              content: `# ${lessonData?.title}\n\n${lessonData?.description}\n\nContent for this lesson is coming soon! 🚧`,
            },
          ],
          resources: [],
        });
      });
  }, [dayNumber]);

  if (!lesson || !lessonContent) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-xl text-gray-600 dark:text-gray-400">Loading lesson...</p>
      </div>
    );
  }

  const currentSectionData = lessonContent.sections[currentSection];
  const totalSections = lessonContent.sections.length;
  const isLastSection = currentSection === totalSections - 1;

  const handleNextSection = () => {
    if (isLastSection) {
      handleCompleteLesson();
    } else {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleCompleteLesson = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const quizScore = calculateQuizScore();

    const { earnedXP, leveledUp } = completeLesson(dayNumber, timeSpent, quizScore);

    setShowCompletion(true);
  };

  const calculateQuizScore = (): number => {
    const quizSection = lessonContent.sections.find((s) => s.type === "quiz");
    if (!quizSection || !quizSection.questions) return 100;

    const totalQuestions = quizSection.questions.length;
    const correctAnswers = quizSection.questions.filter(
      (q, idx) => quizAnswers[idx] === q.correctAnswer
    ).length;

    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const renderSection = () => {
    switch (currentSectionData.type) {
      case "introduction":
      case "key-insights":
        return (
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {currentSectionData.content && (
              <ReactMarkdown>{currentSectionData.content}</ReactMarkdown>
            )}
            {currentSectionData.points && (
              <ul className="space-y-2 mt-4">
                {currentSectionData.points.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

      case "interactive-demo":
        return (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 text-center">
            <p className="text-4xl mb-4">{lesson.icon}</p>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Interactive Demo
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Interactive visualization for {currentSectionData.component} coming soon!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              This will be an engaging, hands-on demonstration of the concept.
            </p>
          </div>
        );

      case "quiz":
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Test Your Knowledge 📝
            </h3>
            {currentSectionData.questions?.map((question, qIdx) => (
              <Card key={qIdx}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {qIdx + 1}: {question.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {question.options.map((option, oIdx) => {
                      const isSelected = quizAnswers[qIdx] === oIdx;
                      const isCorrect = question.correctAnswer === oIdx;
                      const showResult = quizSubmitted;

                      return (
                        <button
                          key={oIdx}
                          onClick={() =>
                            !quizSubmitted &&
                            setQuizAnswers({ ...quizAnswers, [qIdx]: oIdx })
                          }
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? showResult
                                ? isCorrect
                                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                                  : "border-red-500 bg-red-50 dark:bg-red-950"
                                : "border-purple-500 bg-purple-50 dark:bg-purple-950"
                              : showResult && isCorrect
                              ? "border-green-500 bg-green-50 dark:bg-green-950"
                              : "border-gray-300 dark:border-gray-700 hover:border-purple-300"
                          }`}
                          disabled={quizSubmitted}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            {showResult && isSelected && (
                              <span>{isCorrect ? "✅" : "❌"}</span>
                            )}
                            {showResult && !isSelected && isCorrect && (
                              <span>✅</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {!quizSubmitted && (
              <Button onClick={() => setQuizSubmitted(true)} className="w-full">
                Submit Quiz
              </Button>
            )}
            {quizSubmitted && (
              <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl">
                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  Your Score: {calculateQuizScore()}%
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (showCompletion) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Lesson Complete!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          You've successfully completed Day {dayNumber}: {lesson.title}
        </p>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">XP Earned</span>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  +{lesson.xpReward} XP
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Quiz Score</span>
                <span className="text-2xl font-bold">{calculateQuizScore()}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.push("/")} className="flex-1">
            Back to Dashboard
          </Button>
          {dayNumber < 30 && (
            <Button
              onClick={() => router.push(`/lesson/${dayNumber + 1}`)}
              className="flex-1"
            >
              Next Lesson →
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Lesson Header */}
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-4">
          ← Back to Dashboard
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="text-6xl">{lesson.icon}</span>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Day {lesson.id}
              </p>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {lesson.title}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                {lesson.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="secondary">
            ⏱️ {lesson.estimatedTime} minutes
          </Badge>
          <Badge variant="default">⭐ {lesson.xpReward} XP</Badge>
          <Badge variant="outline">{lesson.difficulty}</Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Section {currentSection + 1} of {totalSections}
              </span>
              <span className="font-medium">
                {Math.round(((currentSection + 1) / totalSections) * 100)}% Complete
              </span>
            </div>
            <Progress value={currentSection + 1} max={totalSections} />
          </div>
        </CardContent>
      </Card>

      {/* Lesson Content */}
      <Card>
        <CardContent className="pt-6">{renderSection()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePreviousSection}
          disabled={currentSection === 0}
        >
          ← Previous
        </Button>
        <Button onClick={handleNextSection}>
          {isLastSection ? "Complete Lesson" : "Next →"}
        </Button>
      </div>
    </div>
  );
}
