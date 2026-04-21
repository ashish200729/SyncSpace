import { z } from "zod";
import {
  idSchema,
  optionalString,
  requiredString,
} from "./commonSchema.js";

export const workspaceIdParamsSchema = z.object({
  workspaceId: idSchema,
});

export const createWorkspaceBodySchema = z.object({
  name: requiredString("Workspace name", 80),
  description: optionalString("Description", 240),
});

export const joinWorkspaceBodySchema = z
  .object({
    inviteCode: optionalString("Invite code", 32),
    inviteToken: optionalString("Invite token", 128),
  })
  .superRefine((value, ctx) => {
    if (!value.inviteCode && !value.inviteToken) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide an invite code or invite link.",
        path: ["inviteCode"],
      });
    }
  });
