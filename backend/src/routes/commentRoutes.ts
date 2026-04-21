import { Router } from "express";
import {
  createCommentController,
  listCommentsController,
} from "../controllers/commentController.js";
import { requireAuth } from "../middleware/authSession.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createCommentBodySchema,
  taskIdParamsSchema,
} from "../schemas/commentSchema.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/tasks/:taskId/comments",
  validateRequest({
    params: taskIdParamsSchema,
  }),
  asyncHandler(listCommentsController),
);
router.post(
  "/tasks/:taskId/comments",
  validateRequest({
    params: taskIdParamsSchema,
    body: createCommentBodySchema,
  }),
  asyncHandler(createCommentController),
);

export default router;
