
import { z } from "zod";

export const createAgendaDaySchema = z.object({
  title: z.string().trim().min(1).max(160),
  agendaDate: z.coerce.date(),
  sortOrder: z.number().int().min(0).default(0),
}).strict();

export const updateAgendaDaySchema =
  createAgendaDaySchema.partial().strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      { message: "Provide at least one field" }
    );
