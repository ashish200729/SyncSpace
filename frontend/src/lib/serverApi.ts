import "server-only";

import { cookies } from "next/headers";
import { serverApiBaseURL } from "./apiBaseUrl";
import { buildApiRequest, parseApiResponse } from "./apiShared";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
};

export const serverApi = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const request = buildApiRequest(serverApiBaseURL, path, options);
  const cookieHeader = (await cookies()).toString();
  const headers = new Headers(request.init.headers);

  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  const response = await fetch(request.url, {
    ...request.init,
    headers,
    cache: "no-store",
  });

  return parseApiResponse<T>(response);
};
