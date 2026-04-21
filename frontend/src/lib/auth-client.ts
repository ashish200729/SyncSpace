"use client";

import { createAuthClient } from "better-auth/react";

const DEFAULT_API_URL = "http://localhost:4000";

const normalizeBaseURL = (value: string): string => value.replace(/\/+$/, "");

const baseURL = normalizeBaseURL(
  process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL,
);

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
  sessionOptions: {
    refetchOnWindowFocus: true,
    refetchWhenOffline: false,
  },
});
