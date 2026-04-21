import { appConfig } from "./config/env.js";
import prisma from "./config/prisma.js";
import { createApp } from "./app.js";

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Database connection established");

    const app = createApp();
    app.listen(appConfig.port, () => {
      console.log(`Backend running on http://localhost:${appConfig.port}`);
    });
  } catch (error) {
    console.error("Failed to connect to database");
    console.error(error);
    process.exit(1);
  }
};

void startServer();
