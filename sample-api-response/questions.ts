// GET /api/concepts/:conceptId/questions - Sample API Response

export type QuestionType =
  | "multiple_choice"
  | "fill_in_the_blanks"
  | "true_false"
  | "matching_pairs"
  | "select_words"
  | "arrange_sentence";

export interface QuestionResponse {
  id: string;
  concept_id: number;
  question_type: QuestionType;
  question_text: string;
  options: any | null;
  correct_answer: any;
  explanation: string | null;
  order_index: number;
  is_inline_question: boolean;
  points_reward: number;
  time_limit: number | null;
  hints: any | null;
  created_at: string;
  updated_at: string;
}

export const questionsApiResponse: QuestionResponse[] = [
  {
    id: "q_clx8k9mno0001",
    concept_id: 1,
    question_type: "multiple_choice",
    question_text:
      "Which keyword is used to declare a block-scoped variable in JavaScript?",
    options: [
      { id: "a", text: "var" },
      { id: "b", text: "let" },
      { id: "c", text: "const" },
      { id: "d", text: "function" },
    ],
    correct_answer: { answer: "b" },
    explanation:
      "The 'let' keyword declares a block-scoped variable that can be reassigned. 'const' is also block-scoped but creates a constant reference. 'var' is function-scoped.",
    order_index: 1,
    is_inline_question: false,
    points_reward: 10,
    time_limit: 30,
    hints: [
      { order: 1, text: "Think about modern JavaScript ES6 features" },
      { order: 2, text: "This keyword allows reassignment unlike const" },
    ],
    created_at: "2024-01-15T11:30:00.000Z",
    updated_at: "2024-02-20T15:30:00.000Z",
  },
  {
    id: "q_clx8k9mno0002",
    concept_id: 1,
    question_type: "fill_in_the_blanks",
    question_text:
      "JavaScript has {{blank}} primitive data types including String, Number, Boolean, {{blank}}, Null, Symbol, and BigInt.",
    options: null,
    correct_answer: {
      blanks: [
        { index: 0, answer: "seven", alternatives: ["7"] },
        { index: 1, answer: "Undefined", alternatives: ["undefined"] },
      ],
    },
    explanation:
      "JavaScript has seven primitive data types. The seven types are: String, Number, Boolean, Undefined, Null, Symbol, and BigInt.",
    order_index: 2,
    is_inline_question: true,
    points_reward: 8,
    time_limit: 45,
    hints: [
      { order: 1, text: "Count all the primitive types mentioned" },
      {
        order: 2,
        text: "One type represents a variable that has been declared but not assigned",
      },
    ],
    created_at: "2024-01-15T12:00:00.000Z",
    updated_at: "2024-02-20T16:00:00.000Z",
  },
  {
    id: "q_clx8k9mno0003",
    concept_id: 1,
    question_type: "true_false",
    question_text:
      "In JavaScript, variables declared with 'const' cannot have their values changed after initialization.",
    options: [
      { id: "true", text: "True" },
      { id: "false", text: "False" },
    ],
    correct_answer: { answer: "false" },
    explanation:
      "This is partially false. While 'const' creates a constant reference, if the value is an object or array, the contents can still be modified. Only the reference itself cannot be reassigned.",
    order_index: 3,
    is_inline_question: false,
    points_reward: 6,
    time_limit: 20,
    hints: [
      { order: 1, text: "Consider what happens with objects and arrays" },
      { order: 2, text: "const prevents reassignment, not mutation" },
    ],
    created_at: "2024-01-15T12:30:00.000Z",
    updated_at: "2024-02-20T16:30:00.000Z",
  },
  {
    id: "q_clx8k9mno0004",
    concept_id: 1,
    question_type: "select_words",
    question_text:
      "Select all the valid ways to declare a variable in JavaScript:",
    options: [
      { id: "1", text: "var name = 'John';" },
      { id: "2", text: "let age = 25;" },
      { id: "3", text: "const PI = 3.14;" },
      { id: "4", text: "variable x = 10;" },
      { id: "5", text: "int count = 5;" },
      { id: "6", text: "name = 'Jane';" },
    ],
    correct_answer: {
      selected: ["1", "2", "3", "6"],
      explanation_per_option: {
        "1": "var is a valid keyword",
        "2": "let is a valid keyword",
        "3": "const is a valid keyword",
        "4": "variable is not a JavaScript keyword",
        "5": "int is not a JavaScript keyword",
        "6": "Variables can be declared without a keyword (creates global variable)",
      },
    },
    explanation:
      "JavaScript uses var, let, and const to declare variables. Variables can also be created without keywords, though this is not recommended as it creates global variables.",
    order_index: 4,
    is_inline_question: false,
    points_reward: 12,
    time_limit: 60,
    hints: [
      {
        order: 1,
        text: "JavaScript doesn't use type keywords like 'int' or 'string'",
      },
      {
        order: 2,
        text: "There are three modern keywords plus one implicit way",
      },
    ],
    created_at: "2024-01-15T13:00:00.000Z",
    updated_at: "2024-02-20T17:00:00.000Z",
  },
  {
    id: "q_clx8k9mno0005",
    concept_id: 1,
    question_type: "matching_pairs",
    question_text: "Match each JavaScript data type with its correct example:",
    options: {
      left: [
        { id: "l1", text: "String" },
        { id: "l2", text: "Number" },
        { id: "l3", text: "Boolean" },
        { id: "l4", text: "Undefined" },
        { id: "l5", text: "Null" },
      ],
      right: [
        { id: "r1", text: "'Hello World'" },
        { id: "r2", text: "42" },
        { id: "r3", text: "true" },
        { id: "r4", text: "let x;" },
        { id: "r5", text: "let y = null;" },
      ],
    },
    correct_answer: {
      pairs: [
        { left: "l1", right: "r1" },
        { left: "l2", right: "r2" },
        { left: "l3", right: "r3" },
        { left: "l4", right: "r4" },
        { left: "l5", right: "r5" },
      ],
    },
    explanation:
      "Each data type has distinct characteristics: Strings are enclosed in quotes, Numbers are numeric values, Booleans are true/false, Undefined means declared but not assigned, and Null is an intentional empty value.",
    order_index: 5,
    is_inline_question: false,
    points_reward: 15,
    time_limit: 90,
    hints: [
      { order: 1, text: "Look for quoted text for strings" },
      {
        order: 2,
        text: "Undefined occurs when a variable is declared but not initialized",
      },
    ],
    created_at: "2024-01-15T13:30:00.000Z",
    updated_at: "2024-02-20T17:30:00.000Z",
  },
];
