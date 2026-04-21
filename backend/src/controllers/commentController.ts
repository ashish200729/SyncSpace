import type { RequestHandler } from "express";
import { getAuthSession } from "../middleware/authSession.js";
import type { ApiSuccessResponse } from "../types/api.js";
import { createComment, listComments } from "../services/commentService.js";

export const listCommentsController: RequestHandler = async (req, res) => {
  const session = getAuthSession(res);
  const comments = await listComments(req.params.taskId, session.user.id);
  const payload: ApiSuccessResponse<typeof comments> = {
    data: comments,
  };
  res.status(200).json(payload);
};

export const createCommentController: RequestHandler = async (req, res) => {
  const session = getAuthSession(res);
  const comment = await createComment(req.params.taskId, session.user.id, req.body.content);
  const payload: ApiSuccessResponse<typeof comment> = {
    data: comment,
  };
  res.status(201).json(payload);
};
