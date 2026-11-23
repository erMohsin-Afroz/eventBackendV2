
import { z } from "zod";

// Common ID validation
export const idSchema = z
  .string()
  .trim()
  .min(1, "ID is required");

// Email validation
export const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address")
  .max(254);

// Mobile number validation
export const phoneSchema = z
  .string()
  .trim()
  .min(7, "Mobile number is too short")
  .max(20, "Mobile number is too long");

// Date validation
export const dateSchema = z.coerce.date();

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Route parameter validation
export const routeIdParamsSchema = z.object({
  id: idSchema,
});

export const eventIdParamsSchema = z.object({
  eventId: idSchema,
});

// Required text validation
export const requiredText = (maxLength = 2000) =>
  z
    .string()
    .trim()
    .min(1, "This field is required")
    .max(maxLength, `Maximum ${maxLength} characters allowed`);

// Optional text validation
export const optionalText = (maxLength = 2000) =>
  z
    .string()
    .trim()
    .max(maxLength, `Maximum ${maxLength} characters allowed`)
    .nullable()
    .optional();

// Pagination Type
export type PaginationInput = z.infer<typeof paginationSchema>;
