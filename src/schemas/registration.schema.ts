
import { z } from "zod";

export const createRegistrationSchema = z.object({
  eventId: z.string().trim().min(1),
}).strict();

export const reviewRegistrationSchema = z.object({
  approvalStatus: z.enum([
    "approved",
    "rejected",
    "pending",
  ]),
}).strict();

export const cancelRegistrationSchema = z.object({
  reason: z.string().trim().max(1000).optional(),
}).strict();
