import type { RequestHandler } from "express";
import { getAuthSession } from "../middleware/authSession.js";
import type { ApiSuccessResponse } from "../types/api.js";
import {
  createWorkspace,
  getWorkspace,
  getWorkspaceActivity,
  getWorkspaceMembers,
  joinWorkspace,
  listUserWorkspaces,
} from "../services/workspaceService.js";

export const createWorkspaceController: RequestHandler = async (req, res) => {
  const session = getAuthSession(res);
  const workspace = await createWorkspace(session.user.id, req.body);
  const payload: ApiSuccessResponse<typeof workspace> = {
    data: workspace,
  };
  res.status(201).json(payload);
};

export const listWorkspacesController: RequestHandler = async (_req, res) => {
  const session = getAuthSession(res);
  const workspaces = await listUserWorkspaces(session.user.id);
  const payload: ApiSuccessResponse<typeof workspaces> = {
    data: workspaces,
  };
  res.status(200).json(payload);
};

export const getWorkspaceController: RequestHandler = async (req, res) => {
  const session = getAuthSession(res);
  const workspace = await getWorkspace(req.params.workspaceId, session.user.id);
  const payload: ApiSuccessResponse<typeof workspace> = {
    data: workspace,
  };
  res.status(200).json(payload);
};

export const joinWorkspaceController: RequestHandler = async (req, res) => {
  const session = getAuthSession(res);
  const result = await joinWorkspace(session.user.id, req.body);
  const payload: ApiSuccessResponse<typeof result> = {
    data: result,
  };
  res.status(200).json(payload);
};

export const listWorkspaceMembersController: RequestHandler = async (req, res) => {
  const session = getAuthSession(res);
  const members = await getWorkspaceMembers(req.params.workspaceId, session.user.id);
  const payload: ApiSuccessResponse<typeof members> = {
    data: members,
  };
  res.status(200).json(payload);
};

export const listWorkspaceActivityController: RequestHandler = async (
  req,
  res,
) => {
  const session = getAuthSession(res);
  const activity = await getWorkspaceActivity(req.params.workspaceId, session.user.id);
  const payload: ApiSuccessResponse<typeof activity> = {
    data: activity,
  };
  res.status(200).json(payload);
};
