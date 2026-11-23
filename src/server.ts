
import "dotenv/config";

import app from "./app.js";
import { prisma } from "./config/prisma.js";

const PORT = Number(process.env.PORT ?? 3000);

let isShuttingDown = false;

// --------------------------------------------------
// Start Server
// --------------------------------------------------

async function startServer(): Promise<void> {
  try {
    // Connect to SQLite through Prisma
    await prisma.$connect();

    console.log("Database connected successfully");

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log("Event Organise Backend Started");
      console.log(`Server: http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
      console.log(`API: http://localhost:${PORT}/api`);
      console.log(`Swagger: http://localhost:${PORT}/api-docs`);
    });

    // --------------------------------------------------
    // Graceful Shutdown
    // --------------------------------------------------

    const shutdown = (signal: string): void => {
      if (isShuttingDown) {
        return;
      }

      isShuttingDown = true;

      console.log(`${signal} received. Shutting down server...`);

      server.close(async (error) => {
        if (error) {
          console.error("Error closing HTTP server:", error);
          process.exitCode = 1;
        }

        try {
          await prisma.$disconnect();
          console.log("Database disconnected successfully");
        } catch (disconnectError) {
          console.error(
            "Error disconnecting database:",
            disconnectError,
          );

          process.exitCode = 1;
        }
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    server.on("error", (error) => {
      console.error("HTTP server error:", error);
      process.exitCode = 1;
    });
  } catch (error) {
    console.error("Failed to start backend:", error);

    await prisma.$disconnect().catch((disconnectError) => {
      console.error("Database disconnect error:", disconnectError);
    });

    process.exitCode = 1;
  }
}

void startServer();
