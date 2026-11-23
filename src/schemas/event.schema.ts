
import { z } from "zod";
import { optionalText } from "./common.schema.js";

export const createEventSchema = z.object({
  eventName: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(10000),
  category: z.string().trim().min(1).max(100),

  bannerPath: optionalText(1000),

  eventFormat: z.string().trim().min(1).max(50),

  startDate: z.coerce.date(),
  endDate: z.coerce.date(),

  startTime: optionalText(30),
  endTime: optionalText(30),

  venueName: z.string().trim().min(1).max(200),
  address: optionalText(500),
  city: optionalText(120),
  country: optionalText(120),

  onlineMeetingUrl: z.string().url().nullable().optional(),
  platformName: optionalText(100),

  visibility: z.enum(["public", "private"]).default("public"),
  accessCode: optionalText(100),

  registrationDeadline: z.coerce.date().nullable().optional(),

  maximumCapacity: z.number().int().min(1).max(1000000).default(500),

  registrationOpen: z.boolean().default(true),
  approvalRequired: z.boolean().default(false),
  waitlistEnabled: z.boolean().default(false),

  eventStatus: z.string().trim().min(1).max(50).default("published"),
}).strict().refine(
  (data) => data.endDate >= data.startDate,
  {
    message: "End date cannot be before start date",
    path: ["endDate"],
  }
);

export const updateEventSchema = createEventSchema
  .partial()
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "Provide at least one event field" }
  );
