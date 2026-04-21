import cors from "cors";
import express from "express";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { appConfig, normalizeOrigin } from "./config/env.js";
import { apiErrorHandler, apiNotFoundHandler } from "./middleware/errorHandler.js";
import rootRouter from "./routes/index.js";

export const createApp = () => {
  const app = express();
  const allowedOrigins = new Set(appConfig.trustedOrigins);

  app.disable("x-powered-by");
  if (appConfig.isProduction) {
    app.set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }

        const normalizedRequestOrigin = normalizeOrigin(origin);
        if (normalizedRequestOrigin && allowedOrigins.has(normalizedRequestOrigin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Origin not allowed by CORS."));
      },
      credentials: true,
    }),
  );

  app.all("/api/auth/*", toNodeHandler(auth));

  // Keep Better Auth mounted before express.json() or auth requests can hang.
  app.use(express.json({ limit: "256kb" }));
  app.use(express.urlencoded({ extended: false, limit: "64kb" }));
  app.use("/", rootRouter);
  app.use(apiNotFoundHandler);
  app.use(apiErrorHandler);

  return app;
};
