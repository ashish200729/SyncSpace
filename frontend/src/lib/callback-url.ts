export const DEFAULT_AUTH_REDIRECT_PATH = "/dashboard";

export const getSafeRedirectPath = (
  path?: string | null,
  fallback = DEFAULT_AUTH_REDIRECT_PATH,
): string => {
  const normalizedPath = path?.trim() || fallback;
  if (
    !normalizedPath.startsWith("/") ||
    normalizedPath.startsWith("//") ||
    normalizedPath.includes("\r") ||
    normalizedPath.includes("\n")
  ) {
    return fallback;
  }

  return normalizedPath;
};

export const getAbsoluteCallbackURL = (
  path = DEFAULT_AUTH_REDIRECT_PATH,
): string => {
  const normalizedPath = getSafeRedirectPath(path);

  if (typeof window === "undefined") {
    return normalizedPath;
  }

  return new URL(normalizedPath, window.location.origin).toString();
};

export const buildAuthHref = (
  authPath: "/login" | "/signup",
  callbackPath?: string | null,
): string => {
  const normalizedCallbackPath = getSafeRedirectPath(callbackPath);
  const params = new URLSearchParams({
    callback: normalizedCallbackPath,
  });

  return `${authPath}?${params.toString()}`;
};
