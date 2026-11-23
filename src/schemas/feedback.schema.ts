
import { z } from "zod";

export const createFeedbackSchema = z.object({
  eventId: z.string().trim().min(1),
  rating: z.number().min(1).max(5),
  comments: z.string().trim().max(5000).nullable().optional(),
}).strict();
