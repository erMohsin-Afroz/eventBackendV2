
import { z } from "zod";
import { optionalText } from "./common.schema.js";

export const createOrganiserProfileSchema = z.object({
  organisationName: optionalText(160),
  organiserType: optionalText(100),
  designation: optionalText(120),
  description: optionalText(3000),
}).strict();

export const updateOrganiserProfileSchema =
  createOrganiserProfileSchema
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      { message: "Provide at least one field" }
    );
