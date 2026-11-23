
import { z } from "zod";
import { emailSchema, optionalText } from "./common.schema.js";

export const createSpeakerSchema = z.object({
  name: z.string().trim().min(1).max(160),
  designation: optionalText(120),
  organization: optionalText(160),
  biography: optionalText(5000),
  profileImagePath: optionalText(1000),
  topic: optionalText(300),
  email: emailSchema.nullable().optional(),
  contactInformation: optionalText(500),
}).strict();

export const updateSpeakerSchema =
  createSpeakerSchema.partial().strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      { message: "Provide at least one field" }
    );
