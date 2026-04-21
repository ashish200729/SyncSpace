import "dotenv/config";

const DEFAULT_PORT = 4000;
const DEFAULT_AUTH_URL = "http://localhost:4000";
const DEFAULT_FRONTEND_URL = "http://localhost:3000";
const DEVELOPMENT_FALLBACK_SECRET =
  "syncspace-local-dev-secret-change-me-1234567890";

const trimAndStripTrailingSlash = (value: string) =>
  value.trim().replace(/\/+$/, "");

const toOrigin = (value: string): string | null => {
  try {
    const parsedURL = new URL(trimAndStripTrailingSlash(value));
    return parsedURL.origin;
  } catch {
    return null;
  }
};

const parseOrigins = (...values: Array<string | undefined>): string[] => {
  const uniqueOrigins = new Set<string>();

  for (const rawValue of values) {
    if (!rawValue) {
      continue;
    }

    for (const candidate of rawValue.split(",")) {
      const normalizedOrigin = toOrigin(candidate);
      if (normalizedOrigin) {
        uniqueOrigins.add(normalizedOrigin);
      }
    }
  }

  return [...uniqueOrigins];
};

const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";

const toDeploymentURL = (value?: string): string | null => {
  if (!value) {
    return null;
  }

  const normalizedValue = trimAndStripTrailingSlash(value);
  if (!normalizedValue) {
    return null;
  }

  if (normalizedValue.startsWith("http://") || normalizedValue.startsWith("https://")) {
    return normalizedValue;
  }

  return `https://${normalizedValue}`;
};

const parsedPort = Number(process.env.PORT ?? DEFAULT_PORT);
const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : DEFAULT_PORT;

const vercelDeploymentURL =
  toDeploymentURL(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  toDeploymentURL(process.env.VERCEL_URL);

const authBaseURL =
  toOrigin(process.env.BETTER_AUTH_URL ?? vercelDeploymentURL ?? DEFAULT_AUTH_URL) ??
  DEFAULT_AUTH_URL;
const frontendURL =
  toOrigin(process.env.FRONTEND_URL ?? DEFAULT_FRONTEND_URL) ??
  (isProduction ? authBaseURL : DEFAULT_FRONTEND_URL);

const trustedOrigins = parseOrigins(
  frontendURL,
  authBaseURL,
  process.env.TRUSTED_ORIGINS,
);

const configuredAuthSecret = process.env.BETTER_AUTH_SECRET?.trim();
const configuredAuthCookieDomain = process.env.AUTH_COOKIE_DOMAIN?.trim();
if (isProduction && !configuredAuthSecret) {
  throw new Error("BETTER_AUTH_SECRET is required in production.");
}

const betterAuthSecret = configuredAuthSecret ?? DEVELOPMENT_FALLBACK_SECRET;
if (isProduction && betterAuthSecret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be at least 32 characters in production.");
}

if (!isProduction && !configuredAuthSecret) {
  console.warn(
    "[auth] BETTER_AUTH_SECRET is not set. Using a development fallback secret.",
  );
}

export const appConfig = {
  nodeEnv,
  isProduction,
  port,
  authBaseURL,
  frontendURL,
  trustedOrigins,
};

export const securityConfig = {
  betterAuthSecret,
  authCookieDomain: configuredAuthCookieDomain || null,
};

export const normalizeOrigin = (origin: string): string | null => toOrigin(origin);
