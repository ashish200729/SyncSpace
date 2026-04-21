import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import type { AuthSession } from "./authSession";

const DEFAULT_API_URL = "http://localhost:4000";

const normalizeBaseURL = (value: string): string => value.replace(/\/+$/, "");

const baseURL = normalizeBaseURL(
  process.env.NEXT_SERVER_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    DEFAULT_API_URL,
);

export const getServerSession = cache(async (): Promise<AuthSession | null> => {
  const cookieHeader = (await cookies()).toString();
  if (!cookieHeader) {
    return null;
  }

  try {
    const response = await fetch(
      `${baseURL}/api/auth/get-session?disableRefresh=true`,
      {
        method: "GET",
        headers: {
          cookie: cookieHeader,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as AuthSession | null;
    if (!data?.session || !data.user) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
});
