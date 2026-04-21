"use client";

import { browserApiBaseURL } from "./apiBaseUrl";
import { buildApiRequest, parseApiResponse } from "./apiShared";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
};

export const apiClient = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const request = buildApiRequest(browserApiBaseURL, path, options);
  const response = await fetch(request.url, {
    ...request.init,
    credentials: "include",
    cache: "no-store",
  });

  return parseApiResponse<T>(response);
};
