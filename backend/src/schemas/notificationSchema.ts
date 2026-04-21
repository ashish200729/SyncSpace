import { z } from "zod";
import { idSchema } from "./commonSchema.js";

export const notificationIdParamsSchema = z.object({
  notificationId: idSchema,
});
