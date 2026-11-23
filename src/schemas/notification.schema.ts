
import { z } from "zod";

export const createNotificationSchema = z.object({
  eventId: z.string().trim().min(1).nullable().optional(),
  title: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
  isPinned: z.boolean().default(false),
}).strict();

export const updateNotificationReadSchema = z.object({
  isRead: z.boolean(),
}).strict();

export const updateNotificationPinnedSchema = z.object({
  isPinned: z.boolean(),
}).strict();
