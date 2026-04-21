import { z } from "zod";
import {
  idSchema,
  optionalDateOnlySchema,
  optionalNullableIdSchema,
  optionalRequiredString,
  optionalString,
  requiredString,
} from "./commonSchema.js";

export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

const ensureBodyHasAtLeastOneField = (
  value: Record<string, unknown>,
  ctx: z.RefinementCtx,
) => {
  const hasAnyDefinedField = Object.values(value).some(
    (entry) => entry !== undefined,
  );

  if (!hasAnyDefinedField) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide at least one field to update.",
    });
  }
};

export const workspaceIdParamsSchema = z.object({
  workspaceId: idSchema,
});

export const taskIdParamsSchema = z.object({
  taskId: idSchema,
});

export const listTasksQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  search: optionalString("Search", 80),
  assigneeId: optionalNullableIdSchema.transform((value) => value ?? undefined),
});

export const createTaskBodySchema = z.object({
  title: requiredString("Title", 120),
  description: optionalString("Description", 2000),
  status: taskStatusSchema.optional(),
  assigneeId: optionalNullableIdSchema,
  dueDate: optionalDateOnlySchema("Due date"),
});

export const updateTaskBodySchema = z
  .object({
    title: optionalRequiredString("Title", 120),
    description: optionalString("Description", 2000).or(z.null()).optional(),
    assigneeId: optionalNullableIdSchema,
    dueDate: optionalDateOnlySchema("Due date"),
  })
  .superRefine(ensureBodyHasAtLeastOneField);

export const updateTaskStatusBodySchema = z.object({
  status: taskStatusSchema,
});
