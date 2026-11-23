
import { z } from "zod";

export const createFaqSchema = z.object({
  eventId: z.string().trim().min(1).nullable().optional(),
  question: z.string().trim().min(1).max(1000),
  answer: z.string().trim().min(1).max(5000),
  category: z.string().trim().min(1).max(100).default("General"),
  sortOrder: z.number().int().min(0).default(0),
  status: z.string().trim().min(1).max(50).default("published"),
}).strict();

export const updateFaqSchema =
  createFaqSchema.partial().strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      { message: "Provide at least one field" }
    );
