
import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { ZodError } from "zod";

import router from "./routes/index.js";
import { setupSwagger } from "./config/swagger.js";

const app = express();

// --------------------------------------------------
// Global Middleware
// --------------------------------------------------

app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --------------------------------------------------
// Health Check
// --------------------------------------------------

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Event Organise Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// --------------------------------------------------
// Swagger Documentation
// --------------------------------------------------

setupSwagger(app);

// --------------------------------------------------
// API Routes
// --------------------------------------------------

app.use("/api", router);

// --------------------------------------------------
// 404 Handler
// --------------------------------------------------

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// --------------------------------------------------
// Global Error Handler
// --------------------------------------------------

const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  console.error("API Error:", error);

  // Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  // Application and other errors
  const appError = error as {
    message?: string;
    statusCode?: number;
  };

  const statusCode =
    typeof appError.statusCode === "number"
      ? appError.statusCode
      : 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error"
        : appError.message ?? "Something went wrong",
  });
};

app.use(errorHandler);

export default app;
