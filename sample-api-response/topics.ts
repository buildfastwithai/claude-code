// GET /api/topics - Sample API Response

export interface TopicResponse {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  estimated_duration_minutes: number;
  total_concepts: number;
  is_published: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const topicsApiResponse: TopicResponse[] = [
  {
    id: 1,
    title: "Introduction to JavaScript",
    slug: "intro-to-javascript",
    description:
      "Learn the fundamentals of JavaScript programming language, including variables, data types, and basic syntax.",
    cover_image: "https://example.com/images/javascript-intro.jpg",
    estimated_duration_minutes: 120,
    total_concepts: 12,
    is_published: true,
    order_index: 1,
    created_at: "2024-01-15T10:30:00.000Z",
    updated_at: "2024-02-20T14:45:00.000Z",
  },
  {
    id: 2,
    title: "React Fundamentals",
    slug: "react-fundamentals",
    description:
      "Master the core concepts of React including components, props, state, and hooks for building modern web applications.",
    cover_image: "https://example.com/images/react-fundamentals.jpg",
    estimated_duration_minutes: 180,
    total_concepts: 15,
    is_published: true,
    order_index: 2,
    created_at: "2024-01-20T09:15:00.000Z",
    updated_at: "2024-03-10T11:20:00.000Z",
  },
  {
    id: 3,
    title: "TypeScript Essentials",
    slug: "typescript-essentials",
    description:
      "Discover TypeScript's type system, interfaces, generics, and how to write type-safe code for scalable applications.",
    cover_image: "https://example.com/images/typescript-essentials.jpg",
    estimated_duration_minutes: 150,
    total_concepts: 10,
    is_published: true,
    order_index: 3,
    created_at: "2024-02-01T08:00:00.000Z",
    updated_at: "2024-03-15T16:30:00.000Z",
  },
  {
    id: 4,
    title: "Node.js Backend Development",
    slug: "nodejs-backend-dev",
    description:
      "Build robust server-side applications with Node.js, Express, and learn about APIs, middleware, and database integration.",
    cover_image: "https://example.com/images/nodejs-backend.jpg",
    estimated_duration_minutes: 240,
    total_concepts: 18,
    is_published: true,
    order_index: 4,
    created_at: "2024-02-10T12:45:00.000Z",
    updated_at: "2024-03-25T10:15:00.000Z",
  },
  {
    id: 5,
    title: "Database Design with SQL",
    slug: "database-design-sql",
    description:
      "Learn database normalization, SQL queries, joins, indexing, and best practices for designing efficient relational databases.",
    cover_image: "https://example.com/images/sql-database.jpg",
    estimated_duration_minutes: 200,
    total_concepts: 14,
    is_published: true,
    order_index: 5,
    created_at: "2024-02-15T07:30:00.000Z",
    updated_at: "2024-03-28T13:50:00.000Z",
  },
];
