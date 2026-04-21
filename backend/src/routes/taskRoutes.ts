import { Router } from "express";
import {
  createTaskController,
  deleteTaskController,
  listTasksController,
  updateTaskController,
  updateTaskStatusController,
} from "../controllers/taskController.js";
import { requireAuth } from "../middleware/authSession.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createTaskBodySchema,
  listTasksQuerySchema,
  taskIdParamsSchema,
  updateTaskBodySchema,
  updateTaskStatusBodySchema,
  workspaceIdParamsSchema,
} from "../schemas/taskSchema.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/workspaces/:workspaceId/tasks",
  validateRequest({
    params: workspaceIdParamsSchema,
    query: listTasksQuerySchema,
  }),
  asyncHandler(listTasksController),
);
router.post(
  "/workspaces/:workspaceId/tasks",
  validateRequest({
    params: workspaceIdParamsSchema,
    body: createTaskBodySchema,
  }),
  asyncHandler(createTaskController),
);
router.patch(
  "/tasks/:taskId",
  validateRequest({
    params: taskIdParamsSchema,
    body: updateTaskBodySchema,
  }),
  asyncHandler(updateTaskController),
);
router.patch(
  "/tasks/:taskId/status",
  validateRequest({
    params: taskIdParamsSchema,
    body: updateTaskStatusBodySchema,
  }),
  asyncHandler(updateTaskStatusController),
);
router.delete(
  "/tasks/:taskId",
  validateRequest({
    params: taskIdParamsSchema,
  }),
  asyncHandler(deleteTaskController),
);

export default router;
