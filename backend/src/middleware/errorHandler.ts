import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { ApiError } from "../errors/apiError.js";
import type { ApiErrorResponse } from "../types/api.js";

const isCorsRejectionError = (error: unknown): boolean =>
  error instanceof Error && error.message === "Origin not allowed by CORS.";

const toValidationDetails = (error: ZodError) => {
  const fieldErrors = error.flatten().fieldErrors;
  return Object.fromEntries(
    Object.entries(fieldErrors).filter(
      ([, messages]) => Array.isArray(messages) && messages.length > 0,
    ),
  );
};

const getPrismaErrorResponse = (
  error: Prisma.PrismaClientKnownRequestError,
): ApiErrorResponse => {
  switch (error.code) {
    case "P2002":
      return {
        error: {
          code: "CONFLICT",
          message: "A resource with that value already exists.",
        },
      };
    case "P2003":
      return {
        error: {
          code: "BAD_REQUEST",
          message: "The request references an invalid related resource.",
        },
      };
    case "P2025":
      return {
        error: {
          code: "NOT_FOUND",
          message: "The requested resource could not be found.",
        },
      };
    default:
      return {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        },
      };
  }
};

export const apiNotFoundHandler: RequestHandler = (_req, res) => {
  const payload: ApiErrorResponse = {
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
    const payload: ApiErrorResponse = {
      error: {
        code: "CORS_ORIGIN_DENIED",
        message: "Request origin is not allowed.",
      },
    };

    res.status(403).json(payload);
    return;
  }

  if (error instanceof ApiError) {
    const payload: ApiErrorResponse = {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };

    res.status(error.statusCode).json(payload);
    return;
  }

  if (error instanceof ZodError) {
    const payload: ApiErrorResponse = {
      error: {
        code: "VALIDATION_ERROR",
        message: "One or more fields are invalid.",
        details: toValidationDetails(error),
      },
    };

    res.status(400).json(payload);
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const payload = getPrismaErrorResponse(error);
    const statusCode =
      payload.error.code === "CONFLICT"
        ? 409
        : payload.error.code === "NOT_FOUND"
          ? 404
          : payload.error.code === "BAD_REQUEST"
            ? 400
            : 500;

    if (statusCode >= 500) {
      console.error("Unhandled Prisma API error", error);
    }

    res.status(statusCode).json(payload);
    return;
  }

  console.error("Unhandled API error", error);

  const payload: ApiErrorResponse = {
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong.",
    },
  };

  res.status(500).json(payload);
};
