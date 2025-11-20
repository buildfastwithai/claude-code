import { Question, Quiz } from "@/data";
import { theme } from "@/lib/theme";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface QuizComponentProps {
  quiz: Quiz;
  onComplete: (result: any) => void;
  onBack: () => void;
}

interface UserAnswer {
  questionId: string;
  answer: string | string[] | { [key: string]: string } | number[];
}

export default function QuizComponent({
  quiz,
  onComplete,
  onBack,
}: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // State for different question types
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [matches, setMatches] = useState<{ [key: string]: string }>({});
  const [orderedItems, setOrderedItems] = useState<string[]>([]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  useEffect(() => {
    if (!quizStarted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleQuizComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted]);

  const handleQuizComplete = () => {
    const correctAnswers = userAnswers.filter((userAnswer) => {
      const question = quiz.questions.find(
        (q) => q.id === userAnswer.questionId
      );
      if (!question) return false;
      return checkAnswer(question, userAnswer.answer);
    }).length;

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const xpEarned = Math.round(
      (score / 100) * quiz.questions.reduce((total, q) => total + q.points, 0)
    );
    const timeTaken = quiz.timeLimit - timeRemaining;

    onComplete({
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      timeTaken,
      xpEarned,
    });
  };

  const checkAnswer = (question: Question, userAnswer: any): boolean => {
    switch (question.type) {
      case "MCQ":
      case "TRUE_FALSE":
      case "FILL_BLANK":
        return userAnswer === question.correctAnswer;
      case "MATCHING":
        return (
          JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer)
        );
      case "ORDERING":
        return (
          JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer)
        );
      default:
        return false;
    }
  };

  const handleAnswerSubmit = (answer: any) => {
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answer,
    };

    setUserAnswers((prev) => [
      ...prev.filter((a) => a.questionId !== currentQuestion.id),
      newAnswer,
    ]);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      handleQuizComplete();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowExplanation(false);
      // Reset state for next question
      setSelectedAnswer("");
      setUserInput("");
      setMatches({});
      setOrderedItems([]);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderMCQ = (question: Question) => {
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
        <View style={styles.optionsContainer}>
          {question.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === option && styles.selectedOption,
              ]}
              onPress={() => setSelectedAnswer(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedAnswer === option && styles.selectedOptionText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[
            styles.submitButton,
            !selectedAnswer && styles.disabledButton,
          ]}
          onPress={() => handleAnswerSubmit(selectedAnswer)}
          disabled={!selectedAnswer}
        >
          <Text style={styles.submitButtonText}>Submit Answer</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTrueFalse = (question: Question) => {
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              selectedAnswer === "true" && styles.selectedOption,
            ]}
            onPress={() => setSelectedAnswer("true")}
          >
            <Text
              style={[
                styles.optionText,
                selectedAnswer === "true" && styles.selectedOptionText,
              ]}
            >
              True
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.optionButton,
              selectedAnswer === "false" && styles.selectedOption,
            ]}
            onPress={() => setSelectedAnswer("false")}
          >
            <Text
              style={[
                styles.optionText,
                selectedAnswer === "false" && styles.selectedOptionText,
              ]}
            >
              False
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.submitButton,
            !selectedAnswer && styles.disabledButton,
          ]}
          onPress={() => handleAnswerSubmit(selectedAnswer)}
          disabled={!selectedAnswer}
        >
          <Text style={styles.submitButtonText}>Submit Answer</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFillBlank = (question: Question) => {
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
        <TextInput
          style={styles.textInput}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Type your answer here..."
          placeholderTextColor={theme.colors.text.secondary}
        />
        <TouchableOpacity
          style={[
            styles.submitButton,
            !userInput.trim() && styles.disabledButton,
          ]}
          onPress={() => handleAnswerSubmit(userInput.trim())}
          disabled={!userInput.trim()}
        >
          <Text style={styles.submitButtonText}>Submit Answer</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMatching = (question: Question) => {
    const options = question.options || [];
    const correctAnswer = question.correctAnswer as { [key: string]: string };
    const leftItems = Object.keys(correctAnswer);
    const rightItems = Object.values(correctAnswer);

    const handleMatch = (leftItem: string, rightItem: string) => {
      setMatches((prev) => ({
        ...prev,
        [leftItem]: rightItem,
      }));
    };

    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
        <View style={styles.matchingContainer}>
          <View style={styles.matchingColumn}>
            {leftItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.matchingItem,
                  matches[item] && styles.matchedItem,
                ]}
                onPress={() => {
                  // Simple implementation - in a real app, you'd have a more sophisticated matching UI
                  const rightItem = rightItems[index];
                  handleMatch(item, rightItem);
                }}
              >
                <Text style={styles.matchingItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.matchingColumn}>
            {rightItems.map((item, index) => (
              <View key={index} style={styles.matchingItem}>
                <Text style={styles.matchingItemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.submitButton,
            Object.keys(matches).length !== leftItems.length &&
              styles.disabledButton,
          ]}
          onPress={() => handleAnswerSubmit(matches)}
          disabled={Object.keys(matches).length !== leftItems.length}
        >
          <Text style={styles.submitButtonText}>Submit Answer</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderOrdering = (question: Question) => {
    const options = question.options || [];

    const handleItemPress = (item: string) => {
      if (orderedItems.includes(item)) {
        setOrderedItems((prev) => prev.filter((i) => i !== item));
      } else {
        setOrderedItems((prev) => [...prev, item]);
      }
    };

    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.question}</Text>
        <Text style={styles.instructionText}>
          Tap items in the correct order:
        </Text>

        <View style={styles.orderingContainer}>
          <View style={styles.availableItems}>
            <Text style={styles.sectionTitle}>Available Items:</Text>
            {options.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.orderingItem,
                  orderedItems.includes(item) && styles.selectedOrderingItem,
                ]}
                onPress={() => handleItemPress(item)}
              >
                <Text style={styles.orderingItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.orderedItems}>
            <Text style={styles.sectionTitle}>Your Order:</Text>
            {orderedItems.map((item, index) => (
              <View key={index} style={styles.orderedItem}>
                <View style={styles.orderNumber}>
                  <Text style={styles.orderNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.orderedItemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            orderedItems.length !== options.length && styles.disabledButton,
          ]}
          onPress={() => handleAnswerSubmit(orderedItems)}
          disabled={orderedItems.length !== options.length}
        >
          <Text style={styles.submitButtonText}>Submit Answer</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case "MCQ":
        return renderMCQ(currentQuestion);
      case "TRUE_FALSE":
        return renderTrueFalse(currentQuestion);
      case "FILL_BLANK":
        return renderFillBlank(currentQuestion);
      case "MATCHING":
        return renderMatching(currentQuestion);
      case "ORDERING":
        return renderOrdering(currentQuestion);
      default:
        return null;
    }
  };

  if (!quizStarted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" backgroundColor={theme.colors.background} />

        <View style={styles.startContainer}>
          <View style={styles.startContent}>
            <Text style={styles.quizTitle}>{quiz.title}</Text>
            <Text style={styles.quizInfo}>
              {quiz.questions.length} questions • {formatTime(quiz.timeLimit)}{" "}
              time limit
            </Text>
            <Text style={styles.passingScore}>
              Passing score: {quiz.passingScore}%
            </Text>

            <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
              <Text style={styles.startButtonText}>Start Quiz 🚀</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>← Back to Lesson</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={theme.colors.background} />

      {/* Quiz Header */}
      <View style={styles.quizHeader}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </Text>
          <Text style={styles.timeText}>{formatTime(timeRemaining)}</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  ((currentQuestionIndex + 1) / quiz.questions.length) * 100
                }%`,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {renderQuestion()}

          {showExplanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Explanation:</Text>
              <Text style={styles.explanationText}>
                {currentQuestion.explanation}
              </Text>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNextQuestion}
              >
                <Text style={styles.nextButtonText}>
                  {isLastQuestion ? "Finish Quiz" : "Next Question →"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  startContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  startContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.black,
    ...theme.shadows.lg,
  },
  quizTitle: {
    fontSize: theme.typography.fontSize["2xl"],
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.black,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  quizInfo: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  passingScore: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginBottom: theme.spacing.xl,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.black,
    ...theme.shadows.md,
  },
  startButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.white,
  },
  backButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.primary,
  },
  quizHeader: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    // borderBottomWidth: 2,
    // borderBottomColor: theme.colors.black,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  progressText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.black,
  },
  timeText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.gray[200],
    borderRadius: 3,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  questionContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.black,
    ...theme.shadows.md,
  },
  questionText: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.black,
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  instructionText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  optionsContainer: {
    marginBottom: theme.spacing.lg,
  },
  optionButton: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
  },
  selectedOption: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.black,
  },
  selectedOptionText: {
    color: theme.colors.white,
  },
  textInput: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.black,
  },
  matchingContainer: {
    flexDirection: "row",
    marginBottom: theme.spacing.lg,
  },
  matchingColumn: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
  matchingItem: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
  },
  matchedItem: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  matchingItemText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.black,
    textAlign: "center",
  },
  orderingContainer: {
    marginBottom: theme.spacing.lg,
  },
  availableItems: {
    marginBottom: theme.spacing.lg,
  },
  orderedItems: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  orderingItem: {
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
  },
  selectedOrderingItem: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  orderingItemText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.black,
    textAlign: "center",
  },
  orderedItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.gray[200],
  },
  orderNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  orderNumberText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.white,
  },
  orderedItemText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.black,
    flex: 1,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.black,
  },
  disabledButton: {
    backgroundColor: theme.colors.gray[300],
    borderColor: theme.colors.gray[400],
  },
  submitButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.white,
  },
  explanationContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.success,
    ...theme.shadows.md,
  },
  explanationTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.success,
    marginBottom: theme.spacing.sm,
  },
  explanationText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.black,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  nextButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.black,
  },
  nextButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.white,
  },
});
