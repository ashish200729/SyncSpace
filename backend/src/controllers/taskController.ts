import type { RequestHandler } from "express";
import { getAuthSession } from "../middleware/authSession.js";
import type { ApiSuccessResponse } from "../types/api.js";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
  updateTaskStatus,
} from "../services/taskService.js";

export const listTasksController: RequestHandler = async (req, res) => {
  const session = getAuthSession(res);
  const tasks = await listTasks(req.params.workspaceId, session.user.id, req.query);
  const payload: ApiSuccessResponse<typeof tasks> = {
    data: tasks,
  };
  res.status(200).json(payload);
};

export const createTaskController: RequestHandler = async (req, res) => {
  const session = getAuthSession(res);
  const task = await createTask(req.params.workspaceId, session.user.id, req.body);
  const payload: ApiSuccessResponse<typeof task> = {
    data: task,
  };
  res.status(201).json(payload);
};

export const updateTaskController: RequestHandler = async (req, res) => {
  const session = getAuthSession(res);
  const task = await updateTask(req.params.taskId, session.user.id, req.body);
  const payload: ApiSuccessResponse<typeof task> = {
    data: task,
  };
  res.status(200).json(payload);
};

export const updateTaskStatusController: RequestHandler = async (req, res) => {
  const session = getAuthSession(res);
  const task = await updateTaskStatus(
    req.params.taskId,
    session.user.id,
    req.body.status,
  );
  const payload: ApiSuccessResponse<typeof task> = {
    data: task,
  };
  res.status(200).json(payload);
};

export const deleteTaskController: RequestHandler = async (req, res) => {
  const session = getAuthSession(res);
  await deleteTask(req.params.taskId, session.user.id);
  res.status(204).send();
};
