import { Router } from "express";
import {
  createWorkspaceController,
  getWorkspaceController,
  joinWorkspaceController,
  listWorkspaceActivityController,
  listWorkspaceMembersController,
  listWorkspacesController,
} from "../controllers/workspaceController.js";
import { requireAuth } from "../middleware/authSession.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createWorkspaceBodySchema,
  joinWorkspaceBodySchema,
  workspaceIdParamsSchema,
} from "../schemas/workspaceSchema.js";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listWorkspacesController));
router.post(
  "/",
  validateRequest({
    body: createWorkspaceBodySchema,
  }),
  asyncHandler(createWorkspaceController),
);
router.post(
  "/join",
  validateRequest({
    body: joinWorkspaceBodySchema,
  }),
  asyncHandler(joinWorkspaceController),
);
router.get(
  "/:workspaceId",
  validateRequest({
    params: workspaceIdParamsSchema,
  }),
  asyncHandler(getWorkspaceController),
);
router.get(
  "/:workspaceId/members",
  validateRequest({
    params: workspaceIdParamsSchema,
  }),
  asyncHandler(listWorkspaceMembersController),
);
router.get(
  "/:workspaceId/activity",
  validateRequest({
    params: workspaceIdParamsSchema,
  }),
  asyncHandler(listWorkspaceActivityController),
);

export default router;
