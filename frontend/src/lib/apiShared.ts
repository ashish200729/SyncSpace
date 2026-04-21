type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

type ApiSuccessResponse<T> = {
  data: T;
};

export class ApiClientError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const safeParseJSON = async (response: Response) => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as ApiErrorPayload | ApiSuccessResponse<unknown>;
  } catch {
    return null;
  }
};

const getApiError = (payload: unknown): ApiErrorPayload["error"] | undefined => {
  if (!payload || typeof payload !== "object" || !("error" in payload)) {
    return undefined;
  }

  const candidate = (payload as { error?: unknown }).error;
  if (!candidate || typeof candidate !== "object") {
    return undefined;
  }

  return candidate as ApiErrorPayload["error"];
};

export const parseApiResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await safeParseJSON(response);

  if (!response.ok) {
    const apiError = getApiError(payload);
    const code = apiError?.code || "REQUEST_FAILED";
    const message = apiError?.message || "Request failed.";
    throw new ApiClientError(response.status, code, message, apiError?.details);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  ) {
    return (payload as ApiSuccessResponse<T>).data;
  }

  return payload as T;
};

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
};

export const buildApiRequest = (
  baseURL: string,
  path: string,
  options: ApiRequestOptions = {},
) => {
  const headers = new Headers(options.headers);
  let body: BodyInit | null | undefined = options.body as BodyInit | null | undefined;

  if (
    body &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(body)
  ) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(body);
  }

  return {
    url: `${baseURL}${path.startsWith("/") ? path : `/${path}`}`,
    init: {
      ...options,
      headers,
      body,
    } satisfies RequestInit,
  };
};
