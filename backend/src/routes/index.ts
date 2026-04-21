import { Router } from "express";
import commentRoutes from "./commentRoutes.js";
import taskRoutes from "./taskRoutes.js";
import workspaceRoutes from "./workspaceRoutes.js";

const router = Router();

const healthPayload = {
  message: "Backend is running",
};

router.get("/", (_req, res) => {
  res.status(200).json(healthPayload);
});

router.get("/api/health", (_req, res) => {
  res.status(200).json(healthPayload);
});

router.use("/api/workspaces", workspaceRoutes);
router.use("/api", taskRoutes);
router.use("/api", commentRoutes);

export default router;
