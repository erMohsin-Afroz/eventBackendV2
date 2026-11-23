
import { z } from "zod";
import {
  emailSchema,
  optionalText,
  phoneSchema,
} from "./common.schema.js";

export const updateUserProfileSchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  mobileNumber: phoneSchema.optional(),
  designation: optionalText(120),
  organization: optionalText(160),
  profileImagePath: optionalText(1000),
  about: optionalText(3000),
  interests: optionalText(2000),
}).strict().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Provide at least one profile field" }
);

export const userEmailSchema = z.object({
  email: emailSchema,
});
