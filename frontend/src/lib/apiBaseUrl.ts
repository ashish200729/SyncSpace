const DEFAULT_API_URL = "http://localhost:4000";

const normalizeBaseURL = (value: string) => value.replace(/\/+$/, "");

export const browserApiBaseURL = normalizeBaseURL(
  process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL,
);

export const serverApiBaseURL = normalizeBaseURL(
  process.env.NEXT_SERVER_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    DEFAULT_API_URL,
);
