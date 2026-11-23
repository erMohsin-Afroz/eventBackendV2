
import { z } from "zod";
import { optionalText, emailSchema } from "./common.schema.js";

export const createHelpDeskContactSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: optionalText(2000),
  contactType: z.string().trim().min(1).max(100).default("General Support"),
  email: emailSchema.nullable().optional(),
  phone: z.string().trim().min(7).max(20).nullable().optional(),
  location: optionalText(300),
  operatingHours: optionalText(160),
  displayOrder: z.number().int().min(0).default(0),
  isEnabled: z.boolean().default(true),
  isPublished: z.boolean().default(true),
}).strict();

export const updateHelpDeskContactSchema =
  createHelpDeskContactSchema.partial().strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      { message: "Provide at least one field" }
    );
