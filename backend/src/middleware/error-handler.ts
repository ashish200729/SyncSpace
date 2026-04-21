import type { ErrorRequestHandler, RequestHandler } from "express";

type ErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

const isCorsRejectionError = (error: unknown): boolean =>
  error instanceof Error && error.message === "Origin not allowed by CORS.";

export const apiNotFoundHandler: RequestHandler = (_req, res) => {
  const payload: ErrorResponse = {
    error: {
      code: "NOT_FOUND",
      message: "Route not found.",
    },
  };

  res.status(404).json(payload);
};

export const apiErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (res.headersSent) {
    return;
  }

  if (isCorsRejectionError(error)) {
    const payload: ErrorResponse = {
      error: {
        code: "CORS_ORIGIN_DENIED",
        message: "Request origin is not allowed.",
      },
    };

    res.status(403).json(payload);
    return;
  }

  console.error("Unhandled API error", error);

  const payload: ErrorResponse = {
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong.",
    },
  };

  res.status(500).json(payload);
};
