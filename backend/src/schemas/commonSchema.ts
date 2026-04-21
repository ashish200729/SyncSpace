import { z } from "zod";

const trimString = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim();
};

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim();
  return normalized === "" ? undefined : normalized;
};

const emptyStringToNull = (value: unknown) => {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim();
  return normalized === "" ? null : normalized;
};

const toUtcDateOnly = (value: string) => new Date(`${value}T12:00:00.000Z`);

const isValidDateOnly = (value: string) => {
  const date = toUtcDateOnly(value);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const idSchema = z.preprocess(
  trimString,
  z
    .string({ error: "A valid identifier is required." })
    .min(1, "A valid identifier is required.")
    .max(64, "Identifier is too long."),
);

export const requiredString = (fieldLabel: string, maxLength: number) =>
  z.preprocess(
    trimString,
    z
      .string({ error: `${fieldLabel} is required.` })
      .min(1, `${fieldLabel} is required.`)
      .max(maxLength, `${fieldLabel} must be ${maxLength} characters or fewer.`),
  );

export const optionalString = (fieldLabel: string, maxLength: number) =>
  z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .max(maxLength, `${fieldLabel} must be ${maxLength} characters or fewer.`)
      .optional(),
  );

export const optionalRequiredString = (fieldLabel: string, maxLength: number) =>
  z.preprocess(
    trimString,
    z
      .string()
      .min(1, `${fieldLabel} is required.`)
      .max(maxLength, `${fieldLabel} must be ${maxLength} characters or fewer.`)
      .optional(),
  );

export const optionalClearableString = (
  fieldLabel: string,
  maxLength: number,
) =>
  z.preprocess(
    emptyStringToNull,
    z
      .string()
      .max(maxLength, `${fieldLabel} must be ${maxLength} characters or fewer.`)
      .nullable()
      .optional(),
  );

export const optionalNullableIdSchema = z.preprocess(
  emptyStringToNull,
  z.string().min(1, "A valid identifier is required.").max(64).nullable().optional(),
);

export const optionalDateOnlySchema = (fieldLabel: string) =>
  z.preprocess(
    emptyStringToNull,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, `${fieldLabel} must be a valid date.`)
      .refine(isValidDateOnly, `${fieldLabel} must be a valid date.`)
      .transform(toUtcDateOnly)
      .nullable()
      .optional(),
  );
