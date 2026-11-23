
import { z } from "zod";

export const createFavoriteSchema = z.object({
  itemType: z.string().trim().min(1).max(50),
  itemId: z.string().trim().min(1),
}).strict();

export const deleteFavoriteSchema = createFavoriteSchema;
