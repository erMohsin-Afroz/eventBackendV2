
import { z } from "zod";
import { optionalText } from "./common.schema.js";

export const createLocationSchema = z.object({
  name: z.string().trim().min(1).max(160),
  building: optionalText(160),
  floor: optionalText(40),
  roomNumber: optionalText(40),

  capacity: z.number().int().positive().nullable().optional(),

  description: optionalText(2000),

  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),

  locationType: optionalText(80),
}).strict();

export const updateLocationSchema =
  createLocationSchema.partial().strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      { message: "Provide at least one field" }
    );
