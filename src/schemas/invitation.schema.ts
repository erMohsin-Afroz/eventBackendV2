
import { z } from "zod";
import { emailSchema } from "./common.schema.js";

export const createInvitationSchema = z.object({
  emails: z.array(emailSchema).min(1).max(500),
  expiresAt: z.coerce.date().nullable().optional(),
}).strict();

export const acceptInvitationSchema = z.object({
  invitationCode: z.string().trim().min(1).max(200),
}).strict();
