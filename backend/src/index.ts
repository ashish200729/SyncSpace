import { createServer } from "node:http";
import { appConfig } from "./config/env.js";
import prisma from "./config/prisma.js";
import { initializeSocketServer } from "./realtime/socketServer.js";
import { createApp } from "./app.js";

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Database connection established");

    const app = createApp();
    const httpServer = createServer(app);

    initializeSocketServer(httpServer);

    httpServer.listen(appConfig.port, () => {
      console.log(`Backend running on http://localhost:${appConfig.port}`);
    });

    const shutdown = async (signal: NodeJS.Signals) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);

      await new Promise<void>((resolve, reject) => {
        httpServer.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });

      await prisma.$disconnect();
      process.exit(0);
    };

    for (const signal of ["SIGINT", "SIGTERM"] as const) {
      process.once(signal, () => {
        void shutdown(signal).catch((error) => {
          console.error("Graceful shutdown failed");
          console.error(error);
          process.exit(1);
        });
      });
    }
  } catch (error) {
    console.error("Failed to connect to database");
    console.error(error);
    await prisma.$disconnect().catch(() => undefined);
    process.exit(1);
  }
};

void startServer();
