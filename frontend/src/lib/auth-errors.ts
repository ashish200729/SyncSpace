const RATE_LIMIT_TOKENS = ["rate limit", "too many", "429"];
const NETWORK_TOKENS = ["network", "fetch", "failed to fetch"];
const INVALID_CREDENTIALS_TOKENS = [
  "invalid credential",
  "invalid credentials",
  "invalid email or password",
  "incorrect email or password",
  "wrong password",
  "incorrect password",
  "invalid password",
  "user not found",
  "account not found",
];
const EMAIL_IN_USE_TOKENS = [
  "already exists",
  "already registered",
  "email already",
  "user already exists",
  "duplicate",
];
const INVALID_EMAIL_TOKENS = [
  "invalid email",
  "email is invalid",
  "email must be",
];
const PASSWORD_TOO_SHORT_TOKENS = [
  "password too short",
  "password must be at least",
  "min password length",
  "minimum password length",
];
const PASSWORD_TOO_LONG_TOKENS = [
  "password too long",
  "password must be at most",
  "max password length",
  "maximum password length",
];

const SIGN_IN_GENERIC_MESSAGE = "Unable to sign in with those credentials.";
const SIGN_UP_GENERIC_MESSAGE = "Unable to create your account right now.";
const INVALID_CREDENTIALS_MESSAGE =
  "The email or password you entered is incorrect.";
const EMAIL_IN_USE_MESSAGE =
  "An account with this email already exists. Try signing in instead.";
const INVALID_EMAIL_MESSAGE = "Please enter a valid email address.";
const PASSWORD_TOO_SHORT_MESSAGE =
  "Your password is too short. Use at least 8 characters.";
const PASSWORD_TOO_LONG_MESSAGE =
  "Your password is too long. Use 128 characters or fewer.";
const RATE_LIMIT_MESSAGE = "Too many attempts. Please wait and try again.";
const NETWORK_MESSAGE =
  "Unable to reach the server. Please check your connection and try again.";

const toLowerString = (value: unknown): string =>
  typeof value === "string" ? value.toLowerCase() : "";

const normalizeErrorMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return toLowerString(error);
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") {
      return toLowerString(message);
    }
  }

  return "";
};

const normalizeErrorCode = (error: unknown): string => {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return "";
  }

  return toLowerString((error as { code?: unknown }).code);
};

const hasAnyToken = (value: string, tokens: string[]): boolean =>
  tokens.some((token) => value.includes(token));

const toSafeAuthMessage = (error: unknown, genericMessage: string): string => {
  const normalized = normalizeErrorMessage(error);
  const normalizedCode = normalizeErrorCode(error);
  const combined = `${normalized} ${normalizedCode}`.trim();

  if (hasAnyToken(combined, RATE_LIMIT_TOKENS)) {
    return RATE_LIMIT_MESSAGE;
  }

  if (hasAnyToken(combined, NETWORK_TOKENS)) {
    return NETWORK_MESSAGE;
  }

  if (hasAnyToken(combined, INVALID_CREDENTIALS_TOKENS)) {
    return INVALID_CREDENTIALS_MESSAGE;
  }

  if (hasAnyToken(combined, EMAIL_IN_USE_TOKENS)) {
    return EMAIL_IN_USE_MESSAGE;
  }

  if (hasAnyToken(combined, INVALID_EMAIL_TOKENS)) {
    return INVALID_EMAIL_MESSAGE;
  }

  if (hasAnyToken(combined, PASSWORD_TOO_SHORT_TOKENS)) {
    return PASSWORD_TOO_SHORT_MESSAGE;
  }

  if (hasAnyToken(combined, PASSWORD_TOO_LONG_TOKENS)) {
    return PASSWORD_TOO_LONG_MESSAGE;
  }

  return genericMessage;
};

export const getSignInErrorMessage = (error: unknown): string =>
  toSafeAuthMessage(error, SIGN_IN_GENERIC_MESSAGE);

export const getSignUpErrorMessage = (error: unknown): string =>
  toSafeAuthMessage(error, SIGN_UP_GENERIC_MESSAGE);
