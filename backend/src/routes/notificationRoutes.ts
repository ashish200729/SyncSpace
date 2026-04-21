import { Router } from "express";
import {
  listNotificationsController,
  markNotificationAsReadController,
} from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/authSession.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { notificationIdParamsSchema } from "../schemas/notificationSchema.js";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listNotificationsController));
router.patch(
  "/:notificationId/read",
  validateRequest({
    params: notificationIdParamsSchema,
  }),
  asyncHandler(markNotificationAsReadController),
);

export default router;
