
import { z } from "zod";

export const createSupportInquirySchema = z.object({
  eventId: z.string().trim().min(1),
  subject: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
  category: z.string().trim().min(1).max(100).default("General Inquiry"),
  priority: z.enum([
    "low",
    "normal",
    "high",
    "urgent",
  ]).default("normal"),
}).strict();

export const updateSupportInquirySchema = z.object({
  status: z.enum([
    "new",
    "in_progress",
    "resolved",
    "closed",
  ]).optional(),

  priority: z.enum([
    "low",
    "normal",
    "high",
    "urgent",
  ]).optional(),

  organiserResponse: z.string().trim().max(5000).nullable().optional(),
  internalNote: z.string().trim().max(5000).nullable().optional(),
}).strict().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Provide at least one field" }
);
