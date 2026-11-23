
import { z } from "zod";
import { emailSchema } from "./common.schema.js";

const optionalProfileText = (maxLength: number) =>
  z.string().trim().max(maxLength).optional();

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(1).max(120),
    email: emailSchema,
    password: z.string().min(8).max(128),

    mobileNumber: z.string().trim().min(7).max(20).optional(),

    role: z.enum(["attendee", "organiser"]).default("attendee"),

    designation: optionalProfileText(120),
    organization: optionalProfileText(160),
    organiserType: optionalProfileText(100),
    about: optionalProfileText(3000),

    interests: z
      .array(z.string().trim().min(1).max(100))
      .max(50)
      .optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1).max(128),

    expectedRole: z
      .enum(["attendee", "organiser", "admin"])
      .optional(),

    expectedTenantId: z.string().trim().min(1).max(120).optional(),
  })
  .strict();

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128),
  })
  .strict();

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
