
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import type { ZodType } from "zod";

type RequestPart = "body" | "query" | "params";

export const validateRequest = (
  schema: ZodType,
  part: RequestPart = "body",
) => {
  return (
    request: Request,
    response: Response,
    next: NextFunction,
  ): void => {
    const result = schema.safeParse(request[part]);

    if (!result.success) {
      response.status(400).json({
        success: false,
        message: "Request validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });

      return;
    }

    if (part === "body") {
      request.body = result.data;
    }

    if (part === "query") {
      Object.assign(request.query, result.data);
    }

    if (part === "params") {
      Object.assign(request.params, result.data);
    }

    next();
  };
};
