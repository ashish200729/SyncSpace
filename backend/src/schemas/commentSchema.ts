import { z } from "zod";
import { idSchema, requiredString } from "./commonSchema.js";

export const taskIdParamsSchema = z.object({
  taskId: idSchema,
});

export const createCommentBodySchema = z.object({
  content: requiredString("Comment", 1000),
});
