// GET /api/topics/:topicId/concepts - Sample API Response

export type LessonType = "text" | "visual" | "quiz" | "interactive";

export interface ConceptResponse {
  id: number;
  topic_id: number;
  title: string;
  slug: string;
  description: string | null;
  type: LessonType;
  content: string;
  summary: string | null;
  cover_image: string | null;
  order_index: number;
  estimated_duration_minutes: number;
  xp_reward: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const conceptsApiResponse: ConceptResponse[] = [
  {
    id: 1,
    topic_id: 1,
    title: "Variables and Data Types",
    slug: "variables-and-data-types",
    description:
      "Understanding how to declare variables and work with different data types in JavaScript",
    type: "text",
    content:
      "<h2>Variables in JavaScript</h2><p>Variables are containers for storing data values. In JavaScript, you can declare variables using var, let, or const keywords...</p><h3>Data Types</h3><p>JavaScript has several primitive data types: String, Number, Boolean, Undefined, Null, Symbol, and BigInt.</p>",
    summary:
      "Learn about var, let, and const keywords and JavaScript's primitive data types including strings, numbers, and booleans.",
    cover_image: "https://example.com/images/variables-datatypes.jpg",
    order_index: 1,
    estimated_duration_minutes: 8,
    xp_reward: 15,
    is_published: true,
    created_at: "2024-01-15T11:00:00.000Z",
    updated_at: "2024-02-20T15:00:00.000Z",
  },
  {
    id: 2,
    topic_id: 1,
    title: "Functions and Scope",
    slug: "functions-and-scope",
    description:
      "Master function declarations, expressions, arrow functions, and understand lexical scope",
    type: "interactive",
    content:
      "<h2>JavaScript Functions</h2><p>Functions are reusable blocks of code. You can define functions using function declarations, function expressions, or arrow functions...</p><h3>Scope</h3><p>Scope determines the accessibility of variables. JavaScript has global scope, function scope, and block scope.</p>",
    summary:
      "Explore different ways to create functions and understand how scope works in JavaScript.",
    cover_image: "https://example.com/images/functions-scope.jpg",
    order_index: 2,
    estimated_duration_minutes: 12,
    xp_reward: 20,
    is_published: true,
    created_at: "2024-01-16T09:30:00.000Z",
    updated_at: "2024-02-21T10:15:00.000Z",
  },
  {
    id: 3,
    topic_id: 1,
    title: "Arrays and Array Methods",
    slug: "arrays-and-methods",
    description:
      "Learn how to create and manipulate arrays using built-in JavaScript methods",
    type: "visual",
    content:
      "<h2>Working with Arrays</h2><p>Arrays are ordered collections of values. JavaScript provides many powerful methods for array manipulation...</p><h3>Common Methods</h3><p>map(), filter(), reduce(), forEach(), find(), some(), every() are essential array methods you'll use frequently.</p>",
    summary:
      "Understand arrays and master essential array methods like map, filter, and reduce for data manipulation.",
    cover_image: "https://example.com/images/arrays-methods.jpg",
    order_index: 3,
    estimated_duration_minutes: 10,
    xp_reward: 18,
    is_published: true,
    created_at: "2024-01-17T14:20:00.000Z",
    updated_at: "2024-02-22T11:45:00.000Z",
  },
  {
    id: 4,
    topic_id: 1,
    title: "Objects and Object Manipulation",
    slug: "objects-manipulation",
    description:
      "Deep dive into JavaScript objects, properties, methods, and object destructuring",
    type: "text",
    content:
      "<h2>JavaScript Objects</h2><p>Objects are collections of key-value pairs. They are fundamental to JavaScript programming...</p><h3>Object Methods</h3><p>Learn about Object.keys(), Object.values(), Object.entries(), and the spread operator for object manipulation.</p>",
    summary:
      "Master object creation, property access, methods, and modern object manipulation techniques.",
    cover_image: "https://example.com/images/objects-manipulation.jpg",
    order_index: 4,
    estimated_duration_minutes: 9,
    xp_reward: 16,
    is_published: true,
    created_at: "2024-01-18T08:45:00.000Z",
    updated_at: "2024-02-23T13:20:00.000Z",
  },
  {
    id: 5,
    topic_id: 1,
    title: "Asynchronous JavaScript",
    slug: "async-javascript",
    description:
      "Understand callbacks, promises, and async/await for handling asynchronous operations",
    type: "quiz",
    content:
      "<h2>Asynchronous Programming</h2><p>JavaScript is single-threaded but can handle asynchronous operations using callbacks, promises, and async/await...</p><h3>Promises and Async/Await</h3><p>Modern JavaScript uses Promises and async/await syntax for cleaner asynchronous code.</p>",
    summary:
      "Learn to handle asynchronous operations using callbacks, promises, and async/await syntax.",
    cover_image: "https://example.com/images/async-javascript.jpg",
    order_index: 5,
    estimated_duration_minutes: 15,
    xp_reward: 25,
    is_published: true,
    created_at: "2024-01-19T10:15:00.000Z",
    updated_at: "2024-02-24T09:30:00.000Z",
  },
];
