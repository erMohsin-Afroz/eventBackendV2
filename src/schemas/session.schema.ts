
import { z } from "zod";
import { optionalText } from "./common.schema.js";

export const createSessionSchema = z.object({
  agendaDayId: z.string().trim().min(1).nullable().optional(),

  title: z.string().trim().min(1).max(200),
  description: optionalText(3000),

  activityType: z.string().trim().min(1).max(80).default("Keynote"),

  speakerName: optionalText(160),
  locationName: optionalText(160),

  startTime: z.string().trim().min(1).max(30),
  endTime: z.string().trim().min(1).max(30),

  sessionDate: z.coerce.date(),
}).strict();

export const updateSessionSchema =
  createSessionSchema.partial().strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      { message: "Provide at least one field" }
    );

export const favoriteSessionSchema = z.object({
  isFavorite: z.boolean(),
}).strict();
