
import { z } from "zod";

const quizQuestionSchema = z.object({
  questionText: z.string().trim().min(1).max(3000),

  questionType: z.string().trim().min(1).max(80),

  options: z.array(
    z.string().trim().min(1).max(500)
  ).default([]),

  correctAnswer: z.unknown(),

  marks: z.number().int().positive().default(1),
  allowPartialMarks: z.boolean().default(false),

  explanation: z.string().trim().max(2000).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),

  sortOrder: z.number().int().min(0).default(0),
}).strict();

export const createQuizSchema = z.object({
  eventId: z.string().trim().min(1),
  agendaId: z.string().trim().min(1).nullable().optional(),

  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(3000),
  instructions: z.string().trim().min(1).max(5000),

  quizType: z.string().trim().min(1).max(80),
  difficulty: z.string().trim().min(1).max(50),

  passingPercentage: z.number().min(0).max(100).default(50),
  durationMinutes: z.number().int().positive().max(1440).default(15),
  maxAttempts: z.number().int().positive().max(100).default(1),

  availabilityMode: z.string().trim().min(1).max(50).default("manual"),

  startAt: z.coerce.date().nullable().optional(),
  endAt: z.coerce.date().nullable().optional(),

  status: z.string().trim().min(1).max(50).default("draft"),
  isEnabled: z.boolean().default(true),

  resultVisibility: z.string().trim().min(1).max(80)
    .default("hidden_until_released"),

  questions: z.array(quizQuestionSchema).min(1).max(200),
}).strict().refine(
  (data) => !data.startAt || !data.endAt || data.endAt > data.startAt,
  {
    message: "Quiz end time must be after start time",
    path: ["endAt"],
  }
);

export const updateQuizSchema = createQuizSchema
  .omit({
    eventId: true,
    questions: true,
  })
  .partial()
  .extend({
    questions: z.array(quizQuestionSchema).min(1).max(200).optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "Provide at least one quiz field" }
  );

export const startQuizAttemptSchema = z.object({
  quizId: z.string().trim().min(1),
}).strict();

export const submitQuizAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().trim().min(1),
      selectedAnswer: z.unknown(),
    }).strict()
  ).max(200),
}).strict();
