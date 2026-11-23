
import { z } from "zod";

export const checkInByTokenSchema = z.object({
  qrToken: z.string().trim().min(1).max(500),
}).strict();

export const checkInParamsSchema = z.object({
  eventId: z.string().trim().min(1),
});
