type ApiErrorOptions = {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
  expose?: boolean;
};

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;
  expose: boolean;

  constructor({
    statusCode,
    code,
    message,
    details,
    expose = true,
  }: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.expose = expose;
  }

  static badRequest(message = "Bad request.", details?: unknown) {
    return new ApiError({
      statusCode: 400,
      code: "BAD_REQUEST",
      message,
      details,
    });
  }

  static unauthorized(message = "Please sign in to continue.") {
    return new ApiError({
      statusCode: 401,
      code: "UNAUTHORIZED",
      message,
    });
  }

  static forbidden(message = "You do not have access to this resource.") {
    return new ApiError({
      statusCode: 403,
      code: "FORBIDDEN",
      message,
    });
  }

  static notFound(message = "Resource not found.") {
    return new ApiError({
      statusCode: 404,
      code: "NOT_FOUND",
      message,
    });
  }

  static conflict(message = "A conflicting resource already exists.") {
    return new ApiError({
      statusCode: 409,
      code: "CONFLICT",
      message,
    });
  }
}
